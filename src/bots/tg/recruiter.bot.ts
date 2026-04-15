import { Injectable, OnModuleInit } from '@nestjs/common';
import { Bot } from 'grammy';
import { AssessmentService } from '@assessment';
import { DialogService } from '@bots/service';
import { t } from '@i18n';

@Injectable()
export class RecruiterBot implements OnModuleInit {
    readonly bot: Bot;

    constructor(
        private readonly assessmentService: AssessmentService,
        private readonly recrutingService: DialogService,
    ) {
        this.bot = new Bot(process.env.RECRUIT_BOT_TOKEN as string);
    }

    onModuleInit() {
        this.bot.command('start', async (ctx) => {
            await ctx.reply(t('CHAT').RECRUITER_START, { parse_mode: 'Markdown' });
        });

        this.bot.command('info', async (ctx) => {
            await ctx.reply(t('CHAT').RECRUITER_START, { parse_mode: 'Markdown' });
        });

        this.bot.command('create', async (ctx) => {
            if (this.assessmentService.isAssessmentActive(ctx.chat.id)) return;
            const name = ctx.match?.trim();
            const tr = t('TG_RECRUIT');
            if (!name) {
                await ctx.reply(tr.SPECIFY_NAME_HINT, { parse_mode: 'Markdown' });
                return;
            }

            const candidate = await this.recrutingService.createCandidate(ctx.chat.id, name);
            const candidateBotUsername = process.env.CANDIDATE_BOT_USERNAME;
            const link = `https://t.me/${candidateBotUsername}?start=${candidate.token}`;

            await ctx.reply(tr.CANDIDATE_ADDED(name, link));
        });

        this.bot.command('list', async (ctx) => {
            if (this.assessmentService.isAssessmentActive(ctx.chat.id)) return;
            const interviews = await this.recrutingService.getInterviewsByRecruiter(ctx.chat.id);
            const tr = t('TG_RECRUIT');

            if (!interviews.length) {
                await ctx.reply(tr.NO_CANDIDATES, { parse_mode: 'Markdown' });
                return;
            }

            const statusLabel: Record<string, string> = {
                pending: tr.STATUS_PENDING,
                in_progress: tr.STATUS_IN_PROGRESS,
                completed: tr.STATUS_COMPLETED,
                cancelled: tr.STATUS_CANCELLED,
            };

            const lines = interviews.map((i, idx) =>
                `${idx + 1}. *${i.candidate.name}* — ${statusLabel[i.status] ?? i.status}`,
            );

            await ctx.reply(lines.join('\n') + tr.LIST_FOOTER, { parse_mode: 'Markdown' });
        });

        this.bot.command('candidate', async (ctx) => {
            if (this.assessmentService.isAssessmentActive(ctx.chat.id)) return;
            const input = ctx.match?.trim();
            const num = parseInt(input ?? '');
            const tr = t('TG_RECRUIT');
            if (!input || isNaN(num)) {
                await ctx.reply(tr.SPECIFY_NUM_CANDIDATE, { parse_mode: 'Markdown' });
                return;
            }

            const interviews = await this.recrutingService.getInterviewsByRecruiter(ctx.chat.id);
            const found = interviews[num - 1];

            if (!found) {
                await ctx.reply(tr.CANDIDATE_NOT_FOUND(num));
                return;
            }

            if (found.status !== 'completed' || !found.report) {
                await ctx.reply(tr.CANDIDATE_NOT_COMPLETED(found.candidate.name), { parse_mode: 'Markdown' });
                return;
            }

            await this.sendLong(ctx.chat.id, ctx, tr.REPORT_PREFIX(found.candidate.name) + found.report);
        });

        this.bot.command('remove', async (ctx) => {
            if (this.assessmentService.isAssessmentActive(ctx.chat.id)) return;
            const num = parseInt(ctx.match?.trim() ?? '');
            const tr = t('TG_RECRUIT');
            if (isNaN(num)) {
                await ctx.reply(tr.SPECIFY_NUM_REMOVE, { parse_mode: 'Markdown' });
                return;
            }

            const interviews = await this.recrutingService.getInterviewsByRecruiter(ctx.chat.id);
            const found = interviews[num - 1];

            if (!found) {
                await ctx.reply(tr.CANDIDATE_NOT_FOUND(num));
                return;
            }

            await this.recrutingService.deleteCandidate(found.candidateId);
            await ctx.reply(tr.CANDIDATE_REMOVED(found.candidate.name), { parse_mode: 'Markdown' });
        });

        const tr = t('TG_RECRUIT');
        this.bot.api.setMyCommands([
            { command: 'info', description: tr.CMD_INFO_DESC },
            { command: 'create', description: tr.CMD_CREATE_DESC },
            { command: 'list', description: tr.CMD_LIST_DESC },
            { command: 'candidate', description: tr.CMD_CANDIDATE_DESC },
            { command: 'remove', description: tr.CMD_REMOVE_DESC },
        ]);

        this.bot.catch((err) => {
            console.error('RecruiterBot error:', err.message);
        });

        this.bot.start();
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
