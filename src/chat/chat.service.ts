import { Injectable, OnModuleInit } from '@nestjs/common';
import { Bot } from 'grammy';
import { LlmService } from '../llm/llm.service';
import { ERROR_MESSAGE } from '../constants';

@Injectable()
export class ChatService implements OnModuleInit {
  private bot: Bot;

  constructor(private readonly llmService: LlmService) {
    this.bot = new Bot(process.env.BOT_TOKEN as string);
  }

  onModuleInit() {
    this.bot.command('start', (ctx) => {
      ctx.reply('Привет подруга!');
      this.llmService.clearHistory();
    });

    this.bot.on('message', async (ctx) => {
      ctx.replyWithChatAction('typing');
      await new Promise((resolve) => setTimeout(resolve, 3000));
      // const chatId = ctx.chat.id;
      const messageText = ctx.message.text;
      
      if (!messageText) return;

      // history.push({ role: 'user', content: messageText });

      try {
        const answer = await this.llmService.getAnswer(messageText);
        ctx.reply(answer);
        // history.push({ role: 'assistant', content: answer });
      } catch (e) {
        console.error(e);
        ctx.reply(ERROR_MESSAGE);
      }
    });

    this.bot.start();
  }
}