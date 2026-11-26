import type {
  AssetRole,
  BrandAssets,
  GalleryItem,
  GitHubRepoConfig,
  GitHubRepoMeta,
} from '../types/gallery';

const IMAGE_EXTENSIONS = new Set([
  'jpg',
  'jpeg',
  'png',
  'webp',
  'avif',
  'gif',
  'svg',
  'bmp',
]);

interface GitHubRepoResponse {
  full_name: string;
  description: string | null;
  default_branch: string;
  html_url: string;
  stargazers_count: number;
  private: boolean;
  owner?: {
    avatar_url?: string;
  };
}

interface GitHubTreeItem {
  path: string;
  mode: string;
  type: 'blob' | 'tree' | 'commit';
  sha: string;
  size?: number;
}

interface GitHubTreeResponse {
  sha: string;
  tree: GitHubTreeItem[];
  truncated: boolean;
}

interface GitHubContentItem {
  name: string;
  path: string;
  sha: string;
  size: number;
  type: 'file' | 'dir' | 'symlink' | 'submodule';
  download_url: string | null;
  html_url: string;
}

export function getImageExtension(filePath: string): string {
  const parts = filePath.split('.');
  if (parts.length < 2) return '';
  return parts[parts.length - 1].toLowerCase();
}

export function isImageFile(filePath: string): boolean {
  return IMAGE_EXTENSIONS.has(getImageExtension(filePath));
}

function normalizeAccents(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function classifyAssetRole(fileName: string, fullPath = ''): AssetRole {
  const base = normalizeAccents(fileName.replace(/\.[^/.]+$/, ''));
  const pathSegments = normalizeAccents(fullPath).split('/').filter(Boolean);
  const inCoverFolder = pathSegments
    .slice(0, -1)
    .some(
      (seg) =>
        seg === 'cover' ||
        seg === 'cover.jpg' ||
        seg === 'couverture' ||
        seg === 'couverture.jpg'
    );

  const inBtsFolder = pathSegments
    .slice(0, -1)
    .some(
      (seg) =>
        seg === 'bts' ||
        seg === 'coulisses' ||
        seg === 'behind-the-scenes' ||
        seg === 'coequipiers' ||
        seg === 'collaborateurs' ||
        seg === 'terrain' ||
        seg === 'sur-le-terrain' ||
        seg === 'editing'
    );

  const isBareBtsNumber = /^(1[0-2]|[1-9])$/.test(base);

  if (
    inCoverFolder ||
    base === 'cover' ||
    base.startsWith('cover-') ||
    base.startsWith('cover_') ||
    base === 'couverture' ||
    base.startsWith('couverture-') ||
    base.startsWith('couverture_')
  ) {
    return 'cover';
  }
  if (base === 'logo' || base.startsWith('logo-') || base.startsWith('logo_')) {
    return 'logo';
  }
  if (
    inBtsFolder ||
    isBareBtsNumber ||
    base === 'bts' ||
    base.startsWith('bts-') ||
    base.startsWith('bts_') ||
    base.startsWith('coulisses-') ||
    base.startsWith('coulisses_') ||
    base.startsWith('terrain-') ||
    base.startsWith('terrain_') ||
    base.startsWith('editing-') ||
    base.startsWith('editing_')
  ) {
    return 'archived';
  }
  return 'gallery';
}

const KNOWN_CATEGORY_MAP: Record<string, string> = {
  culture: 'Photographie professionnelle',
  portrait: 'Photographie professionnelle',
  portraits: 'Photographie professionnelle',
  publicite: 'Photographie professionnelle',
  pub: 'Photographie professionnelle',
  mariage: 'Photographie professionnelle',
  mariages: 'Photographie professionnelle',
  wedding: 'Photographie professionnelle',
  ceremonie: 'Photographie professionnelle',
  prewedding: 'Photographie professionnelle',
  evenement: 'Photographie professionnelle',
  evenementiel: 'Photographie professionnelle',
  event: 'Photographie professionnelle',
  mode: 'Photographie professionnelle',
  beaute: 'Photographie professionnelle',
  fashion: 'Photographie professionnelle',
  studio: 'Photographie professionnelle',
  exterieur: 'Photographie professionnelle',
  soutenance: 'Soutenance',
  soutenances: 'Soutenance',
  diplome: 'Soutenance',
  graduation: 'Soutenance',
  memoire: 'Soutenance',
  professionnel: 'Photographie professionnelle',
  professionnelle: 'Photographie professionnelle',
  'photographie-professionnelle': 'Photographie professionnelle',
  pro: 'Photographie professionnelle',
  corporate: 'Photographie professionnelle',
  entreprise: 'Photographie professionnelle',
  reportage: 'Photographie professionnelle',
};

function formatCategoryLabel(raw: string): string {
  const normalized = normalizeAccents(raw.trim());
  if (KNOWN_CATEGORY_MAP[normalized]) {
    return KNOWN_CATEGORY_MAP[normalized];
  }
  return 'Photographie professionnelle';
}

export function humanizeFileName(fileName: string): string {
  const withoutExt = fileName.replace(/\.[^/.]+$/, '');
  if (normalizeAccents(withoutExt) === 'publicite-06') {
    return 'Extérieur 01';
  }
  const parts = withoutExt.split(/[-_]+/).filter(Boolean);
  if (parts.length >= 2) {
    const first = formatCategoryLabel(parts[0]);
    const rest = parts.slice(1).join(' ');
    return `${first} ${rest}`;
  }
  const spaced = withoutExt.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (!spaced) return fileName;
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '—';
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1).replace('.', ',')} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(2).replace('.', ',')} Mo`;
}

export function encodeGitHubPath(filePath: string): string {
  return filePath
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

/**
 * Parses either "owner/repo" or full GitHub URLs such as:
 * - https://github.com/owner/repo
 * - https://github.com/owner/repo/tree/main/images
 * - https://github.com/owner/repo/blob/main/images/photo.jpg
 */
export function parseGitHubInput(
  rawInput: string,
  fallbackBranch?: string,
  fallbackPath?: string
): GitHubRepoConfig | null {
  const trimmed = rawInput.trim();
  if (!trimmed) return null;

  const cleanFallbackBranch = fallbackBranch?.trim() || undefined;
  const cleanFallbackPath = fallbackPath?.trim().replace(/^\/+|\/+$/g, '') || undefined;

  if (trimmed.includes('github.com')) {
    try {
      const normalizedUrl = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
      const url = new URL(normalizedUrl);
      const segments = url.pathname
        .replace(/\.git$/i, '')
        .split('/')
        .filter(Boolean);

      if (segments.length < 2) return null;

      const owner = segments[0];
      const repo = segments[1];
      let branch = cleanFallbackBranch;
      let path = cleanFallbackPath;

      if (segments.length >= 4 && (segments[2] === 'tree' || segments[2] === 'blob')) {
        branch = segments[3];
        const rest = segments.slice(4);
        if (segments[2] === 'blob' && rest.length > 0) {
          rest.pop();
        }
        if (rest.length > 0) {
          path = rest.join('/');
        }
      }

      return {owner, repo, branch, path};
    } catch {
      return null;
    }
  }

  const plain = trimmed.replace(/^\/+|\/+$/g, '').replace(/\.git$/i, '');
  const parts = plain.split('/').filter(Boolean);
  if (parts.length < 2) return null;

  const owner = parts[0];
  const repo = parts[1];
  const inlinePath = parts.slice(2).join('/');

  return {
    owner,
    repo,
    branch: cleanFallbackBranch,
    path: cleanFallbackPath || inlinePath || undefined,
  };
}

function buildHeaders(token?: string): HeadersInit {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
  };
  if (token?.trim()) {
    headers.Authorization = `Bearer ${token.trim()}`;
  }
  return headers;
}

function deriveCategory(fullPath: string, basePath: string, fileName: string, role: AssetRole): string {
  if (role === 'cover') return 'Couverture';
  if (role === 'logo') return 'Identité';
  if (role === 'archived') return 'Archive';

  let relative = fullPath;
  if (basePath) {
    const prefix = `${basePath}/`;
    if (relative.startsWith(prefix)) {
      relative = relative.slice(prefix.length);
    }
  }

  const folderParts = relative.split('/').filter(Boolean);
  if (folderParts.length > 1) {
    return formatCategoryLabel(folderParts[0]);
  }

  // Flat directory: categorize cleanly from filename prefix
  const baseName = fileName.replace(/\.[^/.]+$/, '');
  if (normalizeAccents(baseName) === 'publicite-06') {
    return 'Photographie professionnelle';
  }
  const prefixMatch = baseName.match(/^([a-zA-ZÀ-ÿ]+)[-_]/);
  if (prefixMatch && prefixMatch[1]) {
    return formatCategoryLabel(prefixMatch[1]);
  }

  return 'Photographie professionnelle';
}

function extractBrandAssets(allItems: GalleryItem[]): BrandAssets {
  const logos = allItems.filter((item) => item.role === 'logo');
  const findLogo = (...candidates: string[]) => {
    for (const candidate of candidates) {
      const found = logos.find((item) =>
        normalizeAccents(item.fileName).includes(normalizeAccents(candidate))
      );
      if (found) return found;
    }
    return null;
  };

  const cover =
    allItems.find(
      (item) =>
        item.role === 'cover' &&
        normalizeAccents(item.fileName).startsWith('cover')
    ) ||
    allItems.find((item) => item.role === 'cover') ||
    allItems.find((item) => item.role === 'gallery') ||
    null;

  return {
    cover,
    logoHeaderLight: findLogo('logo-entete', 'logo-horizontal-noir', 'logo-horizontal-blanc', 'logo'),
    logoHeaderDark: findLogo('logo-horizontal-blanc', 'logo-entete', 'logo-horizontal-noir', 'logo'),
    logoContactLight: findLogo(
      'logo-vertical-noir-contact',
      'logo-vertical-noir',
      'logo-vertical-blanc-contact',
      'logo-icone'
    ),
    logoContactDark: findLogo(
      'logo-vertical-blanc-contact',
      'logo-vertical-blanc',
      'logo-vertical-noir-contact',
      'logo-icone'
    ),
    logoFooter: findLogo('logo-pied', 'logo-horizontal-blanc', 'logo-horizontal-noir', 'logo'),
    logoIcon: findLogo('logo-icone-fond-brun', 'logo-icône-fond-brun', 'logo-icone', 'logo'),
    allLogos: logos,
  };
}

function mapGitHubError(status: number, context: string): Error {
  if (status === 401) {
    return new Error('Jeton GitHub invalide ou expiré. Vérifiez votre jeton dans les options avancées.');
  }
  if (status === 403 || status === 429) {
    return new Error(
      'Limite de requêtes de l’API GitHub atteinte. Patientez quelques minutes ou ajoutez un jeton GitHub personnel.'
    );
  }
  if (status === 404) {
    return new Error(
      `${context} introuvable sur GitHub. Vérifiez le nom du dépôt, la branche ou le sous-dossier.`
    );
  }
  return new Error(`Erreur GitHub (${status}) lors du chargement de ${context}.`);
}

export async function fetchGitHubGallery(
  config: GitHubRepoConfig,
  signal?: AbortSignal
): Promise<{
  galleryItems: GalleryItem[];
  brandAssets: BrandAssets;
  meta: GitHubRepoMeta;
}> {
  const headers = buildHeaders(config.token);
  const owner = encodeURIComponent(config.owner);
  const repo = encodeURIComponent(config.repo);

  const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers,
    signal,
  });

  if (!repoRes.ok) {
    throw mapGitHubError(repoRes.status, `Le dépôt "${config.owner}/${config.repo}"`);
  }

  const repoData: GitHubRepoResponse = await repoRes.json();
  const activeBranch = config.branch?.trim() || repoData.default_branch || 'main';
  const normalizedPath = (config.path || '').trim().replace(/^\/+|\/+$/g, '');

  const treeRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(activeBranch)}?recursive=1`,
    {headers, signal}
  );

  if (!treeRes.ok) {
    throw mapGitHubError(treeRes.status, `La branche "${activeBranch}"`);
  }

  const treeData: GitHubTreeResponse = await treeRes.json();

  let allItems: GalleryItem[] = [];

  if (treeData.truncated && normalizedPath) {
    allItems = await fetchFolderContentsFallback(
      config.owner,
      config.repo,
      activeBranch,
      normalizedPath,
      normalizedPath,
      repoData.private,
      headers,
      signal
    );
  } else {
    const prefix = normalizedPath ? `${normalizedPath}/` : '';
    const imageBlobs = treeData.tree.filter((entry) => {
      if (entry.type !== 'blob') return false;
      if (!isImageFile(entry.path)) return false;
      if (prefix && !entry.path.startsWith(prefix)) return false;
      return true;
    });

    allItems = imageBlobs.map((blob) => {
      const segments = blob.path.split('/');
      const fileName = segments[segments.length - 1];
      const ext = getImageExtension(fileName).toUpperCase();
      const encodedFilePath = encodeGitHubPath(blob.path);
      const role = classifyAssetRole(fileName, blob.path);

      return {
        id: `${blob.sha}-${blob.path}`,
        name: humanizeFileName(fileName),
        fileName,
        path: blob.path,
        folder: deriveCategory(blob.path, normalizedPath, fileName, role),
        extension: ext,
        size: blob.size || 0,
        url: `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${encodeURIComponent(activeBranch)}/${encodedFilePath}`,
        githubUrl: `https://github.com/${config.owner}/${config.repo}/blob/${encodeURIComponent(activeBranch)}/${encodedFilePath}`,
        role,
        sha: blob.sha,
        isPrivateBlob: repoData.private,
      };
    });
  }

  if (allItems.length === 0) {
    const scopeLabel = normalizedPath
      ? `le dossier "${normalizedPath}"`
      : `le dépôt "${config.owner}/${config.repo}"`;
    throw new Error(
      `Aucune image (.jpg, .png, .webp, .avif, .gif, .svg) détectée dans ${scopeLabel} (branche ${activeBranch}).`
    );
  }

  const brandAssets = extractBrandAssets(allItems);
  const galleryItems = allItems.filter((item) => item.role === 'gallery');

  const meta: GitHubRepoMeta = {
    fullName: repoData.full_name,
    description: repoData.description,
    defaultBranch: repoData.default_branch,
    activeBranch,
    activePath: normalizedPath,
    htmlUrl: repoData.html_url,
    ownerAvatarUrl: repoData.owner?.avatar_url,
    stars: repoData.stargazers_count || 0,
    isPrivate: repoData.private,
    syncedAt: new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };

  return {
    galleryItems: galleryItems.length > 0 ? galleryItems : allItems,
    brandAssets,
    meta,
  };
}

async function fetchFolderContentsFallback(
  owner: string,
  repo: string,
  branch: string,
  currentPath: string,
  basePath: string,
  isPrivate: boolean,
  headers: HeadersInit,
  signal?: AbortSignal
): Promise<GalleryItem[]> {
  const encodedPath = encodeGitHubPath(currentPath);
  const res = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodedPath}?ref=${encodeURIComponent(branch)}`,
    {headers, signal}
  );
  if (!res.ok) {
    throw mapGitHubError(res.status, `Le dossier "${currentPath}"`);
  }

  const data: GitHubContentItem[] | GitHubContentItem = await res.json();
  const entries = Array.isArray(data) ? data : [data];
  const results: GalleryItem[] = [];

  for (const entry of entries) {
    if (entry.type === 'file' && isImageFile(entry.path)) {
      const ext = getImageExtension(entry.name).toUpperCase();
      const role = classifyAssetRole(entry.name, entry.path);
      results.push({
        id: `${entry.sha}-${entry.path}`,
        name: humanizeFileName(entry.name),
        fileName: entry.name,
        path: entry.path,
        folder: deriveCategory(entry.path, basePath, entry.name, role),
        extension: ext,
        size: entry.size || 0,
        url:
          entry.download_url ||
          `https://raw.githubusercontent.com/${owner}/${repo}/${encodeURIComponent(branch)}/${encodeGitHubPath(entry.path)}`,
        githubUrl: entry.html_url,
        role,
        sha: entry.sha,
        isPrivateBlob: isPrivate,
      });
    } else if (entry.type === 'dir') {
      const nested = await fetchFolderContentsFallback(
        owner,
        repo,
        branch,
        entry.path,
        basePath,
        isPrivate,
        headers,
        signal
      );
      results.push(...nested);
    }
  }

  return results;
}

export async function fetchPrivateGitHubImageBlob(
  owner: string,
  repo: string,
  filePath: string,
  branch: string,
  token: string,
  signal?: AbortSignal
): Promise<string> {
  const res = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodeGitHubPath(filePath)}?ref=${encodeURIComponent(branch)}`,
    {
      headers: {
        Accept: 'application/vnd.github.raw+json',
        Authorization: `Bearer ${token.trim()}`,
      },
      signal,
    }
  );
  if (!res.ok) {
    throw new Error(`Impossible de charger l'image privée (${res.status}).`);
  }
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}
