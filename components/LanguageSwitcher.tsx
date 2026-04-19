'use client';

import { useI18n } from '@/lib/i18n/I18nProvider';
import type { Locale } from '@/lib/i18n/types';

type LanguageSwitcherProps = {
  /** `dark` للقائمة الجانبية ذات الخلفية الداكنة */
  variant?: 'light' | 'dark';
  className?: string;
};

export function LanguageSwitcher({ variant = 'light', className = '' }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useI18n();
  const labels = t('lang');

  const switchLocale = (next: Locale) => {
    if (next === locale) return;
    setLocale(next);
  };

  const rootClass =
    variant === 'dark' ? `lang-switcher lang-switcher--dark ${className}`.trim() : `lang-switcher ${className}`.trim();

  return (
    <div className={rootClass} role="group" aria-label="Language">
      <button
        type="button"
        className={`lang-switcher-btn${locale === 'en' ? ' is-active' : ''}`}
        onClick={() => switchLocale('en')}
      >
        {labels.en}
      </button>
      <button
        type="button"
        className={`lang-switcher-btn${locale === 'ar' ? ' is-active' : ''}`}
        onClick={() => switchLocale('ar')}
      >
        {labels.ar}
      </button>
    </div>
  );
}
