import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import role_prompt from './role_prompt';
import { t } from '@i18n';
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
        model: string = LLM_MODEL,
        attempt = 1,
    ): Promise<string> {
        try {
            const response = await this.client.chat.completions.create({
                model,
                max_tokens: 4096,
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
            const isNetworkError =
                error instanceof Error &&
                ('code' in error
                    ? ['ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND'].includes(
                          (error as NodeJS.ErrnoException).code ?? '',
                      )
                    : error.message === 'terminated' || error.message === 'fetch failed');

            const delays = [5000, 10000, 30000];
            if (isNetworkError && attempt <= delays.length) {
                await new Promise((resolve) => setTimeout(resolve, delays[attempt - 1]));
                return this.getAnswer(history, systemPrompt, model, attempt + 1);
            }
            console.error('LlmService getAnswer error:', error);
            return t('COMMON').ERROR_MESSAGE;
        }
    }
}
