import {Maximize2} from 'lucide-react';
import type {GalleryItem, GitHubRepoConfig, ViewMode} from '../types/gallery';
import {ResilientImage} from './ResilientImage';

interface GalleryCardProps {
  item: GalleryItem;
  repoConfig: GitHubRepoConfig | null;
  viewMode: Exclude<ViewMode, 'index'>;
  onSelect: (item: GalleryItem) => void;
  onDimensionsLoad: (id: string, width: number, height: number) => void;
}

export function GalleryCard({
  item,
  repoConfig,
  viewMode,
  onSelect,
  onDimensionsLoad,
}: GalleryCardProps) {
  const isGrid = viewMode === 'grid';

  return (
    <article className="group h-full">
      <button
        type="button"
        onClick={() => onSelect(item)}
        aria-label={`Ouvrir ${item.name} en plein écran`}
        className="relative block h-full w-full overflow-hidden rounded-[10px] border border-white/10 bg-[#0B0B0D] text-left transition-colors duration-200 hover:border-[#D4AF6A]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF6A]"
      >
        <div
          className={`relative w-full overflow-hidden ${
            isGrid ? 'aspect-[4/3]' : ''
          }`}
        >
          <ResilientImage
            item={item}
            repoConfig={repoConfig}
            loading="lazy"
            onDimensionsLoad={onDimensionsLoad}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035]"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-[#D4AF6A]/18 to-[#D4AF6A]/10 opacity-80 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100"
          />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 opacity-100 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#E7CA91]">
                {item.albumTitle || item.folder}
              </p>
              <p className="truncate font-display text-xl font-semibold text-white">
                {item.name}
              </p>
              {item.description && (
                <p className="mt-0.5 line-clamp-2 text-xs text-stone-300">
                  {item.description}
                </p>
              )}
            </div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#D4AF6A] text-[#0B0A09]">
              <Maximize2 className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
        </div>
      </button>
    </article>
  );
}
