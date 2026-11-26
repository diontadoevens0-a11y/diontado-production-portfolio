import type {
  BrandAssets,
  GalleryItem,
  GitHubRepoConfig,
  PhotoCategoryMeta,
  TarifItem,
  VideoPortfolioItem,
} from '../types/gallery';

export const DIONTADO_WHATSAPP_NUMBER = '221764812391';


export const DIONTADO_GITHUB_RAW_BASE =
  'https://raw.githubusercontent.com/diontadoevens0-a11y/diontado-production-portfolio/main/';

export const DIONTADO_GITHUB_BLOB_BASE =
  'https://github.com/diontadoevens0-a11y/diontado-production-portfolio/blob/main/';

export const DIONTADO_COVER_SLATE: GalleryItem = {
  id: 'diontado-cover',
  name: 'Couverture — DIONTADO PRODUCTION',
  fileName: 'cover.jpg',
  path: 'cover.jpg',
  folder: 'Couverture',
  extension: 'JPG',
  size: 370618,
  url: `${DIONTADO_GITHUB_RAW_BASE}cover.jpg`,
  githubUrl: `${DIONTADO_GITHUB_BLOB_BASE}cover.jpg`,
  role: 'cover',
  width: 1600,
  height: 900,
};

/**
 * Structure simple pour ajouter de nouvelles photographies :
 * Ajoutez une ligne dans PHOTO_DEFS avec :
 * - file   : nom exact du fichier image dans votre dépôt (ex: 'soutenance-01.jpg')
 * - folder : l'une des catégories exactes :
 *            'Prewedding' | 'Portrait' | 'Culture' | 'Studio' | 'Extérieur' |
 *            'Soutenance' | 'Mariage' | 'Événementiel'
 * - title  : titre affiché dans la galerie et le lecteur plein écran
 *
 * Exemples prêts à décommenter dès l'ajout de vos fichiers :
 * {file: 'soutenance-01.jpg', folder: 'Soutenance', title: 'Soutenance — Série 01'},
 * {file: 'pro-01.jpg', folder: 'Photographie professionnelle', title: 'Photographie professionnelle — Série 01'},
 */
const PHOTO_DEFS: Array<{file: string; folder: string; title: string}> = [
  {file: 'culture-01.jpg', folder: 'Photographie professionnelle', title: 'Culture — Série 01'},
  {file: 'culture-02.jpg', folder: 'Photographie professionnelle', title: 'Culture — Série 02'},
  {file: 'culture-03.jpg', folder: 'Photographie professionnelle', title: 'Culture — Série 03'},
  {file: 'culture-04.jpg', folder: 'Photographie professionnelle', title: 'Culture — Série 04'},
  {file: 'culture-05.jpg', folder: 'Photographie professionnelle', title: 'Culture — Série 05'},
  {file: 'culture-06.jpg', folder: 'Photographie professionnelle', title: 'Culture — Série 06'},
  {file: 'mariage-01.jpg', folder: 'Photographie professionnelle', title: 'Prewedding — Série 01'},
  {file: 'portrait-01.jpg', folder: 'Photographie professionnelle', title: 'Portrait — Série 01'},
  {file: 'portrait-02.jpg', folder: 'Photographie professionnelle', title: 'Portrait — Série 02'},
  {file: 'portrait-03.jpg', folder: 'Photographie professionnelle', title: 'Portrait — Série 03'},
  {file: 'portrait-04.jpg', folder: 'Photographie professionnelle', title: 'Portrait — Série 04'},
  {file: 'portrait-05.jpg', folder: 'Photographie professionnelle', title: 'Portrait — Série 05'},
  {file: 'portrait-06.jpg', folder: 'Photographie professionnelle', title: 'Portrait — Série 06'},
  {file: 'publicite-01.jpg', folder: 'Photographie professionnelle', title: 'Studio — Série 01'},
  {file: 'publicite-02.jpg', folder: 'Photographie professionnelle', title: 'Studio — Série 02'},
  {file: 'publicite-03.jpg', folder: 'Photographie professionnelle', title: 'Studio — Série 03'},
  {file: 'publicite-04.jpg', folder: 'Photographie professionnelle', title: 'Studio — Série 04'},
  {file: 'publicite-05.jpg', folder: 'Photographie professionnelle', title: 'Studio — Série 05'},
  {file: 'publicite-06.jpg', folder: 'Photographie professionnelle', title: 'Extérieur — Série 01'},
];

export const DIONTADO_SLATES: GalleryItem[] = PHOTO_DEFS.map((entry) => ({
  id: `slate-${entry.file}`,
  name: entry.title,
  fileName: entry.file,
  path: entry.file,
  folder: entry.folder,
  extension: 'JPG',
  size: 0,
  url: `${DIONTADO_GITHUB_RAW_BASE}${entry.file}`,
  githubUrl: `${DIONTADO_GITHUB_BLOB_BASE}${entry.file}`,
  role: 'gallery',
}));

/**
 * Catégories officielles du portfolio photographique avec pages dédiées (#/realisations/<slug>).
 * Le portfolio conserve uniquement SOUTENANCE et PHOTOGRAPHIE PROFESSIONNELLE.
 */
export const PHOTO_CATEGORIES: PhotoCategoryMeta[] = [
  {
    slug: 'soutenance',
    title: 'SOUTENANCE',
    folderMatch: 'Soutenance',
    subtitle: 'Accomplissement Académique & Fierté',
    description:
      'Immortalisation de votre soutenance de mémoire, thèse ou remise de diplôme : discours devant le jury, portraits en toge et moments d’émotion en famille.',
    prestationValue: 'Soutenance & Remise de diplôme',
    expectedPrefixHint: 'soutenance-01.jpg ou diplome-01.jpg',
    accentTone: 'from-[#D4AF6A]/28 via-[#15141A] to-[#09090B]',
  },
  {
    slug: 'photographie-professionnelle',
    title: 'PHOTOGRAPHIE PROFESSIONNELLE',
    folderMatch: 'Photographie professionnelle',
    subtitle: 'Portraits, Culture, Studio, Prewedding & Extérieur',
    description:
      'Portraits éditoriaux, reportages culturels, séances couple, prises de vue studio et réalisations en extérieur signées DIONTADO PRODUCTION.',
    coverFile: 'portrait-01.jpg',
    prestationValue: 'Photographie professionnelle',
    expectedPrefixHint: 'pro-01.jpg ou corporate-01.jpg',
    accentTone: 'from-[#9E6E3B]/32 via-[#14141A] to-[#09090B]',
  },
];

function makeBrandLogo(fileName: string, name: string): GalleryItem {
  return {
    id: `brand-${fileName}`,
    name,
    fileName,
    path: fileName,
    folder: 'Identité',
    extension: 'PNG',
    size: 0,
    url: `${DIONTADO_GITHUB_RAW_BASE}${fileName}`,
    githubUrl: `${DIONTADO_GITHUB_BLOB_BASE}${fileName}`,
    role: 'logo',
  };
}

const DEFAULT_LOGOS: GalleryItem[] = [
  makeBrandLogo('logo-entete.png', 'Logo En-tête'),
  makeBrandLogo('logo-horizontal-blanc.png', 'Logo Horizontal Blanc'),
  makeBrandLogo('logo-horizontal-noir.png', 'Logo Horizontal Noir'),
  makeBrandLogo('logo-vertical-blanc.png', 'Logo Vertical Blanc'),
  makeBrandLogo('logo-vertical-blanc-contact.png', 'Logo Contact Blanc'),
  makeBrandLogo('logo-vertical-noir-contact.png', 'Logo Contact Noir'),
  makeBrandLogo('logo-pied.png', 'Logo Pied de page'),
  makeBrandLogo('logo-icone-fond-brun.png', 'Emblème DIONTADO PRODUCTION'),
];

export const EMPTY_BRAND_ASSETS: BrandAssets = {
  cover: DIONTADO_COVER_SLATE,
  logoHeaderLight: DEFAULT_LOGOS[0],
  logoHeaderDark: DEFAULT_LOGOS[0],
  logoContactLight: DEFAULT_LOGOS[5],
  logoContactDark: DEFAULT_LOGOS[4],
  logoFooter: DEFAULT_LOGOS[6],
  logoIcon: DEFAULT_LOGOS[7],
  allLogos: DEFAULT_LOGOS,
};

/**
 * Catégories vidéo officielles.
 */
export const VIDEO_CATEGORIES = [
  'Toutes',
  'Films institutionnels',
  'Événementiel',
  'Mariage',
  'Clips et créations artistiques',
  'Reportages',
] as const;

/**
 * Tableau de données des vidéos réelles (YouTube ou MP4 hébergés).
 * Pour ajouter une vidéo : ajoutez simplement un objet avec `youtubeId` (ou `videoSrc` en `.mp4`).
 */
export const DIONTADO_VIDEOS: VideoPortfolioItem[] = [
  {
    id: 'vid-showreel',
    sourceType: 'youtube',
    youtubeId: 'VDhh9Q0c_MI',
    posterUrl: `${DIONTADO_GITHUB_RAW_BASE}cover.jpg`,
    category: 'Films institutionnels',
    title: 'Showreel Officiel — DIONTADO PRODUCTION',
    desc: 'Sélection cinématographique de notre portfolio audiovisuel, films de marque et portraits en mouvement.',
    isShowreel: true,
  },
  {
    id: 'vid-culture',
    sourceType: 'youtube',
    youtubeId: 'OJrbnH9zgLE',
    posterUrl: 'https://i.ytimg.com/vi/OJrbnH9zgLE/hqdefault.jpg',
    category: 'Reportages',
    title: 'Reportage Culturel — Sénégal',
    desc: 'Immersion documentaire au cœur des expressions artistiques, des traditions et des visages du Sénégal.',
  },
  {
    id: 'vid-studio',
    sourceType: 'youtube',
    youtubeId: 'tSglYbBoufg',
    posterUrl: 'https://i.ytimg.com/vi/tSglYbBoufg/hqdefault.jpg',
    category: 'Clips et créations artistiques',
    title: 'Direction Artistique & Création Visuelle',
    desc: 'Mise en lumière cinéma, cadre et étalonnage sur mesure pour artistes, créateurs et marques.',
  },
];

/**
 * CATALOGUE DES TARIFS — DIONTADO PRODUCTION
 * Tarifs officiels issus des grilles DIONTADO PRODUCTION / DIONTADO EVENT'S.
 * Structure simple pour modifier vos prix : éditez `priceLabel` ou les lignes de `tiers`.
 */
export const DIONTADO_TARIFS: TarifItem[] = [
  // ---- PHOTOGRAPHIE ----
  {
    id: 'tarif-photo-portrait',
    category: 'Photographie',
    number: '01',
    title: 'Shooting portrait',
    priceLabel: 'Dès 6.000 CFA',
    description:
      'Séances dirigées en studio, à domicile ou en extérieur avec retouche professionnelle soignée.',
    tiers: [
      {label: 'Studio · 3 Photos', price: '6.000 CFA'},
      {label: 'Studio · 6 Photos', price: '10.000 CFA'},
      {label: 'À domicile · 5 Photos', price: '15.000 CFA'},
      {label: 'À domicile · 10 Photos', price: '25.000 CFA'},
      {label: 'Extérieur · 5 Photos', price: '25.000 CFA'},
      {label: 'Extérieur · 10 Photos', price: '40.000 CFA'},
    ],
    prestationValue: 'Photographie — Portrait & Studio',
    defaultFormulaId: 'portrait-studio-3',
  },
  {
    id: 'tarif-photo-evenementiel',
    category: 'Photographie',
    number: '02',
    title: 'Événementiel',
    priceLabel: 'Dès 50.000 FCFA',
    description:
      'Forfaits photos numériques haute définition pour réceptions, conférences, galas, baptêmes et événements.',
    tiers: [
      {label: '40 photos numériques', price: '50.000 FCFA'},
      {label: '50 photos numériques', price: '70.000 FCFA'},
      {label: '80 photos numériques', price: '100.000 FCFA'},
      {label: '100 photos numériques', price: '120.000 FCFA'},
    ],
    prestationValue: 'Événementiel (Photo & Vidéo)',
    defaultFormulaId: 'event-num-40',
  },
  {
    id: 'tarif-photo-mariage',
    category: 'Photographie',
    number: '03',
    title: 'Mariage',
    priceLabel: 'Dès 90.000 FCFA',
    description:
      'Albums photo imprimés haut de gamme et formules combinées Album + Photos numériques.',
    tiers: [
      {label: 'Album de 60 photos', price: '90.000 FCFA'},
      {label: 'Album de 80 photos', price: '120.000 FCFA'},
      {label: 'Album de 100 photos', price: '140.000 FCFA'},
      {label: '50 num. + Album 60 photos', price: '130.000 FCFA'},
      {label: '80 num. + Album 80 photos', price: '190.000 FCFA'},
      {label: '100 num. + Album 100 photos', price: '230.000 FCFA'},
    ],
    prestationValue: 'Mariage & Cérémonie (Photo / Vidéo)',
    defaultFormulaId: 'mar-alb-60',
  },
  {
    id: 'tarif-photo-prewedding',
    category: 'Photographie',
    number: '04',
    title: 'Prewedding',
    priceLabel: 'Sur devis',
    description:
      'Séance couple mise en scène en extérieur ou dans un décor choisi avant le grand jour.',
    note: 'Séances Extérieur disponibles dès 25.000 CFA (5 photos) et 40.000 CFA (10 photos), ou pack sur mesure.',
    prestationValue: 'Prewedding & Séance Couple',
    defaultFormulaId: 'prew-ext-5',
  },
  {
    id: 'tarif-photo-soutenance',
    category: 'Photographie',
    number: '05',
    title: 'Soutenance',
    priceLabel: 'Sur devis',
    description:
      'Immortalisation de votre soutenance de mémoire, thèse ou remise de diplôme : passage devant le jury et portraits officiels.',
    note: 'Formules portrait studio (dès 6.000 CFA) ou reportage numérique complet (dès 50.000 FCFA) adaptables.',
    prestationValue: 'Soutenance & Remise de diplôme',
    defaultFormulaId: 'sout-num-40',
  },
  {
    id: 'tarif-photo-pro',
    category: 'Photographie',
    number: '06',
    title: 'Photographie professionnelle',
    priceLabel: 'Sur devis',
    description:
      'Portraits corporate, reportages d’entreprise, campagnes de communication et valorisation de votre savoir-faire.',
    prestationValue: 'Photographie professionnelle',
    defaultFormulaId: 'pro-custom',
  },

  // ---- RÉALISATION VIDÉO ----
  {
    id: 'tarif-video-mariage',
    category: 'Réalisation vidéo',
    number: '01',
    title: 'Film de mariage',
    priceLabel: 'Dès 70.000 FCFA',
    description:
      'Captation cinématographique complète des cérémonies traditionnelles, Henné Time et réception, montage inclus.',
    tiers: [
      {label: 'Henné Time', price: '70.000 FCFA'},
      {label: 'Réception', price: '85.000 FCFA'},
      {label: 'Henné Time + Réception (Mariage)', price: '130.000 FCFA'},
    ],
    prestationValue: 'Mariage & Cérémonie (Photo / Vidéo)',
    defaultFormulaId: 'mar-vid-henne',
  },
  {
    id: 'tarif-video-evenementiel',
    category: 'Réalisation vidéo',
    number: '02',
    title: 'Vidéo événementielle',
    priceLabel: 'Dès 70.000 FCFA',
    description:
      'Captation et montage rythmé de vos cérémonies familiales, baptêmes, réceptions et temps forts.',
    tiers: [
      {label: 'Baptême', price: '70.000 FCFA'},
      {label: 'Réception / Événement', price: '85.000 FCFA'},
    ],
    prestationValue: 'Événementiel (Photo & Vidéo)',
    defaultFormulaId: 'event-vid-bapteme',
  },
  {
    id: 'tarif-video-reportage',
    category: 'Réalisation vidéo',
    number: '03',
    title: 'Reportage',
    priceLabel: 'Sur devis',
    description:
      'Immersion documentaire sur le terrain, entretiens et narration authentique dédiée aux cultures et récits humains.',
    prestationValue: 'Reportage Culturel & Documentaire',
    defaultFormulaId: 'rep-custom',
  },
  {
    id: 'tarif-video-institutionnel',
    category: 'Réalisation vidéo',
    number: '04',
    title: 'Film institutionnel',
    priceLabel: 'Sur devis',
    description:
      'Film corporate de présentation pour entreprises, institutions, ONG et marques souhaitant affirmer leur image.',
    prestationValue: 'Film Institutionnel & Production Audiovisuelle',
    defaultFormulaId: 'inst-custom',
  },
  {
    id: 'tarif-video-production',
    category: 'Réalisation vidéo',
    number: '05',
    title: 'Production audiovisuelle',
    priceLabel: 'Sur devis',
    description:
      'Accompagnement complet de l’écriture à l’étalonnage cinéma : clips artistiques, campagnes visuelles et projets sur mesure.',
    prestationValue: 'Réalisation vidéo',
    defaultFormulaId: 'vid-custom',
  },
];

export const DIONTADO_PRACTICAL_INFOS: string[] = [
  'Devis personnalisé sous 24h',
  'Tournage et montage inclus',
  'Transport selon la localisation',
  'Studio Yeumbeul, Dakar — Sénégal',
];


export async function downloadStandaloneIndexHtml(repoConfig: GitHubRepoConfig | null) {
  const response = await fetch('/diontado-production-index.html');
  let html = await response.text();

  if (repoConfig) {
    const branch = repoConfig.branch || 'main';
    const subPath = repoConfig.path ? `${repoConfig.path.replace(/^\/+|\/+$/g, '')}/` : '';
    const rawBase = `https://raw.githubusercontent.com/${repoConfig.owner}/${repoConfig.repo}/${encodeURIComponent(branch)}/${subPath}`;
    html = html.replace("var MEDIA_BASE = './';", `var MEDIA_BASE = '${rawBase}';`);
  }

  const blob = new Blob([html], {type: 'text/html;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'index.html';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
