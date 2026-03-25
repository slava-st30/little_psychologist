export const EN = {
    COMMON: {
        ERROR_MESSAGE: 'Error. Something went wrong :(',
    },

    CHAT: {
        START_MESSAGE:
            'Hi! I am a candidate assessment bot for the service industry.\n\n' +
            'Use:\n' +
            '/assess — start candidate assessment\n' +
            '/cancel — cancel assessment\n' +
            'Or just write a message for a regular conversation.',
        CANCEL_MESSAGE: '❌ Assessment cancelled. You can start again with /assess',
    },

    ASSESSMENT: {
        START_TITLE: '🎯 **Candidate Assessment by 4-Level Model**\n\n',
        START_INSTRUCTION:
            'I will ask you 4 behavioral questions.\n\n' +
            'Please describe real situations from your experience (work, study, volunteering, personal life).\n\n' +
            'Each answer should include:\n' +
            '• **What happened?** — describe the situation\n' +
            '• **What did you feel?** — your emotions\n' +
            '• **What did you do?** — your actions\n' +
            '• **What was the outcome?** — the result\n\n' +
            'If you have no direct experience — describe a hypothetical reaction with: "In such a situation I would..."\n\n',
        CLARIFICATION_PREFIX: '🔍 ',
        CLARIFICATION_SUPPLEMENT: '\n\nAddendum: ',
        ANSWER_ACCEPTED: '\n✅ Accepted.\n\n',
        COMPLETED_TITLE: '🏁 **Assessment Completed**\n\n',
        QUESTIONS: {
            QUESTION_1: {
                label: 'Question 1 (Endurance and Accuracy)',
                text: 'Describe a shift or situation when you worked under high physical or cognitive load (e.g., long hours on your feet, multitasking, tight deadlines). How did you cope with fatigue and maintain task quality?',
            },
            QUESTION_2: {
                label: 'Question 2 (Stress Resilience in Conflict)',
                text: 'Tell us about a time when you encountered an aggressive or extremely dissatisfied person (client, colleague, friend). What did you feel at that moment and how did you react?',
            },
            QUESTION_3: {
                label: 'Question 3 (Social Perceptiveness and Empathy)',
                text: 'Has it happened that a person asked you for one thing, but you felt they actually needed something else? Describe this situation: how did you understand it, what did you do, and how did the person react?',
            },
            QUESTION_4: {
                label: 'Question 4 (Ethical Position and Values)',
                text: 'Describe a situation when you were asked to do something that contradicted your beliefs or values. How did you act and why?',
            },
        },
        CHECK_QUERY_TEMPLATE: (question: string, answer: string) =>
            `Question: «${question}»\nCandidate answer: «${answer}»`,
        RESULT_TEMPLATE: (answers: string[]) =>
            `Candidate texts (answers to 4 behavioral questions):
---
**${EN.ASSESSMENT.QUESTIONS.QUESTION_1.label}:** «${answers[0]}»
**${EN.ASSESSMENT.QUESTIONS.QUESTION_2.label}:** «${answers[1]}»
**${EN.ASSESSMENT.QUESTIONS.QUESTION_3.label}:** «${answers[2]}»
**${EN.ASSESSMENT.QUESTIONS.QUESTION_4.label}:** «${answers[3]}»
---`,
    },
} as const;
