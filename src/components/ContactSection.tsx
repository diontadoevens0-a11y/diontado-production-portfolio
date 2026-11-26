import {Calendar, Mail, MapPin, Phone} from 'lucide-react';

interface ContactSectionProps {
  onOpenReservation?: () => void;
}

export function ContactSection({onOpenReservation}: ContactSectionProps) {
  return (
    <section
      id="contact"
      className="border-t border-white/10 bg-[#09090B] py-20 lg:py-24"
    >
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-7 rounded-2xl border border-white/10 bg-[#121217] p-7 lg:p-8">
          <div>
            <p className="font-display text-2xl font-semibold tracking-wide text-white">
              DIONTADO PRODUCTION
            </p>

            <ul className="mt-6 space-y-5 border-t border-white/10 pt-6">
              <li>
                <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-stone-400">
                  WhatsApp et téléphone
                </span>
                <a
                  href="tel:+221764812391"
                  className="mt-1 inline-flex items-center gap-2 font-mono text-base font-medium text-[#F5F2EB] transition-colors hover:text-[#E7CA91]"
                >
                  <Phone className="h-4 w-4 text-[#D4AF6A]" aria-hidden="true" />
                  <span>+221 76 481 23 91</span>
                </a>
              </li>

              <li>
                <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-stone-400">
                  Email
                </span>
                <a
                  href="mailto:diontadoevens.0@gmail.com"
                  className="mt-1 inline-flex items-center gap-2 text-base font-medium text-[#F5F2EB] transition-colors hover:text-[#E7CA91]"
                >
                  <Mail className="h-4 w-4 text-[#D4AF6A]" aria-hidden="true" />
                  <span>diontadoevens.0@gmail.com</span>
                </a>
              </li>

              <li>
                <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-stone-400">
                  Adresse
                </span>
                <span className="mt-1 inline-flex items-center gap-2 text-base font-medium text-[#F5F2EB]">
                  <MapPin className="h-4 w-4 text-[#D4AF6A]" aria-hidden="true" />
                  <span>Studio Yeumbeul, Dakar — Sénégal</span>
                </span>
              </li>

              <li>
                <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-stone-400">
                  Zone d&apos;intervention
                </span>
                <span className="mt-1 block text-base font-medium text-[#F5F2EB]">
                  Sénégal et international
                </span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {onOpenReservation ? (
              <button
                type="button"
                onClick={onOpenReservation}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#D4AF6A] px-5 text-xs font-semibold text-[#0B0A09] transition-colors hover:bg-[#E7CA91]"
              >
                <Calendar className="h-4 w-4" aria-hidden="true" />
                <span>Réserver une prestation</span>
              </button>
            ) : (
              <a
                href="#/reservation"
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#D4AF6A] px-5 text-xs font-semibold text-[#0B0A09] transition-colors hover:bg-[#E7CA91]"
              >
                <Calendar className="h-4 w-4" aria-hidden="true" />
                <span>Réserver une prestation</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
