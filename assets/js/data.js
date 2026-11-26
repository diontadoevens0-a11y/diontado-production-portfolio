/* ==========================================================================
   DIONTADO PRODUCTION — CONFIGURATION & DONNÉES CENTRALISÉES
   Modifiez BASE_PATH et SITE_ORIGIN ici lors du passage à un nom de domaine.
   ========================================================================== */
(function () {
  var BASE_PATH = '/diontado-production-portfolio';
  var SITE_ORIGIN = 'https://diontadoevens0-a11y.github.io';

  window.DIONTADO_CONFIG = {
    BASE_PATH: BASE_PATH,
    SITE_ORIGIN: SITE_ORIGIN,
    MEDIA_BASE: BASE_PATH + '/',
    WHATSAPP_NUMBER: '221764812391',
    WHATSAPP_URL: 'https://wa.me/221764812391?text=Bonjour%20DIONTADO%20PRODUCTION%2C%20je%20souhaite%20r%C3%A9server%20une%20prestation.',
    EMAIL_USER: 'diontadoproduction',
    EMAIL_DOMAIN: 'gmail.com'
  };

  /* Catégories vidéo officielles */
  var VIDEO_CATEGORIES = [
    'Toutes',
    'Films institutionnels',
    'Événementiel',
    'Mariage',
    'Clips et créations artistiques',
    'Reportages'
  ];

  /* Catalogue vidéo réel */
  var VIDEO_ITEMS = [
    {
      id: 'vid-showreel',
      sourceType: 'youtube',
      youtubeId: 'VDhh9Q0c_MI',
      posterAsset: 'cover.jpg',
      category: 'Films institutionnels',
      title: 'Showreel Officiel — DIONTADO PRODUCTION',
      desc: 'Sélection cinématographique de notre portfolio audiovisuel, films de marque et portraits en mouvement.',
      isShowreel: true
    },
    {
      id: 'vid-culture',
      sourceType: 'youtube',
      youtubeId: 'OJrbnH9zgLE',
      posterUrl: 'https://i.ytimg.com/vi/OJrbnH9zgLE/hqdefault.jpg',
      category: 'Reportages',
      title: 'Reportage Culturel — Sénégal',
      desc: 'Immersion documentaire au cœur des expressions artistiques, des traditions et des visages du Sénégal.'
    },
    {
      id: 'vid-studio',
      sourceType: 'youtube',
      youtubeId: 'tSglYbBoufg',
      posterUrl: 'https://i.ytimg.com/vi/tSglYbBoufg/hqdefault.jpg',
      category: 'Clips et créations artistiques',
      title: 'Direction Artistique & Création Visuelle',
      desc: 'Mise en lumière cinéma, cadre et étalonnage sur mesure pour artistes, créateurs et marques.'
    }
  ];

  /* 5 univers photographiques actifs (/realisations/<slug>/) */
  var PHOTO_CATEGORIES = [
    {
      slug: 'prewedding',
      title: 'PREWEDDING',
      folderMatch: 'Prewedding',
      subtitle: 'Complicité & Lumière Naturelle',
      description: 'Séances de couple mises en scène dans des décors choisis au Sénégal, capturant la tendresse et l’émotion avant le grand jour.',
      coverFile: 'mariage-01.jpg',
      gradientClass: 'cat-card-bg--gradient-prewedding',
      prestationValue: 'Prewedding & Séance Couple'
    },
    {
      slug: 'portrait',
      title: 'PORTRAIT',
      folderMatch: 'Portrait',
      subtitle: 'Regard, Caractère & Présence',
      description: 'Portraits éditoriaux et artistiques réalisés avec une attention particulière portée à l’expression, aux textures et à la lumière.',
      coverFile: 'portrait-01.jpg',
      prestationValue: 'Photographie — Portrait & Studio'
    },
    {
      slug: 'culture',
      title: 'CULTURE',
      folderMatch: 'Culture',
      subtitle: 'Patrimoine, Arts & Expressions',
      description: 'Immersion documentaire et artistique au cœur de la richesse culturelle sénégalaise, des scènes et des traditions vivantes.',
      coverFile: 'culture-01.jpg',
      prestationValue: 'Reportage Culturel & Documentaire'
    },
    {
      slug: 'studio',
      title: 'STUDIO',
      folderMatch: 'Studio',
      subtitle: 'Lumières Maîtrisées & Créations',
      description: 'Prises de vue studio haute précision avec façonnage lumineux sur mesure pour artistes, portraits et marques.',
      coverFile: 'publicite-01.jpg',
      prestationValue: 'Shooting Studio'
    },
    {
      slug: 'exterieur',
      title: 'EXTÉRIEUR',
      folderMatch: 'Extérieur',
      subtitle: 'Architecture, Littoral & Paysages',
      description: 'Séances en lumière naturelle captées dans des décors ouverts, urbains ou côtiers au Sénégal.',
      coverFile: 'publicite-06.jpg',
      prestationValue: 'Photographie — Portrait & Studio'
    },
    {
      slug: 'soutenance',
      title: 'SOUTENANCE',
      folderMatch: 'Soutenance',
      subtitle: 'Accomplissement Académique & Fierté',
      description: 'Immortalisation de votre soutenance de mémoire, thèse ou remise de diplôme : discours devant le jury, portraits en toge et moments d’émotion en famille.',
      coverFile: 'cover.jpg',
      gradientClass: 'cat-card-bg--gradient-soutenance',
      targetHref: BASE_PATH + '/realisations/soutenance/',
      ctaLabel: 'Ouvrir la galerie →',
      prestationValue: 'Soutenance & Remise de diplôme'
    },
    {
      slug: 'mariage',
      title: 'MARIAGE',
      folderMatch: 'Mariage',
      subtitle: 'Cérémonies, Émotion & Tradition',
      description: 'Des préparatifs à la réception : cérémonies traditionnelles, henné, mariages civils et religieux capturés avec élégance et authenticité.',
      coverFile: 'cover.jpg',
      gradientClass: 'cat-card-bg--gradient-mariage',
      targetHref: BASE_PATH + '/realisations/mariage/',
      ctaLabel: 'Ouvrir la galerie →',
      prestationValue: 'Mariage & Cérémonie (Photo / Vidéo)'
    },
    {
      slug: 'evenement',
      title: 'ÉVÉNEMENT',
      folderMatch: 'Événementiel',
      subtitle: 'Galas, Conférences & Réceptions',
      description: 'Couverture complète de vos événements privés, baptêmes, galas, séminaires et célébrations officielles au Sénégal.',
      coverFile: 'cover.jpg',
      gradientClass: 'cat-card-bg--gradient-evenementiel',
      targetHref: BASE_PATH + '/realisations/evenement/',
      ctaLabel: 'Ouvrir la galerie →',
      prestationValue: 'Événementiel (Photo & Vidéo)'
    }
  ];

  /* Photographies du portfolio */
  var GALLERY_PHOTOS = [
    { file: 'culture-01.jpg', category: 'Culture', title: 'Culture — Série 01', alt: 'Photographie Culture à Dakar — DIONTADO PRODUCTION, série 01' },
    { file: 'culture-02.jpg', category: 'Culture', title: 'Culture — Série 02', alt: 'Photographie Culture à Dakar — DIONTADO PRODUCTION, série 02' },
    { file: 'culture-03.jpg', category: 'Culture', title: 'Culture — Série 03', alt: 'Photographie Culture à Dakar — DIONTADO PRODUCTION, série 03' },
    { file: 'culture-04.jpg', category: 'Culture', title: 'Culture — Série 04', alt: 'Photographie Culture à Dakar — DIONTADO PRODUCTION, série 04' },
    { file: 'culture-05.jpg', category: 'Culture', title: 'Culture — Série 05', alt: 'Photographie Culture à Dakar — DIONTADO PRODUCTION, série 05' },
    { file: 'culture-06.jpg', category: 'Culture', title: 'Culture — Série 06', alt: 'Photographie Culture à Dakar — DIONTADO PRODUCTION, série 06' },
    { file: 'mariage-01.jpg', category: 'Prewedding', title: 'Prewedding — Série 01', alt: 'Photographie Prewedding à Dakar — DIONTADO PRODUCTION, série 01' },
    { file: 'portrait-01.jpg', category: 'Portrait', title: 'Portrait — Série 01', alt: 'Photographie Portrait à Dakar — DIONTADO PRODUCTION, série 01' },
    { file: 'portrait-02.jpg', category: 'Portrait', title: 'Portrait — Série 02', alt: 'Photographie Portrait à Dakar — DIONTADO PRODUCTION, série 02' },
    { file: 'portrait-03.jpg', category: 'Portrait', title: 'Portrait — Série 03', alt: 'Photographie Portrait à Dakar — DIONTADO PRODUCTION, série 03' },
    { file: 'portrait-04.jpg', category: 'Portrait', title: 'Portrait — Série 04', alt: 'Photographie Portrait à Dakar — DIONTADO PRODUCTION, série 04' },
    { file: 'portrait-05.jpg', category: 'Portrait', title: 'Portrait — Série 05', alt: 'Photographie Portrait à Dakar — DIONTADO PRODUCTION, série 05' },
    { file: 'portrait-06.jpg', category: 'Portrait', title: 'Portrait — Série 06', alt: 'Photographie Portrait à Dakar — DIONTADO PRODUCTION, série 06' },
    { file: 'publicite-01.jpg', category: 'Studio', title: 'Studio — Série 01', alt: 'Photographie Studio à Dakar — DIONTADO PRODUCTION, série 01' },
    { file: 'publicite-02.jpg', category: 'Studio', title: 'Studio — Série 02', alt: 'Photographie Studio à Dakar — DIONTADO PRODUCTION, série 02' },
    { file: 'publicite-03.jpg', category: 'Studio', title: 'Studio — Série 03', alt: 'Photographie Studio à Dakar — DIONTADO PRODUCTION, série 03' },
    { file: 'publicite-04.jpg', category: 'Studio', title: 'Studio — Série 04', alt: 'Photographie Studio à Dakar — DIONTADO PRODUCTION, série 04' },
    { file: 'publicite-05.jpg', category: 'Studio', title: 'Studio — Série 05', alt: 'Photographie Studio à Dakar — DIONTADO PRODUCTION, série 05' },
    { file: 'publicite-06.jpg', category: 'Extérieur', title: 'Extérieur — Série 01', alt: 'Photographie Extérieur à Dakar — DIONTADO PRODUCTION, série 01' }
  ];

  var HERO_FEATURED_FILES = [
    { file: 'culture-01.jpg', alt: 'Photographie Culture à Dakar — DIONTADO PRODUCTION, série 01' },
    { file: 'mariage-01.jpg', alt: 'Photographie Prewedding à Dakar — DIONTADO PRODUCTION, série 01' },
    { file: 'portrait-01.jpg', alt: 'Photographie Portrait à Dakar — DIONTADO PRODUCTION, série 01' },
    { file: 'publicite-01.jpg', alt: 'Photographie Studio à Dakar — DIONTADO PRODUCTION, série 01' },
    { file: 'publicite-06.jpg', alt: 'Photographie Extérieur à Dakar — DIONTADO PRODUCTION, série 01' }
  ];

  /* Grille tarifaire officielle (FCFA) */
  var TARIFS_CATALOG = [
    {
      id: 'tarif-photo-portrait',
      category: 'Photographie',
      number: '01',
      title: 'Shooting portrait',
      priceLabel: 'Dès 6\u00A0000\u00A0FCFA',
      description: 'Séances dirigées en studio, à domicile ou en extérieur avec retouche professionnelle soignée.',
      tiers: [
        { label: 'Studio · 3 Photos', price: '6\u00A0000\u00A0FCFA' },
        { label: 'Studio · 6 Photos', price: '10\u00A0000\u00A0FCFA' },
        { label: 'À domicile · 5 Photos', price: '15\u00A0000\u00A0FCFA' },
        { label: 'À domicile · 10 Photos', price: '25\u00A0000\u00A0FCFA' },
        { label: 'Extérieur · 5 Photos', price: '25\u00A0000\u00A0FCFA' },
        { label: 'Extérieur · 10 Photos', price: '40\u00A0000\u00A0FCFA' }
      ],
      prestationValue: 'Photographie — Portrait & Studio',
      defaultFormulaId: 'portrait-studio-3'
    },
    {
      id: 'tarif-photo-evenementiel',
      category: 'Photographie',
      number: '02',
      title: 'Événementiel',
      priceLabel: 'Dès 50\u00A0000\u00A0FCFA',
      description: 'Forfaits photos numériques haute définition pour réceptions, conférences, galas, baptêmes et événements.',
      tiers: [
        { label: '40 photos numériques', price: '50\u00A0000\u00A0FCFA' },
        { label: '50 photos numériques', price: '70\u00A0000\u00A0FCFA' },
        { label: '80 photos numériques', price: '100\u00A0000\u00A0FCFA' },
        { label: '100 photos numériques', price: '120\u00A0000\u00A0FCFA' }
      ],
      prestationValue: 'Événementiel (Photo & Vidéo)',
      defaultFormulaId: 'event-num-40'
    },
    {
      id: 'tarif-photo-mariage',
      category: 'Photographie',
      number: '03',
      title: 'Mariage',
      priceLabel: 'Dès 90\u00A0000\u00A0FCFA',
      description: 'Albums photo imprimés haut de gamme et formules combinées Album + Photos numériques.',
      tiers: [
        { label: 'Album de 60 photos', price: '90\u00A0000\u00A0FCFA' },
        { label: 'Album de 80 photos', price: '120\u00A0000\u00A0FCFA' },
        { label: 'Album de 100 photos', price: '140\u00A0000\u00A0FCFA' },
        { label: '50 num. + Album 60 photos', price: '130\u00A0000\u00A0FCFA' },
        { label: '80 num. + Album 80 photos', price: '190\u00A0000\u00A0FCFA' },
        { label: '100 num. + Album 100 photos', price: '230\u00A0000\u00A0FCFA' }
      ],
      prestationValue: 'Mariage & Cérémonie (Photo / Vidéo)',
      defaultFormulaId: 'mar-alb-60'
    },
    {
      id: 'tarif-photo-prewedding',
      category: 'Photographie',
      number: '04',
      title: 'Prewedding',
      priceLabel: 'Sur devis',
      description: 'Séance couple mise en scène en extérieur ou dans un décor choisi avant le grand jour.',
      note: 'Séances Extérieur disponibles dès 25\u00A0000\u00A0FCFA (5 photos) et 40\u00A0000\u00A0FCFA (10 photos), ou pack sur mesure.',
      prestationValue: 'Prewedding & Séance Couple',
      defaultFormulaId: 'prew-ext-5'
    },
    {
      id: 'tarif-photo-soutenance',
      category: 'Photographie',
      number: '05',
      title: 'Soutenance',
      priceLabel: 'Sur devis',
      description: 'Immortalisation de votre soutenance de mémoire, thèse ou remise de diplôme : passage devant le jury et portraits officiels.',
      note: 'Formules portrait studio (dès 6\u00A0000\u00A0FCFA) ou reportage numérique complet (dès 50\u00A0000\u00A0FCFA) adaptables.',
      prestationValue: 'Soutenance & Remise de diplôme',
      defaultFormulaId: 'sout-num-40'
    },
    {
      id: 'tarif-photo-pro',
      category: 'Photographie',
      number: '06',
      title: 'Photographie professionnelle',
      priceLabel: 'Sur devis',
      description: 'Portraits corporate, reportages d’entreprise, campagnes de communication et valorisation de votre savoir-faire.',
      prestationValue: 'Photographie professionnelle',
      defaultFormulaId: 'pro-custom'
    },
    {
      id: 'tarif-video-mariage',
      category: 'Réalisation vidéo',
      number: '01',
      title: 'Film de mariage',
      priceLabel: 'Dès 70\u00A0000\u00A0FCFA',
      description: 'Captation cinématographique complète des cérémonies traditionnelles, Henné Time et réception, montage inclus.',
      tiers: [
        { label: 'Henné Time', price: '70\u00A0000\u00A0FCFA' },
        { label: 'Réception', price: '85\u00A0000\u00A0FCFA' },
        { label: 'Henné Time + Réception (Mariage)', price: '130\u00A0000\u00A0FCFA' }
      ],
      prestationValue: 'Mariage & Cérémonie (Photo / Vidéo)',
      defaultFormulaId: 'mar-vid-henne'
    },
    {
      id: 'tarif-video-evenementiel',
      category: 'Réalisation vidéo',
      number: '02',
      title: 'Vidéo événementielle',
      priceLabel: 'Dès 70\u00A0000\u00A0FCFA',
      description: 'Captation et montage rythmé de vos cérémonies familiales, baptêmes, réceptions et temps forts.',
      tiers: [
        { label: 'Baptême', price: '70\u00A0000\u00A0FCFA' },
        { label: 'Réception / Événement', price: '85\u00A0000\u00A0FCFA' }
      ],
      prestationValue: 'Événementiel (Photo & Vidéo)',
      defaultFormulaId: 'event-vid-bapteme'
    },
    {
      id: 'tarif-video-reportage',
      category: 'Réalisation vidéo',
      number: '03',
      title: 'Reportage',
      priceLabel: 'Sur devis',
      description: 'Immersion documentaire sur le terrain, entretiens et narration authentique dédiée aux cultures et récits humains.',
      prestationValue: 'Reportage Culturel & Documentaire',
      defaultFormulaId: 'rep-custom'
    },
    {
      id: 'tarif-video-institutionnel',
      category: 'Réalisation vidéo',
      number: '04',
      title: 'Film institutionnel',
      priceLabel: 'Sur devis',
      description: 'Film corporate de présentation pour entreprises, institutions, ONG et marques souhaitant affirmer leur image.',
      prestationValue: 'Film Institutionnel & Production Audiovisuelle',
      defaultFormulaId: 'inst-custom'
    },
    {
      id: 'tarif-video-production',
      category: 'Réalisation vidéo',
      number: '05',
      title: 'Production audiovisuelle',
      priceLabel: 'Sur devis',
      description: 'Accompagnement complet de l’écriture à l’étalonnage cinéma : clips artistiques, campagnes visuelles et projets sur mesure.',
      prestationValue: 'Réalisation vidéo',
      defaultFormulaId: 'vid-custom'
    }
  ];

  /* Catalogue de réservation officiel (sans paiement en ligne) */
  var BOOKING_PRESTATIONS = [
    {
      value: 'Shooting Studio',
      label: 'Shooting Studio (dès 6\u00A0000\u00A0FCFA)',
      isStudio: true,
      formulas: [
        { id: 'studio-3', label: 'Shooting Studio · 3 Photos', price: 6000 },
        { id: 'studio-6', label: 'Shooting Studio · 6 Photos', price: 10000 },
        { id: 'studio-custom', label: 'Shooting Studio · Formule sur mesure', price: null }
      ]
    },
    {
      value: 'Photographie — Portrait & Studio',
      label: 'Shooting portrait (Studio, Domicile, Extérieur · dès 6\u00A0000\u00A0FCFA)',
      formulas: [
        { id: 'portrait-studio-3', label: 'Studio · 3 Photos', price: 6000, isStudio: true },
        { id: 'portrait-studio-6', label: 'Studio · 6 Photos', price: 10000, isStudio: true },
        { id: 'portrait-dom-5', label: 'À domicile · 5 Photos', price: 15000 },
        { id: 'portrait-dom-10', label: 'À domicile · 10 Photos', price: 25000 },
        { id: 'portrait-ext-5', label: 'Extérieur · 5 Photos', price: 25000 },
        { id: 'portrait-ext-10', label: 'Extérieur · 10 Photos', price: 40000 }
      ]
    },
    {
      value: 'Prewedding & Séance Couple',
      label: 'Prewedding & Séance Couple',
      formulas: [
        { id: 'prew-ext-5', label: 'Séance Extérieur · 5 Photos', price: 25000 },
        { id: 'prew-ext-10', label: 'Séance Extérieur · 10 Photos', price: 40000 },
        { id: 'prew-custom', label: 'Pack Prewedding sur mesure', price: null }
      ]
    },
    {
      value: 'Mariage & Cérémonie (Photo / Vidéo)',
      label: 'Mariage & Cérémonie (Photo dès 90\u00A0000\u00A0FCFA · Vidéo dès 70\u00A0000\u00A0FCFA)',
      formulas: [
        { id: 'mar-alb-60', label: 'Photo · Album de 60 photos', price: 90000 },
        { id: 'mar-alb-80', label: 'Photo · Album de 80 photos', price: 120000 },
        { id: 'mar-alb-100', label: 'Photo · Album de 100 photos', price: 140000 },
        { id: 'mar-combo-50-60', label: 'Photo · 50 num. + Album 60 photos', price: 130000 },
        { id: 'mar-combo-80-80', label: 'Photo · 80 num. + Album 80 photos', price: 190000 },
        { id: 'mar-combo-100-100', label: 'Photo · 100 num. + Album 100 photos', price: 230000 },
        { id: 'mar-vid-henne', label: 'Vidéo · Henné Time', price: 70000 },
        { id: 'mar-vid-reception', label: 'Vidéo · Réception', price: 85000 },
        { id: 'mar-vid-complet', label: 'Vidéo · Henné Time + Réception (Mariage)', price: 130000 },
        { id: 'mar-custom', label: 'Pack Photo + Vidéo sur mesure', price: null }
      ]
    },
    {
      value: 'Événementiel (Photo & Vidéo)',
      label: 'Événementiel (Photo dès 50\u00A0000\u00A0FCFA · Vidéo dès 70\u00A0000\u00A0FCFA)',
      formulas: [
        { id: 'event-num-40', label: 'Photo · 40 photos numériques', price: 50000 },
        { id: 'event-num-50', label: 'Photo · 50 photos numériques', price: 70000 },
        { id: 'event-num-80', label: 'Photo · 80 photos numériques', price: 100000 },
        { id: 'event-num-100', label: 'Photo · 100 photos numériques', price: 120000 },
        { id: 'event-vid-bapteme', label: 'Vidéo · Baptême', price: 70000 },
        { id: 'event-vid-reception', label: 'Vidéo · Réception / Événement', price: 85000 },
        { id: 'event-custom', label: 'Couverture événementielle sur mesure', price: null }
      ]
    },
    {
      value: 'Soutenance & Remise de diplôme',
      label: 'Soutenance & Remise de diplôme',
      formulas: [
        { id: 'sout-studio-3', label: 'Portrait Studio · 3 Photos', price: 6000, isStudio: true },
        { id: 'sout-studio-6', label: 'Portrait Studio · 6 Photos', price: 10000, isStudio: true },
        { id: 'sout-num-40', label: 'Reportage · 40 photos numériques', price: 50000 },
        { id: 'sout-custom', label: 'Couverture soutenance sur mesure', price: null }
      ]
    },
    {
      value: 'Photographie professionnelle',
      label: 'Photographie professionnelle (Corporate & Marque)',
      formulas: [
        { id: 'pro-custom', label: 'Campagne, corporate ou portrait sur mesure', price: null }
      ]
    },
    {
      value: 'Reportage Culturel & Documentaire',
      label: 'Reportage Culturel & Documentaire',
      formulas: [
        { id: 'rep-custom', label: 'Reportage photo et/ou vidéo sur mesure', price: null }
      ]
    },
    {
      value: 'Film Institutionnel & Production Audiovisuelle',
      label: 'Film Institutionnel & Production Audiovisuelle',
      formulas: [
        { id: 'inst-custom', label: 'Film corporate ou institutionnel sur mesure', price: null }
      ]
    },
    {
      value: 'Réalisation vidéo',
      label: 'Réalisation vidéo (Clip artistique & Production)',
      formulas: [
        { id: 'vid-custom', label: 'Clip, court-métrage ou production sur mesure', price: null }
      ]
    }
  ];

  /* Témoignages clients réels uniquement (laisser vide tant que aucun avis vérifié n'est fourni) */
  var TEMOIGNAGES = [];

  window.DIONTADO_DATA = {
    VIDEO_CATEGORIES: VIDEO_CATEGORIES,
    VIDEO_ITEMS: VIDEO_ITEMS,
    PHOTO_CATEGORIES: PHOTO_CATEGORIES,
    GALLERY_PHOTOS: GALLERY_PHOTOS,
    HERO_FEATURED_FILES: HERO_FEATURED_FILES,
    TARIFS_CATALOG: TARIFS_CATALOG,
    BOOKING_PRESTATIONS: BOOKING_PRESTATIONS,
    TEMOIGNAGES: TEMOIGNAGES
  };
})();
