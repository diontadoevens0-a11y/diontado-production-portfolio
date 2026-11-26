import {ArrowLeft, Film, Play} from 'lucide-react';
import {useEffect, useMemo, useRef, useState} from 'react';
import {VIDEO_CATEGORIES} from '../data/diontadoManifest';
import type {GalleryItem, VideoPortfolioItem} from '../types/gallery';
import {Tilt3DCard} from './Tilt3DCard';

interface VideosPageProps {
  videos: VideoPortfolioItem[];
  fallbackCover: GalleryItem;
  onBackHome: () => void;
  onOpenReservation: (prestation?: string) => void;
}

export function VideosPage({
  videos,
  fallbackCover,
  onBackHome,
  onOpenReservation,
}: VideosPageProps) {
  const [selectedVideoCategory, setSelectedVideoCategory] = useState<string>('Toutes');
  const [activeVideoIdx, setActiveVideoIdx] = useState(0);
  const [isVideoStarted, setIsVideoStarted] = useState(false);
  const videoStageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeVideoIdx >= videos.length) {
      setActiveVideoIdx(0);
    }
  }, [activeVideoIdx, videos.length]);

  const filteredVideos = useMemo(() => {
    if (selectedVideoCategory === 'Toutes') return videos;
    return videos.filter((v) => v.category === selectedVideoCategory);
  }, [selectedVideoCategory, videos]);

  const activeVideo = videos[activeVideoIdx] || videos[0];

  const handlePlayVideoById = (videoId: string) => {
    const idx = videos.findIndex((v) => v.id === videoId);
    if (idx >= 0) {
      setActiveVideoIdx(idx);
      setIsVideoStarted(true);
      videoStageRef.current?.scrollIntoView({behavior: 'smooth', block: 'center'});
    }
  };

  return (
    <main id="mainContent" tabIndex={-1} className="page-enter min-h-screen bg-[#09090B] focus:outline-none">
      {/* Barre contextuelle */}
      <div className="border-b border-white/10 bg-[#0E0E13]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-[#F5F2EB] transition-colors hover:border-[#D4AF6A] hover:text-[#E7CA91] whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Retour à l’accueil</span>
          </button>

          <p className="hidden font-mono text-xs uppercase tracking-[0.18em] text-stone-400 sm:block">
            Portfolio Vidéo · {videos.length} {videos.length > 1 ? 'productions' : 'production'}
          </p>

          <button
            type="button"
            onClick={() => onOpenReservation('Réalisation vidéo')}
            className="inline-flex h-10 items-center justify-center rounded-md bg-[#D4AF6A] px-5 text-xs font-semibold text-[#0B0A09] transition-colors hover:bg-[#E7CA91] whitespace-nowrap shrink-0"
          >
            Réserver un tournage
          </button>
        </div>
      </div>

      {/* En-tête & Lecteur Cinéma */}
      <section className="bg-gradient-to-b from-[#111116] to-[#09090B] py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col justify-between gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#D4AF6A]">
                CINÉMA &amp; RÉALISATION VIDÉO
              </p>
              <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-white text-balance sm:text-5xl lg:text-6xl">
                Films &amp; Showreel
              </h1>
            </div>
            <p className="max-w-lg text-xs leading-relaxed text-stone-300 sm:text-sm">
              Films institutionnels, reportages culturels, mariages, événements et créations artistiques réalisés au Sénégal et à l’international.
            </p>
          </div>

          {activeVideo && (
            <div
              ref={videoStageRef}
              className="overflow-hidden rounded-2xl border border-white/12 bg-[#09090B] shadow-2xl"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-black">
                {isVideoStarted ? (
                  activeVideo.sourceType === 'mp4' && activeVideo.videoSrc ? (
                    <video
                      key={activeVideo.id}
                      src={activeVideo.videoSrc}
                      poster={activeVideo.posterUrl}
                      controls
                      playsInline
                      autoPlay
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <iframe
                      key={activeVideo.youtubeId}
                      src={`https://www.youtube-nocookie.com/embed/${activeVideo.youtubeId}?rel=0&autoplay=1&playsinline=1`}
                      title={activeVideo.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full border-0"
                    />
                  )
                ) : (
                  <>
                    <img
                      src={
                        activeVideo.posterUrl ||
                        fallbackCover.url ||
                        (activeVideo.youtubeId
                          ? `https://i.ytimg.com/vi/${activeVideo.youtubeId}/hqdefault.jpg`
                          : '')
                      }
                      alt={activeVideo.title}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/45 to-[#09090B]/40"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                      <button
                        type="button"
                        onClick={() => setIsVideoStarted(true)}
                        aria-label={`Lire ${activeVideo.title}`}
                        className="group flex h-20 w-20 items-center justify-center rounded-full border border-[#E7CA91]/60 bg-[#D4AF6A] text-[#0B0A09] shadow-xl transition-transform duration-300 hover:scale-110 hover:bg-[#E7CA91]"
                      >
                        <Play className="ml-1 h-8 w-8 fill-current" aria-hidden="true" />
                      </button>
                      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#E7CA91]">
                        {activeVideo.isShowreel ? 'SHOWREEL OFFICIEL' : activeVideo.category}
                      </p>
                      <h2 className="mt-2 max-w-2xl font-display text-3xl font-semibold text-white sm:text-4xl">
                        {activeVideo.title}
                      </h2>
                      <p className="mt-2 max-w-xl text-xs text-stone-200 sm:text-sm">
                        {activeVideo.desc}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {isVideoStarted && (
                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 bg-[#121217] px-6 py-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#D4AF6A]">
                      {activeVideo.category}
                    </p>
                    <h2 className="font-display text-2xl font-semibold text-white">
                      {activeVideo.title}
                    </h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <p className="max-w-lg text-xs text-stone-400">{activeVideo.desc}</p>
                    {activeVideoIdx !== 0 && (
                      <button
                        type="button"
                        onClick={() => setActiveVideoIdx(0)}
                        className="inline-flex h-9 items-center rounded-md border border-[#D4AF6A]/45 px-3 text-xs font-semibold text-[#E7CA91] transition-colors hover:bg-[#D4AF6A]/15"
                      >
                        Revenir au Showreel
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Filtres catégories vidéo */}
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div role="tablist" aria-label="Catégories vidéo" className="flex flex-wrap gap-2">
              {VIDEO_CATEGORIES.map((cat) => {
                const isActive = selectedVideoCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setSelectedVideoCategory(cat)}
                    className={`rounded-md border px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                      isActive
                        ? 'border-[#D4AF6A] bg-[#D4AF6A] font-semibold text-[#0B0A09]'
                        : 'border-white/15 bg-[#121217] text-stone-300 hover:border-[#D4AF6A]/60 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
            <span className="font-mono text-xs text-stone-400 tabular-nums">
              {filteredVideos.length} {filteredVideos.length > 1 ? 'films' : 'film'}
            </span>
          </div>

          {filteredVideos.length > 0 ? (
            <div className="perspective-stage mt-8 grid gap-6 md:grid-cols-3">
              {filteredVideos.map((vid) => {
                const isPlayingCurrent = isVideoStarted && activeVideo?.id === vid.id;
                const thumbUrl =
                  vid.posterUrl ||
                  (vid.youtubeId ? `https://i.ytimg.com/vi/${vid.youtubeId}/hqdefault.jpg` : fallbackCover.url);
                return (
                  <Tilt3DCard key={vid.id} maxTilt={5} className="rounded-xl">
                    <button
                      type="button"
                      onClick={() => handlePlayVideoById(vid.id)}
                      className={`group flex h-full w-full flex-col overflow-hidden rounded-xl border text-left transition-colors ${
                        isPlayingCurrent
                          ? 'border-[#D4AF6A] bg-[#D4AF6A]/10'
                          : 'border-white/10 bg-[#121217] hover:border-[#D4AF6A]/60'
                      }`}
                    >
                      <div className="relative aspect-video w-full overflow-hidden bg-black">
                        {thumbUrl ? (
                          <img
                            src={thumbUrl}
                            alt={vid.title}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[#14141A]">
                            <Film className="h-8 w-8 text-[#D4AF6A]/60" aria-hidden="true" />
                          </div>
                        )}
                        <span className="absolute inset-0 flex items-center justify-center bg-black/35 transition-colors group-hover:bg-black/20">
                          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D4AF6A] text-[#0B0A09] transition-transform group-hover:scale-110">
                            <Play className="ml-0.5 h-5 w-5 fill-current" aria-hidden="true" />
                          </span>
                        </span>
                      </div>

                      <div className="flex flex-1 flex-col p-5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#D4AF6A]">
                          {vid.category}
                        </p>
                        <h3 className="mt-1.5 font-display text-2xl font-semibold leading-snug text-white group-hover:text-[#E7CA91]">
                          {vid.title}
                        </h3>
                        <p className="mt-2 text-xs leading-relaxed text-stone-400">
                          {vid.desc}
                        </p>
                      </div>
                    </button>
                  </Tilt3DCard>
                );
              })}
            </div>
          ) : (
            <div className="mt-8 rounded-xl border border-white/10 bg-[#121217] p-8 text-center">
              <Film className="mx-auto h-6 w-6 text-[#D4AF6A]" aria-hidden="true" />
              <p className="mt-3 font-display text-2xl font-semibold text-white">
                Réalisations {selectedVideoCategory} — Extraits privés sur demande
              </p>
              <p className="mx-auto mt-2 max-w-lg text-xs leading-relaxed text-stone-400 sm:text-sm">
                Certaines productions {selectedVideoCategory.toLowerCase()} restent confidentielles à la demande des familles ou partenaires. Découvrez notre showreel ci-dessus ou demandez des références adaptées sur WhatsApp.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedVideoCategory('Toutes');
                    setActiveVideoIdx(0);
                    setIsVideoStarted(true);
                    videoStageRef.current?.scrollIntoView({behavior: 'smooth', block: 'center'});
                  }}
                  className="inline-flex h-10 items-center rounded-md border border-white/15 px-4 text-xs font-semibold text-white transition-colors hover:border-[#D4AF6A] hover:text-[#E7CA91]"
                >
                  Voir le Showreel officiel
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onOpenReservation(
                      selectedVideoCategory === 'Mariage'
                        ? 'Mariage & Cérémonie (Photo / Vidéo)'
                        : selectedVideoCategory === 'Événementiel'
                          ? 'Événementiel (Photo & Vidéo)'
                          : 'Réalisation vidéo'
                    )
                  }
                  className="inline-flex h-10 items-center rounded-md bg-[#D4AF6A] px-4 text-xs font-semibold text-[#0B0A09] transition-colors hover:bg-[#E7CA91]"
                >
                  Réserver une captation vidéo
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
