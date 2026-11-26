import {Check, Mail, MessageCircle} from 'lucide-react';
import {type FormEvent, useEffect, useState} from 'react';
import type {BrandAssets, GitHubRepoConfig} from '../types/gallery';
import {ResilientImage} from './ResilientImage';

interface ContactSectionProps {
  brandAssets: BrandAssets;
  repoConfig: GitHubRepoConfig | null;
  selectedPrestation?: string;
}

const PRESTATION_OPTIONS = [
  'Photographie professionnelle',
  'Photographie — Portrait & Studio',
  'Mariage & Cérémonie (Photo / Vidéo)',
  'Événementiel (Photo & Vidéo)',
  'Réalisation vidéo',
  'Film Institutionnel & Production Audiovisuelle',
];

export function ContactSection({
  brandAssets,
  repoConfig,
  selectedPrestation,
}: ContactSectionProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [projectType, setProjectType] = useState(PRESTATION_OPTIONS[0]);
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [message, setMessage] = useState('');
  const [feedbackChannel, setFeedbackChannel] = useState<'whatsapp' | 'email' | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedPrestation) {
      setProjectType(selectedPrestation);
    }
  }, [selectedPrestation]);

  const contactLogo = brandAssets.logoContactDark || brandAssets.logoContactLight;

  const validateRequired = (): boolean => {
    if (!name.trim() || !phone.trim() || !message.trim()) {
      setValidationError(
        'Merci de renseigner votre nom, votre numéro de téléphone et une courte description de votre projet.'
      );
      return false;
    }
    setValidationError(null);
    return true;
  };

  const buildFormattedSummary = () => {
    const lines = [
      `Bonjour DIONTADO PRODUCTION,`,
      `Je souhaite demander un devis / réserver une prestation :`,
      ``,
      `• Nom : ${name.trim()}`,
      `• Téléphone : ${phone.trim()}`,
      `• Prestation : ${projectType}`,
      `• Date souhaitée : ${eventDate || 'À préciser'}`,
      `• Lieu : ${location.trim() || 'À préciser'}`,
      ``,
      `Description du projet :`,
      message.trim(),
    ];
    return lines.join('\n');
  };

  const handleSubmitWhatsApp = (event: FormEvent) => {
    event.preventDefault();
    if (!validateRequired()) return;
    const text = encodeURIComponent(buildFormattedSummary());
    const waUrl = `https://wa.me/221764812391?text=${text}`;
    window.location.assign(waUrl);
    setFeedbackChannel('whatsapp');
  };

  const handleSendEmail = () => {
    if (!validateRequired()) return;
    const subject = encodeURIComponent(
      `[DIONTADO PRODUCTION] Devis : ${projectType} — ${name.trim()}`
    );
    const body = encodeURIComponent(buildFormattedSummary());
    window.location.href = `mailto:diontadoevens.0@gmail.com?subject=${subject}&body=${body}`;
    setFeedbackChannel('email');
  };

  return (
    <section id="contact" className="border-t border-white/10 bg-[#070708] py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-8 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A46B]">
              Contact &amp; Réservation
            </p>
            <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight text-white text-balance sm:text-5xl">
              Parlons de votre projet
            </h2>
          </div>
          <p className="max-w-md text-sm text-stone-400">
            Demandez un devis personnalisé ou réservez une date directement via WhatsApp ou email.
          </p>
        </div>

        <div className="mt-10 grid items-stretch gap-8 lg:grid-cols-12">
          {/* Colonne gauche : Identité & Coordonnées directes */}
          <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-[#111114] p-8 lg:col-span-5">
            <div>
              {contactLogo && contactLogo.url ? (
                <div className="mb-8 h-24 max-w-[200px] overflow-hidden">
                  <ResilientImage
                    item={contactLogo}
                    repoConfig={repoConfig}
                    alt="DIONTADO PRODUCTION"
                    className="h-24 w-auto object-contain"
                  />
                </div>
              ) : (
                <div className="mb-8">
                  <span className="font-display text-2xl font-semibold tracking-wider text-white">
                    DIONTADO PRODUCTION
                  </span>
                </div>
              )}

              <dl className="space-y-5 border-t border-white/10 pt-6 text-sm">
                <div>
                  <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-stone-400">
                    Téléphone &amp; WhatsApp
                  </dt>
                  <dd className="mt-1">
                    <a
                      href="tel:+221764812391"
                      className="font-mono text-base font-medium text-[#F5F3EE] tabular-nums hover:text-[#DFBE89]"
                    >
                      +221 76 481 23 91
                    </a>
                  </dd>
                </div>

                <div>
                  <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-stone-400">
                    Adresse email
                  </dt>
                  <dd className="mt-1">
                    <a
                      href="mailto:diontadoevens.0@gmail.com"
                      className="text-base font-medium text-[#F5F3EE] hover:text-[#DFBE89]"
                    >
                      diontadoevens.0@gmail.com
                    </a>
                  </dd>
                </div>

                <div>
                  <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-stone-400">
                    Réseaux sociaux
                  </dt>
                  <dd className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-base font-medium text-[#F5F3EE]">
                    <a
                      href="https://www.instagram.com/diontado_photography"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-[#DFBE89]"
                    >
                      Instagram (@diontado_photography)
                    </a>
                    <span aria-hidden="true" className="text-stone-600">·</span>
                    <a
                      href="https://www.youtube.com/watch?v=VDhh9Q0c_MI"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-[#DFBE89]"
                    >
                      YouTube
                    </a>
                  </dd>
                </div>

                <div>
                  <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-stone-400">
                    Localisation
                  </dt>
                  <dd className="mt-1 text-base font-medium text-[#F5F3EE]">
                    Yeumbeul, Dakar, Sénégal — Interventions nationales &amp; internationales
                  </dd>
                </div>
              </dl>
            </div>

            <a
              href="https://wa.me/221764812391?text=Bonjour%20DIONTADO%20PRODUCTION%2C%20je%20souhaite%20r%C3%A9server%20une%20prestation."
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#1F7A4C] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#258D58] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A46B]"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              <span>Discuter sur WhatsApp</span>
            </a>
          </div>

          {/* Colonne droite : Formulaire complet de demande de devis (6 champs requis) */}
          <div className="rounded-xl border border-white/10 bg-[#111114] p-8 lg:col-span-7">
            <div className="mb-6 border-b border-white/10 pb-4">
              <h3 className="font-display text-2xl font-semibold text-white">
                Demande de devis &amp; réservation
              </h3>
              <p className="mt-1 text-xs text-stone-400">
                Remplissez les détails ci-dessous pour préparer et transmettre votre demande immédiatement.
              </p>
            </div>

            <form onSubmit={handleSubmitWhatsApp} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-xs font-medium text-[#E6DCCB]"
                  >
                    Nom complet *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex : Moussa Diop"
                    className="mt-1.5 h-11 w-full rounded-lg border border-white/15 bg-[#070708] px-3.5 text-sm text-white placeholder:text-stone-500 focus:border-[#C8A46B] focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-phone"
                    className="block text-xs font-medium text-[#E6DCCB]"
                  >
                    Numéro de téléphone *
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+221 77 000 00 00"
                    className="mt-1.5 h-11 w-full rounded-lg border border-white/15 bg-[#070708] px-3.5 text-sm text-white placeholder:text-stone-500 focus:border-[#C8A46B] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                <div className="sm:col-span-1">
                  <label
                    htmlFor="contact-type"
                    className="block text-xs font-medium text-[#E6DCCB]"
                  >
                    Type de prestation
                  </label>
                  <select
                    id="contact-type"
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-lg border border-white/15 bg-[#070708] px-3 text-sm text-white focus:border-[#C8A46B] focus:outline-none"
                  >
                    {PRESTATION_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="contact-date"
                    className="block text-xs font-medium text-[#E6DCCB]"
                  >
                    Date de l’événement
                  </label>
                  <input
                    id="contact-date"
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-lg border border-white/15 bg-[#070708] px-3.5 text-sm text-white focus:border-[#C8A46B] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-location"
                    className="block text-xs font-medium text-[#E6DCCB]"
                  >
                    Lieu
                  </label>
                  <input
                    id="contact-location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Dakar, Saly, Saint-Louis..."
                    className="mt-1.5 h-11 w-full rounded-lg border border-white/15 bg-[#070708] px-3.5 text-sm text-white placeholder:text-stone-500 focus:border-[#C8A46B] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-xs font-medium text-[#E6DCCB]"
                >
                  Description du projet *
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Précisez vos attentes, horaires, nombre de personnes ou livrables souhaités..."
                  className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#070708] p-3.5 text-sm text-white placeholder:text-stone-500 focus:border-[#C8A46B] focus:outline-none"
                />
              </div>

              {validationError && (
                <p
                  role="alert"
                  className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-200"
                >
                  {validationError}
                </p>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#1F7A4C] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#258D58] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A46B]"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  <span>Envoyer via WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendEmail}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#C8A46B]/60 bg-transparent px-5 text-sm font-semibold text-[#DFBE89] transition-colors hover:bg-[#C8A46B] hover:text-[#0B0A09] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A46B]"
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  <span>Préparer par Email</span>
                </button>
              </div>

              <p className="text-[11px] leading-relaxed text-stone-400">
                Transmission directe sans intermédiaire : WhatsApp ouvre votre message pré-rempli vers le <span className="font-mono text-stone-300">+221 76 481 23 91</span> et l’option Email prépare un brouillon dans votre messagerie vers <span className="text-stone-300">diontadoevens.0@gmail.com</span>.
              </p>

              {feedbackChannel && (
                <div
                  role="status"
                  className="flex items-start gap-3 rounded-lg border border-[#C8A46B]/40 bg-[#C8A46B]/10 p-4 text-xs text-[#E6DCCB]"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#DFBE89]" aria-hidden="true" />
                  <span>
                    {feedbackChannel === 'whatsapp'
                      ? 'Votre demande de devis a été préparée dans WhatsApp. Il ne reste plus qu’à appuyer sur Envoyer dans la conversation.'
                      : 'Votre brouillon d’email a été préparé pour diontadoevens.0@gmail.com. Si votre application mail ne s’est pas ouverte, utilisez le bouton WhatsApp ci-dessus.'}
                  </span>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
