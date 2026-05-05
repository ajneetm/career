'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiLogIn, FiGrid, FiLogOut } from 'react-icons/fi';

import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { fallbackNavigationItems, type NavigationItemDTO } from '@/lib/navigation-fallback';
import { supabase } from '@/lib/supabase/client';

const FULLSCREEN_ROUTES = ['/user', '/admin'];

export default function Navbar() {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const openMenu  = () => setIsSidebarOpen(true);
  const closeMenu = () => setIsSidebarOpen(false);
  const toggleMenu = () => setIsSidebarOpen(v => !v);

  const { locale, t } = useI18n();
  const nav = t('nav');
  const [menuLinks, setMenuLinks] = useState<NavigationItemDTO[]>(fallbackNavigationItems);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    supabase.auth.getUser().then(({ data }) => {
      setLoggedIn(!!data.user);
      setUserName(data.user?.user_metadata?.name ?? '');
      setUserEmail(data.user?.email ?? '');
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setLoggedIn(!!session?.user);
      setUserName(session?.user?.user_metadata?.name ?? '');
      setUserEmail(session?.user?.email ?? '');
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!dropdownOpen) return;
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  // Hide on full-screen pages (after all hooks)
  if (FULLSCREEN_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))) {
    return null;
  }

  const linkLabel = (item: NavigationItemDTO) => (locale === 'ar' ? item.labelAr : item.labelEn);
  const initial = (userName || userEmail)[0]?.toUpperCase() ?? '؟';

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
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                {/* Avatar button */}
                <button
                  className="nav-icon-btn"
                  onClick={() => setDropdownOpen(v => !v)}
                  aria-label="حسابي"
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1e5fdc, #6366f1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.72rem', fontWeight: 800, color: 'white',
                  }}>
                    {initial}
                  </div>
                </button>

                {/* Dropdown menu */}
                {dropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    insetInlineStart: 0,
                    width: 220,
                    background: 'white',
                    borderRadius: 16,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.13)',
                    border: '1px solid #e2e8f0',
                    zIndex: 300,
                    overflow: 'hidden',
                    direction: 'rtl',
                  }}>
                    {/* User info header */}
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #1e5fdc, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 800, color: 'white', flexShrink: 0 }}>
                          {initial}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          {userName && (
                            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {userName}
                            </div>
                          )}
                          <div style={{ fontSize: '0.74rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {userEmail}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ padding: '6px' }}>
                      <Link
                        href="/user"
                        onClick={() => setDropdownOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, textDecoration: 'none', color: '#374151', fontSize: '0.88rem', fontWeight: 600 }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <FiGrid size={15} style={{ color: '#1e5fdc', flexShrink: 0 }} />
                        <span>لوحة التحكم</span>
                      </Link>

                      <div style={{ height: 1, background: '#f1f5f9', margin: '4px 0' }} />

                      <button
                        onClick={async () => {
                          setDropdownOpen(false);
                          await supabase.auth.signOut();
                          window.location.href = '/';
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, width: '100%', textAlign: 'right', border: 'none', background: 'transparent', cursor: 'pointer', color: '#dc2626', fontSize: '0.88rem', fontWeight: 600, fontFamily: 'inherit' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#fef2f2')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <FiLogOut size={15} style={{ flexShrink: 0 }} />
                        <span>تسجيل الخروج</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
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

      {isSidebarOpen && (
        <div className="sidebar-backdrop" onClick={closeMenu} aria-hidden="true" />
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
