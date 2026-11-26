import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import {auth, db} from '../firebase';
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

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const ADMIN_EMAILS = ['amadou1966.sy@gmail.com', 'diontadoevens.0@gmail.com'];

export function isAuthorizedAdminEmail(email?: string | null, emailVerified?: boolean): boolean {
  if (!email || !emailVerified) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

export const DEFAULT_SERVICES: CmsServiceDoc[] = [
  {
    id: 'service-soutenance',
    number: '01',
    title: 'Soutenance & Remise de diplôme',
    tagline: 'Mémoires, thèses & cérémonies académiques',
    description:
      'Immortalisation discrète et élégante de votre passage devant le jury, remise d’attestation, portraits officiels en toge et photos avec vos proches sur le campus ou en studio.',
    deliverables: [
      'Couverture de la présentation et des temps forts',
      'Portraits individuels et photos de famille / promotion',
      'Retouche colorimétrique professionnelle et livraison HD',
    ],
    prestationValue: 'Soutenance & Remise de diplôme',
    published: true,
    sortOrder: 1,
    isDefault: true,
  },
  {
    id: 'service-photo-pro',
    number: '02',
    title: 'Photographie Professionnelle & Studio',
    tagline: 'Portraits, culture, corporate, mode & extérieur',
    description:
      'Séances dirigées au Studio Yeumbeul à Dakar, en extérieur ou sur site d’entreprise pour révéler votre image avec rigueur lumineuse et direction artistique soignée.',
    deliverables: [
      'Direction de pose et façonnage lumineux sur mesure',
      'Séries portrait, corporate, culturelles ou prewedding',
      'Galerie privée haute définition prête pour impression et diffusion',
    ],
    prestationValue: 'Photographie professionnelle',
    published: true,
    sortOrder: 2,
    isDefault: true,
  },
  {
    id: 'service-mariage-event',
    number: '03',
    title: 'Mariage & Événementiel',
    tagline: 'Reportages photo, albums imprimés & films d’union',
    description:
      'Accompagnement complet pour vos cérémonies traditionnelles, Henné Time, réceptions, baptêmes, conférences et galas, en photographie comme en réalisation vidéo.',
    deliverables: [
      'Forfaits numériques haute définition (40 à 100+ photos)',
      'Albums imprimés prestige (60, 80 ou 100 photos)',
      'Captation vidéo et montage cinématographique complet',
    ],
    prestationValue: 'Mariage & Cérémonie (Photo / Vidéo)',
    published: true,
    sortOrder: 3,
    isDefault: true,
  },
  {
    id: 'service-video-cinema',
    number: '04',
    title: 'Réalisation Vidéo & Films Institutionnels',
    tagline: 'Films de marque, reportages & clips artistiques',
    description:
      'Conception, tournage multi-axes, prise de son et étalonnage cinéma pour entreprises, ONG, institutions et artistes souhaitant porter un récit authentique et percutant.',
    deliverables: [
      'Repérage, écriture et direction artistique du tournage',
      'Montage rythmé, sound design et étalonnage cinéma',
      'Exports optimisés diffusion web, réseaux et grand écran',
    ],
    prestationValue: 'Film Institutionnel & Production Audiovisuelle',
    published: true,
    sortOrder: 4,
    isDefault: true,
  },
];

export interface PublicCmsSnapshot {
  photos: CmsPhotoDoc[];
  albums: CmsAlbumDoc[];
  videos: CmsVideoDoc[];
  covers: CmsCoverDoc[];
  categories: CmsCategoryDoc[];
  services: CmsServiceDoc[];
}

export interface CmsLoadProgress {
  loadedCount: number;
  totalCount: number;
  percent: number;
  currentLabel: string;
  isComplete: boolean;
}

const CMS_COLLECTION_LABELS: Record<keyof PublicCmsSnapshot, string> = {
  photos: 'Photographies',
  albums: 'Albums thématiques',
  videos: 'Vidéos & Showreel',
  covers: 'Images de couverture',
  categories: 'Catégories officielles',
  services: 'Services',
};

const TOTAL_CMS_COLLECTIONS = 6;

export function subscribePublicCmsData(
  onData: (partial: Partial<PublicCmsSnapshot>) => void,
  onWarning?: (msg: string) => void,
  onProgress?: (progress: CmsLoadProgress) => void
): () => void {
  const unsubscribers: Array<() => void> = [];
  const loadedKeys = new Set<keyof PublicCmsSnapshot>();

  const markLoaded = (key: keyof PublicCmsSnapshot) => {
    if (!loadedKeys.has(key)) {
      loadedKeys.add(key);
    }
    const loadedCount = loadedKeys.size;
    onProgress?.({
      loadedCount,
      totalCount: TOTAL_CMS_COLLECTIONS,
      percent: Math.round((loadedCount / TOTAL_CMS_COLLECTIONS) * 100),
      currentLabel:
        loadedCount === TOTAL_CMS_COLLECTIONS
          ? 'Galeries synchronisées'
          : `Chargement : ${CMS_COLLECTION_LABELS[key]}`,
      isComplete: loadedCount >= TOTAL_CMS_COLLECTIONS,
    });
  };

  onProgress?.({
    loadedCount: 0,
    totalCount: TOTAL_CMS_COLLECTIONS,
    percent: 8,
    currentLabel: 'Connexion aux galeries…',
    isComplete: false,
  });

  const qPhotos = query(collection(db, 'portfolio_photos'), where('published', '==', true));
  unsubscribers.push(
    onSnapshot(
      qPhotos,
      (snap) => {
        const photos = snap.docs.map((d) => d.data() as CmsPhotoDoc);
        onData({photos});
        markLoaded('photos');
      },
      (err) => {
        onWarning?.(err.message);
        markLoaded('photos');
      }
    )
  );

  const qAlbums = query(collection(db, 'portfolio_albums'), where('published', '==', true));
  unsubscribers.push(
    onSnapshot(
      qAlbums,
      (snap) => {
        const albums = snap.docs.map((d) => d.data() as CmsAlbumDoc);
        onData({albums});
        markLoaded('albums');
      },
      (err) => {
        onWarning?.(err.message);
        markLoaded('albums');
      }
    )
  );

  const qVideos = query(collection(db, 'portfolio_videos'), where('published', '==', true));
  unsubscribers.push(
    onSnapshot(
      qVideos,
      (snap) => {
        const videos = snap.docs.map((d) => d.data() as CmsVideoDoc);
        onData({videos});
        markLoaded('videos');
      },
      (err) => {
        onWarning?.(err.message);
        markLoaded('videos');
      }
    )
  );

  unsubscribers.push(
    onSnapshot(
      collection(db, 'site_covers'),
      (snap) => {
        const covers = snap.docs.map((d) => d.data() as CmsCoverDoc);
        onData({covers});
        markLoaded('covers');
      },
      (err) => {
        onWarning?.(err.message);
        markLoaded('covers');
      }
    )
  );

  unsubscribers.push(
    onSnapshot(
      collection(db, 'site_categories'),
      (snap) => {
        const categories = snap.docs.map((d) => d.data() as CmsCategoryDoc);
        onData({categories});
        markLoaded('categories');
      },
      (err) => {
        onWarning?.(err.message);
        markLoaded('categories');
      }
    )
  );

  const qServices = query(collection(db, 'site_services'), where('published', '==', true));
  unsubscribers.push(
    onSnapshot(
      qServices,
      (snap) => {
        const services = snap.docs.map((d) => d.data() as CmsServiceDoc);
        onData({services});
        markLoaded('services');
      },
      (err) => {
        onWarning?.(err.message);
        markLoaded('services');
      }
    )
  );

  return () => {
    unsubscribers.forEach((unsub) => unsub());
  };
}

export function subscribeAdminCmsData(
  onData: (partial: Partial<PublicCmsSnapshot>) => void,
  onError?: (err: Error) => void,
  onProgress?: (progress: CmsLoadProgress) => void
): () => void {
  const unsubscribers: Array<() => void> = [];
  const loadedKeys = new Set<keyof PublicCmsSnapshot>();

  const markLoaded = (key: keyof PublicCmsSnapshot) => {
    if (!loadedKeys.has(key)) {
      loadedKeys.add(key);
    }
    const loadedCount = loadedKeys.size;
    onProgress?.({
      loadedCount,
      totalCount: TOTAL_CMS_COLLECTIONS,
      percent: Math.round((loadedCount / TOTAL_CMS_COLLECTIONS) * 100),
      currentLabel:
        loadedCount === TOTAL_CMS_COLLECTIONS
          ? 'Toutes les galeries sont chargées'
          : `Synchronisation : ${CMS_COLLECTION_LABELS[key]}`,
      isComplete: loadedCount >= TOTAL_CMS_COLLECTIONS,
    });
  };

  onProgress?.({
    loadedCount: 0,
    totalCount: TOTAL_CMS_COLLECTIONS,
    percent: 8,
    currentLabel: 'Connexion aux collections du studio…',
    isComplete: false,
  });

  const handleErr = (key: keyof PublicCmsSnapshot, opPath: string) => (err: unknown) => {
    markLoaded(key);
    try {
      handleFirestoreError(err, OperationType.LIST, opPath);
    } catch (wrapped) {
      onError?.(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
    }
  };

  unsubscribers.push(
    onSnapshot(
      collection(db, 'portfolio_photos'),
      (snap) => {
        onData({photos: snap.docs.map((d) => d.data() as CmsPhotoDoc)});
        markLoaded('photos');
      },
      handleErr('photos', 'portfolio_photos')
    )
  );
  unsubscribers.push(
    onSnapshot(
      collection(db, 'portfolio_albums'),
      (snap) => {
        onData({albums: snap.docs.map((d) => d.data() as CmsAlbumDoc)});
        markLoaded('albums');
      },
      handleErr('albums', 'portfolio_albums')
    )
  );
  unsubscribers.push(
    onSnapshot(
      collection(db, 'portfolio_videos'),
      (snap) => {
        onData({videos: snap.docs.map((d) => d.data() as CmsVideoDoc)});
        markLoaded('videos');
      },
      handleErr('videos', 'portfolio_videos')
    )
  );
  unsubscribers.push(
    onSnapshot(
      collection(db, 'site_covers'),
      (snap) => {
        onData({covers: snap.docs.map((d) => d.data() as CmsCoverDoc)});
        markLoaded('covers');
      },
      handleErr('covers', 'site_covers')
    )
  );
  unsubscribers.push(
    onSnapshot(
      collection(db, 'site_categories'),
      (snap) => {
        onData({categories: snap.docs.map((d) => d.data() as CmsCategoryDoc)});
        markLoaded('categories');
      },
      handleErr('categories', 'site_categories')
    )
  );
  unsubscribers.push(
    onSnapshot(
      collection(db, 'site_services'),
      (snap) => {
        onData({services: snap.docs.map((d) => d.data() as CmsServiceDoc)});
        markLoaded('services');
      },
      handleErr('services', 'site_services')
    )
  );

  return () => {
    unsubscribers.forEach((unsub) => unsub());
  };
}

function makeDocId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now()}-${rand}`.replace(/[^a-zA-Z0-9_-]/g, '');
}

function requireUid(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Authentification administrateur requise.');
  return uid;
}

export async function createPhotoRecord(input: {
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
}): Promise<string> {
  const uid = requireUid();
  const id = makeDocId('photo');
  const path = `portfolio_photos/${id}`;
  try {
    await setDoc(doc(db, 'portfolio_photos', id), {
      id,
      title: input.title.trim().slice(0, 160) || 'Photographie DIONTADO PRODUCTION',
      description: input.description.trim().slice(0, 600),
      category: input.category,
      albumId: input.albumId.trim().slice(0, 128) || 'general',
      albumTitle: input.albumTitle.trim().slice(0, 120),
      url: input.url.slice(0, 2000),
      storagePath: input.storagePath.slice(0, 500),
      fileName: input.fileName.trim().slice(0, 255) || `${id}.jpg`,
      mimeType: input.mimeType.slice(0, 64),
      fileSize: Math.max(0, Math.round(input.fileSize)),
      published: Boolean(input.published),
      featured: Boolean(input.featured),
      sortOrder: Math.round(input.sortOrder),
      authorUid: uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updatePhotoRecord(
  id: string,
  updates: Partial<
    Pick<
      CmsPhotoDoc,
      'title' | 'description' | 'category' | 'albumId' | 'albumTitle' | 'published' | 'featured' | 'sortOrder'
    >
  >
): Promise<void> {
  const path = `portfolio_photos/${id}`;
  const payload: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };
  if (updates.title !== undefined) payload.title = updates.title.trim().slice(0, 160) || 'Sans titre';
  if (updates.description !== undefined) payload.description = updates.description.trim().slice(0, 600);
  if (updates.category !== undefined) payload.category = updates.category;
  if (updates.albumId !== undefined) payload.albumId = updates.albumId.trim().slice(0, 128);
  if (updates.albumTitle !== undefined) payload.albumTitle = updates.albumTitle.trim().slice(0, 120);
  if (updates.published !== undefined) payload.published = Boolean(updates.published);
  if (updates.featured !== undefined) payload.featured = Boolean(updates.featured);
  if (updates.sortOrder !== undefined) payload.sortOrder = Math.round(updates.sortOrder);

  try {
    await updateDoc(doc(db, 'portfolio_photos', id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deletePhotoRecord(id: string): Promise<void> {
  const path = `portfolio_photos/${id}`;
  try {
    await deleteDoc(doc(db, 'portfolio_photos', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function reorderPhotosBatch(
  orderedIds: Array<{id: string; sortOrder: number; featured?: boolean}>
): Promise<void> {
  try {
    const batch = writeBatch(db);
    orderedIds.forEach((entry) => {
      const patch: Record<string, unknown> = {
        sortOrder: Math.round(entry.sortOrder),
        updatedAt: serverTimestamp(),
      };
      if (entry.featured !== undefined) patch.featured = entry.featured;
      batch.update(doc(db, 'portfolio_photos', entry.id), patch);
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'portfolio_photos');
  }
}

export async function createAlbumRecord(input: {
  title: string;
  category: OfficialPhotoCategory;
  description: string;
  published: boolean;
  sortOrder: number;
}): Promise<string> {
  const uid = requireUid();
  const id = makeDocId('album');
  const path = `portfolio_albums/${id}`;
  try {
    await setDoc(doc(db, 'portfolio_albums', id), {
      id,
      title: input.title.trim().slice(0, 120),
      category: input.category,
      description: input.description.trim().slice(0, 500),
      published: Boolean(input.published),
      sortOrder: Math.round(input.sortOrder),
      authorUid: uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateAlbumRecord(
  id: string,
  updates: Partial<Pick<CmsAlbumDoc, 'title' | 'category' | 'description' | 'published' | 'sortOrder'>>
): Promise<void> {
  const path = `portfolio_albums/${id}`;
  const payload: Record<string, unknown> = {updatedAt: serverTimestamp()};
  if (updates.title !== undefined) payload.title = updates.title.trim().slice(0, 120);
  if (updates.category !== undefined) payload.category = updates.category;
  if (updates.description !== undefined) payload.description = updates.description.trim().slice(0, 500);
  if (updates.published !== undefined) payload.published = Boolean(updates.published);
  if (updates.sortOrder !== undefined) payload.sortOrder = Math.round(updates.sortOrder);

  try {
    await updateDoc(doc(db, 'portfolio_albums', id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteAlbumRecord(id: string): Promise<void> {
  const path = `portfolio_albums/${id}`;
  try {
    await deleteDoc(doc(db, 'portfolio_albums', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function createVideoRecord(input: {
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
}): Promise<string> {
  const uid = requireUid();
  const id = makeDocId('video');
  const path = `portfolio_videos/${id}`;
  try {
    await setDoc(doc(db, 'portfolio_videos', id), {
      id,
      title: input.title.trim().slice(0, 160),
      description: input.description.trim().slice(0, 600),
      category: input.category,
      sourceType: input.sourceType,
      youtubeId: input.youtubeId.trim().slice(0, 64),
      videoUrl: input.videoUrl.trim().slice(0, 2000),
      posterUrl: input.posterUrl.trim().slice(0, 2000),
      storagePath: input.storagePath.slice(0, 500),
      isShowreel: Boolean(input.isShowreel),
      published: Boolean(input.published),
      sortOrder: Math.round(input.sortOrder),
      authorUid: uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateVideoRecord(
  id: string,
  updates: Partial<
    Pick<
      CmsVideoDoc,
      | 'title'
      | 'description'
      | 'category'
      | 'sourceType'
      | 'youtubeId'
      | 'videoUrl'
      | 'posterUrl'
      | 'isShowreel'
      | 'published'
      | 'sortOrder'
    >
  >
): Promise<void> {
  const path = `portfolio_videos/${id}`;
  const payload: Record<string, unknown> = {updatedAt: serverTimestamp()};
  if (updates.title !== undefined) payload.title = updates.title.trim().slice(0, 160);
  if (updates.description !== undefined) payload.description = updates.description.trim().slice(0, 600);
  if (updates.category !== undefined) payload.category = updates.category;
  if (updates.sourceType !== undefined) payload.sourceType = updates.sourceType;
  if (updates.youtubeId !== undefined) payload.youtubeId = updates.youtubeId.trim().slice(0, 64);
  if (updates.videoUrl !== undefined) payload.videoUrl = updates.videoUrl.trim().slice(0, 2000);
  if (updates.posterUrl !== undefined) payload.posterUrl = updates.posterUrl.trim().slice(0, 2000);
  if (updates.isShowreel !== undefined) payload.isShowreel = Boolean(updates.isShowreel);
  if (updates.published !== undefined) payload.published = Boolean(updates.published);
  if (updates.sortOrder !== undefined) payload.sortOrder = Math.round(updates.sortOrder);

  try {
    await updateDoc(doc(db, 'portfolio_videos', id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteVideoRecord(id: string): Promise<void> {
  const path = `portfolio_videos/${id}`;
  try {
    await deleteDoc(doc(db, 'portfolio_videos', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveSiteCover(
  coverId: CoverSlotId,
  input: {label: string; imageUrl: string; storagePath: string; alt: string},
  existsAlready: boolean
): Promise<void> {
  const uid = requireUid();
  const path = `site_covers/${coverId}`;
  try {
    if (existsAlready) {
      await updateDoc(doc(db, 'site_covers', coverId), {
        label: input.label.trim().slice(0, 120),
        imageUrl: input.imageUrl.trim().slice(0, 2000),
        storagePath: input.storagePath.slice(0, 500),
        alt: input.alt.trim().slice(0, 250),
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(doc(db, 'site_covers', coverId), {
        id: coverId,
        label: input.label.trim().slice(0, 120),
        imageUrl: input.imageUrl.trim().slice(0, 2000),
        storagePath: input.storagePath.slice(0, 500),
        alt: input.alt.trim().slice(0, 250),
        authorUid: uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, existsAlready ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function saveSiteCategoryMeta(
  slug: 'soutenance' | 'photographie-professionnelle',
  input: {subtitle: string; description: string},
  existsAlready: boolean
): Promise<void> {
  const uid = requireUid();
  const path = `site_categories/${slug}`;
  const canonicalTitle =
    slug === 'soutenance' ? 'SOUTENANCE' : 'PHOTOGRAPHIE PROFESSIONNELLE';
  try {
    if (existsAlready) {
      await updateDoc(doc(db, 'site_categories', slug), {
        subtitle: input.subtitle.trim().slice(0, 160),
        description: input.description.trim().slice(0, 600),
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(doc(db, 'site_categories', slug), {
        slug,
        title: canonicalTitle,
        subtitle: input.subtitle.trim().slice(0, 160),
        description: input.description.trim().slice(0, 600),
        authorUid: uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, existsAlready ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function saveServiceRecord(
  input: {
    id?: string;
    number: string;
    title: string;
    tagline: string;
    description: string;
    deliverables: string[];
    prestationValue: string;
    published: boolean;
    sortOrder: number;
  },
  isUpdate: boolean
): Promise<string> {
  const uid = requireUid();
  const id = (input.id && input.id.replace(/[^a-zA-Z0-9_-]/g, '')) || makeDocId('service');
  const path = `site_services/${id}`;
  const cleanDeliverables = input.deliverables
    .map((d) => d.trim().slice(0, 200))
    .filter(Boolean)
    .slice(0, 10);

  try {
    if (isUpdate) {
      await updateDoc(doc(db, 'site_services', id), {
        number: input.number.trim().slice(0, 16) || '01',
        title: input.title.trim().slice(0, 140),
        tagline: input.tagline.trim().slice(0, 160),
        description: input.description.trim().slice(0, 800),
        deliverables: cleanDeliverables,
        prestationValue: input.prestationValue.trim().slice(0, 160) || 'Photographie professionnelle',
        published: Boolean(input.published),
        sortOrder: Math.round(input.sortOrder),
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(doc(db, 'site_services', id), {
        id,
        number: input.number.trim().slice(0, 16) || '01',
        title: input.title.trim().slice(0, 140),
        tagline: input.tagline.trim().slice(0, 160),
        description: input.description.trim().slice(0, 800),
        deliverables: cleanDeliverables,
        prestationValue: input.prestationValue.trim().slice(0, 160) || 'Photographie professionnelle',
        published: Boolean(input.published),
        sortOrder: Math.round(input.sortOrder),
        authorUid: uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    return id;
  } catch (error) {
    handleFirestoreError(error, isUpdate ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function deleteServiceRecord(id: string): Promise<void> {
  const path = `site_services/${id}`;
  try {
    await deleteDoc(doc(db, 'site_services', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function extractYouTubeId(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  try {
    const url = new URL(trimmed);
    if (url.hostname.includes('youtu.be')) {
      return url.pathname.replace('/', '').slice(0, 11);
    }
    if (url.searchParams.has('v')) {
      return (url.searchParams.get('v') || '').slice(0, 11);
    }
    const embedMatch = url.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch) return embedMatch[1];
    const shortsMatch = url.pathname.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (shortsMatch) return shortsMatch[1];
  } catch {
    // Not a full URL
  }
  return '';
}
