export type AssetRole = 'gallery' | 'cover' | 'logo';

export interface GalleryItem {
  id: string;
  name: string;
  fileName: string;
  path: string;
  folder: string;
  extension: string;
  size: number;
  url: string;
  githubUrl: string;
  role: AssetRole;
  sha?: string;
  width?: number;
  height?: number;
  isPrivateBlob?: boolean;
}

export interface BrandAssets {
  cover: GalleryItem | null;
  logoHeaderLight: GalleryItem | null;
  logoHeaderDark: GalleryItem | null;
  logoContactLight: GalleryItem | null;
  logoContactDark: GalleryItem | null;
  logoFooter: GalleryItem | null;
  logoIcon: GalleryItem | null;
  allLogos: GalleryItem[];
}

export interface GitHubRepoConfig {
  owner: string;
  repo: string;
  branch?: string;
  path?: string;
  token?: string;
}

export interface GitHubRepoMeta {
  fullName: string;
  description: string | null;
  defaultBranch: string;
  activeBranch: string;
  activePath: string;
  htmlUrl: string;
  ownerAvatarUrl?: string;
  stars: number;
  isPrivate: boolean;
  syncedAt: string;
}

export type ViewMode = 'masonry' | 'grid' | 'index';

export type SortOption = 'name-asc' | 'name-desc' | 'size-desc' | 'folder';
