export const RU = {
    COMMON: {
        ERROR_MESSAGE: 'Ошибка. Что-то пошло не так :(',
    },

    CHAT: {
        CANDIDATE_THANK_YOU:
            '🙏 Спасибо, что прошли интервью!\n\n' +
            'Ваши ответы получены и будут рассмотрены. Мы свяжемся с вами в ближайшее время.',
        CANCEL_MESSAGE: '❌ Оценка отменена.',
        ALREADY_COMPLETED: 'Вы уже прошли интервью. Спасибо!',
        INVALID_LINK: 'Ссылка недействительна.',
        LINK_ALREADY_USED: 'Эта ссылка уже была использована.',
        GREETING: (name: string) => `Привет, ${name}! 👋\n\n`,
        USE_RECRUITER_LINK: 'Для начала интервью воспользуйтесь ссылкой от рекрутера.',
        ANSWERS_PREFIX: (candidateName: string) => `*Кандидат: ${candidateName}*\n\n*Ответы:*\n\n`,
        ANALYSIS_PREFIX: '*Анализ:*\n\n',
    },

    VK_RECRUIT: {
        // Persistent keyboard buttons
        BTN_ADD_CANDIDATE: '➕ Добавить',
        BTN_LIST: '📋 Список',
        BTN_INFO: 'ℹ️ Инфо',

        // Inline action buttons
        BTN_REPORT: '📊 Отчёт',
        BTN_DELETE: '❌ Удалить',
        BTN_CONFIRM_DELETE: '✅ Да, удалить',
        BTN_CANCEL_DELETE: '↩️ Отмена',

        // Welcome / info
        WELCOME:
            '👋 HoReCa Recruit — сервис психологической оценки кандидатов для сферы HoReCa.\n\n' +
            'Как работает:\n' +
            '1. Нажмите ➕ Добавить — введите имя кандидата и получите ссылку\n' +
            '2. Отправьте ссылку кандидату — он пройдёт интервью из 4 вопросов\n' +
            '3. После завершения в 📋 Список появится готовый отчёт',
        CHOOSE_ACTION: 'Выберите действие:',

        // Add candidate dialog
        ENTER_NAME_PROMPT: 'Введите имя и фамилию кандидата:',
        CANDIDATE_ADDED: (name: string, link: string) =>
            `✅ Кандидат ${name} добавлен.\n\nСсылка для интервью:\n${link}`,

        // List / status labels
        LIST_HEADER: 'Кандидаты:',
        NO_CANDIDATES: 'Кандидатов пока нет.',
        STATUS_PENDING: '⏳ Не начал',
        STATUS_IN_PROGRESS: '🔄 В процессе',
        STATUS_COMPLETED: '✅ Завершил',
        STATUS_CANCELLED: '❌ Отменил',

        // Report
        REPORT_NOT_READY: 'Отчёт ещё не готов.',
        REPORT_PREFIX: (name: string) => `Отчёт: ${name}\n\n`,

        // Candidate lookup / removal
        CANDIDATE_NOT_FOUND: 'Кандидат не найден.',
        CANDIDATE_NOT_COMPLETED: (name: string) => `${name} ещё не завершил интервью.`,
        DELETE_CONFIRM: (name: string) => `Удалить кандидата ${name}?`,
        DELETE_CANCELLED: 'Удаление отменено.',
        CANDIDATE_DELETED: (name: string) => `Кандидат ${name} удалён.`,
    },

    VK_CANDIDATE: {
        INVALID_LINK: 'Ссылка недействительна.',
        LINK_ALREADY_USED: 'Эта ссылка уже была использована.',
        GREETING: (name: string) => `Привет, ${name}!\n\n`,
        CANCEL_MESSAGE: '❌ Интервью отменено.',
        THANK_YOU: '🙏 Спасибо за прохождение интервью! Ваши ответы получены.',
        ERROR_MESSAGE: 'Произошла ошибка. Попробуйте ещё раз.',
        ALREADY_COMPLETED: 'Вы уже прошли интервью. Спасибо!',
        USE_RECRUITER_LINK: 'Для начала интервью воспользуйтесь ссылкой от рекрутера.',
        ANSWERS_PREFIX: (candidateName: string) => `Кандидат: ${candidateName}\n\nОтветы:\n\n`,
        ANALYSIS_PREFIX: 'Анализ:\n\n',
        QUESTION_PREFIX: (num: number) => `Вопрос ${num}:\n`,
    },

    TG_RECRUIT: {
        // Persistent reply keyboard buttons
        BTN_ADD: '➕ Добавить',
        BTN_LIST: '📋 Список',
        BTN_INFO: 'ℹ️ Инфо',

        // Inline action buttons
        BTN_REPORT: '📊 Отчёт',
        BTN_DELETE: '❌ Удалить',
        BTN_CONFIRM_DELETE: '✅ Да, удалить',
        BTN_CANCEL_DELETE: '↩️ Отмена',
        BTN_COPY_LINK: '📋 Скопировать ссылку',

        // Welcome / info
        WELCOME:
            '👋 *HoReCa Recruit* — сервис психологической оценки кандидатов для сферы HoReCa.\n\n' +
            '*Как работает:*\n' +
            '1. Нажмите ➕ Добавить — введите имя кандидата и получите ссылку\n' +
            '2. Отправьте ссылку кандидату — он пройдёт интервью из 4 вопросов\n' +
            '3. После завершения в 📋 Список появится готовый отчёт',

        // Add candidate dialog
        ENTER_NAME_PROMPT: 'Введите имя и фамилию кандидата:',
        CANDIDATE_ADDED: (name: string, link: string) =>
            `✅ Кандидат ${name} добавлен.\n\nСсылка для интервью:\n${link}`,

        // List / status labels
        LIST_HEADER: 'Кандидаты:',
        NO_CANDIDATES: 'Кандидатов пока нет.',
        STATUS_PENDING: '⏳ Не начал',
        STATUS_IN_PROGRESS: '🔄 В процессе',
        STATUS_COMPLETED: '✅ Завершил',
        STATUS_CANCELLED: '❌ Отменил',

        // Report
        CANDIDATE_NOT_FOUND: (num: number) => `Кандидат с номером ${num} не найден.`,
        CANDIDATE_NOT_FOUND_TEXT: 'Кандидат не найден.',
        CANDIDATE_NOT_COMPLETED: (name: string) => `*${name}* ещё не завершил интервью.`,
        CANDIDATE_NOT_COMPLETED_TEXT: (name: string) => `${name} ещё не завершил интервью.`,
        REPORT_PREFIX: (name: string) => `*Отчёт: ${name}*\n\n`,

        // Delete confirmation
        DELETE_CONFIRM: (name: string) => `Удалить кандидата *${name}*?`,
        CANDIDATE_REMOVED: (name: string) => `Кандидат *${name}* удалён.`,

        // Command descriptions
        CMD_INFO_DESC: 'Возможности сервиса',
        CMD_CREATE_DESC: 'Добавить кандидата',
        CMD_LIST_DESC: 'Список кандидатов со статусами',
    },

    TG_CANDIDATE: {
        INVALID_LINK: 'Ссылка недействительна.',
        LINK_ALREADY_USED: 'Эта ссылка уже была использована.',
        GREETING: (name: string) => `Привет, ${name}! 👋\n\n`,
        ANSWERS_PREFIX: (candidateName: string) => `*Кандидат: ${candidateName}*\n\n*Ответы:*\n\n`,
        ANALYSIS_PREFIX: '*Анализ:*\n\n',
        QUESTION_PREFIX: (num: number) => `*Вопрос ${num}:*\n`,
        CMD_CANCEL_DESC: 'Отменить интервью',
    },

    ASSESSMENT: {
        START_TITLE: '🎯 **Оценка кандидата по 4-уровневой модели**\n\n',
        START_INSTRUCTION:
            'Я задам вам 4 поведенческих вопроса.\n\n' +
            'Пожалуйста, описывайте реальные ситуации из вашего опыта (работа, учёба, волонтёрство, личная жизнь).\n\n' +
            'Каждый ответ должен содержать:\n' +
            '• **Что произошло?** — опишите ситуацию\n' +
            '• **Что почувствовали?** — ваши эмоции\n' +
            '• **Что сделали?** — ваши действия\n' +
            '• **К чему привело?** — результат\n\n' +
            'Если нет прямого опыта — опишите гипотетическую реакцию, указав: «В такой ситуации я бы...»\n\n',
        CLARIFICATION_PREFIX: '🔍 ',
        CLARIFICATION_SUPPLEMENT: '\n\nДополнение: ',
        ANSWER_ACCEPTED: '\n✅ Принято.\n\n',
        COMPLETED_TITLE: '🏁 **Оценка завершена**\n\n',
        QUESTIONS: {
            QUESTION_1: {
                text: 'Опишите смену или ситуацию, когда вы работали в условиях высокой физической или когнитивной нагрузки (например, долгая работа на ногах, многозадачность, срочные дедлайны). Как вы справлялись с усталостью и поддерживали качество выполнения задач?',
            },
            QUESTION_2: {
                text: 'Расскажите о случае, когда вы столкнулись с агрессивным или крайне недовольным человеком (клиентом, коллегой, другом). Что вы почувствовали в тот момент и как отреагировали?',
            },
            QUESTION_3: {
                text: 'Бывало ли, что человек просил у вас одно, но вы чувствовали — ему на самом деле нужно другое? Опишите эту ситуацию: как вы это поняли, что сделали и как человек отреагировал.',
            },
            QUESTION_4: {
                text: 'Опишите ситуацию, когда вас просили сделать что-то, что противоречило вашим убеждениям или ценностям. Как вы поступили и почему?',
            },
        },
        CHECK_QUERY_TEMPLATE: (question: string, answer: string) =>
            `Вопрос: «${question}»\nОтвет кандидата: «${answer}»`,
        RESULT_TEMPLATE: (answers: string[]) =>
            `Ответы кандидата на 4 поведенческих вопроса. Проанализируй каждый ответ и оцени кандидата по 4 уровням ПВК.

---
**Уровень I — Физическая выносливость и точность**
Вопрос: «${RU.ASSESSMENT.QUESTIONS.QUESTION_1.text}»
Ответ кандидата: «${answers[0]}»

---
**Уровень II — Стрессоустойчивость и саморегуляция**
Вопрос: «${RU.ASSESSMENT.QUESTIONS.QUESTION_2.text}»
Ответ кандидата: «${answers[1]}»

---
**Уровень III — Социальная перцептивность и эмпатия**
Вопрос: «${RU.ASSESSMENT.QUESTIONS.QUESTION_3.text}»
Ответ кандидата: «${answers[2]}»

---
**Уровень IV — Этическая позиция и ценностная направленность**
Вопрос: «${RU.ASSESSMENT.QUESTIONS.QUESTION_4.text}»
Ответ кандидата: «${answers[3]}»

---`,
    },
} as const;
