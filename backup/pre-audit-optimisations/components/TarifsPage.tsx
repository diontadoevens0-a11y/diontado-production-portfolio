import {ArrowLeft, ArrowRight, Camera, Check, Film, MessageCircle} from 'lucide-react';
import {DIONTADO_PRACTICAL_INFOS, DIONTADO_TARIFS} from '../data/diontadoManifest';
import type {TarifItem} from '../types/gallery';
import {Tilt3DCard} from './Tilt3DCard';

interface TarifsPageProps {
  onBackHome: () => void;
  onContact: () => void;
  onReserve: (prestation?: string, formulaId?: string) => void;
}

const WHATSAPP_DEVIS_URL =
  'https://wa.me/221764812391?text=' +
  encodeURIComponent(
    'Bonjour DIONTADO PRODUCTION, je souhaite obtenir un devis personnalisé pour une prestation.'
  );

function buildPrestationWhatsappUrl(prestationLabel: string): string {
  return (
    'https://wa.me/221764812391?text=' +
    encodeURIComponent(
      `Bonjour DIONTADO PRODUCTION, je souhaite obtenir des informations sur la prestation : ${prestationLabel}.`
    )
  );
}

function TarifCard({
  item,
  onReserve,
  className = '',
}: {
  item: TarifItem;
  onReserve: (prestation?: string, formulaId?: string) => void;
  className?: string;
}) {
  return (
    <Tilt3DCard maxTilt={5} className={`h-full rounded-2xl ${className}`}>
      <article className="flex h-full flex-col justify-between rounded-2xl border border-white/12 bg-[#121217] p-7 transition-colors hover:border-[#D4AF6A]/65">
        <div>
          <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-[#D4AF6A]">
              {item.number} · {item.category}
            </span>
            <span className="h-[1px] flex-1 bg-white/10" aria-hidden="true" />
          </div>

          <h3 className="mt-5 font-display text-3xl font-semibold tracking-tight text-white">
            {item.title}
          </h3>

          <div className="mt-4 inline-flex items-baseline gap-2.5 border-y border-[#D4AF6A]/35 py-2.5 pr-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-400">
              Tarif
            </span>
            <span className="font-display text-2xl font-semibold tracking-wide text-[#E7CA91]">
              {item.priceLabel}
            </span>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-stone-300">
            {item.description}
          </p>

          {item.tiers && item.tiers.length > 0 && (
            <ul className="mt-5 divide-y divide-white/10 border-t border-white/10">
              {item.tiers.map((tier) => (
                <li
                  key={tier.label}
                  className="flex items-baseline justify-between gap-3 py-2.5 text-xs sm:text-sm"
                >
                  <span className="text-stone-200">{tier.label}</span>
                  <span className="shrink-0 font-mono text-xs font-semibold text-[#E7CA91] tabular-nums">
                    {tier.price}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {item.note && (
            <p className="mt-4 rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs leading-relaxed text-stone-300">
              {item.note}
            </p>
          )}
        </div>

        <div className="mt-7 flex flex-wrap gap-2 border-t border-white/10 pt-5">
          <button
            type="button"
            onClick={() => onReserve(item.prestationValue, item.defaultFormulaId)}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-[#D4AF6A] px-4 text-xs font-semibold uppercase tracking-[0.1em] text-[#0B0A09] transition-colors hover:bg-[#E7CA91]"
          >
            <span>Réserver</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <a
            href={buildPrestationWhatsappUrl(item.title)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-3.5 text-xs font-semibold text-stone-200 transition-colors hover:border-[#D4AF6A] hover:text-[#E7CA91]"
          >
            <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
            <span>WhatsApp</span>
          </a>
        </div>
      </article>
    </Tilt3DCard>
  );
}

export function TarifsPage({onBackHome, onContact, onReserve}: TarifsPageProps) {
  const photoTarifs = DIONTADO_TARIFS.filter((t) => t.category === 'Photographie');
  const videoTarifs = DIONTADO_TARIFS.filter((t) => t.category === 'Réalisation vidéo');

  return (
    <main className="page-enter min-h-screen bg-[#09090B]">
      {/* Barre contextuelle supérieure */}
      <div className="border-b border-white/10 bg-[#0E0E13]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-[#F5F2EB] transition-colors hover:border-[#D4AF6A] hover:text-[#E7CA91]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Retour à l’accueil</span>
          </button>

          <p className="hidden font-mono text-xs uppercase tracking-[0.18em] text-stone-400 sm:block">
            DIONTADO PRODUCTION · Grille Tarifaire Officielle
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onReserve()}
              className="inline-flex h-10 items-center justify-center rounded-md bg-[#D4AF6A] px-4 text-xs font-semibold text-[#0B0A09] transition-colors hover:bg-[#E7CA91]"
            >
              Réserver
            </button>
            <a
              href={WHATSAPP_DEVIS_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#1F7A4C] px-4 text-xs font-semibold text-white transition-colors hover:bg-[#258D58]"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              <span>Devis WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* En-tête éditorial Tarifs */}
      <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-[#131319] via-[#0E0E13] to-[#09090B] py-16 lg:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,106,0.14),transparent_58%)]"
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D4AF6A]">
              TARIFS &amp; PRESTATIONS
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.04] tracking-tight text-white text-balance sm:text-6xl">
              Grille tarifaire claire &amp; productions sur mesure.
            </h1>
            <p className="mt-5 text-sm leading-relaxed text-stone-300 sm:text-base">
              Retrouvez nos forfaits officiels pour les séances studio, extérieur, domicile, les reportages numériques, les albums imprimés et la réalisation vidéo. Pour toute commande spécifique, un devis personnalisé vous est établi sous 24h.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#tarifs-photo"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('tarifs-photo')?.scrollIntoView({behavior: 'smooth'});
                }}
                className="inline-flex h-10 items-center gap-2 rounded-md border border-[#D4AF6A]/45 bg-[#D4AF6A]/10 px-4 text-xs font-semibold text-[#E7CA91] transition-colors hover:bg-[#D4AF6A]/20"
              >
                <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Photographie ({photoTarifs.length})</span>
              </a>
              <a
                href="#tarifs-video"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('tarifs-video')?.scrollIntoView({behavior: 'smooth'});
                }}
                className="inline-flex h-10 items-center gap-2 rounded-md border border-white/20 bg-white/5 px-4 text-xs font-semibold text-white transition-colors hover:border-[#D4AF6A] hover:text-[#E7CA91]"
              >
                <Film className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Réalisation Vidéo ({videoTarifs.length})</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Catégorie 1 : PHOTOGRAPHIE */}
      <section id="tarifs-photo" className="border-b border-white/10 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#D4AF6A]">
                01 · Pôle Image Fixe
              </p>
              <h2 className="mt-2 font-display text-4xl font-semibold text-white">
                PHOTOGRAPHIE
              </h2>
            </div>
            <p className="max-w-md text-xs leading-relaxed text-stone-400 sm:text-sm">
              Séances portrait (studio, extérieur, domicile), reportages numériques, albums photo et couverture complète d’événements.
            </p>
          </div>

          <div className="perspective-stage mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {photoTarifs.map((offer) => (
              <TarifCard key={offer.id} item={offer} onReserve={onReserve} />
            ))}
          </div>
        </div>
      </section>

      {/* Catégorie 2 : RÉALISATION VIDÉO */}
      <section id="tarifs-video" className="border-b border-white/10 bg-[#0C0C10] py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#D4AF6A]">
                02 · Pôle Cinéma &amp; Audiovisuel
              </p>
              <h2 className="mt-2 font-display text-4xl font-semibold text-white">
                RÉALISATION VIDÉO
              </h2>
            </div>
            <p className="max-w-md text-xs leading-relaxed text-stone-400 sm:text-sm">
              Films de mariage (Henné Time, Réception), baptêmes, reportages documentaires et films institutionnels — tournage et montage inclus.
            </p>
          </div>

          <div className="perspective-stage mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-6">
            {videoTarifs.map((offer, idx) => (
              <TarifCard
                key={offer.id}
                item={offer}
                onReserve={onReserve}
                className={idx < 3 ? 'lg:col-span-2' : 'lg:col-span-3'}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Modalités pratiques */}
      <section className="border-b border-white/10 bg-[#09090B] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#D4AF6A]">
            Informations pratiques
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {DIONTADO_PRACTICAL_INFOS.map((info) => (
              <div
                key={info}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#121217] px-5 py-4"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#D4AF6A]/45 bg-[#D4AF6A]/10 text-[#E7CA91]">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <span className="text-sm font-medium text-stone-200">{info}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bannière WhatsApp Demande de Devis */}
      <section className="py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-[#D4AF6A]/35 bg-gradient-to-r from-[#15141A] via-[#121217] to-[#171411] p-8 md:flex-row md:items-center lg:p-10">
            <div className="max-w-2xl">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#D4AF6A]">
                Devis personnalisé sous 24h
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-white sm:text-4xl">
                Besoin d’une estimation précise pour votre projet ?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-stone-300">
                Décrivez votre lieu, la formule souhaitée et vos attentes sur WhatsApp (+221 76 481 23 91) pour échanger directement avec notre équipe.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onReserve()}
                className="inline-flex h-12 items-center justify-center rounded-md bg-[#D4AF6A] px-6 text-xs font-semibold uppercase tracking-wider text-[#0B0A09] transition-colors hover:bg-[#E7CA91]"
              >
                Réserver une date
              </button>
              <a
                href={WHATSAPP_DEVIS_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#1F7A4C] px-6 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#258D58]"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                <span>Devis WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={onContact}
                className="inline-flex h-12 items-center justify-center rounded-md border border-white/25 px-5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:border-[#D4AF6A] hover:text-[#E7CA91]"
              >
                Nous contacter
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
