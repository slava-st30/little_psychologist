import { Injectable, OnModuleInit } from '@nestjs/common';
import { Bot } from 'grammy';
import { AssessmentService } from '../assessment';
import { DialogService } from './service';
import { t } from '../i18n';

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
            if (!name) {
                await ctx.reply('Укажите имя кандидата: `/create Иван Иванов`', { parse_mode: 'Markdown' });
                return;
            }

            const candidate = await this.recrutingService.createCandidate(ctx.chat.id, name);
            const candidateBotUsername = process.env.CANDIDATE_BOT_USERNAME;
            const link = `https://t.me/${candidateBotUsername}?start=${candidate.token}`;

            await ctx.reply(`✅ Кандидат ${name} добавлен.\n\nСсылка для интервью:\n${link}`);
        });

        this.bot.command('list', async (ctx) => {
            if (this.assessmentService.isAssessmentActive(ctx.chat.id)) return;
            const interviews = await this.recrutingService.getInterviewsByRecruiter(ctx.chat.id);

            if (!interviews.length) {
                await ctx.reply('Кандидатов пока нет. Добавьте первого: `/create Имя Фамилия`', { parse_mode: 'Markdown' });
                return;
            }

            const statusLabel: Record<string, string> = {
                pending: '⏳ Не начал',
                in_progress: '🔄 В процессе',
                completed: '✅ Завершил',
                cancelled: '❌ Отменил',
            };

            const lines = interviews.map((i, idx) =>
                `${idx + 1}. *${i.candidate.name}* — ${statusLabel[i.status] ?? i.status}`,
            );

            await ctx.reply(lines.join('\n') + '\n\nДля просмотра отчёта: `/candidate <номер>`', { parse_mode: 'Markdown' });
        });

        this.bot.command('candidate', async (ctx) => {
            if (this.assessmentService.isAssessmentActive(ctx.chat.id)) return;
            const input = ctx.match?.trim();
            const num = parseInt(input ?? '');
            if (!input || isNaN(num)) {
                await ctx.reply('Укажите номер из списка: `/candidate 1`', { parse_mode: 'Markdown' });
                return;
            }

            const interviews = await this.recrutingService.getInterviewsByRecruiter(ctx.chat.id);
            const found = interviews[num - 1];

            if (!found) {
                await ctx.reply(`Кандидат с номером ${num} не найден.`);
                return;
            }

            if (found.status !== 'completed' || !found.report) {
                await ctx.reply(`*${found.candidate.name}* ещё не завершил интервью.`, { parse_mode: 'Markdown' });
                return;
            }

            await this.sendLong(ctx.chat.id, ctx, `*Отчёт: ${found.candidate.name}*\n\n` + found.report);
        });

        this.bot.command('remove', async (ctx) => {
            if (this.assessmentService.isAssessmentActive(ctx.chat.id)) return;
            const num = parseInt(ctx.match?.trim() ?? '');
            if (isNaN(num)) {
                await ctx.reply('Укажите номер из списка: `/remove 1`', { parse_mode: 'Markdown' });
                return;
            }

            const interviews = await this.recrutingService.getInterviewsByRecruiter(ctx.chat.id);
            const found = interviews[num - 1];

            if (!found) {
                await ctx.reply(`Кандидат с номером ${num} не найден.`);
                return;
            }

            await this.recrutingService.deleteCandidate(found.candidateId);
            await ctx.reply(`Кандидат *${found.candidate.name}* удалён.`, { parse_mode: 'Markdown' });
        });

        this.bot.api.setMyCommands([
            { command: 'info', description: 'Возможности сервиса' },
            { command: 'create', description: 'Добавить кандидата — /create Имя Фамилия' },
            { command: 'list', description: 'Список кандидатов со статусами' },
            { command: 'candidate', description: 'Отчёт по кандидату — /candidate Номер' },
            { command: 'remove', description: 'Удалить кандидата — /remove Номер' },
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
