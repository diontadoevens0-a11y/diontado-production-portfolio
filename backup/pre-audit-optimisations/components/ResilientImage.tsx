import {Camera} from 'lucide-react';
import {useEffect, useState} from 'react';
import {fetchPrivateGitHubImageBlob} from '../services/githubGallery';
import type {GalleryItem, GitHubRepoConfig} from '../types/gallery';

interface ResilientImageProps {
  item: GalleryItem;
  repoConfig: GitHubRepoConfig | null;
  className?: string;
  alt?: string;
  loading?: 'lazy' | 'eager';
  onDimensionsLoad?: (id: string, width: number, height: number) => void;
  onResolvedSrc?: (src: string) => void;
}

export function ResilientImage({
  item,
  repoConfig,
  className = '',
  alt,
  loading = 'lazy',
  onDimensionsLoad,
  onResolvedSrc,
}: ResilientImageProps) {
  const [resolvedSrc, setResolvedSrc] = useState<string>(item.url);
  const [status, setStatus] = useState<'empty' | 'loading' | 'loaded' | 'error'>(
    item.url ? 'loading' : 'empty'
  );

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    if (!item.url && !item.isPrivateBlob) {
      setResolvedSrc('');
      setStatus('empty');
      return;
    }

    if (item.isPrivateBlob && repoConfig?.token) {
      setStatus('loading');
      fetchPrivateGitHubImageBlob(
        repoConfig.owner,
        repoConfig.repo,
        item.path,
        repoConfig.branch || 'main',
        repoConfig.token
      )
        .then((blobUrl) => {
          if (!active) {
            URL.revokeObjectURL(blobUrl);
            return;
          }
          objectUrl = blobUrl;
          setResolvedSrc(blobUrl);
          onResolvedSrc?.(blobUrl);
        })
        .catch(() => {
          if (active) setStatus('error');
        });
    } else {
      setResolvedSrc(item.url);
      setStatus('loading');
      onResolvedSrc?.(item.url);
    }

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [
    item.id,
    item.url,
    item.isPrivateBlob,
    item.path,
    repoConfig?.owner,
    repoConfig?.repo,
    repoConfig?.branch,
    repoConfig?.token,
  ]);

  if (status === 'empty' || status === 'error') {
    return (
      <div
        className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#16161A] to-[#0B0B0D] p-6 text-center text-stone-400 ${className}`}
      >
        <Camera className="h-5 w-5 text-[#C8A46B]/80" aria-hidden="true" />
        <span className="max-w-full truncate font-mono text-xs text-stone-200">
          {item.fileName}
        </span>
        <span className="text-[11px] text-stone-500">
          {status === 'empty' ? 'En attente du lien GitHub' : 'Fichier introuvable'}
        </span>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#111114]">
      {status === 'loading' && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[#16161A]"
        />
      )}
      <img
        src={resolvedSrc}
        alt={alt || item.name}
        loading={loading}
        referrerPolicy="no-referrer"
        onLoad={(event) => {
          setStatus('loaded');
          const img = event.currentTarget;
          if (img.naturalWidth && img.naturalHeight && onDimensionsLoad) {
            onDimensionsLoad(item.id, img.naturalWidth, img.naturalHeight);
          }
        }}
        onError={() => {
          setStatus('error');
        }}
        className={`${className} transition-opacity duration-200 ${
          status === 'loaded' ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}
