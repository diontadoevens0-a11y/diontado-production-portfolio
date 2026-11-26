import {ArrowLeft, ArrowRight, Film, FolderOpen} from 'lucide-react';
import {useMemo} from 'react';
import type {
  CmsAlbumDoc,
  GalleryItem,
  GitHubRepoConfig,
  PhotoCategoryMeta,
} from '../types/gallery';
import {ProgressBar} from './ProgressBar';
import {ResilientImage} from './ResilientImage';
import {ScrollReveal} from './ScrollReveal';
import {Tilt3DCard} from './Tilt3DCard';

interface PortfolioHubPageProps {
  categories: PhotoCategoryMeta[];
  items: GalleryItem[];
  albums: CmsAlbumDoc[];
  fallbackCover: GalleryItem;
  repoConfig: GitHubRepoConfig | null;
  galleryLoadingProgress?: {isLoading: boolean; percent: number; label: string} | null;
  onBackHome: () => void;
  onOpenCategory: (slug: string, albumId?: string) => void;
  onOpenVideos: () => void;
  onOpenReservation: (prestation?: string) => void;
  onOpenLightbox: (items: GalleryItem[], index: number) => void;
  onDimensionsLoad: (id: string, width: number, height: number) => void;
}

export function PortfolioHubPage({
  categories,
  items,
  albums,
  fallbackCover,
  repoConfig,
  galleryLoadingProgress,
  onBackHome,
  onOpenCategory,
  onOpenVideos,
  onOpenReservation,
  onOpenLightbox,
  onDimensionsLoad,
}: PortfolioHubPageProps) {
  const categoryCards = useMemo(() => {
    return categories.map((meta) => {
      const catItems = items.filter(
        (item) => item.folder.toLowerCase() === meta.folderMatch.toLowerCase()
      );
      const catAlbums = albums
        .filter((a) => a.published && a.category.toLowerCase() === meta.folderMatch.toLowerCase())
        .sort((a, b) => a.sortOrder - b.sortOrder);

      const customCoverItem: GalleryItem | null = meta.coverUrl
        ? {
            id: `cover-${meta.slug}`,
            name: meta.title,
            fileName: `${meta.slug}.jpg`,
            path: meta.slug,
            folder: meta.folderMatch,
            extension: 'JPG',
            size: 0,
            url: meta.coverUrl,
            githubUrl: meta.coverUrl,
            role: 'cover',
          }
        : null;

      const cover =
        customCoverItem ||
        catItems.find((i) => i.featured) ||
        catItems[0] ||
        (meta.coverFile
          ? items.find((i) => i.fileName.toLowerCase() === meta.coverFile?.toLowerCase())
          : undefined) ||
        null;

      return {meta, catItems, catAlbums, cover};
    });
  }, [albums, categories, items]);

  const curatedContactSheet = useMemo(() => {
    const cmsPriority = items.filter((item) => item.isCmsManaged);
    const curatedFileNames = [
      'portrait-01.jpg',
      'culture-01.jpg',
      'mariage-01.jpg',
      'publicite-01.jpg',
      'culture-03.jpg',
      'publicite-06.jpg',
    ];
    const baseline = curatedFileNames
      .map((f) => items.find((item) => item.fileName.toLowerCase() === f))
      .filter((item): item is GalleryItem => Boolean(item));
    const merged: GalleryItem[] = [];
    for (const item of [...cmsPriority, ...baseline, ...items]) {
      if (!merged.some((m) => m.id === item.id)) {
        merged.push(item);
      }
      if (merged.length >= 6) break;
    }
    return merged;
  }, [items]);

  return (
    <main id="mainContent" tabIndex={-1} className="page-enter min-h-screen bg-[#09090B] focus:outline-none">
      {/* Barre contextuelle */}
      <div className="border-b border-white/10 bg-[#0E0E13]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-[#F5F2EB] transition-colors hover:border-[#D4AF6A] hover:text-[#E7CA91] whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Retour à l’accueil</span>
          </button>

          <p className="hidden font-mono text-xs uppercase tracking-[0.18em] text-stone-400 sm:block">
            Portfolio Photographique · {items.length} créations publiées
          </p>

          <a
            href="/videos"
            onClick={(e) => {
              if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                e.preventDefault();
                onOpenVideos();
              }
            }}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-[#D4AF6A]/45 bg-[#D4AF6A]/10 px-4 text-xs font-semibold text-[#E7CA91] transition-colors hover:bg-[#D4AF6A]/20 whitespace-nowrap shrink-0"
          >
            <Film className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Voir les vidéos</span>
          </a>
        </div>
      </div>

      {galleryLoadingProgress?.isLoading && (
        <div className="border-b border-white/10 bg-[#0B0B0F] px-4 py-3 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <ProgressBar
              size="sm"
              value={galleryLoadingProgress.percent}
              label="Chargement des galeries photographiques"
              detail={galleryLoadingProgress.label}
            />
          </div>
        </div>
      )}

      {/* En-tête Portfolio */}
      <section className="border-b border-white/10 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 border-b border-white/10 pb-8 lg:flex-row lg:items-end">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#D4AF6A]">
                PORTFOLIO PHOTOGRAPHIQUE · COLLECTIONS OFFICIELLES
              </p>
              <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-white text-balance sm:text-5xl lg:text-6xl">
                Mon travail
              </h1>
            </div>
            <p className="max-w-xl text-xs leading-relaxed text-stone-300 sm:text-sm">
              Deux univers photographiques complémentaires pour immortaliser vos accomplissements académiques et vos projets professionnels, culturels ou événementiels.
            </p>
          </div>

          {/* Diptyque Cinéma : uniquement SOUTENANCE et PHOTOGRAPHIE PROFESSIONNELLE */}
          <div
            aria-label="Catégories photographiques"
            className="perspective-stage mt-10 grid gap-6 lg:grid-cols-12"
          >
            {categoryCards.map(({meta, catItems, catAlbums, cover}, idx) => {
              const isFeaturedPro = meta.slug === 'photographie-professionnelle';
              const cardCover = cover || fallbackCover;

              return (
                <ScrollReveal
                  key={meta.slug}
                  delay={idx * 0.08}
                  yOffset={20}
                  duration={0.55}
                  className={isFeaturedPro ? 'lg:col-span-7' : 'lg:col-span-5'}
                >
                  <Tilt3DCard maxTilt={4} className="h-full rounded-2xl">
                    <article className="group relative flex min-h-[430px] flex-col justify-end overflow-hidden rounded-2xl border border-white/12 bg-[#121217] transition-colors hover:border-[#D4AF6A]/65 sm:min-h-[470px]">
                      <div className="absolute inset-0 z-0">
                        {cardCover && cardCover.url ? (
                          <ResilientImage
                            item={cardCover}
                            repoConfig={repoConfig}
                            loading="lazy"
                            className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 ${
                              catItems.length === 0 && !meta.coverUrl ? 'opacity-40' : ''
                            }`}
                          />
                        ) : (
                          <div
                            aria-hidden="true"
                            className={`h-full w-full bg-gradient-to-br ${meta.accentTone}`}
                          />
                        )}
                      </div>

                      <div
                        aria-hidden="true"
                        className="absolute inset-0 z-[1] bg-gradient-to-t from-[#09090B] via-[#09090B]/70 to-[#09090B]/25"
                      />
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_top_right,rgba(212,175,106,0.16),transparent_55%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      />

                      <div className="relative z-10 flex h-full flex-col justify-between p-7 sm:p-8">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#E7CA91]">
                            0{idx + 1} · Collection
                          </span>
                          <span className="rounded-md border border-white/15 bg-[#09090B]/75 px-2.5 py-1 font-mono text-[11px] text-stone-200 tabular-nums backdrop-blur-sm">
                            {catItems.length > 0
                              ? `${catItems.length} ${catItems.length > 1 ? 'photographies' : 'photographie'}`
                              : 'Sur demande'}
                          </span>
                        </div>

                        <div className="mt-10">
                          <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#D4AF6A]">
                            {meta.subtitle}
                          </p>
                          <h2 className="mt-2 font-display text-3xl font-semibold leading-tight text-white transition-colors group-hover:text-[#E7CA91] sm:text-4xl">
                            {meta.title}
                          </h2>
                          <p className="mt-3 max-w-xl text-xs leading-relaxed text-stone-300 sm:text-sm">
                            {meta.description}
                          </p>

                          {catAlbums.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {catAlbums.map((album) => (
                                <button
                                  key={album.id}
                                  type="button"
                                  onClick={() => onOpenCategory(meta.slug, album.id)}
                                  className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-[#09090B]/70 px-2.5 py-1 text-[11px] text-stone-200 transition-colors hover:border-[#D4AF6A] hover:text-[#E7CA91]"
                                >
                                  <FolderOpen className="h-3 w-3 text-[#D4AF6A]" aria-hidden="true" />
                                  <span>{album.title}</span>
                                </button>
                              ))}
                            </div>
                          )}

                          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-white/10 pt-5">
                            <a
                              href={`/portfolio/${meta.slug}`}
                              onClick={(e) => {
                                if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                                  e.preventDefault();
                                  onOpenCategory(meta.slug);
                                }
                              }}
                              className="inline-flex h-10 items-center gap-2 rounded-md bg-[#D4AF6A] px-4 text-xs font-semibold uppercase tracking-[0.08em] text-[#0B0A09] transition-colors hover:bg-[#E7CA91] whitespace-nowrap shrink-0"
                            >
                              <span>Ouvrir la galerie</span>
                              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                            </a>
                            <button
                              type="button"
                              onClick={() => onOpenReservation(meta.prestationValue)}
                              className="inline-flex h-10 items-center gap-2 rounded-md border border-white/20 bg-[#09090B]/60 px-4 text-xs font-semibold text-[#F5F2EB] transition-colors hover:border-[#D4AF6A] hover:text-[#E7CA91] whitespace-nowrap shrink-0"
                            >
                              <span>Réserver</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  </Tilt3DCard>
                </ScrollReveal>
              );
            })}
          </div>

          {/* Planche contact éditoriale */}
          {curatedContactSheet.length > 0 && (
            <div className="mt-14 border-t border-white/10 pt-10">
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#D4AF6A]">
                    PLANCHE CONTACT · APERÇU IMMÉDIAT
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-semibold text-white sm:text-3xl">
                    Sélection mise en avant
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenCategory('photographie-professionnelle')}
                  className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#E7CA91] transition-colors hover:text-white whitespace-nowrap shrink-0"
                >
                  <span>Voir toute la galerie professionnelle</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                {curatedContactSheet.map((photo, idx) => {
                  const globalIdx = items.findIndex((i) => i.id === photo.id);
                  const openIdx = globalIdx >= 0 ? globalIdx : 0;
                  return (
                    <ScrollReveal
                      key={`portfolio-sheet-${photo.id}`}
                      delay={idx * 0.055}
                      yOffset={18}
                      duration={0.5}
                    >
                      <button
                        type="button"
                        onClick={() => onOpenLightbox(items, openIdx)}
                        aria-label={`Agrandir ${photo.name}`}
                        className="group relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-white/10 bg-[#121217] text-left transition-colors hover:border-[#D4AF6A]/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF6A]"
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
                          className="absolute inset-0 bg-gradient-to-t from-[#09090B]/90 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        />
                        <span className="absolute inset-x-0 bottom-0 p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          <span className="block truncate font-display text-sm font-semibold leading-tight text-white">
                            {photo.name}
                          </span>
                        </span>
                      </button>
                    </ScrollReveal>
                  );
                })}
              </div>
            </div>
          )}

          {/* Passerelle vers le Portfolio Vidéo */}
          <div className="mt-14 flex flex-col items-start justify-between gap-6 rounded-2xl border border-[#D4AF6A]/30 bg-[#121217] p-7 md:flex-row md:items-center">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#D4AF6A]">
                CINÉMA &amp; AUDIOVISUEL
              </p>
              <h2 className="mt-1.5 font-display text-2xl font-semibold text-white sm:text-3xl">
                Découvrez nos réalisations vidéo &amp; le Showreel officiel.
              </h2>
            </div>
            <button
              type="button"
              onClick={onOpenVideos}
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-md bg-[#D4AF6A] px-5 text-xs font-semibold uppercase tracking-[0.08em] text-[#0B0A09] transition-colors hover:bg-[#E7CA91] whitespace-nowrap"
            >
              <Film className="h-4 w-4" aria-hidden="true" />
              <span>Accéder aux vidéos</span>
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
