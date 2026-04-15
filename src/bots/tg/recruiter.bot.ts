import { Injectable, OnModuleInit } from '@nestjs/common';
import { Bot, Keyboard, InlineKeyboard } from 'grammy';
import { DialogService, type InterviewWithCandidate } from '@bots/service';
import { t } from '@i18n';

@Injectable()
export class RecruiterBot implements OnModuleInit {
    readonly bot: Bot;
    private readonly waitingForName = new Set<number>();

    constructor(
        private readonly recrutingService: DialogService,
    ) {
        this.bot = new Bot(process.env.RECRUIT_BOT_TOKEN as string);
    }

    private mainKeyboard() {
        const tr = t('TG_RECRUIT');
        return new Keyboard()
            .text(tr.BTN_ADD).text(tr.BTN_LIST).row()
            .text(tr.BTN_INFO)
            .resized()
            .persistent();
    }

    private buildListKeyboard(interviews: InterviewWithCandidate[]) {
        const tr = t('TG_RECRUIT');
        const statusLabel: Record<string, string> = {
            pending: tr.STATUS_PENDING,
            in_progress: tr.STATUS_IN_PROGRESS,
            completed: tr.STATUS_COMPLETED,
            cancelled: tr.STATUS_CANCELLED,
        };
        const kb = new InlineKeyboard();
        interviews.forEach((iv) => {
            const id = iv.candidateId.toString();
            const label = `${iv.candidate.name} — ${statusLabel[iv.status] ?? iv.status}`;
            kb.text(label, 'noop').row();
            if (iv.status === 'completed') kb.text(tr.BTN_REPORT, `report:${id}`);
            kb.text(tr.BTN_DELETE, `del_confirm:${id}`).row();
        });
        return kb;
    }

    onModuleInit() {
        this.bot.command('start', async (ctx) => {
            this.waitingForName.delete(ctx.chat.id);
            await ctx.reply(t('TG_RECRUIT').WELCOME, {
                parse_mode: 'Markdown',
                reply_markup: this.mainKeyboard(),
            });
        });

        this.bot.command('info', async (ctx) => {
            await ctx.reply(t('TG_RECRUIT').WELCOME, {
                parse_mode: 'Markdown',
                reply_markup: this.mainKeyboard(),
            });
        });

        this.bot.command('create', async (ctx) => {
            const name = ctx.match?.trim();
            const tr = t('TG_RECRUIT');
            if (!name) {
                this.waitingForName.add(ctx.chat.id);
                await ctx.reply(tr.ENTER_NAME_PROMPT, { reply_markup: this.mainKeyboard() });
                return;
            }
            const candidate = await this.recrutingService.createCandidate(ctx.chat.id, name);
            const link = `https://t.me/${process.env.CANDIDATE_BOT_USERNAME}?start=${candidate.token}`;
            await ctx.reply(tr.CANDIDATE_ADDED(name, link), {
                reply_markup: new InlineKeyboard().copyText(tr.BTN_COPY_LINK, link),
            });
        });

        this.bot.command('list', async (ctx) => {
            await this.sendList(ctx, ctx.chat.id);
        });

        // Handle persistent keyboard buttons and name input
        this.bot.on('message:text', async (ctx) => {
            const chatId = ctx.chat.id;
            const text = ctx.message.text.trim();
            const tr = t('TG_RECRUIT');

            // State: waiting for candidate name — but cancel if menu button pressed
            if (this.waitingForName.has(chatId)) {
                if (text !== tr.BTN_ADD && text !== tr.BTN_LIST && text !== tr.BTN_INFO) {
                    this.waitingForName.delete(chatId);
                    const candidate = await this.recrutingService.createCandidate(chatId, text);
                    const link = `https://t.me/${process.env.CANDIDATE_BOT_USERNAME}?start=${candidate.token}`;
                    await ctx.reply(tr.CANDIDATE_ADDED(text, link), {
                        reply_markup: new InlineKeyboard().copyText(tr.BTN_COPY_LINK, link),
                    });
                    return;
                }
                this.waitingForName.delete(chatId);
            }

            if (text === tr.BTN_ADD) {
                this.waitingForName.add(chatId);
                await ctx.reply(tr.ENTER_NAME_PROMPT, { reply_markup: this.mainKeyboard() });
                return;
            }

            if (text === tr.BTN_LIST) {
                await this.sendList(ctx, chatId);
                return;
            }

            if (text === tr.BTN_INFO) {
                await ctx.reply(tr.WELCOME, {
                    parse_mode: 'Markdown',
                    reply_markup: this.mainKeyboard(),
                });
                return;
            }
        });

        // Handle inline button callbacks
        this.bot.on('callback_query:data', async (ctx) => {
            const data = ctx.callbackQuery.data;
            const chatId = ctx.callbackQuery.from.id;
            const tr = t('TG_RECRUIT');

            if (data.startsWith('report:')) {
                const candidateId = data.slice(7);
                const interviews = await this.recrutingService.getInterviewsByRecruiter(chatId);
                const found = interviews.find((i) => i.candidateId.toString() === candidateId);

                if (!found) {
                    await ctx.answerCallbackQuery({ text: tr.CANDIDATE_NOT_FOUND_TEXT });
                    return;
                }
                if (found.status !== 'completed' || !found.report) {
                    await ctx.answerCallbackQuery({ text: tr.CANDIDATE_NOT_COMPLETED_TEXT(found.candidate.name) });
                    return;
                }

                await ctx.answerCallbackQuery();
                const send = (text: string, other?: object) =>
                    this.bot.api.sendMessage(chatId, text, other as any);
                await this.sendLong(chatId, { reply: send }, tr.REPORT_PREFIX(found.candidate.name) + found.report);
                return;
            }

            if (data.startsWith('del_confirm:')) {
                const candidateId = data.slice(12);
                const interviews = await this.recrutingService.getInterviewsByRecruiter(chatId);
                const found = interviews.find((i) => i.candidateId.toString() === candidateId);

                if (!found) {
                    await ctx.answerCallbackQuery({ text: tr.CANDIDATE_NOT_FOUND_TEXT });
                    return;
                }

                const confirmKb = new InlineKeyboard()
                    .text(tr.BTN_CONFIRM_DELETE, `del_yes:${candidateId}`)
                    .text(tr.BTN_CANCEL_DELETE, 'del_no');

                await ctx.answerCallbackQuery();
                await ctx.reply(tr.DELETE_CONFIRM(found.candidate.name), {
                    parse_mode: 'Markdown',
                    reply_markup: confirmKb,
                });
                return;
            }

            if (data.startsWith('del_yes:')) {
                const candidateId = data.slice(8);
                const interviews = await this.recrutingService.getInterviewsByRecruiter(chatId);
                const found = interviews.find((i) => i.candidateId.toString() === candidateId);

                if (found) {
                    await this.recrutingService.deleteCandidate(found.candidateId);
                    await ctx.editMessageText(tr.CANDIDATE_REMOVED(found.candidate.name), {
                        parse_mode: 'Markdown',
                    });
                }
                await ctx.answerCallbackQuery();
                return;
            }

            if (data === 'del_no') {
                await ctx.deleteMessage().catch(() => {});
                await ctx.answerCallbackQuery();
                return;
            }

            if (data === 'noop') {
                await ctx.answerCallbackQuery();
                return;
            }
        });

        const tr = t('TG_RECRUIT');
        this.bot.api.setMyCommands([
            { command: 'info', description: tr.CMD_INFO_DESC },
            { command: 'create', description: tr.CMD_CREATE_DESC },
            { command: 'list', description: tr.CMD_LIST_DESC },
        ]);

        this.bot.catch((err) => {
            console.error('RecruiterBot error:', err.message);
        });

        this.bot.start();
    }

    private async sendList(
        ctx: { reply: (text: string, other?: object) => Promise<unknown> },
        chatId: number,
    ) {
        const tr = t('TG_RECRUIT');
        const interviews = await this.recrutingService.getInterviewsByRecruiter(chatId);

        if (!interviews.length) {
            await ctx.reply(tr.NO_CANDIDATES, { reply_markup: this.mainKeyboard() });
            return;
        }

        const CHUNK = 8;
        for (let i = 0; i < interviews.length; i += CHUNK) {
            const chunk = interviews.slice(i, i + CHUNK);
            await ctx.reply(tr.LIST_HEADER, { reply_markup: this.buildListKeyboard(chunk) });
        }
    }

    private async sendLong(
        chatId: number,
        ctx: { reply: (text: string, other?: object) => Promise<unknown> },
        text: string,
    ) {
        const MAX = 4096;
        const chunks: string[] = [];
        for (let i = 0; i < text.length; i += MAX) {
            chunks.push(text.slice(i, i + MAX));
        }
        for (let i = 0; i < chunks.length; i++) {
            await ctx.reply(chunks[i], { parse_mode: 'Markdown' });
            if (i < chunks.length - 1) {
                await this.bot.api.sendChatAction(chatId, 'typing').catch(() => {});
                await new Promise((resolve) => setTimeout(resolve, 1500));
            }
        }
    }
}
