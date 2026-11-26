import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  Download,
  Edit3,
  Eye,
  EyeOff,
  Film,
  FolderOpen,
  Image as ImageIcon,
  Layers,
  Loader2,
  LogIn,
  LogOut,
  Plus,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  Upload,
  Video,
  X,
} from 'lucide-react';
import {signInWithPopup, signOut, type User} from 'firebase/auth';
import {useEffect, useMemo, useRef, useState} from 'react';
import {auth, googleProvider} from '../firebase';
import {PHOTO_CATEGORIES, VIDEO_CATEGORIES} from '../data/diontadoManifest';
import {
  createAlbumRecord,
  createPhotoRecord,
  createVideoRecord,
  DEFAULT_SERVICES,
  deleteAlbumRecord,
  deletePhotoRecord,
  deleteServiceRecord,
  deleteVideoRecord,
  extractYouTubeId,
  isAuthorizedAdminEmail,
  reorderPhotosBatch,
  saveServiceRecord,
  saveSiteCategoryMeta,
  saveSiteCover,
  subscribeAdminCmsData,
  updateAlbumRecord,
  updatePhotoRecord,
  updateVideoRecord,
  type CmsLoadProgress,
} from '../services/cmsService';
import {
  deleteStoredMedia,
  downloadMediaWithProgress,
  uploadMediaFile,
  validateMediaFile,
} from '../services/mediaUpload';
import type {
  CmsAlbumDoc,
  CmsCategoryDoc,
  CmsCoverDoc,
  CmsPhotoDoc,
  CmsServiceDoc,
  CmsVideoDoc,
  CoverSlotId,
  OfficialPhotoCategory,
  VideoCategory,
} from '../types/gallery';
import {ProgressBar} from './ProgressBar';

interface AdminPageProps {
  user: User | null;
  authLoading: boolean;
  onBackHome: () => void;
  onNavigatePath: (path: string) => void;
}

type AdminTab = 'photos' | 'categories' | 'videos' | 'covers' | 'services';

interface QueuedPhotoFile {
  localId: string;
  file: File;
  previewUrl: string;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
}

const OFFICIAL_PHOTO_CATEGORIES: OfficialPhotoCategory[] = [
  'Soutenance',
  'Photographie professionnelle',
];

const VIDEO_ONLY_CATEGORIES = VIDEO_CATEGORIES.filter((c) => c !== 'Toutes') as VideoCategory[];

const COVER_SLOTS: Array<{id: CoverSlotId; label: string; hint: string; fallbackUrl: string}> = [
  {
    id: 'home',
    label: 'Couverture — Page d’accueil',
    hint: 'Grande image cinématographique affichée en plein écran à l’entrée du site.',
    fallbackUrl:
      'https://raw.githubusercontent.com/diontadoevens0-a11y/diontado-production-portfolio/main/cover.jpg',
  },
  {
    id: 'soutenance',
    label: 'Couverture — Galerie Soutenance',
    hint: 'Bannière principale de la page Soutenance.',
    fallbackUrl:
      'https://raw.githubusercontent.com/diontadoevens0-a11y/diontado-production-portfolio/main/cover.jpg',
  },
  {
    id: 'photographie-professionnelle',
    label: 'Couverture — Photographie professionnelle',
    hint: 'Bannière principale de la galerie Photographie professionnelle.',
    fallbackUrl:
      'https://raw.githubusercontent.com/diontadoevens0-a11y/diontado-production-portfolio/main/portrait-01.jpg',
  },
  {
    id: 'apropos',
    label: 'Portrait — Page À propos (Amadou Sy)',
    hint: 'Portrait du fondateur affiché dans la mise en page éditoriale À propos.',
    fallbackUrl: '/assets/aistudio/1C1A6618_copie_af7a2459.jpg',
  },
];

function cleanBaseTitle(fileName: string): string {
  return fileName
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function AdminPage({
  user,
  authLoading,
  onBackHome,
  onNavigatePath,
}: AdminPageProps) {
  const isAuthorized = Boolean(user && isAuthorizedAdminEmail(user.email, user.emailVerified));

  const [activeTab, setActiveTab] = useState<AdminTab>('photos');
  const [authError, setAuthError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  // Données CMS temps réel
  const [photos, setPhotos] = useState<CmsPhotoDoc[]>([]);
  const [albums, setAlbums] = useState<CmsAlbumDoc[]>([]);
  const [videos, setVideos] = useState<CmsVideoDoc[]>([]);
  const [covers, setCovers] = useState<CmsCoverDoc[]>([]);
  const [categories, setCategories] = useState<CmsCategoryDoc[]>([]);
  const [services, setServices] = useState<CmsServiceDoc[]>([]);

  const [feedback, setFeedback] = useState<{type: 'success' | 'error'; text: string} | null>(null);
  const [cmsProgress, setCmsProgress] = useState<CmsLoadProgress>({
    loadedCount: 0,
    totalCount: 6,
    percent: 0,
    currentLabel: 'Connexion aux galeries…',
    isComplete: false,
  });

  // ---- État Onglet Photos ----
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const [queuedPhotos, setQueuedPhotos] = useState<QueuedPhotoFile[]>([]);
  const [batchCategory, setBatchCategory] = useState<OfficialPhotoCategory>(
    'Photographie professionnelle'
  );
  const [batchAlbumId, setBatchAlbumId] = useState<string>('general');
  const [batchTitle, setBatchTitle] = useState<string>('');
  const [batchDesc, setBatchDesc] = useState<string>('');
  const [batchFeatured, setBatchFeatured] = useState<boolean>(false);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [batchUploadProgress, setBatchUploadProgress] = useState<{
    currentIndex: number;
    totalCount: number;
    percent: number;
    fileName: string;
    phase: string;
    totalBytes: number;
  } | null>(null);
  const [isReorderingPhotos, setIsReorderingPhotos] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<
    Record<
      string,
      {
        percent: number;
        loadedBytes: number;
        totalBytes: number;
        indeterminate: boolean;
        label: string;
      }
    >
  >({});
  const [photoFilterCat, setPhotoFilterCat] = useState<'all' | OfficialPhotoCategory>('all');
  const [photoFilterStatus, setPhotoFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [previewBatchModalOpen, setPreviewBatchModalOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<CmsPhotoDoc | null>(null);
  const [previewPhotoItem, setPreviewPhotoItem] = useState<CmsPhotoDoc | null>(null);

  // ---- État Onglet Catégories & Albums ----
  const [catEdits, setCatEdits] = useState<
    Record<'soutenance' | 'photographie-professionnelle', {subtitle: string; description: string}>
  >({
    soutenance: {
      subtitle: PHOTO_CATEGORIES[0].subtitle,
      description: PHOTO_CATEGORIES[0].description,
    },
    'photographie-professionnelle': {
      subtitle: PHOTO_CATEGORIES[1].subtitle,
      description: PHOTO_CATEGORIES[1].description,
    },
  });
  const [newAlbumTitle, setNewAlbumTitle] = useState('');
  const [newAlbumCat, setNewAlbumCat] = useState<OfficialPhotoCategory>(
    'Photographie professionnelle'
  );
  const [newAlbumDesc, setNewAlbumDesc] = useState('');
  const [newAlbumPublished, setNewAlbumPublished] = useState(true);
  const [savingAlbum, setSavingAlbum] = useState(false);

  // ---- État Onglet Vidéos ----
  const [videoSourceType, setVideoSourceType] = useState<'youtube' | 'mp4'>('youtube');
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUploadPct, setVideoUploadPct] = useState(0);
  const [videoPosterPct, setVideoPosterPct] = useState(0);
  const [videoUploadStage, setVideoUploadStage] = useState<'video' | 'poster' | 'saving' | null>(
    null
  );
  const [videoPosterFile, setVideoPosterFile] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoCategory, setVideoCategory] = useState<VideoCategory>('Films institutionnels');
  const [videoDesc, setVideoDesc] = useState('');
  const [videoIsShowreel, setVideoIsShowreel] = useState(false);
  const [videoSaving, setVideoSaving] = useState(false);
  const [previewVideoModal, setPreviewVideoModal] = useState<{
    title: string;
    category: string;
    desc: string;
    sourceType: 'youtube' | 'mp4';
    youtubeId?: string;
    videoUrl?: string;
  } | null>(null);
  const [editingVideo, setEditingVideo] = useState<CmsVideoDoc | null>(null);

  // ---- État Onglet Couvertures ----
  const [coverProgress, setCoverProgress] = useState<Record<string, number>>({});

  // ---- État Onglet Services ----
  const [serviceDraft, setServiceDraft] = useState<{
    id?: string;
    number: string;
    title: string;
    tagline: string;
    description: string;
    deliverablesText: string;
    prestationValue: string;
    published: boolean;
    sortOrder: number;
  } | null>(null);
  const [savingService, setSavingService] = useState(false);
  const [serviceImportProgress, setServiceImportProgress] = useState<{
    current: number;
    total: number;
    percent: number;
    title: string;
  } | null>(null);

  useEffect(() => {
    if (!isAuthorized) return;
    const unsub = subscribeAdminCmsData(
      (partial) => {
        if (partial.photos) setPhotos(partial.photos);
        if (partial.albums) setAlbums(partial.albums);
        if (partial.videos) setVideos(partial.videos);
        if (partial.covers) setCovers(partial.covers);
        if (partial.categories) {
          setCategories(partial.categories);
          setCatEdits((prev) => {
            const next = {...prev};
            for (const c of partial.categories!) {
              if (c.slug === 'soutenance' || c.slug === 'photographie-professionnelle') {
                next[c.slug] = {subtitle: c.subtitle, description: c.description};
              }
            }
            return next;
          });
        }
        if (partial.services) setServices(partial.services);
      },
      (err) => {
        setFeedback({type: 'error', text: `Erreur de synchronisation : ${err.message}`});
      },
      (progress) => {
        setCmsProgress(progress);
      }
    );
    return () => unsub();
  }, [isAuthorized]);

  useEffect(() => {
    return () => {
      queuedPhotos.forEach((q) => URL.revokeObjectURL(q.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sortedPhotos = useMemo(() => {
    return [...photos].sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return a.sortOrder - b.sortOrder;
    });
  }, [photos]);

  const filteredPhotos = useMemo(() => {
    return sortedPhotos.filter((p) => {
      if (photoFilterCat !== 'all' && p.category !== photoFilterCat) return false;
      if (photoFilterStatus === 'published' && !p.published) return false;
      if (photoFilterStatus === 'draft' && p.published) return false;
      return true;
    });
  }, [photoFilterCat, photoFilterStatus, sortedPhotos]);

  const availableBatchAlbums = useMemo(
    () =>
      albums
        .filter((a) => a.category === batchCategory)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [albums, batchCategory]
  );

  const sortedVideos = useMemo(
    () => [...videos].sort((a, b) => a.sortOrder - b.sortOrder),
    [videos]
  );

  const sortedServices = useMemo(
    () => [...services].sort((a, b) => a.sortOrder - b.sortOrder),
    [services]
  );

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setAuthError(
        err instanceof Error
          ? err.message
          : 'Impossible d’ouvrir la connexion Google. Autorisez les fenêtres pop-up.'
      );
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  // ---- Gestion file d'attente Photos ----
  const handleSelectPhotoFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setFeedback(null);
    const errors: string[] = [];
    const additions: QueuedPhotoFile[] = [];

    Array.from(files).forEach((file) => {
      const err = validateMediaFile(file, 'image');
      if (err) {
        errors.push(err);
        return;
      }
      additions.push({
        localId: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        progress: 0,
        status: 'pending',
      });
    });

    if (errors.length > 0) {
      setFeedback({type: 'error', text: errors.join(' ')});
    }
    if (additions.length > 0) {
      setQueuedPhotos((prev) => [...prev, ...additions]);
    }
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

  const removeQueuedPhoto = (localId: string) => {
    setQueuedPhotos((prev) => {
      const target = prev.find((q) => q.localId === localId);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((q) => q.localId !== localId);
    });
  };

  const handlePublishQueuedPhotos = async (publishImmediately: boolean) => {
    const pendingList = queuedPhotos.filter((q) => q.status !== 'done');
    if (pendingList.length === 0) {
      setFeedback({
        type: 'error',
        text: 'Sélectionnez d’abord une ou plusieurs photos depuis votre téléphone ou ordinateur.',
      });
      return;
    }

    setIsUploadingPhotos(true);
    setFeedback(null);
    const chosenAlbum = albums.find((a) => a.id === batchAlbumId);
    const minOrder = photos.reduce((min, p) => Math.min(min, p.sortOrder), 0);
    const totalBatchBytes = pendingList.reduce((sum, item) => sum + item.file.size, 0);
    let successCount = 0;
    let failCount = 0;

    setBatchUploadProgress({
      currentIndex: 1,
      totalCount: pendingList.length,
      percent: 2,
      fileName: pendingList[0].file.name,
      phase: 'Préparation du téléversement…',
      totalBytes: totalBatchBytes,
    });

    for (let idx = 0; idx < pendingList.length; idx++) {
      const item = pendingList[idx];
      setQueuedPhotos((prev) =>
        prev.map((q) =>
          q.localId === item.localId ? {...q, status: 'uploading', progress: 0, error: undefined} : q
        )
      );
      setBatchUploadProgress({
        currentIndex: idx + 1,
        totalCount: pendingList.length,
        percent: Math.max(2, Math.round((idx / pendingList.length) * 100)),
        fileName: item.file.name,
        phase: 'Envoi du fichier média…',
        totalBytes: totalBatchBytes,
      });

      try {
        const uploaded = await uploadMediaFile(
          item.file,
          'image',
          batchCategory === 'Soutenance' ? 'soutenance' : 'pro',
          (pct) => {
            const weightedPct = Math.round(((idx + pct / 100) / pendingList.length) * 100);
            setQueuedPhotos((prev) =>
              prev.map((q) => (q.localId === item.localId ? {...q, progress: pct} : q))
            );
            setBatchUploadProgress({
              currentIndex: idx + 1,
              totalCount: pendingList.length,
              percent: Math.min(99, Math.max(2, weightedPct)),
              fileName: item.file.name,
              phase: pct >= 98 ? 'Enregistrement dans la galerie…' : `Envoi du fichier (${pct}%)…`,
              totalBytes: totalBatchBytes,
            });
          }
        );

        const resolvedTitle =
          batchTitle.trim()
            ? pendingList.length > 1
              ? `${batchTitle.trim()} — ${String(idx + 1).padStart(2, '0')}`
              : batchTitle.trim()
            : cleanBaseTitle(item.file.name) || `${batchCategory} — ${idx + 1}`;

        await createPhotoRecord({
          title: resolvedTitle,
          description: batchDesc.trim(),
          category: batchCategory,
          albumId: chosenAlbum ? chosenAlbum.id : 'general',
          albumTitle: chosenAlbum ? chosenAlbum.title : '',
          url: uploaded.url,
          storagePath: uploaded.storagePath,
          fileName: uploaded.fileName,
          mimeType: uploaded.mimeType,
          fileSize: uploaded.fileSize,
          published: publishImmediately,
          featured: batchFeatured,
          sortOrder: minOrder - (pendingList.length - idx),
        });

        successCount++;
        setBatchUploadProgress({
          currentIndex: idx + 1,
          totalCount: pendingList.length,
          percent: Math.round(((idx + 1) / pendingList.length) * 100),
          fileName: item.file.name,
          phase: 'Publiée dans la galerie',
          totalBytes: totalBatchBytes,
        });
        URL.revokeObjectURL(item.previewUrl);
        setQueuedPhotos((prev) => prev.filter((q) => q.localId !== item.localId));
      } catch (err) {
        failCount++;
        const msg = err instanceof Error ? err.message : 'Erreur lors du téléversement.';
        setQueuedPhotos((prev) =>
          prev.map((q) => (q.localId === item.localId ? {...q, status: 'error', error: msg} : q))
        );
      }
    }

    setIsUploadingPhotos(false);
    setBatchUploadProgress(null);
    setPreviewBatchModalOpen(false);

    if (successCount > 0 && failCount === 0) {
      setBatchTitle('');
      setBatchDesc('');
      setBatchFeatured(false);
      setFeedback({
        type: 'success',
        text: publishImmediately
          ? `${successCount} ${successCount > 1 ? 'photos publiées' : 'photo publiée'} dans « ${batchCategory} ».`
          : `${successCount} ${successCount > 1 ? 'photos enregistrées' : 'photo enregistrée'} en brouillon.`,
      });
    } else if (failCount > 0) {
      setFeedback({
        type: 'error',
        text: `${successCount} envoyée(s), ${failCount} en échec. Vérifiez les messages rouges ci-dessous avant de réessayer.`,
      });
    }
  };

  const handleDownloadAdminMedia = async (id: string, url: string, fileName: string, label: string) => {
    try {
      await downloadMediaWithProgress(url, fileName, (prog) => {
        setDownloadProgress((prev) => ({
          ...prev,
          [id]: {
            ...prog,
            label,
          },
        }));
      });
      window.setTimeout(() => {
        setDownloadProgress((prev) => {
          const next = {...prev};
          delete next[id];
          return next;
        });
      }, 1500);
    } catch (err) {
      setDownloadProgress((prev) => {
        const next = {...prev};
        delete next[id];
        return next;
      });
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Impossible de télécharger ce média.',
      });
    }
  };

  const handleMovePhoto = async (photoId: string, direction: -1 | 1) => {
    const idx = sortedPhotos.findIndex((p) => p.id === photoId);
    const targetIdx = idx + direction;
    if (idx < 0 || targetIdx < 0 || targetIdx >= sortedPhotos.length) return;

    const reordered = [...sortedPhotos];
    const [moved] = reordered.splice(idx, 1);
    reordered.splice(targetIdx, 0, moved);

    setIsReorderingPhotos(true);
    try {
      await reorderPhotosBatch(
        reordered.map((p, index) => ({
          id: p.id,
          sortOrder: index + 1,
        }))
      );
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Impossible de réorganiser les photos.',
      });
    } finally {
      setIsReorderingPhotos(false);
    }
  };

  const handleTogglePhotoFeatured = async (photo: CmsPhotoDoc) => {
    try {
      await updatePhotoRecord(photo.id, {featured: !photo.featured});
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Erreur lors de la mise en avant.',
      });
    }
  };

  const handleTogglePhotoPublished = async (photo: CmsPhotoDoc) => {
    try {
      await updatePhotoRecord(photo.id, {published: !photo.published});
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Erreur de publication.',
      });
    }
  };

  const handleDeletePhoto = async (photo: CmsPhotoDoc) => {
    try {
      await deletePhotoRecord(photo.id);
      await deleteStoredMedia(photo.storagePath, photo.url);
      setFeedback({type: 'success', text: `Photo « ${photo.title} » supprimée.`});
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Impossible de supprimer la photo.',
      });
    }
  };

  const handleSaveEditedPhoto = async () => {
    if (!editingPhoto) return;
    try {
      const chosenAlbum = albums.find((a) => a.id === editingPhoto.albumId);
      await updatePhotoRecord(editingPhoto.id, {
        title: editingPhoto.title,
        description: editingPhoto.description,
        category: editingPhoto.category,
        albumId: chosenAlbum ? chosenAlbum.id : 'general',
        albumTitle: chosenAlbum ? chosenAlbum.title : '',
        featured: editingPhoto.featured,
        published: editingPhoto.published,
      });
      setEditingPhoto(null);
      setFeedback({type: 'success', text: 'Informations de la photo mises à jour.'});
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Impossible d’enregistrer les modifications.',
      });
    }
  };

  // ---- Gestion Catégories & Albums ----
  const handleSaveCategoryDescription = async (
    slug: 'soutenance' | 'photographie-professionnelle'
  ) => {
    const existsAlready = categories.some((c) => c.slug === slug);
    try {
      await saveSiteCategoryMeta(slug, catEdits[slug], existsAlready);
      setFeedback({type: 'success', text: 'Description de la catégorie enregistrée.'});
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Erreur lors de l’enregistrement.',
      });
    }
  };

  const handleCreateAlbum = async () => {
    if (!newAlbumTitle.trim()) {
      setFeedback({type: 'error', text: 'Indiquez un nom d’album avant de créer.'});
      return;
    }
    setSavingAlbum(true);
    try {
      await createAlbumRecord({
        title: newAlbumTitle,
        category: newAlbumCat,
        description: newAlbumDesc,
        published: newAlbumPublished,
        sortOrder: albums.length + 1,
      });
      setNewAlbumTitle('');
      setNewAlbumDesc('');
      setFeedback({type: 'success', text: 'Album créé avec succès.'});
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Impossible de créer l’album.',
      });
    } finally {
      setSavingAlbum(false);
    }
  };

  // ---- Gestion Vidéos ----
  const handlePublishVideo = async (publishImmediately: boolean) => {
    if (!videoTitle.trim()) {
      setFeedback({type: 'error', text: 'Ajoutez un titre pour la vidéo.'});
      return;
    }

    let ytId = '';
    if (videoSourceType === 'youtube') {
      ytId = extractYouTubeId(videoUrlInput);
      if (!ytId) {
        setFeedback({
          type: 'error',
          text: 'Lien ou identifiant YouTube non reconnu (ex: https://www.youtube.com/watch?v=...).',
        });
        return;
      }
    } else if (!videoFile) {
      setFeedback({type: 'error', text: 'Sélectionnez un fichier vidéo MP4 ou WebM.'});
      return;
    }

    setVideoSaving(true);
    setVideoUploadPct(0);
    setVideoPosterPct(0);
    setVideoUploadStage(videoSourceType === 'mp4' ? 'video' : videoPosterFile ? 'poster' : 'saving');
    setFeedback(null);
    try {
      let videoUrl = '';
      let storagePath = '';
      let posterUrl = ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : '';

      if (videoSourceType === 'mp4' && videoFile) {
        setVideoUploadStage('video');
        const up = await uploadMediaFile(videoFile, 'video', 'videos', (pct) => {
          setVideoUploadPct(pct);
        });
        videoUrl = up.url;
        storagePath = up.storagePath;
      }

      if (videoPosterFile) {
        setVideoUploadStage('poster');
        const posterUp = await uploadMediaFile(videoPosterFile, 'image', 'posters', (pct) => {
          setVideoPosterPct(pct);
        });
        posterUrl = posterUp.url;
      }

      setVideoUploadStage('saving');
      await createVideoRecord({
        title: videoTitle,
        description: videoDesc,
        category: videoCategory,
        sourceType: videoSourceType,
        youtubeId: ytId,
        videoUrl,
        posterUrl,
        storagePath,
        isShowreel: videoIsShowreel,
        published: publishImmediately,
        sortOrder: videos.length + 1,
      });

      setVideoUrlInput('');
      setVideoFile(null);
      setVideoPosterFile(null);
      setVideoUploadPct(0);
      setVideoPosterPct(0);
      setVideoTitle('');
      setVideoDesc('');
      setVideoIsShowreel(false);
      setFeedback({
        type: 'success',
        text: publishImmediately ? 'Vidéo publiée sur la page Vidéos.' : 'Vidéo enregistrée en brouillon.',
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Échec lors de l’ajout de la vidéo.',
      });
    } finally {
      setVideoSaving(false);
      setVideoUploadStage(null);
    }
  };

  // ---- Gestion Couvertures ----
  const handleUploadCoverSlot = async (
    slot: (typeof COVER_SLOTS)[number],
    file: File | null
  ) => {
    if (!file) return;
    const err = validateMediaFile(file, 'image');
    if (err) {
      setFeedback({type: 'error', text: err});
      return;
    }
    try {
      const uploaded = await uploadMediaFile(file, 'image', 'covers', (pct) => {
        setCoverProgress((prev) => ({...prev, [slot.id]: pct}));
      });
      const existsAlready = covers.some((c) => c.id === slot.id);
      await saveSiteCover(
        slot.id,
        {
          label: slot.label,
          imageUrl: uploaded.url,
          storagePath: uploaded.storagePath,
          alt: slot.label,
        },
        existsAlready
      );
      setCoverProgress((prev) => ({...prev, [slot.id]: 0}));
      setFeedback({type: 'success', text: `Image mise à jour pour « ${slot.label} ».`});
    } catch (uploadErr) {
      setCoverProgress((prev) => ({...prev, [slot.id]: 0}));
      setFeedback({
        type: 'error',
        text:
          uploadErr instanceof Error ? uploadErr.message : 'Échec lors du changement de couverture.',
      });
    }
  };

  const handleAssignExistingPhotoAsCover = async (
    slot: (typeof COVER_SLOTS)[number],
    photo: CmsPhotoDoc
  ) => {
    try {
      const existsAlready = covers.some((c) => c.id === slot.id);
      await saveSiteCover(
        slot.id,
        {
          label: slot.label,
          imageUrl: photo.url,
          storagePath: '',
          alt: photo.title || slot.label,
        },
        existsAlready
      );
      setFeedback({type: 'success', text: `Photo assignée à « ${slot.label} ».`});
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Erreur lors de l’assignation.',
      });
    }
  };

  // ---- Gestion Services ----
  const handleImportDefaultServices = async () => {
    setSavingService(true);
    setServiceImportProgress({
      current: 0,
      total: DEFAULT_SERVICES.length,
      percent: 5,
      title: 'Préparation des services…',
    });
    try {
      for (let i = 0; i < DEFAULT_SERVICES.length; i++) {
        const srv = DEFAULT_SERVICES[i];
        setServiceImportProgress({
          current: i + 1,
          total: DEFAULT_SERVICES.length,
          percent: Math.round(((i + 1) / DEFAULT_SERVICES.length) * 100),
          title: srv.title,
        });
        const exists = services.some((s) => s.id === srv.id);
        await saveServiceRecord(
          {
            id: srv.id,
            number: srv.number,
            title: srv.title,
            tagline: srv.tagline,
            description: srv.description,
            deliverables: srv.deliverables,
            prestationValue: srv.prestationValue,
            published: true,
            sortOrder: srv.sortOrder,
          },
          exists
        );
      }
      setFeedback({type: 'success', text: 'Services par défaut importés pour modification.'});
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Impossible d’importer les services.',
      });
    } finally {
      setSavingService(false);
      setServiceImportProgress(null);
    }
  };

  const handleSaveServiceDraft = async () => {
    if (!serviceDraft || !serviceDraft.title.trim()) {
      setFeedback({type: 'error', text: 'Indiquez un titre de service.'});
      return;
    }
    setSavingService(true);
    try {
      const isUpdate = Boolean(serviceDraft.id && services.some((s) => s.id === serviceDraft.id));
      await saveServiceRecord(
        {
          id: serviceDraft.id,
          number: serviceDraft.number,
          title: serviceDraft.title,
          tagline: serviceDraft.tagline,
          description: serviceDraft.description,
          deliverables: serviceDraft.deliverablesText
            .split('\n')
            .map((l) => l.trim())
            .filter(Boolean),
          prestationValue: serviceDraft.prestationValue,
          published: serviceDraft.published,
          sortOrder: serviceDraft.sortOrder,
        },
        isUpdate
      );
      setServiceDraft(null);
      setFeedback({type: 'success', text: 'Service enregistré.'});
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Erreur lors de l’enregistrement du service.',
      });
    } finally {
      setSavingService(false);
    }
  };

  // ---- Écran de chargement Auth ----
  if (authLoading) {
    return (
      <main className="flex min-h-[75vh] items-center justify-center bg-[#09090B] p-6">
        <div className="flex items-center gap-3 text-sm text-stone-300">
          <Loader2 className="h-5 w-5 animate-spin text-[#D4AF6A]" aria-hidden="true" />
          <span>Vérification de l’accès administrateur…</span>
        </div>
      </main>
    );
  }

  // ---- Écran de Connexion Privé ----
  if (!user || !isAuthorized) {
    return (
      <main id="mainContent" tabIndex={-1} className="page-enter min-h-[82vh] bg-[#09090B] py-16 px-4 focus:outline-none">
        <div className="mx-auto max-w-lg rounded-2xl border border-white/12 bg-[#121217] p-8 shadow-2xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#D4AF6A]/45 bg-[#D4AF6A]/10 text-[#E7CA91]">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </div>

          <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.22em] text-[#D4AF6A]">
            ESPACE PRIVÉ · DIONTADO PRODUCTION
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-white sm:text-4xl">
            Gestion du Portfolio
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-stone-300">
            Cet espace est réservé à l’administrateur autorisé de DIONTADO PRODUCTION pour publier des photographies, gérer les albums, vidéos, couvertures et services sans écrire de code.
          </p>

          {user && !isAuthorized && (
            <div className="mt-5 rounded-xl border border-red-500/35 bg-red-500/10 p-4 text-xs leading-relaxed text-red-200">
              Le compte connecté (<strong>{user.email || 'inconnu'}</strong>) n’est pas autorisé à administrer ce site. Déconnectez-vous puis utilisez le compte administrateur officiel.
            </div>
          )}

          {authError && (
            <div className="mt-5 rounded-xl border border-red-500/35 bg-red-500/10 p-4 text-xs leading-relaxed text-red-200">
              {authError}
            </div>
          )}

          <div className="mt-7 flex flex-col gap-3">
            {user ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-white/20 bg-white/5 px-5 text-xs font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:border-[#D4AF6A]"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span>Changer de compte Google</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={signingIn}
                className="inline-flex h-12 items-center justify-center gap-2.5 rounded-md bg-[#D4AF6A] px-6 text-xs font-semibold uppercase tracking-[0.12em] text-[#0B0A09] transition-colors hover:bg-[#E7CA91] disabled:opacity-60"
              >
                {signingIn ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                )}
                <span>Se connecter avec Google</span>
              </button>
            )}

            <button
              type="button"
              onClick={onBackHome}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-white/15 px-5 text-xs font-medium text-stone-300 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Retourner au site public</span>
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ---- Espace Administrateur Authentifié ----
  return (
    <main id="mainContent" tabIndex={-1} className="page-enter min-h-screen bg-[#09090B] pb-20 focus:outline-none">
      {/* Barre supérieure Admin */}
      <div className="border-b border-white/10 bg-[#0E0E13]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackHome}
              className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold text-[#F5F2EB] transition-colors hover:border-[#D4AF6A] hover:text-[#E7CA91] whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Voir le site public</span>
            </button>
            <div className="hidden sm:block">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#D4AF6A]">
                Administration privée
              </p>
              <p className="text-xs text-stone-300">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => onNavigatePath('/portfolio')}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-white/15 px-3 text-xs font-medium text-stone-200 transition-colors hover:border-[#D4AF6A] hover:text-[#E7CA91]"
            >
              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Portfolio public</span>
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-3.5 text-xs font-semibold text-stone-200 transition-colors hover:border-red-400/60 hover:text-red-200"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        {/* Titre & Stats rapides */}
        <div className="flex flex-col justify-between gap-6 border-b border-white/10 pb-7 lg:flex-row lg:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#D4AF6A]">
              ESPACE ADMINISTRATEUR · SANS CODAGE
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold text-white sm:text-5xl">
              GESTION DU PORTFOLIO
            </h1>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-5">
            <div className="rounded-xl border border-white/10 bg-[#121217] px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-stone-400">
                Photos ajoutées
              </p>
              <p className="mt-1 font-display text-2xl font-semibold text-white tabular-nums">
                {photos.length}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#121217] px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-stone-400">
                Albums
              </p>
              <p className="mt-1 font-display text-2xl font-semibold text-white tabular-nums">
                {albums.length}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#121217] px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-stone-400">
                Vidéos ajoutées
              </p>
              <p className="mt-1 font-display text-2xl font-semibold text-white tabular-nums">
                {videos.length}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation par onglets */}
        <div className="mt-6 flex flex-wrap gap-2 border-b border-white/10 pb-5" role="tablist">
          {[
            {id: 'photos' as const, label: 'Photos', icon: ImageIcon},
            {id: 'categories' as const, label: 'Catégories & Albums', icon: FolderOpen},
            {id: 'videos' as const, label: 'Vidéos', icon: Video},
            {id: 'covers' as const, label: 'Images de couverture', icon: Layers},
            {id: 'services' as const, label: 'Services', icon: Sparkles},
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex h-10 items-center gap-2 rounded-md border px-4 text-xs font-semibold transition-colors whitespace-nowrap ${
                  active
                    ? 'border-[#D4AF6A] bg-[#D4AF6A] text-[#0B0A09]'
                    : 'border-white/12 bg-[#121217] text-stone-200 hover:border-[#D4AF6A]/60 hover:text-[#E7CA91]'
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Barre de progression globale du chargement des galeries */}
        {!cmsProgress.isComplete && (
          <div className="mt-6 rounded-xl border border-[#D4AF6A]/35 bg-[#121217] p-4 sm:p-5">
            <ProgressBar
              value={cmsProgress.percent}
              label="Chargement des galeries et médias du studio"
              detail={`${cmsProgress.loadedCount} / ${cmsProgress.totalCount} collections · ${cmsProgress.currentLabel}`}
            />
          </div>
        )}

        {/* Alerte Retour d'action */}
        {feedback && (
          <div
            role="status"
            className={`mt-6 flex items-start justify-between gap-4 rounded-xl border p-4 text-sm ${
              feedback.type === 'success'
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                : 'border-red-500/40 bg-red-500/10 text-red-200'
            }`}
          >
            <span>{feedback.text}</span>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              aria-label="Fermer le message"
              className="shrink-0 text-current opacity-80 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ==================== ONGLET 1 : PHOTOS (GESTION DU PORTFOLIO) ==================== */}
        {activeTab === 'photos' && (
          <div className="mt-8 space-y-10">
            {/* Panneau d'ajout guidé en 5 étapes */}
            <section className="rounded-2xl border border-[#D4AF6A]/35 bg-[#121217] p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#D4AF6A]">
                    AJOUT DIRECT · TÉLÉPHONE OU ORDINATEUR
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-semibold text-white sm:text-3xl">
                    Publier de nouvelles photographies
                  </h2>
                </div>

                <div>
                  <input
                    ref={photoInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => handleSelectPhotoFiles(e.target.files)}
                    className="sr-only"
                  />
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    disabled={isUploadingPhotos}
                    className="inline-flex h-11 items-center gap-2 rounded-md bg-[#D4AF6A] px-5 text-xs font-semibold uppercase tracking-[0.1em] text-[#0B0A09] transition-colors hover:bg-[#E7CA91] disabled:opacity-60"
                  >
                    <Upload className="h-4 w-4" aria-hidden="true" />
                    <span>Ajouter des photos</span>
                  </button>
                </div>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-[0.14em] text-stone-300">
                    1. Catégorie officielle
                  </label>
                  <select
                    value={batchCategory}
                    onChange={(e) => {
                      setBatchCategory(e.target.value as OfficialPhotoCategory);
                      setBatchAlbumId('general');
                    }}
                    className="mt-2 h-11 w-full rounded-md border border-white/15 bg-[#09090B] px-3 text-sm text-white focus:border-[#D4AF6A] focus:outline-none"
                  >
                    {OFFICIAL_PHOTO_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-[0.14em] text-stone-300">
                    2. Album (optionnel)
                  </label>
                  <select
                    value={batchAlbumId}
                    onChange={(e) => setBatchAlbumId(e.target.value)}
                    className="mt-2 h-11 w-full rounded-md border border-white/15 bg-[#09090B] px-3 text-sm text-white focus:border-[#D4AF6A] focus:outline-none"
                  >
                    <option value="general">Aucun album spécifique</option>
                    {availableBatchAlbums.map((album) => (
                      <option key={album.id} value={album.id}>
                        {album.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-[0.14em] text-stone-300">
                    3. Titre (optionnel)
                  </label>
                  <input
                    type="text"
                    value={batchTitle}
                    onChange={(e) => setBatchTitle(e.target.value)}
                    placeholder="Ex: Portrait Studio Dakar"
                    className="mt-2 h-11 w-full rounded-md border border-white/15 bg-[#09090B] px-3 text-sm text-white placeholder:text-stone-500 focus:border-[#D4AF6A] focus:outline-none"
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex h-11 w-full cursor-pointer items-center gap-2.5 rounded-md border border-white/15 bg-[#09090B] px-3.5 text-xs text-stone-200">
                    <input
                      type="checkbox"
                      checked={batchFeatured}
                      onChange={(e) => setBatchFeatured(e.target.checked)}
                      className="h-4 w-4 accent-[#D4AF6A]"
                    />
                    <span>Afficher en premier</span>
                  </label>
                </div>
              </div>

              <div className="mt-4">
                <label className="block font-mono text-[11px] uppercase tracking-[0.14em] text-stone-300">
                  4. Description (optionnelle)
                </label>
                <textarea
                  rows={2}
                  value={batchDesc}
                  onChange={(e) => setBatchDesc(e.target.value)}
                  placeholder="Contexte de la séance, lieu, ambiance…"
                  className="mt-2 w-full rounded-md border border-white/15 bg-[#09090B] px-3 py-2.5 text-sm text-white placeholder:text-stone-500 focus:border-[#D4AF6A] focus:outline-none"
                />
              </div>

              {/* Aperçu des fichiers sélectionnés */}
              {queuedPhotos.length > 0 && (
                <div className="mt-6 border-t border-white/10 pt-6">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#E7CA91]">
                      {queuedPhotos.length}{' '}
                      {queuedPhotos.length > 1 ? 'fichiers prêts à publier' : 'fichier prêt à publier'}
                    </p>
                    <p className="font-mono text-[11px] text-stone-400 tabular-nums">
                      Volume total :{' '}
                      {(
                        queuedPhotos.reduce((sum, q) => sum + q.file.size, 0) /
                        (1024 * 1024)
                      ).toFixed(2)}{' '}
                      Mo
                    </p>
                  </div>

                  {isUploadingPhotos && batchUploadProgress && (
                    <div className="mb-5 rounded-xl border border-[#D4AF6A]/40 bg-[#09090B] p-4">
                      <ProgressBar
                        value={batchUploadProgress.percent}
                        label={`Publication du lot : ${batchUploadProgress.currentIndex} / ${batchUploadProgress.totalCount} (${batchUploadProgress.fileName})`}
                        detail={`${batchUploadProgress.phase} · ${(
                          batchUploadProgress.totalBytes /
                          (1024 * 1024)
                        ).toFixed(2)} Mo au total`}
                      />
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {queuedPhotos.map((q) => (
                      <div
                        key={q.localId}
                        className="overflow-hidden rounded-xl border border-white/12 bg-[#09090B]"
                      >
                        <div className="relative aspect-[4/3] bg-black">
                          <img
                            src={q.previewUrl}
                            alt={q.file.name}
                            className="h-full w-full object-cover"
                          />
                          {!isUploadingPhotos && (
                            <button
                              type="button"
                              onClick={() => removeQueuedPhoto(q.localId)}
                              aria-label={`Retirer ${q.file.name}`}
                              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md bg-black/75 text-white hover:bg-red-600"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="truncate text-xs font-medium text-white">{q.file.name}</p>
                          <p className="mt-0.5 font-mono text-[10px] text-stone-400">
                            {(q.file.size / (1024 * 1024)).toFixed(2)} Mo
                          </p>
                          <div className="mt-2.5">
                            {q.status === 'uploading' ? (
                              <ProgressBar
                                size="sm"
                                value={q.progress}
                                label="Téléversement"
                                detail={q.progress >= 98 ? 'Finalisation dans la galerie…' : undefined}
                              />
                            ) : q.status === 'done' ? (
                              <ProgressBar size="sm" value={100} tone="emerald" label="Publiée" />
                            ) : q.status === 'error' ? (
                              <ProgressBar
                                size="sm"
                                value={q.progress || 100}
                                tone="error"
                                label="Échec de l’envoi"
                                detail={q.error}
                              />
                            ) : isUploadingPhotos ? (
                              <ProgressBar size="sm" value={0} label="En file d’attente" />
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      disabled={isUploadingPhotos}
                      onClick={() => handlePublishQueuedPhotos(true)}
                      className="inline-flex h-11 items-center gap-2 rounded-md bg-[#D4AF6A] px-6 text-xs font-semibold uppercase tracking-[0.1em] text-[#0B0A09] transition-colors hover:bg-[#E7CA91] disabled:opacity-60"
                    >
                      {isUploadingPhotos ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <Check className="h-4 w-4" aria-hidden="true" />
                      )}
                      <span>5. Publier maintenant</span>
                    </button>

                    <button
                      type="button"
                      disabled={isUploadingPhotos}
                      onClick={() => handlePublishQueuedPhotos(false)}
                      className="inline-flex h-11 items-center gap-2 rounded-md border border-white/20 bg-white/5 px-5 text-xs font-semibold text-white transition-colors hover:border-[#D4AF6A] disabled:opacity-60"
                    >
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                      <span>Enregistrer en brouillon</span>
                    </button>

                    <button
                      type="button"
                      disabled={isUploadingPhotos}
                      onClick={() => setPreviewBatchModalOpen(true)}
                      className="inline-flex h-11 items-center gap-2 rounded-md border border-[#D4AF6A]/45 px-5 text-xs font-semibold text-[#E7CA91] transition-colors hover:bg-[#D4AF6A]/10 disabled:opacity-60"
                    >
                      <Eye className="h-4 w-4" aria-hidden="true" />
                      <span>Prévisualiser avant publication</span>
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* Liste de gestion des photos existantes */}
            <section className="rounded-2xl border border-white/10 bg-[#121217] p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">
                    Photos gérées ({filteredPhotos.length})
                  </h2>
                  <p className="mt-1 text-xs text-stone-400">
                    Les 19 photographies d’archive du portfolio restent affichées automatiquement. Vos ajouts marqués « En premier » apparaissent en tête de galerie.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <select
                    value={photoFilterCat}
                    onChange={(e) =>
                      setPhotoFilterCat(e.target.value as 'all' | OfficialPhotoCategory)
                    }
                    className="h-9 rounded-md border border-white/15 bg-[#09090B] px-3 text-xs text-white"
                  >
                    <option value="all">Toutes catégories</option>
                    <option value="Soutenance">Soutenance</option>
                    <option value="Photographie professionnelle">Photographie professionnelle</option>
                  </select>
                  <select
                    value={photoFilterStatus}
                    onChange={(e) =>
                      setPhotoFilterStatus(e.target.value as 'all' | 'published' | 'draft')
                    }
                    className="h-9 rounded-md border border-white/15 bg-[#09090B] px-3 text-xs text-white"
                  >
                    <option value="all">Publiées &amp; brouillons</option>
                    <option value="published">Publiées uniquement</option>
                    <option value="draft">Brouillons uniquement</option>
                  </select>
                </div>
              </div>

              {isReorderingPhotos && (
                <div className="mt-4 rounded-xl border border-[#D4AF6A]/35 bg-[#09090B] p-3.5">
                  <ProgressBar
                    size="sm"
                    value={65}
                    indeterminate
                    label="Réorganisation de la galerie en cours…"
                  />
                </div>
              )}

              {!cmsProgress.isComplete && filteredPhotos.length === 0 ? (
                <div className="py-10">
                  <ProgressBar
                    value={cmsProgress.percent}
                    label="Chargement de la galerie photographique…"
                    detail={cmsProgress.currentLabel}
                  />
                </div>
              ) : filteredPhotos.length === 0 ? (
                <p className="py-10 text-center text-sm text-stone-400">
                  Aucune photo ajoutée dans ce filtre pour le moment. Cliquez sur « Ajouter des photos » ci-dessus.
                </p>
              ) : (
                <div className="mt-6 space-y-4">
                  {filteredPhotos.map((photo, index) => {
                    const dlState = downloadProgress[photo.id];
                    return (
                      <div
                        key={photo.id}
                        className="rounded-xl border border-white/10 bg-[#09090B] p-4"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                          <img
                            src={photo.url}
                            alt={photo.title}
                            className="h-24 w-24 shrink-0 rounded-lg object-cover bg-black"
                          />

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#D4AF6A]">
                                {photo.category}
                              </span>
                              {photo.albumTitle && (
                                <span className="font-mono text-[10px] text-stone-400">
                                  · {photo.albumTitle}
                                </span>
                              )}
                              <span
                                className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                                  photo.published
                                    ? 'bg-emerald-500/15 text-emerald-300'
                                    : 'bg-amber-500/15 text-amber-200'
                                }`}
                              >
                                {photo.published ? 'Publiée' : 'Brouillon'}
                              </span>
                              {photo.featured && (
                                <span className="rounded bg-[#D4AF6A]/20 px-2 py-0.5 text-[10px] font-semibold text-[#E7CA91]">
                                  En premier
                                </span>
                              )}
                            </div>

                            <h3 className="mt-1 truncate font-display text-xl font-semibold text-white">
                              {photo.title}
                            </h3>
                            {photo.description && (
                              <p className="mt-0.5 line-clamp-2 text-xs text-stone-400">
                                {photo.description}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleMovePhoto(photo.id, -1)}
                              disabled={index === 0 || isReorderingPhotos}
                              title="Monter"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/15 text-stone-300 hover:border-[#D4AF6A] hover:text-white disabled:opacity-35"
                            >
                              <ArrowUp className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMovePhoto(photo.id, 1)}
                              disabled={index === filteredPhotos.length - 1 || isReorderingPhotos}
                              title="Descendre"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/15 text-stone-300 hover:border-[#D4AF6A] hover:text-white disabled:opacity-35"
                            >
                              <ArrowDown className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleTogglePhotoFeatured(photo)}
                              title={photo.featured ? 'Retirer de la tête' : 'Mettre en premier'}
                              className={`inline-flex h-9 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium ${
                                photo.featured
                                  ? 'border-[#D4AF6A] bg-[#D4AF6A]/15 text-[#E7CA91]'
                                  : 'border-white/15 text-stone-300 hover:border-[#D4AF6A]'
                              }`}
                            >
                              <Star className="h-3.5 w-3.5" />
                              <span className="hidden md:inline">En premier</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleTogglePhotoPublished(photo)}
                              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-white/15 px-2.5 text-xs font-medium text-stone-200 hover:border-[#D4AF6A]"
                            >
                              {photo.published ? (
                                <>
                                  <EyeOff className="h-3.5 w-3.5" />
                                  <span>Dépublier</span>
                                </>
                              ) : (
                                <>
                                  <Eye className="h-3.5 w-3.5" />
                                  <span>Publier</span>
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleDownloadAdminMedia(
                                  photo.id,
                                  photo.url,
                                  photo.fileName || `${photo.title}.jpg`,
                                  `Téléchargement : ${photo.title}`
                                )
                              }
                              disabled={Boolean(dlState)}
                              title="Télécharger la photo"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/15 text-stone-300 hover:border-[#D4AF6A] hover:text-[#E7CA91] disabled:opacity-45"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setPreviewPhotoItem(photo)}
                              title="Prévisualiser"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/15 text-stone-300 hover:border-[#D4AF6A]"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingPhoto({...photo})}
                              title="Modifier"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/15 text-stone-300 hover:border-[#D4AF6A]"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePhoto(photo)}
                              title="Supprimer"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/15 text-stone-300 hover:border-red-500 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {dlState && (
                          <div className="mt-3 border-t border-white/10 pt-3">
                            <ProgressBar
                              size="sm"
                              value={dlState.percent}
                              indeterminate={dlState.indeterminate}
                              tone={dlState.percent === 100 && !dlState.indeterminate ? 'emerald' : 'gold'}
                              label={dlState.label}
                              detail={
                                dlState.totalBytes > 0
                                  ? `${(dlState.loadedBytes / (1024 * 1024)).toFixed(2)} / ${(
                                      dlState.totalBytes /
                                      (1024 * 1024)
                                    ).toFixed(2)} Mo`
                                  : dlState.loadedBytes > 0
                                    ? `${(dlState.loadedBytes / (1024 * 1024)).toFixed(2)} Mo reçus`
                                    : undefined
                              }
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ==================== ONGLET 2 : CATÉGORIES & ALBUMS ==================== */}
        {activeTab === 'categories' && (
          <div className="mt-8 space-y-8">
            <section className="rounded-2xl border border-white/10 bg-[#121217] p-6 sm:p-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#D4AF6A]">
                COLLECTIONS OFFICIELLES VERROUILLÉES
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold text-white">
                Catégories du portfolio photographique
              </h2>
              <p className="mt-1 text-xs text-stone-400">
                Le site conserve strictement les deux catégories officielles : SOUTENANCE et PHOTOGRAPHIE PROFESSIONNELLE. Vous pouvez personnaliser leurs textes de présentation.
              </p>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {(['soutenance', 'photographie-professionnelle'] as const).map((slug) => {
                  const title =
                    slug === 'soutenance' ? 'SOUTENANCE' : 'PHOTOGRAPHIE PROFESSIONNELLE';
                  return (
                    <div
                      key={slug}
                      className="rounded-xl border border-white/12 bg-[#09090B] p-5"
                    >
                      <h3 className="font-display text-2xl font-semibold text-[#E7CA91]">
                        {title}
                      </h3>
                      <label className="mt-4 block text-xs font-medium text-stone-300">
                        Sous-titre
                      </label>
                      <input
                        type="text"
                        value={catEdits[slug].subtitle}
                        onChange={(e) =>
                          setCatEdits((prev) => ({
                            ...prev,
                            [slug]: {...prev[slug], subtitle: e.target.value},
                          }))
                        }
                        className="mt-1.5 h-10 w-full rounded-md border border-white/15 bg-[#121217] px-3 text-sm text-white"
                      />
                      <label className="mt-4 block text-xs font-medium text-stone-300">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        value={catEdits[slug].description}
                        onChange={(e) =>
                          setCatEdits((prev) => ({
                            ...prev,
                            [slug]: {...prev[slug], description: e.target.value},
                          }))
                        }
                        className="mt-1.5 w-full rounded-md border border-white/15 bg-[#121217] px-3 py-2 text-sm text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveCategoryDescription(slug)}
                        className="mt-4 inline-flex h-10 items-center rounded-md bg-[#D4AF6A] px-4 text-xs font-semibold text-[#0B0A09] hover:bg-[#E7CA91]"
                      >
                        Enregistrer la présentation
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Gestion des Albums */}
            <section className="rounded-2xl border border-white/10 bg-[#121217] p-6 sm:p-8">
              <h2 className="font-display text-2xl font-semibold text-white">
                Albums thématiques
              </h2>
              <p className="mt-1 text-xs text-stone-400">
                Regroupez vos séances (ex : Promotion 2026, Studio Dakar, Événements) à l’intérieur des deux galeries officielles.
              </p>

              <div className="mt-5 grid gap-4 rounded-xl border border-white/10 bg-[#09090B] p-5 md:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-stone-300">Nom de l’album</label>
                  <input
                    type="text"
                    value={newAlbumTitle}
                    onChange={(e) => setNewAlbumTitle(e.target.value)}
                    placeholder="Ex: Soutenances UCAD 2026"
                    className="mt-1.5 h-10 w-full rounded-md border border-white/15 bg-[#121217] px-3 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-300">Catégorie</label>
                  <select
                    value={newAlbumCat}
                    onChange={(e) => setNewAlbumCat(e.target.value as OfficialPhotoCategory)}
                    className="mt-1.5 h-10 w-full rounded-md border border-white/15 bg-[#121217] px-3 text-sm text-white"
                  >
                    {OFFICIAL_PHOTO_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end gap-3">
                  <label className="flex h-10 items-center gap-2 text-xs text-stone-200">
                    <input
                      type="checkbox"
                      checked={newAlbumPublished}
                      onChange={(e) => setNewAlbumPublished(e.target.checked)}
                      className="h-4 w-4 accent-[#D4AF6A]"
                    />
                    <span>Publié</span>
                  </label>
                  <button
                    type="button"
                    disabled={savingAlbum}
                    onClick={handleCreateAlbum}
                    className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-md bg-[#D4AF6A] px-4 text-xs font-semibold text-[#0B0A09] hover:bg-[#E7CA91]"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Créer l’album</span>
                  </button>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {albums.map((album) => (
                  <div
                    key={album.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#09090B] px-5 py-4"
                  >
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#D4AF6A]">
                        {album.category}
                      </p>
                      <p className="font-display text-xl font-semibold text-white">
                        {album.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateAlbumRecord(album.id, {published: !album.published})}
                        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-white/15 px-3 text-xs font-medium text-stone-200 hover:border-[#D4AF6A]"
                      >
                        {album.published ? 'Publié (Dépublier)' : 'Brouillon (Publier)'}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteAlbumRecord(album.id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/15 text-stone-300 hover:border-red-500 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ==================== ONGLET 3 : VIDÉOS ==================== */}
        {activeTab === 'videos' && (
          <div className="mt-8 space-y-8">
            <section className="rounded-2xl border border-[#D4AF6A]/35 bg-[#121217] p-6 sm:p-8">
              <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">
                Ajouter une réalisation vidéo
              </h2>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setVideoSourceType('youtube')}
                  className={`h-10 rounded-md border px-4 text-xs font-semibold ${
                    videoSourceType === 'youtube'
                      ? 'border-[#D4AF6A] bg-[#D4AF6A] text-[#0B0A09]'
                      : 'border-white/15 bg-[#09090B] text-stone-200'
                  }`}
                >
                  Lien YouTube
                </button>
                <button
                  type="button"
                  onClick={() => setVideoSourceType('mp4')}
                  className={`h-10 rounded-md border px-4 text-xs font-semibold ${
                    videoSourceType === 'mp4'
                      ? 'border-[#D4AF6A] bg-[#D4AF6A] text-[#0B0A09]'
                      : 'border-white/15 bg-[#09090B] text-stone-200'
                  }`}
                >
                  Fichier vidéo (MP4 / WebM)
                </button>
              </div>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                {videoSourceType === 'youtube' ? (
                  <div>
                    <label className="block text-xs font-medium text-stone-300">
                      Lien ou identifiant YouTube
                    </label>
                    <input
                      type="text"
                      value={videoUrlInput}
                      onChange={(e) => setVideoUrlInput(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="mt-1.5 h-11 w-full rounded-md border border-white/15 bg-[#09090B] px-3 text-sm text-white"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-medium text-stone-300">
                      Fichier vidéo (max 50 Mo)
                    </label>
                    <input
                      type="file"
                      accept="video/mp4,video/webm"
                      onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                      className="mt-1.5 block w-full text-xs text-stone-300 file:mr-3 file:rounded-md file:border-0 file:bg-[#D4AF6A] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-[#0B0A09]"
                    />
                    {videoFile && (
                      <p className="mt-1.5 font-mono text-[10px] text-stone-400">
                        {videoFile.name} · {(videoFile.size / (1024 * 1024)).toFixed(2)} Mo
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-stone-300">Catégorie vidéo</label>
                  <select
                    value={videoCategory}
                    onChange={(e) => setVideoCategory(e.target.value as VideoCategory)}
                    className="mt-1.5 h-11 w-full rounded-md border border-white/15 bg-[#09090B] px-3 text-sm text-white"
                  >
                    {VIDEO_ONLY_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300">Titre du film</label>
                  <input
                    type="text"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder="Ex: Film de Mariage — Dakar"
                    className="mt-1.5 h-11 w-full rounded-md border border-white/15 bg-[#09090B] px-3 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300">
                    Vignette personnalisée (optionnel)
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => setVideoPosterFile(e.target.files?.[0] || null)}
                    className="mt-1.5 block w-full text-xs text-stone-300 file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-medium text-stone-300">Description</label>
                <textarea
                  rows={2}
                  value={videoDesc}
                  onChange={(e) => setVideoDesc(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-white/15 bg-[#09090B] px-3 py-2 text-sm text-white"
                />
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-xs text-stone-200">
                  <input
                    type="checkbox"
                    checked={videoIsShowreel}
                    onChange={(e) => setVideoIsShowreel(e.target.checked)}
                    className="h-4 w-4 accent-[#D4AF6A]"
                  />
                  <span>Définir comme Showreel principal</span>
                </label>

                <button
                  type="button"
                  disabled={videoSaving}
                  onClick={() => handlePublishVideo(true)}
                  className="inline-flex h-11 items-center gap-2 rounded-md bg-[#D4AF6A] px-6 text-xs font-semibold uppercase tracking-[0.1em] text-[#0B0A09] hover:bg-[#E7CA91] disabled:opacity-60"
                >
                  {videoSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  <span>Publier la vidéo</span>
                </button>

                <button
                  type="button"
                  disabled={videoSaving}
                  onClick={() => handlePublishVideo(false)}
                  className="inline-flex h-11 items-center rounded-md border border-white/20 px-4 text-xs font-semibold text-white"
                >
                  Enregistrer en brouillon
                </button>

                {videoSourceType === 'youtube' && extractYouTubeId(videoUrlInput) && (
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewVideoModal({
                        title: videoTitle || 'Prévisualisation vidéo',
                        category: videoCategory,
                        desc: videoDesc,
                        sourceType: 'youtube',
                        youtubeId: extractYouTubeId(videoUrlInput),
                      })
                    }
                    className="inline-flex h-11 items-center gap-2 rounded-md border border-[#D4AF6A]/45 px-4 text-xs font-semibold text-[#E7CA91]"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Prévisualiser</span>
                  </button>
                )}
              </div>

              {videoSaving && (
                <div className="mt-5 rounded-xl border border-[#D4AF6A]/35 bg-[#09090B] p-4">
                  <ProgressBar
                    value={
                      videoUploadStage === 'video'
                        ? videoUploadPct
                        : videoUploadStage === 'poster'
                          ? videoPosterPct
                          : 95
                    }
                    indeterminate={videoUploadStage === 'saving'}
                    label={
                      videoUploadStage === 'video'
                        ? `Téléversement de la vidéo (${videoFile?.name || 'MP4/WebM'})`
                        : videoUploadStage === 'poster'
                          ? `Téléversement de la vignette (${videoPosterFile?.name || 'Image'})`
                          : 'Publication de la vidéo dans le portfolio…'
                    }
                    detail={
                      videoUploadStage === 'video' && videoFile
                        ? `${(videoFile.size / (1024 * 1024)).toFixed(2)} Mo · Envoi sécurisé en cours`
                        : undefined
                    }
                  />
                </div>
              )}
            </section>

            {/* Liste vidéos CMS */}
            <section className="rounded-2xl border border-white/10 bg-[#121217] p-6 sm:p-8">
              <h2 className="font-display text-2xl font-semibold text-white">
                Vidéos gérées ({sortedVideos.length})
              </h2>
              {!cmsProgress.isComplete && sortedVideos.length === 0 ? (
                <div className="py-8">
                  <ProgressBar
                    value={cmsProgress.percent}
                    label="Chargement du catalogue vidéo…"
                    detail={cmsProgress.currentLabel}
                  />
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {sortedVideos.map((vid) => {
                    const dlState = downloadProgress[vid.id];
                    return (
                      <div
                        key={vid.id}
                        className="rounded-xl border border-white/10 bg-[#09090B] p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-black">
                              {vid.posterUrl ? (
                                <img src={vid.posterUrl} alt={vid.title} className="h-full w-full object-cover" />
                              ) : (
                                <Film className="h-6 w-6 text-[#D4AF6A]" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#D4AF6A]">
                                {vid.category} · {vid.published ? 'Publiée' : 'Brouillon'}
                              </p>
                              <p className="truncate font-display text-xl font-semibold text-white">
                                {vid.title}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateVideoRecord(vid.id, {published: !vid.published})}
                              className="inline-flex h-9 items-center rounded-md border border-white/15 px-3 text-xs text-stone-200 hover:border-[#D4AF6A]"
                            >
                              {vid.published ? 'Dépublier' : 'Publier'}
                            </button>
                            {vid.sourceType === 'mp4' && vid.videoUrl && (
                              <button
                                type="button"
                                disabled={Boolean(dlState)}
                                onClick={() =>
                                  handleDownloadAdminMedia(
                                    vid.id,
                                    vid.videoUrl,
                                    `${cleanBaseTitle(vid.title) || 'video'}.mp4`,
                                    `Téléchargement : ${vid.title}`
                                  )
                                }
                                title="Télécharger la vidéo"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/15 text-stone-300 hover:border-[#D4AF6A] hover:text-[#E7CA91] disabled:opacity-45"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setEditingVideo({...vid})}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/15 text-stone-300 hover:border-[#D4AF6A]"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                await deleteVideoRecord(vid.id);
                                await deleteStoredMedia(vid.storagePath, vid.videoUrl);
                              }}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/15 text-stone-300 hover:border-red-500 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {dlState && (
                          <div className="mt-3 border-t border-white/10 pt-3">
                            <ProgressBar
                              size="sm"
                              value={dlState.percent}
                              indeterminate={dlState.indeterminate}
                              tone={dlState.percent === 100 && !dlState.indeterminate ? 'emerald' : 'gold'}
                              label={dlState.label}
                              detail={
                                dlState.totalBytes > 0
                                  ? `${(dlState.loadedBytes / (1024 * 1024)).toFixed(2)} / ${(
                                      dlState.totalBytes /
                                      (1024 * 1024)
                                    ).toFixed(2)} Mo`
                                  : dlState.loadedBytes > 0
                                    ? `${(dlState.loadedBytes / (1024 * 1024)).toFixed(2)} Mo reçus`
                                    : undefined
                              }
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ==================== ONGLET 4 : COUVERTURES ==================== */}
        {activeTab === 'covers' && (
          <section className="mt-8 grid gap-6 md:grid-cols-2">
            {COVER_SLOTS.map((slot) => {
              const current = covers.find((c) => c.id === slot.id);
              const imgSrc = current?.imageUrl || slot.fallbackUrl;
              const pct = coverProgress[slot.id] || 0;
              return (
                <div
                  key={slot.id}
                  className="overflow-hidden rounded-2xl border border-white/12 bg-[#121217]"
                >
                  <div className="aspect-video w-full overflow-hidden bg-black">
                    <img src={imgSrc} alt={slot.label} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-2xl font-semibold text-white">{slot.label}</h3>
                    <p className="mt-1 text-xs text-stone-400">{slot.hint}</p>

                    <div className="mt-4 flex flex-col gap-3">
                      <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-[#D4AF6A] px-4 text-xs font-semibold text-[#0B0A09] hover:bg-[#E7CA91]">
                        <Upload className="h-4 w-4" />
                        <span>Importer une nouvelle image</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) => handleUploadCoverSlot(slot, e.target.files?.[0] || null)}
                          className="sr-only"
                        />
                      </label>

                      {pct > 0 && (
                        <div className="rounded-lg border border-[#D4AF6A]/35 bg-[#09090B] p-3">
                          <ProgressBar
                            size="sm"
                            value={pct}
                            label="Téléversement de la couverture"
                            detail={pct >= 98 ? 'Mise à jour du site…' : undefined}
                          />
                        </div>
                      )}

                      {photos.length > 0 && (
                        <select
                          defaultValue=""
                          onChange={(e) => {
                            const selected = photos.find((p) => p.id === e.target.value);
                            if (selected) handleAssignExistingPhotoAsCover(slot, selected);
                          }}
                          className="h-10 rounded-md border border-white/15 bg-[#09090B] px-3 text-xs text-stone-200"
                        >
                          <option value="" disabled>
                            Ou choisir une photo déjà publiée…
                          </option>
                          {photos.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.title} ({p.category})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* ==================== ONGLET 5 : SERVICES ==================== */}
        {activeTab === 'services' && (
          <section className="mt-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#121217] p-6">
              <div>
                <h2 className="font-display text-2xl font-semibold text-white">
                  Présentation des services
                </h2>
                <p className="mt-1 text-xs text-stone-400">
                  Modifiez les prestations affichées sur la page publique Services.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {services.length === 0 && (
                  <button
                    type="button"
                    disabled={savingService}
                    onClick={handleImportDefaultServices}
                    className="inline-flex h-10 items-center gap-2 rounded-md border border-[#D4AF6A]/45 bg-[#D4AF6A]/10 px-4 text-xs font-semibold text-[#E7CA91]"
                  >
                    Importer les 4 services de base
                  </button>
                )}
                <button
                  type="button"
                  onClick={() =>
                    setServiceDraft({
                      number: String(services.length + 1).padStart(2, '0'),
                      title: '',
                      tagline: '',
                      description: '',
                      deliverablesText: '',
                      prestationValue: 'Photographie professionnelle',
                      published: true,
                      sortOrder: services.length + 1,
                    })
                  }
                  className="inline-flex h-10 items-center gap-1.5 rounded-md bg-[#D4AF6A] px-4 text-xs font-semibold text-[#0B0A09] hover:bg-[#E7CA91]"
                >
                  <Plus className="h-4 w-4" />
                  <span>Nouveau service</span>
                </button>
              </div>
            </div>

            {serviceImportProgress && (
              <div className="rounded-xl border border-[#D4AF6A]/35 bg-[#121217] p-4">
                <ProgressBar
                  value={serviceImportProgress.percent}
                  label={`Importation des services (${serviceImportProgress.current} / ${serviceImportProgress.total})`}
                  detail={serviceImportProgress.title}
                />
              </div>
            )}

            {serviceDraft && (
              <div className="rounded-2xl border border-[#D4AF6A]/40 bg-[#121217] p-6 space-y-4">
                <h3 className="font-display text-2xl font-semibold text-white">
                  {serviceDraft.id ? 'Modifier le service' : 'Créer un service'}
                </h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <input
                    type="text"
                    value={serviceDraft.number}
                    onChange={(e) => setServiceDraft({...serviceDraft, number: e.target.value})}
                    placeholder="Numéro (ex: 01)"
                    className="h-10 rounded-md border border-white/15 bg-[#09090B] px-3 text-sm text-white"
                  />
                  <input
                    type="text"
                    value={serviceDraft.title}
                    onChange={(e) => setServiceDraft({...serviceDraft, title: e.target.value})}
                    placeholder="Titre du service"
                    className="h-10 rounded-md border border-white/15 bg-[#09090B] px-3 text-sm text-white md:col-span-2"
                  />
                </div>
                <input
                  type="text"
                  value={serviceDraft.tagline}
                  onChange={(e) => setServiceDraft({...serviceDraft, tagline: e.target.value})}
                  placeholder="Sous-titre"
                  className="h-10 w-full rounded-md border border-white/15 bg-[#09090B] px-3 text-sm text-white"
                />
                <textarea
                  rows={3}
                  value={serviceDraft.description}
                  onChange={(e) => setServiceDraft({...serviceDraft, description: e.target.value})}
                  placeholder="Description du service"
                  className="w-full rounded-md border border-white/15 bg-[#09090B] px-3 py-2 text-sm text-white"
                />
                <textarea
                  rows={3}
                  value={serviceDraft.deliverablesText}
                  onChange={(e) =>
                    setServiceDraft({...serviceDraft, deliverablesText: e.target.value})
                  }
                  placeholder="Points inclus (un par ligne)"
                  className="w-full rounded-md border border-white/15 bg-[#09090B] px-3 py-2 text-sm text-white"
                />
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={savingService}
                    onClick={handleSaveServiceDraft}
                    className="inline-flex h-10 items-center rounded-md bg-[#D4AF6A] px-5 text-xs font-semibold text-[#0B0A09]"
                  >
                    Enregistrer
                  </button>
                  <button
                    type="button"
                    onClick={() => setServiceDraft(null)}
                    className="inline-flex h-10 items-center rounded-md border border-white/15 px-4 text-xs text-stone-300"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {sortedServices.map((srv) => (
                <div
                  key={srv.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#121217] p-5"
                >
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#D4AF6A]">
                      {srv.number} · {srv.published ? 'Publié' : 'Brouillon'}
                    </p>
                    <h3 className="font-display text-2xl font-semibold text-white">{srv.title}</h3>
                    <p className="text-xs text-stone-400">{srv.tagline}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setServiceDraft({
                          id: srv.id,
                          number: srv.number,
                          title: srv.title,
                          tagline: srv.tagline,
                          description: srv.description,
                          deliverablesText: srv.deliverables.join('\n'),
                          prestationValue: srv.prestationValue,
                          published: srv.published,
                          sortOrder: srv.sortOrder,
                        })
                      }
                      className="inline-flex h-9 items-center gap-1.5 rounded-md border border-white/15 px-3 text-xs text-stone-200 hover:border-[#D4AF6A]"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Modifier</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteServiceRecord(srv.id)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/15 text-stone-300 hover:border-red-500 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Modal Prévisualisation Lot Photos */}
      {previewBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-[#D4AF6A]/40 bg-[#121217] p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#D4AF6A]">
                  PRÉVISUALISATION AVANT PUBLICATION · {batchCategory}
                </p>
                <h3 className="font-display text-2xl font-semibold text-white">
                  Aperçu tel qu’il apparaîtra sur le site public
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewBatchModalOpen(false)}
                className="rounded-md p-2 text-stone-300 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2 md:grid-cols-3">
              {queuedPhotos.map((q, idx) => (
                <div
                  key={`prev-${q.localId}`}
                  className="overflow-hidden rounded-xl border border-white/10 bg-[#09090B]"
                >
                  <div className="aspect-[3/4] overflow-hidden">
                    <img src={q.previewUrl} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="p-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#D4AF6A]">
                      {batchCategory}
                    </p>
                    <p className="truncate font-display text-lg font-semibold text-white">
                      {batchTitle.trim()
                        ? queuedPhotos.length > 1
                          ? `${batchTitle.trim()} — ${String(idx + 1).padStart(2, '0')}`
                          : batchTitle.trim()
                        : cleanBaseTitle(q.file.name)}
                    </p>
                    {batchDesc.trim() && (
                      <p className="mt-1 text-xs text-stone-400">{batchDesc.trim()}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-white/10 pt-5">
              <button
                type="button"
                onClick={() => setPreviewBatchModalOpen(false)}
                className="h-10 rounded-md border border-white/15 px-4 text-xs font-medium text-stone-200"
              >
                Revenir modifier
              </button>
              <button
                type="button"
                onClick={() => handlePublishQueuedPhotos(true)}
                className="h-10 rounded-md bg-[#D4AF6A] px-5 text-xs font-semibold text-[#0B0A09] hover:bg-[#E7CA91]"
              >
                Confirmer et publier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Modification Photo */}
      {editingPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#121217] p-6">
            <h3 className="font-display text-2xl font-semibold text-white">
              Modifier les informations
            </h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs text-stone-300">Titre</label>
                <input
                  type="text"
                  value={editingPhoto.title}
                  onChange={(e) => setEditingPhoto({...editingPhoto, title: e.target.value})}
                  className="mt-1 h-10 w-full rounded-md border border-white/15 bg-[#09090B] px-3 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-stone-300">Catégorie</label>
                <select
                  value={editingPhoto.category}
                  onChange={(e) =>
                    setEditingPhoto({
                      ...editingPhoto,
                      category: e.target.value as OfficialPhotoCategory,
                      albumId: 'general',
                    })
                  }
                  className="mt-1 h-10 w-full rounded-md border border-white/15 bg-[#09090B] px-3 text-sm text-white"
                >
                  {OFFICIAL_PHOTO_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-stone-300">Album</label>
                <select
                  value={editingPhoto.albumId}
                  onChange={(e) => setEditingPhoto({...editingPhoto, albumId: e.target.value})}
                  className="mt-1 h-10 w-full rounded-md border border-white/15 bg-[#09090B] px-3 text-sm text-white"
                >
                  <option value="general">Aucun album spécifique</option>
                  {albums
                    .filter((a) => a.category === editingPhoto.category)
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.title}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-stone-300">Description</label>
                <textarea
                  rows={3}
                  value={editingPhoto.description}
                  onChange={(e) =>
                    setEditingPhoto({...editingPhoto, description: e.target.value})
                  }
                  className="mt-1 w-full rounded-md border border-white/15 bg-[#09090B] px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingPhoto(null)}
                className="h-10 rounded-md border border-white/15 px-4 text-xs text-stone-300"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveEditedPhoto}
                className="h-10 rounded-md bg-[#D4AF6A] px-5 text-xs font-semibold text-[#0B0A09]"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Modification Vidéo */}
      {editingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#121217] p-6">
            <h3 className="font-display text-2xl font-semibold text-white">Modifier la vidéo</h3>
            <div className="mt-4 space-y-4">
              <input
                type="text"
                value={editingVideo.title}
                onChange={(e) => setEditingVideo({...editingVideo, title: e.target.value})}
                className="h-10 w-full rounded-md border border-white/15 bg-[#09090B] px-3 text-sm text-white"
              />
              <select
                value={editingVideo.category}
                onChange={(e) =>
                  setEditingVideo({...editingVideo, category: e.target.value as VideoCategory})
                }
                className="h-10 w-full rounded-md border border-white/15 bg-[#09090B] px-3 text-sm text-white"
              >
                {VIDEO_ONLY_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <textarea
                rows={3}
                value={editingVideo.description}
                onChange={(e) => setEditingVideo({...editingVideo, description: e.target.value})}
                className="w-full rounded-md border border-white/15 bg-[#09090B] px-3 py-2 text-sm text-white"
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingVideo(null)}
                className="h-10 rounded-md border border-white/15 px-4 text-xs text-stone-300"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={async () => {
                  await updateVideoRecord(editingVideo.id, {
                    title: editingVideo.title,
                    category: editingVideo.category,
                    description: editingVideo.description,
                  });
                  setEditingVideo(null);
                  setFeedback({type: 'success', text: 'Vidéo mise à jour.'});
                }}
                className="h-10 rounded-md bg-[#D4AF6A] px-5 text-xs font-semibold text-[#0B0A09]"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Aperçu Photo unique */}
      {previewPhotoItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/15 bg-[#121217]">
            <img
              src={previewPhotoItem.url}
              alt={previewPhotoItem.title}
              className="max-h-[65vh] w-full object-contain bg-black"
            />
            <div className="flex items-center justify-between gap-4 p-5">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#D4AF6A]">
                  {previewPhotoItem.category}
                </p>
                <p className="font-display text-2xl font-semibold text-white">
                  {previewPhotoItem.title}
                </p>
                {previewPhotoItem.description && (
                  <p className="mt-1 text-xs text-stone-300">{previewPhotoItem.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setPreviewPhotoItem(null)}
                className="rounded-md border border-white/15 px-4 py-2 text-xs text-white"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Aperçu Vidéo */}
      {previewVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-white/15 bg-[#121217]">
            <div className="aspect-video w-full bg-black">
              {previewVideoModal.youtubeId && (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${previewVideoModal.youtubeId}?rel=0`}
                  title={previewVideoModal.title}
                  allowFullScreen
                  className="h-full w-full border-0"
                />
              )}
            </div>
            <div className="flex items-center justify-between p-5">
              <div>
                <p className="font-mono text-[10px] uppercase text-[#D4AF6A]">
                  {previewVideoModal.category}
                </p>
                <p className="font-display text-xl font-semibold text-white">
                  {previewVideoModal.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewVideoModal(null)}
                className="rounded-md border border-white/15 px-4 py-2 text-xs text-white"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
