'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { dictionaries } from './dictionaries';
import { LOCALE_STORAGE_KEY, type Locale } from './types';

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: <K extends keyof (typeof dictionaries)['en']>(section: K) => (typeof dictionaries)['en'][K];
};

const I18nContext = createContext<I18nContextValue | null>(null);

function readInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored === 'ar' || stored === 'en') return stored;
  if (typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('ar')) {
    return 'ar';
  }
  return 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLocaleState(readInitialLocale());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      /* ignore */
    }
  }, [locale, ready]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
  }, []);

  const t = useCallback(
    <K extends keyof (typeof dictionaries)['en']>(section: K) => {
      return dictionaries[locale][section];
    },
    [locale],
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
    }),
    [locale, setLocale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
}
