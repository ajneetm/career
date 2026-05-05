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
  const toggleMenu = () => setIsSidebarOpen(!isSidebarOpen);
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
        <div className="nav-left-section" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div className="hamburger" onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </div>

          <div className="nav-icons" style={{ display: 'flex', gap: '12px', fontSize: '22px' }}>
            {loggedIn ? (
              <>
                <Link href="/user" title="حسابي" style={{ color: 'inherit' }}>
                  <FiUser />
                </Link>
                <button
                  title="تسجيل الخروج"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: '22px', padding: 0 }}
                  onClick={async () => { await supabase.auth.signOut(); window.location.href = '/'; }}
                >
                  <FiLogOut />
                </button>
              </>
            ) : (
              <Link href="/login" title={nav.login} style={{ color: 'inherit' }}>
                <FiLogIn />
              </Link>
            )}
          </div>
        </div>

        <div className="nav-center-title">
          <h1 style={{ fontWeight: 400 }}>CAREER FOR EVERYONE</h1>
        </div>

        <div className="logo">
          <img src="/logo.png" alt="Logo" style={{ height: '40px' }} />
        </div>
      </nav>

      <div className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
        <span className="close-menu" onClick={toggleMenu}>
          &times;
        </span>

        <div className="sidebar-lang">
          <LanguageSwitcher variant="dark" />
        </div>

        <ul className="nav-links">
          {menuLinks.map((item, index) => (
            <li key={`${item.href}-${index}`}>
              <Link href={item.href} onClick={toggleMenu}>
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
