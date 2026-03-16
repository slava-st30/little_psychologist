import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import role_prompt from './role_prompt';
import { t } from '../i18n';
import { LLM_BASE_URL, LLM_MODEL } from './config';

export type ChatMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;

@Injectable()
export class LlmService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      baseURL: LLM_BASE_URL,
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  public async getAnswer(
    history: ChatMessage[],
    systemPrompt: string = role_prompt,
  ): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: LLM_MODEL,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          ...history,
        ],
      });

      return response.choices[0].message.content ?? t('COMMON').ERROR_MESSAGE;
    } catch (error) {
      console.error('LlmService getAnswer error:', error);
      return t('COMMON').ERROR_MESSAGE;
    }
  }
}