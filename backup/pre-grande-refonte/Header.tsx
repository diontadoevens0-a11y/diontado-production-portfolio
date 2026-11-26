import {Menu, X} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';
import type {BrandAssets, GitHubRepoConfig} from '../types/gallery';
import {ResilientImage} from './ResilientImage';

interface HeaderProps {
  brandAssets: BrandAssets;
  repoConfig: GitHubRepoConfig | null;
}

const NAV_ITEMS = [
  {href: '#accueil', label: 'Accueil'},
  {href: '#apropos', label: 'À propos'},
  {href: '#services', label: 'Services'},
  {href: '#realisations', label: 'Photo'},
  {href: '#videos', label: 'Vidéo'},
];

export function Header({brandAssets, repoConfig}: HeaderProps) {
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

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#070708]/90 backdrop-blur-md">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-white/5"
      >
        <div
          ref={progressBarRef}
          className="h-full w-full origin-left scale-x-0 bg-gradient-to-r from-[#C8A46B] via-[#DFBE89] to-[#C8A46B] will-change-transform"
        />
      </div>

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1 : Brand mark + single-line wordmark */}
        <a
          href="#accueil"
          aria-label="DIONTADO PRODUCTION — Accueil"
          className="flex items-center gap-3 whitespace-nowrap shrink-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A46B]"
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

        {/* Zone 2 : 5 concise single-line links */}
        <nav
          aria-label="Navigation principale"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-300"
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="whitespace-nowrap shrink-0 transition-colors duration-150 hover:text-[#DFBE89] hover:underline hover:underline-offset-8"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Zone 3 : Primary CTA + Mobile drawer toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="#contact"
            className="inline-flex h-10 items-center justify-center rounded-md bg-[#C8A46B] px-4 text-xs font-semibold text-[#0B0A09] transition-colors duration-150 hover:bg-[#DFBE89] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A46B] whitespace-nowrap shrink-0"
          >
            Réserver
          </a>
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={mobileOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/15 text-stone-200 transition-colors hover:border-[#C8A46B] md:hidden"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <nav
          aria-label="Navigation mobile"
          className="border-t border-white/10 bg-[#070708]/98 px-4 py-5 md:hidden"
        >
          <div className="flex flex-col divide-y divide-white/10">
            {[...NAV_ITEMS, {href: '#contact', label: 'Contact / Réservation'}].map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="py-3 font-display text-2xl font-medium text-white transition-colors hover:text-[#DFBE89]"
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
