'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClipboard } from 'react-icons/fi';

import { useI18n } from '@/lib/i18n/I18nProvider';
import type { IntroTone } from '@/lib/i18n/types';

interface CareerStage {
  id: string;
  letter: string;
  title: string;
  img: string;
  color: string;
}

const toneClass: Record<IntroTone, string> = {
  default: '',
  primary: 'intro-highlight intro-highlight-primary',
  blue: 'intro-highlight intro-highlight-blue',
  orange: 'intro-highlight intro-highlight-orange',
  green: 'intro-highlight intro-highlight-green',
};

/* ── Typewriter hook ── */
function useTypewriter(text: string, speed = 22, delay = 600) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    const start = setTimeout(() => {
      let i = 0;
      const timer = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) { clearInterval(timer); setDone(true); }
      }, speed);
      return () => clearInterval(timer);
    }, delay);
    return () => clearTimeout(start);
  }, [text, speed, delay]);

  return { displayed, done };
}

/* ── Blinking cursor ── */
function Cursor({ visible }: { visible: boolean }) {
  return (
    <motion.span
      animate={{ opacity: visible ? [1, 0, 1] : 0 }}
      transition={{ repeat: Infinity, duration: 0.9, ease: 'easeInOut' }}
      style={{ display: 'inline-block', width: 2, height: '1em', background: '#0ea5e9', marginInlineStart: 2, verticalAlign: 'middle', borderRadius: 1 }}
    />
  );
}

export function HomePageClient() {
  const { t } = useI18n();
  const home = t('home');

  /* typewriter on the cpd workshop text */
  /* paragraph animation ends ~2.3s → typewriter starts after */
  const { displayed: typedDesc, done: descDone } = useTypewriter(home.cpdWorkshop, 18, 2400);

  const stages: CareerStage[] = [
    { id: 'choice',    letter: 'C', title: home.stageTitles.choice,    img: '/Artboard 2.jpg', color: 'var(--yellow)'     },
    { id: 'adapt',     letter: 'A', title: home.stageTitles.adapt,     img: '/Artboard 3.jpg', color: 'var(--orange)'     },
    { id: 'role',      letter: 'R', title: home.stageTitles.role,      img: '/Artboard 4.jpg', color: 'var(--red)'        },
    { id: 'effective', letter: 'E', title: home.stageTitles.effective, img: '/Artboard 5.jpg', color: 'var(--green)'      },
    { id: 'esteem',    letter: 'E', title: home.stageTitles.esteem,    img: '/Artboard 6.jpg', color: 'var(--light-blue)' },
    { id: 'retire',    letter: 'R', title: home.stageTitles.retire,    img: '/Artboard 7.jpg', color: 'var(--dark-blue)'  },
  ];

  return (
    <div className="page-fill">

      {/* ── Hero Top ── */}
      <div className="hero-top">

        {/* Left — tagline + intro */}
        <section className="home-intro" aria-label={home.introAria}>

          {/* big tagline */}
          <motion.h1
            className="hero-tagline"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {home.tagline}
          </motion.h1>

          {/* paragraph — words fade in staggered */}
          <motion.p
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.04, delayChildren: 0.2 } } }}
          >
            {home.intro.map((segment, i) => {
              const cls = toneClass[segment.tone];
              const words = segment.text.split(/(\s+)/);
              return words.map((word, j) => (
                <motion.span
                  key={`${i}-${j}`}
                  className={cls || undefined}
                  variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.35 }}
                  style={{ display: 'inline' }}
                >
                  {word}
                </motion.span>
              ));
            })}
          </motion.p>

          <motion.p
            className="cpd-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            {home.cpdSubtitle}
          </motion.p>

        </section>

        {/* divider */}
        <motion.div
          className="hero-divider"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ transformOrigin: 'top' }}
        />

        {/* Right — CPD logo + CTA */}
        <div className="hero-cpd">
          <motion.img
            src="/cpd-logo.png"
            alt="CPD Certified"
            className="cpd-logo"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
            transition={{
              opacity: { duration: 0.6 },
              scale:   { duration: 0.6 },
              y: { delay: 0.8, duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
            }}
          />
          <p className="cpd-badge-text">{home.cpdBadge}</p>
          <p className="cpd-desc">
            {typedDesc}
            <Cursor visible={!descDone} />
          </p>
          <AnimatePresence>
            {descDone && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Link href="/assessment" className="cpd-btn">
                  <FiClipboard size={17} />
                  {home.cpdBtn}
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* ── Career Cards — stagger in ── */}
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
