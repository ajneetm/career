'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLogIn, FiUser } from 'react-icons/fi';

import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { fallbackNavigationItems, type NavigationItemDTO } from '@/lib/navigation-fallback';

const sidebarVariants = {
  closed: { x: '-100%' },
  open:   { x: 0 },
};

const backdropVariants = {
  closed: { opacity: 0, pointerEvents: 'none' as const },
  open:   { opacity: 1, pointerEvents: 'auto' as const },
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { locale, t } = useI18n();
  const nav = t('nav');
  const [menuLinks, setMenuLinks] = useState<NavigationItemDTO[]>(fallbackNavigationItems);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/navigation')
      .then((r) => r.json())
      .then((data: unknown) => {
        if (cancelled || !Array.isArray(data) || data.length === 0) return;
        setMenuLinks(data as NavigationItemDTO[]);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  /* lock body scroll while sidebar is open */
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const label = (item: NavigationItemDTO) => (locale === 'ar' ? item.labelAr : item.labelEn);

  return (
    <>
      {/* ── Navbar bar ── */}
      <motion.nav
        className="navbar"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0,   opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Left: hamburger + icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button
            className="hamburger"
            onClick={() => setIsOpen(true)}
            aria-label="Open menu"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <span />
            <span />
            <span />
          </button>

          <div style={{ display: 'flex', gap: '12px', fontSize: '22px' }}>
            <Link href="/login"   title={nav.login}   style={{ color: 'var(--text-lo)', transition: 'color 0.2s' }}>
              <FiLogIn />
            </Link>
            <Link href="/profile" title={nav.profile} style={{ color: 'var(--text-lo)', transition: 'color 0.2s' }}>
              <FiUser />
            </Link>
          </div>
        </div>

        {/* Centre: title */}
        <div className="nav-center-title">
          <h1 style={{ fontWeight: 400 }}>CAREER FOR EVERYONE</h1>
        </div>

        {/* Right: logo */}
        <div className="logo">
          <img src="/logo.png" alt="Logo" style={{ height: '40px' }} />
        </div>
      </motion.nav>

      {/* ── Backdrop ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="backdrop"
            variants={backdropVariants}
            initial="closed"
            animate="open"
            exit="closed"
            transition={{ duration: 0.3 }}
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 1000,
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(4px)',
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="sidebar"
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{
              position: 'fixed', top: 0, left: 0,
              width: 300, maxWidth: '88vw', height: '100%',
              background: 'rgba(255,255,255,0.94)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRight: '1px solid #e2e8f0',
              boxShadow: '4px 0 24px rgba(0,0,0,0.08)',
              zIndex: 1001,
              padding: '80px 28px 28px',
            }}
          >
            {/* Close */}
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
              style={{
                position: 'absolute', top: 24, right: 24,
                background: 'none', border: 'none',
                color: 'var(--text-lo)', fontSize: '1.75rem',
                cursor: 'pointer', lineHeight: 1, transition: 'color 0.2s',
              }}
            >
              ×
            </button>

            {/* Language switcher */}
            <div className="sidebar-lang">
              <LanguageSwitcher variant="dark" />
            </div>

            {/* Nav links */}
            <ul className="nav-links">
              {menuLinks.map((item, i) => (
                <motion.li
                  key={`${item.href}-${i}`}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.06, duration: 0.35, ease: 'easeOut' }}
                >
                  <Link href={item.href} onClick={() => setIsOpen(false)}>
                    {label(item)}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="nav-spacer" />
    </>
  );
}
