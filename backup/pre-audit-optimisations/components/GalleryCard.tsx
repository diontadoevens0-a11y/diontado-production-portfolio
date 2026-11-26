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
    <article className={isGrid ? 'group' : 'group break-inside-avoid mb-6'}>
      <button
        type="button"
        onClick={() => onSelect(item)}
        className="relative block w-full overflow-hidden rounded-lg border border-white/10 bg-[#0B0B0D] text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A46B]"
      >
        <div
          className={`relative w-full overflow-hidden ${
            isGrid ? 'aspect-[4/3]' : 'aspect-[4/5]'
          }`}
        >
          <ResilientImage
            item={item}
            repoConfig={repoConfig}
            onDimensionsLoad={onDimensionsLoad}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#C8A46B]">
                {item.folder}
              </p>
              <p className="truncate font-display text-xl font-semibold text-white">
                {item.name}
              </p>
            </div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#C8A46B] text-[#0B0A09]">
              <Maximize2 className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
        </div>
      </button>
    </article>
  );
}
