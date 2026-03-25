import { Injectable } from '@nestjs/common';
import { LlmService, type ChatMessage } from '../llm';
import { ASSESSMENT_QUESTIONS } from './config';
import { ASSESSMENT_SYSTEM_PROMPT, ANSWER_CHECK_PROMPT } from './prompts';
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
            clarificationAsked: false,
            pendingAnswer: null,
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

        const a = t('ASSESSMENT');
        const currentQuestion = ASSESSMENT_QUESTIONS[state.currentQuestionIndex];

        if (state.clarificationAsked) {
            const combined = state.pendingAnswer
                ? `${state.pendingAnswer}${a.CLARIFICATION_SUPPLEMENT}${answer}`
                : answer;
            return this.acceptAnswer(chatId, state, combined);
        }

        const checkHistory: ChatMessage[] = [
            {
                role: 'user',
                content: a.CHECK_QUERY_TEMPLATE(currentQuestion.text, answer),
            },
        ];
        const checkResult = await this.llmService.getAnswer(checkHistory, ANSWER_CHECK_PROMPT);

        if (checkResult.trim() === 'SUFFICIENT') {
            return this.acceptAnswer(chatId, state, answer);
        }

        state.clarificationAsked = true;
        state.pendingAnswer = answer;
        this.states.set(chatId, state);
        return a.CLARIFICATION_PREFIX + checkResult;
    }

    private async acceptAnswer(
        chatId: number,
        state: AssessmentState,
        answer: string,
    ): Promise<string> {
        const a = t('ASSESSMENT');
        state.answers.push(answer);
        state.clarificationAsked = false;
        state.pendingAnswer = null;
        state.currentQuestionIndex++;

        if (state.currentQuestionIndex < ASSESSMENT_QUESTIONS.length) {
            const nextQuestion = ASSESSMENT_QUESTIONS[state.currentQuestionIndex];
            this.states.set(chatId, state);
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

        const result = await this.llmService.getAnswer(history, ASSESSMENT_SYSTEM_PROMPT);
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
