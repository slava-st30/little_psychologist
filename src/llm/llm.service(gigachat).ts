import { Injectable } from '@nestjs/common';
import { type Message } from 'gigachat/interfaces';
import GigaChat from 'gigachat';
import { Agent } from 'node:https';
import role_prompt from './role_prompt';
import { t } from '../i18n';

@Injectable()
export class LlmService {
  private giga: GigaChat;
  private history: Message[] = [];

  constructor() {
    const httpsAgent = new Agent({ rejectUnauthorized: false });
    this.giga = new GigaChat({
      credentials: process.env.GIGACHAT_API_KEY,
      scope: 'GIGACHAT_API_PERS',
      httpsAgent,
    });
  }
  
  public async getAnswer(content: string): Promise<string> {
    try {
      const resp = await this.giga.chat({
        messages: [
          {
            role: 'system',
            content: role_prompt,
          },
          ...this.history,
          {
            role: 'user',
            content,
          },
        ],
        function_call: 'auto',
      });

      const answer = resp.choices[0]?.message.content;

      this.history.push(
        { role: 'user', content },
        { role: 'assistant', content: answer }
      );

      return answer ?? t('COMMON').ERROR_MESSAGE;
    } catch (error) {
      console.error('LlmService getAnswer error:', error);
      return t('COMMON').ERROR_MESSAGE;
    }
  }

  /**
   * Очистить историю диалогов
   */
  public clearHistory(): void {
    this.history.length = 0;
  }
}