import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  FileText,
  Mail,
  MessageCircle,
  X,
} from 'lucide-react';
import {useEffect, useMemo, useState} from 'react';
import {
  BOOKING_PRESTATIONS,
  formatFcfa,
  generateBookingReference,
} from '../data/bookingData';
import {DIONTADO_WHATSAPP_NUMBER} from '../data/diontadoManifest';

interface ReservationPageProps {
  initialPrestation?: string;
  initialFormulaId?: string;
  onBackHome: () => void;
}

interface AvailabilityData {
  mis_a_jour: string;
  dates_indisponibles: string[];
  jours_fermes_hebdo: number[];
}

const MONTHS_FR = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
];

const DAYS_FR = [
  'dimanche',
  'lundi',
  'mardi',
  'mercredi',
  'jeudi',
  'vendredi',
  'samedi',
];

const WEEKDAY_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const TIME_SLOTS = [
  'Matin (09h – 12h)',
  'Après-midi (14h – 18h)',
  'Fin de journée (17h – 20h)',
  'Journée complète',
  'Flexible / À convenir',
];

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function getTodayLocal(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function addMonthsClamped(baseDate: Date, monthsToAdd: number): Date {
  const d = new Date(baseDate.getFullYear(), baseDate.getMonth() + monthsToAdd, 1);
  const daysInTarget = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  return new Date(d.getFullYear(), d.getMonth(), Math.min(baseDate.getDate(), daysInTarget));
}

function toIsoDate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function parseIsoDate(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  const dt = new Date(y, mo, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo || dt.getDate() !== d) return null;
  return dt;
}

function formatFrenchDate(iso: string): string {
  const dt = parseIsoDate(iso);
  if (!dt) return '';
  return `${DAYS_FR[dt.getDay()]} ${dt.getDate()} ${MONTHS_FR[dt.getMonth()]} ${dt.getFullYear()}`;
}

export function ReservationPage({
  initialPrestation,
  initialFormulaId,
  onBackHome,
}: ReservationPageProps) {
  const resolvedInitialPrestation = useMemo(() => {
    if (initialPrestation) {
      const normalized = initialPrestation.trim().toLowerCase();
      const match = BOOKING_PRESTATIONS.find(
        (p) =>
          p.value.toLowerCase() === normalized ||
          p.label.toLowerCase().includes(normalized)
      );
      if (match) return match;
    }
    return BOOKING_PRESTATIONS[0];
  }, [initialPrestation]);

  const [selectedPrestationValue, setSelectedPrestationValue] = useState<string>(
    resolvedInitialPrestation.value
  );
  const [selectedFormulaId, setSelectedFormulaId] = useState<string>(() => {
    if (
      initialFormulaId &&
      resolvedInitialPrestation.formulas.some((f) => f.id === initialFormulaId)
    ) {
      return initialFormulaId;
    }
    return resolvedInitialPrestation.formulas[0]?.id || '';
  });

  useEffect(() => {
    setSelectedPrestationValue(resolvedInitialPrestation.value);
    if (
      initialFormulaId &&
      resolvedInitialPrestation.formulas.some((f) => f.id === initialFormulaId)
    ) {
      setSelectedFormulaId(initialFormulaId);
    } else {
      setSelectedFormulaId(resolvedInitialPrestation.formulas[0]?.id || '');
    }
  }, [resolvedInitialPrestation, initialFormulaId]);

  const currentPrestation = useMemo(
    () =>
      BOOKING_PRESTATIONS.find((p) => p.value === selectedPrestationValue) ||
      BOOKING_PRESTATIONS[0],
    [selectedPrestationValue]
  );

  const currentFormula = useMemo(
    () =>
      currentPrestation.formulas.find((f) => f.id === selectedFormulaId) ||
      currentPrestation.formulas[0],
    [currentPrestation, selectedFormulaId]
  );

  const isStudio = Boolean(currentPrestation.isStudio || currentFormula?.isStudio);
  const hasFixedPrice = typeof currentFormula?.price === 'number';

  const [refCode] = useState<string>(() => generateBookingReference());
  const [availability, setAvailability] = useState<AvailabilityData>({
    mis_a_jour: '',
    dates_indisponibles: [],
    jours_fermes_hebdo: [],
  });

  const today = useMemo(() => getTodayLocal(), []);
  const maxDate = useMemo(() => addMonthsClamped(today, 12), [today]);
  const [viewYear, setViewYear] = useState<number>(today.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(today.getMonth());
  const [selectedIso, setSelectedIso] = useState<string>('');
  const [srStatus, setSrStatus] = useState<string>('');

  const [timeSlot, setTimeSlot] = useState<string>(TIME_SLOTS[0]);
  const [location, setLocation] = useState<string>(
    isStudio ? 'Studio Yeumbeul, Dakar' : ''
  );
  const [peopleCount, setPeopleCount] = useState<string>('1 personne');
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [details, setDetails] = useState<string>('');
  const [acceptedConditions, setAcceptedConditions] = useState<boolean>(false);
  const [showConditionsModal, setShowConditionsModal] = useState<boolean>(false);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);
  const [readyWhatsappUrl, setReadyWhatsappUrl] = useState<string>('');
  const [feedback, setFeedback] = useState<{type: 'error' | 'success'; message: string} | null>(
    null
  );

  useEffect(() => {
    if (isStudio) {
      if (!location.trim()) {
        setLocation('Studio Yeumbeul, Dakar');
      }
    } else if (location === 'Studio Yeumbeul, Dakar') {
      setLocation('');
    }
  }, [isStudio, location]);

  useEffect(() => {
    if (!showConditionsModal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowConditionsModal(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showConditionsModal]);

  useEffect(() => {
    let active = true;
    fetch('/api/disponibilites')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: AvailabilityData | null) => {
        if (!active || !data) return;
        setAvailability({
          mis_a_jour: typeof data.mis_a_jour === 'string' ? data.mis_a_jour : '',
          dates_indisponibles: Array.isArray(data.dates_indisponibles)
            ? data.dates_indisponibles
            : [],
          jours_fermes_hebdo: Array.isArray(data.jours_fermes_hebdo)
            ? data.jours_fermes_hebdo
            : [],
        });
      })
      .catch(() => {
        // Garde les disponibilités par défaut
      });
    return () => {
      active = false;
    };
  }, []);

  const minMonthKey = today.getFullYear() * 12 + today.getMonth();
  const maxMonthKey = maxDate.getFullYear() * 12 + maxDate.getMonth();
  const currentMonthKey = viewYear * 12 + viewMonth;
  const canPrevMonth = currentMonthKey > minMonthKey;
  const canNextMonth = currentMonthKey < maxMonthKey;

  const isDateUnavailable = (dateObj: Date): boolean => {
    const iso = toIsoDate(dateObj);
    if (availability.dates_indisponibles.includes(iso)) return true;
    if (availability.jours_fermes_hebdo.includes(dateObj.getDay())) return true;
    return false;
  };

  const isDateDisabled = (dateObj: Date): {disabled: boolean; reason: 'past' | 'unavailable' | 'limit' | null} => {
    if (dateObj < today) return {disabled: true, reason: 'past'};
    if (dateObj > maxDate) return {disabled: true, reason: 'limit'};
    if (isDateUnavailable(dateObj)) return {disabled: true, reason: 'unavailable'};
    return {disabled: false, reason: null};
  };

  const calendarCells = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    const startOffset = (firstDayOfMonth.getDay() + 6) % 7; // Lundi = 0
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: Array<{date: Date | null; iso: string; dayNum: number}> = [];

    for (let i = 0; i < startOffset; i++) {
      cells.push({date: null, iso: `empty-start-${i}`, dayNum: 0});
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dt = new Date(viewYear, viewMonth, day);
      cells.push({date: dt, iso: toIsoDate(dt), dayNum: day});
    }
    while (cells.length % 7 !== 0) {
      cells.push({date: null, iso: `empty-end-${cells.length}`, dayNum: 0});
    }
    return cells;
  }, [viewYear, viewMonth]);

  const handleSelectDate = (dt: Date) => {
    const check = isDateDisabled(dt);
    const iso = toIsoDate(dt);
    if (check.disabled) {
      if (check.reason === 'unavailable') {
        setSrStatus(`Date indisponible : ${formatFrenchDate(iso)}`);
      } else {
        setSrStatus(`Date passée ou hors plage : ${formatFrenchDate(iso)}`);
      }
      return;
    }
    setSelectedIso(iso);
    setFeedback(null);
    setSrStatus(`Date sélectionnée : ${formatFrenchDate(iso)}`);
  };

  const buildBookingMessage = () => {
    const dateLabel = selectedIso ? formatFrenchDate(selectedIso) : 'À convenir';
    const priceLabel = hasFixedPrice
      ? formatFcfa(currentFormula.price)
      : 'Sur devis personnalisé';

    const lines = [
      `Référence : ${refCode}`,
      `Prestation : ${currentPrestation.value}`,
      `Formule : ${currentFormula?.label || 'Sur devis'}`,
      `Tarif estimé : ${priceLabel}`,
      `Date souhaitée : ${dateLabel}`,
      `Créneau : ${timeSlot}`,
      `Lieu : ${isStudio ? 'Studio Yeumbeul, Dakar' : location.trim() || 'À préciser'}`,
      `Participants : ${peopleCount.trim() || 'Non précisé'}`,
      `Nom complet : ${clientName.trim()}`,
      `Téléphone / WhatsApp : ${clientPhone.trim()}`,
    ];
    if (clientEmail.trim()) lines.push(`Email : ${clientEmail.trim()}`);
    if (details.trim()) lines.push(`Précisions : ${details.trim()}`);
    lines.push('Conditions de réservation : lues et acceptées.');
    return lines.join('\n');
  };

  const todayIso = useMemo(() => toIsoDate(today), [today]);

  const validateForm = (): boolean => {
    if (!selectedIso) {
      setFeedback({
        type: 'error',
        message: 'Veuillez sélectionner une date libre dans le calendrier.',
      });
      return false;
    }
    if (!clientName.trim()) {
      setFeedback({
        type: 'error',
        message: 'Veuillez indiquer votre nom complet.',
      });
      return false;
    }
    const digitCount = clientPhone.replace(/\D/g, '').length;
    if (!clientPhone.trim() || digitCount < 7) {
      setFeedback({
        type: 'error',
        message: 'Veuillez indiquer un numéro WhatsApp ou téléphone valide (au moins 7 chiffres).',
      });
      return false;
    }
    if (!acceptedConditions) {
      setFeedback({
        type: 'error',
        message: 'Veuillez cocher la case « J’ai lu les conditions de réservation ».',
      });
      return false;
    }
    return true;
  };

  const handleSubmitWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    const message = buildBookingMessage();
    const url = `https://wa.me/${DIONTADO_WHATSAPP_NUMBER}?text=${encodeURIComponent(
      message
    )}`;
    setReadyWhatsappUrl(url);
    setFeedback({
      type: 'success',
      message: `Demande prête (${refCode}). Si WhatsApp ne s’ouvre pas automatiquement, cliquez sur « Ouvrir WhatsApp » ci-dessous.`,
    });
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.target = '_blank';
    anchor.rel = 'noreferrer';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const handleCopySummary = async () => {
    if (!validateForm()) return;
    try {
      await navigator.clipboard.writeText(buildBookingMessage());
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2200);
    } catch {
      setFeedback({
        type: 'error',
        message: 'Copie automatique bloquée par le navigateur. Utilisez le bouton WhatsApp ou E-mail.',
      });
    }
  };

  const handleSendEmail = () => {
    if (!validateForm()) return;
    const message = buildBookingMessage();
    const subject = `Demande de réservation ${refCode} — DIONTADO PRODUCTION`;
    window.location.href = `mailto:diontadoevens.0@gmail.com?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(message)}`;
  };

  return (
    <main className="page-enter min-h-screen bg-[#09090B]">
      {/* Barre supérieure */}
      <div className="border-b border-white/10 bg-[#0E0E13]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-md border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-[#F5F2EB] transition-colors hover:border-[#D4AF6A] hover:text-[#E7CA91]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Retour à l’accueil</span>
          </button>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-stone-400">
            Réservation · Réf. {refCode}
          </p>
        </div>
      </div>

      {/* En-tête */}
      <section className="border-b border-white/10 bg-[#0D0D12] py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#D4AF6A]">
            PRÉPARATION &amp; PRISE DE RENDEZ-VOUS
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-white text-balance sm:text-5xl lg:text-6xl">
            Réserver une prestation
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-stone-300 sm:text-base">
            Choisissez votre prestation, sélectionnez une date disponible et transmettez votre demande directement sur WhatsApp. Aucun paiement en ligne n’est demandé sur le site.
          </p>
        </div>
      </section>

      {/* Formulaire en 3 étapes */}
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <form onSubmit={handleSubmitWhatsApp} className="space-y-8" noValidate>
          {/* ÉTAPE 01 */}
          <div className="rounded-2xl border border-white/12 bg-[#121217] p-6 sm:p-8">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#D4AF6A]/45 bg-[#D4AF6A]/10 font-mono text-xs font-semibold text-[#E7CA91]">
                01
              </span>
              <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">
                Choix de la prestation &amp; formule
              </h2>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="bookingPrestation"
                  className="block text-xs font-semibold uppercase tracking-wider text-stone-300"
                >
                  Prestation
                </label>
                <select
                  id="bookingPrestation"
                  value={selectedPrestationValue}
                  onChange={(e) => {
                    const nextPrest =
                      BOOKING_PRESTATIONS.find((p) => p.value === e.target.value) ||
                      BOOKING_PRESTATIONS[0];
                    setSelectedPrestationValue(nextPrest.value);
                    setSelectedFormulaId(nextPrest.formulas[0]?.id || '');
                  }}
                  className="mt-2 h-11 w-full rounded-lg border border-white/15 bg-[#09090B] px-3.5 text-sm text-[#F5F2EB] focus:border-[#D4AF6A] focus:outline-none"
                >
                  {BOOKING_PRESTATIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="bookingFormula"
                  className="block text-xs font-semibold uppercase tracking-wider text-stone-300"
                >
                  Formule
                </label>
                <select
                  id="bookingFormula"
                  value={currentFormula?.id || ''}
                  onChange={(e) => setSelectedFormulaId(e.target.value)}
                  className="mt-2 h-11 w-full rounded-lg border border-white/15 bg-[#09090B] px-3.5 text-sm text-[#F5F2EB] focus:border-[#D4AF6A] focus:outline-none"
                >
                  {currentPrestation.formulas.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.label} — {formatFcfa(f.price)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#D4AF6A]/35 bg-[#D4AF6A]/10 px-5 py-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-200">
                Tarif total estimé
              </span>
              <strong className="font-display text-2xl font-semibold text-[#E7CA91]">
                {hasFixedPrice ? formatFcfa(currentFormula.price) : 'Sur devis'}
              </strong>
            </div>

            {isStudio && (
              <div className="mt-4 rounded-xl border border-white/10 bg-[#09090B]/70 px-4 py-3 text-xs text-stone-300">
                <strong className="text-[#E7CA91]">Shooting Studio à Yeumbeul, Dakar :</strong>{' '}
                séance réalisée au studio équipé à Yeumbeul. Aucun paiement en ligne sur le site.
              </div>
            )}

            {!hasFixedPrice && (
              <div className="mt-4 rounded-xl border border-white/10 bg-[#09090B]/70 px-4 py-3 text-xs text-stone-300">
                <strong className="text-[#E7CA91]">Formule sur devis :</strong> le tarif exact vous
                sera communiqué sous 24h sur WhatsApp selon le lieu, la durée et vos livrables.
              </div>
            )}
          </div>

          {/* ÉTAPE 02 */}
          <div className="rounded-2xl border border-white/12 bg-[#121217] p-6 sm:p-8">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#D4AF6A]/45 bg-[#D4AF6A]/10 font-mono text-xs font-semibold text-[#E7CA91]">
                02
              </span>
              <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">
                Date souhaitée &amp; coordonnées
              </h2>
            </div>

            {/* Calendrier accessible en français */}
            <div className="mt-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-300">
                  <Calendar className="h-4 w-4 text-[#D4AF6A]" aria-hidden="true" />
                  <span>Date souhaitée (12 prochains mois max)</span>
                </span>
                <span className="font-mono text-xs text-[#E7CA91]">
                  {selectedIso ? formatFrenchDate(selectedIso) : 'Aucune date sélectionnée'}
                </span>
              </div>

              <div
                role="region"
                aria-label="Calendrier des disponibilités"
                className="mt-3 rounded-xl border border-white/12 bg-[#09090B] p-4 sm:p-5"
              >
                <div className="flex items-center justify-between gap-4 pb-4">
                  <h3 className="font-display text-2xl font-semibold capitalize text-white">
                    {MONTHS_FR[viewMonth]} {viewYear}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={!canPrevMonth}
                      onClick={() => {
                        if (!canPrevMonth) return;
                        const d = new Date(viewYear, viewMonth - 1, 1);
                        setViewYear(d.getFullYear());
                        setViewMonth(d.getMonth());
                      }}
                      aria-label="Mois précédent"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white transition-colors hover:border-[#D4AF6A] disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      disabled={!canNextMonth}
                      onClick={() => {
                        if (!canNextMonth) return;
                        const d = new Date(viewYear, viewMonth + 1, 1);
                        setViewYear(d.getFullYear());
                        setViewMonth(d.getMonth());
                      }}
                      aria-label="Mois suivant"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white transition-colors hover:border-[#D4AF6A] disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div role="grid" aria-label={`${MONTHS_FR[viewMonth]} ${viewYear}`}>
                  <div role="row" className="grid grid-cols-7 gap-1.5 pb-2 text-center">
                    {WEEKDAY_SHORT.map((day) => (
                      <div
                        key={day}
                        role="columnheader"
                        className="font-mono text-[11px] font-medium uppercase tracking-wider text-stone-400"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1.5">
                    {calendarCells.map((cell) => {
                      if (!cell.date) {
                        return <div key={cell.iso} className="min-h-[44px]" aria-hidden="true" />;
                      }
                      const check = isDateDisabled(cell.date);
                      const isSelected = selectedIso === cell.iso;
                      const isUnavailable = check.reason === 'unavailable';
                      const isToday = cell.iso === todayIso;
                      return (
                        <button
                          key={cell.iso}
                          type="button"
                          role="gridcell"
                          disabled={check.disabled}
                          aria-selected={isSelected}
                          aria-disabled={check.disabled}
                          aria-label={
                            check.reason === 'unavailable'
                              ? `${formatFrenchDate(cell.iso)} — Date indisponible`
                              : isToday
                                ? `${formatFrenchDate(cell.iso)} (Aujourd’hui)`
                                : formatFrenchDate(cell.iso)
                          }
                          onClick={() => cell.date && handleSelectDate(cell.date)}
                          className={`relative flex min-h-[44px] items-center justify-center rounded-lg border font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF6A] ${
                            isSelected
                              ? 'border-[#D4AF6A] bg-[#D4AF6A] font-semibold text-[#0B0A09]'
                              : isUnavailable
                                ? 'cursor-not-allowed border-white/5 bg-white/[0.02] text-stone-600 line-through'
                                : check.disabled
                                  ? 'cursor-not-allowed border-transparent text-stone-700'
                                  : isToday
                                    ? 'border-[#D4AF6A]/60 bg-[#D4AF6A]/10 text-[#E7CA91] hover:border-[#D4AF6A]'
                                    : 'border-white/10 bg-white/[0.04] text-[#F5F2EB] hover:border-[#D4AF6A]/65 hover:text-[#E7CA91]'
                          }`}
                        >
                          {cell.dayNum}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3 text-[11px] text-stone-400">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm border border-white/25 bg-white/10" />
                      Libre
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm bg-[#D4AF6A]" />
                      Sélectionnée
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm bg-white/5 line-through" />
                      Indisponible
                    </span>
                  </div>
                  <span>
                    Une date libre est confirmée après réponse de DIONTADO PRODUCTION sur WhatsApp.
                  </span>
                </div>
                <p className="sr-only" aria-live="polite" aria-atomic="true">
                  {srStatus}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="bookingTime"
                  className="block text-xs font-semibold uppercase tracking-wider text-stone-300"
                >
                  Créneau souhaité
                </label>
                <select
                  id="bookingTime"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="mt-2 h-11 w-full rounded-lg border border-white/15 bg-[#09090B] px-3.5 text-sm text-[#F5F2EB] focus:border-[#D4AF6A] focus:outline-none"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="bookingLocation"
                  className="block text-xs font-semibold uppercase tracking-wider text-stone-300"
                >
                  Lieu de la prestation
                </label>
                <input
                  id="bookingLocation"
                  type="text"
                  value={isStudio ? 'Studio Yeumbeul, Dakar' : location}
                  readOnly={isStudio}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex. Dakar, Almadies, Yeumbeul..."
                  className="mt-2 h-11 w-full rounded-lg border border-white/15 bg-[#09090B] px-3.5 text-sm text-[#F5F2EB] placeholder:text-stone-500 focus:border-[#D4AF6A] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="bookingPeople"
                  className="block text-xs font-semibold uppercase tracking-wider text-stone-300"
                >
                  Nombre de personnes
                </label>
                <input
                  id="bookingPeople"
                  type="text"
                  value={peopleCount}
                  onChange={(e) => setPeopleCount(e.target.value)}
                  placeholder="Ex. 1 personne, couple, 150 invités..."
                  className="mt-2 h-11 w-full rounded-lg border border-white/15 bg-[#09090B] px-3.5 text-sm text-[#F5F2EB] placeholder:text-stone-500 focus:border-[#D4AF6A] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="bookingName"
                  className="block text-xs font-semibold uppercase tracking-wider text-stone-300"
                >
                  Nom complet *
                </label>
                <input
                  id="bookingName"
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Votre prénom et nom"
                  className="mt-2 h-11 w-full rounded-lg border border-white/15 bg-[#09090B] px-3.5 text-sm text-[#F5F2EB] placeholder:text-stone-500 focus:border-[#D4AF6A] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="bookingPhone"
                  className="block text-xs font-semibold uppercase tracking-wider text-stone-300"
                >
                  Téléphone / WhatsApp *
                </label>
                <input
                  id="bookingPhone"
                  type="tel"
                  required
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+221 7X XXX XX XX"
                  className="mt-2 h-11 w-full rounded-lg border border-white/15 bg-[#09090B] px-3.5 text-sm text-[#F5F2EB] placeholder:text-stone-500 focus:border-[#D4AF6A] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="bookingEmail"
                  className="block text-xs font-semibold uppercase tracking-wider text-stone-300"
                >
                  Email (optionnel)
                </label>
                <input
                  id="bookingEmail"
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  className="mt-2 h-11 w-full rounded-lg border border-white/15 bg-[#09090B] px-3.5 text-sm text-[#F5F2EB] placeholder:text-stone-500 focus:border-[#D4AF6A] focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-5">
              <label
                htmlFor="bookingDetails"
                className="block text-xs font-semibold uppercase tracking-wider text-stone-300"
              >
                Précisions sur votre projet (optionnel)
              </label>
              <textarea
                id="bookingDetails"
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Ambiance souhaitée, déroulé, lieu précis ou questions..."
                className="mt-2 w-full rounded-lg border border-white/15 bg-[#09090B] p-3.5 text-sm text-[#F5F2EB] placeholder:text-stone-500 focus:border-[#D4AF6A] focus:outline-none"
              />
            </div>
          </div>

          {/* ÉTAPE 03 */}
          <div className="rounded-2xl border border-white/12 bg-[#121217] p-6 sm:p-8">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#D4AF6A]/45 bg-[#D4AF6A]/10 font-mono text-xs font-semibold text-[#E7CA91]">
                03
              </span>
              <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">
                Envoi sur WhatsApp
              </h2>
            </div>

            <div className="mt-6 rounded-xl border border-white/10 bg-[#09090B] p-5 text-sm text-stone-200">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                <span className="font-mono text-xs uppercase tracking-wider text-stone-400">
                  Récapitulatif
                </span>
                <span className="font-mono text-xs font-semibold text-[#E7CA91]">
                  {refCode}
                </span>
              </div>
              <dl className="mt-4 grid gap-2 text-xs sm:grid-cols-2 sm:text-sm">
                <div>
                  <dt className="text-stone-400">Prestation</dt>
                  <dd className="font-medium text-white">{currentPrestation.value}</dd>
                </div>
                <div>
                  <dt className="text-stone-400">Formule &amp; tarif</dt>
                  <dd className="font-medium text-[#E7CA91]">
                    {currentFormula?.label} ·{' '}
                    {hasFixedPrice ? formatFcfa(currentFormula.price) : 'Sur devis'}
                  </dd>
                </div>
                <div>
                  <dt className="text-stone-400">Date &amp; créneau</dt>
                  <dd className="font-medium text-white">
                    {selectedIso ? formatFrenchDate(selectedIso) : 'À sélectionner'} · {timeSlot}
                  </dd>
                </div>
                <div>
                  <dt className="text-stone-400">Lieu</dt>
                  <dd className="font-medium text-white">
                    {isStudio ? 'Studio Yeumbeul, Dakar' : location.trim() || 'À préciser'}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="mt-5 flex items-start gap-3">
              <input
                id="bookingAcceptConditions"
                type="checkbox"
                checked={acceptedConditions}
                onChange={(e) => setAcceptedConditions(e.target.checked)}
                className="mt-1 h-5 w-5 rounded border-white/30 bg-[#09090B] accent-[#D4AF6A]"
              />
              <label htmlFor="bookingAcceptConditions" className="text-xs leading-relaxed text-stone-200 sm:text-sm">
                J’ai lu les{' '}
                <button
                  type="button"
                  onClick={() => setShowConditionsModal(true)}
                  className="font-semibold text-[#E7CA91] underline underline-offset-4 hover:text-white"
                >
                  conditions de réservation
                </button>
                .
              </label>
            </div>

            {feedback && (
              <div
                role="status"
                className={`mt-5 rounded-lg border px-4 py-3 text-xs sm:text-sm ${
                  feedback.type === 'error'
                    ? 'border-red-500/40 bg-red-950/40 text-red-200'
                    : 'border-[#D4AF6A]/45 bg-[#D4AF6A]/10 text-[#E7CA91]'
                }`}
              >
                <p>{feedback.message}</p>
                {feedback.type === 'success' && readyWhatsappUrl && (
                  <div className="mt-3">
                    <a
                      href={readyWhatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-9 items-center gap-2 rounded-md bg-[#1F7A4C] px-4 text-xs font-semibold text-white transition-colors hover:bg-[#258D58]"
                    >
                      <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Ouvrir WhatsApp</span>
                    </a>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-lg bg-[#D4AF6A] px-6 text-xs font-semibold uppercase tracking-wider text-[#0B0A09] transition-colors hover:bg-[#E7CA91]"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                <span>Envoyer ma demande sur WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={handleCopySummary}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg border border-white/20 px-5 text-xs font-semibold text-white transition-colors hover:border-[#D4AF6A] hover:text-[#E7CA91]"
              >
                {copiedSummary ? (
                  <Check className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
                <span>{copiedSummary ? 'Copié' : 'Copier'}</span>
              </button>
              <button
                type="button"
                onClick={handleSendEmail}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg border border-white/20 px-5 text-xs font-semibold text-white transition-colors hover:border-[#D4AF6A] hover:text-[#E7CA91]"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                <span>Envoyer par e-mail</span>
              </button>
            </div>

            <p className="mt-4 text-center text-xs text-stone-400">
              Votre réservation est confirmée seulement après réponse de DIONTADO PRODUCTION sur WhatsApp.
            </p>
          </div>
        </form>
      </section>

      {/* Modal Conditions de réservation */}
      {showConditionsModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="conditionsTitle"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <div className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-white/15 bg-[#121217] p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#D4AF6A]">
                  DIONTADO PRODUCTION
                </p>
                <h2 id="conditionsTitle" className="mt-1 font-display text-2xl font-semibold text-white">
                  Conditions de réservation
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowConditionsModal(false)}
                aria-label="Fermer les conditions"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-stone-300 hover:border-[#D4AF6A] hover:text-white"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <ul className="mt-5 space-y-4 text-sm leading-relaxed text-stone-300">
              <li>
                <strong className="text-white">Délai de confirmation :</strong>{' '}
                toute demande envoyée via le formulaire ou WhatsApp est confirmée uniquement après réponse de DIONTADO PRODUCTION.
              </li>
              <li>
                <strong className="text-white">Annulation ou report :</strong>{' '}
                merci de prévenir le studio au plus tôt sur WhatsApp (+221 76 481 23 91) afin de réorganiser votre séance selon les disponibilités.
              </li>
              <li>
                <strong className="text-white">Absence ou retard :</strong>{' '}
                en cas d’imprévu le jour convenu, contactez directement le studio par téléphone ou WhatsApp avant l’heure du rendez-vous.
              </li>
              <li>
                <strong className="text-white">Date indisponible :</strong>{' '}
                les dates affichées barrées ne sont plus disponibles ; en cas d’indisponibilité exceptionnelle, un nouveau créneau vous est proposé.
              </li>
            </ul>

            <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={() => {
                  setAcceptedConditions(true);
                  setShowConditionsModal(false);
                }}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#D4AF6A] px-5 text-xs font-semibold uppercase tracking-wider text-[#0B0A09] hover:bg-[#E7CA91]"
              >
                <Check className="h-4 w-4" aria-hidden="true" />
                <span>Accepter et fermer</span>
              </button>
              <button
                type="button"
                onClick={() => setShowConditionsModal(false)}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-white/20 px-4 text-xs font-semibold text-white hover:border-[#D4AF6A]"
              >
                <FileText className="h-4 w-4" aria-hidden="true" />
                <span>Fermer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
