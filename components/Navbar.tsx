'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiLogIn, FiUser, FiLogOut } from 'react-icons/fi';

import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { fallbackNavigationItems, type NavigationItemDTO } from '@/lib/navigation-fallback';
import { supabase } from '@/lib/supabase/client';

export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const openMenu  = () => setIsSidebarOpen(true);
  const closeMenu = () => setIsSidebarOpen(false);
  const toggleMenu = () => setIsSidebarOpen(v => !v);
  const { locale, t } = useI18n();
  const nav = t('nav');
  const [menuLinks, setMenuLinks] = useState<NavigationItemDTO[]>(fallbackNavigationItems);
  const [loggedIn, setLoggedIn] = useState(false);

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

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setLoggedIn(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  const linkLabel = (item: NavigationItemDTO) => (locale === 'ar' ? item.labelAr : item.labelEn);

  return (
    <>
      <nav className="navbar">
        <div className="nav-left-section" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="hamburger"
            onClick={toggleMenu}
            aria-label="القائمة"
            aria-expanded={isSidebarOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div className="nav-icons" style={{ display: 'flex', gap: '4px' }}>
            {loggedIn ? (
              <>
                <Link href="/user" title="حسابي" className="nav-icon-btn">
                  <FiUser />
                </Link>
                <button
                  title="تسجيل الخروج"
                  className="nav-icon-btn"
                  onClick={async () => { await supabase.auth.signOut(); window.location.href = '/'; }}
                >
                  <FiLogOut />
                </button>
              </>
            ) : (
              <Link href="/login" title={nav.login} className="nav-icon-btn">
                <FiLogIn />
              </Link>
            )}
          </div>
        </div>

        <div className="nav-center-title">
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h1 style={{ fontWeight: 400 }}>CAREER FOR EVERYONE</h1>
          </Link>
        </div>

        <Link href="/" className="logo" aria-label="الرئيسية">
          <img src="/logo.png" alt="Logo" style={{ height: '40px' }} />
        </Link>
      </nav>

      {/* Backdrop — closes sidebar on outside tap */}
      {isSidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      <div className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
        <button className="close-menu" onClick={closeMenu} aria-label="إغلاق القائمة">
          &times;
        </button>

        <div className="sidebar-lang">
          <LanguageSwitcher variant="dark" />
        </div>

        <ul className="nav-links">
          {menuLinks.map((item, index) => (
            <li key={`${item.href}-${index}`}>
              <Link href={item.href} onClick={closeMenu}>
                {linkLabel(item)}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="nav-spacer"></div>
    </>
  );
}
