import {Check, Send} from 'lucide-react';
import {FormEvent, useState} from 'react';
import type {BrandAssets, GitHubRepoConfig} from '../types/gallery';
import {ResilientImage} from './ResilientImage';

interface ContactSectionProps {
  brandAssets: BrandAssets;
  repoConfig: GitHubRepoConfig | null;
}

export function ContactSection({brandAssets, repoConfig}: ContactSectionProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [projectType, setProjectType] = useState('Photographie professionnelle');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const contactLogo = brandAssets.logoContactDark || brandAssets.logoContactLight;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    const subject = encodeURIComponent(
      `[DIONTADO PRODUCTION] Demande : ${projectType} — ${name}`
    );
    const body = encodeURIComponent(
      `Nom : ${name}\nEmail : ${email}\nPrestation : ${projectType}\n\nMessage :\n${message}`
    );
    window.location.href = `mailto:diontadoevens.0@gmail.com?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <section id="contact" className="border-t border-white/10 bg-[#111114] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-8 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A46B]">
              Contact
            </p>
            <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight text-white text-balance sm:text-5xl">
              Parlons de votre projet
            </h2>
          </div>
          <p className="max-w-md text-sm text-stone-400">
            Un tournage, une séance portrait, un reportage culturel, un mariage ou une campagne de marque ? Écrivez-nous directement.
          </p>
        </div>

        <div className="mt-10 grid items-stretch gap-8 lg:grid-cols-12">
          {/* Left Column: Brand Contact Identity */}
          <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-[#070708] p-8 lg:col-span-5">
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
                    Instagram
                  </dt>
                  <dd className="mt-1">
                    <a
                      href="https://www.instagram.com/diontado_photography"
                      target="_blank"
                      rel="noreferrer"
                      className="text-base font-medium text-[#F5F3EE] hover:text-[#DFBE89]"
                    >
                      @diontado_photography
                    </a>
                  </dd>
                </div>

                <div>
                  <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-stone-400">
                    Localisation
                  </dt>
                  <dd className="mt-1 text-base font-medium text-[#F5F3EE]">
                    Yeumbeul, Sénégal
                  </dd>
                </div>
              </dl>
            </div>

            <a
              href="https://wa.me/221000000000?text=Bonjour%20DIONTADO%20PRODUCTION%2C%20je%20souhaite%20discuter%20d%27un%20projet."
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-lg bg-[#1F7A4C] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#258D58] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A46B]"
            >
              Contacter sur WhatsApp
            </a>
          </div>

          {/* Right Column: Contact Form */}
          <div className="rounded-xl border border-white/10 bg-[#070708] p-8 lg:col-span-7">
            {submitted ? (
              <div className="flex h-full flex-col items-start justify-center py-8">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#C8A46B]/20 text-[#DFBE89]">
                  <Check className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-5 font-display text-2xl font-semibold text-white">
                  Message préparé pour diontadoevens.0@gmail.com
                </h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-stone-400">
                  Merci {name}. Si votre messagerie ne s’est pas ouverte automatiquement, vous pouvez nous écrire directement à diontadoevens.0@gmail.com ou sur WhatsApp.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setMessage('');
                  }}
                  className="mt-6 rounded-md border border-white/20 px-4 py-2 text-xs font-medium text-stone-200 transition-colors hover:border-[#C8A46B]"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-xs font-medium text-[#E6DCCB]"
                    >
                      Nom complet
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Votre nom"
                      className="mt-1.5 h-11 w-full rounded-lg border border-white/15 bg-[#111114] px-3.5 text-sm text-white placeholder:text-stone-500 focus:border-[#C8A46B] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-xs font-medium text-[#E6DCCB]"
                    >
                      Votre email
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nom@exemple.com"
                      className="mt-1.5 h-11 w-full rounded-lg border border-white/15 bg-[#111114] px-3.5 text-sm text-white placeholder:text-stone-500 focus:border-[#C8A46B] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
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
                    className="mt-1.5 h-11 w-full rounded-lg border border-white/15 bg-[#111114] px-3.5 text-sm text-white focus:border-[#C8A46B] focus:outline-none"
                  >
                    <option value="Photographie professionnelle">Photographie professionnelle</option>
                    <option value="Production et réalisation vidéo">Production et réalisation vidéo</option>
                    <option value="Mariage">Reportage Mariage</option>
                    <option value="Culture">Reportage Culture</option>
                    <option value="Publicité">Campagne Publicitaire</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-xs font-medium text-[#E6DCCB]"
                  >
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Décrivez votre projet, le lieu et la date souhaitée..."
                    className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#111114] p-3.5 text-sm text-white placeholder:text-stone-500 focus:border-[#C8A46B] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#C8A46B] px-6 text-sm font-semibold text-[#0B0A09] transition-colors hover:bg-[#DFBE89] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A46B]"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  <span>Envoyer le message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
