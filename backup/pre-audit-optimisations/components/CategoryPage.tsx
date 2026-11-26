import {ArrowLeft, ArrowRight, Camera, Maximize2, MessageCircle} from 'lucide-react';
import {PHOTO_CATEGORIES} from '../data/diontadoManifest';
import type {GalleryItem, GitHubRepoConfig, PhotoCategoryMeta} from '../types/gallery';
import {GalleryCard} from './GalleryCard';
import {ResilientImage} from './ResilientImage';
import {Tilt3DCard} from './Tilt3DCard';

interface CategoryPageProps {
  category: PhotoCategoryMeta;
  items: GalleryItem[];
  allGalleryItems: GalleryItem[];
  repoConfig: GitHubRepoConfig | null;
  onBackToRealisations: () => void;
  onOpenCategory: (slug: string) => void;
  onReserve: (prestation?: string) => void;
  onOpenLightbox: (items: GalleryItem[], index: number) => void;
  onDimensionsLoad: (id: string, width: number, height: number) => void;
}

export function CategoryPage({
  category,
  items,
  allGalleryItems,
  repoConfig,
  onBackToRealisations,
  onOpenCategory,
  onReserve,
  onOpenLightbox,
  onDimensionsLoad,
}: CategoryPageProps) {
  const coverItem =
    items[0] ||
    (category.coverFile
      ? allGalleryItems.find(
          (g) => g.fileName.toLowerCase() === category.coverFile?.toLowerCase()
        )
      : undefined);

  const otherCategories = PHOTO_CATEGORIES.filter((c) => c.slug !== category.slug);

  const categoryWhatsappUrl = `https://wa.me/221764812391?text=${encodeURIComponent(
    `Bonjour DIONTADO PRODUCTION, je souhaite obtenir des informations pour une prestation ${category.title}.`
  )}`;

  return (
    <main className="page-enter min-h-screen bg-[#09090B]">
      {/* Barre de navigation contextuelle de la page catégorie */}
      <div className="border-b border-white/10 bg-[#0E0E13]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={onBackToRealisations}
            className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-[#F5F2EB] transition-colors hover:border-[#D4AF6A] hover:text-[#E7CA91]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Retour au portfolio</span>
          </button>

          <p className="hidden font-mono text-xs uppercase tracking-[0.16em] text-stone-400 sm:block">
            Portfolio · {category.title} · {items.length}{' '}
            {items.length > 1 ? 'photographies' : 'photographie'}
          </p>

          <button
            type="button"
            onClick={() => onReserve(category.prestationValue)}
            className="inline-flex h-10 items-center justify-center rounded-md bg-[#D4AF6A] px-5 text-xs font-semibold text-[#0B0A09] transition-colors hover:bg-[#E7CA91]"
          >
            Réserver
          </button>
        </div>
      </div>

      {/* Couverture cinématographique de la catégorie */}
      <section className="relative flex min-h-[54vh] items-end overflow-hidden border-b border-white/10 py-14 lg:py-20">
        {coverItem && coverItem.url ? (
          <div className="absolute inset-0 z-0">
            <ResilientImage
              item={coverItem}
              repoConfig={repoConfig}
              loading="eager"
              className="cinema-kenburns h-full w-full object-cover"
            />
          </div>
        ) : (
          <div
            aria-hidden="true"
            className={`absolute inset-0 z-0 bg-gradient-to-br ${category.accentTone}`}
          />
        )}

        <div
          aria-hidden="true"
          className="absolute inset-0 z-[1] bg-gradient-to-t from-[#09090B] via-[#09090B]/70 to-[#09090B]/55"
        />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#D4AF6A]">
            Portfolio Photographique · {category.subtitle}
          </p>
          <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight text-white text-balance sm:text-6xl lg:text-7xl">
            {category.title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-stone-200 sm:text-base">
            {category.description}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => onReserve(category.prestationValue)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#D4AF6A] px-6 text-xs font-semibold uppercase tracking-wider text-[#0B0A09] transition-colors hover:bg-[#E7CA91]"
            >
              <span>Réserver cette prestation</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <a
              href={categoryWhatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-white/25 bg-black/50 px-5 text-xs font-semibold text-white transition-colors hover:border-[#D4AF6A] hover:text-[#E7CA91]"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              <span>Devis sur WhatsApp</span>
            </a>
            {items.length > 0 && (
              <button
                type="button"
                onClick={() => onOpenLightbox(items, 0)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-white/25 bg-black/50 px-5 text-xs font-semibold text-white transition-colors hover:border-[#D4AF6A] hover:text-[#E7CA91]"
              >
                <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Ouvrir le diaporama plein écran</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Galerie complète de la catégorie */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        {items.length > 0 ? (
          <>
            <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4 border-b border-white/10 pb-4">
              <h2 className="font-display text-3xl font-semibold text-white">
                Série complète — {category.title}
              </h2>
              <span className="font-mono text-xs text-stone-400 tabular-nums">
                {items.length} {items.length > 1 ? 'photographies haute définition' : 'photographie haute définition'} · Cliquez pour naviguer en plein écran
              </span>
            </div>

            <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
              {items.map((item, idx) => (
                <Tilt3DCard key={item.id} maxTilt={4} className="rounded-lg">
                  <GalleryCard
                    item={item}
                    repoConfig={repoConfig}
                    viewMode="masonry"
                    onSelect={() => onOpenLightbox(items, idx)}
                    onDimensionsLoad={onDimensionsLoad}
                  />
                </Tilt3DCard>
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-[#121217] p-8 text-center sm:p-14">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#D4AF6A]/40 bg-[#D4AF6A]/10 text-[#E7CA91]">
              <Camera className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2 className="mt-5 font-display text-3xl font-semibold text-white">
              Galerie {category.title} prête à recevoir vos photographies
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-stone-300">
              Aucune photographie fictive n’est affichée dans cette galerie. Déposez vos images dans votre dépôt GitHub (ex :{' '}
              <span className="font-mono text-[#E7CA91]">{category.expectedPrefixHint}</span>) pour les publier automatiquement ici.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => onReserve(category.prestationValue)}
                className="inline-flex h-11 items-center justify-center rounded-md bg-[#D4AF6A] px-6 text-xs font-semibold uppercase tracking-wider text-[#0B0A09] transition-colors hover:bg-[#E7CA91]"
              >
                Réserver une séance
              </button>
              <a
                href={categoryWhatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-white/20 px-5 text-xs font-semibold text-white transition-colors hover:border-[#D4AF6A] hover:text-[#E7CA91]"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                <span>Voir des exemples sur WhatsApp</span>
              </a>
            </div>
          </div>
        )}

        {/* Navigation rapide vers les autres catégories */}
        <div className="mt-16 border-t border-white/10 pt-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#D4AF6A]">
              Explorer d’autres univers
            </p>
              <button
                type="button"
                onClick={onBackToRealisations}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-300 hover:text-[#E7CA91]"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Tout le portfolio</span>
              </button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {otherCategories.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => onOpenCategory(cat.slug)}
                className="group flex items-center justify-between rounded-xl border border-white/10 bg-[#121217] px-5 py-4 text-left transition-colors hover:border-[#D4AF6A]/60"
              >
                <div>
                  <p className="font-display text-xl font-semibold text-white group-hover:text-[#E7CA91]">
                    {cat.title}
                  </p>
                  <p className="mt-0.5 text-xs text-stone-400">{cat.subtitle}</p>
                </div>
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-stone-500 transition-transform group-hover:translate-x-1 group-hover:text-[#E7CA91]"
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
