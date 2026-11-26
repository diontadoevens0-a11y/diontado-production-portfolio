import {ArrowLeft, ArrowRight, Calendar, Check} from 'lucide-react';
import type {CmsServiceDoc} from '../types/gallery';
import {ScrollReveal} from './ScrollReveal';
import {Tilt3DCard} from './Tilt3DCard';

interface ServicesPageProps {
  services: CmsServiceDoc[];
  onBackHome: () => void;
  onOpenTarifs: () => void;
  onOpenReservation: (prestation?: string) => void;
}

export function ServicesPage({
  services,
  onBackHome,
  onOpenTarifs,
  onOpenReservation,
}: ServicesPageProps) {
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
            Savoir-faire &amp; Prestations · DIONTADO PRODUCTION
          </p>

          <button
            type="button"
            onClick={onOpenTarifs}
            className="inline-flex h-10 items-center justify-center rounded-md border border-[#D4AF6A]/45 bg-[#D4AF6A]/10 px-4 text-xs font-semibold text-[#E7CA91] transition-colors hover:bg-[#D4AF6A]/20 whitespace-nowrap shrink-0"
          >
            Voir les tarifs
          </button>
        </div>
      </div>

      {/* En-tête éditorial Services */}
      <section className="border-b border-white/10 bg-gradient-to-b from-[#131319] via-[#0E0E13] to-[#09090B] py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#D4AF6A]">
              NOS SERVICES
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.04] tracking-tight text-white text-balance sm:text-6xl">
              Des prestations visuelles pensées pour durer.
            </h1>
            <p className="mt-5 text-sm leading-relaxed text-stone-300 sm:text-base">
              De la préparation du projet jusqu’à la livraison haute définition, chaque production bénéficie d’un accompagnement attentif au Studio Yeumbeul à Dakar, sur site ou à l’international.
            </p>
          </div>
        </div>
      </section>

      {/* Grille des Services */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="perspective-stage grid gap-6 md:grid-cols-2">
            {services.map((srv, idx) => (
              <ScrollReveal key={srv.id} delay={idx * 0.06} yOffset={18} duration={0.5}>
                <Tilt3DCard maxTilt={4} className="h-full rounded-2xl">
                  <article className="flex h-full flex-col justify-between rounded-2xl border border-white/12 bg-[#121217] p-7 transition-colors hover:border-[#D4AF6A]/65 sm:p-8">
                    <div>
                      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                        <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#D4AF6A]">
                          {srv.number} · Service
                        </span>
                        <span className="h-[1px] flex-1 bg-white/10" aria-hidden="true" />
                      </div>

                      <h2 className="mt-5 font-display text-3xl font-semibold text-white">
                        {srv.title}
                      </h2>
                      <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-[#E7CA91]">
                        {srv.tagline}
                      </p>
                      <p className="mt-4 text-sm leading-relaxed text-stone-300">
                        {srv.description}
                      </p>

                      {srv.deliverables && srv.deliverables.length > 0 && (
                        <ul className="mt-6 space-y-2.5 border-t border-white/10 pt-5">
                          {srv.deliverables.map((item) => (
                            <li key={item} className="flex items-start gap-2.5 text-xs text-stone-200 sm:text-sm">
                              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#D4AF6A]" aria-hidden="true" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="mt-7 flex flex-wrap gap-3 border-t border-white/10 pt-5">
                      <button
                        type="button"
                        onClick={() => onOpenReservation(srv.prestationValue)}
                        className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-[#D4AF6A] px-5 text-xs font-semibold uppercase tracking-[0.1em] text-[#0B0A09] transition-colors hover:bg-[#E7CA91]"
                      >
                        <Calendar className="h-4 w-4" aria-hidden="true" />
                        <span>Réserver cette prestation</span>
                      </button>
                      <button
                        type="button"
                        onClick={onOpenTarifs}
                        className="inline-flex h-11 items-center justify-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-4 text-xs font-semibold text-stone-200 transition-colors hover:border-[#D4AF6A] hover:text-[#E7CA91]"
                      >
                        <span>Tarifs</span>
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </article>
                </Tilt3DCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
