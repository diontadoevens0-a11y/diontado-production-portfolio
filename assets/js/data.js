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
    WAVE_PAYMENT_URL: 'https://pay.wave.com/m/M_sn_IFRIA2vMxg-6/c/sn/',
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
      desc: 'Sélection cinématographique de nos réalisations audiovisuelles, films de marque et portraits en mouvement.',
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

  /* 10 univers photographiques (/realisations/<slug>/) */
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
      slug: 'mariage',
      title: 'MARIAGE',
      folderMatch: 'Mariage',
      subtitle: 'Récits d’Union & Cérémonies',
      description: 'Couverture photographique et cinématographique complète des cérémonies traditionnelles, civiles et réceptions.',
      gradientClass: 'cat-card-bg--gradient-mariage',
      prestationValue: 'Mariage & Cérémonie (Photo / Vidéo)'
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
      slug: 'mode-beaute',
      title: 'MODE & BEAUTÉ',
      folderMatch: 'Mode & Beauté',
      subtitle: 'Direction Artistique & Campagnes',
      description: 'Séries mode, lookbooks créateurs, beauté et stylisme pensés comme de véritables éditoriaux visuels.',
      gradientClass: 'cat-card-bg--gradient-mode',
      prestationValue: 'Shooting Mode, Beauté & Marque'
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
      slug: 'evenementiel',
      title: 'ÉVÉNEMENTIEL',
      folderMatch: 'Événementiel',
      subtitle: 'Concerts, Galas & Conférences',
      description: 'Captation réactive et élégante de vos événements d’entreprise, festivals, lancements de produits et soirées de prestige.',
      gradientClass: 'cat-card-bg--gradient-evenementiel',
      prestationValue: 'Événementiel (Photo & Vidéo)'
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
      prestationValue: 'Photographie professionnelle'
    },
    {
      slug: 'soutenance',
      title: 'SOUTENANCE',
      folderMatch: 'Soutenance',
      subtitle: 'Accomplissement Académique & Fierté',
      description: 'Immortalisation de votre soutenance de mémoire, thèse ou remise de diplôme : discours devant le jury, portraits en toge et moments d’émotion en famille.',
      gradientClass: 'cat-card-bg--gradient-soutenance',
      prestationValue: 'Soutenance & Remise de diplôme'
    },
    {
      slug: 'photographie-professionnelle',
      title: 'PHOTOGRAPHIE PROFESSIONNELLE',
      folderMatch: 'Photographie professionnelle',
      subtitle: 'Image de Marque, Corporate & Dirigeants',
      description: 'Portraits corporate, reportages d’entreprise, campagnes de communication et valorisation des métiers avec une signature visuelle rigoureuse.',
      gradientClass: 'cat-card-bg--gradient-pro',
      prestationValue: 'Photographie professionnelle'
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
    { file: 'culture-01.jpg', alt: 'Photographie culturelle au Sénégal — DIONTADO PRODUCTION' },
    { file: 'mariage-01.jpg', alt: 'Séance prewedding à Dakar — DIONTADO PRODUCTION' },
    { file: 'portrait-01.jpg', alt: 'Portrait éditorial à Dakar — DIONTADO PRODUCTION' },
    { file: 'publicite-01.jpg', alt: 'Shooting studio à Dakar — DIONTADO PRODUCTION' },
    { file: 'publicite-06.jpg', alt: 'Séance photo en extérieur au Sénégal — DIONTADO PRODUCTION' }
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

  /* Prestations et formules pour le calculateur de réservation */
  var BOOKING_PRESTATIONS = [
    {
      prestation: 'Shooting Studio',
      formulas: [
        { id: 'studio-3', label: 'Shooting Studio · 3 Photos', priceAmount: 6000, currency: 'FCFA', photoCountLabel: '3 photos', isStudio: true },
        { id: 'studio-6', label: 'Shooting Studio · 6 Photos', priceAmount: 10000, currency: 'FCFA', photoCountLabel: '6 photos', isStudio: true },
        { id: 'studio-custom', label: 'Shooting Studio · Sur mesure', priceAmount: null, currency: 'FCFA', photoCountLabel: 'À définir', isStudio: true }
      ]
    },
    {
      prestation: 'Photographie — Portrait & Studio',
      formulas: [
        { id: 'portrait-studio-3', label: 'Shooting Studio · 3 Photos', priceAmount: 6000, currency: 'FCFA', photoCountLabel: '3 photos', isStudio: true },
        { id: 'portrait-studio-6', label: 'Shooting Studio · 6 Photos', priceAmount: 10000, currency: 'FCFA', photoCountLabel: '6 photos', isStudio: true },
        { id: 'portrait-domicile-5', label: 'À domicile · 5 Photos', priceAmount: 15000, currency: 'FCFA', photoCountLabel: '5 photos', isStudio: false },
        { id: 'portrait-domicile-10', label: 'À domicile · 10 Photos', priceAmount: 25000, currency: 'FCFA', photoCountLabel: '10 photos', isStudio: false },
        { id: 'portrait-ext-5', label: 'Extérieur · 5 Photos', priceAmount: 25000, currency: 'FCFA', photoCountLabel: '5 photos', isStudio: false },
        { id: 'portrait-ext-10', label: 'Extérieur · 10 Photos', priceAmount: 40000, currency: 'FCFA', photoCountLabel: '10 photos', isStudio: false }
      ]
    },
    {
      prestation: 'Événementiel (Photo & Vidéo)',
      formulas: [
        { id: 'event-num-40', label: 'Photos numériques · 40 photos', priceAmount: 50000, currency: 'FCFA', photoCountLabel: '40 photos numériques' },
        { id: 'event-num-50', label: 'Photos numériques · 50 photos', priceAmount: 70000, currency: 'FCFA', photoCountLabel: '50 photos numériques' },
        { id: 'event-num-80', label: 'Photos numériques · 80 photos', priceAmount: 100000, currency: 'FCFA', photoCountLabel: '80 photos numériques' },
        { id: 'event-num-100', label: 'Photos numériques · 100 photos', priceAmount: 120000, currency: 'FCFA', photoCountLabel: '100 photos numériques' },
        { id: 'event-vid-bapteme', label: 'Réalisation Vidéo · Baptême', priceAmount: 70000, currency: 'FCFA' },
        { id: 'event-vid-reception', label: 'Réalisation Vidéo · Réception / Événement', priceAmount: 85000, currency: 'FCFA' },
        { id: 'event-custom', label: 'Couverture Photo + Vidéo sur mesure', priceAmount: null, currency: 'FCFA' }
      ]
    },
    {
      prestation: 'Mariage & Cérémonie (Photo / Vidéo)',
      formulas: [
        { id: 'mar-alb-60', label: 'Album photo · 60 photos', priceAmount: 90000, currency: 'FCFA', photoCountLabel: 'Album de 60 photos' },
        { id: 'mar-alb-80', label: 'Album photo · 80 photos', priceAmount: 120000, currency: 'FCFA', photoCountLabel: 'Album de 80 photos' },
        { id: 'mar-alb-100', label: 'Album photo · 100 photos', priceAmount: 140000, currency: 'FCFA', photoCountLabel: 'Album de 100 photos' },
        { id: 'mar-combo-50-60', label: 'Album + Numérique · 50 num. + Album 60 photos', priceAmount: 130000, currency: 'FCFA', photoCountLabel: '50 photos numériques + Album 60 photos' },
        { id: 'mar-combo-80-80', label: 'Album + Numérique · 80 num. + Album 80 photos', priceAmount: 190000, currency: 'FCFA', photoCountLabel: '80 photos numériques + Album 80 photos' },
        { id: 'mar-combo-100-100', label: 'Album + Numérique · 100 num. + Album 100 photos', priceAmount: 230000, currency: 'FCFA', photoCountLabel: '100 photos numériques + Album 100 photos' },
        { id: 'mar-vid-henne', label: 'Réalisation Vidéo · Henné Time', priceAmount: 70000, currency: 'FCFA' },
        { id: 'mar-vid-reception', label: 'Réalisation Vidéo · Réception', priceAmount: 85000, currency: 'FCFA' },
        { id: 'mar-vid-complet', label: 'Réalisation Vidéo · Henné Time + Réception (Mariage)', priceAmount: 130000, currency: 'FCFA' },
        { id: 'mar-custom', label: 'Pack Photo + Vidéo Mariage sur mesure', priceAmount: null, currency: 'FCFA' }
      ]
    },
    {
      prestation: 'Prewedding & Séance Couple',
      formulas: [
        { id: 'prew-ext-5', label: 'Séance Extérieur · 5 Photos', priceAmount: 25000, currency: 'FCFA', photoCountLabel: '5 photos' },
        { id: 'prew-ext-10', label: 'Séance Extérieur · 10 Photos', priceAmount: 40000, currency: 'FCFA', photoCountLabel: '10 photos' },
        { id: 'prew-custom', label: 'Pack Prewedding sur mesure', priceAmount: null, currency: 'FCFA', photoCountLabel: 'À définir' }
      ]
    },
    {
      prestation: 'Soutenance & Remise de diplôme',
      formulas: [
        { id: 'sout-num-40', label: 'Reportage Soutenance · 40 photos numériques', priceAmount: 50000, currency: 'FCFA', photoCountLabel: '40 photos numériques' },
        { id: 'sout-num-50', label: 'Reportage Soutenance · 50 photos numériques', priceAmount: 70000, currency: 'FCFA', photoCountLabel: '50 photos numériques' },
        { id: 'sout-studio-3', label: 'Portrait Studio Diplômé · 3 Photos', priceAmount: 6000, currency: 'FCFA', photoCountLabel: '3 photos', isStudio: true },
        { id: 'sout-studio-6', label: 'Portrait Studio Diplômé · 6 Photos', priceAmount: 10000, currency: 'FCFA', photoCountLabel: '6 photos', isStudio: true },
        { id: 'sout-custom', label: 'Soutenance · Formule sur mesure', priceAmount: null, currency: 'FCFA', photoCountLabel: 'À définir' }
      ]
    },
    {
      prestation: 'Photographie professionnelle',
      formulas: [
        { id: 'pro-custom', label: 'Reportage / Corporate sur mesure', priceAmount: null, currency: 'FCFA', photoCountLabel: 'À définir' },
        { id: 'pro-studio-3', label: 'Portrait Corporate Studio · 3 Photos', priceAmount: 6000, currency: 'FCFA', photoCountLabel: '3 photos', isStudio: true },
        { id: 'pro-studio-6', label: 'Portrait Corporate Studio · 6 Photos', priceAmount: 10000, currency: 'FCFA', photoCountLabel: '6 photos', isStudio: true }
      ]
    },
    {
      prestation: 'Shooting Mode, Beauté & Marque',
      formulas: [
        { id: 'mode-studio-3', label: 'Shooting Studio · 3 Photos', priceAmount: 6000, currency: 'FCFA', photoCountLabel: '3 photos', isStudio: true },
        { id: 'mode-studio-6', label: 'Shooting Studio · 6 Photos', priceAmount: 10000, currency: 'FCFA', photoCountLabel: '6 photos', isStudio: true },
        { id: 'mode-ext-5', label: 'Extérieur · 5 Photos', priceAmount: 25000, currency: 'FCFA', photoCountLabel: '5 photos' },
        { id: 'mode-ext-10', label: 'Extérieur · 10 Photos', priceAmount: 40000, currency: 'FCFA', photoCountLabel: '10 photos' },
        { id: 'mode-custom', label: 'Campagne Mode / Marque sur mesure', priceAmount: null, currency: 'FCFA', photoCountLabel: 'À définir' }
      ]
    },
    {
      prestation: 'Réalisation vidéo',
      formulas: [
        { id: 'vid-henne', label: 'Henné Time', priceAmount: 70000, currency: 'FCFA' },
        { id: 'vid-bapteme', label: 'Baptême', priceAmount: 70000, currency: 'FCFA' },
        { id: 'vid-reception', label: 'Réception / Événement', priceAmount: 85000, currency: 'FCFA' },
        { id: 'vid-mariage', label: 'Henné Time + Réception (Mariage)', priceAmount: 130000, currency: 'FCFA' },
        { id: 'vid-custom', label: 'Production audiovisuelle sur mesure', priceAmount: null, currency: 'FCFA' }
      ]
    },
    {
      prestation: 'Reportage Culturel & Documentaire',
      formulas: [
        { id: 'rep-custom', label: 'Reportage documentaire sur mesure', priceAmount: null, currency: 'FCFA' }
      ]
    },
    {
      prestation: 'Film Institutionnel & Production Audiovisuelle',
      formulas: [
        { id: 'inst-custom', label: 'Film institutionnel / Corporate sur mesure', priceAmount: null, currency: 'FCFA' }
      ]
    }
  ];

  window.DIONTADO_DATA = {
    VIDEO_CATEGORIES: VIDEO_CATEGORIES,
    VIDEO_ITEMS: VIDEO_ITEMS,
    PHOTO_CATEGORIES: PHOTO_CATEGORIES,
    GALLERY_PHOTOS: GALLERY_PHOTOS,
    HERO_FEATURED_FILES: HERO_FEATURED_FILES,
    TARIFS_CATALOG: TARIFS_CATALOG,
    BOOKING_PRESTATIONS: BOOKING_PRESTATIONS
  };
})();
