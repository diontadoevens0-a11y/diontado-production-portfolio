# DIONTADO PRODUCTION — Site Multi-Pages

Site officiel de **DIONTADO PRODUCTION** (photographie professionnelle & réalisation vidéo à Yeumbeul, Dakar, Sénégal), conçu en HTML/CSS/JS statique compatible **GitHub Pages**, **Netlify** et **Cloudflare Pages**.

---

## 1. Arborescence du dépôt

```text
/
├── index.html                                         # Page d'accueil + redirection des anciens liens (#/tarifs, #/reservation, #/<slug>)
├── tarifs/index.html                                  # Grille tarifaire officielle en HTML statique
├── reservation/index.html                             # Formulaire de réservation + calendrier des disponibilités
├── realisations/index.html                            # Catalogue des 5 collections photographiques actives
├── realisations/<slug>/index.html                     # Pages niches actives (prewedding, portrait, culture, studio, exterieur)
├── videos/index.html                                  # Showreel + galerie vidéo filtrable
├── a-propos/index.html                                # Présentation d'Amadou Sy & vision
├── mentions-legales/index.html                        # Mentions légales, confidentialité & conditions de réservation (#conditions-reservation)
├── 404.html                                           # Page d'erreur personnalisée
├── assets/
│   ├── css/style.css                                  # Feuille de style unique (sans CSS inline)
│   ├── data/disponibilites.json                       # Calendrier public des dates indisponibles (sans données clients)
│   └── js/
│       ├── data.js                                    # Configuration (BASE_PATH), tarifs, formules de réservation, photos, vidéos, témoignages
│       ├── reservation.js                             # Calendrier mensuel accessible, calcul du total, référence DP-AAMMJJ-XXXX, envoi WhatsApp/Email
│       └── app.js                                     # Navigation mobile, animations, lightbox, lecteur vidéo, témoignages, redirections
├── sitemap.xml                                        # Plan du site pour Google Search Console
├── robots.txt                                         # Directives d'indexation
├── _headers                                           # En-têtes de sécurité (Netlify / Cloudflare Pages uniquement ; non lu par GitHub Pages)
└── README.md                                          # Ce guide
```

> Conservez à la racine du dépôt vos fichiers médias existants : `cover.jpg`, `amadou-sy.jpg`, `logo-entete.png`, `logo-horizontal-blanc.png`, `logo-vertical-blanc-contact.png`, `logo-pied.png`, `logo-icone-fond-brun.png`, ainsi que vos photographies (`culture-01..06.jpg`, `mariage-01.jpg`, `portrait-01..06.jpg`, `publicite-01..06.jpg`).

---

## 2. Comment bloquer une date dans le calendrier de réservation

Le calendrier de la page `/reservation/` lit le fichier public `/assets/data/disponibilites.json`.

**Règle de confidentialité :** ce fichier est accessible publiquement. N’y inscrivez **jamais** de nom, de numéro de téléphone, d’e-mail ou de détail privé de client — uniquement des dates et numéros de jours.

Format du fichier `/assets/data/disponibilites.json` :

```json
{
  "mis_a_jour": "2026-11-24",
  "dates_indisponibles": [
    "2026-12-25",
    "2027-01-01"
  ],
  "jours_fermes_hebdo": []
}
```

- `mis_a_jour` : date de dernière mise à jour au format `AAAA-MM-JJ`.
- `dates_indisponibles` : liste des dates précises à bloquer, au format `AAAA-MM-JJ` (entre guillemets, séparées par des virgules, sans virgule après la dernière date).
- `jours_fermes_hebdo` : jours fermés chaque semaine sous forme de chiffres de `0` à `6` (`0` = dimanche, `1` = lundi, `2` = mardi, `3` = mercredi, `4` = jeudi, `5` = vendredi, `6` = samedi). Exemple : `[0]` pour fermer tous les dimanches.

**Procédure sur GitHub :**
1. Ouvrez `assets/data/disponibilites.json` dans votre dépôt GitHub et cliquez sur l’icône crayon (*Edit this file*).
2. Ajoutez ou retirez les dates au format `"AAAA-MM-JJ"` et mettez à jour `"mis_a_jour"`.
3. Cliquez sur **Commit changes**. GitHub Pages met à jour le fichier en 1 à 2 minutes.

---

## 3. Ajouter une photographie dans une collection

1. **Déposez votre image** (optimisée en `.jpg`, idéalement < 400 Ko, en minuscules sans espaces ni accents) à la racine du dépôt, par exemple `portrait-07.jpg` ou `mariage-02.jpg`.
2. **Ajoutez la carte en HTML statique** dans `/realisations/<slug>/index.html` à l'intérieur de `<div class="gallery-grid">` (`loading="eager"` uniquement sur la 1re image, `loading="lazy"` sur les suivantes) :
   ```html
   <div class="gallery-item">
     <button
       type="button"
       class="gallery-card tilt-3d"
       data-lightbox-index="0"
       data-photo-file="portrait-07.jpg"
       data-photo-cat="Portrait"
       data-photo-title="Portrait — Série 07"
       aria-label="Agrandir Portrait — Série 07"
     >
       <img
         src="/diontado-production-portfolio/portrait-07.jpg"
         alt="Photographie Portrait à Dakar — DIONTADO PRODUCTION, série 07"
         width="900"
         height="1200"
         loading="lazy"
         decoding="async"
       />
       <div class="gallery-overlay">
         <span class="kicker gallery-overlay-cat">Portrait</span>
         <span class="gallery-overlay-title">Portrait — Série 07</span>
       </div>
     </button>
   </div>
   ```
3. **Ajoutez l'entrée correspondante** dans le tableau `GALLERY_PHOTOS` du fichier `/assets/js/data.js` et mettez à jour le compteur (`X photos`) dans `/realisations/index.html` et `/realisations/<slug>/index.html`.

---

## 4. Ajouter une vidéo (YouTube ou fichier MP4)

1. **Dans `/assets/js/data.js`**, ajoutez un objet dans `VIDEO_ITEMS` :
   - **YouTube** : indiquez `youtubeId: 'IDENTIFIANT_YOUTUBE'` et `posterUrl: 'https://i.ytimg.com/vi/IDENTIFIANT_YOUTUBE/hqdefault.jpg'`.
   - **Vidéo MP4 hébergée** : déposez le `.mp4` dans `/videos/` et utilisez `sourceType: 'mp4'`, `videoSrc: BASE_PATH + '/videos/mon-film.mp4'`, `posterAsset: 'cover.jpg'`.
2. **Dans `/videos/index.html`**, ajoutez le `<button class="video-card tilt-3d" data-video-id="mon-id" data-video-cat="Reportages">...</button>` dans `<div class="video-cards-grid" id="videoGalleryGrid">` et activez le bouton de filtre correspondant dans `#videoFilterTabs`.

---

## 5. Modifier un tarif ou une prestation de réservation

1. **Affichage statique pour Google et les visiteurs** : modifiez les montants dans `/tarifs/index.html` (et le récapitulatif dans `/index.html` si concerné). Utilisez toujours un espace insécable (`&nbsp;`) entre les milliers et avant `FCFA` (ex. `70&nbsp;000&nbsp;FCFA`).
2. **Catalogue & formulaire JS** : mettez à jour l'entrée correspondante dans `TARIFS_CATALOG` et `BOOKING_PRESTATIONS` dans `/assets/js/data.js`. Aucun paiement en ligne n'est effectué sur le site.

---

## 6. Passer à un nom de domaine personnalisé (ex. `https://diontadoproduction.sn`)

Aujourd'hui le site est configuré pour GitHub Pages sous `/diontado-production-portfolio/`. Lorsque vous achetez votre propre nom de domaine :

1. Ouvrez `/assets/js/data.js` et remplacez :
   - `BASE_PATH = '/diontado-production-portfolio'` par `BASE_PATH = ''`
   - `SITE_ORIGIN = 'https://diontadoevens0-a11y.github.io'` par `SITE_ORIGIN = 'https://diontadoproduction.sn'`
2. Dans votre éditeur (VS Code : **Rechercher et remplacer dans tous les fichiers**), remplacez :
   - `https://diontadoevens0-a11y.github.io/diontado-production-portfolio` &rarr; `https://diontadoproduction.sn`
   - `/diontado-production-portfolio/` &rarr; `/`
3. Mettez à jour la date `<lastmod>` dans `sitemap.xml` et renvoyez le nouveau `sitemap.xml` dans Google Search Console.

---

## 7. Publier les fichiers

### Option A — GitHub Pages (hébergement actuel)
1. Copiez l'ensemble des fichiers et dossiers dans votre dépôt `diontado-production-portfolio` (branche `main`).
2. Vérifiez dans **Settings &rarr; Pages** que la source est `Deploy from a branch` (`main` / `(root)`).
3. Attendez 1 à 2 minutes et vérifiez que chaque URL répond en HTTPS (`/`, `/tarifs/`, `/reservation/`, `/realisations/`, `/videos/`, `/a-propos/`, `/mentions-legales/`).

> **Important concernant `_headers` :** GitHub Pages ignore le fichier `_headers` (seules les balises `<meta http-equiv="Content-Security-Policy">` des pages HTML sont appliquées côté navigateur sur GitHub Pages). Le fichier `_headers` est conservé dans le dépôt uniquement pour un éventuel futur hébergement sur **Netlify** ou **Cloudflare Pages**.

### Option B — Netlify ou Cloudflare Pages (futur hébergement recommandé pour `_headers`)
Pour activer l'ensemble des en-têtes HTTP stricts (`X-Frame-Options: DENY`, `Strict-Transport-Security`, `Permissions-Policy`, cache long `/assets/*`), connectez votre dépôt GitHub à **Cloudflare Pages** ou **Netlify** (dossier de publication : `/`, aucune commande de build requise).

