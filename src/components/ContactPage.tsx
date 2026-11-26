import {ArrowLeft} from 'lucide-react';
import {ContactSection} from './ContactSection';

interface ContactPageProps {
  onBackHome: () => void;
  onOpenReservation: () => void;
}

export function ContactPage({onBackHome, onOpenReservation}: ContactPageProps) {
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
            Contact Direct · Studio Yeumbeul, Dakar
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

      {/* En-tête éditorial */}
      <section className="border-b border-white/10 bg-gradient-to-b from-[#131319] via-[#0E0E13] to-[#09090B] py-14 lg:py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#D4AF6A]">
            ÉCHANGEONS SUR VOTRE PROJET
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-white text-balance sm:text-6xl">
            Contacter DIONTADO PRODUCTION
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-stone-300 sm:text-base">
            Disponible sur WhatsApp, par téléphone ou par e-mail pour préparer votre séance photo, votre mariage, votre soutenance ou votre tournage vidéo.
          </p>
        </div>
      </section>

      <ContactSection onOpenReservation={onOpenReservation} />
    </main>
  );
}
