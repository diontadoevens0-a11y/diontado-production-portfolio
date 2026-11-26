import {onAuthStateChanged, type User} from 'firebase/auth';
import {Download, FolderGit2, Lock, MessageCircle} from 'lucide-react';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {AboutPage} from './components/AboutPage';
import {AdminPage} from './components/AdminPage';
import {CategoryPage} from './components/CategoryPage';
import {ContactPage} from './components/ContactPage';
import {GitHubConfigModal} from './components/GitHubConfigModal';
import {Header, type ActiveRouteKind} from './components/Header';
import {HomePage} from './components/HomePage';
import {LightboxModal} from './components/LightboxModal';
import {PortfolioHubPage} from './components/PortfolioHubPage';
import {ResilientImage} from './components/ResilientImage';
import {ReservationPage} from './components/ReservationPage';
import {ServicesPage} from './components/ServicesPage';
import {TarifsPage} from './components/TarifsPage';
import {VideosPage} from './components/VideosPage';
import {
  DIONTADO_COVER_SLATE,
  DIONTADO_SLATES,
  DIONTADO_VIDEOS,
  downloadStandaloneIndexHtml,
  EMPTY_BRAND_ASSETS,
  PHOTO_CATEGORIES,
} from './data/diontadoManifest';
import {auth} from './firebase';
import {
  DEFAULT_SERVICES,
  subscribePublicCmsData,
  type CmsLoadProgress,
  type PublicCmsSnapshot,
} from './services/cmsService';
import {fetchGitHubGallery, parseGitHubInput} from './services/githubGallery';
import type {
  BrandAssets,
  GalleryItem,
  GitHubRepoConfig,
  GitHubRepoMeta,
  PhotoCategoryMeta,
  VideoPortfolioItem,
} from './types/gallery';

const STORAGE_KEY_CONFIG = 'diontado_github_config_v1';

type AppRoute =
  | {kind: 'home'}
  | {kind: 'portfolio'}
  | {kind: 'category'; slug: string; albumId?: string}
  | {kind: 'videos'}
  | {kind: 'services'}
  | {kind: 'tarifs'}
  | {kind: 'apropos'}
  | {kind: 'contact'}
  | {kind: 'reservation'; prestation?: string; formulaId?: string}
  | {kind: 'admin'};

function parseAppRoute(): AppRoute {
  if (typeof window === 'undefined') return {kind: 'home'};

  const pathname = (window.location.pathname || '/').toLowerCase().replace(/\/+$/, '') || '/';
  const searchParams = new URLSearchParams(window.location.search || '');
  const rawHash = window.location.hash || '';
  const [hashBase, hashQuery] = rawHash.split('?');
  const hashPath = hashBase.toLowerCase().replace(/\/+$/, '');

  // Compatibilité avec les anciens liens en #/...
  if (hashPath === '#/tarifs' || hashPath === '#tarifs') {
    return {kind: 'tarifs'};
  }
  if (hashPath === '#/reservation' || hashPath === '#reservation') {
    const q = new URLSearchParams(hashQuery || window.location.search || '');
    return {
      kind: 'reservation',
      prestation: q.get('prestation') || undefined,
      formulaId: q.get('formule') || undefined,
    };
  }
  const legacyCatMatch = hashPath.match(/^#\/realisations\/(soutenance|photographie-professionnelle)$/);
  if (legacyCatMatch) {
    return {kind: 'category', slug: legacyCatMatch[1]};
  }
  if (hashPath === '#realisations' || hashPath === '#/portfolio') return {kind: 'portfolio'};
  if (hashPath === '#videos' || hashPath === '#/videos') return {kind: 'videos'};
  if (hashPath === '#apropos' || hashPath === '#/apropos') return {kind: 'apropos'};
  if (hashPath === '#services' || hashPath === '#/services') return {kind: 'services'};
  if (hashPath === '#contact' || hashPath === '#/contact') return {kind: 'contact'};
  if (hashPath === '#/admin') return {kind: 'admin'};

  // Routes propres History API
  if (pathname === '/' || pathname === '/accueil') {
    return {kind: 'home'};
  }
  if (pathname === '/portfolio') {
    return {kind: 'portfolio'};
  }
  const catMatch = pathname.match(/^\/portfolio\/(soutenance|photographie-professionnelle)$/);
  if (catMatch) {
    return {
      kind: 'category',
      slug: catMatch[1],
      albumId: searchParams.get('album') || undefined,
    };
  }
  if (pathname === '/videos') return {kind: 'videos'};
  if (pathname === '/services') return {kind: 'services'};
  if (pathname === '/tarifs') return {kind: 'tarifs'};
  if (pathname === '/apropos') return {kind: 'apropos'};
  if (pathname === '/contact') return {kind: 'contact'};
  if (pathname === '/reservation') {
    return {
      kind: 'reservation',
      prestation: searchParams.get('prestation') || undefined,
      formulaId: searchParams.get('formule') || undefined,
    };
  }
  if (pathname === '/admin') {
    return {kind: 'admin'};
  }

  return {kind: 'home'};
}

export default function App() {
  const [baseItems, setBaseItems] = useState<GalleryItem[]>(DIONTADO_SLATES);
  const [brandAssets, setBrandAssets] = useState<BrandAssets>(EMPTY_BRAND_ASSETS);
  const [activeRepoConfig, setActiveRepoConfig] = useState<GitHubRepoConfig | null>(null);
  const [repoMeta, setRepoMeta] = useState<GitHubRepoMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const [activeRoute, setActiveRoute] = useState<AppRoute>(() => parseAppRoute());
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [cmsData, setCmsData] = useState<PublicCmsSnapshot>({
    photos: [],
    albums: [],
    videos: [],
    covers: [],
    categories: [],
    services: [],
  });
  const [cmsLoadProgress, setCmsLoadProgress] = useState<CmsLoadProgress>({
    loadedCount: 0,
    totalCount: 6,
    percent: 0,
    currentLabel: 'Connexion aux galeries…',
    isComplete: false,
  });

  const [lightboxState, setLightboxState] = useState<{
    items: GalleryItem[];
    index: number;
  } | null>(null);

  // Écoute Firebase Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  // Écoute temps réel Firestore CMS public
  useEffect(() => {
    const unsub = subscribePublicCmsData(
      (partial) => {
        setCmsData((prev) => ({
          ...prev,
          ...partial,
        }));
      },
      undefined,
      (progress) => {
        setCmsLoadProgress(progress);
      }
    );
    return () => unsub();
  }, []);

  // Synchronisation navigateur (Précédent / Suivant / Hash legacy)
  useEffect(() => {
    const onRouteChange = () => {
      setActiveRoute(parseAppRoute());
      window.scrollTo({top: 0, behavior: 'smooth'});
    };
    window.addEventListener('popstate', onRouteChange);
    window.addEventListener('hashchange', onRouteChange);
    return () => {
      window.removeEventListener('popstate', onRouteChange);
      window.removeEventListener('hashchange', onRouteChange);
    };
  }, []);

  const navigatePath = useCallback((path: string) => {
    if (typeof window !== 'undefined') {
      const normalized = path.startsWith('/') ? path : `/${path}`;
      window.history.pushState(null, '', normalized);
      setActiveRoute(parseAppRoute());
      window.scrollTo({top: 0, behavior: 'smooth'});
    }
  }, []);

  const openCategoryPage = useCallback(
    (slug: string, albumId?: string) => {
      const cleanSlug =
        slug.toLowerCase() === 'soutenance' ? 'soutenance' : 'photographie-professionnelle';
      const qs = albumId ? `?album=${encodeURIComponent(albumId)}` : '';
      navigatePath(`/portfolio/${cleanSlug}${qs}`);
    },
    [navigatePath]
  );

  const openReservationPage = useCallback(
    (prestation?: string, formulaId?: string) => {
      const qs = new URLSearchParams();
      if (prestation) qs.set('prestation', prestation);
      if (formulaId) qs.set('formule', formulaId);
      const suffix = qs.toString() ? `?${qs.toString()}` : '';
      navigatePath(`/reservation${suffix}`);
    },
    [navigatePath]
  );

  // Mise à jour dynamique du titre de la page selon la route
  useEffect(() => {
    const titles: Record<ActiveRouteKind, string> = {
      home: 'DIONTADO PRODUCTION | Photographe Dakar & Vidéo Sénégal',
      portfolio: 'Portfolio Photographique | DIONTADO PRODUCTION',
      category: 'Galerie | DIONTADO PRODUCTION',
      videos: 'Réalisations Vidéo & Showreel | DIONTADO PRODUCTION',
      services: 'Services & Accompagnement | DIONTADO PRODUCTION',
      tarifs: 'Tarifs Officiels | DIONTADO PRODUCTION',
      apropos: 'À propos — Amadou Sy | DIONTADO PRODUCTION',
      contact: 'Contact | DIONTADO PRODUCTION',
      reservation: 'Réservation en ligne | DIONTADO PRODUCTION',
      admin: 'Administration | DIONTADO PRODUCTION',
    };
    document.title = titles[activeRoute.kind];
  }, [activeRoute.kind]);

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
        setBaseItems(galleryItems);
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
    setBaseItems(DIONTADO_SLATES);
    setBrandAssets(EMPTY_BRAND_ASSETS);
    setActiveRepoConfig(null);
    setRepoMeta(null);
    setErrorMessage(null);
    localStorage.removeItem(STORAGE_KEY_CONFIG);
    syncUrlParams(null);
    setIsConfigOpen(false);
  };

  const handleDimensionsLoad = useCallback((id: string, width: number, height: number) => {
    setBaseItems((prev) => {
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

  // Fusion Photos CMS publiées (mises en avant d'abord) + Archives manifeste (19 photos)
  const mergedPhotos: GalleryItem[] = useMemo(() => {
    const cmsGallery: GalleryItem[] = [...cmsData.photos]
      .filter((p) => p.published)
      .sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return a.sortOrder - b.sortOrder;
      })
      .map((p) => ({
        id: p.id,
        name: p.title,
        description: p.description,
        fileName: p.fileName,
        path: p.fileName,
        folder: p.category,
        albumId: p.albumId,
        albumTitle: p.albumTitle,
        extension: (p.mimeType.split('/')[1] || 'JPG').toUpperCase(),
        size: p.fileSize,
        url: p.url,
        githubUrl: p.url,
        role: 'gallery',
        published: true,
        featured: p.featured,
        sortOrder: p.sortOrder,
        storagePath: p.storagePath,
        isCmsManaged: true,
      }));

    return [...cmsGallery, ...baseItems];
  }, [baseItems, cmsData.photos]);

  // Fusion Vidéos CMS publiées + Vidéos YouTube officielles de base
  const mergedVideos: VideoPortfolioItem[] = useMemo(() => {
    const cmsVideos: VideoPortfolioItem[] = [...cmsData.videos]
      .filter((v) => v.published)
      .sort((a, b) => {
        if (a.isShowreel !== b.isShowreel) return a.isShowreel ? -1 : 1;
        return a.sortOrder - b.sortOrder;
      })
      .map((v) => ({
        id: v.id,
        sourceType: v.sourceType,
        youtubeId: v.youtubeId || undefined,
        videoSrc: v.videoUrl || undefined,
        posterUrl: v.posterUrl || undefined,
        storagePath: v.storagePath,
        category: v.category,
        title: v.title,
        desc: v.description,
        isShowreel: v.isShowreel,
        published: true,
        sortOrder: v.sortOrder,
        isCmsManaged: true,
      }));

    const hasCustomShowreel = cmsVideos.some((v) => v.isShowreel);
    const baseline = hasCustomShowreel
      ? DIONTADO_VIDEOS.map((v) => ({...v, isShowreel: false}))
      : DIONTADO_VIDEOS;

    return [...cmsVideos, ...baseline];
  }, [cmsData.videos]);

  // Fusion Couvertures & Métadonnées catégories officielles (strictement 2 catégories)
  const effectiveCategories: PhotoCategoryMeta[] = useMemo(() => {
    return PHOTO_CATEGORIES.map((baseCat) => {
      const cmsMeta = cmsData.categories.find((c) => c.slug === baseCat.slug);
      const cmsCover = cmsData.covers.find((cov) => cov.id === baseCat.slug);
      return {
        ...baseCat,
        subtitle: cmsMeta?.subtitle || baseCat.subtitle,
        description: cmsMeta?.description || baseCat.description,
        coverUrl: cmsCover?.imageUrl || baseCat.coverUrl,
      };
    });
  }, [cmsData.categories, cmsData.covers]);

  const effectiveServices = useMemo(() => {
    const published = cmsData.services
      .filter((s) => s.published)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    return published.length > 0 ? published : DEFAULT_SERVICES;
  }, [cmsData.services]);

  const homeCoverDoc = cmsData.covers.find((c) => c.id === 'home');
  const aboutCoverDoc = cmsData.covers.find((c) => c.id === 'apropos');

  const coverItem: GalleryItem = useMemo(() => {
    if (homeCoverDoc?.imageUrl) {
      return {
        ...DIONTADO_COVER_SLATE,
        id: 'cms-home-cover',
        url: homeCoverDoc.imageUrl,
        githubUrl: homeCoverDoc.imageUrl,
        name: homeCoverDoc.alt || DIONTADO_COVER_SLATE.name,
      };
    }
    return brandAssets.cover || DIONTADO_COVER_SLATE;
  }, [brandAssets.cover, homeCoverDoc]);

  const heroLogo = brandAssets.logoHeaderDark || brandAssets.logoHeaderLight;

  const activeCategoryObj: PhotoCategoryMeta | null = useMemo(() => {
    if (activeRoute.kind !== 'category') return null;
    return effectiveCategories.find((c) => c.slug === activeRoute.slug) || null;
  }, [activeRoute, effectiveCategories]);

  const activeCategoryItems = useMemo(() => {
    if (!activeCategoryObj) return [];
    return mergedPhotos.filter(
      (item) => item.folder.toLowerCase() === activeCategoryObj.folderMatch.toLowerCase()
    );
  }, [activeCategoryObj, mergedPhotos]);

  const homeShowcasePhotos = useMemo(() => {
    const featured = mergedPhotos.filter((p) => p.featured);
    const pool = featured.length > 0 ? [...featured, ...mergedPhotos] : mergedPhotos;
    const unique: GalleryItem[] = [];
    for (const p of pool) {
      if (!unique.some((u) => u.id === p.id)) unique.push(p);
      if (unique.length >= 4) break;
    }
    return unique;
  }, [mergedPhotos]);

  return (
    <div className="min-h-screen bg-[#09090B] text-[#F5F2EB]">
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
        onNavigatePath={navigatePath}
      />

      {/* Rendu Multi-Pages */}
      {activeRoute.kind === 'admin' ? (
        <AdminPage
          user={authUser}
          authLoading={authLoading}
          onBackHome={() => navigatePath('/')}
          onNavigatePath={navigatePath}
        />
      ) : activeRoute.kind === 'reservation' ? (
        <ReservationPage
          initialPrestation={activeRoute.prestation}
          initialFormulaId={activeRoute.formulaId}
          onBackHome={() => navigatePath('/')}
        />
      ) : activeRoute.kind === 'tarifs' ? (
        <TarifsPage
          onBackHome={() => navigatePath('/')}
          onContact={() => navigatePath('/contact')}
          onReserve={openReservationPage}
        />
      ) : activeRoute.kind === 'services' ? (
        <ServicesPage
          services={effectiveServices}
          onBackHome={() => navigatePath('/')}
          onOpenTarifs={() => navigatePath('/tarifs')}
          onOpenReservation={openReservationPage}
        />
      ) : activeRoute.kind === 'apropos' ? (
        <AboutPage
          portraitUrl={aboutCoverDoc?.imageUrl}
          onBackHome={() => navigatePath('/')}
          onOpenPortfolio={() => navigatePath('/portfolio')}
          onOpenReservation={() => openReservationPage()}
        />
      ) : activeRoute.kind === 'videos' ? (
        <VideosPage
          videos={mergedVideos}
          fallbackCover={coverItem}
          onBackHome={() => navigatePath('/')}
          onOpenReservation={openReservationPage}
        />
      ) : activeRoute.kind === 'contact' ? (
        <ContactPage
          onBackHome={() => navigatePath('/')}
          onOpenReservation={() => openReservationPage()}
        />
      ) : activeRoute.kind === 'category' && activeCategoryObj ? (
        <CategoryPage
          category={activeCategoryObj}
          allCategories={effectiveCategories}
          items={activeCategoryItems}
          albums={cmsData.albums}
          initialAlbumId={activeRoute.albumId}
          allGalleryItems={mergedPhotos}
          repoConfig={activeRepoConfig}
          galleryLoadingProgress={
            isLoading
              ? {
                  isLoading: true,
                  percent: 60,
                  label: 'Synchronisation des médias GitHub…',
                }
              : !cmsLoadProgress.isComplete
                ? {
                    isLoading: true,
                    percent: cmsLoadProgress.percent,
                    label: cmsLoadProgress.currentLabel,
                  }
                : null
          }
          onBackToPortfolio={() => navigatePath('/portfolio')}
          onOpenCategory={(slug) => openCategoryPage(slug)}
          onReserve={openReservationPage}
          onOpenLightbox={(list, index) => setLightboxState({items: list, index})}
          onDimensionsLoad={handleDimensionsLoad}
        />
      ) : activeRoute.kind === 'portfolio' ? (
        <PortfolioHubPage
          categories={effectiveCategories}
          items={mergedPhotos}
          albums={cmsData.albums}
          fallbackCover={coverItem}
          repoConfig={activeRepoConfig}
          galleryLoadingProgress={
            isLoading
              ? {
                  isLoading: true,
                  percent: 60,
                  label: 'Synchronisation des médias GitHub…',
                }
              : !cmsLoadProgress.isComplete
                ? {
                    isLoading: true,
                    percent: cmsLoadProgress.percent,
                    label: cmsLoadProgress.currentLabel,
                  }
                : null
          }
          onBackHome={() => navigatePath('/')}
          onOpenCategory={openCategoryPage}
          onOpenVideos={() => navigatePath('/videos')}
          onOpenReservation={openReservationPage}
          onOpenLightbox={(list, index) => setLightboxState({items: list, index})}
          onDimensionsLoad={handleDimensionsLoad}
        />
      ) : (
        <HomePage
          coverItem={coverItem}
          heroLogo={heroLogo}
          curatedPhotos={homeShowcasePhotos}
          totalPhotosCount={mergedPhotos.length}
          repoConfig={activeRepoConfig}
          onNavigatePath={navigatePath}
          onOpenPortfolio={() => navigatePath('/portfolio')}
          onOpenReservation={() => openReservationPage()}
          onOpenLightbox={(list, index) => setLightboxState({items: list, index})}
          onDimensionsLoad={handleDimensionsLoad}
        />
      )}

      {/* Pied de page */}
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

            <nav aria-label="Pied de page" className="flex flex-wrap items-center gap-5 text-xs text-stone-300">
              {[
                {path: '/', label: 'Accueil'},
                {path: '/portfolio', label: 'Portfolio'},
                {path: '/videos', label: 'Vidéos'},
                {path: '/services', label: 'Services'},
                {path: '/tarifs', label: 'Tarifs'},
                {path: '/apropos', label: 'À propos'},
                {path: '/reservation', label: 'Réserver'},
                {path: '/contact', label: 'Contact'},
              ].map((link) => (
                <a
                  key={link.path}
                  href={link.path}
                  onClick={(e) => {
                    if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                      e.preventDefault();
                      navigatePath(link.path);
                    }
                  }}
                  className="hover:text-[#E7CA91] whitespace-nowrap"
                >
                  {link.label}
                </a>
              ))}
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

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5 text-[11px] text-stone-500">
            <span>
              {repoMeta
                ? `Médias synchronisés : ${repoMeta.fullName}`
                : 'Gestion studio · Médias officiels DIONTADO PRODUCTION'}
            </span>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="/admin"
                onClick={(e) => {
                  if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                    e.preventDefault();
                    navigatePath('/admin');
                  }
                }}
                className="inline-flex items-center gap-1.5 text-stone-400 transition-colors hover:text-[#E7CA91]"
              >
                <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Espace Admin</span>
              </a>
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

      {/* Bouton WhatsApp Flottant (masqué dans /admin) */}
      {activeRoute.kind !== 'admin' && (
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
      )}

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
