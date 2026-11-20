import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  Info,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {useEffect, useState} from 'react';
import {formatFileSize} from '../services/githubGallery';
import type {GalleryItem, GitHubRepoConfig} from '../types/gallery';
import {ResilientImage} from './ResilientImage';

interface LightboxModalProps {
  items: GalleryItem[];
  activeIndex: number;
  repoConfig: GitHubRepoConfig | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onDimensionsLoad: (id: string, width: number, height: number) => void;
}

export function LightboxModal({
  items,
  activeIndex,
  repoConfig,
  onClose,
  onNavigate,
  onDimensionsLoad,
}: LightboxModalProps) {
  const [zoomed, setZoomed] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [copied, setCopied] = useState(false);
  const [resolvedUrl, setResolvedUrl] = useState<string>('');

  const item = items[activeIndex];

  useEffect(() => {
    setZoomed(false);
    setCopied(false);
  }, [activeIndex]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowLeft') {
        onNavigate((activeIndex - 1 + items.length) % items.length);
      } else if (event.key === 'ArrowRight') {
        onNavigate((activeIndex + 1) % items.length);
      } else if (event.key.toLowerCase() === 'z') {
        setZoomed((prev) => !prev);
      } else if (event.key.toLowerCase() === 'i') {
        setShowInfo((prev) => !prev);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeIndex, items.length, onClose, onNavigate]);

  if (!item) return null;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(item.url.startsWith('/') ? `${window.location.origin}${item.url}` : item.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked in sandboxed iframe
    }
  };

  const handleDownload = async () => {
    try {
      const targetUrl = resolvedUrl || item.url;
      const response = await fetch(targetUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = item.fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
    } catch {
      const link = document.createElement('a');
      link.href = item.url;
      link.download = item.fileName;
      link.click();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Aperçu de ${item.name}`}
      className="fixed inset-0 z-50 flex flex-col bg-zinc-950/95 text-zinc-100 backdrop-blur-sm"
    >
      {/* Top Bar */}
      <div className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-zinc-800/90 px-4 sm:px-6">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-zinc-100">{item.name}</p>
          <p className="truncate font-mono text-xs text-zinc-400 tabular-nums">
            {activeIndex + 1} / {items.length} · {item.folder} · {item.extension}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setZoomed((prev) => !prev)}
            aria-label={zoomed ? 'Réduire le zoom' : 'Zoomer sur l’image'}
            className="flex h-10 items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-xs font-medium text-zinc-200 transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 whitespace-nowrap shrink-0"
          >
            {zoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
            <span className="hidden sm:inline">{zoomed ? 'Ajuster' : 'Zoom'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowInfo((prev) => !prev)}
            aria-label="Afficher ou masquer les détails"
            className={`flex h-10 items-center gap-2 rounded-lg border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 whitespace-nowrap shrink-0 ${
              showInfo
                ? 'border-zinc-700 bg-zinc-800 text-white'
                : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            <Info className="h-4 w-4" />
            <span className="hidden sm:inline">Détails</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            aria-label="Télécharger l'image"
            className="flex h-10 items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-xs font-medium text-zinc-200 transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 whitespace-nowrap shrink-0"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Télécharger</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la visionneuse"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-200 transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Stage */}
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        <div className="relative flex flex-1 items-center justify-center overflow-auto p-4 sm:p-8">
          <button
            type="button"
            onClick={() => onNavigate((activeIndex - 1 + items.length) % items.length)}
            aria-label="Image précédente"
            className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/90 text-zinc-100 transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:left-6"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div
            onClick={() => setZoomed((prev) => !prev)}
            className={`relative flex items-center justify-center transition-transform duration-200 ${
              zoomed ? 'cursor-zoom-out scale-125' : 'cursor-zoom-in max-h-full max-w-full'
            }`}
          >
            <ResilientImage
              item={item}
              repoConfig={repoConfig}
              loading="eager"
              onDimensionsLoad={onDimensionsLoad}
              onResolvedSrc={setResolvedUrl}
              className="max-h-[calc(100vh-14rem)] max-w-full rounded-lg object-contain"
            />
          </div>

          <button
            type="button"
            onClick={() => onNavigate((activeIndex + 1) % items.length)}
            aria-label="Image suivante"
            className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/90 text-zinc-100 transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:right-6"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Metadata Sidebar */}
        {showInfo && (
          <aside className="hidden w-80 shrink-0 flex-col justify-between border-l border-zinc-800/90 bg-zinc-950 p-6 lg:flex">
            <div className="space-y-6">
              <div>
                <p className="text-xs font-medium text-zinc-400">Fichier sélectionné</p>
                <h2 className="mt-1 font-display text-xl font-semibold text-white">
                  {item.name}
                </h2>
                <p className="mt-1 break-all font-mono text-xs text-zinc-400">
                  {item.path}
                </p>
              </div>

              <dl className="space-y-3 border-t border-zinc-800 pt-5 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-zinc-400">Collection</dt>
                  <dd className="font-medium text-zinc-100">{item.folder}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-zinc-400">Format</dt>
                  <dd className="font-mono text-xs text-zinc-100">{item.extension}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-zinc-400">Dimensions</dt>
                  <dd className="font-mono text-xs text-zinc-100 tabular-nums">
                    {item.width && item.height ? `${item.width} × ${item.height} px` : 'Détection…'}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-zinc-400">Poids</dt>
                  <dd className="font-mono text-xs text-zinc-100 tabular-nums">
                    {formatFileSize(item.size)}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="space-y-2.5 border-t border-zinc-800 pt-5">
              <button
                type="button"
                onClick={handleCopyUrl}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-xs font-medium text-zinc-100 transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? 'Lien copié' : 'Copier le lien direct'}</span>
              </button>

              {item.githubUrl !== '#guide' && item.githubUrl !== '#contact' && (
                <a
                  href={item.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#7C4A2D] px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-[#633922] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D49B72]"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Voir sur GitHub</span>
                </a>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* Thumbnail Filmstrip */}
      <div className="flex h-20 shrink-0 items-center gap-2.5 overflow-x-auto border-t border-zinc-800/90 bg-zinc-950/90 px-4 sm:px-6">
        {items.map((thumb, idx) => {
          const isCurrent = idx === activeIndex;
          return (
            <button
              key={thumb.id}
              type="button"
              onClick={() => onNavigate(idx)}
              aria-label={`Afficher ${thumb.name}`}
              className={`relative h-12 w-16 shrink-0 overflow-hidden rounded-md border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isCurrent
                  ? 'border-blue-500 opacity-100 ring-1 ring-blue-500'
                  : 'border-zinc-800 opacity-50 hover:opacity-85'
              }`}
            >
              <ResilientImage
                item={thumb}
                repoConfig={repoConfig}
                className="h-full w-full object-cover"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
