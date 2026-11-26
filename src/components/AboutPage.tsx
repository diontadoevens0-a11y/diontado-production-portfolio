import {ArrowLeft, ArrowRight, Calendar} from 'lucide-react';
import {Tilt3DCard} from './Tilt3DCard';

interface AboutPageProps {
  portraitUrl?: string;
  onBackHome: () => void;
  onOpenPortfolio: () => void;
  onOpenReservation: () => void;
}

export function AboutPage({
  portraitUrl,
  onBackHome,
  onOpenPortfolio,
  onOpenReservation,
}: AboutPageProps) {
  const finalPortrait = portraitUrl || '/assets/aistudio/1C1A6618_copie_af7a2459.jpg';

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
            ÉDITO &amp; PORTRAIT · DIONTADO PRODUCTION
          </p>

          <button
            type="button"
            onClick={onOpenReservation}
            className="inline-flex h-10 items-center justify-center rounded-md bg-[#D4AF6A] px-5 text-xs font-semibold text-[#0B0A09] transition-colors hover:bg-[#E7CA91] whitespace-nowrap shrink-0"
          >
            Réserver
          </button>
        </div>
      </div>

      {/* Mise en page magazine éditoriale */}
      <section className="py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-y border-white/15 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-stone-400">
            <span className="text-[#D4AF6A]">ÉDITO &amp; PORTRAIT · À PROPOS</span>
            <span>DIONTADO PRODUCTION · DAKAR, SÉNÉGAL · JUIN 2022</span>
          </div>

          <div className="mt-10 grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="mx-auto w-full max-w-[240px] sm:max-w-[270px] lg:col-span-3 lg:mx-0 lg:max-w-none">
              <Tilt3DCard maxTilt={4} className="rounded-lg">
                <figure className="overflow-hidden rounded-lg border border-white/15 bg-[#111116]">
                  <div className="aspect-[3/4] w-full overflow-hidden bg-[#181615]">
                    <img
                      src={finalPortrait}
                      alt="Amadou Sy — Fondateur & Directeur Créatif de DIONTADO PRODUCTION"
                      loading="eager"
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover object-top"
                    />
                  </div>
                  <figcaption className="border-t border-white/10 px-4 py-3">
                    <p className="font-display text-lg font-semibold leading-tight text-white">
                      Amadou Sy
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[#D4AF6A]">
                      Fondateur &amp; Directeur Créatif
                    </p>
                  </figcaption>
                </figure>
              </Tilt3DCard>
            </div>

            <div className="lg:col-span-9 lg:border-l lg:border-white/10 lg:pl-10">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#D4AF6A]">
                La Maison de Production
              </p>
              <h1 className="mt-2 font-display text-3xl font-semibold leading-[1.06] tracking-tight text-white text-balance sm:text-4xl lg:text-5xl">
                L’art de raconter des histoires par la lumière et le cinéma.
              </h1>
              <div className="mt-5 h-[1px] w-16 bg-[#D4AF6A]" aria-hidden="true" />

              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:gap-8">
                <div>
                  <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#E7CA91]">
                    Biographie &amp; Genèse
                  </h2>
                  <p className="mt-2.5 text-sm leading-relaxed text-stone-300">
                    Créée en juin 2022 à Dakar par <strong className="font-semibold text-white">Amadou Sy</strong>,{' '}
                    <strong className="font-semibold text-white">DIONTADO PRODUCTION</strong> est née d’une passion exigeante pour l’image et la narration audiovisuelle. Basée au Sénégal, la maison accompagne particuliers, artistes et entreprises dans leurs créations visuelles.
                  </p>
                </div>

                <div>
                  <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#E7CA91]">
                    Vision Artistique
                  </h2>
                  <p className="mt-2.5 text-sm leading-relaxed text-stone-300">
                    Notre regard unit rigueur technique et sensibilité humaine. Avant de cadrer, nous prenons le temps de comprendre chaque personnalité et chaque projet afin de sculpter des œuvres fidèles, soignées et intemporelles.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-white/15 pt-8">
            <div className="grid gap-6 md:grid-cols-3 md:gap-0 md:divide-x md:divide-white/10">
              <div className="md:pr-7">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#D4AF6A]">
                  01 · Domaines d’expertise
                </p>
                <h2 className="mt-1.5 font-display text-xl font-semibold text-white">
                  Photographie &amp; Cinéma
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-stone-400 sm:text-sm">
                  Portraits, mariages, prewedding, culture, mode, soutenances, studio et films institutionnels ou événementiels menés de la conception au montage final.
                </p>
              </div>

              <div className="md:px-7">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#D4AF6A]">
                  02 · Philosophie de création
                </p>
                <h2 className="mt-1.5 font-display text-xl font-semibold text-white">
                  Écouter, imaginer, créer, raconter
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-stone-400 sm:text-sm">
                  Une direction artistique cohérente et une attention constante portée aux émotions réelles, à la lumière juste et au sens du détail.
                </p>
              </div>

              <div className="md:pl-7">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#D4AF6A]">
                  03 · Ambitions
                </p>
                <h2 className="mt-1.5 font-display text-xl font-semibold text-white">
                  Une signature durable
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-stone-400 sm:text-sm">
                  Faire de chaque image une histoire, de chaque projet une expérience singulière et affirmer DIONTADO PRODUCTION au Sénégal comme à l’international.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
            <p className="font-display text-base italic text-[#E7CA91]/90">
              « L’image raconte. Le cinéma fait ressentir. »
            </p>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#D4AF6A]">
              AMADOU SY — FONDATEUR &amp; DIRECTEUR CRÉATIF.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onOpenPortfolio}
              className="inline-flex h-11 items-center gap-2 rounded-md border border-white/20 bg-white/5 px-5 text-xs font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:border-[#D4AF6A] hover:text-[#E7CA91]"
            >
              <span>Découvrir le portfolio</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onOpenReservation}
              className="inline-flex h-11 items-center gap-2 rounded-md bg-[#D4AF6A] px-5 text-xs font-semibold uppercase tracking-[0.1em] text-[#0B0A09] transition-colors hover:bg-[#E7CA91]"
            >
              <Calendar className="h-4 w-4" aria-hidden="true" />
              <span>Réserver une prestation</span>
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
