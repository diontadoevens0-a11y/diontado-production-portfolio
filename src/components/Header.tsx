import {Lock, Menu, X} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';
import type {BrandAssets, GitHubRepoConfig} from '../types/gallery';
import {ResilientImage} from './ResilientImage';

export type ActiveRouteKind =
  | 'home'
  | 'portfolio'
  | 'category'
  | 'videos'
  | 'services'
  | 'tarifs'
  | 'apropos'
  | 'contact'
  | 'reservation'
  | 'admin';

interface HeaderProps {
  brandAssets: BrandAssets;
  repoConfig: GitHubRepoConfig | null;
  activeView?: ActiveRouteKind;
  onNavigatePath: (path: string) => void;
}

const NAV_ITEMS: Array<{path: string; label: string; matches: ActiveRouteKind[]}> = [
  {path: '/', label: 'Accueil', matches: ['home']},
  {path: '/portfolio', label: 'Portfolio', matches: ['portfolio', 'category']},
  {path: '/videos', label: 'Vidéos', matches: ['videos']},
  {path: '/services', label: 'Services', matches: ['services']},
  {path: '/tarifs', label: 'Tarifs', matches: ['tarifs']},
  {path: '/apropos', label: 'À propos', matches: ['apropos']},
  {path: '/contact', label: 'Contact', matches: ['contact']},
];

export function Header({
  brandAssets,
  repoConfig,
  activeView = 'home',
  onNavigatePath,
}: HeaderProps) {
  const activeLogo = brandAssets.logoHeaderDark || brandAssets.logoHeaderLight;
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let rafId = 0;

    const updateProgress = () => {
      rafId = 0;
      const bar = progressBarRef.current;
      if (!bar) return;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
      bar.style.transform = `scaleX(${progress.toFixed(4)})`;
    };

    const scheduleUpdate = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(updateProgress);
      }
    };

    updateProgress();
    window.addEventListener('scroll', scheduleUpdate, {passive: true});
    window.addEventListener('resize', scheduleUpdate, {passive: true});

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, [activeView]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  const handleNavClick = (event: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    setMobileOpen(false);
    onNavigatePath(path);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#09090B]/92 backdrop-blur-md">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-white/5"
      >
        <div
          ref={progressBarRef}
          className="h-full w-full origin-left scale-x-0 bg-gradient-to-r from-[#9E6E3B] via-[#E7CA91] to-[#D4AF6A] will-change-transform"
        />
      </div>

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:gap-6 lg:px-8">
        {/* Logo / Wordmark */}
        <a
          href="/"
          onClick={(e) => handleNavClick(e, '/')}
          aria-label="DIONTADO PRODUCTION — Accueil"
          className="flex items-center gap-3 whitespace-nowrap shrink-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF6A]"
        >
          {activeLogo && activeLogo.url ? (
            <span className="block h-7 max-w-[130px] overflow-hidden lg:h-8 lg:max-w-[160px]">
              <ResilientImage
                item={activeLogo}
                repoConfig={repoConfig}
                loading="eager"
                alt="DIONTADO PRODUCTION"
                className="h-7 w-auto object-contain lg:h-8"
              />
            </span>
          ) : (
            <span className="font-display text-base font-semibold tracking-[0.14em] text-white whitespace-nowrap shrink-0 lg:text-lg">
              DIONTADO PRODUCTION
            </span>
          )}
        </a>

        {/* Barre de navigation principale (visible dès md: 768px+) */}
        <nav
          aria-label="Navigation principale"
          className="hidden md:flex flex-1 items-center justify-center gap-3.5 lg:gap-6 xl:gap-8 text-xs lg:text-sm font-medium text-stone-300"
        >
          {NAV_ITEMS.map((item) => {
            const isItemActive = item.matches.includes(activeView);
            return (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => handleNavClick(e, item.path)}
                aria-current={isItemActive ? 'page' : undefined}
                className={`whitespace-nowrap shrink-0 transition-colors duration-150 hover:text-[#E7CA91] hover:underline hover:underline-offset-8 ${
                  isItemActive ? 'text-[#E7CA91] underline underline-offset-8' : ''
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Actions : Admin + Réserver + Menu mobile */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="/admin"
            onClick={(e) => handleNavClick(e, '/admin')}
            aria-current={activeView === 'admin' ? 'page' : undefined}
            className={`hidden sm:inline-flex h-9 items-center justify-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF6A] whitespace-nowrap shrink-0 ${
              activeView === 'admin'
                ? 'border-[#D4AF6A] bg-[#D4AF6A]/15 text-[#E7CA91]'
                : 'border-white/15 bg-white/5 text-stone-200 hover:border-[#D4AF6A]/65 hover:text-[#E7CA91]'
            }`}
          >
            <Lock className="h-3.5 w-3.5 text-[#D4AF6A]" aria-hidden="true" />
            <span>Admin</span>
          </a>

          <a
            href="/reservation"
            onClick={(e) => handleNavClick(e, '/reservation')}
            aria-current={activeView === 'reservation' ? 'page' : undefined}
            className={`inline-flex h-9 items-center justify-center rounded-md px-3.5 text-xs font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF6A] whitespace-nowrap shrink-0 lg:h-10 lg:px-4 ${
              activeView === 'reservation'
                ? 'bg-[#E7CA91] text-[#0B0A09] ring-2 ring-[#D4AF6A]/60'
                : 'bg-[#D4AF6A] text-[#0B0A09] hover:bg-[#E7CA91]'
            }`}
          >
            Réserver
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={mobileOpen}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/15 text-stone-200 transition-colors hover:border-[#D4AF6A] md:hidden"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation mobile */}
      {mobileOpen && (
        <nav
          aria-label="Navigation mobile"
          className="border-t border-white/10 bg-[#09090B]/98 px-4 py-5 md:hidden"
        >
          <div className="flex flex-col divide-y divide-white/10">
            {[
              ...NAV_ITEMS,
              {path: '/reservation', label: 'Réserver', matches: ['reservation'] as ActiveRouteKind[]},
              {path: '/admin', label: 'Espace Admin', matches: ['admin'] as ActiveRouteKind[]},
            ].map((item) => {
              const isItemActive = item.matches.includes(activeView);
              return (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => handleNavClick(e, item.path)}
                  aria-current={isItemActive ? 'page' : undefined}
                  className={`py-3 font-display text-2xl font-medium transition-colors hover:text-[#E7CA91] ${
                    isItemActive ? 'text-[#E7CA91]' : 'text-white'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
