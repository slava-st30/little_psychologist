import { RU } from '../i18n/ru';

const q = RU.ASSESSMENT.QUESTIONS;

export const ASSESSMENT_QUESTIONS = [
    {
        id: 1,
        text: `📋 **${q.QUESTION_1.label}**\n\n${q.QUESTION_1.text}`,
        level: 'I',
        pvk: 'Физическая выносливость и точность',
    },
    {
        id: 2,
        text: `📋 **${q.QUESTION_2.label}**\n\n${q.QUESTION_2.text}`,
        level: 'II',
        pvk: 'Стрессоустойчивость и саморегуляция',
    },
    {
        id: 3,
        text: `📋 **${q.QUESTION_3.label}**\n\n${q.QUESTION_3.text}`,
        level: 'III',
        pvk: 'Социальная перцептивность и эмпатия',
    },
    {
        id: 4,
        text: `📋 **${q.QUESTION_4.label}**\n\n${q.QUESTION_4.text}`,
        level: 'IV',
        pvk: 'Этическая позиция и ценностная направленность',
    },
];
