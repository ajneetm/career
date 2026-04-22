'use client';

import Link from 'next/link';
import { getCareerStage } from '@/lib/career-stages';
import { useI18n } from '@/lib/i18n/I18nProvider';

export function CareerStageClient({ stageId }: { stageId: string }) {
  const { locale, t } = useI18n();
  const labels = t('career');
  const current = getCareerStage(stageId, locale);

  if (!current) {
    return (
      <main className="detail-wrapper" style={{ fontWeight: 400, textAlign: 'center', padding: '100px 20px' }}>
        <h1>{labels.notFoundTitle}</h1>
        <p>{labels.notFoundBody}</p>
      </main>
    );
  }

  return (
    <main className="detail-wrapper">
      <div
        className="box"
        style={{
          borderTop: `15px solid ${current.color}`,
          paddingTop: '40px',
        }}
      >
        <div
          style={{
            width: '120px',
            height: '120px',
            color: current.color,
            marginBottom: '20px',
          }}
        >
          {current.svg}
        </div>

        <h1
          style={{
            fontWeight: 400,
            fontSize: '2.5rem',
            marginBottom: '20px',
            textTransform: locale === 'ar' ? 'none' : 'uppercase',
          }}
        >
          {current.title}
        </h1>

        <div style={{ textAlign: 'start', lineHeight: '1.8', fontSize: '1.2rem', color: '#475569' }}>
          <p style={{ marginBottom: '25px', fontWeight: 400 }}>{current.desc}</p>

          <div
            style={{
              fontWeight: 400,
              color: 'var(--text-dark)',
              borderInlineStart: `4px solid ${current.color}`,
              paddingInlineStart: '20px',
            }}
          >
            {current.action}
          </div>
        </div>

        <div style={{ marginTop: '40px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          {stageId === 'choice' && (
            <Link
              href="/assessment/choice"
              className="submit-btn"
              style={{
                width: 'auto',
                padding: '15px 35px',
                fontWeight: 400,
                background: current.color,
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              {labels.takeAssessment}
            </Link>
          )}

          <button
            className="submit-btn"
            style={{
              width: 'auto',
              padding: '15px 35px',
              fontWeight: 400,
              background: stageId === 'choice' ? 'transparent' : current.color,
              color: stageId === 'choice' ? '#475569' : 'white',
              border: stageId === 'choice' ? `2px solid ${current.color}` : 'none',
              cursor: 'pointer',
            }}
          >
            {labels.joinWorkshop}
          </button>

          <button
            className="submit-btn"
            style={{
              width: 'auto',
              padding: '15px 35px',
              fontWeight: 400,
              background: 'transparent',
              color: '#475569',
              border: `2px solid ${current.color}`,
              cursor: 'pointer',
            }}
          >
            {labels.bookConsultation}
          </button>
        </div>
      </div>

      <div style={{ marginTop: '60px', textAlign: 'center' }}>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem', fontWeight: 400 }}>{labels.footerLine1}</p>
        <p style={{ fontWeight: 400, marginTop: '10px', color: '#64748b' }}>{labels.footerLine2}</p>
      </div>
    </main>
  );
}
