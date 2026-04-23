'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

import { useI18n } from '@/lib/i18n/I18nProvider';
import { GlobeBg } from './GlobeBg';

interface CareerStage {
  id: string;
  letter: string;
  title: string;
  img: string;
  color: string;
}

export function HomePageClient() {
  const { t } = useI18n();
  const home = t('home');

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
        <GlobeBg />

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
            <Link href="/assessment" className="btn-join-us">{home.cpdBtn}</Link>
          </motion.div>
        </div>

        {/* CPD logo side */}
        <div className="hero-cpd">
          <motion.img
            src="/cpd-logo.png"
            alt="CPD Certified"
            className="cpd-logo"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
            transition={{ opacity: { duration: 0.6 }, scale: { duration: 0.6 }, y: { delay: 0.8, duration: 3.5, repeat: Infinity, ease: 'easeInOut' } }}
          />
          <motion.div
            className="cpd-tagline-row"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <p className="cpd-tagline">{home.cpdTagline}</p>
            <Link href="/workshops" className="btn-join-us">{home.joinUs}</Link>
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
            <Link
              href={`/career/${stage.id}`}
              className={`career-card card-${stage.id}`}
              style={{ textDecoration: 'none', height: '100%', display: 'flex', flexDirection: 'column' }}
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
            </Link>
          </motion.div>
        ))}
      </motion.div>

    </div>
  );
}
