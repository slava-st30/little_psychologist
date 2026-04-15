export const EN = {
    COMMON: {
        ERROR_MESSAGE: 'Error. Something went wrong :(',
    },

    CHAT: {
        CANDIDATE_THANK_YOU:
            '🙏 Thank you for completing the interview!\n\n' +
            'Your answers have been received and will be reviewed. We will be in touch soon.',
        CANCEL_MESSAGE: '❌ Assessment cancelled.',
        ALREADY_COMPLETED: 'You have already completed the interview. Thank you!',
        INVALID_LINK: 'The link is invalid.',
        LINK_ALREADY_USED: 'This link has already been used.',
        GREETING: (name: string) => `Hi, ${name}! 👋\n\n`,
        USE_RECRUITER_LINK: 'To start the interview, use the link provided by your recruiter.',
        ANSWERS_PREFIX: (candidateName: string) => `*Candidate: ${candidateName}*\n\n*Answers:*\n\n`,
        ANALYSIS_PREFIX: '*Analysis:*\n\n',
    },

    VK_RECRUIT: {
        // Persistent keyboard buttons
        BTN_ADD_CANDIDATE: '➕ Add',
        BTN_LIST: '📋 List',
        BTN_INFO: 'ℹ️ Info',

        // Inline action buttons
        BTN_REPORT: '📊 Report',
        BTN_DELETE: '❌ Delete',
        BTN_CONFIRM_DELETE: '✅ Yes, delete',
        BTN_CANCEL_DELETE: '↩️ Cancel',

        // Welcome / info
        WELCOME:
            '👋 HoReCa Recruit — psychological candidate assessment service for HoReCa.\n\n' +
            'How it works:\n' +
            '1. Press ➕ Add — enter the candidate\'s name and get a link\n' +
            '2. Send the link to the candidate — they complete a 4-question interview\n' +
            '3. After completion, the report appears in 📋 List',
        CHOOSE_ACTION: 'Choose an action:',

        // Add candidate dialog
        ENTER_NAME_PROMPT: 'Enter the candidate\'s first and last name:',
        CANDIDATE_ADDED: (name: string, link: string) =>
            `✅ Candidate ${name} added.\n\nInterview link:\n${link}`,

        // List / status labels
        LIST_HEADER: 'Candidates:',
        NO_CANDIDATES: 'No candidates yet.',
        STATUS_PENDING: '⏳ Not started',
        STATUS_IN_PROGRESS: '🔄 In progress',
        STATUS_COMPLETED: '✅ Completed',
        STATUS_CANCELLED: '❌ Cancelled',

        // Report
        REPORT_NOT_READY: 'Report is not ready yet.',
        REPORT_PREFIX: (name: string) => `Report: ${name}\n\n`,

        // Candidate lookup / removal
        CANDIDATE_NOT_FOUND: 'Candidate not found.',
        CANDIDATE_NOT_COMPLETED: (name: string) => `${name} has not completed the interview yet.`,
        DELETE_CONFIRM: (name: string) => `Delete candidate ${name}?`,
        DELETE_CANCELLED: 'Deletion cancelled.',
        CANDIDATE_DELETED: (name: string) => `Candidate ${name} deleted.`,
    },

    VK_CANDIDATE: {
        INVALID_LINK: 'The link is invalid.',
        LINK_ALREADY_USED: 'This link has already been used.',
        GREETING: (name: string) => `Hi, ${name}!\n\n`,
        CANCEL_MESSAGE: '❌ Interview cancelled.',
        THANK_YOU: '🙏 Thank you for completing the interview! Your answers have been received.',
        ERROR_MESSAGE: 'An error occurred. Please try again.',
        ALREADY_COMPLETED: 'You have already completed the interview. Thank you!',
        USE_RECRUITER_LINK: 'To start the interview, use the link provided by your recruiter.',
        ANSWERS_PREFIX: (candidateName: string) => `Candidate: ${candidateName}\n\nAnswers:\n\n`,
        ANALYSIS_PREFIX: 'Analysis:\n\n',
        QUESTION_PREFIX: (num: number) => `Question ${num}:\n`,
    },

    TG_RECRUIT: {
        // Persistent reply keyboard buttons
        BTN_ADD: '➕ Add',
        BTN_LIST: '📋 List',
        BTN_INFO: 'ℹ️ Info',

        // Inline action buttons
        BTN_REPORT: '📊 Report',
        BTN_DELETE: '❌ Delete',
        BTN_CONFIRM_DELETE: '✅ Yes, delete',
        BTN_CANCEL_DELETE: '↩️ Cancel',
        BTN_COPY_LINK: '📋 Copy link',

        // Welcome / info
        WELCOME:
            '👋 *HoReCa Recruit* — psychological candidate assessment service for HoReCa.\n\n' +
            '*How it works:*\n' +
            '1. Press ➕ Add — enter the candidate\'s name and get a link\n' +
            '2. Send the link to the candidate — they complete a 4-question interview\n' +
            '3. After completion, the report appears in 📋 List',

        // Add candidate dialog
        ENTER_NAME_PROMPT: 'Enter the candidate\'s first and last name:',
        CANDIDATE_ADDED: (name: string, link: string) =>
            `✅ Candidate ${name} added.\n\nInterview link:\n${link}`,

        // List / status labels
        LIST_HEADER: 'Candidates:',
        NO_CANDIDATES: 'No candidates yet.',
        STATUS_PENDING: '⏳ Not started',
        STATUS_IN_PROGRESS: '🔄 In progress',
        STATUS_COMPLETED: '✅ Completed',
        STATUS_CANCELLED: '❌ Cancelled',

        // Report
        CANDIDATE_NOT_FOUND: (num: number) => `Candidate with number ${num} not found.`,
        CANDIDATE_NOT_FOUND_TEXT: 'Candidate not found.',
        CANDIDATE_NOT_COMPLETED: (name: string) => `*${name}* has not completed the interview yet.`,
        CANDIDATE_NOT_COMPLETED_TEXT: (name: string) => `${name} has not completed the interview yet.`,
        REPORT_PREFIX: (name: string) => `*Report: ${name}*\n\n`,

        // Delete confirmation
        DELETE_CONFIRM: (name: string) => `Delete candidate *${name}*?`,
        CANDIDATE_REMOVED: (name: string) => `Candidate *${name}* deleted.`,

        // Command descriptions
        CMD_INFO_DESC: 'Service capabilities',
        CMD_CREATE_DESC: 'Add a candidate',
        CMD_LIST_DESC: 'List candidates with statuses',
    },

    TG_CANDIDATE: {
        INVALID_LINK: 'The link is invalid.',
        LINK_ALREADY_USED: 'This link has already been used.',
        GREETING: (name: string) => `Hi, ${name}! 👋\n\n`,
        ANSWERS_PREFIX: (candidateName: string) => `*Candidate: ${candidateName}*\n\n*Answers:*\n\n`,
        ANALYSIS_PREFIX: '*Analysis:*\n\n',
        QUESTION_PREFIX: (num: number) => `*Question ${num}:*\n`,
        CMD_CANCEL_DESC: 'Cancel the interview',
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
