'use client';

import { useI18n } from '@/lib/i18n/I18nProvider';
import type { IntroTone } from '@/lib/i18n/types';

const toneClass: Record<IntroTone, string> = {
  default: '',
  primary: 'intro-highlight intro-highlight-primary',
  blue: 'intro-highlight intro-highlight-blue',
  orange: 'intro-highlight intro-highlight-orange',
  green: 'intro-highlight intro-highlight-green',
};

export function AboutPageClient() {
  const { t } = useI18n();
  const about = t('about');
  const home = t('home');

  return (
    <main className="about-container">
      <section className="about-hero">
        <h1>{about.title}</h1>
        <p style={{ fontSize: '1.2rem', color: '#64748b' }}>{about.heroLine}</p>
      </section>

      <div className="about-content">
        <section className="about-section">
          <p style={{ fontSize: '1.1rem', lineHeight: 1.9, maxWidth: '800px' }}>
            {home.intro.map((segment, i) => (
              <span key={i} className={toneClass[segment.tone] || undefined}>
                {segment.text}
              </span>
            ))}
          </p>
        </section>

        <section className="about-section">
          <h2>{about.missionTitle}</h2>
          <p style={{ fontSize: '1.1rem', maxWidth: '800px' }}>{about.missionParagraph}</p>
        </section>

        <section className="about-section">
          <h2>{about.offerTitle}</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>{about.offerWorkshopsTitle}</h3>
              <p>{about.offerWorkshopsDesc}</p>
            </div>
            <div className="feature-card">
              <h3>{about.offerMentorshipTitle}</h3>
              <p>{about.offerMentorshipDesc}</p>
            </div>
            <div className="feature-card">
              <h3>{about.offerResourcesTitle}</h3>
              <p>{about.offerResourcesDesc}</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
