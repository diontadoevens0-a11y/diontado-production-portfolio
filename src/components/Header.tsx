import type {BrandAssets, GitHubRepoConfig} from '../types/gallery';
import {ResilientImage} from './ResilientImage';

interface HeaderProps {
  brandAssets: BrandAssets;
  repoConfig: GitHubRepoConfig | null;
}

export function Header({brandAssets, repoConfig}: HeaderProps) {
  const activeLogo = brandAssets.logoHeaderDark || brandAssets.logoHeaderLight;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#070708]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        <a
          href="#accueil"
          className="flex items-center whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A46B] rounded"
        >
          {activeLogo && activeLogo.url ? (
            <span className="block h-9 max-w-[200px] overflow-hidden">
              <ResilientImage
                item={activeLogo}
                repoConfig={repoConfig}
                loading="eager"
                alt="DIONTADO PRODUCTION"
                className="h-9 w-auto object-contain"
              />
            </span>
          ) : (
            <span className="font-display text-xl font-semibold tracking-wider text-[#F5F3EE]">
              DIONTADO PRODUCTION
            </span>
          )}
        </a>

        <nav
          aria-label="Navigation principale"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-300"
        >
          <a
            href="#accueil"
            className="hover:text-[#DFBE89] transition-colors duration-150 whitespace-nowrap shrink-0"
          >
            Accueil
          </a>
          <a
            href="#apropos"
            className="hover:text-[#DFBE89] transition-colors duration-150 whitespace-nowrap shrink-0"
          >
            À propos
          </a>
          <a
            href="#services"
            className="hover:text-[#DFBE89] transition-colors duration-150 whitespace-nowrap shrink-0"
          >
            Services
          </a>
          <a
            href="#realisations"
            className="hover:text-[#DFBE89] transition-colors duration-150 whitespace-nowrap shrink-0"
          >
            Réalisations
          </a>
          <a
            href="#videos"
            className="hover:text-[#DFBE89] transition-colors duration-150 whitespace-nowrap shrink-0"
          >
            Vidéos
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <a
            href="#contact"
            className="rounded-md bg-[#C8A46B] px-4 py-2 text-xs font-semibold text-[#0B0A09] transition-colors duration-150 hover:bg-[#DFBE89] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A46B] whitespace-nowrap shrink-0"
          >
            Nous contacter
          </a>
        </div>
      </div>
    </header>
  );
}
