import type {BrandAssets, GitHubRepoConfig, GalleryItem} from '../types/gallery';

export const DIONTADO_COVER_SLATE: GalleryItem = {
  id: 'diontado-couverture',
  name: 'Couverture — DIONTADO PRODUCTION',
  fileName: 'couverture.jpg',
  path: 'couverture.jpg',
  folder: 'Couverture',
  extension: 'JPG',
  size: 0,
  url: '',
  githubUrl: '#contact',
  role: 'cover',
};

const PHOTO_DEFS: Array<{file: string; folder: string; title: string}> = [
  {file: 'culture-01.jpg', folder: 'Culture', title: 'Culture — Série 01'},
  {file: 'culture-02.jpg', folder: 'Culture', title: 'Culture — Série 02'},
  {file: 'culture-03.jpg', folder: 'Culture', title: 'Culture — Série 03'},
  {file: 'culture-04.jpg', folder: 'Culture', title: 'Culture — Série 04'},
  {file: 'culture-05.jpg', folder: 'Culture', title: 'Culture — Série 05'},
  {file: 'culture-06.jpg', folder: 'Culture', title: 'Culture — Série 06'},
  {file: 'mariage-01.jpg', folder: 'Mariage', title: 'Mariage — Série 01'},
  {file: 'portrait-01.jpg', folder: 'Portrait', title: 'Portrait — Série 01'},
  {file: 'portrait-02.jpg', folder: 'Portrait', title: 'Portrait — Série 02'},
  {file: 'portrait-03.jpg', folder: 'Portrait', title: 'Portrait — Série 03'},
  {file: 'portrait-04.jpg', folder: 'Portrait', title: 'Portrait — Série 04'},
  {file: 'portrait-05.jpg', folder: 'Portrait', title: 'Portrait — Série 05'},
  {file: 'portrait-06.jpg', folder: 'Portrait', title: 'Portrait — Série 06'},
  {file: 'publicite-01.jpg', folder: 'Publicité', title: 'Publicité — Série 01'},
  {file: 'publicite-02.jpg', folder: 'Publicité', title: 'Publicité — Série 02'},
  {file: 'publicite-03.jpg', folder: 'Publicité', title: 'Publicité — Série 03'},
  {file: 'publicite-04.jpg', folder: 'Publicité', title: 'Publicité — Série 04'},
  {file: 'publicite-05.jpg', folder: 'Publicité', title: 'Publicité — Série 05'},
  {file: 'publicite-06.jpg', folder: 'Publicité', title: 'Publicité — Série 06'},
];

export const DIONTADO_SLATES: GalleryItem[] = PHOTO_DEFS.map((entry) => ({
  id: `slate-${entry.file}`,
  name: entry.title,
  fileName: entry.file,
  path: entry.file,
  folder: entry.folder,
  extension: 'JPG',
  size: 0,
  url: '',
  githubUrl: '#contact',
  role: 'gallery',
}));

export const EMPTY_BRAND_ASSETS: BrandAssets = {
  cover: DIONTADO_COVER_SLATE,
  logoHeaderLight: null,
  logoHeaderDark: null,
  logoContactLight: null,
  logoContactDark: null,
  logoFooter: null,
  logoIcon: null,
  allLogos: [],
};

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
