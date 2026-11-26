import {
  ArrowRight,
  Download,
  Film,
  FolderGit2,
  MessageCircle,
  Play,
} from 'lucide-react';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {CategoryPage} from './components/CategoryPage';
import {ContactSection} from './components/ContactSection';
import {GitHubConfigModal} from './components/GitHubConfigModal';
import {Header} from './components/Header';
import {LightboxModal} from './components/LightboxModal';
import {ReservationPage} from './components/ReservationPage';
import {ResilientImage} from './components/ResilientImage';
import {ScrollReveal} from './components/ScrollReveal';
import {TarifsPage} from './components/TarifsPage';
import {Tilt3DCard} from './components/Tilt3DCard';
import {
  DIONTADO_COVER_SLATE,
  DIONTADO_SLATES,
  DIONTADO_VIDEOS,
  downloadStandaloneIndexHtml,
  EMPTY_BRAND_ASSETS,
  PHOTO_CATEGORIES,
  VIDEO_CATEGORIES,
} from './data/diontadoManifest';
import {fetchGitHubGallery, parseGitHubInput} from './services/githubGallery';
import type {
  BrandAssets,
  GalleryItem,
  GitHubRepoConfig,
  GitHubRepoMeta,
  PhotoCategoryMeta,
} from './types/gallery';

const STORAGE_KEY_CONFIG = 'diontado_github_config_v1';

type AppRoute =
  | {kind: 'home'}
  | {kind: 'tarifs'}
  | {kind: 'reservation'; prestation?: string; formulaId?: string}
  | {kind: 'category'; slug: string};

function parseRouteFromHash(): AppRoute {
  if (typeof window === 'undefined') return {kind: 'home'};
  const rawHash = window.location.hash || '';
  const [rawPath, rawQuery] = rawHash.split('?');
  const hashPath = rawPath.toLowerCase().replace(/\/+$/, '');
  if (hashPath === '#/tarifs' || hashPath === '#tarifs') {
    return {kind: 'tarifs'};
  }
  if (hashPath === '#/reservation' || hashPath === '#reservation') {
    const params = new URLSearchParams(rawQuery || window.location.search || '');
    return {
      kind: 'reservation',
      prestation: params.get('prestation') || undefined,
      formulaId: params.get('formule') || undefined,
    };
  }
  const match = hashPath.match(/^#\/realisations\/([a-z0-9-]+)$/);
  if (match) {
    return {kind: 'category', slug: match[1]};
  }
  return {kind: 'home'};
}

export default function App() {
  const [items, setItems] = useState<GalleryItem[]>(DIONTADO_SLATES);
  const [brandAssets, setBrandAssets] = useState<BrandAssets>(EMPTY_BRAND_ASSETS);
  const [activeRepoConfig, setActiveRepoConfig] = useState<GitHubRepoConfig | null>(null);
  const [repoMeta, setRepoMeta] = useState<GitHubRepoMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Route courante : Accueil, Page Tarifs (#/tarifs) ou Page Catégorie (#/realisations/<slug>)
  const [activeRoute, setActiveRoute] = useState<AppRoute>(() => parseRouteFromHash());

  // Lightbox plein écran
  const [lightboxState, setLightboxState] = useState<{
    items: GalleryItem[];
    index: number;
  } | null>(null);

  // Couverture statique sans animation

  // Portfolio Photo : catégorie survolée dans la vitrine « Mon travail »
  const [selectedPortfolioSlug, setSelectedPortfolioSlug] = useState<string>(
    PHOTO_CATEGORIES[0]?.slug || 'soutenance'
  );

  // Portfolio Vidéo (Showreel + lecteur intégré + filtres)
  const [selectedVideoCategory, setSelectedVideoCategory] = useState<string>('Toutes');
  const [activeVideoIdx, setActiveVideoIdx] = useState(0);
  const [isVideoStarted, setIsVideoStarted] = useState(false);
  const videoStageRef = useRef<HTMLDivElement | null>(null);

  // Prestation supprimée : navigation directe vers Contact ou WhatsApp

  // Écoute des changements d'URL (boutons Précédent / Suivant du navigateur)
  useEffect(() => {
    const onRouteChange = () => {
      const next = parseRouteFromHash();
      setActiveRoute(next);
      if (next.kind !== 'home') {
        window.scrollTo({top: 0, behavior: 'smooth'});
      }
    };
    window.addEventListener('hashchange', onRouteChange);
    window.addEventListener('popstate', onRouteChange);
    return () => {
      window.removeEventListener('hashchange', onRouteChange);
      window.removeEventListener('popstate', onRouteChange);
    };
  }, []);

  const openCategoryPage = useCallback((slug: string) => {
    const cleanSlug = slug.toLowerCase();
    setActiveRoute({kind: 'category', slug: cleanSlug});
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', `#/realisations/${cleanSlug}`);
      window.scrollTo({top: 0, behavior: 'smooth'});
    }
  }, []);

  const openTarifsPage = useCallback(() => {
    setActiveRoute({kind: 'tarifs'});
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '#/tarifs');
      window.scrollTo({top: 0, behavior: 'smooth'});
    }
  }, []);

  const openReservationPage = useCallback((prestation?: string, formulaId?: string) => {
    setActiveRoute({kind: 'reservation', prestation, formulaId});
    if (typeof window !== 'undefined') {
      const qs = new URLSearchParams();
      if (prestation) qs.set('prestation', prestation);
      if (formulaId) qs.set('formule', formulaId);
      const suffix = qs.toString() ? `?${qs.toString()}` : '';
      window.history.pushState(null, '', `#/reservation${suffix}`);
      window.scrollTo({top: 0, behavior: 'smooth'});
    }
  }, []);

  const navigateHomeSection = useCallback((sectionId: string) => {
    setActiveRoute({kind: 'home'});
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', `#${sectionId}`);
      window.setTimeout(() => {
        if (sectionId === 'accueil') {
          window.scrollTo({top: 0, behavior: 'smooth'});
        } else {
          document.getElementById(sectionId)?.scrollIntoView({behavior: 'smooth'});
        }
      }, 40);
    }
  }, []);

  useEffect(() => {
    if (!brandAssets.logoIcon || !brandAssets.logoIcon.url || brandAssets.logoIcon.isPrivateBlob) {
      return;
    }
    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = brandAssets.logoIcon.url;
  }, [brandAssets.logoIcon]);

  const syncUrlParams = useCallback((config: GitHubRepoConfig | null, meta?: GitHubRepoMeta) => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (config) {
      url.searchParams.set('repo', `${config.owner}/${config.repo}`);
      if (meta?.activeBranch || config.branch) {
        url.searchParams.set('branch', meta?.activeBranch || config.branch || '');
      } else {
        url.searchParams.delete('branch');
      }
      if (meta?.activePath || config.path) {
        url.searchParams.set('path', meta?.activePath || config.path || '');
      } else {
        url.searchParams.delete('path');
      }
    } else {
      url.searchParams.delete('repo');
      url.searchParams.delete('branch');
      url.searchParams.delete('path');
    }
    window.history.replaceState({}, '', url.toString());
  }, []);

  const loadFromGitHub = useCallback(
    async (config: GitHubRepoConfig, persist = true): Promise<boolean> => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const {galleryItems, brandAssets: loadedBrand, meta} = await fetchGitHubGallery(config);
        const resolvedConfig: GitHubRepoConfig = {
          ...config,
          branch: meta.activeBranch,
          path: meta.activePath,
        };
        setItems(galleryItems);
        setBrandAssets(loadedBrand);
        setActiveRepoConfig(resolvedConfig);
        setRepoMeta(meta);

        if (persist) {
          localStorage.setItem(
            STORAGE_KEY_CONFIG,
            JSON.stringify({
              owner: resolvedConfig.owner,
              repo: resolvedConfig.repo,
              branch: resolvedConfig.branch,
              path: resolvedConfig.path,
            })
          );
          syncUrlParams(resolvedConfig, meta);
        }
        return true;
      } catch (err) {
        setErrorMessage(
          err instanceof Error
            ? err.message
            : 'Impossible de charger les images depuis ce dépôt GitHub.'
        );
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [syncUrlParams]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const paramRepo = params.get('repo');
    const paramBranch = params.get('branch') || undefined;
    const paramPath = params.get('path') || undefined;

    if (paramRepo) {
      const parsed = parseGitHubInput(paramRepo, paramBranch, paramPath);
      if (parsed) {
        loadFromGitHub(parsed, false);
        return;
      }
    }

    const envRepo = import.meta.env.VITE_GITHUB_REPO as string | undefined;
    if (envRepo) {
      const parsed = parseGitHubInput(
        envRepo,
        import.meta.env.VITE_GITHUB_BRANCH as string | undefined,
        import.meta.env.VITE_GITHUB_PATH as string | undefined
      );
      if (parsed) {
        loadFromGitHub(parsed, false);
        return;
      }
    }

    const savedRaw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (savedRaw) {
      try {
        const saved = JSON.parse(savedRaw) as GitHubRepoConfig;
        if (saved.owner && saved.repo) {
          loadFromGitHub(saved, false);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY_CONFIG);
      }
    }
  }, [loadFromGitHub]);

  const handleModalSubmit = async (
    rawRepo: string,
    branch: string,
    path: string,
    token: string
  ) => {
    const parsed = parseGitHubInput(rawRepo, branch, path);
    if (!parsed) {
      setErrorMessage(
        'Format non reconnu. Saisissez "utilisateur/depot" ou l’URL complète de votre dépôt GitHub.'
      );
      return;
    }
    const ok = await loadFromGitHub({...parsed, token: token.trim() || undefined});
    if (ok) setIsConfigOpen(false);
  };

  const handleResetToDemo = () => {
    setItems(DIONTADO_SLATES);
    setBrandAssets(EMPTY_BRAND_ASSETS);
    setActiveRepoConfig(null);
    setRepoMeta(null);
    setErrorMessage(null);
    localStorage.removeItem(STORAGE_KEY_CONFIG);
    syncUrlParams(null);
    setIsConfigOpen(false);
  };

  const handleDimensionsLoad = useCallback((id: string, width: number, height: number) => {
    setItems((prev) => {
      let changed = false;
      const next = prev.map((entry) => {
        if (entry.id === id && (entry.width !== width || entry.height !== height)) {
          changed = true;
          return {...entry, width, height};
        }
        return entry;
      });
      return changed ? next : prev;
    });
  }, []);

  const coverItem = brandAssets.cover || DIONTADO_COVER_SLATE;
  const heroLogo = brandAssets.logoHeaderDark || brandAssets.logoHeaderLight;

  // Données calculées pour chaque catégorie photo
  const categoryCardsData = useMemo(() => {
    return PHOTO_CATEGORIES.map((meta) => {
      const catItems = items.filter(
        (item) => item.folder.toLowerCase() === meta.folderMatch.toLowerCase()
      );
      const cover =
        catItems[0] ||
        (meta.coverFile
          ? items.find((i) => i.fileName.toLowerCase() === meta.coverFile?.toLowerCase())
          : undefined) ||
        null;
      return {meta, catItems, cover};
    });
  }, [items]);

  const activeCategoryObj: PhotoCategoryMeta | null = useMemo(() => {
    if (activeRoute.kind !== 'category') return null;
    return PHOTO_CATEGORIES.find((c) => c.slug === activeRoute.slug) || null;
  }, [activeRoute]);

  const activeCategoryItems = useMemo(() => {
    if (!activeCategoryObj) return [];
    return items.filter(
      (item) => item.folder.toLowerCase() === activeCategoryObj.folderMatch.toLowerCase()
    );
  }, [activeCategoryObj, items]);

  // Données Portfolio Vidéo
  const filteredVideos = useMemo(() => {
    if (selectedVideoCategory === 'Toutes') return DIONTADO_VIDEOS;
    return DIONTADO_VIDEOS.filter((v) => v.category === selectedVideoCategory);
  }, [selectedVideoCategory]);

  const activeVideo = DIONTADO_VIDEOS[activeVideoIdx] || DIONTADO_VIDEOS[0];

  const handlePlayVideoById = useCallback((videoId: string) => {
    const idx = DIONTADO_VIDEOS.findIndex((v) => v.id === videoId);
    if (idx >= 0) {
      setActiveVideoIdx(idx);
      setIsVideoStarted(true);
      videoStageRef.current?.scrollIntoView({behavior: 'smooth', block: 'center'});
    }
  }, []);

  return (
    <div id="accueil" className="min-h-screen bg-[#09090B] text-[#F5F2EB]">
      <a
        href="#mainContent"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('mainContent')?.focus();
          document.getElementById('mainContent')?.scrollIntoView({behavior: 'smooth'});
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-[#D4AF6A] focus:px-4 focus:py-2 focus:text-xs focus:font-semibold focus:text-[#0B0A09]"
      >
        Aller au contenu principal
      </a>

      <Header
        brandAssets={brandAssets}
        repoConfig={activeRepoConfig}
        activeView={activeRoute.kind}
        onNavigateSection={navigateHomeSection}
        onOpenTarifs={openTarifsPage}
        onOpenReservation={openReservationPage}
      />

      {/* Vue : Réservation OU Tarifs OU Catégorie Dédiée OU Page Principale */}
      {activeRoute.kind === 'reservation' ? (
        <ReservationPage
          initialPrestation={activeRoute.prestation}
          initialFormulaId={activeRoute.formulaId}
          onBackHome={() => navigateHomeSection('accueil')}
        />
      ) : activeRoute.kind === 'tarifs' ? (
        <TarifsPage
          onBackHome={() => navigateHomeSection('accueil')}
          onContact={() => navigateHomeSection('contact')}
          onReserve={openReservationPage}
        />
      ) : activeCategoryObj ? (
        <CategoryPage
          category={activeCategoryObj}
          items={activeCategoryItems}
          allGalleryItems={items}
          repoConfig={activeRepoConfig}
          onBackToRealisations={() => navigateHomeSection('realisations')}
          onOpenCategory={openCategoryPage}
          onReserve={openReservationPage}
          onOpenLightbox={(list, index) => setLightboxState({items: list, index})}
          onDimensionsLoad={handleDimensionsLoad}
        />
      ) : (
        <main id="mainContent" tabIndex={-1} className="focus:outline-none">
          {/* ======================== 1. COUVERTURE SOBRE & CINÉMATOGRAPHIQUE ======================== */}
          <section className="relative flex min-h-[88vh] items-end overflow-hidden border-b border-white/10 py-16 lg:py-24">
            <div className="absolute inset-0 z-0">
              <ResilientImage
                item={coverItem}
                repoConfig={activeRepoConfig}
                loading="eager"
                className="h-full w-full object-cover"
              />
            </div>

            <div
              aria-hidden="true"
              className="absolute inset-0 z-[1] bg-gradient-to-t from-[#09090B] via-[#09090B]/55 to-[#09090B]/50"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,106,0.16),transparent_55%)]"
            />

            <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl">
                {heroLogo && heroLogo.url && (
                  <div className="mb-6 h-10 max-w-[220px] overflow-hidden">
                    <ResilientImage
                      item={heroLogo}
                      repoConfig={activeRepoConfig}
                      loading="eager"
                      alt="DIONTADO PRODUCTION"
                      className="h-10 w-auto object-contain"
                    />
                  </div>
                )}

                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#E7CA91]">
                  DIONTADO PRODUCTION · SÉNÉGAL &amp; INTERNATIONAL
                </p>

                <h1 className="mt-3 max-w-2xl font-display text-5xl font-semibold leading-[1.02] tracking-tight text-white text-balance sm:text-6xl lg:text-7xl">
                  L’image raconte. Le cinéma fait ressentir.
                </h1>

                <p className="mt-5 max-w-xl text-sm leading-relaxed text-stone-200 sm:text-base">
                  Nous donnons vie à vos histoires à travers la photographie et la réalisation vidéo.
                </p>
              </div>
            </div>
          </section>

          {/* ======================== 2. PORTFOLIO PHOTOGRAPHIQUE — MON TRAVAIL ======================== */}
          <section id="realisations" className="border-b border-white/10 bg-[#09090B] py-20 lg:py-24">
            {(() => {
              const activeEntry =
                categoryCardsData.find((entry) => entry.meta.slug === selectedPortfolioSlug) ||
                categoryCardsData[1] ||
                categoryCardsData[0];

              const curatedPreviewFiles = [
                'portrait-01.jpg',
                'culture-01.jpg',
                'mariage-01.jpg',
                'publicite-01.jpg',
                'culture-03.jpg',
                'publicite-06.jpg',
              ];
              const previewItems = curatedPreviewFiles
                .map((fileName) =>
                  items.find((item) => item.fileName.toLowerCase() === fileName.toLowerCase())
                )
                .filter((item): item is GalleryItem => Boolean(item));
              const fallbackPreview = previewItems.length > 0 ? previewItems : items.slice(0, 6);

              return (
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  {/* En-tête éditorial */}
                  <div className="flex flex-col justify-between gap-6 border-b border-white/10 pb-8 lg:flex-row lg:items-end">
                    <div>
                      <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#D4AF6A]">
                        PORTFOLIO PHOTOGRAPHIQUE · COLLECTIONS OFFICIELLES
                      </p>
                      <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight text-white text-balance sm:text-5xl">
                        Mon travail
                      </h2>
                    </div>
                    <p className="max-w-xl text-xs leading-relaxed text-stone-300 sm:text-sm">
                      Deux univers photographiques complémentaires pour capturer vos accomplissements académiques et vos projets professionnels, artistiques ou événementiels.
                    </p>
                  </div>

                  {/* Diptyque Cinéma : uniquement SOUTENANCE et PHOTOGRAPHIE PROFESSIONNELLE */}
                  <div
                    aria-label="Catégories photographiques"
                    className="perspective-stage mt-10 grid gap-6 lg:grid-cols-12"
                  >
                    {categoryCardsData.map(({meta, catItems, cover}, idx) => {
                      const isFeaturedPro = meta.slug === 'photographie-professionnelle';
                      const cardCover = cover || coverItem;
                      const isActive = activeEntry?.meta.slug === meta.slug;

                      return (
                        <ScrollReveal
                          key={meta.slug}
                          delay={idx * 0.08}
                          yOffset={20}
                          duration={0.55}
                          className={isFeaturedPro ? 'lg:col-span-7' : 'lg:col-span-5'}
                        >
                          <Tilt3DCard maxTilt={4} className="h-full rounded-2xl">
                            <article
                              onMouseEnter={() => setSelectedPortfolioSlug(meta.slug)}
                              className={`group relative flex min-h-[420px] flex-col justify-end overflow-hidden rounded-2xl border bg-[#121217] transition-colors sm:min-h-[460px] ${
                                isActive
                                  ? 'border-[#D4AF6A]/65'
                                  : 'border-white/12 hover:border-[#D4AF6A]/65'
                              }`}
                            >
                              <div className="absolute inset-0 z-0">
                                {catItems.length > 0 ? (
                                  <ResilientImage
                                    item={cardCover}
                                    repoConfig={activeRepoConfig}
                                    loading="lazy"
                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                  />
                                ) : (
                                  <>
                                    <ResilientImage
                                      item={coverItem}
                                      repoConfig={activeRepoConfig}
                                      loading="lazy"
                                      className="h-full w-full object-cover opacity-35 transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div
                                      aria-hidden="true"
                                      className={`absolute inset-0 bg-gradient-to-br ${meta.accentTone} opacity-90`}
                                    />
                                  </>
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

                                <div className="mt-12">
                                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#D4AF6A]">
                                    {meta.subtitle}
                                  </p>
                                  <h3 className="mt-2 font-display text-3xl font-semibold leading-tight text-white transition-colors group-hover:text-[#E7CA91] sm:text-4xl">
                                    {meta.title}
                                  </h3>
                                  <p className="mt-3 max-w-xl text-xs leading-relaxed text-stone-300 sm:text-sm">
                                    {meta.description}
                                  </p>

                                  <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-white/10 pt-5">
                                    <a
                                      href={`#/realisations/${meta.slug}`}
                                      onClick={(e) => {
                                        if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                                          e.preventDefault();
                                          openCategoryPage(meta.slug);
                                        }
                                      }}
                                      className="inline-flex h-10 items-center gap-2 rounded-md bg-[#D4AF6A] px-4 text-xs font-semibold uppercase tracking-[0.08em] text-[#0B0A09] transition-colors hover:bg-[#E7CA91]"
                                    >
                                      <span>Ouvrir la galerie</span>
                                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                                    </a>
                                    <button
                                      type="button"
                                      onClick={() => openReservationPage(meta.prestationValue)}
                                      className="inline-flex h-10 items-center gap-2 rounded-md border border-white/20 bg-[#09090B]/60 px-4 text-xs font-semibold text-[#F5F2EB] transition-colors hover:border-[#D4AF6A] hover:text-[#E7CA91]"
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

                  {/* Planche contact éditoriale : aperçu direct ouvrant le diaporama plein écran */}
                  {fallbackPreview.length > 0 && (
                    <div className="mt-14 border-t border-white/10 pt-10">
                      <div className="flex flex-wrap items-baseline justify-between gap-4">
                        <div>
                          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#D4AF6A]">
                            PLANCHE CONTACT · APERÇU IMMÉDIAT
                          </p>
                          <h3 className="mt-1 font-display text-2xl font-semibold text-white sm:text-3xl">
                            Extraits de Photographie professionnelle
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => openCategoryPage('photographie-professionnelle')}
                          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#E7CA91] transition-colors hover:text-white"
                        >
                          <span>Voir les {items.length} photographies</span>
                          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>

                      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                        {fallbackPreview.map((photo, idx) => {
                          const globalIdx = items.findIndex((i) => i.id === photo.id);
                          const openIdx = globalIdx >= 0 ? globalIdx : 0;
                          return (
                            <ScrollReveal
                              key={`preview-${photo.id}`}
                              delay={idx * 0.055}
                              yOffset={18}
                              duration={0.5}
                            >
                              <button
                                type="button"
                                onClick={() => setLightboxState({items, index: openIdx})}
                                aria-label={`Agrandir ${photo.name}`}
                                className="group relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-white/10 bg-[#121217] text-left transition-colors hover:border-[#D4AF6A]/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF6A]"
                              >
                                <ResilientImage
                                  item={photo}
                                  repoConfig={activeRepoConfig}
                                  loading="lazy"
                                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <span
                                  aria-hidden="true"
                                  className="absolute inset-0 bg-gradient-to-t from-[#09090B]/90 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                                />
                                <span className="absolute inset-x-0 bottom-0 p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                  <span className="block font-display text-sm font-semibold leading-tight text-white">
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
                </div>
              );
            })()}
          </section>

          {/* ======================== 4. PORTFOLIO VIDÉO (SHOWREEL + LECTURE DIRECTE) ======================== */}
          <section
            id="videos"
            className="border-b border-white/10 bg-gradient-to-b from-[#111116] to-[#09090B] py-20 lg:py-24"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {/* Grande Zone Showreel & Lecteur Cinéma Intégré */}
              <div
                ref={videoStageRef}
                className="overflow-hidden rounded-2xl border border-white/12 bg-[#09090B] shadow-2xl"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-black">
                  {isVideoStarted ? (
                    activeVideo.sourceType === 'mp4' && activeVideo.videoSrc ? (
                      <video
                        key={activeVideo.id}
                        src={activeVideo.videoSrc}
                        poster={activeVideo.posterUrl}
                        controls
                        playsInline
                        autoPlay
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <iframe
                        key={activeVideo.youtubeId}
                        src={`https://www.youtube-nocookie.com/embed/${activeVideo.youtubeId}?rel=0&autoplay=1&playsinline=1`}
                        title={activeVideo.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="h-full w-full border-0"
                      />
                    )
                  ) : (
                    <>
                      <img
                        src={
                          activeVideo.posterUrl ||
                          coverItem.url ||
                          `https://i.ytimg.com/vi/${activeVideo.youtubeId}/hqdefault.jpg`
                        }
                        alt={activeVideo.title}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/45 to-[#09090B]/40"
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                        <button
                          type="button"
                          onClick={() => setIsVideoStarted(true)}
                          aria-label={`Lire ${activeVideo.title}`}
                          className="group flex h-20 w-20 items-center justify-center rounded-full border border-[#E7CA91]/60 bg-[#D4AF6A] text-[#0B0A09] shadow-xl transition-transform duration-300 hover:scale-110 hover:bg-[#E7CA91]"
                        >
                          <Play className="ml-1 h-8 w-8 fill-current" aria-hidden="true" />
                        </button>
                        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#E7CA91]">
                          {activeVideo.isShowreel ? 'SHOWREEL OFFICIEL' : activeVideo.category}
                        </p>
                        <h3 className="mt-2 max-w-2xl font-display text-3xl font-semibold text-white sm:text-4xl">
                          {activeVideo.title}
                        </h3>
                        <p className="mt-2 max-w-xl text-xs text-stone-200 sm:text-sm">
                          {activeVideo.desc}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {isVideoStarted && (
                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 bg-[#121217] px-6 py-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#D4AF6A]">
                        {activeVideo.category}
                      </p>
                      <h3 className="font-display text-2xl font-semibold text-white">
                        {activeVideo.title}
                      </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                      <p className="max-w-lg text-xs text-stone-400">{activeVideo.desc}</p>
                      {activeVideoIdx !== 0 && (
                        <button
                          type="button"
                          onClick={() => setActiveVideoIdx(0)}
                          className="inline-flex h-9 items-center rounded-md border border-[#D4AF6A]/45 px-3 text-xs font-semibold text-[#E7CA91] transition-colors hover:bg-[#D4AF6A]/15"
                        >
                          Revenir au Showreel
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Catégories Vidéo */}
              <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div role="tablist" aria-label="Catégories vidéo" className="flex flex-wrap gap-2">
                  {VIDEO_CATEGORIES.map((cat) => {
                    const isActive = selectedVideoCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setSelectedVideoCategory(cat)}
                        className={`rounded-md border px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                          isActive
                            ? 'border-[#D4AF6A] bg-[#D4AF6A] font-semibold text-[#0B0A09]'
                            : 'border-white/15 bg-[#121217] text-stone-300 hover:border-[#D4AF6A]/60 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
                <span className="font-mono text-xs text-stone-400 tabular-nums">
                  {filteredVideos.length} {filteredVideos.length > 1 ? 'films' : 'film'}
                </span>
              </div>

              {/* Galerie Vidéo avec Miniatures 3D */}
              {filteredVideos.length > 0 ? (
                <div className="perspective-stage mt-8 grid gap-6 md:grid-cols-3">
                  {filteredVideos.map((vid) => {
                    const isPlayingCurrent = isVideoStarted && activeVideo.id === vid.id;
                    return (
                      <Tilt3DCard key={vid.id} maxTilt={5} className="rounded-xl">
                        <button
                          type="button"
                          onClick={() => handlePlayVideoById(vid.id)}
                          className={`group flex h-full w-full flex-col overflow-hidden rounded-xl border text-left transition-colors ${
                            isPlayingCurrent
                              ? 'border-[#D4AF6A] bg-[#D4AF6A]/10'
                              : 'border-white/10 bg-[#121217] hover:border-[#D4AF6A]/60'
                          }`}
                        >
                          <div className="relative aspect-video w-full overflow-hidden bg-black">
                            <img
                              src={
                                vid.posterUrl ||
                                `https://i.ytimg.com/vi/${vid.youtubeId}/hqdefault.jpg`
                              }
                              alt={vid.title}
                              loading="lazy"
                              referrerPolicy="no-referrer"
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <span className="absolute inset-0 flex items-center justify-center bg-black/35 transition-colors group-hover:bg-black/20">
                              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D4AF6A] text-[#0B0A09] transition-transform group-hover:scale-110">
                                <Play className="ml-0.5 h-5 w-5 fill-current" aria-hidden="true" />
                              </span>
                            </span>
                          </div>

                          <div className="flex flex-1 flex-col p-5">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#D4AF6A]">
                              {vid.category}
                            </p>
                            <h3 className="mt-1.5 font-display text-2xl font-semibold leading-snug text-white group-hover:text-[#E7CA91]">
                              {vid.title}
                            </h3>
                            <p className="mt-2 text-xs leading-relaxed text-stone-400">
                              {vid.desc}
                            </p>
                          </div>
                        </button>
                      </Tilt3DCard>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-8 rounded-xl border border-white/10 bg-[#121217] p-8 text-center">
                  <Film className="mx-auto h-6 w-6 text-[#D4AF6A]" aria-hidden="true" />
                  <p className="mt-3 font-display text-2xl font-semibold text-white">
                    Réalisations {selectedVideoCategory} — Extraits privés sur demande
                  </p>
                  <p className="mx-auto mt-2 max-w-lg text-xs leading-relaxed text-stone-400 sm:text-sm">
                    Certaines productions {selectedVideoCategory.toLowerCase()} restent confidentielles à la demande des familles ou partenaires. Découvrez notre showreel ci-dessus ou demandez des références adaptées sur WhatsApp.
                  </p>
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedVideoCategory('Toutes');
                        setActiveVideoIdx(0);
                        setIsVideoStarted(true);
                        videoStageRef.current?.scrollIntoView({behavior: 'smooth', block: 'center'});
                      }}
                      className="inline-flex h-10 items-center rounded-md border border-white/15 px-4 text-xs font-semibold text-white transition-colors hover:border-[#D4AF6A] hover:text-[#E7CA91]"
                    >
                      Voir le Showreel officiel
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        openReservationPage(
                          selectedVideoCategory === 'Mariage'
                            ? 'Mariage & Cérémonie (Photo / Vidéo)'
                            : selectedVideoCategory === 'Événementiel'
                              ? 'Événementiel (Photo & Vidéo)'
                              : 'Réalisation vidéo'
                        )
                      }
                      className="inline-flex h-10 items-center rounded-md bg-[#D4AF6A] px-4 text-xs font-semibold text-[#0B0A09] transition-colors hover:bg-[#E7CA91]"
                    >
                      Réserver une captation vidéo
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ======================== 5. À PROPOS — MISE EN PAGE MAGAZINE INDESIGN ======================== */}
          <section id="apropos" className="border-b border-white/10 bg-[#09090B] py-14 lg:py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {/* Filet supérieur type double page magazine */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-y border-white/15 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-stone-400">
                <span className="text-[#D4AF6A]">ÉDITO &amp; PORTRAIT · À PROPOS</span>
                <span>DIONTADO PRODUCTION · DAKAR, SÉNÉGAL · JUIN 2022</span>
              </div>

              {/* Composition asymétrique : Portrait réduit à gauche + Présentation & Colonnes à droite */}
              <div className="mt-8 grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
                {/* PARTIE GAUCHE : Portrait du fondateur Amadou Sy, format réduit et élégant */}
                <div className="mx-auto w-full max-w-[230px] sm:max-w-[250px] lg:col-span-3 lg:mx-0 lg:max-w-none">
                  <Tilt3DCard maxTilt={4} className="rounded-lg">
                    <figure className="overflow-hidden rounded-lg border border-white/15 bg-[#111116]">
                      <div className="aspect-[3/4] w-full overflow-hidden bg-[#181615]">
                        <img
                          src="/assets/aistudio/1C1A6618_copie_af7a2459.jpg"
                          alt="Amadou Sy — Fondateur & Directeur Créatif de DIONTADO PRODUCTION"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover object-top"
                        />
                      </div>
                      <figcaption className="border-t border-white/10 px-4 py-3">
                        <p className="font-display text-lg font-semibold leading-tight text-white">
                          Amadou Sy
                        </p>
                        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[#D4AF6A]">
                          Fondateur &amp; Directeur Créatif
                        </p>
                      </figcaption>
                    </figure>
                  </Tilt3DCard>
                </div>

                {/* PARTIE DROITE : Présentation de DIONTADO PRODUCTION, biographie et vision artistique */}
                <div className="lg:col-span-9 lg:border-l lg:border-white/10 lg:pl-10">
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#D4AF6A]">
                    La Maison de Production
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-semibold leading-[1.06] tracking-tight text-white text-balance sm:text-4xl lg:text-5xl">
                    L’art de raconter des histoires par la lumière et le cinéma.
                  </h2>
                  <div className="mt-5 h-[1px] w-16 bg-[#D4AF6A]" aria-hidden="true" />

                  <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:gap-8">
                    <div>
                      <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#E7CA91]">
                        Biographie &amp; Genèse
                      </h3>
                      <p className="mt-2.5 text-sm leading-relaxed text-stone-300">
                        Créée en juin 2022 à Dakar par <strong className="font-semibold text-white">Amadou Sy</strong>,{' '}
                        <strong className="font-semibold text-white">DIONTADO PRODUCTION</strong> est née d’une passion exigeante pour l’image et la narration audiovisuelle. Basée au Sénégal, la maison accompagne particuliers, artistes et entreprises dans leurs créations visuelles.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#E7CA91]">
                        Vision Artistique
                      </h3>
                      <p className="mt-2.5 text-sm leading-relaxed text-stone-300">
                        Notre regard unit rigueur technique et sensibilité humaine. Avant de cadrer, nous prenons le temps de comprendre chaque personnalité et chaque projet afin de sculpter des œuvres fidèles, soignées et intemporelles.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* PARTIE INFÉRIEURE : Domaines d'expertise, philosophie de création & ambitions */}
              <div className="mt-9 border-t border-white/15 pt-7">
                <div className="grid gap-6 md:grid-cols-3 md:gap-0 md:divide-x md:divide-white/10">
                  <div className="md:pr-7">
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#D4AF6A]">
                      01 · Domaines d’expertise
                    </p>
                    <h3 className="mt-1.5 font-display text-xl font-semibold text-white">
                      Photographie &amp; Cinéma
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-stone-400 sm:text-sm">
                      Portraits, mariages, prewedding, culture, mode, soutenances, studio et films institutionnels ou événementiels menés de la conception au montage final.
                    </p>
                  </div>

                  <div className="md:px-7">
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#D4AF6A]">
                      02 · Philosophie de création
                    </p>
                    <h3 className="mt-1.5 font-display text-xl font-semibold text-white">
                      Écouter, imaginer, créer, raconter
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-stone-400 sm:text-sm">
                      Une direction artistique cohérente et une attention constante portée aux émotions réelles, à la lumière juste et au sens du détail.
                    </p>
                  </div>

                  <div className="md:pl-7">
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#D4AF6A]">
                      03 · Ambitions
                    </p>
                    <h3 className="mt-1.5 font-display text-xl font-semibold text-white">
                      Une signature durable
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-stone-400 sm:text-sm">
                      Faire de chaque image une histoire, de chaque projet une expérience singulière et affirmer DIONTADO PRODUCTION au Sénégal comme à l’international.
                    </p>
                  </div>
                </div>
              </div>

              {/* Signature éditoriale discrète */}
              <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
                <p className="font-display text-base italic text-[#E7CA91]/90">
                  « L’image raconte. Le cinéma fait ressentir. »
                </p>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#D4AF6A]">
                  AMADOU SY — FONDATEUR &amp; DIRECTEUR CRÉATIF.
                </p>
              </div>
            </div>
          </section>

          {/* ======================== 6. SERVICES ======================== */}
          <section
            id="services"
            className="border-b border-white/10 bg-gradient-to-b from-[#111116] to-[#09090B] py-16 lg:py-20"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {/* Passerelle Réservation en ligne */}
              <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-[#D4AF6A]/30 bg-[#121217] p-7 md:flex-row md:items-center">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#D4AF6A]">
                    RÉSERVATION EN LIGNE
                  </p>
                  <h3 className="mt-1.5 font-display text-2xl font-semibold text-white sm:text-3xl">
                    Planifiez votre séance photo ou tournage.
                  </h3>
                  <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-stone-400 sm:text-sm">
                    Choisissez votre prestation, vérifiez nos disponibilités et envoyez votre demande en quelques clics.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openReservationPage()}
                  className="inline-flex h-11 shrink-0 items-center gap-2 rounded-md bg-[#D4AF6A] px-5 text-xs font-semibold text-[#0B0A09] transition-colors hover:bg-[#E7CA91]"
                >
                  <span>Réserver une prestation</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </section>

          {/* ======================== 7. CONTACT ======================== */}
          <ContactSection onOpenReservation={() => openReservationPage()} />
        </main>
      )}

      {/* ======================== 8. PIED DE PAGE ======================== */}
      <footer className="border-t border-white/10 bg-[#070709] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div className="flex flex-col gap-2">
              {brandAssets.logoFooter?.url ? (
                <div className="h-9 max-w-[190px] overflow-hidden">
                  <ResilientImage
                    item={brandAssets.logoFooter}
                    repoConfig={activeRepoConfig}
                    alt="DIONTADO PRODUCTION"
                    className="h-9 w-auto object-contain"
                  />
                </div>
              ) : (
                <span className="font-display text-xl font-semibold tracking-wider text-white">
                  DIONTADO PRODUCTION
                </span>
              )}
              <p className="text-xs tracking-wide text-[#D4AF6A]">
                Photographie | Réalisation vidéo · Studio Yeumbeul, Dakar
              </p>
              <p className="text-xs text-stone-400">
                <a href="tel:+221764812391" className="hover:text-[#E7CA91]">
                  +221 76 481 23 91
                </a>{' '}
                ·{' '}
                <a href="mailto:diontadoevens.0@gmail.com" className="hover:text-[#E7CA91]">
                  diontadoevens.0@gmail.com
                </a>
              </p>
            </div>

            <nav aria-label="Pied de page" className="flex flex-wrap items-center gap-6 text-xs text-stone-300">
              <a
                href="#accueil"
                onClick={(e) => {
                  e.preventDefault();
                  navigateHomeSection('accueil');
                }}
                className="hover:text-[#E7CA91]"
              >
                Accueil
              </a>
              <a
                href="#realisations"
                onClick={(e) => {
                  e.preventDefault();
                  navigateHomeSection('realisations');
                }}
                className="hover:text-[#E7CA91]"
              >
                Portfolio
              </a>
              <a
                href="#/tarifs"
                onClick={(e) => {
                  e.preventDefault();
                  openTarifsPage();
                }}
                className="hover:text-[#E7CA91]"
              >
                Tarifs
              </a>
              <a
                href="#/reservation"
                onClick={(e) => {
                  e.preventDefault();
                  openReservationPage();
                }}
                className="hover:text-[#E7CA91]"
              >
                Réserver
              </a>
              <a
                href="#apropos"
                onClick={(e) => {
                  e.preventDefault();
                  navigateHomeSection('apropos');
                }}
                className="hover:text-[#E7CA91]"
              >
                À propos
              </a>
              <a
                href="#services"
                onClick={(e) => {
                  e.preventDefault();
                  navigateHomeSection('services');
                }}
                className="hover:text-[#E7CA91]"
              >
                Services
              </a>
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  navigateHomeSection('contact');
                }}
                className="hover:text-[#E7CA91]"
              >
                Contact
              </a>
            </nav>

            <div className="flex flex-col items-start gap-2 md:items-end">
              <div className="flex items-center gap-4 text-xs text-stone-400">
                <a
                  href="https://www.instagram.com/diontado_photography"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#E7CA91]"
                >
                  Instagram
                </a>
                <a
                  href="https://www.youtube.com/watch?v=VDhh9Q0c_MI"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#E7CA91]"
                >
                  YouTube
                </a>
                <a
                  href="https://wa.me/221764812391"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#E7CA91]"
                >
                  WhatsApp
                </a>
              </div>
              <p className="text-xs text-stone-400">
                &copy; 2026 DIONTADO PRODUCTION — Tous droits réservés.
              </p>
            </div>
          </div>

          {/* Gestion médias GitHub & export autonome déplacée discrètement en pied de page */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5 text-[11px] text-stone-500">
            <span>
              {repoMeta
                ? `Médias synchronisés : ${repoMeta.fullName}`
                : 'Gestion studio · Médias officiels DIONTADO PRODUCTION'}
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setIsConfigOpen(true)}
                className="inline-flex items-center gap-1.5 text-stone-400 transition-colors hover:text-[#E7CA91]"
              >
                <FolderGit2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{repoMeta ? 'Changer de dépôt GitHub' : 'Synchroniser un dépôt GitHub'}</span>
              </button>
              <button
                type="button"
                onClick={() => downloadStandaloneIndexHtml(activeRepoConfig)}
                className="inline-flex items-center gap-1.5 text-stone-400 transition-colors hover:text-[#E7CA91]"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Exporter index.html</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Bouton WhatsApp Flottant */}
      <a
        href="https://wa.me/221764812391?text=Bonjour%20DIONTADO%20PRODUCTION%2C%20je%20souhaite%20obtenir%20des%20informations%20sur%20vos%20prestations."
        target="_blank"
        rel="noreferrer"
        aria-label="Contacter DIONTADO PRODUCTION sur WhatsApp"
        className="fixed bottom-5 right-5 z-30 inline-flex h-11 items-center gap-2 rounded-full bg-[#1F7A4C] px-4 text-xs font-semibold text-white shadow-lg transition-transform hover:scale-105 hover:bg-[#258D58] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF6A]"
      >
        <MessageCircle className="h-4 w-4" aria-hidden="true" />
        <span>WhatsApp</span>
      </a>

      <GitHubConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onSubmitRepo={handleModalSubmit}
        onResetToDemo={handleResetToDemo}
        isLoading={isLoading}
        errorMessage={errorMessage}
        activeConfig={activeRepoConfig}
        repoMeta={repoMeta}
      />

      {lightboxState !== null && (
        <LightboxModal
          items={lightboxState.items}
          activeIndex={lightboxState.index}
          repoConfig={activeRepoConfig}
          onClose={() => setLightboxState(null)}
          onNavigate={(nextIndex) =>
            setLightboxState((prev) => (prev ? {...prev, index: nextIndex} : null))
          }
          onDimensionsLoad={handleDimensionsLoad}
        />
      )}
    </div>
  );
}
