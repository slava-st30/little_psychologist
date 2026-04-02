import { Types } from 'mongoose';

export interface AssessmentState {
    isActive: boolean;
    currentQuestionIndex: number;
    answers: string[];
    clarificationAsked: boolean;
    pendingAnswer: string | null;
    candidateId: Types.ObjectId;
    candidateName: string;
    recruiterChatId: number;
}

export interface AnswerMeta {
    completed: boolean;
    report?: string;
    answers?: string[];
    recruiterChatId?: number;
    candidateName?: string;
}
