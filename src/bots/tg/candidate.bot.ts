import { Injectable, OnModuleInit } from '@nestjs/common';
import { Bot } from 'grammy';
import { AssessmentService } from '@assessment';
import { DialogService } from '@bots/service';
import { RecruiterBot } from './recruiter.bot';
import { t } from '@i18n';

@Injectable()
export class CandidateBot implements OnModuleInit {
    private bot: Bot;

    constructor(
        private readonly assessmentService: AssessmentService,
        private readonly recrutingService: DialogService,
        private readonly recruiterBot: RecruiterBot,
    ) {
        this.bot = new Bot(process.env.CANDIDATE_BOT_TOKEN as string);
    }

    private startTyping(ctx: { replyWithChatAction(action: 'typing'): Promise<unknown> }): () => void {
        ctx.replyWithChatAction('typing').catch(() => {});
        const interval = setInterval(() => {
            ctx.replyWithChatAction('typing').catch(() => {});
        }, 4000);
        return () => clearInterval(interval);
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

    onModuleInit() {
        this.bot.command('start', async (ctx) => {
            const token = ctx.match?.trim();
            const tc = t('TG_CANDIDATE');

            if (!token) {
                await ctx.reply(tc.INVALID_LINK, { parse_mode: 'Markdown' });
                return;
            }

            const candidate = await this.recrutingService.findByToken(token);
            if (!candidate) {
                await ctx.reply(tc.INVALID_LINK, { parse_mode: 'Markdown' });
                return;
            }

            const started = await this.recrutingService.hasStartedInterview(candidate._id as any);
            if (started) {
                await ctx.reply(tc.LINK_ALREADY_USED);
                return;
            }

            await this.recrutingService.createInterview(candidate._id as any, ctx.chat.id);
            this.assessmentService.startAssessmentForCandidate(ctx.chat.id, candidate._id as any, candidate.name, candidate.recruiterChatId);

            const [instruction, question] = this.assessmentService.getStartMessages();
            await ctx.reply(tc.GREETING(candidate.name) + instruction, { parse_mode: 'Markdown' });
            await new Promise((resolve) => setTimeout(resolve, 1500));
            await ctx.reply(question, { parse_mode: 'Markdown' });
        });

        this.bot.command('cancel', async (ctx) => {
            if (!this.assessmentService.isAssessmentActive(ctx.chat.id)) return;
            const c = t('CHAT');
            this.assessmentService.cancelAssessment(ctx.chat.id);
            await this.recrutingService.cancelInterviewByChatId(ctx.chat.id);
            ctx.reply(c.CANCEL_MESSAGE, { parse_mode: 'Markdown' });
        });

        this.bot.on('message', async (ctx) => {
            const chatId = ctx.chat.id;
            const messageText = ctx.message.text;

            if (!messageText) return;

            if (this.assessmentService.isAssessmentActive(chatId)) {
                const stopTyping = this.startTyping(ctx);
                try {
                    const [[response, meta]] = await Promise.all([
                        this.assessmentService.handleAnswer(chatId, messageText),
                        new Promise<void>((resolve) => setTimeout(resolve, 800)),
                    ]);
                    stopTyping();
                    if (response) {
                        if (meta?.completed && meta.report && meta.recruiterChatId) {
                            const recruiterChatId = meta.recruiterChatId;
                            const tc = t('TG_CANDIDATE');
                            // Thank candidate
                            await ctx.reply(t('CHAT').CANDIDATE_THANK_YOU, { parse_mode: 'Markdown' });
                            // Send answers + report to recruiter via recruiter bot
                            const send = (text: string, other?: object) =>
                                this.recruiterBot.bot.api.sendMessage(recruiterChatId, text, other as any);

                            const answersText = meta.answers
                                ?.map((a, i) => tc.QUESTION_PREFIX(i + 1) + a)
                                .join('\n\n') ?? '';

                            await this.sendLong(recruiterChatId, { reply: send },
                                tc.ANSWERS_PREFIX(meta.candidateName ?? '') + answersText,
                            );
                            await this.sendLong(recruiterChatId, { reply: send },
                                tc.ANALYSIS_PREFIX + meta.report,
                            );
                        } else {
                            await this.sendLong(chatId, ctx, response);
                        }
                    }
                } catch (e) {
                    console.error(e);
                    stopTyping();
                    ctx.reply(t('COMMON').ERROR_MESSAGE, { parse_mode: 'Markdown' });
                }
                return;
            }

            const c = t('CHAT');
            if (this.assessmentService.isAssessmentCompleted(chatId)) {
                ctx.reply(c.ALREADY_COMPLETED, { parse_mode: 'Markdown' });
            } else {
                ctx.reply(c.USE_RECRUITER_LINK, { parse_mode: 'Markdown' });
            }
        });

        const tc = t('TG_CANDIDATE');
        this.bot.api.setMyCommands([
            { command: 'cancel', description: tc.CMD_CANCEL_DESC },
        ]);

        this.bot.catch((err) => {
            console.error('CandidateBot error:', err.message);
        });

        this.bot.start();
    }
}
