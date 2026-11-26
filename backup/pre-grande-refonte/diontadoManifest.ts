import type {
  BrandAssets,
  GalleryItem,
  GitHubRepoConfig,
  ServicePackageOffer,
  VideoPortfolioItem,
} from '../types/gallery';

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

const PHOTO_DEFS: Array<{file: string; folder: string; title: string}> = [
  {file: 'culture-01.jpg', folder: 'Culture', title: 'Culture — Série 01'},
  {file: 'culture-02.jpg', folder: 'Culture', title: 'Culture — Série 02'},
  {file: 'culture-03.jpg', folder: 'Culture', title: 'Culture — Série 03'},
  {file: 'culture-04.jpg', folder: 'Culture', title: 'Culture — Série 04'},
  {file: 'culture-05.jpg', folder: 'Culture', title: 'Culture — Série 05'},
  {file: 'culture-06.jpg', folder: 'Culture', title: 'Culture — Série 06'},
  {file: 'mariage-01.jpg', folder: 'Prewedding', title: 'Prewedding — Série 01'},
  {file: 'portrait-01.jpg', folder: 'Portrait', title: 'Portrait — Série 01'},
  {file: 'portrait-02.jpg', folder: 'Portrait', title: 'Portrait — Série 02'},
  {file: 'portrait-03.jpg', folder: 'Portrait', title: 'Portrait — Série 03'},
  {file: 'portrait-04.jpg', folder: 'Portrait', title: 'Portrait — Série 04'},
  {file: 'portrait-05.jpg', folder: 'Portrait', title: 'Portrait — Série 05'},
  {file: 'portrait-06.jpg', folder: 'Portrait', title: 'Portrait — Série 06'},
  {file: 'publicite-01.jpg', folder: 'Studio', title: 'Studio — Série 01'},
  {file: 'publicite-02.jpg', folder: 'Studio', title: 'Studio — Série 02'},
  {file: 'publicite-03.jpg', folder: 'Studio', title: 'Studio — Série 03'},
  {file: 'publicite-04.jpg', folder: 'Studio', title: 'Studio — Série 04'},
  {file: 'publicite-05.jpg', folder: 'Studio', title: 'Studio — Série 05'},
  {file: 'publicite-06.jpg', folder: 'Extérieur', title: 'Extérieur — Série 01'},
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

const BTS_DEFS: Array<{
  file: string;
  localUrl: string;
  folder: 'Sur le terrain' | 'Editing';
  title: string;
}> = [
  {
    file: '1.jpg',
    localUrl: '/assets/aistudio/1_e77d17a4.jpg',
    folder: 'Sur le terrain',
    title: 'Shooting sur la côte rocheuse',
  },
  {
    file: '2.JPG',
    localUrl: '/assets/aistudio/2_f3530072.JPG',
    folder: 'Sur le terrain',
    title: 'Plateau studio & éclairage d’équipe',
  },
  {
    file: '3.jpg',
    localUrl: '/assets/aistudio/3_51f1cc8f.jpg',
    folder: 'Sur le terrain',
    title: 'Tournage vidéo en intérieur',
  },
  {
    file: '4.JPG',
    localUrl: '/assets/aistudio/4_285c84fb.JPG',
    folder: 'Editing',
    title: 'Post-production & direction artistique',
  },
  {
    file: '5.jpg',
    localUrl: '/assets/aistudio/5_0479c35b.jpg',
    folder: 'Sur le terrain',
    title: 'Shooting produit & réflecteur',
  },
  {
    file: '6.jpg',
    localUrl: '/assets/aistudio/6_26900419.jpg',
    folder: 'Sur le terrain',
    title: 'Tournage clip & mise en lumière',
  },
  {
    file: '7.JPG',
    localUrl: '/assets/aistudio/7_6d59849c.JPG',
    folder: 'Sur le terrain',
    title: 'Cadreur 4K sur le terrain',
  },
  {
    file: '8.JPG',
    localUrl: '/assets/aistudio/8_b3eee15a.JPG',
    folder: 'Sur le terrain',
    title: 'Tournage sport — Teranga Training',
  },
  {
    file: '9.HEIC',
    localUrl: '/assets/aistudio/9_9955958d.jpg',
    folder: 'Editing',
    title: 'Tethering & retouche en direct',
  },
  {
    file: '10.JPG',
    localUrl: '/assets/aistudio/10_1df3e28e.JPG',
    folder: 'Sur le terrain',
    title: 'Équipe drone & caméra — Littoral',
  },
  {
    file: '11.HEIC',
    localUrl: '/assets/aistudio/11_27ca1e48.jpg',
    folder: 'Sur le terrain',
    title: 'Tournage sur falaise côtière',
  },
  {
    file: '12.HEIC',
    localUrl: '/assets/aistudio/12_ee2a8b90.jpg',
    folder: 'Sur le terrain',
    title: 'Prise de vue en extérieur',
  },
];

export const DIONTADO_BTS_SLATES: GalleryItem[] = BTS_DEFS.map((entry) => ({
  id: `bts-slate-${entry.file}`,
  name: entry.title,
  fileName: entry.file,
  path: entry.file,
  folder: entry.folder,
  extension: entry.file.split('.').pop()?.toUpperCase() || 'JPG',
  size: 0,
  url: entry.localUrl,
  githubUrl: `${DIONTADO_GITHUB_BLOB_BASE}${entry.file}`,
  role: 'bts',
}));

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
  btsItems: DIONTADO_BTS_SLATES,
};

/**
 * Catalogue des vidéos intégrées (YouTube et/ou fichiers MP4 hébergés).
 * Pour ajouter une vidéo hébergée : { id: 'film-04', sourceType: 'mp4', videoSrc: './videos/mon-film.mp4', posterUrl: './cover.jpg', ... }
 */
export const DIONTADO_VIDEOS: VideoPortfolioItem[] = [
  {
    id: 'vid-showreel',
    sourceType: 'youtube',
    youtubeId: 'VDhh9Q0c_MI',
    posterUrl: 'https://i.ytimg.com/vi/VDhh9Q0c_MI/hqdefault.jpg',
    category: 'Production Audiovisuelle',
    title: 'Showreel Officiel — DIONTADO PRODUCTION',
    desc: 'Sélection de réalisations cinématographiques, campagnes de marque, portraits en mouvement et reportages.',
  },
  {
    id: 'vid-culture',
    sourceType: 'youtube',
    youtubeId: 'OJrbnH9zgLE',
    posterUrl: 'https://i.ytimg.com/vi/OJrbnH9zgLE/hqdefault.jpg',
    category: 'Reportage Culturel',
    title: 'Reportage Culturel — Sénégal',
    desc: 'Immersion audiovisuelle au cœur des expressions artistiques, des traditions et des visages du Sénégal.',
  },
  {
    id: 'vid-studio',
    sourceType: 'youtube',
    youtubeId: 'tSglYbBoufg',
    posterUrl: 'https://i.ytimg.com/vi/tSglYbBoufg/hqdefault.jpg',
    category: 'Direction Artistique',
    title: 'Direction Artistique & Film Publicitaire',
    desc: 'Conception visuelle, lumière cinéma et montage sur mesure pour artistes, créateurs et entreprises.',
  },
];

/**
 * Grille tarifaire modifiable facilement (aucun prix fictif inventé par défaut).
 * Remplacez 'Sur devis' par vos montants (ex: '150 000 FCFA') lorsque vous souhaitez les afficher publiquement.
 */
export const DIONTADO_PRICING_OFFERS: ServicePackageOffer[] = [
  {
    id: 'pack-portrait',
    name: 'Shooting Portrait & Studio',
    category: 'Photographie professionnelle',
    priceLabel: 'Sur devis',
    summary: 'Séance photo dirigée en studio ou en extérieur pour artistes, entrepreneurs et particuliers.',
    deliverables: [
      'Direction artistique & préparation',
      'Prise de vue studio ou lumière naturelle',
      'Sélection & retouche colorimétrique soignée',
    ],
    prestationValue: 'Photographie — Portrait & Studio',
  },
  {
    id: 'pack-mariage',
    name: 'Mariage, Prewedding & Cérémonie',
    category: 'Photo & Film de mariage',
    priceLabel: 'Sur devis',
    summary: 'Couverture discrète et cinématographique des temps forts de votre union et de vos cérémonies.',
    deliverables: [
      'Séance couple / Prewedding sur mesure',
      'Couverture complète de la cérémonie',
      'Galerie haute définition & film souvenir',
    ],
    prestationValue: 'Mariage & Cérémonie (Photo / Vidéo)',
  },
  {
    id: 'pack-evenement',
    name: 'Couverture Événementielle',
    category: 'Photo & Vidéo événementielle',
    priceLabel: 'Sur devis',
    summary: 'Captation réactive pour lancements, concerts, conférences, galas et événements culturels.',
    deliverables: [
      'Reportage photo complet des temps forts',
      'Film récapitulatif rythmé (Aftermovie)',
      'Livraison optimisée réseaux sociaux & presse',
    ],
    prestationValue: 'Événementiel (Photo & Vidéo)',
  },
  {
    id: 'pack-institutionnel',
    name: 'Film Institutionnel & Marque',
    category: 'Production audiovisuelle',
    priceLabel: 'Sur devis',
    summary: 'Production audiovisuelle complète pour entreprises, ONG, marques et campagnes digitales.',
    deliverables: [
      'Repérage, écriture & mise en scène',
      'Tournage cinéma 4K, son & éclairage',
      'Montage, étalonnage & déclinaisons multi-formats',
    ],
    prestationValue: 'Film Institutionnel & Production Audiovisuelle',
  },
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
