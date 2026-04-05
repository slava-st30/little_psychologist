import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { LlmService, type ChatMessage } from '../llm';
import { DialogService } from '../bots/service';
import { ASSESSMENT_QUESTIONS } from './config';
import { ASSESSMENT_SYSTEM_PROMPT, ANSWER_CHECK_PROMPT } from './prompts';
import { type AssessmentState, type AnswerMeta } from './types';
import { t } from '../i18n';

@Injectable()
export class AssessmentService {
    private states: Map<number, AssessmentState> = new Map();
    private completed: Set<number> = new Set();

    constructor(
        private readonly llmService: LlmService,
        private readonly candidateService: DialogService,
    ) {}

    getStartMessages(): [string, string] {
        const a = t('ASSESSMENT');
        return [a.START_TITLE + a.START_INSTRUCTION, ASSESSMENT_QUESTIONS[0].text];
    }

    startAssessmentForCandidate(
        chatId: number,
        candidateId: Types.ObjectId,
        candidateName: string,
        recruiterChatId: number,
    ): void {
        this.completed.delete(chatId);
        this.states.set(chatId, {
            isActive: true,
            currentQuestionIndex: 0,
            answers: [],
            clarificationAsked: false,
            pendingAnswer: null,
            candidateId,
            candidateName,
            recruiterChatId,
        });
    }

    async handleAnswer(chatId: number, answer: string): Promise<[string | null, AnswerMeta]> {
        const state = this.states.get(chatId);
        if (!state || !state.isActive) {
            return [null, { completed: false }];
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
        return [a.CLARIFICATION_PREFIX + checkResult, { completed: false }];
    }

    private async acceptAnswer(
        chatId: number,
        state: AssessmentState,
        answer: string,
    ): Promise<[string, AnswerMeta]> {
        const a = t('ASSESSMENT');
        state.answers.push(answer);
        state.clarificationAsked = false;
        state.pendingAnswer = null;
        state.currentQuestionIndex++;

        if (state.currentQuestionIndex < ASSESSMENT_QUESTIONS.length) {
            const nextQuestion = ASSESSMENT_QUESTIONS[state.currentQuestionIndex];
            this.states.set(chatId, state);
            return [a.ANSWER_ACCEPTED + nextQuestion.text, { completed: false }];
        }

        this.states.delete(chatId);
        this.completed.add(chatId);

        const report = await this.getAssessmentResult(state.answers);
        await this.candidateService.saveReport(state.candidateId, state.answers, report);

        return [
            report,
            {
                completed: true,
                report,
                answers: state.answers,
                recruiterChatId: state.recruiterChatId,
                candidateName: state.candidateName,
            },
        ];
    }

    private async getAssessmentResult(answers: string[]): Promise<string> {
        const a = t('ASSESSMENT');
        const history: ChatMessage[] = [
            {
                role: 'user',
                content: a.RESULT_TEMPLATE(answers),
            },
        ];
        return this.llmService.getAnswer(history, ASSESSMENT_SYSTEM_PROMPT);
    }

    isAssessmentActive(chatId: number): boolean {
        return this.states.get(chatId)?.isActive ?? false;
    }

    isAssessmentCompleted(chatId: number): boolean {
        return this.completed.has(chatId);
    }

    cancelAssessment(chatId: number): void {
        this.states.delete(chatId);
        this.completed.delete(chatId);
    }
}
