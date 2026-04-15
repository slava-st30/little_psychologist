import { Injectable, OnModuleInit } from '@nestjs/common';
import { VK, Keyboard } from 'vk-io';
import { AssessmentService } from '@assessment';
import { DialogService } from '@bots/service';
import { t } from '@i18n';

@Injectable()
export class VkRecruiterBot implements OnModuleInit {
    private vk: VK;
    private readonly waitingForName = new Set<number>();

    constructor(
        private readonly assessmentService: AssessmentService,
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
            .textButton({ label: vk.BTN_LIST, color: Keyboard.PRIMARY_COLOR })
            .row()
            .textButton({ label: vk.BTN_ADD_CANDIDATE, color: Keyboard.POSITIVE_COLOR })
            .row()
            .textButton({ label: vk.BTN_INFO, color: 'secondary' as any })
            .toString();
    }

    private async send(peerId: number, message: string, keyboard?: string): Promise<void> {
        await this.vk.api.messages.send({
            peer_id: peerId,
            message,
            keyboard,
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

    onModuleInit() {
        this.vk.updates.on('message_new' as any, async (ctx: any) => {
            if (ctx.isOutbox) return;

            const peerId: number = ctx.peerId;
            const text: string = ctx.text?.trim() ?? '';
            const lower = text.toLowerCase();
            const payload = ctx.messagePayload as { cmd?: string; num?: number } | undefined;
            const vk = t('VK_RECRUIT');

            await this.typing(peerId);

            // Обработка нажатий кнопок с payload
            if (payload?.cmd === 'report') {
                const interviews = await this.dialogService.getInterviewsByRecruiter(peerId);
                const found = interviews[(payload.num ?? 0) - 1];
                if (!found || found.status !== 'completed' || !found.report) {
                    await this.send(peerId, vk.REPORT_NOT_READY, this.mainKeyboard);
                    return;
                }
                await this.sendLong(peerId, vk.REPORT_PREFIX(found.candidate.name) + found.report, this.mainKeyboard);
                return;
            }

            if (payload?.cmd === 'remove') {
                const interviews = await this.dialogService.getInterviewsByRecruiter(peerId);
                const found = interviews[(payload.num ?? 0) - 1];
                if (!found) {
                    await this.send(peerId, vk.CANDIDATE_NOT_FOUND, this.mainKeyboard);
                    return;
                }
                await this.dialogService.deleteCandidate(found.candidateId);
                await this.send(peerId, vk.CANDIDATE_DELETED(found.candidate.name), this.mainKeyboard);
                return;
            }

            // Ждём имя кандидата
            if (this.waitingForName.has(peerId)) {
                const isCommand = [
                    vk.BTN_LIST.toLowerCase(), 'список',
                    vk.BTN_ADD_CANDIDATE.toLowerCase(), 'добавить кандидата',
                    'начать', 'старт', 'помощь',
                    vk.BTN_INFO.toLowerCase(), 'инфо',
                ].includes(lower) || payload?.cmd;
                if (!text || isCommand) {
                    this.waitingForName.delete(peerId);
                } else {
                    this.waitingForName.delete(peerId);
                    const candidate = await this.dialogService.createCandidate(peerId, text);
                    const link = `https://vk.me/club${process.env.CANDIDATE_VK_GROUP_ID}?ref=${candidate.token}`;
                    await this.send(peerId, vk.CANDIDATE_ADDED(text, link), this.mainKeyboard);
                    return;
                }
            }

            if (lower === 'начать' || lower === 'старт' || lower === 'помощь' || lower === vk.BTN_INFO.toLowerCase() || lower === 'инфо') {
                await this.send(peerId, vk.WELCOME, this.mainKeyboard);
                return;
            }

            if (lower === vk.BTN_ADD_CANDIDATE.toLowerCase() || lower === 'добавить кандидата') {
                this.waitingForName.add(peerId);
                await this.send(peerId, vk.ENTER_NAME_PROMPT);
                return;
            }

            if (lower.startsWith('создать ')) {
                const name = text.slice(8).trim();
                if (!name) {
                    await this.send(peerId, vk.SPECIFY_NAME_HINT, this.mainKeyboard);
                    return;
                }
                const candidate = await this.dialogService.createCandidate(peerId, name);
                const link = `https://vk.me/club${process.env.CANDIDATE_VK_GROUP_ID}?ref=${candidate.token}`;
                await this.send(peerId, vk.CANDIDATE_ADDED(name, link), this.mainKeyboard);
                return;
            }

            if (lower === vk.BTN_LIST.toLowerCase() || lower === 'список') {
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

                for (let i = 0; i < interviews.length; i++) {
                    const interview = interviews[i];
                    const num = i + 1;
                    const status = statusLabel[interview.status] ?? interview.status;
                    const keyboard = Keyboard.builder()
                        .textButton({ label: vk.BTN_REPORT, color: Keyboard.PRIMARY_COLOR, payload: { cmd: 'report', num } })
                        .textButton({ label: vk.BTN_DELETE, color: Keyboard.NEGATIVE_COLOR, payload: { cmd: 'remove', num } })
                        .inline()
                        .toString();
                    await this.send(peerId, `${num}. ${interview.candidate.name} — ${status}`, keyboard);
                }
                return;
            }

            if (lower.startsWith('кандидат ')) {
                const num = parseInt(text.slice(9).trim());
                if (isNaN(num)) {
                    await this.send(peerId, vk.SPECIFY_NUM_CANDIDATE, this.mainKeyboard);
                    return;
                }
                const interviews = await this.dialogService.getInterviewsByRecruiter(peerId);
                const found = interviews[num - 1];
                if (!found) {
                    await this.send(peerId, vk.CANDIDATE_NOT_FOUND_NUM(num), this.mainKeyboard);
                    return;
                }
                if (found.status !== 'completed' || !found.report) {
                    await this.send(peerId, vk.CANDIDATE_NOT_COMPLETED(found.candidate.name), this.mainKeyboard);
                    return;
                }
                await this.sendLong(peerId, vk.REPORT_PREFIX(found.candidate.name) + found.report, this.mainKeyboard);
                return;
            }

            if (lower.startsWith('удалить ')) {
                const num = parseInt(text.slice(8).trim());
                if (isNaN(num)) {
                    await this.send(peerId, vk.SPECIFY_NUM_DELETE, this.mainKeyboard);
                    return;
                }
                const interviews = await this.dialogService.getInterviewsByRecruiter(peerId);
                const found = interviews[num - 1];
                if (!found) {
                    await this.send(peerId, vk.CANDIDATE_NOT_FOUND_NUM(num), this.mainKeyboard);
                    return;
                }
                await this.dialogService.deleteCandidate(found.candidateId);
                await this.send(peerId, vk.CANDIDATE_DELETED(found.candidate.name), this.mainKeyboard);
                return;
            }

            await this.send(peerId, vk.CHOOSE_ACTION, this.mainKeyboard);
        });

        this.vk.updates.start().catch(console.error);
    }
}
