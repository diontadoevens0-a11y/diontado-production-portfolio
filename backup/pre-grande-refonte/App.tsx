import {
  ArrowRight,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Film,
  FolderGit2,
  Maximize2,
  MessageCircle,
  Play,
  Upload,
} from 'lucide-react';
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
  DIONTADO_PRICING_OFFERS,
  DIONTADO_SLATES,
  DIONTADO_VIDEOS,
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

const CATEGORY_TAXONOMY = [
  'Portrait',
  'Mariage',
  'Prewedding',
  'Culture',
  'Mode',
  'Studio',
  'Événementiel',
  'Extérieur',
];

export default function App() {
  const [items, setItems] = useState<GalleryItem[]>(DIONTADO_SLATES);
  const [brandAssets, setBrandAssets] = useState<BrandAssets>(EMPTY_BRAND_ASSETS);
  const [activeRepoConfig, setActiveRepoConfig] = useState<GitHubRepoConfig | null>(null);
  const [repoMeta, setRepoMeta] = useState<GitHubRepoMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Toutes');
  const [btsFilter, setBtsFilter] = useState<'Tous' | 'Sur le terrain' | 'Editing'>('Tous');
  const [localBtsItems, setLocalBtsItems] = useState<GalleryItem[]>([]);
  const [lightboxState, setLightboxState] = useState<{
    items: GalleryItem[];
    index: number;
  } | null>(null);
  const oldBtsInputRef = useRef<HTMLInputElement | null>(null);
  const newBtsInputRef = useRef<HTMLInputElement | null>(null);

  // Hero slideshow state
  const [activeHeroIdx, setActiveHeroIdx] = useState(0);

  // Video portfolio state
  const [activeVideoIdx, setActiveVideoIdx] = useState(0);
  const [playTrigger, setPlayTrigger] = useState(0);

  // Selected service for reservation form
  const [selectedPrestation, setSelectedPrestation] = useState<string>(
    'Photographie professionnelle'
  );

  const handleBookPrestation = useCallback((prestation: string) => {
    setSelectedPrestation(prestation);
    const target = document.getElementById('contact');
    if (target) {
      target.scrollIntoView({behavior: 'smooth'});
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
        githubUrl: '#apropos',
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

  const categories = useMemo(() => {
    const presentFolders = new Set(items.map((item) => item.folder));
    const ordered = CATEGORY_TAXONOMY.filter((cat) => presentFolders.has(cat));
    const extras = Array.from(presentFolders).filter(
      (cat) => !CATEGORY_TAXONOMY.includes(cat) && cat !== 'Couverture' && cat !== 'Identité'
    );
    return ['Toutes', ...ordered, ...extras];
  }, [items]);

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

    for (const fileName of preferredOrder) {
      const match = loadedGallery.find(
        (item) => item.fileName.toLowerCase() === fileName.toLowerCase()
      );
      if (match && !selected.some((s) => s.id === match.id)) {
        selected.push(match);
      }
    }

    if (selected.length < 6) {
      for (const item of loadedGallery) {
        if (selected.length >= 6) break;
        if (!selected.some((s) => s.id === item.id)) {
          selected.push(item);
        }
      }
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
    }, 4800);
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

  const activeVideo = DIONTADO_VIDEOS[activeVideoIdx] || DIONTADO_VIDEOS[0];

  return (
    <div id="accueil" className="min-h-screen bg-[#070708] text-[#F5F3EE]">
      <Header brandAssets={brandAssets} repoConfig={activeRepoConfig} />

      {/* Workspace Export & GitHub Repository Bar (for managing your live GitHub Pages deployment) */}
      <div className="border-b border-white/10 bg-[#0D0D10]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 text-xs sm:px-6 lg:px-8">
          <p className="text-stone-400">
            {repoMeta
              ? `Synchronisé avec GitHub : ${repoMeta.fullName}`
              : 'Médias chargés depuis diontadoevens0-a11y/diontado-production-portfolio · Prêt pour GitHub Pages.'}
          </p>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsConfigOpen(true)}
              className="inline-flex items-center gap-1.5 font-medium text-[#DFBE89] hover:underline whitespace-nowrap"
            >
              <FolderGit2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{repoMeta ? 'Changer de dépôt' : 'Lier un autre dépôt'}</span>
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
        {/* ======================== 1. ACCUEIL (HERO) ======================== */}
        <section className="relative flex min-h-[82vh] items-end overflow-hidden border-b border-white/10 py-16 lg:py-24">
          <div className="absolute inset-0 z-0">
            {heroSlides.map((slide, idx) => {
              const isActive = idx === activeHeroIdx % heroSlides.length;
              return (
                <div
                  key={slide.id}
                  aria-hidden={!isActive}
                  className={`absolute inset-0 transition-all duration-1000 ease-out ${
                    isActive
                      ? 'opacity-100 scale-100'
                      : 'pointer-events-none opacity-0 scale-[1.03]'
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
            className="absolute inset-0 z-[1] bg-gradient-to-t from-[#070708] via-[#070708]/60 to-[#070708]/55"
          />

          <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#DFBE89]">
                  DIONTADO PRODUCTION · SÉNÉGAL
                </p>

                <h1 className="mt-3 max-w-2xl font-display text-5xl font-semibold leading-[1.03] tracking-tight text-white text-balance sm:text-6xl lg:text-7xl">
                  L’image raconte. Le cinéma fait ressentir.
                </h1>

                <p className="mt-5 max-w-xl text-sm leading-relaxed text-stone-200 sm:text-base">
                  Maison de production audiovisuelle et studio photographique. Nous accompagnons particuliers, artistes, marques et institutions dans la création d’images intemporelles.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <a
                    href="#realisations"
                    className="inline-flex h-11 items-center justify-center rounded-md bg-[#C8A46B] px-6 text-sm font-semibold text-[#0B0A09] transition-colors hover:bg-[#DFBE89]"
                  >
                    Découvrir nos réalisations
                  </a>
                  <a
                    href="#contact"
                    className="inline-flex h-11 items-center justify-center rounded-md border border-white/35 bg-black/45 px-6 text-sm font-medium text-white transition-colors hover:border-[#C8A46B] hover:text-[#DFBE89]"
                  >
                    Réserver une prestation
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
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-black/50 text-white transition-colors hover:border-[#C8A46B] hover:text-[#DFBE89]"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <div
                    className="flex items-center gap-1.5"
                    role="tablist"
                    aria-label="Diaporama d’accueil"
                  >
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
                            isCurrent ? 'w-7 bg-[#C8A46B]' : 'w-2 bg-white/35 hover:bg-white/60'
                          }`}
                        />
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    aria-label="Image suivante"
                    onClick={() => setActiveHeroIdx((prev) => (prev + 1) % heroSlides.length)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-black/50 text-white transition-colors hover:border-[#C8A46B] hover:text-[#DFBE89]"
                  >
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Présentation des 2 activités principales sous l'Accueil */}
        <section
          aria-label="Domaines d’expertise"
          className="border-b border-white/10 bg-[#0B0B0D]"
        >
          <div className="mx-auto grid max-w-7xl divide-y divide-white/10 px-4 sm:px-6 md:grid-cols-2 md:divide-x md:divide-y-0 lg:px-8">
            <a
              href="#realisations"
              className="group flex items-start justify-between gap-6 py-7 transition-colors md:pr-10"
            >
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#C8A46B]">
                  01 · Activité principale
                </p>
                <h2 className="mt-1.5 font-display text-2xl font-semibold text-white transition-colors group-hover:text-[#DFBE89] sm:text-3xl">
                  Photographie Professionnelle
                </h2>
                <p className="mt-2 text-sm text-stone-400">
                  Mariage, cérémonie, portrait, mode, culture et shooting studio sur mesure.
                </p>
              </div>
              <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-stone-300 transition-colors group-hover:border-[#C8A46B] group-hover:text-[#DFBE89]">
                <Camera className="h-4 w-4" aria-hidden="true" />
              </span>
            </a>

            <a
              href="#videos"
              className="group flex items-start justify-between gap-6 py-7 transition-colors md:pl-10"
            >
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#C8A46B]">
                  02 · Activité principale
                </p>
                <h2 className="mt-1.5 font-display text-2xl font-semibold text-white transition-colors group-hover:text-[#DFBE89] sm:text-3xl">
                  Réalisation &amp; Production Vidéo
                </h2>
                <p className="mt-2 text-sm text-stone-400">
                  Films de mariage, reportages culturels, événements et films institutionnels.
                </p>
              </div>
              <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-stone-300 transition-colors group-hover:border-[#C8A46B] group-hover:text-[#DFBE89]">
                <Film className="h-4 w-4" aria-hidden="true" />
              </span>
            </a>
          </div>
        </section>

        {/* ======================== 2. À PROPOS & BIOGRAPHIE ======================== */}
        <section id="apropos" className="bg-[#070708] py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-6 border-b border-white/10 pb-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A46B]">
                  À propos · Maison de production
                </p>
                <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight text-white text-balance sm:text-5xl">
                  DIONTADO PRODUCTION
                </h2>
                <p className="mt-2 font-display text-2xl italic text-[#DFBE89]">
                  L’art de raconter des histoires par l’image et le cinéma.
                </p>
              </div>
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-stone-400">
                Fondée par Amadou Sy · Juin 2022 · Sénégal
              </p>
            </div>

            <div className="mt-12 grid items-start gap-10 lg:grid-cols-12">
              {/* Portrait du fondateur Amadou Sy */}
              <div className="lg:col-span-5">
                <div className="overflow-hidden rounded-xl border border-white/10 bg-[#111114]">
                  <div className="aspect-[4/5] w-full overflow-hidden bg-[#191817]">
                    <img
                      src="/assets/aistudio/1C1A6618_copie_af7a2459.jpg"
                      alt="Amadou Sy — Fondateur de DIONTADO PRODUCTION"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover object-top"
                    />
                  </div>
                  <div className="border-t border-white/10 p-6">
                    <p className="font-display text-2xl font-semibold text-white">Amadou Sy</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#C8A46B]">
                      Fondateur · Réalisateur &amp; Photographe
                    </p>
                    <p className="mt-4 border-t border-white/10 pt-4 font-display text-lg italic text-[#E6DCCB]">
                      « L’image raconte. Le cinéma fait ressentir. »
                    </p>
                  </div>
                </div>
              </div>

              {/* Histoire, Approche & Piliers */}
              <div className="space-y-8 lg:col-span-7">
                <div className="space-y-4 text-sm leading-relaxed text-stone-300 sm:text-base">
                  <p>
                    Créée en juin 2022 au Sénégal par <strong className="text-white">Amadou Sy</strong>,{' '}
                    <strong className="text-white">DIONTADO PRODUCTION</strong> est une maison dédiée à la photographie professionnelle et à la production audiovisuelle.
                  </p>
                  <p>
                    Née d’une exigence artistique et d’une passion profonde pour le récit visuel, la maison accompagne particuliers, couples, artistes, marques et institutions avec une signature sobre, humaine et cinématographique.
                  </p>
                  <p>
                    Basée à Dakar (Yeumbeul), <strong className="text-white">DIONTADO PRODUCTION</strong> intervient partout au Sénégal et à l’international pour transformer chaque projet en une œuvre durable et mémorable.
                  </p>
                </div>

                {/* 3 piliers de direction artistique */}
                <div className="grid gap-6 border-y border-white/10 py-6 sm:grid-cols-3">
                  <div>
                    <p className="font-mono text-xs text-[#C8A46B]">01 · Vision</p>
                    <h3 className="mt-1 font-display text-xl font-semibold text-white">
                      Écoute &amp; Précision
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-stone-400">
                      Comprendre chaque personnalité et chaque projet avant de cadrer.
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-xs text-[#C8A46B]">02 · Exigence</p>
                    <h3 className="mt-1 font-display text-xl font-semibold text-white">
                      Esthétique Cinéma
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-stone-400">
                      Maîtrise de la lumière, du mouvement et de l’étalonnage sur mesure.
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-xs text-[#C8A46B]">03 · Empreinte</p>
                    <h3 className="mt-1 font-display text-xl font-semibold text-white">
                      Récits Durables
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-stone-400">
                      Des images sincères qui traversent le temps sans perdre leur force.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#111114] p-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C8A46B]">
                    Notre approche
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-stone-300">
                    De la conception à la post-production, nous privilégions un accompagnement rigoureux, une direction artistique cohérente et une présence humaine rassurante sur le terrain.
                  </p>
                  <p className="mt-4 border-t border-white/10 pt-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#DFBE89]">
                    Notre philosophie : écouter · imaginer · créer · raconter
                  </p>
                </div>
              </div>
            </div>

            {/* BTS — Coulisses & Coéquipiers (sous Notre approche) */}
            <div className="mt-16 border-t border-white/10 pt-12">
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
                  {(['Tous', 'Sur le terrain', 'Editing'] as const).map((tab) => {
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

        {/* ======================== 3. SERVICES & TARIFS ======================== */}
        <section id="services" className="border-t border-white/10 bg-[#111114] py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-4 pb-10 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A46B]">
                  Nos services &amp; offres
                </p>
                <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight text-white text-balance sm:text-5xl">
                  Photographie &amp; Réalisation Vidéo
                </h2>
              </div>
              <p className="max-w-md text-sm text-stone-400">
                Des prestations sur mesure conçues pour répondre aux exigences des particuliers, créateurs et entreprises.
              </p>
            </div>

            {/* Deux pôles principaux */}
            <div className="grid gap-8 md:grid-cols-2">
              <article className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#070708]">
                <div className="aspect-[16/10] w-full overflow-hidden">
                  <ResilientImage
                    item={servicePhotoItem}
                    repoConfig={activeRepoConfig}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between p-8">
                  <div>
                    <p className="font-mono text-xs font-semibold tracking-[0.14em] text-[#C8A46B]">
                      01 · PHOTOGRAPHIE PROFESSIONNELLE
                    </p>
                    <h3 className="mt-2 font-display text-3xl font-semibold text-white">
                      Capturer l’émotion avec justesse
                    </h3>
                    <ul className="mt-4 space-y-2 text-sm text-stone-300">
                      <li className="flex items-center gap-2.5">
                        <Check className="h-4 w-4 shrink-0 text-[#C8A46B]" aria-hidden="true" />
                        <span>Mariage &amp; Prewedding</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Check className="h-4 w-4 shrink-0 text-[#C8A46B]" aria-hidden="true" />
                        <span>Cérémonie &amp; Réception</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Check className="h-4 w-4 shrink-0 text-[#C8A46B]" aria-hidden="true" />
                        <span>Événement professionnel &amp; culturel</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Check className="h-4 w-4 shrink-0 text-[#C8A46B]" aria-hidden="true" />
                        <span>Portrait artistique &amp; studio</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Check className="h-4 w-4 shrink-0 text-[#C8A46B]" aria-hidden="true" />
                        <span>Shooting professionnel pour marques</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-7 border-t border-white/10 pt-5">
                    <button
                      type="button"
                      onClick={() => handleBookPrestation('Photographie professionnelle')}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#C8A46B] px-5 text-xs font-semibold text-[#0B0A09] transition-colors hover:bg-[#DFBE89]"
                    >
                      <span>Réserver maintenant</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </article>

              <article className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#070708]">
                <div className="aspect-[16/10] w-full overflow-hidden">
                  <ResilientImage
                    item={serviceVideoItem}
                    repoConfig={activeRepoConfig}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between p-8">
                  <div>
                    <p className="font-mono text-xs font-semibold tracking-[0.14em] text-[#C8A46B]">
                      02 · RÉALISATION VIDÉO
                    </p>
                    <h3 className="mt-2 font-display text-3xl font-semibold text-white">
                      Mettre vos projets en mouvement
                    </h3>
                    <ul className="mt-4 space-y-2 text-sm text-stone-300">
                      <li className="flex items-center gap-2.5">
                        <Check className="h-4 w-4 shrink-0 text-[#C8A46B]" aria-hidden="true" />
                        <span>Film de mariage cinématographique</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Check className="h-4 w-4 shrink-0 text-[#C8A46B]" aria-hidden="true" />
                        <span>Vidéo événementielle &amp; Aftermovie</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Check className="h-4 w-4 shrink-0 text-[#C8A46B]" aria-hidden="true" />
                        <span>Film institutionnel &amp; présentation d’entreprise</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Check className="h-4 w-4 shrink-0 text-[#C8A46B]" aria-hidden="true" />
                        <span>Reportage culturel &amp; documentaire</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Check className="h-4 w-4 shrink-0 text-[#C8A46B]" aria-hidden="true" />
                        <span>Production audiovisuelle complète</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-7 border-t border-white/10 pt-5">
                    <button
                      type="button"
                      onClick={() => handleBookPrestation('Réalisation vidéo')}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#C8A46B] px-5 text-xs font-semibold text-[#0B0A09] transition-colors hover:bg-[#DFBE89]"
                    >
                      <span>Réserver maintenant</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </article>
            </div>

            {/* Grille tarifaire personnalisable (sans prix fictifs) */}
            <div className="mt-16 border-t border-white/10 pt-14">
              <div className="flex flex-col justify-between gap-4 pb-8 md:flex-row md:items-end">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A46B]">
                    Formules &amp; Tarification
                  </p>
                  <h3 className="mt-2 font-display text-3xl font-semibold text-white sm:text-4xl">
                    Une proposition adaptée à chaque projet
                  </h3>
                </div>
                <p className="max-w-md text-sm text-stone-400">
                  Chaque production ayant ses propres besoins (durée, équipe, lieu, livrables), nos tarifs sont établis sur devis transparent après échange.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {DIONTADO_PRICING_OFFERS.map((offer) => (
                  <div
                    key={offer.id}
                    className="flex flex-col justify-between rounded-xl border border-white/10 bg-[#070708] p-6"
                  >
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#C8A46B]">
                        {offer.category}
                      </p>
                      <h4 className="mt-2 font-display text-2xl font-semibold text-white">
                        {offer.name}
                      </h4>
                      <p className="mt-3 font-mono text-lg font-semibold text-[#DFBE89] tabular-nums">
                        {offer.priceLabel}
                      </p>
                      <p className="mt-2 text-xs leading-relaxed text-stone-400">
                        {offer.summary}
                      </p>
                      <ul className="mt-4 space-y-2 border-t border-white/10 pt-4 text-xs text-stone-300">
                        {offer.deliverables.map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <span aria-hidden="true" className="text-[#C8A46B]">·</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleBookPrestation(offer.prestationValue)}
                      className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-md border border-white/20 bg-white/5 px-4 text-xs font-semibold text-white transition-colors hover:border-[#C8A46B] hover:bg-[#C8A46B] hover:text-[#0B0A09]"
                    >
                      Réserver cette formule
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ======================== 4. RÉALISATIONS PHOTO ======================== */}
        <section id="realisations" className="border-t border-white/10 bg-[#070708] py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-4 pb-8 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A46B]">
                  Réalisations Photo
                </p>
                <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight text-white text-balance sm:text-5xl">
                  Portfolio photographique
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <p className="max-w-sm text-sm text-stone-400">
                  Cliquez sur n’importe quelle photographie pour l’afficher en haute résolution.
                </p>
                <button
                  type="button"
                  onClick={() => handleBookPrestation('Photographie professionnelle')}
                  className="inline-flex h-10 items-center justify-center rounded-md border border-[#C8A46B]/60 px-4 text-xs font-semibold text-[#DFBE89] transition-colors hover:bg-[#C8A46B] hover:text-[#0B0A09] whitespace-nowrap"
                >
                  Réserver un shooting
                </button>
              </div>
            </div>

            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div role="tablist" aria-label="Catégories photo" className="flex flex-wrap gap-2">
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

        {/* ======================== 5. RÉALISATIONS VIDÉO ======================== */}
        <section id="videos" className="border-t border-white/10 bg-[#111114] py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-4 pb-10 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A46B]">
                  Réalisations Vidéo
                </p>
                <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight text-white text-balance sm:text-5xl">
                  Films, Showreels &amp; Reportages
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <p className="max-w-sm text-sm text-stone-400">
                  Sélectionnez un film ci-contre pour lancer immédiatement la lecture dans le lecteur cinéma.
                </p>
                <button
                  type="button"
                  onClick={() => handleBookPrestation('Réalisation vidéo')}
                  className="inline-flex h-10 items-center justify-center rounded-md border border-[#C8A46B]/60 px-4 text-xs font-semibold text-[#DFBE89] transition-colors hover:bg-[#C8A46B] hover:text-[#0B0A09] whitespace-nowrap"
                >
                  Commander un film
                </button>
              </div>
            </div>

            <div className="grid items-start gap-8 lg:grid-cols-12">
              {/* Lecteur Vidéo Intégré (YouTube ou MP4 hébergé) */}
              <div className="lg:col-span-8">
                <div className="aspect-video overflow-hidden rounded-xl border border-white/10 bg-[#070708]">
                  {activeVideo.sourceType === 'mp4' && activeVideo.videoSrc ? (
                    <video
                      key={activeVideo.id}
                      src={activeVideo.videoSrc}
                      poster={activeVideo.posterUrl}
                      controls
                      playsInline
                      autoPlay={playTrigger > 0}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <iframe
                      key={`${activeVideo.youtubeId}-${playTrigger}`}
                      src={`https://www.youtube-nocookie.com/embed/${activeVideo.youtubeId}?rel=0${
                        playTrigger > 0 ? '&autoplay=1&playsinline=1' : ''
                      }`}
                      title={activeVideo.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full border-0"
                    />
                  )}
                </div>
                <div className="mt-4 flex flex-wrap items-baseline justify-between gap-3 border-b border-white/10 pb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#C8A46B]">
                      {activeVideo.category}
                    </p>
                    <h3 className="mt-1 font-display text-2xl font-semibold text-white">
                      {activeVideo.title}
                    </h3>
                    <p className="mt-1 text-sm text-stone-400">{activeVideo.desc}</p>
                  </div>
                </div>
              </div>

              {/* Liste des réalisations vidéo avec miniatures & descriptions */}
              <div className="space-y-4 lg:col-span-4">
                {DIONTADO_VIDEOS.map((vid, idx) => {
                  const isActive = activeVideoIdx === idx;
                  return (
                    <button
                      key={vid.id}
                      type="button"
                      onClick={() => {
                        setActiveVideoIdx(idx);
                        setPlayTrigger((prev) => prev + 1);
                      }}
                      className={`group flex w-full items-start gap-4 rounded-xl border p-3 text-left transition-colors ${
                        isActive
                          ? 'border-[#C8A46B] bg-[#C8A46B]/10'
                          : 'border-white/10 bg-[#070708] hover:border-white/25'
                      }`}
                    >
                      <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-lg bg-[#16161A]">
                        {vid.posterUrl ? (
                          <img
                            src={vid.posterUrl}
                            alt={vid.title}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[#C8A46B]">
                            <Film className="h-5 w-5" aria-hidden="true" />
                          </div>
                        )}
                        <span
                          className={`absolute inset-0 flex items-center justify-center bg-black/35 transition-opacity ${
                            isActive ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'
                          }`}
                        >
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C8A46B] text-[#0B0A09]">
                            <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                          </span>
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#C8A46B]">
                          {vid.category}
                        </p>
                        <p className="mt-0.5 line-clamp-2 font-display text-lg font-semibold leading-snug text-white">
                          {vid.title}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs text-stone-400">{vid.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ======================== 6. CONTACT / RÉSERVATION ======================== */}
        <ContactSection
          brandAssets={brandAssets}
          repoConfig={activeRepoConfig}
          selectedPrestation={selectedPrestation}
        />
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
              <a href="#accueil" className="hover:text-[#DFBE89]">
                Accueil
              </a>
              <a href="#apropos" className="hover:text-[#DFBE89]">
                À propos
              </a>
              <a href="#services" className="hover:text-[#DFBE89]">
                Services
              </a>
              <a href="#realisations" className="hover:text-[#DFBE89]">
                Photo
              </a>
              <a href="#videos" className="hover:text-[#DFBE89]">
                Vidéo
              </a>
              <a href="#contact" className="hover:text-[#DFBE89]">
                Contact
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

      {/* Bouton WhatsApp Flottant */}
      <a
        href="https://wa.me/221764812391?text=Bonjour%20DIONTADO%20PRODUCTION%2C%20je%20souhaite%20r%C3%A9server%20une%20prestation."
        target="_blank"
        rel="noreferrer"
        aria-label="Contacter DIONTADO PRODUCTION sur WhatsApp"
        className="fixed bottom-5 right-5 z-30 inline-flex h-11 items-center gap-2 rounded-full bg-[#1F7A4C] px-4 text-xs font-semibold text-white shadow-lg transition-transform hover:scale-105 hover:bg-[#258D58] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A46B]"
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
