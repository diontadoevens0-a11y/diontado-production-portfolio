import {ArrowRight, Calendar, Images} from 'lucide-react';
import type {GalleryItem, GitHubRepoConfig} from '../types/gallery';
import {ResilientImage} from './ResilientImage';
import {ScrollReveal} from './ScrollReveal';

interface HomePageProps {
  coverItem: GalleryItem;
  heroLogo: GalleryItem | null;
  curatedPhotos: GalleryItem[];
  totalPhotosCount: number;
  repoConfig: GitHubRepoConfig | null;
  onNavigatePath: (path: string) => void;
  onOpenPortfolio: () => void;
  onOpenReservation: () => void;
  onOpenLightbox: (items: GalleryItem[], index: number) => void;
  onDimensionsLoad: (id: string, width: number, height: number) => void;
}

const QUICK_PAGES = [
  {path: '/portfolio', label: 'Portfolio Photo'},
  {path: '/videos', label: 'Vidéos & Showreel'},
  {path: '/services', label: 'Services'},
  {path: '/tarifs', label: 'Tarifs'},
  {path: '/apropos', label: 'À propos'},
  {path: '/contact', label: 'Contact'},
  {path: '/admin', label: 'Administration'},
];

export function HomePage({
  coverItem,
  heroLogo,
  curatedPhotos,
  totalPhotosCount,
  repoConfig,
  onNavigatePath,
  onOpenPortfolio,
  onOpenReservation,
  onOpenLightbox,
  onDimensionsLoad,
}: HomePageProps) {
  const previewStrip = curatedPhotos.slice(0, 4);

  return (
    <main id="mainContent" tabIndex={-1} className="page-enter focus:outline-none">
      {/* Couverture cinématographique épurée */}
      <section className="relative flex min-h-[84vh] items-end overflow-hidden border-b border-white/10 py-16 lg:py-24">
        <div className="absolute inset-0 z-0">
          <ResilientImage
            item={coverItem}
            repoConfig={repoConfig}
            loading="eager"
            className="cinema-kenburns h-full w-full object-cover"
          />
        </div>

        <div
          aria-hidden="true"
          className="absolute inset-0 z-[1] bg-gradient-to-t from-[#09090B] via-[#09090B]/60 to-[#09090B]/45"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,106,0.18),transparent_58%)]"
        />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            {heroLogo && heroLogo.url && (
              <div className="mb-6 h-10 max-w-[220px] overflow-hidden">
                <ResilientImage
                  item={heroLogo}
                  repoConfig={repoConfig}
                  loading="eager"
                  alt="DIONTADO PRODUCTION"
                  className="h-10 w-auto object-contain"
                />
              </div>
            )}

            <p className="font-mono text-xs uppercase tracking-[0.26em] text-[#E7CA91]">
              DIONTADO PRODUCTION · DAKAR &amp; INTERNATIONAL
            </p>

            <h1 className="mt-3 max-w-2xl font-display text-5xl font-semibold leading-[1.02] tracking-tight text-white text-balance sm:text-6xl lg:text-7xl">
              L’image raconte. Le cinéma fait ressentir.
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-relaxed text-stone-200 sm:text-base">
              Photographie professionnelle et réalisation vidéo sur mesure depuis Dakar.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <a
                href="/portfolio"
                onClick={(e) => {
                  if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                    e.preventDefault();
                    onOpenPortfolio();
                  }
                }}
                className="inline-flex h-12 items-center justify-center gap-2.5 rounded-md bg-[#D4AF6A] px-6 text-xs font-semibold uppercase tracking-[0.12em] text-[#0B0A09] transition-colors hover:bg-[#E7CA91] whitespace-nowrap shrink-0"
              >
                <Images className="h-4 w-4" aria-hidden="true" />
                <span>Découvrir le portfolio</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>

              <a
                href="/reservation"
                onClick={(e) => {
                  if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                    e.preventDefault();
                    onOpenReservation();
                  }
                }}
                className="inline-flex h-12 items-center justify-center gap-2.5 rounded-md border border-white/25 bg-[#09090B]/65 px-6 text-xs font-semibold uppercase tracking-[0.12em] text-[#F5F2EB] backdrop-blur-sm transition-colors hover:border-[#D4AF6A] hover:text-[#E7CA91] whitespace-nowrap shrink-0"
              >
                <Calendar className="h-4 w-4 text-[#D4AF6A]" aria-hidden="true" />
                <span>Réserver une prestation</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Barre d'accès rapide aux pages (toujours visible sur mobile et aperçus étroits) */}
      <nav
        aria-label="Accès rapide aux pages"
        className="border-b border-white/10 bg-[#0E0E13]"
      >
        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-3.5 sm:px-6 lg:px-8">
          {QUICK_PAGES.map((item) => (
            <a
              key={item.path}
              href={item.path}
              onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                  e.preventDefault();
                  onNavigatePath(item.path);
                }
              }}
              className="inline-flex h-9 items-center rounded-md border border-white/12 bg-[#14141A] px-3.5 text-xs font-medium text-stone-200 transition-colors hover:border-[#D4AF6A]/70 hover:text-[#E7CA91] whitespace-nowrap shrink-0"
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      {/* Sélection visuelle sobre (aperçu vers le portfolio complet) */}
      {previewStrip.length > 0 && (
        <section className="bg-[#09090B] py-14 lg:py-18">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#D4AF6A]">
                  SÉLECTION DU STUDIO
                </p>
                <h2 className="mt-1 font-display text-3xl font-semibold text-white sm:text-4xl">
                  Aperçu des créations récentes
                </h2>
              </div>

              <a
                href="/portfolio"
                onClick={(e) => {
                  if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                    e.preventDefault();
                    onOpenPortfolio();
                  }
                }}
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#E7CA91] transition-colors hover:text-white whitespace-nowrap shrink-0"
              >
                <span>Explorer le portfolio ({totalPhotosCount})</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
              {previewStrip.map((photo, idx) => (
                <ScrollReveal
                  key={`home-strip-${photo.id}`}
                  delay={idx * 0.07}
                  yOffset={18}
                  duration={0.5}
                >
                  <button
                    type="button"
                    onClick={() => onOpenLightbox(previewStrip, idx)}
                    aria-label={`Agrandir ${photo.name}`}
                    className="group relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-white/10 bg-[#121217] text-left transition-colors hover:border-[#D4AF6A]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF6A]"
                  >
                    <ResilientImage
                      item={photo}
                      repoConfig={repoConfig}
                      loading="lazy"
                      onDimensionsLoad={onDimensionsLoad}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-[#09090B]/90 via-transparent to-transparent opacity-80 transition-opacity duration-300 sm:opacity-0 sm:group-hover:opacity-100"
                    />
                    <span className="absolute inset-x-0 bottom-0 p-4 opacity-100 transition-opacity duration-300 sm:opacity-0 sm:group-hover:opacity-100">
                      <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-[#D4AF6A]">
                        {photo.folder}
                      </span>
                      <span className="mt-0.5 block truncate font-display text-lg font-semibold text-white">
                        {photo.name}
                      </span>
                    </span>
                  </button>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
