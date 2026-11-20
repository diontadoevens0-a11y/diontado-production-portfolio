import {Download, FolderGit2, Play} from 'lucide-react';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {ContactSection} from './components/ContactSection';
import {GalleryCard} from './components/GalleryCard';
import {GitHubConfigModal} from './components/GitHubConfigModal';
import {Header} from './components/Header';
import {LightboxModal} from './components/LightboxModal';
import {ResilientImage} from './components/ResilientImage';
import {
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
    id: '',
    category: 'Production Vidéo',
    title: 'Showreel Officiel — DIONTADO PRODUCTION',
    desc: 'Sélection de réalisations cinématographiques, clips, campagnes et documentaires.',
  },
  {
    id: '',
    category: 'Culture',
    title: 'Reportage Culturel — Sénégal',
    desc: 'Immersion audiovisuelle au cœur des expressions artistiques et culturelles.',
  },
  {
    id: '',
    category: 'Publicité',
    title: 'Film Publicitaire & Direction Artistique',
    desc: 'Production de contenu visuel sur mesure pour marques et créateurs.',
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
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // YouTube state
  const [activeVideoIdx, setActiveVideoIdx] = useState(0);
  const [customYoutubeInput, setCustomYoutubeInput] = useState('');
  const [activeYoutubeId, setActiveYoutubeId] = useState('');

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

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'Toutes') return items;
    return items.filter(
      (item) => item.folder.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [items, selectedCategory]);

  const coverItem = brandAssets.cover || DIONTADO_COVER_SLATE;
  const servicePhotoItem =
    items.find((i) => i.fileName.toLowerCase() === 'portrait-02.jpg') ||
    items.find((i) => i.folder === 'Portrait') ||
    items[0];
  const serviceVideoItem =
    items.find((i) => i.fileName.toLowerCase() === 'publicite-01.jpg') ||
    items.find((i) => i.folder === 'Publicité') ||
    items[1] ||
    items[0];

  const categories = ['Toutes', 'Culture', 'Mariage', 'Portrait', 'Publicité'];

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
            <ResilientImage
              item={coverItem}
              repoConfig={activeRepoConfig}
              loading="eager"
              className="h-full w-full object-cover"
            />
          </div>
          <div
            aria-hidden="true"
            className="absolute inset-0 z-[1] bg-gradient-to-t from-[#070708] via-[#070708]/55 to-[#070708]/60"
          />

          <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-end gap-10 lg:grid-cols-12">
              <div className="lg:col-span-8">
                {brandAssets.logoHeaderDark?.url && (
                  <div className="mb-6 h-11 max-w-[240px] overflow-hidden">
                    <ResilientImage
                      item={brandAssets.logoHeaderDark}
                      repoConfig={activeRepoConfig}
                      loading="eager"
                      alt="DIONTADO PRODUCTION"
                      className="h-11 w-auto object-contain"
                    />
                  </div>
                )}

                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A46B]">
                  Yeumbeul, Sénégal · Production Audiovisuelle
                </p>
                <h1 className="mt-3 max-w-2xl font-display text-5xl font-semibold leading-[1.03] tracking-tight text-white text-balance sm:text-6xl lg:text-7xl">
                  Nous donnons vie à vos images.
                </h1>
                <p className="mt-5 max-w-xl text-base leading-relaxed text-stone-300">
                  DIONTADO PRODUCTION est une maison de production audiovisuelle dédiée à la réalisation vidéo cinématographique et à la photographie professionnelle : culture, mariage, portrait et publicité.
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
                    className="inline-flex h-11 items-center justify-center rounded-md border border-white/30 bg-black/40 px-6 text-sm font-medium text-white transition-colors hover:border-[#C8A46B]"
                  >
                    Nous contacter
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5 border-t border-white/15 pt-5 lg:col-span-4">
                <div>
                  <p className="text-xs text-stone-400">Activités principales</p>
                  <p className="mt-1 text-sm font-medium text-[#E6DCCB]">Vidéo &amp; Photographie</p>
                </div>
                <div>
                  <p className="text-xs text-stone-400">Localisation</p>
                  <p className="mt-1 text-sm font-medium text-[#E6DCCB]">Yeumbeul, Sénégal</p>
                </div>
                <div>
                  <p className="text-xs text-stone-400">Instagram</p>
                  <p className="mt-1 text-sm font-medium text-[#E6DCCB]">@diontado_photography</p>
                </div>
                <div>
                  <p className="text-xs text-stone-400">Collections</p>
                  <p className="mt-1 text-sm font-medium text-[#E6DCCB]">Culture · Mariage · Portrait · Pub</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================== À PROPOS ======================== */}
        <section id="apropos" className="bg-[#F6F4EF] py-20 text-[#141311]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-6 border-b border-stone-300 pb-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8B6734]">
                  À propos
                </p>
                <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight text-stone-950 text-balance sm:text-5xl">
                  Une maison d’image et de cinéma
                </h2>
              </div>
              {brandAssets.logoHeaderLight?.url && (
                <div className="h-11 max-w-[220px] overflow-hidden">
                  <ResilientImage
                    item={brandAssets.logoHeaderLight}
                    repoConfig={activeRepoConfig}
                    alt="DIONTADO PRODUCTION"
                    className="h-11 w-auto object-contain"
                  />
                </div>
              )}
            </div>

            <div className="mt-12 grid items-start gap-10 lg:grid-cols-12">
              <div className="rounded-xl border border-stone-300 bg-white p-8 lg:col-span-5">
                {brandAssets.logoContactLight?.url ? (
                  <div className="mb-6 h-24 max-w-[200px] overflow-hidden">
                    <ResilientImage
                      item={brandAssets.logoContactLight}
                      repoConfig={activeRepoConfig}
                      alt="DIONTADO PRODUCTION"
                      className="h-24 w-auto object-contain"
                    />
                  </div>
                ) : (
                  <p className="mb-4 font-display text-2xl font-semibold tracking-wide text-stone-950">
                    DIONTADO PRODUCTION
                  </p>
                )}

                <p className="text-sm leading-relaxed text-stone-600">
                  Basée à Yeumbeul au Sénégal, <strong>DIONTADO PRODUCTION</strong> réunit réalisation vidéo et photographie d’auteur pour accompagner les créateurs, les marques, les événements culturels et les histoires humaines avec une esthétique exigeante.
                </p>

                <div className="mt-6 flex items-center gap-3 border-t border-stone-200 pt-5">
                  {brandAssets.logoIcon?.url && (
                    <img
                      src={brandAssets.logoIcon.url}
                      alt="Emblème DIONTADO PRODUCTION"
                      className="h-11 w-11 rounded-lg object-contain"
                    />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-stone-900">DIONTADO PRODUCTION</p>
                    <p className="text-xs text-stone-500">Direction artistique · Yeumbeul, Sénégal</p>
                  </div>
                </div>
              </div>

              <div className="space-y-7 lg:col-span-7">
                <div className="border-b border-stone-300 pb-6">
                  <p className="text-xs font-semibold tracking-widest text-[#8B6734]">
                    01 · NOTRE VISION
                  </p>
                  <h3 className="mt-1 font-display text-2xl font-semibold text-stone-950">
                    Élever chaque récit au rang d’œuvre visuelle
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">
                    Nous croyons qu’une image forte dépasse la simple captation. Notre vision associe l’ancrage culturel sénégalais aux standards techniques des grands studios internationaux.
                  </p>
                </div>

                <div className="border-b border-stone-300 pb-6">
                  <p className="text-xs font-semibold tracking-widest text-[#8B6734]">
                    02 · NOTRE PASSION POUR L’IMAGE
                  </p>
                  <h3 className="mt-1 font-display text-2xl font-semibold text-stone-950">
                    La maîtrise de la lumière, du cadre et du mouvement
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">
                    Qu’il s’agisse d’un regard saisi en studio, d’une scène culturelle vibrante ou d’une séquence filmée au ralenti, chaque détail est pensé pour susciter une émotion durable.
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold tracking-widest text-[#8B6734]">
                    03 · NOTRE APPROCHE PROFESSIONNELLE
                  </p>
                  <h3 className="mt-1 font-display text-2xl font-semibold text-stone-950">
                    Un accompagnement complet, du tournage au rendu final
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">
                    Préparation artistique, tournage haute définition, prise de vue calibrée, étalonnage cinéma et livraison optimisée : nous garantissons rigueur, ponctualité et cohérence visuelle.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================== NOS SERVICES (2 services uniquement) ======================== */}
        <section id="services" className="border-t border-white/10 bg-[#070708] py-20">
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
                Une offre claire et maîtrisée, entièrement consacrée à la création d’images fixes et animées à haute valeur artistique.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <article className="overflow-hidden rounded-xl border border-white/10 bg-[#111114]">
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
                    Séances studio, reportages culturels, mariages d’exception, portraits éditoriaux et visuels publicitaires conçus avec une direction artistique soignée et une retouche fidèle aux matières et aux carnations.
                  </p>
                </div>
              </article>

              <article className="overflow-hidden rounded-xl border border-white/10 bg-[#111114]">
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
                    Conception, réalisation, cadrage et montage de films publicitaires, clips, documentaires culturels, vidéos corporate et films de mariage au rendu cinématographique.
                  </p>
                </div>
              </article>
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
                Explorez nos séries classées par univers et cliquez sur chaque photographie pour l’ouvrir en grand format.
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
                  onSelect={() => setLightboxIndex(idx)}
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
                Intégrez directement vos vidéos YouTube pour diffuser vos réalisations cinématographiques en haute définition.
              </p>
            </div>

            <div className="grid items-start gap-8 lg:grid-cols-12">
              <div className="aspect-video overflow-hidden rounded-xl border border-white/10 bg-[#101013] lg:col-span-8">
                {activeYoutubeId ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${activeYoutubeId}?rel=0`}
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
                      if (vid.id) setActiveYoutubeId(vid.id);
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
                        if (id) setActiveYoutubeId(id);
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

        <ContactSection brandAssets={brandAssets} repoConfig={activeRepoConfig} />
      </main>

      {/* ======================== FOOTER ======================== */}
      <footer className="border-t border-white/10 bg-[#070708] py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
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
            &copy; {new Date().getFullYear()} DIONTADO PRODUCTION — Yeumbeul, Sénégal.
          </p>

          <div className="flex flex-wrap items-center gap-5 text-xs text-stone-400">
            <a href="#apropos" className="hover:text-[#DFBE89]">
              À propos
            </a>
            <a href="#services" className="hover:text-[#DFBE89]">
              Services
            </a>
            <a href="#realisations" className="hover:text-[#DFBE89]">
              Réalisations
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

      {lightboxIndex !== null && (
        <LightboxModal
          items={filteredItems}
          activeIndex={lightboxIndex}
          repoConfig={activeRepoConfig}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
          onDimensionsLoad={handleDimensionsLoad}
        />
      )}
    </div>
  );
}
