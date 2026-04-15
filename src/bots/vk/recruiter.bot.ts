import { Injectable, OnModuleInit } from '@nestjs/common';
import { VK, Keyboard } from 'vk-io';
import { DialogService } from '@bots/service';
import { t } from '@i18n';

@Injectable()
export class VkRecruiterBot implements OnModuleInit {
    private vk: VK;
    private readonly waitingForName = new Set<number>();

    constructor(
        private readonly dialogService: DialogService,
    ) {
        this.vk = new VK({
            token: process.env.RECRUIT_BOT_TOKEN_VK as string,
            apiVersion: '5.199',
        });
    }

    private get mainKeyboard() {
        const vk = t('VK_RECRUIT');
        return Keyboard.builder()
            .textButton({ label: vk.BTN_ADD_CANDIDATE, color: Keyboard.POSITIVE_COLOR })
            .textButton({ label: vk.BTN_LIST, color: Keyboard.PRIMARY_COLOR })
            .row()
            .textButton({ label: vk.BTN_INFO, color: 'secondary' as any })
            .toString();
    }

    private confirmKeyboard(candidateId: string) {
        const vk = t('VK_RECRUIT');
        return Keyboard.builder()
            .textButton({ label: vk.BTN_CONFIRM_DELETE, color: Keyboard.POSITIVE_COLOR, payload: { cmd: 'del_yes', id: candidateId } })
            .textButton({ label: vk.BTN_CANCEL_DELETE, color: 'secondary' as any, payload: { cmd: 'del_no' } })
            .inline()
            .toString();
    }

    private async send(peerId: number, message: string, keyboard?: string, dontParseLinks = false): Promise<void> {
        await this.vk.api.messages.send({
            peer_id: peerId,
            message,
            keyboard,
            dont_parse_links: dontParseLinks ? 1 : 0,
            random_id: Math.floor(Math.random() * 1e9),
        } as any);
    }

    private async typing(peerId: number): Promise<void> {
        await (this.vk.api.messages as any)
            .setActivity({
                peer_id: peerId,
                type: 'typing',
                group_id: parseInt(process.env.RECRUIT_VK_GROUP_ID!),
            })
            .catch(() => {});
    }

    async sendMessageToRecruiter(peerId: number, text: string): Promise<void> {
        await this.sendLong(peerId, text);
    }

    private async sendLong(peerId: number, text: string, keyboard?: string): Promise<void> {
        const MAX = 4096;
        for (let i = 0; i < text.length; i += MAX) {
            const isLast = i + MAX >= text.length;
            await this.send(peerId, text.slice(i, i + MAX), isLast ? keyboard : undefined);
            if (!isLast) await new Promise((resolve) => setTimeout(resolve, 1500));
        }
    }

    private async sendList(peerId: number): Promise<void> {
        const vk = t('VK_RECRUIT');
        const interviews = await this.dialogService.getInterviewsByRecruiter(peerId);

        if (!interviews.length) {
            await this.send(peerId, vk.NO_CANDIDATES, this.mainKeyboard);
            return;
        }

        const statusLabel: Record<string, string> = {
            pending: vk.STATUS_PENDING,
            in_progress: vk.STATUS_IN_PROGRESS,
            completed: vk.STATUS_COMPLETED,
            cancelled: vk.STATUS_CANCELLED,
        };

        const CHUNK = 8;
        for (let i = 0; i < interviews.length; i += CHUNK) {
            const chunk = interviews.slice(i, i + CHUNK);
            const kb = Keyboard.builder();
            chunk.forEach((iv) => {
                const id = iv.candidateId.toString();
                const label = `${iv.candidate.name} — ${statusLabel[iv.status] ?? iv.status}`;
                kb.textButton({ label, color: 'secondary' as any, payload: { cmd: 'noop' } }).row();
                if (iv.status === 'completed') kb.textButton({ label: vk.BTN_REPORT, color: Keyboard.PRIMARY_COLOR, payload: { cmd: 'report', id } });
                kb.textButton({ label: vk.BTN_DELETE, color: Keyboard.NEGATIVE_COLOR, payload: { cmd: 'del_confirm', id } }).row();
            });
            await this.send(peerId, vk.LIST_HEADER, kb.inline().toString());
        }
    }

    onModuleInit() {
        this.vk.updates.on('message_new' as any, async (ctx: any) => {
            if (ctx.isOutbox) return;

            const peerId: number = ctx.peerId;
            const text: string = ctx.text?.trim() ?? '';
            const lower = text.toLowerCase();
            const payload = ctx.messagePayload as { cmd?: string; id?: string } | undefined;
            const vk = t('VK_RECRUIT');

            await this.typing(peerId);

            // Payload-based actions
            if (payload?.cmd === 'noop') return;

            if (payload?.cmd === 'report') {
                const interviews = await this.dialogService.getInterviewsByRecruiter(peerId);
                const found = interviews.find((i) => i.candidateId.toString() === payload.id);
                if (!found || found.status !== 'completed' || !found.report) {
                    await this.send(peerId, vk.REPORT_NOT_READY, this.mainKeyboard);
                    return;
                }
                await this.sendLong(peerId, vk.REPORT_PREFIX(found.candidate.name) + found.report, this.mainKeyboard);
                return;
            }

            if (payload?.cmd === 'del_confirm') {
                const interviews = await this.dialogService.getInterviewsByRecruiter(peerId);
                const found = interviews.find((i) => i.candidateId.toString() === payload.id);
                if (!found) {
                    await this.send(peerId, vk.CANDIDATE_NOT_FOUND, this.mainKeyboard);
                    return;
                }
                await this.send(peerId, vk.DELETE_CONFIRM(found.candidate.name), this.confirmKeyboard(payload.id!));
                return;
            }

            if (payload?.cmd === 'del_yes') {
                const interviews = await this.dialogService.getInterviewsByRecruiter(peerId);
                const found = interviews.find((i) => i.candidateId.toString() === payload.id);
                if (found) {
                    await this.dialogService.deleteCandidate(found.candidateId);
                    await this.send(peerId, vk.CANDIDATE_DELETED(found.candidate.name), this.mainKeyboard);
                }
                return;
            }

            if (payload?.cmd === 'del_no') {
                await this.send(peerId, vk.DELETE_CANCELLED, this.mainKeyboard);
                return;
            }

            // State: waiting for candidate name
            if (this.waitingForName.has(peerId)) {
                if (!text || payload?.cmd ||
                    lower === vk.BTN_ADD_CANDIDATE.toLowerCase() ||
                    lower === vk.BTN_LIST.toLowerCase() ||
                    lower === vk.BTN_INFO.toLowerCase() ||
                    lower === 'начать' || lower === 'старт'
                ) {
                    this.waitingForName.delete(peerId);
                } else {
                    this.waitingForName.delete(peerId);
                    const candidate = await this.dialogService.createCandidate(peerId, text);
                    const link = `https://vk.me/club${process.env.CANDIDATE_VK_GROUP_ID}?ref=${candidate.token}`;
                    await this.send(peerId, vk.CANDIDATE_ADDED(text, link), this.mainKeyboard, true);
                    return;
                }
            }

            if (lower === vk.BTN_INFO.toLowerCase() || lower === 'начать' || lower === 'старт') {
                await this.send(peerId, vk.WELCOME, this.mainKeyboard);
                return;
            }

            if (lower === vk.BTN_ADD_CANDIDATE.toLowerCase()) {
                this.waitingForName.add(peerId);
                await this.send(peerId, vk.ENTER_NAME_PROMPT, this.mainKeyboard);
                return;
            }

            if (lower === vk.BTN_LIST.toLowerCase()) {
                await this.sendList(peerId);
                return;
            }

            await this.send(peerId, vk.CHOOSE_ACTION, this.mainKeyboard);
        });

        this.vk.updates.start().catch(console.error);
    }
}
