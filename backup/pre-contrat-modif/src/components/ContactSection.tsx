import {
  AlertCircle,
  Check,
  Copy,
  ExternalLink,
  ImagePlus,
  Mail,
  MessageCircle,
  Share2,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import {type ChangeEvent, type FormEvent, useEffect, useMemo, useState} from 'react';
import {
  BOOKING_PRESTATIONS,
  DIONTADO_WAVE_PAYMENT_URL,
  DIONTADO_WHATSAPP_NUMBER,
  formatTarifAmount,
} from '../data/diontadoManifest';
import type {BookingFormula, BrandAssets, GitHubRepoConfig} from '../types/gallery';
import {ResilientImage} from './ResilientImage';

interface ContactSectionProps {
  brandAssets: BrandAssets;
  repoConfig: GitHubRepoConfig | null;
  selectedPrestation?: string;
  selectedFormulaId?: string;
}

interface SubmittedBookingSummary {
  waUrl: string;
  summary: string;
  hasProof: boolean;
  proofFileName?: string;
}

async function copyImageFileToClipboard(file: File): Promise<boolean> {
  if (
    typeof ClipboardItem === 'undefined' ||
    typeof navigator === 'undefined' ||
    !navigator.clipboard?.write
  ) {
    return false;
  }

  try {
    let pngBlob: Blob = file;
    if (file.type !== 'image/png') {
      const objectUrl = URL.createObjectURL(file);
      try {
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const el = new Image();
          el.onload = () => resolve(el);
          el.onerror = () => reject(new Error('Image load failed'));
          el.src = objectUrl;
        });
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return false;
        ctx.drawImage(img, 0, 0);
        const converted = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, 'image/png')
        );
        if (!converted) return false;
        pngBlob = converted;
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    }

    await navigator.clipboard.write([new ClipboardItem({'image/png': pngBlob})]);
    return true;
  } catch {
    return false;
  }
}

function triggerWhatsAppLink(url: string) {
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function ContactSection({
  brandAssets,
  repoConfig,
  selectedPrestation,
  selectedFormulaId,
}: ContactSectionProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [projectType, setProjectType] = useState(BOOKING_PRESTATIONS[0].prestation);
  const [formulaId, setFormulaId] = useState(BOOKING_PRESTATIONS[0].formulas[0].id);
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [location, setLocation] = useState('');
  const [message, setMessage] = useState('');

  // Preuve de paiement (capture d'écran)
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string | null>(null);

  // Retours UI & Confirmation
  const [errorText, setErrorText] = useState<string | null>(null);
  const [submittedBooking, setSubmittedBooking] = useState<SubmittedBookingSummary | null>(null);
  const [helperNotice, setHelperNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedPrestation) return;
    const matchedGroup = BOOKING_PRESTATIONS.find(
      (g) => g.prestation === selectedPrestation
    );
    if (!matchedGroup) return;

    setProjectType(matchedGroup.prestation);
    const matchedFormula =
      (selectedFormulaId &&
        matchedGroup.formulas.find((f) => f.id === selectedFormulaId)) ||
      matchedGroup.formulas[0];

    if (matchedFormula) {
      setFormulaId(matchedFormula.id);
    }
    setSubmittedBooking(null);
    setErrorText(null);
  }, [selectedPrestation, selectedFormulaId]);

  const currentGroup = useMemo(() => {
    return (
      BOOKING_PRESTATIONS.find((g) => g.prestation === projectType) ||
      BOOKING_PRESTATIONS[0]
    );
  }, [projectType]);

  const currentFormula: BookingFormula = useMemo(() => {
    return (
      currentGroup.formulas.find((f) => f.id === formulaId) ||
      currentGroup.formulas[0]
    );
  }, [currentGroup, formulaId]);

  const handleChangePrestation = (nextPrestation: string) => {
    setProjectType(nextPrestation);
    const group = BOOKING_PRESTATIONS.find((g) => g.prestation === nextPrestation);
    if (group && group.formulas[0]) {
      setFormulaId(group.formulas[0].id);
    }
    setErrorText(null);
    setSubmittedBooking(null);
  };

  const handleChangeFormula = (nextFormulaId: string) => {
    setFormulaId(nextFormulaId);
    setErrorText(null);
    setSubmittedBooking(null);
  };

  useEffect(() => {
    return () => {
      if (proofPreviewUrl) {
        URL.revokeObjectURL(proofPreviewUrl);
      }
    };
  }, [proofPreviewUrl]);

  // Calculs automatiques (Total, Acompte 70 %, Restant 30 %, Exception Studio)
  const pricing = useMemo(() => {
    const isStudio = Boolean(currentFormula.isStudio);
    const hasFixedPrice = currentFormula.priceAmount !== null;
    const totalAmount = currentFormula.priceAmount ?? 0;

    if (isStudio) {
      const totalLabel = hasFixedPrice
        ? formatTarifAmount(totalAmount, currentFormula.currency)
        : 'Sur devis (au studio)';
      return {
        isStudio: true,
        requiresDeposit: false,
        totalLabel,
        depositAmountNumeric: 0,
        depositLabel: '0 CFA (Aucun acompte)',
        remainingLabel: hasFixedPrice
          ? `${totalLabel} — à régler au studio`
          : "Paiement intégral à l'arrivée au studio",
      };
    }

    if (hasFixedPrice) {
      const depositAmount = Math.round(totalAmount * 0.7);
      const remainingAmount = totalAmount - depositAmount;
      const totalLabel = formatTarifAmount(totalAmount, currentFormula.currency);
      const depositLabel = formatTarifAmount(depositAmount, currentFormula.currency);
      const remainingLabel = formatTarifAmount(remainingAmount, currentFormula.currency);

      return {
        isStudio: false,
        requiresDeposit: true,
        totalLabel,
        depositAmountNumeric: depositAmount,
        depositLabel,
        remainingLabel: `${remainingLabel} (le jour J)`,
      };
    }

    return {
      isStudio: false,
      requiresDeposit: false,
      totalLabel: 'Sur devis',
      depositAmountNumeric: 0,
      depositLabel: '70 % après devis',
      remainingLabel: '30 % le jour J',
    };
  }, [currentFormula]);

  const contactLogo = brandAssets.logoContactDark || brandAssets.logoContactLight;

  const handleProofFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorText(
        'Veuillez choisir une image (PNG, JPG ou WEBP) pour la capture du paiement.'
      );
      return;
    }
    if (proofPreviewUrl) {
      URL.revokeObjectURL(proofPreviewUrl);
    }
    setProofFile(file);
    setProofPreviewUrl(URL.createObjectURL(file));
    setErrorText(null);
  };

  const handleRemoveProof = () => {
    if (proofPreviewUrl) {
      URL.revokeObjectURL(proofPreviewUrl);
    }
    setProofFile(null);
    setProofPreviewUrl(null);
  };

  const validateRequired = (): boolean => {
    if (!name.trim() || !phone.trim() || !eventDate || !eventTime) {
      setErrorText(
        'Merci de remplir votre nom, votre numéro WhatsApp, la date et l’heure souhaitées.'
      );
      return false;
    }
    if (!pricing.isStudio && !location.trim()) {
      setErrorText('Merci d’indiquer le lieu de la prestation.');
      return false;
    }
    return true;
  };

  const buildFormattedSummary = (): string => {
    const resolvedLocation =
      location.trim() ||
      (pricing.isStudio ? 'Studio DIONTADO — Yeumbeul, Dakar' : 'À préciser');

    const lines = [
      'Bonjour DIONTADO PRODUCTION,',
      'Voici ma demande de réservation :',
      '',
      `• Nom complet : ${name.trim()}`,
      `• Téléphone : ${phone.trim()}`,
      `• Prestation choisie : ${projectType}`,
      `• Formule choisie : ${currentFormula.label}`,
    ];

    if (currentFormula.photoCountLabel) {
      lines.push(`• Nombre de photos : ${currentFormula.photoCountLabel}`);
    }

    lines.push(
      `• Prix total : ${pricing.totalLabel}`,
      `• Acompte demandé : ${pricing.depositLabel}`,
      `• Montant restant : ${pricing.remainingLabel}`,
      `• Date souhaitée : ${eventDate}`,
      `• Heure souhaitée : ${eventTime}`,
      `• Lieu de la prestation : ${resolvedLocation}`,
      `• Informations complémentaires : ${message.trim() || 'Aucune'}`
    );

    if (pricing.isStudio) {
      lines.push('');
      lines.push("Réservation demandée — Paiement intégral à l'arrivée au studio.");
    } else if (pricing.requiresDeposit) {
      lines.push('');
      lines.push(`• Lien de paiement Wave utilisé : ${DIONTADO_WAVE_PAYMENT_URL}`);
      if (proofFile) {
        lines.push(
          `• Preuve de paiement : Capture d'écran prête (${proofFile.name}) — envoyée dans cette conversation WhatsApp.`
        );
      } else {
        lines.push(
          '• Preuve de paiement : Capture à joindre ou à vérifier sur WhatsApp.'
        );
      }
    }

    lines.push('');
    lines.push('En attente de votre vérification et confirmation sur WhatsApp.');

    return lines.join('\n');
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setErrorText(null);
    setHelperNotice(null);

    if (!validateRequired()) return;

    const summary = buildFormattedSummary();
    const waUrl = `https://wa.me/${DIONTADO_WHATSAPP_NUMBER}?text=${encodeURIComponent(summary)}`;

    setSubmittedBooking({
      waUrl,
      summary,
      hasProof: Boolean(proofFile && pricing.requiresDeposit),
      proofFileName: proofFile?.name,
    });

    triggerWhatsAppLink(waUrl);
  };

  const handleSendEmail = () => {
    setErrorText(null);
    if (!validateRequired()) return;

    const summary = buildFormattedSummary();
    const subject = encodeURIComponent(
      `[DIONTADO PRODUCTION] Réservation : ${projectType} (${currentFormula.label}) — ${name.trim()}`
    );
    const body = encodeURIComponent(summary);
    window.location.href = `mailto:diontadoevens.0@gmail.com?subject=${subject}&body=${body}`;
    setHelperNotice(
      'Votre récapitulatif a été ouvert dans votre application email vers diontadoevens.0@gmail.com.'
    );
  };

  const canNativeShareProof =
    typeof navigator !== 'undefined' &&
    Boolean(proofFile) &&
    typeof navigator.canShare === 'function' &&
    (() => {
      try {
        return proofFile ? navigator.canShare({files: [proofFile]}) : false;
      } catch {
        return false;
      }
    })();

  const handleNativeShareWithProof = async () => {
    if (!proofFile || !submittedBooking) return;
    try {
      await navigator.share({
        title: 'Réservation DIONTADO PRODUCTION',
        text: submittedBooking.summary,
        files: [proofFile],
      });
      setHelperNotice(
        'Partage ouvert : choisissez WhatsApp pour envoyer la demande avec votre capture.'
      );
    } catch {
      setHelperNotice(
        'Utilisez le bouton WhatsApp ci-dessus et joignez votre capture directement dans la discussion.'
      );
    }
  };

  const handleCopyProofImage = async () => {
    if (!proofFile) return;
    const ok = await copyImageFileToClipboard(proofFile);
    setHelperNotice(
      ok
        ? 'Capture copiée ! Collez-la directement dans la discussion WhatsApp.'
        : 'Joignez la capture depuis votre galerie dans WhatsApp.'
    );
  };

  const handleCopyDepositAmount = async () => {
    if (!pricing.depositAmountNumeric || !navigator.clipboard?.writeText) return;
    try {
      await navigator.clipboard.writeText(String(pricing.depositAmountNumeric));
      setHelperNotice(`Montant (${pricing.depositLabel}) copié.`);
    } catch {
      setHelperNotice(null);
    }
  };

  const handleCopySummaryText = async () => {
    if (!submittedBooking || !navigator.clipboard?.writeText) return;
    try {
      await navigator.clipboard.writeText(submittedBooking.summary);
      setHelperNotice('Récapitulatif copié.');
    } catch {
      setHelperNotice(null);
    }
  };

  return (
    <section
      id="contact"
      className="border-t border-white/10 bg-[#09090B] py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-8 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF6A]">
              RÉSERVATION SIMPLE &amp; RAPIDE
            </p>
            <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight text-white text-balance sm:text-5xl">
              Réservez en moins d’une minute.
            </h2>
          </div>
          <p className="max-w-md text-sm text-stone-400">
            Choisissez votre formule, payez l’acompte par lien Wave (sauf Studio) et envoyez directement sur WhatsApp.
          </p>
        </div>

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-12">
          {/* Colonne gauche : Coordonnées & 3 étapes rapides */}
          <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-[#121217] p-7 lg:col-span-4">
            <div>
              {contactLogo && contactLogo.url ? (
                <div className="mb-6 h-20 max-w-[190px] overflow-hidden">
                  <ResilientImage
                    item={contactLogo}
                    repoConfig={repoConfig}
                    alt="DIONTADO PRODUCTION"
                    className="h-20 w-auto object-contain"
                  />
                </div>
              ) : (
                <div className="mb-6">
                  <span className="font-display text-2xl font-semibold tracking-wider text-white">
                    DIONTADO PRODUCTION
                  </span>
                </div>
              )}

              <div className="rounded-lg border border-white/10 bg-[#09090B] p-4">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#D4AF6A]">
                  Comment réserver ?
                </p>
                <ol className="mt-3 space-y-2.5 text-xs leading-relaxed text-stone-300">
                  <li className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#D4AF6A]/15 font-mono text-[10px] font-semibold text-[#E7CA91]">
                      1
                    </span>
                    <span>Choisissez la prestation et la formule : le prix se calcule tout seul.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#D4AF6A]/15 font-mono text-[10px] font-semibold text-[#E7CA91]">
                      2
                    </span>
                    <span>
                      Réglez l’acompte via notre <strong className="text-white">lien Wave</strong> (sauf Shooting Studio : 0 CFA d’acompte).
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#D4AF6A]/15 font-mono text-[10px] font-semibold text-[#E7CA91]">
                      3
                    </span>
                    <span>Envoyez votre demande sur WhatsApp pour confirmation.</span>
                  </li>
                </ol>
              </div>

              <dl className="mt-6 space-y-4 border-t border-white/10 pt-5 text-sm">
                <div>
                  <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-stone-400">
                    WhatsApp &amp; Téléphone
                  </dt>
                  <dd className="mt-0.5">
                    <a
                      href="tel:+221764812391"
                      className="font-mono text-base font-medium text-[#F5F2EB] tabular-nums hover:text-[#E7CA91]"
                    >
                      +221 76 481 23 91
                    </a>
                  </dd>
                </div>

                <div>
                  <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-stone-400">
                    Email
                  </dt>
                  <dd className="mt-0.5">
                    <a
                      href="mailto:diontadoevens.0@gmail.com"
                      className="text-sm font-medium text-[#F5F2EB] hover:text-[#E7CA91]"
                    >
                      diontadoevens.0@gmail.com
                    </a>
                  </dd>
                </div>

                <div>
                  <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-stone-400">
                    Studio
                  </dt>
                  <dd className="mt-0.5 text-sm font-medium text-[#F5F2EB]">
                    Yeumbeul, Dakar · Sénégal &amp; International
                  </dd>
                </div>
              </dl>
            </div>

            <a
              href={`https://wa.me/${DIONTADO_WHATSAPP_NUMBER}?text=${encodeURIComponent(
                'Bonjour DIONTADO PRODUCTION, je souhaite discuter d’une réservation.'
              )}`}
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-5 text-xs font-semibold text-white transition-colors hover:border-[#D4AF6A] hover:text-[#E7CA91]"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              <span>Question rapide sur WhatsApp</span>
            </a>
          </div>

          {/* Colonne droite : Formulaire guidé en 3 étapes rapides */}
          <div className="rounded-xl border border-white/10 bg-[#121217] p-6 sm:p-8 lg:col-span-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ÉTAPE 1 : PRESTATION & CALCUL AUTOMATIQUE */}
              <div className="space-y-4 border-b border-white/10 pb-6">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#D4AF6A] font-mono text-xs font-bold text-[#0B0A09]">
                    1
                  </span>
                  <h3 className="font-display text-2xl font-semibold text-white">
                    Votre prestation
                  </h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="contact-type"
                      className="block text-xs font-medium text-[#E6DCCB]"
                    >
                      Prestation *
                    </label>
                    <select
                      id="contact-type"
                      value={projectType}
                      onChange={(e) => handleChangePrestation(e.target.value)}
                      className="mt-1.5 h-11 w-full rounded-lg border border-white/15 bg-[#09090B] px-3 text-sm text-white focus:border-[#D4AF6A] focus:outline-none"
                    >
                      {BOOKING_PRESTATIONS.map((group) => (
                        <option key={group.prestation} value={group.prestation}>
                          {group.prestation}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="contact-formula"
                      className="block text-xs font-medium text-[#E6DCCB]"
                    >
                      Formule *
                    </label>
                    <select
                      id="contact-formula"
                      value={currentFormula.id}
                      onChange={(e) => handleChangeFormula(e.target.value)}
                      className="mt-1.5 h-11 w-full rounded-lg border border-white/15 bg-[#09090B] px-3 text-sm text-white focus:border-[#D4AF6A] focus:outline-none"
                    >
                      {currentGroup.formulas.map((formula) => (
                        <option key={formula.id} value={formula.id}>
                          {formula.label} —{' '}
                          {formula.priceAmount !== null
                            ? formatTarifAmount(formula.priceAmount, formula.currency)
                            : 'Sur devis'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Bandeau récapitulatif compact */}
                <div className="rounded-lg border border-[#D4AF6A]/35 bg-[#09090B] px-4 py-3.5">
                  <div className="grid gap-3 sm:grid-cols-3 sm:divide-x sm:divide-white/10">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.14em] text-stone-400">
                        Prix total
                        {currentFormula.photoCountLabel
                          ? ` (${currentFormula.photoCountLabel})`
                          : ''}
                      </p>
                      <p className="mt-0.5 font-display text-2xl font-semibold text-white">
                        {pricing.totalLabel}
                      </p>
                    </div>
                    <div className="sm:pl-4">
                      <p className="text-[10px] uppercase tracking-[0.14em] text-stone-400">
                        Acompte demandé
                      </p>
                      <p className="mt-0.5 font-display text-2xl font-semibold text-[#E7CA91]">
                        {pricing.depositLabel}
                      </p>
                    </div>
                    <div className="sm:pl-4">
                      <p className="text-[10px] uppercase tracking-[0.14em] text-stone-400">
                        Reste à payer
                      </p>
                      <p className="mt-1 text-xs font-semibold leading-snug text-stone-200">
                        {pricing.remainingLabel}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ÉTAPE 2 : COORDONNÉES & CRÉNEAU */}
              <div className="space-y-4 border-b border-white/10 pb-6">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#D4AF6A] font-mono text-xs font-bold text-[#0B0A09]">
                    2
                  </span>
                  <h3 className="font-display text-2xl font-semibold text-white">
                    Vos coordonnées &amp; créneau
                  </h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
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
                      className="mt-1.5 h-11 w-full rounded-lg border border-white/15 bg-[#09090B] px-3.5 text-sm text-white placeholder:text-stone-500 focus:border-[#D4AF6A] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-phone"
                      className="block text-xs font-medium text-[#E6DCCB]"
                    >
                      Numéro WhatsApp *
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+221 77 000 00 00"
                      className="mt-1.5 h-11 w-full rounded-lg border border-white/15 bg-[#09090B] px-3.5 text-sm text-white placeholder:text-stone-500 focus:border-[#D4AF6A] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label
                      htmlFor="contact-date"
                      className="block text-xs font-medium text-[#E6DCCB]"
                    >
                      Date souhaitée *
                    </label>
                    <input
                      id="contact-date"
                      type="date"
                      required
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="mt-1.5 h-11 w-full rounded-lg border border-white/15 bg-[#09090B] px-3.5 text-sm text-white focus:border-[#D4AF6A] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-time"
                      className="block text-xs font-medium text-[#E6DCCB]"
                    >
                      Heure souhaitée *
                    </label>
                    <input
                      id="contact-time"
                      type="time"
                      required
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      className="mt-1.5 h-11 w-full rounded-lg border border-white/15 bg-[#09090B] px-3.5 text-sm text-white focus:border-[#D4AF6A] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-location"
                      className="block text-xs font-medium text-[#E6DCCB]"
                    >
                      Lieu {pricing.isStudio ? '(Studio)' : '*'}
                    </label>
                    <input
                      id="contact-location"
                      type="text"
                      required={!pricing.isStudio}
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder={
                        pricing.isStudio
                          ? 'Studio DIONTADO (Yeumbeul)'
                          : 'Dakar, Saly, Saint-Louis...'
                      }
                      className="mt-1.5 h-11 w-full rounded-lg border border-white/15 bg-[#09090B] px-3.5 text-sm text-white placeholder:text-stone-500 focus:border-[#D4AF6A] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-xs font-medium text-[#E6DCCB]"
                  >
                    Informations complémentaires <span className="text-stone-500">(facultatif)</span>
                  </label>
                  <textarea
                    id="contact-message"
                    rows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tenues, détails sur le lieu ou précision utile..."
                    className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#09090B] p-3 text-sm text-white placeholder:text-stone-500 focus:border-[#D4AF6A] focus:outline-none"
                  />
                </div>
              </div>

              {/* ÉTAPE 3 : PAIEMENT WAVE (OU EXCEPTION STUDIO) & ENVOI WHATSAPP */}
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#D4AF6A] font-mono text-xs font-bold text-[#0B0A09]">
                    3
                  </span>
                  <h3 className="font-display text-2xl font-semibold text-white">
                    {pricing.isStudio
                      ? 'Paiement au studio & envoi'
                      : pricing.requiresDeposit
                        ? 'Acompte Wave & envoi WhatsApp'
                        : 'Validation sur WhatsApp'}
                  </h3>
                </div>

                {/* CAS A : Exception Shooting Studio */}
                {pricing.isStudio && (
                  <div className="flex items-start gap-3 rounded-xl border border-[#D4AF6A]/45 bg-[#D4AF6A]/10 p-4">
                    <ShieldCheck
                      className="mt-0.5 h-5 w-5 shrink-0 text-[#E7CA91]"
                      aria-hidden="true"
                    />
                    <div className="text-xs leading-relaxed text-stone-200">
                      <p className="font-semibold text-white">
                        Exception Shooting Studio : aucun acompte demandé.
                      </p>
                      <p className="mt-0.5">
                        Vous réglez l’intégralité ({pricing.totalLabel}) directement à votre arrivée au studio.
                      </p>
                    </div>
                  </div>
                )}

                {/* CAS B : Paiement par Lien Wave DIONTADO */}
                {pricing.requiresDeposit && (
                  <div className="space-y-4 rounded-xl border border-[#D4AF6A]/45 bg-[#0D0D12] p-5">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div>
                        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#D4AF6A]">
                          Paiement officiel Wave · DIONTADO PRODUCTION
                        </p>
                        <p className="mt-1 font-display text-2xl font-semibold text-white">
                          Acompte à payer :{' '}
                          <span className="text-[#E7CA91]">{pricing.depositLabel}</span>
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href={DIONTADO_WAVE_PAYMENT_URL}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#1BA8F0] px-5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#1593D4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF6A]"
                        >
                          <span>Payer {pricing.depositLabel} sur Wave</span>
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        </a>
                        <button
                          type="button"
                          onClick={handleCopyDepositAmount}
                          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 text-[11px] font-medium text-stone-200 transition-colors hover:border-[#D4AF6A] hover:text-[#E7CA91]"
                        >
                          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Copier montant</span>
                        </button>
                      </div>
                    </div>

                    {/* Upload preuve de paiement */}
                    <div className="border-t border-white/10 pt-4">
                      {!proofFile ? (
                        <label
                          htmlFor="payment-proof-input"
                          className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-dashed border-[#D4AF6A]/50 bg-[#09090B] px-4 py-3 text-xs text-[#E7CA91] transition-colors hover:border-[#D4AF6A] hover:bg-[#D4AF6A]/10"
                        >
                          <span className="flex items-center gap-2.5 font-medium">
                            <ImagePlus className="h-4 w-4 shrink-0" aria-hidden="true" />
                            <span>Joindre la capture d’écran du paiement Wave</span>
                          </span>
                          <span className="font-mono text-[10px] text-stone-400">
                            PNG / JPG
                          </span>
                          <input
                            id="payment-proof-input"
                            type="file"
                            accept="image/*"
                            onChange={handleProofFileChange}
                            className="sr-only"
                          />
                        </label>
                      ) : (
                        <div className="flex items-center justify-between gap-3 rounded-lg border border-[#D4AF6A]/50 bg-[#09090B] p-2.5">
                          <div className="flex min-w-0 items-center gap-3">
                            {proofPreviewUrl && (
                              <img
                                src={proofPreviewUrl}
                                alt="Aperçu de la capture Wave"
                                className="h-11 w-11 shrink-0 rounded border border-white/15 object-cover"
                              />
                            )}
                            <div className="min-w-0">
                              <p className="truncate text-xs font-medium text-white">
                                {proofFile.name}
                              </p>
                              <p className="font-mono text-[10px] text-[#E7CA91]">
                                Prête à joindre dans WhatsApp
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveProof}
                            aria-label="Retirer la capture"
                            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/15 text-stone-300 transition-colors hover:border-amber-400 hover:text-amber-300"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      )}
                      <p className="mt-2 text-[11px] text-stone-400">
                        Après validation, votre récapitulatif s’ouvre sur WhatsApp (+221 76 481 23 91) pour y joindre votre capture d’écran.
                      </p>
                    </div>
                  </div>
                )}

                {/* CAS C : Prestation sur devis */}
                {!pricing.isStudio && !pricing.requiresDeposit && (
                  <div className="rounded-xl border border-white/15 bg-[#09090B] px-4 py-3.5 text-xs leading-relaxed text-stone-300">
                    Prestation <strong className="text-white">sur devis</strong> : aucun paiement maintenant. Envoyez votre demande sur WhatsApp pour recevoir votre tarif personnalisé.
                  </div>
                )}

                {/* Boutons d'action */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="submit"
                    className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-[#1F7A4C] px-6 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#258D58] sm:flex-initial focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF6A]"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    <span>Envoyer ma réservation sur WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendEmail}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/20 bg-transparent px-4 text-xs font-semibold text-stone-200 transition-colors hover:border-[#D4AF6A] hover:text-[#E7CA91]"
                  >
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    <span>Par Email</span>
                  </button>
                </div>
              </div>

              {/* Erreur */}
              {errorText && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-lg border border-amber-500/45 bg-amber-500/10 p-3.5 text-xs text-amber-200"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
                  <span>{errorText}</span>
                </div>
              )}

              {/* Confirmation client officielle */}
              {submittedBooking && (
                <div
                  role="status"
                  className="space-y-4 rounded-xl border border-[#D4AF6A]/60 bg-[#D4AF6A]/10 p-5"
                >
                  <div className="flex items-start gap-3">
                    <Check
                      className="mt-0.5 h-5 w-5 shrink-0 text-[#E7CA91]"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#E7CA91]">
                        Demande transmise · En attente de vérification WhatsApp
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-white">
                        Merci d'avoir choisi DIONTADO PRODUCTION. Votre demande de réservation a bien été transmise. Nous allons vous contacter sur WhatsApp pour confirmer la disponibilité de la date, de l'heure et les détails de votre prestation.
                      </p>
                    </div>
                  </div>

                  {submittedBooking.hasProof && (
                    <div className="rounded-lg border border-white/15 bg-[#09090B]/85 p-3 text-xs leading-relaxed text-stone-200">
                      <strong className="text-[#E7CA91]">Dernière étape :</strong> joignez votre capture d’écran (<span className="font-mono">{submittedBooking.proofFileName}</span>) directement dans la conversation WhatsApp ouverte.
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2.5">
                    <a
                      href={submittedBooking.waUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#1F7A4C] px-4 text-xs font-semibold text-white transition-colors hover:bg-[#258D58]"
                    >
                      <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Ouvrir WhatsApp (+221 76 481 23 91)</span>
                    </a>

                    {submittedBooking.hasProof && canNativeShareProof && (
                      <button
                        type="button"
                        onClick={handleNativeShareWithProof}
                        className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md bg-[#D4AF6A] px-4 text-xs font-semibold text-[#0B0A09] transition-colors hover:bg-[#E7CA91]"
                      >
                        <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Envoyer message + capture (Mobile)</span>
                      </button>
                    )}

                    {submittedBooking.hasProof && (
                      <button
                        type="button"
                        onClick={handleCopyProofImage}
                        className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md border border-white/20 bg-white/5 px-3.5 text-xs font-medium text-white transition-colors hover:border-[#D4AF6A] hover:text-[#E7CA91]"
                      >
                        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Copier la capture</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleCopySummaryText}
                      className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md border border-white/20 bg-white/5 px-3.5 text-xs font-medium text-stone-200 transition-colors hover:border-[#D4AF6A] hover:text-[#E7CA91]"
                    >
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Copier le texte</span>
                    </button>
                  </div>
                </div>
              )}

              {helperNotice && (
                <p className="rounded-lg border border-white/10 bg-[#09090B] px-4 py-2.5 text-xs text-[#E7CA91]">
                  {helperNotice}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
