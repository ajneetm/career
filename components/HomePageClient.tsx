'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

import { useI18n } from '@/lib/i18n/I18nProvider';
import { getCareerStage } from '@/lib/career-stages';

interface CareerStage {
  id: string;
  letter: string;
  title: string;
  img: string;
  color: string;
}

export function HomePageClient() {
  const { locale, t } = useI18n();
  const home = t('home');
  const [activeStage, setActiveStage] = useState<CareerStage | null>(null);

  const stages: CareerStage[] = [
    { id: 'choice',    letter: 'C', title: home.stageTitles.choice,    img: '/Artboard-2.png', color: 'var(--yellow)'     },
    { id: 'adapt',     letter: 'A', title: home.stageTitles.adapt,     img: '/Artboard-3.png', color: 'var(--orange)'     },
    { id: 'role',      letter: 'R', title: home.stageTitles.role,      img: '/Artboard-4.png', color: 'var(--red)'        },
    { id: 'effective', letter: 'E', title: home.stageTitles.effective, img: '/Artboard-5.png', color: 'var(--green)'      },
    { id: 'esteem',    letter: 'E', title: home.stageTitles.esteem,    img: '/Artboard-6.png', color: 'var(--light-blue)' },
    { id: 'retire',    letter: 'R', title: home.stageTitles.retire,    img: '/Artboard-7.png', color: 'var(--dark-blue)'  },
  ];

  return (
    <div className="page-fill">

      {/* ── Hero ── */}
      <div className="hero-top">
        {/* Content side */}
        <div className="hero-content">
          <motion.div
            className="hero-main-row"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="hero-tagline-wrap">
              <span className="hero-tagline-accent" />
              <h1 className="hero-tagline">{home.tagline}</h1>
            </div>
            <p className="hero-desc">{home.cpdWorkshop}</p>
          </motion.div>

          <motion.div
            className="hero-bottom-row"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="hero-actions">
              <Link href="/interests" className="btn-join-us">{home.discoverInterests}</Link>
              <Link href="#" className="btn-join-us">{home.careerPosition}</Link>
              <Link href="#" className="btn-join-us">{home.futurePath}</Link>
            </div>
          </motion.div>
        </div>

        {/* Partners side */}
        <div className="hero-cpd">
          <motion.div
            className="partners-row"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <a href="https://www.loidabritish.com/" className="partner-item" target="_blank" rel="noopener noreferrer">
              <img src="/LOIDA.png" alt="LOIDA" className="partner-logo" />
              <span className="partner-label">{home.partnerDistributor}</span>
            </a>
            <div className="partner-divider" />
            <a href="https://www.ajnee.com/" className="partner-item" target="_blank" rel="noopener noreferrer">
              <img src="/AJNEE.png" alt="AJNEE" className="partner-logo" />
              <span className="partner-label">{home.partnerInnovator}</span>
            </a>
            <div className="partner-divider" />
            <a href="https://www.cpduk.co.uk/courses/loida-british-ajnee-career-pathway-model" className="partner-item" target="_blank" rel="noopener noreferrer">
              <img src="/CPD.png" alt="CPD" className="partner-logo" />
              <span className="partner-label">{home.partnerAccredited}</span>
            </a>
          </motion.div>

          <motion.div
            className="cpd-tagline-row"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <p className="cpd-tagline">{home.cpdTagline}</p>
            <Link href="/signup" className="btn-join-us">{home.joinUs}</Link>
          </motion.div>
        </div>

      </div>

      {/* ── Career Cards ── */}
      <motion.div
        className="career-container"
        dir="ltr"
        lang="en"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.08, delayChildren: 0.4 } } }}
      >
        {stages.map((stage) => (
          <motion.div
            key={stage.id}
            style={{ flex: 1, minWidth: 0 }}
            variants={{ hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <button
              onClick={() => setActiveStage(stage)}
              className={`career-card card-${stage.id}`}
              style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer', background: 'none', border: 'none', padding: 0, fontFamily: 'inherit' }}
            >
              <div className="card-img-wrap">
                <div className="card-bg" style={{ backgroundImage: `url('${stage.img}')` }} />
              </div>
              <div className="card-content">
                <div className="card-letter">
                  <svg width="80" height="80" viewBox="0 0 100 100">
                    <rect width="100" height="100" fill={stage.color} rx="10" />
                    <text
                      x="50" y="50"
                      textAnchor="middle" dominantBaseline="central"
                      fontSize="65" fontWeight="400" fill="white"
                      style={{ userSelect: 'none' }}
                    >
                      {stage.letter}
                    </text>
                  </svg>
                </div>
                <div className="card-title">{stage.title}</div>
              </div>
            </button>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Stage Modal ── */}
      <AnimatePresence>
        {activeStage && (() => {
          const stage = getCareerStage(activeStage.id, locale);
          if (!stage) return null;
          return (
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveStage(null)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
            >
              <motion.div
                key="panel"
                initial={{ opacity: 0, scale: 0.94, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 16 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                onClick={e => e.stopPropagation()}
                dir="rtl"
                style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 480, overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}
              >
                {/* Colored header bar */}
                <div style={{ background: stage.color, padding: '24px 24px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                    {activeStage.letter}
                  </div>
                  <h2 style={{ color: 'white', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>{stage.title}</h2>
                  <button onClick={() => setActiveStage(null)} style={{ marginRight: 'auto', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: 'white', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
                </div>

                {/* Body */}
                <div style={{ padding: '20px 24px 24px' }}>
                  <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.75, marginBottom: 16 }}>{stage.desc}</p>
                  <div style={{ borderRight: `3px solid ${stage.color}`, paddingRight: 14, marginBottom: 24 }}>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.7, margin: 0 }}>{stage.action}</p>
                  </div>

                  {/* Buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <Link
                      href={`/workshops?category=${activeStage.id}`}
                      onClick={() => setActiveStage(null)}
                      style={{ display: 'block', textAlign: 'center', padding: '13px', background: stage.color, color: 'white', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: '0.95rem' }}
                    >
                      🎓 الدخول للورش
                    </Link>

                    <Link
                      href="/interests"
                      onClick={() => setActiveStage(null)}
                      style={{ display: 'block', textAlign: 'center', padding: '11px 13px', background: '#f8fafc', color: '#1e293b', border: '1.5px solid #e2e8f0', borderRadius: 12, textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}
                    >
                      🎯 اكتشف ميولك المهنية
                      <span style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 400, marginTop: 2 }}>لا يحتاج تسجيل دخول</span>
                    </Link>

                    <Link
                      href={`/assessment/${activeStage.id}`}
                      onClick={() => setActiveStage(null)}
                      style={{ display: 'block', textAlign: 'center', padding: '11px 13px', background: 'white', color: stage.color, border: `2px solid ${stage.color}`, borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}
                    >
                      📊 اكتشف جاهزيتك لهذه المرحلة
                      <span style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 400, marginTop: 2 }}>يحتاج تسجيل دخول</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

    </div>
  );
}
