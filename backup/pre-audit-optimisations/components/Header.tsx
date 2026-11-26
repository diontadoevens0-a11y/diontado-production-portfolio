import {Menu, X} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';
import type {BrandAssets, GitHubRepoConfig} from '../types/gallery';
import {ResilientImage} from './ResilientImage';

interface HeaderProps {
  brandAssets: BrandAssets;
  repoConfig: GitHubRepoConfig | null;
  activeView?: 'home' | 'category' | 'tarifs' | 'reservation';
  onNavigateSection: (sectionId: string) => void;
  onOpenTarifs: () => void;
  onOpenReservation: (prestation?: string, formulaId?: string) => void;
}

type NavKind = 'section' | 'tarifs' | 'reservation';

const NAV_ITEMS: Array<{id: string; label: string; kind: NavKind}> = [
  {id: 'accueil', label: 'Accueil', kind: 'section'},
  {id: 'realisations', label: 'Portfolio', kind: 'section'},
  {id: 'videos', label: 'Vidéos', kind: 'section'},
  {id: 'tarifs', label: 'Tarifs', kind: 'tarifs'},
  {id: 'apropos', label: 'À propos', kind: 'section'},
  {id: 'services', label: 'Services', kind: 'section'},
];

export function Header({
  brandAssets,
  repoConfig,
  activeView = 'home',
  onNavigateSection,
  onOpenTarifs,
  onOpenReservation,
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
  }, []);

  const handleLinkClick = (sectionId: string, kind: NavKind = 'section') => {
    setMobileOpen(false);
    if (kind === 'tarifs') {
      onOpenTarifs();
      return;
    }
    if (kind === 'reservation') {
      onOpenReservation();
      return;
    }
    onNavigateSection(sectionId);
  };

  const getHrefForItem = (item: {id: string; kind: NavKind}) => {
    if (item.kind === 'tarifs') return '#/tarifs';
    if (item.kind === 'reservation') return '#/reservation';
    return `#${item.id}`;
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#09090B]/88 backdrop-blur-md">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-white/5"
      >
        <div
          ref={progressBarRef}
          className="h-full w-full origin-left scale-x-0 bg-gradient-to-r from-[#9E6E3B] via-[#E7CA91] to-[#D4AF6A] will-change-transform"
        />
      </div>

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1 : Logo / Wordmark */}
        <a
          href="#accueil"
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick('accueil');
          }}
          aria-label="DIONTADO PRODUCTION — Accueil"
          className="flex items-center gap-3 whitespace-nowrap shrink-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF6A]"
        >
          {activeLogo && activeLogo.url ? (
            <span className="block h-8 max-w-[160px] overflow-hidden">
              <ResilientImage
                item={activeLogo}
                repoConfig={repoConfig}
                loading="eager"
                alt="DIONTADO PRODUCTION"
                className="h-8 w-auto object-contain"
              />
            </span>
          ) : (
            <span className="font-display text-lg font-semibold tracking-[0.14em] text-white whitespace-nowrap shrink-0">
              DIONTADO PRODUCTION
            </span>
          )}
        </a>

        {/* Zone 2 : Navigation principale */}
        <nav
          aria-label="Navigation principale"
          className="hidden md:flex flex-1 items-center justify-center gap-7 lg:gap-11 text-sm font-medium text-stone-300"
        >
          {NAV_ITEMS.map((item) => {
            const isItemActive = item.kind === 'tarifs' && activeView === 'tarifs';
            return (
              <a
                key={item.id}
                href={getHrefForItem(item)}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(item.id, item.kind);
                }}
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

        {/* Zone 3 : Action principale Réserver + Menu mobile */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="#/reservation"
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick('reservation', 'reservation');
            }}
            aria-current={activeView === 'reservation' ? 'page' : undefined}
            className={`inline-flex h-10 items-center justify-center rounded-md px-4 text-xs font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF6A] whitespace-nowrap shrink-0 ${
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
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/15 text-stone-200 transition-colors hover:border-[#D4AF6A] md:hidden"
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
              {id: 'reservation', label: 'Réserver', kind: 'reservation' as const},
              {id: 'contact', label: 'Contact', kind: 'section' as const},
            ].map((item) => (
              <a
                key={item.id}
                href={getHrefForItem(item)}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(item.id, item.kind);
                }}
                className="py-3 font-display text-2xl font-medium text-white transition-colors hover:text-[#E7CA91]"
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
