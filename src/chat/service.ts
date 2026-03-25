import { Injectable, OnModuleInit } from '@nestjs/common';
import { Bot } from 'grammy';
import { AssessmentService } from '../assessment';
import { t } from '../i18n';

@Injectable()
export class ChatService implements OnModuleInit {
    private bot: Bot;

    constructor(private readonly assessmentService: AssessmentService) {
        this.bot = new Bot(process.env.BOT_TOKEN as string);
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
        ctx: { reply: (text: string) => Promise<unknown> },
        text: string,
    ) {
        const MAX = 4096;
        const chunks: string[] = [];
        for (let i = 0; i < text.length; i += MAX) {
            chunks.push(text.slice(i, i + MAX));
        }
        for (let i = 0; i < chunks.length; i++) {
            await ctx.reply(chunks[i]);
            if (i < chunks.length - 1) {
                await this.bot.api.sendChatAction(chatId, 'typing').catch(() => {});
                await new Promise((resolve) => setTimeout(resolve, 1500));
            }
        }
    }

    onModuleInit() {
        this.bot.command('start', (ctx) => {
            const c = t('CHAT');
            this.assessmentService.cancelAssessment(ctx.chat.id);
            ctx.reply(c.START_MESSAGE);
        });

        this.bot.command('assess', (ctx) => {
            const message = this.assessmentService.startAssessment(ctx.chat.id);
            ctx.reply(message);
        });

        this.bot.command('cancel', (ctx) => {
            const c = t('CHAT');
            this.assessmentService.cancelAssessment(ctx.chat.id);
            ctx.reply(c.CANCEL_MESSAGE);
        });

        this.bot.on('message', async (ctx) => {
            const chatId = ctx.chat.id;
            const messageText = ctx.message.text;

            if (!messageText) return;

            if (this.assessmentService.isAssessmentActive(chatId)) {
                const stopTyping = this.startTyping(ctx);
                try {
                    const [response] = await Promise.all([
                        this.assessmentService.handleAnswer(chatId, messageText),
                        new Promise<void>((resolve) => setTimeout(resolve, 800)),
                    ]);
                    stopTyping();
                    if (response) {
                        await this.sendLong(chatId, ctx, response);
                    }
                } catch (e) {
                    console.error(e);
                    stopTyping();
                    ctx.reply(t('COMMON').ERROR_MESSAGE);
                }
                return;
            }

            const c = t('CHAT');
            if (this.assessmentService.isAssessmentCompleted(chatId)) {
                ctx.reply(c.ALREADY_COMPLETED);
            } else {
                ctx.reply(c.NOT_STARTED);
            }
        });

        this.bot.start();
    }
}
