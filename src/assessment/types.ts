export interface AssessmentState {
    isActive: boolean;
    currentQuestionIndex: number;
    answers: string[];
    clarificationAsked: boolean;
    pendingAnswer: string | null;
}
