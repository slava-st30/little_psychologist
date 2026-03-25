import { RU } from './ru';
import { EN } from './en';

export const translations = {
    ru: RU,
    en: EN,
} as const;

export type Locale = keyof typeof translations;

const DEFAULT_LOCALE: Locale = 'ru';

export function t<K extends keyof typeof RU>(
    section: K,
    locale: Locale = DEFAULT_LOCALE,
): (typeof translations)[typeof DEFAULT_LOCALE][K] {
    return translations[locale][section];
}

export { RU, EN };
