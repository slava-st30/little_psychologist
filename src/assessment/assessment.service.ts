import { Injectable } from '@nestjs/common';
import { LlmService, type ChatMessage } from '../llm';
import { ASSESSMENT_QUESTIONS } from './config';
import { type AssessmentState } from './types';
import { t } from '../i18n';

@Injectable()
export class AssessmentService {
  private states: Map<number, AssessmentState> = new Map();

  constructor(private readonly llmService: LlmService) {}

  startAssessment(chatId: number): string {
    this.states.set(chatId, {
      isActive: true,
      currentQuestionIndex: 0,
      answers: [],
    });

    const question = ASSESSMENT_QUESTIONS[0];
    const a = t('ASSESSMENT');
    return a.START_TITLE + a.START_INSTRUCTION + question.text;
  }

  async handleAnswer(chatId: number, answer: string): Promise<string | null> {
    const state = this.states.get(chatId);
    if (!state || !state.isActive) {
      return null;
    }

    state.answers.push(answer);
    state.currentQuestionIndex++;

    if (state.currentQuestionIndex < ASSESSMENT_QUESTIONS.length) {
      const nextQuestion = ASSESSMENT_QUESTIONS[state.currentQuestionIndex];
      this.states.set(chatId, state);
      const a = t('ASSESSMENT');
      return a.ANSWER_ACCEPTED + nextQuestion.text;
    }

    this.states.delete(chatId);
    return this.getAssessmentResult(state.answers);
  }

  private async getAssessmentResult(answers: string[]): Promise<string> {
    const a = t('ASSESSMENT');
    const history: ChatMessage[] = [
      {
        role: 'user',
        content: a.RESULT_TEMPLATE(answers),
      },
    ];

    const result = await this.llmService.getAnswer(history);
    return a.COMPLETED_TITLE + result;
  }

  isAssessmentActive(chatId: number): boolean {
    const state = this.states.get(chatId);
    return state?.isActive ?? false;
  }

  cancelAssessment(chatId: number): void {
    this.states.delete(chatId);
  }
}
