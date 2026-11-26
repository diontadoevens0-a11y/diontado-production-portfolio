import {deleteObject, getDownloadURL, ref, uploadBytesResumable} from 'firebase/storage';
import {auth, storage} from '../firebase';

export const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
export const ALLOWED_VIDEO_TYPES = new Set(['video/mp4', 'video/webm']);
export const MAX_IMAGE_SIZE_BYTES = 15 * 1024 * 1024; // 15 Mo
export const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024; // 50 Mo

export interface UploadedMediaResult {
  url: string;
  storagePath: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  backend: 'firebase-storage' | 'server';
}

export function validateMediaFile(file: File, kind: 'image' | 'video'): string | null {
  const mime = file.type.toLowerCase();
  if (kind === 'image') {
    if (!ALLOWED_IMAGE_TYPES.has(mime)) {
      return `Format non pris en charge (${file.name}). Utilisez JPG, PNG ou WebP.`;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return `Image trop volumineuse (${file.name}). Limite : 15 Mo maximum.`;
    }
  } else {
    if (!ALLOWED_VIDEO_TYPES.has(mime)) {
      return `Format vidéo non pris en charge (${file.name}). Utilisez MP4 ou WebM.`;
    }
    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      return `Vidéo trop volumineuse (${file.name}). Limite : 50 Mo maximum.`;
    }
  }
  return null;
}

function sanitizeBaseName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'media';
}

async function uploadToFirebaseStorage(
  file: File,
  folder: string,
  onProgress?: (percent: number) => void
): Promise<UploadedMediaResult> {
  const safeName = `${Date.now()}-${sanitizeBaseName(file.name)}`;
  const storagePath = `portfolio/${folder}/${safeName}`;
  const storageRef = ref(storage, storagePath);

  return new Promise<UploadedMediaResult>((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
    });

    const timeoutId = window.setTimeout(() => {
      task.cancel();
      reject(new Error('storage/timeout'));
    }, 18000);

    task.on(
      'state_changed',
      (snapshot) => {
        if (snapshot.totalBytes > 0) {
          const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          onProgress?.(pct);
        }
      },
      (err) => {
        window.clearTimeout(timeoutId);
        reject(err);
      },
      async () => {
        window.clearTimeout(timeoutId);
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          onProgress?.(100);
          resolve({
            url,
            storagePath,
            fileName: safeName,
            mimeType: file.type,
            fileSize: file.size,
            backend: 'firebase-storage',
          });
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}

async function uploadToAuthenticatedServer(
  file: File,
  idToken: string,
  onProgress?: (percent: number) => void
): Promise<UploadedMediaResult> {
  return new Promise<UploadedMediaResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/media/upload');
    xhr.setRequestHeader('Authorization', `Bearer ${idToken}`);
    xhr.setRequestHeader('Content-Type', file.type);

    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable && evt.total > 0) {
        onProgress?.(Math.min(99, Math.round((evt.loaded / evt.total) * 100)));
      }
    };

    xhr.onload = () => {
      try {
        const parsed = JSON.parse(xhr.responseText || '{}') as {
          error?: string;
          url?: string;
          storagePath?: string;
          fileName?: string;
          mimeType?: string;
          fileSize?: number;
        };
        if (xhr.status >= 200 && xhr.status < 300 && parsed.url) {
          onProgress?.(100);
          resolve({
            url: parsed.url,
            storagePath: parsed.storagePath || '',
            fileName: parsed.fileName || file.name,
            mimeType: parsed.mimeType || file.type,
            fileSize: parsed.fileSize || file.size,
            backend: 'server',
          });
        } else {
          reject(new Error(parsed.error || `Échec du téléversement (code ${xhr.status}).`));
        }
      } catch {
        reject(new Error(`Réponse serveur invalide (code ${xhr.status}).`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Connexion interrompue pendant le téléversement du fichier.'));
    };

    xhr.send(file);
  });
}

export async function uploadMediaFile(
  file: File,
  kind: 'image' | 'video',
  folder: string,
  onProgress?: (percent: number) => void
): Promise<UploadedMediaResult> {
  const validationError = validateMediaFile(file, kind);
  if (validationError) {
    throw new Error(validationError);
  }

  const user = auth.currentUser;
  if (!user) {
    throw new Error('Session administrateur expirée. Veuillez vous reconnecter.');
  }

  const idToken = await user.getIdToken();

  try {
    return await uploadToFirebaseStorage(file, folder, onProgress);
  } catch (storageError) {
    const codeOrMsg =
      storageError instanceof Error ? storageError.message.toLowerCase() : String(storageError).toLowerCase();
    const shouldFallback =
      codeOrMsg.includes('storage/') ||
      codeOrMsg.includes('unauthorized') ||
      codeOrMsg.includes('retry-limit') ||
      codeOrMsg.includes('timeout') ||
      codeOrMsg.includes('unknown') ||
      codeOrMsg.includes('bucket');

    if (!shouldFallback) {
      throw storageError;
    }

    onProgress?.(0);
    return await uploadToAuthenticatedServer(file, idToken, onProgress);
  }
}

export async function deleteStoredMedia(storagePath: string, url: string): Promise<void> {
  if (!storagePath && !url) return;

  if (storagePath.startsWith('portfolio/')) {
    try {
      await deleteObject(ref(storage, storagePath));
    } catch {
      // Ignore missing object
    }
    return;
  }

  if (url.startsWith('/api/media/')) {
    const fileName = url.slice('/api/media/'.length);
    const user = auth.currentUser;
    if (!user || !fileName) return;
    try {
      const idToken = await user.getIdToken();
      await fetch(`/api/media/${encodeURIComponent(fileName)}`, {
        method: 'DELETE',
        headers: {Authorization: `Bearer ${idToken}`},
      });
    } catch {
      // Non-blocking cleanup
    }
  }
}

export interface MediaDownloadProgress {
  percent: number;
  loadedBytes: number;
  totalBytes: number;
  indeterminate: boolean;
}

function triggerBrowserSave(href: string, fileName: string) {
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.download = fileName;
  anchor.rel = 'noreferrer';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

export async function downloadMediaWithProgress(
  url: string,
  fileName: string,
  onProgress?: (progress: MediaDownloadProgress) => void
): Promise<void> {
  const safeFileName = fileName.trim() || 'diontado-media';

  onProgress?.({
    percent: 0,
    loadedBytes: 0,
    totalBytes: 0,
    indeterminate: true,
  });

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Impossible de télécharger ce fichier (code ${response.status}).`);
    }

    const contentLengthHeader = response.headers.get('content-length');
    const totalBytes = contentLengthHeader ? Number(contentLengthHeader) : 0;
    const reader = response.body?.getReader();

    if (!reader) {
      const blob = await response.blob();
      onProgress?.({
        percent: 100,
        loadedBytes: blob.size,
        totalBytes: blob.size,
        indeterminate: false,
      });
      const blobUrl = URL.createObjectURL(blob);
      triggerBrowserSave(blobUrl, safeFileName);
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 2500);
      return;
    }

    const chunks: Uint8Array[] = [];
    let loadedBytes = 0;

    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        loadedBytes += value.byteLength;
        const hasTotal = totalBytes > 0;
        onProgress?.({
          percent: hasTotal ? Math.min(99, Math.round((loadedBytes / totalBytes) * 100)) : 50,
          loadedBytes,
          totalBytes,
          indeterminate: !hasTotal,
        });
      }
    }

    const mimeType = response.headers.get('content-type') || 'application/octet-stream';
    const blob = new Blob(chunks as BlobPart[], {type: mimeType});
    onProgress?.({
      percent: 100,
      loadedBytes: blob.size,
      totalBytes: totalBytes || blob.size,
      indeterminate: false,
    });

    const blobUrl = URL.createObjectURL(blob);
    triggerBrowserSave(blobUrl, safeFileName);
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 2500);
  } catch {
    // Fallback direct si un hébergeur externe bloque fetch() par CORS
    triggerBrowserSave(url, safeFileName);
    onProgress?.({
      percent: 100,
      loadedBytes: 0,
      totalBytes: 0,
      indeterminate: false,
    });
  }
}
