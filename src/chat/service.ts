import { Injectable, OnModuleInit } from '@nestjs/common';
import { Bot } from 'grammy';
import { LlmService, type ChatMessage } from '../llm';
import { AssessmentService } from '../assessment';
import { t } from '../i18n';

@Injectable()
export class ChatService implements OnModuleInit {
    private bot: Bot;
    private history: Map<number, ChatMessage[]> = new Map();

    constructor(
        private readonly llmService: LlmService,
        private readonly assessmentService: AssessmentService,
    ) {
        this.bot = new Bot(process.env.BOT_TOKEN as string);
    }

    onModuleInit() {
        this.bot.command('start', (ctx) => {
            const c = t('CHAT');
            ctx.reply(c.START_MESSAGE);
            this.clearHistory(ctx.chat.id);
            this.assessmentService.cancelAssessment(ctx.chat.id);
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
                ctx.replyWithChatAction('typing');
                try {
                    const response = await this.assessmentService.handleAnswer(chatId, messageText);
                    if (response) {
                        ctx.reply(response);
                    }
                } catch (e) {
                    console.error(e);
                    ctx.reply(t('COMMON').ERROR_MESSAGE);
                }
                return;
            }

            ctx.replyWithChatAction('typing');
            await new Promise((resolve) => setTimeout(resolve, 3000));

            const userHistory = this.history.get(chatId) || [];

            userHistory.push({ role: 'user', content: messageText });

            try {
                const answer = await this.llmService.getAnswer(userHistory);

                userHistory.push({ role: 'assistant', content: answer });
                this.history.set(chatId, userHistory);

                ctx.reply(answer);
            } catch (e) {
                console.error(e);
                ctx.reply(t('COMMON').ERROR_MESSAGE);
            }
        });

        this.bot.start();
    }

    private clearHistory(chatId: number): void {
        this.history.delete(chatId);
    }
}
