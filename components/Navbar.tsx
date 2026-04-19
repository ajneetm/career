'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiLogIn, FiUser } from 'react-icons/fi';

import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { fallbackNavigationItems, type NavigationItemDTO } from '@/lib/navigation-fallback';

export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleMenu = () => setIsSidebarOpen(!isSidebarOpen);
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
    return () => {
      cancelled = true;
    };
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
            <Link href="/login" title={nav.login} style={{ color: 'inherit' }}>
              <FiLogIn />
            </Link>
            <Link href="/profile" title={nav.profile} style={{ color: 'inherit' }}>
              <FiUser />
            </Link>
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
