# DIONTADO PRODUCTION — Site Multi-Pages (Phase 2)

Site officiel de **DIONTADO PRODUCTION** (photographie professionnelle & réalisation vidéo à Yeumbeul, Dakar, Sénégal), conçu en HTML/CSS/JS statique compatible **GitHub Pages**, **Netlify** et **Cloudflare Pages**.

---

## 1. Arborescence du dépôt

```text
/
├── index.html                                         # Page d'accueil + redirection des anciens liens (#/tarifs, #/<slug>)
├── tarifs/index.html                                  # Grille tarifaire officielle en HTML statique
├── realisations/index.html                            # Catalogue des 10 collections photographiques
├── realisations/<slug>/index.html                     # Pages dédiées (prewedding, mariage, portrait, mode-beaute, culture, evenementiel, studio, exterieur, soutenance, photographie-professionnelle)
├── videos/index.html                                  # Showreel + galerie vidéo filtrable
├── a-propos/index.html                                # Présentation éditoriale d'Amadou Sy & vision
├── reservation/index.html                             # Formulaire de réservation + Wave + WhatsApp
├── mentions-legales/index.html                        # Mentions légales, politique de confidentialité & droit à l'image
├── 404.html                                           # Page d'erreur personnalisée
├── assets/
│   ├── css/style.css                                  # Feuille de style unique (sans CSS inline)
│   └── js/
│       ├── data.js                                    # Configuration (BASE_PATH), tarifs, photos, vidéos
│       ├── app.js                                     # Navigation mobile, animations, lightbox, lecteur vidéo, redirections
│       └── reservation.js                             # Calculateur 70/30, exception Studio, Wave & WhatsApp
├── sitemap.xml                                        # Plan du site pour Google Search Console
├── robots.txt                                         # Directives d'indexation
├── _headers                                           # En-têtes de sécurité (Netlify / Cloudflare Pages)
└── README.md                                          # Ce guide
```

> Conservez à la racine du dépôt vos fichiers médias existants : `cover.jpg`, `amadou-sy.jpg`, `logo-entete.png`, `logo-horizontal-blanc.png`, `logo-vertical-blanc-contact.png`, `logo-pied.png`, `logo-icone-fond-brun.png`, ainsi que vos photographies (`culture-01..06.jpg`, `mariage-01.jpg`, `portrait-01..06.jpg`, `publicite-01..06.jpg`).

---

## 2. Ajouter une photographie dans une collection

1. **Déposez votre image** (optimisée en `.jpg`, idéalement < 400 Ko, en minuscules sans espaces ni accents) à la racine du dépôt, par exemple `soutenance-01.jpg` ou `mariage-02.jpg`.
2. **Ajoutez la carte en HTML statique** dans `/realisations/<slug>/index.html` à l'intérieur de `<div class="gallery-grid">` (en remplaçant le bloc « Bientôt disponible » si c'est la première photo de la collection) :
   ```html
   <div class="gallery-item">
     <button
       type="button"
       class="gallery-card tilt-3d"
       data-lightbox-index="0"
       data-photo-file="soutenance-01.jpg"
       data-photo-cat="Soutenance"
       data-photo-title="Soutenance — Série 01"
       aria-label="Agrandir Soutenance — Série 01"
     >
       <img
         src="/diontado-production-portfolio/soutenance-01.jpg"
         alt="Photographie Soutenance à Dakar — DIONTADO PRODUCTION, série 01"
         width="900"
         height="1200"
         loading="lazy"
         decoding="async"
       />
       <div class="gallery-overlay">
         <span class="kicker gallery-overlay-cat">Soutenance</span>
         <span class="gallery-overlay-title">Soutenance — Série 01</span>
       </div>
     </button>
   </div>
   ```
3. **Ajoutez l'entrée correspondante** dans le tableau `GALLERY_PHOTOS` du fichier `/assets/js/data.js` et mettez à jour le compteur (`X photos`) dans `/realisations/index.html` et `/realisations/<slug>/index.html`.

---

## 3. Ajouter une vidéo (YouTube ou fichier MP4)

1. **Dans `/assets/js/data.js`**, ajoutez un objet dans `VIDEO_ITEMS` :
   - **YouTube** : indiquez `youtubeId: 'IDENTIFIANT_YOUTUBE'` et `posterUrl: 'https://i.ytimg.com/vi/IDENTIFIANT_YOUTUBE/hqdefault.jpg'`.
   - **Vidéo MP4 hébergée** : déposez le `.mp4` dans `/videos/` et utilisez `sourceType: 'mp4'`, `videoSrc: BASE_PATH + '/videos/mon-film.mp4'`, `posterAsset: 'cover.jpg'`.
2. **Dans `/videos/index.html`** (et dans l'aperçu de `/index.html` si vous souhaitez l'afficher en page d'accueil), ajoutez le `<button class="video-card tilt-3d" data-video-id="mon-id" data-video-cat="Mariage">...</button>` dans `<div class="video-cards-grid" id="videoGalleryGrid">` et activez le bouton de filtre correspondant dans `#videoFilterTabs`.

---

## 4. Modifier ou ajouter un tarif

Les tarifs sont stockés en deux endroits synchronisés :

1. **Affichage statique pour Google et les visiteurs** : modifiez les montants dans `/tarifs/index.html` (et le récapitulatif dans `/index.html` si concerné). Utilisez toujours un espace insécable (`&nbsp;`) entre les milliers et avant `FCFA` (ex. `70&nbsp;000&nbsp;FCFA`).
2. **Calculateur de réservation (acompte 70 % / solde 30 %)** : modifiez `priceAmount` et `label` dans `BOOKING_PRESTATIONS` (et `TARIFS_CATALOG` pour référence) dans `/assets/js/data.js`.

---

## 5. Passer à un nom de domaine personnalisé (ex. `https://diontadoproduction.sn`)

Aujourd'hui le site est configuré pour GitHub Pages sous `/diontado-production-portfolio/`. Lorsque vous achetez votre propre nom de domaine :

1. Ouvrez `/assets/js/data.js` et remplacez :
   - `BASE_PATH = '/diontado-production-portfolio'` par `BASE_PATH = ''`
   - `SITE_ORIGIN = 'https://diontadoevens0-a11y.github.io'` par `SITE_ORIGIN = 'https://diontadoproduction.sn'`
2. Dans votre éditeur (VS Code : **Rechercher et remplacer dans tous les fichiers**), remplacez :
   - `https://diontadoevens0-a11y.github.io/diontado-production-portfolio` &rarr; `https://diontadoproduction.sn`
   - `/diontado-production-portfolio/` &rarr; `/`
3. Mettez à jour la date `<lastmod>` dans `sitemap.xml` et renvoyez le nouveau `sitemap.xml` dans Google Search Console.

---

## 6. Publier les fichiers

### Option A — GitHub Pages (actuel)
1. Copiez l'ensemble des fichiers et dossiers dans votre dépôt `diontado-production-portfolio` (branche `main`).
2. Vérifiez dans **Settings &rarr; Pages** que la source est `Deploy from a branch` (`main` / `(root)`).
3. Attendez 1 à 2 minutes et vérifiez que chaque URL répond en HTTPS (`/`, `/tarifs/`, `/realisations/`, `/videos/`, `/a-propos/`, `/reservation/`, `/mentions-legales/`).

### Option B — Netlify ou Cloudflare Pages (recommandé pour activer `_headers`)
GitHub Pages n'applique pas le fichier `_headers` (seules les balises `<meta http-equiv="Content-Security-Policy">` sont lues côté navigateur). Pour activer l'ensemble des en-têtes HTTP stricts (`X-Frame-Options: DENY`, `Strict-Transport-Security`, `Permissions-Policy`, cache long `/assets/*`), connectez simplement votre dépôt GitHub à **Cloudflare Pages** ou **Netlify** (dossier de publication : `/`, aucune commande de build requise).
