export interface BookingFormula {
  id: string;
  label: string;
  price: number | null;
  isStudio?: boolean;
}

export interface BookingPrestation {
  value: string;
  label: string;
  isStudio?: boolean;
  formulas: BookingFormula[];
}

export const BOOKING_PRESTATIONS: BookingPrestation[] = [
  {
    value: 'Shooting Studio',
    label: 'Shooting Studio (dès 6 000 FCFA)',
    isStudio: true,
    formulas: [
      {id: 'studio-3', label: 'Shooting Studio · 3 Photos', price: 6000},
      {id: 'studio-6', label: 'Shooting Studio · 6 Photos', price: 10000},
      {id: 'studio-custom', label: 'Shooting Studio · Formule sur mesure', price: null},
    ],
  },
  {
    value: 'Photographie — Portrait & Studio',
    label: 'Shooting portrait (Studio, Domicile, Extérieur · dès 6 000 FCFA)',
    formulas: [
      {id: 'portrait-studio-3', label: 'Studio · 3 Photos', price: 6000, isStudio: true},
      {id: 'portrait-studio-6', label: 'Studio · 6 Photos', price: 10000, isStudio: true},
      {id: 'portrait-dom-5', label: 'À domicile · 5 Photos', price: 15000},
      {id: 'portrait-dom-10', label: 'À domicile · 10 Photos', price: 25000},
      {id: 'portrait-ext-5', label: 'Extérieur · 5 Photos', price: 25000},
      {id: 'portrait-ext-10', label: 'Extérieur · 10 Photos', price: 40000},
    ],
  },
  {
    value: 'Prewedding & Séance Couple',
    label: 'Prewedding & Séance Couple',
    formulas: [
      {id: 'prew-ext-5', label: 'Séance Extérieur · 5 Photos', price: 25000},
      {id: 'prew-ext-10', label: 'Séance Extérieur · 10 Photos', price: 40000},
      {id: 'prew-custom', label: 'Pack Prewedding sur mesure', price: null},
    ],
  },
  {
    value: 'Mariage & Cérémonie (Photo / Vidéo)',
    label: 'Mariage & Cérémonie (Photo dès 90 000 FCFA · Vidéo dès 70 000 FCFA)',
    formulas: [
      {id: 'mar-alb-60', label: 'Photo · Album de 60 photos', price: 90000},
      {id: 'mar-alb-80', label: 'Photo · Album de 80 photos', price: 120000},
      {id: 'mar-alb-100', label: 'Photo · Album de 100 photos', price: 140000},
      {id: 'mar-combo-50-60', label: 'Photo · 50 num. + Album 60 photos', price: 130000},
      {id: 'mar-combo-80-80', label: 'Photo · 80 num. + Album 80 photos', price: 190000},
      {id: 'mar-combo-100-100', label: 'Photo · 100 num. + Album 100 photos', price: 230000},
      {id: 'mar-vid-henne', label: 'Vidéo · Henné Time', price: 70000},
      {id: 'mar-vid-reception', label: 'Vidéo · Réception', price: 85000},
      {id: 'mar-vid-complet', label: 'Vidéo · Henné Time + Réception (Mariage)', price: 130000},
      {id: 'mar-custom', label: 'Pack Photo + Vidéo sur mesure', price: null},
    ],
  },
  {
    value: 'Événementiel (Photo & Vidéo)',
    label: 'Événementiel (Photo dès 50 000 FCFA · Vidéo dès 70 000 FCFA)',
    formulas: [
      {id: 'event-num-40', label: 'Photo · 40 photos numériques', price: 50000},
      {id: 'event-num-50', label: 'Photo · 50 photos numériques', price: 70000},
      {id: 'event-num-80', label: 'Photo · 80 photos numériques', price: 100000},
      {id: 'event-num-100', label: 'Photo · 100 photos numériques', price: 120000},
      {id: 'event-vid-bapteme', label: 'Vidéo · Baptême', price: 70000},
      {id: 'event-vid-reception', label: 'Vidéo · Réception / Événement', price: 85000},
      {id: 'event-custom', label: 'Couverture événementielle sur mesure', price: null},
    ],
  },
  {
    value: 'Soutenance & Remise de diplôme',
    label: 'Soutenance & Remise de diplôme',
    formulas: [
      {id: 'sout-studio-3', label: 'Portrait Studio · 3 Photos', price: 6000, isStudio: true},
      {id: 'sout-studio-6', label: 'Portrait Studio · 6 Photos', price: 10000, isStudio: true},
      {id: 'sout-num-40', label: 'Reportage · 40 photos numériques', price: 50000},
      {id: 'sout-custom', label: 'Couverture soutenance sur mesure', price: null},
    ],
  },
  {
    value: 'Photographie professionnelle',
    label: 'Photographie professionnelle (Corporate & Marque)',
    formulas: [
      {id: 'pro-custom', label: 'Campagne, corporate ou portrait sur mesure', price: null},
    ],
  },
  {
    value: 'Reportage Culturel & Documentaire',
    label: 'Reportage Culturel & Documentaire',
    formulas: [
      {id: 'rep-custom', label: 'Reportage photo et/ou vidéo sur mesure', price: null},
    ],
  },
  {
    value: 'Film Institutionnel & Production Audiovisuelle',
    label: 'Film Institutionnel & Production Audiovisuelle',
    formulas: [
      {id: 'inst-custom', label: 'Film corporate ou institutionnel sur mesure', price: null},
    ],
  },
  {
    value: 'Réalisation vidéo',
    label: 'Réalisation vidéo (Clip artistique & Production)',
    formulas: [
      {id: 'vid-custom', label: 'Clip, court-métrage ou production sur mesure', price: null},
    ],
  },
];

export function formatFcfa(amount: number | null): string {
  if (amount == null || Number.isNaN(amount)) return 'Sur devis';
  const digits = Math.round(amount).toString();
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
  return `${grouped}\u00A0FCFA`;
}

export function generateBookingReference(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const charset = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let suffix = '';
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    const arr = new Uint32Array(4);
    window.crypto.getRandomValues(arr);
    for (let i = 0; i < 4; i++) {
      suffix += charset.charAt(arr[i] % charset.length);
    }
  } else {
    for (let i = 0; i < 4; i++) {
      suffix += charset.charAt(Math.floor(Math.random() * charset.length));
    }
  }
  return `DP-${yy}${mm}${dd}-${suffix}`;
}
