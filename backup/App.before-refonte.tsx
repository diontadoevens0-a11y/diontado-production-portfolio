import {ChevronLeft, ChevronRight, Download, FolderGit2, Maximize2, Play, Upload} from 'lucide-react';
import {type ChangeEvent, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ContactSection} from './components/ContactSection';
import {GalleryCard} from './components/GalleryCard';
import {GitHubConfigModal} from './components/GitHubConfigModal';
import {Header} from './components/Header';
import {LightboxModal} from './components/LightboxModal';
import {ResilientImage} from './components/ResilientImage';
import {
  DIONTADO_BTS_SLATES,
  DIONTADO_COVER_SLATE,
  DIONTADO_SLATES,
  downloadStandaloneIndexHtml,
  EMPTY_BRAND_ASSETS,
} from './data/diontadoManifest';
import {fetchGitHubGallery, parseGitHubInput} from './services/githubGallery';
import type {
  BrandAssets,
  GalleryItem,
  GitHubRepoConfig,
  GitHubRepoMeta,
} from './types/gallery';

const STORAGE_KEY_CONFIG = 'diontado_github_config_v1';

const YOUTUBE_PLAYLIST = [
  {
    id: 'VDhh9Q0c_MI',
    category: 'Production Vidéo',
    title: 'Showreel Officiel — DIONTADO PRODUCTION',
    desc: 'Sélection de réalisations cinématographiques, clips, campagnes et documentaires.',
  },
  {
    id: 'OJrbnH9zgLE',
    category: 'Culture',
    title: 'Reportage Culturel — Sénégal',
    desc: 'Immersion audiovisuelle au cœur des expressions artistiques et culturelles.',
  },
  {
    id: 'tSglYbBoufg',
    category: 'Studio',
    title: 'Direction Artistique & Film',
    desc: 'Création visuelle sur mesure pour artistes, marques et créateurs.',
  },
];

function extractYouTubeId(input: string): string {
  const str = input.trim();
  if (!str) return '';
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) return str;
  const match = str.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : '';
}

export default function App() {
  const [items, setItems] = useState<GalleryItem[]>(DIONTADO_SLATES);
  const [brandAssets, setBrandAssets] = useState<BrandAssets>(EMPTY_BRAND_ASSETS);
  const [activeRepoConfig, setActiveRepoConfig] = useState<GitHubRepoConfig | null>(null);
  const [repoMeta, setRepoMeta] = useState<GitHubRepoMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Toutes');
  const [btsFilter, setBtsFilter] = useState<
    'Tous' | 'Sur le terrain' | 'Editing'
  >('Tous');
  const [localBtsItems, setLocalBtsItems] = useState<GalleryItem[]>([]);
  const [lightboxState, setLightboxState] = useState<{
    items: GalleryItem[];
    index: number;
  } | null>(null);
  const oldBtsInputRef = useRef<HTMLInputElement | null>(null);
  const newBtsInputRef = useRef<HTMLInputElement | null>(null);

  // Hero slideshow state
  const [activeHeroIdx, setActiveHeroIdx] = useState(0);

  // YouTube state
  const [activeVideoIdx, setActiveVideoIdx] = useState(0);
  const [customYoutubeInput, setCustomYoutubeInput] = useState('');
  const [activeYoutubeId, setActiveYoutubeId] = useState(YOUTUBE_PLAYLIST[0].id);
  const [playTrigger, setPlayTrigger] = useState(0);

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
        setSelectedCategory('Toutes');

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
    setSelectedCategory('Toutes');
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

  const handleLocalBtsUpload = (
    event: ChangeEvent<HTMLInputElement>,
    group: 'Sur le terrain' | 'Editing'
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const created: GalleryItem[] = Array.from(files).map((file, idx) => {
      const objectUrl = URL.createObjectURL(file);
      return {
        id: `local-bts-${Date.now()}-${idx}-${file.name}`,
        name: `${group} — ${file.name.replace(/\.[^/.]+$/, '')}`,
        fileName: file.name,
        path: file.name,
        folder: group,
        extension: (file.name.split('.').pop() || 'JPG').toUpperCase(),
        size: file.size,
        url: objectUrl,
        githubUrl: '#biographie',
        role: 'bts',
      };
    });
    setLocalBtsItems((prev) => [...prev, ...created]);
    event.target.value = '';
  };

  const btsItems = useMemo(() => {
    const githubBtsWithUrl = brandAssets.btsItems.filter((item) => Boolean(item.url));
    const baseBts = githubBtsWithUrl.length > 0 ? githubBtsWithUrl : DIONTADO_BTS_SLATES;
    if (localBtsItems.length > 0) {
      return [...localBtsItems, ...baseBts];
    }
    return baseBts;
  }, [brandAssets.btsItems, localBtsItems]);

  const filteredBtsItems = useMemo(() => {
    if (btsFilter === 'Tous') return btsItems;
    return btsItems.filter((item) => item.folder === btsFilter);
  }, [btsItems, btsFilter]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'Toutes') return items;
    return items.filter(
      (item) => item.folder.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [items, selectedCategory]);

  const coverItem = brandAssets.cover || DIONTADO_COVER_SLATE;

  const heroSlides = useMemo<GalleryItem[]>(() => {
    const loadedGallery = items.filter((item) => Boolean(item.url));
    const preferredOrder = [
      'culture-01.jpg',
      'mariage-01.jpg',
      'portrait-01.jpg',
      'publicite-01.jpg',
      'publicite-06.jpg',
      'portrait-02.jpg',
    ];

    const selected: GalleryItem[] = [];
    if (coverItem?.url) {
      selected.push(coverItem);
    }

    if (loadedGallery.length > 0) {
      for (const fileName of preferredOrder) {
        const match = loadedGallery.find(
          (item) => item.fileName.toLowerCase() === fileName.toLowerCase()
        );
        if (match && !selected.some((s) => s.id === match.id)) {
          selected.push(match);
        }
      }

      if (selected.length < 6) {
        const categoriesOrder = ['Culture', 'Prewedding', 'Portrait', 'Studio', 'Extérieur'];
        for (const cat of categoriesOrder) {
          if (selected.length >= 6) break;
          const match = loadedGallery.find(
            (item) =>
              item.folder.toLowerCase() === cat.toLowerCase() &&
              !selected.some((s) => s.id === item.id)
          );
          if (match) selected.push(match);
        }
      }

      for (const item of loadedGallery) {
        if (selected.length >= 6) break;
        if (!selected.some((s) => s.id === item.id)) {
          selected.push(item);
        }
      }
    } else {
      const previewHighlights: GalleryItem[] = [
        {
          id: 'hero-preview-1',
          name: 'Shooting sur la côte rocheuse',
          fileName: '1.jpg',
          path: '1.jpg',
          folder: 'Extérieur',
          extension: 'JPG',
          size: 0,
          url: '/assets/aistudio/1_e77d17a4.jpg',
          githubUrl: '#realisations',
          role: 'cover',
        },
        {
          id: 'hero-preview-2',
          name: 'Tournage sur falaise côtière',
          fileName: '11.HEIC',
          path: '11.HEIC',
          folder: 'Extérieur',
          extension: 'JPG',
          size: 0,
          url: '/assets/aistudio/11_27ca1e48.jpg',
          githubUrl: '#realisations',
          role: 'cover',
        },
        {
          id: 'hero-preview-3',
          name: 'Équipe drone & caméra — Littoral',
          fileName: '10.JPG',
          path: '10.JPG',
          folder: 'Culture',
          extension: 'JPG',
          size: 0,
          url: '/assets/aistudio/10_1df3e28e.JPG',
          githubUrl: '#realisations',
          role: 'cover',
        },
        {
          id: 'hero-preview-4',
          name: 'Tournage sport — Teranga Training',
          fileName: '8.JPG',
          path: '8.JPG',
          folder: 'Studio',
          extension: 'JPG',
          size: 0,
          url: '/assets/aistudio/8_b3eee15a.JPG',
          githubUrl: '#realisations',
          role: 'cover',
        },
        {
          id: 'hero-preview-5',
          name: 'Tournage clip & mise en lumière',
          fileName: '6.jpg',
          path: '6.jpg',
          folder: 'Studio',
          extension: 'JPG',
          size: 0,
          url: '/assets/aistudio/6_26900419.jpg',
          githubUrl: '#realisations',
          role: 'cover',
        },
      ];
      selected.push(...previewHighlights);
    }

    return selected.length > 0 ? selected : [DIONTADO_COVER_SLATE];
  }, [coverItem, items]);

  useEffect(() => {
    setActiveHeroIdx(0);
  }, [heroSlides.length]);

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    const timer = window.setInterval(() => {
      setActiveHeroIdx((prev) => (prev + 1) % heroSlides.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [heroSlides.length]);

  const servicePhotoItem =
    items.find((i) => i.fileName.toLowerCase() === 'portrait-02.jpg') ||
    items.find((i) => i.folder === 'Portrait') ||
    items[0];
  const serviceVideoItem =
    items.find((i) => i.fileName.toLowerCase() === 'publicite-01.jpg') ||
    items.find((i) => i.folder === 'Studio') ||
    items[1] ||
    items[0];

  const categories = ['Toutes', 'Culture', 'Prewedding', 'Portrait', 'Studio', 'Extérieur'];

  return (
    <div id="accueil" className="min-h-screen bg-[#070708] text-[#F5F3EE]">
      <Header brandAssets={brandAssets} repoConfig={activeRepoConfig} />

      {/* Action Strip for GitHub Preview & Standalone HTML Export */}
      <div className="border-b border-white/10 bg-[#111114]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-xs sm:px-6 lg:px-8">
          <p className="text-stone-300">
            {repoMeta
              ? `Images chargées depuis GitHub : ${repoMeta.fullName}`
              : 'Pour afficher vos véritables images dans cet aperçu, connectez l’URL de votre dépôt GitHub ou téléchargez directement index.html pour GitHub Pages.'}
          </p>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsConfigOpen(true)}
              className="inline-flex items-center gap-1.5 font-medium text-[#DFBE89] hover:underline whitespace-nowrap"
            >
              <FolderGit2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{repoMeta ? 'Changer de dépôt' : 'Lier mon dépôt GitHub'}</span>
            </button>
            <button
              type="button"
              onClick={() => downloadStandaloneIndexHtml(activeRepoConfig)}
              className="inline-flex items-center gap-1.5 rounded border border-white/15 bg-white/5 px-2.5 py-1 font-medium text-white transition-colors hover:border-[#C8A46B] whitespace-nowrap"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Télécharger index.html</span>
            </button>
          </div>
        </div>
      </div>

      <main>
        {/* ======================== ACCUEIL (HERO) ======================== */}
        <section className="relative flex min-h-[84vh] items-end overflow-hidden border-b border-white/10 py-16 lg:py-24">
          <div className="absolute inset-0 z-0">
            {heroSlides.map((slide, idx) => {
              const isActive = idx === activeHeroIdx % heroSlides.length;
              return (
                <div
                  key={slide.id}
                  aria-hidden={!isActive}
                  className={`absolute inset-0 transition-all duration-1000 ease-out ${
                    isActive ? 'opacity-100 scale-100' : 'pointer-events-none opacity-0 scale-[1.03]'
                  }`}
                >
                  <ResilientImage
                    item={slide}
                    repoConfig={activeRepoConfig}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    className="h-full w-full object-cover"
                  />
                </div>
              );
            })}
          </div>
          <div
            aria-hidden="true"
            className="absolute inset-0 z-[1] bg-gradient-to-t from-[#070708] via-[#070708]/55 to-[#070708]/60"
          />

          <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div className="max-w-2xl">
                {brandAssets.logoHeaderDark?.url && (
                  <div className="mb-6 h-12 max-w-[260px] overflow-hidden">
                    <ResilientImage
                      item={brandAssets.logoHeaderDark}
                      repoConfig={activeRepoConfig}
                      loading="eager"
                      alt="Logo"
                      className="h-12 w-auto object-contain"
                    />
                  </div>
                )}

                <h1 className="max-w-2xl font-display text-5xl font-semibold leading-[1.03] tracking-tight text-white text-balance sm:text-6xl lg:text-7xl">
                  Nous donnons vie à vos images.
                </h1>

                <div className="mt-8 flex flex-wrap gap-4">
                  <a
                    href="#realisations"
                    className="inline-flex h-11 items-center justify-center rounded-md bg-[#C8A46B] px-6 text-sm font-semibold text-[#0B0A09] transition-colors hover:bg-[#DFBE89]"
                  >
                    Découvrir nos réalisations
                  </a>
                  <a
                    href="#contact"
                    className="inline-flex h-11 items-center justify-center rounded-md border border-white/30 bg-black/40 px-6 text-sm font-medium text-white transition-colors hover:border-[#C8A46B]"
                  >
                    Nous contacter
                  </a>
                </div>
              </div>

              {heroSlides.length > 1 && (
                <div className="flex items-center gap-3 self-start lg:self-end">
                  <button
                    type="button"
                    aria-label="Image précédente"
                    onClick={() =>
                      setActiveHeroIdx(
                        (prev) => (prev - 1 + heroSlides.length) % heroSlides.length
                      )
                    }
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white transition-colors hover:border-[#C8A46B] hover:text-[#DFBE89]"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <div className="flex items-center gap-1.5" role="tablist" aria-label="Diaporama d’accueil">
                    {heroSlides.map((slide, idx) => {
                      const isCurrent = idx === activeHeroIdx % heroSlides.length;
                      return (
                        <button
                          key={slide.id}
                          type="button"
                          role="tab"
                          aria-selected={isCurrent}
                          aria-label={`Afficher l’image ${idx + 1}`}
                          onClick={() => setActiveHeroIdx(idx)}
                          className={`h-1.5 rounded-full transition-all ${
                            isCurrent
                              ? 'w-7 bg-[#C8A46B]'
                              : 'w-2 bg-white/35 hover:bg-white/60'
                          }`}
                        />
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    aria-label="Image suivante"
                    onClick={() =>
                      setActiveHeroIdx((prev) => (prev + 1) % heroSlides.length)
                    }
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white transition-colors hover:border-[#C8A46B] hover:text-[#DFBE89]"
                  >
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ======================== NOS RÉALISATIONS ======================== */}
        <section id="realisations" className="border-t border-white/10 bg-[#111114] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-4 pb-8 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A46B]">
                  Nos réalisations
                </p>
                <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight text-white text-balance sm:text-5xl">
                  Galerie photographique
                </h2>
              </div>
              <p className="max-w-md text-sm text-stone-400">
                Chaque image raconte une histoire.
              </p>
            </div>

            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div role="tablist" aria-label="Catégories" className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setSelectedCategory(cat)}
                      className={`rounded-md border px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                        isActive
                          ? 'border-[#C8A46B] bg-[#C8A46B] font-semibold text-[#0B0A09]'
                          : 'border-white/15 text-stone-300 hover:border-[#C8A46B]/50 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
              <span className="font-mono text-xs text-stone-400 tabular-nums">
                {filteredItems.length}{' '}
                {filteredItems.length > 1 ? 'photographies' : 'photographie'}
              </span>
            </div>

            <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
              {filteredItems.map((item, idx) => (
                <GalleryCard
                  key={item.id}
                  item={item}
                  repoConfig={activeRepoConfig}
                  viewMode="masonry"
                  onSelect={() => setLightboxState({items: filteredItems, index: idx})}
                  onDimensionsLoad={handleDimensionsLoad}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ======================== VIDÉOS ======================== */}
        <section id="videos" className="border-t border-white/10 bg-[#070708] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-4 pb-10 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A46B]">
                  Productions audiovisuelles
                </p>
                <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight text-white text-balance sm:text-5xl">
                  Vidéos &amp; Films
                </h2>
              </div>
              <p className="max-w-md text-sm text-stone-400">
                Nos créations vidéo en mouvement.
              </p>
            </div>

            <div className="grid items-start gap-8 lg:grid-cols-12">
              <div className="aspect-video overflow-hidden rounded-xl border border-white/10 bg-[#101013] lg:col-span-8">
                {activeYoutubeId ? (
                  <iframe
                    key={`${activeYoutubeId}-${playTrigger}`}
                    src={`https://www.youtube-nocookie.com/embed/${activeYoutubeId}?rel=0${
                      playTrigger > 0 ? '&autoplay=1&playsinline=1' : ''
                    }`}
                    title="DIONTADO PRODUCTION Vidéo"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full border-0"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#191511] to-[#070708] p-8 text-center">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[#C8A46B]/40 text-[#C8A46B]">
                      <Play className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <h3 className="font-display text-2xl font-semibold text-white">
                      {YOUTUBE_PLAYLIST[activeVideoIdx]?.title}
                    </h3>
                    <p className="mt-2 max-w-md text-sm text-stone-400">
                      Collez une URL ou un ID YouTube ci-contre pour tester immédiatement la lecture dans ce lecteur cinéma.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3 lg:col-span-4">
                {YOUTUBE_PLAYLIST.map((vid, idx) => (
                  <button
                    key={vid.title}
                    type="button"
                    onClick={() => {
                      setActiveVideoIdx(idx);
                      if (vid.id) {
                        setActiveYoutubeId(vid.id);
                        setPlayTrigger((prev) => prev + 1);
                      }
                    }}
                    className={`w-full rounded-lg border p-4 text-left transition-colors ${
                      activeVideoIdx === idx
                        ? 'border-[#C8A46B] bg-[#C8A46B]/10'
                        : 'border-white/10 bg-[#111114] hover:border-white/25'
                    }`}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#C8A46B]">
                      {vid.category}
                    </p>
                    <p className="mt-1 font-display text-xl font-semibold text-white">
                      {vid.title}
                    </p>
                  </button>
                ))}

                <div className="rounded-lg border border-white/10 bg-[#16161A] p-4">
                  <label htmlFor="yt-preview-input" className="block text-xs text-stone-400">
                    Tester un lien YouTube
                  </label>
                  <div className="mt-2 flex gap-2">
                    <input
                      id="yt-preview-input"
                      type="text"
                      value={customYoutubeInput}
                      onChange={(e) => setCustomYoutubeInput(e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      className="h-9 min-w-0 flex-1 rounded-md border border-white/15 bg-[#070708] px-3 text-xs text-white focus:border-[#C8A46B] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const id = extractYouTubeId(customYoutubeInput);
                        if (id) {
                          setActiveYoutubeId(id);
                          setPlayTrigger((prev) => prev + 1);
                        }
                      }}
                      className="h-9 rounded-md bg-[#C8A46B] px-3 text-xs font-semibold text-[#0B0A09] hover:bg-[#DFBE89]"
                    >
                      Lire
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================== NOS SERVICES (2 services uniquement) ======================== */}
        <section id="services" className="border-t border-white/10 bg-[#111114] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-4 pb-10 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A46B]">
                  Nos services
                </p>
                <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight text-white text-balance sm:text-5xl">
                  Deux savoir-faire d’excellence
                </h2>
              </div>
              <p className="max-w-md text-sm text-stone-400">
                L’image fixe et animée, avec douceur et précision.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <article className="overflow-hidden rounded-xl border border-white/10 bg-[#070708]">
                <div className="aspect-[16/10] w-full overflow-hidden">
                  <ResilientImage
                    item={servicePhotoItem}
                    repoConfig={activeRepoConfig}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-8">
                  <p className="text-xs font-semibold tracking-[0.14em] text-[#C8A46B]">
                    SERVICE 01
                  </p>
                  <h3 className="mt-2 font-display text-3xl font-semibold text-white">
                    Photographie professionnelle
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-stone-400">
                    Portraits, studio, prewedding et reportages culturels captés avec justesse et lumière naturelle.
                  </p>
                </div>
              </article>

              <article className="overflow-hidden rounded-xl border border-white/10 bg-[#070708]">
                <div className="aspect-[16/10] w-full overflow-hidden">
                  <ResilientImage
                    item={serviceVideoItem}
                    repoConfig={activeRepoConfig}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-8">
                  <p className="text-xs font-semibold tracking-[0.14em] text-[#C8A46B]">
                    SERVICE 02
                  </p>
                  <h3 className="mt-2 font-display text-3xl font-semibold text-white">
                    Production et réalisation vidéo
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-stone-400">
                    Réalisation, cadrage et montage de films, clips et récits visuels au rendu cinéma.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* ======================== BIOGRAPHIE ======================== */}
        <section id="biographie" className="border-t border-white/10 bg-[#070708] py-20 text-[#F5F3EE]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-8 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A46B]">
                  Biographie · Fondateur
                </p>
                <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight text-white text-balance sm:text-5xl">
                  DIONTADO PHOTOGRAPHY
                </h2>
                <p className="mt-2 font-display text-2xl italic text-[#DFBE89]">
                  L’art de raconter des histoires.
                </p>
              </div>
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-stone-400">
                Amadou Sy · Depuis juin 2022
              </p>
            </div>

            <div className="mt-12 grid items-start gap-10 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <div className="overflow-hidden rounded-xl border border-white/10 bg-[#111114]">
                  <div className="aspect-[4/5] w-full overflow-hidden bg-[#191817]">
                    <img
                      src="/assets/aistudio/1C1A6618_copie_af7a2459.jpg"
                      alt="Amadou Sy — Fondateur de DIONTADO PHOTOGRAPHY"
                      loading="lazy"
                      className="h-full w-full object-cover object-top"
                    />
                  </div>
                  <div className="border-t border-white/10 p-6">
                    <p className="font-display text-2xl font-semibold text-white">
                      Amadou Sy
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#C8A46B]">
                      Fondateur · Photographe &amp; Réalisateur
                    </p>
                    <p className="mt-4 border-t border-white/10 pt-4 font-display text-lg italic text-[#E6DCCB]">
                      « Des photos qui racontent votre histoire. »
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-8 lg:col-span-7">
                <div className="space-y-4 text-sm leading-relaxed text-stone-300 sm:text-base">
                  <p>
                    Créée en juin 2022 par <strong className="text-white">Amadou Sy</strong>, Diontado est une marque sénégalaise spécialisée dans la photographie et la production audiovisuelle.
                  </p>
                  <p>
                    Née d’une passion pour l’image et la créativité, Diontado a pour mission de capturer les émotions, immortaliser les moments importants et donner vie aux idées à travers des créations visuelles authentiques et soignées.
                  </p>
                  <p>
                    De la photographie de portrait aux mariages, en passant par les événements, les shootings artistiques et la réalisation vidéo, Diontado accompagne particuliers, professionnels et entreprises dans leurs projets visuels.
                  </p>
                  <p>
                    Basée à Dakar, au Sénégal, Diontado construit progressivement son identité autour de la créativité, de la qualité et du sens du détail.
                  </p>
                  <p className="font-medium text-[#E6DCCB]">
                    Notre ambition est de faire de chaque image une histoire, de chaque projet une expérience et de chaque création une signature.
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#111114] p-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C8A46B]">
                    Notre approche
                  </p>
                  <div className="mt-4 space-y-3 text-sm leading-relaxed text-stone-300">
                    <p>
                      Chez Diontado Photography, nous croyons que chaque image a une histoire à raconter. Notre approche repose sur l’écoute, la créativité et l’attention portée aux détails.
                    </p>
                    <p>
                      Nous prenons le temps de comprendre chaque projet, chaque personnalité et chaque vision afin de proposer des créations visuelles qui reflètent véritablement l’identité de nos clients.
                    </p>
                    <p>
                      De la conception à la réalisation, nous privilégions un travail soigné, une direction artistique cohérente et une approche humaine.
                    </p>
                    <p>
                      Notre objectif n’est pas simplement de prendre des photos ou de réaliser des vidéos, mais de créer des images qui transmettent des émotions, racontent des histoires et laissent une empreinte dans le temps.
                    </p>
                  </div>
                  <p className="mt-5 border-t border-white/10 pt-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#DFBE89]">
                    Notre philosophie : écouter, imaginer, créer et raconter
                  </p>
                </div>
              </div>
            </div>

            {/* BTS — Coulisses & Coéquipiers (sous Notre approche) */}
            <div className="mt-14 border-t border-white/10 pt-12">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A46B]">
                    Coulisses &amp; Coéquipiers (BTS)
                  </p>
                  <h3 className="mt-2 font-display text-3xl font-semibold text-white sm:text-4xl">
                    Sur le terrain &amp; au editing
                  </h3>
                </div>
                <p className="max-w-md text-sm text-stone-400">
                  Nos anciens et nouveaux coéquipiers en action sur le terrain et en post-production.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div role="tablist" aria-label="Filtrer les photos BTS" className="flex flex-wrap gap-2">
                  {(
                    [
                      'Tous',
                      'Sur le terrain',
                      'Editing',
                    ] as const
                  ).map((tab) => {
                    const isActive = btsFilter === tab;
                    return (
                      <button
                        key={tab}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setBtsFilter(tab)}
                        className={`rounded-md border px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                          isActive
                            ? 'border-[#C8A46B] bg-[#C8A46B] font-semibold text-[#0B0A09]'
                            : 'border-white/15 text-stone-300 hover:border-[#C8A46B]/50 hover:text-white'
                        }`}
                      >
                        {tab}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-xs text-stone-400 tabular-nums">
                    {filteredBtsItems.length}{' '}
                    {filteredBtsItems.length > 1 ? 'photos BTS' : 'photo BTS'}
                  </span>
                  <input
                    ref={oldBtsInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleLocalBtsUpload(e, 'Sur le terrain')}
                  />
                  <input
                    ref={newBtsInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleLocalBtsUpload(e, 'Editing')}
                  />
                  <button
                    type="button"
                    onClick={() => oldBtsInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-[#111114] px-3 py-1.5 text-xs text-stone-200 transition-colors hover:border-[#C8A46B]"
                  >
                    <Upload className="h-3.5 w-3.5 text-[#C8A46B]" aria-hidden="true" />
                    <span>+ Terrain</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => newBtsInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-[#111114] px-3 py-1.5 text-xs text-stone-200 transition-colors hover:border-[#C8A46B]"
                  >
                    <Upload className="h-3.5 w-3.5 text-[#C8A46B]" aria-hidden="true" />
                    <span>+ Editing</span>
                  </button>
                </div>
              </div>

              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {filteredBtsItems.map((bts, idx) => (
                  <button
                    key={bts.id}
                    type="button"
                    onClick={() => {
                      if (bts.url) {
                        setLightboxState({items: filteredBtsItems, index: idx});
                      }
                    }}
                    className="group overflow-hidden rounded-xl border border-white/10 bg-[#111114] text-left transition-colors hover:border-[#C8A46B]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A46B]"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0B0B0D]">
                      <ResilientImage
                        item={bts}
                        repoConfig={activeRepoConfig}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                      {bts.url && (
                        <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-md bg-black/65 text-[#DFBE89] opacity-0 transition-opacity group-hover:opacity-100">
                          <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#C8A46B]">
                        {bts.folder}
                      </p>
                      <p className="mt-1 truncate font-display text-lg font-semibold text-white">
                        {bts.name}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ======================== À PROPOS ======================== */}
        <section id="apropos" className="border-t border-white/10 bg-[#111114] py-20 text-[#F5F3EE]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-6 border-b border-white/10 pb-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A46B]">
                  À propos
                </p>
                <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight text-white text-balance sm:text-5xl">
                  Une maison d’image et de cinéma
                </h2>
              </div>
              {brandAssets.logoHeaderDark?.url && (
                <div className="h-11 max-w-[220px] overflow-hidden">
                  <ResilientImage
                    item={brandAssets.logoHeaderDark}
                    repoConfig={activeRepoConfig}
                    alt="DIONTADO PRODUCTION"
                    className="h-11 w-auto object-contain"
                  />
                </div>
              )}
            </div>

            <div className="mt-12 grid items-start gap-10 lg:grid-cols-12">
              <div className="rounded-xl border border-white/10 bg-[#070708] p-8 lg:col-span-5">
                {brandAssets.logoContactDark?.url ? (
                  <div className="mb-6 h-24 max-w-[200px] overflow-hidden">
                    <ResilientImage
                      item={brandAssets.logoContactDark}
                      repoConfig={activeRepoConfig}
                      alt="DIONTADO PRODUCTION"
                      className="h-24 w-auto object-contain"
                    />
                  </div>
                ) : (
                  <p className="mb-4 font-display text-2xl font-semibold tracking-wide text-white">
                    DIONTADO PRODUCTION
                  </p>
                )}

                <p className="text-sm leading-relaxed text-stone-300">
                  Création vidéo et photographie d’auteur à la sensibilité douce, sincère et cinématographique.
                </p>

                <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
                  {brandAssets.logoIcon?.url && (
                    <img
                      src={brandAssets.logoIcon.url}
                      alt="Emblème DIONTADO PRODUCTION"
                      className="h-11 w-11 rounded-lg object-contain"
                    />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-white">DIONTADO PRODUCTION</p>
                    <p className="text-xs text-stone-400">Photographie &amp; Cinéma</p>
                  </div>
                </div>
              </div>

              <div className="space-y-7 lg:col-span-7">
                <div className="border-b border-white/10 pb-6">
                  <p className="text-xs font-semibold tracking-widest text-[#C8A46B]">
                    01 · NOTRE VISION
                  </p>
                  <h3 className="mt-1 font-display text-2xl font-semibold text-white">
                    Sublimer chaque instant
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-400">
                    Des images vraies, élégantes et intemporelles.
                  </p>
                </div>

                <div className="border-b border-white/10 pb-6">
                  <p className="text-xs font-semibold tracking-widest text-[#C8A46B]">
                    02 · NOTRE PASSION
                  </p>
                  <h3 className="mt-1 font-display text-2xl font-semibold text-white">
                    La lumière et l’émotion
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-400">
                    Chaque cadre cherche le naturel, la douceur et la sincérité du regard.
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold tracking-widest text-[#C8A46B]">
                    03 · NOTRE APPROCHE
                  </p>
                  <h3 className="mt-1 font-display text-2xl font-semibold text-white">
                    Simple, soignée et professionnelle
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-400">
                    De la prise de vue au rendu final, chaque détail compte.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <ContactSection brandAssets={brandAssets} repoConfig={activeRepoConfig} />
      </main>

      {/* ======================== FOOTER ======================== */}
      <footer className="border-t border-white/10 bg-[#070708] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            {brandAssets.logoFooter?.url ? (
              <div className="h-9 max-w-[180px] overflow-hidden">
                <ResilientImage
                  item={brandAssets.logoFooter}
                  repoConfig={activeRepoConfig}
                  alt="DIONTADO PRODUCTION"
                  className="h-9 w-auto object-contain"
                />
              </div>
            ) : (
              <span className="font-display text-lg font-semibold tracking-wider text-white">
                DIONTADO PRODUCTION
              </span>
            )}
          </div>

          <p className="text-xs text-stone-400">
            &copy; {new Date().getFullYear()} DIONTADO PRODUCTION — Yeumbeul, Dakar, Sénégal.
          </p>

          <div className="flex flex-wrap items-center gap-5 text-xs text-stone-400">
            <a href="#realisations" className="hover:text-[#DFBE89]">
              Réalisations
            </a>
            <a href="#videos" className="hover:text-[#DFBE89]">
              Vidéos
            </a>
            <a href="#services" className="hover:text-[#DFBE89]">
              Services
            </a>
            <a href="#biographie" className="hover:text-[#DFBE89]">
              Biographie
            </a>
            <a href="#apropos" className="hover:text-[#DFBE89]">
              À propos
            </a>
            <a
              href="https://www.instagram.com/diontado_photography"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#DFBE89]"
            >
              Instagram
            </a>
          </div>
          </div>
        </div>
      </footer>

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
