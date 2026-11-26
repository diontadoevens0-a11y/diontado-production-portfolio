export type AssetRole = 'gallery' | 'cover' | 'logo' | 'archived';

export type OfficialPhotoCategory = 'Soutenance' | 'Photographie professionnelle';

export interface GalleryItem {
  id: string;
  name: string;
  description?: string;
  fileName: string;
  path: string;
  folder: string;
  albumId?: string;
  albumTitle?: string;
  extension: string;
  size: number;
  url: string;
  githubUrl: string;
  role: AssetRole;
  sha?: string;
  width?: number;
  height?: number;
  isPrivateBlob?: boolean;
  published?: boolean;
  featured?: boolean;
  sortOrder?: number;
  storagePath?: string;
  isCmsManaged?: boolean;
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

export type VideoCategory =
  | 'Films institutionnels'
  | 'Événementiel'
  | 'Mariage'
  | 'Clips et créations artistiques'
  | 'Reportages';

export interface VideoPortfolioItem {
  id: string;
  sourceType: 'youtube' | 'mp4';
  youtubeId?: string;
  videoSrc?: string;
  posterUrl?: string;
  storagePath?: string;
  category: VideoCategory;
  title: string;
  desc: string;
  duration?: string;
  isShowreel?: boolean;
  published?: boolean;
  sortOrder?: number;
  isCmsManaged?: boolean;
}

export interface PhotoCategoryMeta {
  slug: string;
  title: string;
  folderMatch: string;
  subtitle: string;
  description: string;
  coverFile?: string;
  coverUrl?: string;
  prestationValue: string;
  expectedPrefixHint: string;
  accentTone: string;
}

export type TarifCategory = 'Photographie' | 'Réalisation vidéo';

export interface TarifTier {
  label: string;
  price: string;
}

export interface TarifItem {
  id: string;
  category: TarifCategory;
  number: string;
  title: string;
  priceLabel: string;
  description: string;
  tiers?: TarifTier[];
  note?: string;
  prestationValue: string;
  defaultFormulaId?: string;
}

export type CoverSlotId = 'home' | 'soutenance' | 'photographie-professionnelle' | 'apropos';

export interface CmsPhotoDoc {
  id: string;
  title: string;
  description: string;
  category: OfficialPhotoCategory;
  albumId: string;
  albumTitle: string;
  url: string;
  storagePath: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  published: boolean;
  featured: boolean;
  sortOrder: number;
  authorUid: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface CmsAlbumDoc {
  id: string;
  title: string;
  category: OfficialPhotoCategory;
  description: string;
  published: boolean;
  sortOrder: number;
  authorUid: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface CmsVideoDoc {
  id: string;
  title: string;
  description: string;
  category: VideoCategory;
  sourceType: 'youtube' | 'mp4';
  youtubeId: string;
  videoUrl: string;
  posterUrl: string;
  storagePath: string;
  isShowreel: boolean;
  published: boolean;
  sortOrder: number;
  authorUid: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface CmsCoverDoc {
  id: CoverSlotId;
  label: string;
  imageUrl: string;
  storagePath: string;
  alt: string;
  authorUid: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface CmsCategoryDoc {
  slug: 'soutenance' | 'photographie-professionnelle';
  title: 'SOUTENANCE' | 'PHOTOGRAPHIE PROFESSIONNELLE';
  subtitle: string;
  description: string;
  authorUid: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface CmsServiceDoc {
  id: string;
  number: string;
  title: string;
  tagline: string;
  description: string;
  deliverables: string[];
  prestationValue: string;
  published: boolean;
  sortOrder: number;
  authorUid?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
  isDefault?: boolean;
}
