'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

import { useI18n } from '@/lib/i18n/I18nProvider';
import type { IntroTone } from '@/lib/i18n/types';

interface CareerStage {
  id: string;
  letter: string;
  title: string;
  img: string;
  color: string;
  glow: string;
}

const toneClass: Record<IntroTone, string> = {
  default: '',
  primary: 'intro-highlight intro-highlight-primary',
  blue:    'intro-highlight intro-highlight-blue',
  orange:  'intro-highlight intro-highlight-orange',
  green:   'intro-highlight intro-highlight-green',
};

/* ── Floating ambient orbs (Aceternity-style aurora) ── */
const orbs = [
  { size: 600, x: '5%',   y: '0%',  color: 'rgba(14,165,233,0.10)',  dur: 18 },
  { size: 500, x: '60%',  y: '10%', color: 'rgba(249,115,22,0.08)',  dur: 22 },
  { size: 450, x: '25%',  y: '50%', color: 'rgba(34,197,94,0.07)',   dur: 26 },
  { size: 380, x: '78%',  y: '55%', color: 'rgba(251,191,36,0.09)',  dur: 20 },
];

function AmbientOrbs() {
  return (
    <div
      aria-hidden
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}
    >
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width:  orb.size,
            height: orb.size,
            left:   orb.x,
            top:    orb.y,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            filter: 'blur(60px)',
          }}
          animate={{
            x:     [0, 40, -20, 0],
            y:     [0, -30, 20, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: orb.dur,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 1.5,
          }}
        />
      ))}
    </div>
  );
}

/* ── Animation variants ── */
const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};

const cardVariant = {
  hidden:  { opacity: 0, y: 32, scale: 0.97 },
  visible: { opacity: 1, y: 0,  scale: 1 },
};

export function HomePageClient() {
  const { t } = useI18n();
  const home = t('home');

  const stages: CareerStage[] = [
    { id: 'choice',    letter: 'C', title: home.stageTitles.choice,    img: '/Artboard 2.jpg', color: 'var(--yellow)',     glow: 'rgba(251,191,36,0.3)'  },
    { id: 'adapt',     letter: 'A', title: home.stageTitles.adapt,     img: '/Artboard 3.jpg', color: 'var(--orange)',     glow: 'rgba(249,115,22,0.3)'  },
    { id: 'role',      letter: 'R', title: home.stageTitles.role,      img: '/Artboard 4.jpg', color: 'var(--red)',        glow: 'rgba(239,68,68,0.3)'   },
    { id: 'effective', letter: 'E', title: home.stageTitles.effective, img: '/Artboard 5.jpg', color: 'var(--green)',      glow: 'rgba(34,197,94,0.3)'   },
    { id: 'esteem',    letter: 'E', title: home.stageTitles.esteem,    img: '/Artboard 6.jpg', color: 'var(--light-blue)', glow: 'rgba(56,189,248,0.3)'  },
    { id: 'retire',    letter: 'R', title: home.stageTitles.retire,    img: '/Artboard 7.jpg', color: 'var(--dark-blue)',  glow: 'rgba(59,130,246,0.3)'  },
  ];

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      <AmbientOrbs />

      {/* ── Hero Intro Box (PRESERVED) ── */}
      <motion.section
        className="home-intro"
        aria-label={home.introAria}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="home-intro-text">
          {/* company name as heading */}
          {home.intro
            .filter((s) => s.tone === 'primary')
            .map((s, i) => (
              <div key={i} className="intro-company-name">{s.text}</div>
            ))}

          {/* body text — default segments joined, highlights inline */}
          <p className="intro-body">
            {home.intro
              .filter((s) => s.tone !== 'primary')
              .map((segment, i) => {
                const cls = toneClass[segment.tone];
                return cls ? (
                  <span key={i} className={cls}>{segment.text}</span>
                ) : (
                  <span key={i}>{segment.text}</span>
                );
              })}
          </p>

          {/* highlight chips row */}
          <div className="intro-chips">
            {home.intro
              .filter((s) => s.tone === 'blue' || s.tone === 'orange' || s.tone === 'green')
              .map((s, i) => (
                <span key={i} className={`intro-chip intro-chip-${s.tone}`}>
                  {s.text}
                </span>
              ))}
          </div>
        </div>
      </motion.section>

      {/* ── Career Cards ── */}
      <motion.div
        className="career-container"
        dir="ltr"
        lang="en"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {stages.map((stage) => (
          <motion.div
            key={stage.id}
            variants={cardVariant}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{ flex: 1, display: 'flex', minWidth: 0 }}
            whileHover={{ zIndex: 2 }}
          >
            <Link
              href={`/career/${stage.id}`}
              className={`career-card card-${stage.id}`}
              style={{ width: '100%', textDecoration: 'none' }}
            >
              <div
                className="card-bg"
                style={{ backgroundImage: `url('${stage.img}')` }}
              />

              <div
                className="card-content"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}
              >
                {/* SVG letter badge */}
                <div className="card-letter" style={{ marginBottom: '15px', display: 'flex', justifyContent: 'center' }}>
                  <svg width="80" height="80" viewBox="0 0 100 100">
                    <rect width="100" height="100" fill={stage.color} rx="10" opacity="0.9" />
                    {/* subtle inner glow */}
                    <rect width="100" height="100" rx="10" fill="url(#shine)" />
                    <defs>
                      <linearGradient id="shine" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="white" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="white" stopOpacity="0"    />
                      </linearGradient>
                    </defs>
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

                <div className="card-title" style={{ fontWeight: 400, width: '100%' }}>
                  {stage.title}
                </div>

                <button className="join-btn" style={{ fontWeight: 400, marginTop: '10px' }}>
                  {home.explore}
                </button>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
