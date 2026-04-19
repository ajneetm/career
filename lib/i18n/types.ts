export type Locale = 'en' | 'ar';

export const LOCALES: Locale[] = ['en', 'ar'];

export const LOCALE_STORAGE_KEY = 'c4e-locale';

export type IntroTone = 'default' | 'primary' | 'blue' | 'orange' | 'green';

export type IntroSegment = { text: string; tone: IntroTone };
