# DIONTADO PRODUCTION — Site Web Officiel

**Slogan :** *« Nous donnons vie à vos histoires. »*  
**Activité :** Production audiovisuelle, photographie, réalisation vidéo, montage vidéo, clips musicaux, films institutionnels et couverture d'événements au Sénégal.  
**Devise :** FCFA (XOF)  
**Email professionnel :** `diontadoproduction@gmail.com`

---

## 1. Architecture des 8 Pages du Site

Le site intègre les **8 pages HTML distinctes** accessibles depuis le menu principal et le pied de page (dans le même onglet du navigateur) :

1. **`index.html`** — Page d'Accueil (Hero cinématographique, slogan, photographie de couverture, services principaux, sélection des réalisations, appel à l'action).
2. **`apropos.html`** — À propos (ADN de Diontado Production, 5 piliers d'engagement, emplacement portrait professionnel et biographie).
3. **`services.html`** — Services (Présentation détaillée des 10 prestations avec bouton *« Demander un devis »*).
4. **`tarifs.html`** — Tarifs (Cartes tarifaires en FCFA : 150 000 FCFA, 80 000 FCFA, 80 000 FCFA, Sur devis + section Wave Business).
5. **`reservation.html`** — Réservation (Formulaire complet validé générant un récapitulatif prêt à être envoyé sur WhatsApp ou par e-mail).
6. **`realisations.html`** — Réalisations (Galerie photo filtrable en 6 catégories avec visionneuse plein écran au clic).
7. **`videos.html`** — Portfolio vidéo (Galerie vidéo moderne pour clips/courts métrages, films institutionnels et reportages avec intégration YouTube ou MP4).
8. **`contact.html`** — Contact (Coordonnées officielles, bouton WhatsApp configurable, formulaire de contact et rappel des services).

---

## 2. Comment modifier vos coordonnées (Numéro WhatsApp, Email, Wave Business)

Vous disposez de **deux méthodes simples** :

### Méthode A : Directement dans l'interface du site (Sans toucher au code)
Cliquez sur le bouton **« Gérer le contenu du site »** situé en bas de page (dans le pied de page) pour ouvrir le gestionnaire visuel. Vous pourrez modifier :
- Votre numéro WhatsApp professionnel.
- Vos photographies de couverture et portrait.
- Les photos de la galerie **Réalisations** et les liens YouTube du **Portfolio vidéo**.

### Méthode B : Dans le fichier de configuration centralisé (Pour la publication permanente)
Ouvrez le fichier **`src/config/siteConfig.ts`** :

```ts
export const DEFAULT_SITE_CONFIG: SiteConfig = {
  companyName: 'DIONTADO PRODUCTION',
  slogan: 'Nous donnons vie à vos histoires.',
  market: 'Sénégal',
  currency: 'FCFA (XOF)',
  email: 'diontadoproduction@gmail.com',
  // Remplacez par votre numéro au format international sans '+' ni espaces (ex: '221771234567')
  whatsappNumber: 'NUMERO_WHATSAPP_A_REMPLACER',
  waveBusiness: {
    enabled: false, // Passez à true lorsque vous avez votre lien marchand officiel
    paymentLink: '', // Ex: 'https://pay.wave.com/m/...'
  },
  ...
```

---

## 3. Comment remplacer les images et vidéos de démonstration

1. Déposez vos propres photos dans le dossier **`public/assets/images/`** (par exemple : `public/assets/images/couverture.jpg`, `public/assets/images/portrait-directeur.jpg`, `public/assets/images/mariage-01.jpg`).
2. Déposez vos éventuels fichiers vidéo MP4 dans **`public/assets/videos/`** ou préparez vos liens **YouTube**.
3. Mettez à jour les chemins dans **`src/config/siteConfig.ts`** :
   - `images.heroCover`: `'/assets/images/couverture.jpg'`
   - `images.directorPortrait`: `'/assets/images/portrait-directeur.jpg'`
   - Dans `INITIAL_GALLERY_SLOTS`, remplacez `imagePath` par vos chemins `/assets/images/...` et passez `isDemoPlaceholder: false`.
   - Dans `INITIAL_VIDEO_SLOTS`, renseignez `youtubeUrlOrFile` avec votre lien YouTube (`https://www.youtube.com/watch?v=...`) et passez `isDemoPlaceholder: false`.

---

## 4. Configuration de Wave Business (Sécurité)

- **Lien marchand simple** : Si vous disposez d'un lien de paiement officiel Wave Business, placez-le dans `waveBusiness.paymentLink` et activez `waveBusiness.enabled = true`.
- **Intégration API Wave Checkout** : N'exposez **jamais** votre clé secrète `WAVE_API_KEY` ou votre code PIN dans le code côté navigateur. Si vous souhaitez automatiser la confirmation de paiement via l'API Wave, configurez une fonction serveur (ex: Netlify Function) utilisant une variable d'environnement privée `WAVE_API_KEY` et vérifiant la signature du Webhook Wave avant d'afficher toute confirmation.

---

## 5. Publication sur GitHub et Déploiement sur Netlify

### Étape 1 : Installer et tester en local
```bash
npm install
npm run dev
```

### Étape 2 : Générer la version de production
```bash
npm run build
```
La commande `npm run build` compile automatiquement les **8 pages HTML** (`index.html`, `apropos.html`, `services.html`, `tarifs.html`, `reservation.html`, `realisations.html`, `videos.html`, `contact.html`) dans le dossier `dist/`.

### Étape 3 : Publier sur GitHub et Netlify
1. Créez un nouveau dépôt sur **GitHub** et poussez l'ensemble des fichiers du projet :
   ```bash
   git init
   git add .
   git commit -m "Site officiel DIONTADO PRODUCTION"
   git branch -M main
   git remote add origin https://github.com/VOTRE_COMPTE/diontado-production.git
   git push -u origin main
   ```
2. Connectez-vous sur **[Netlify](https://www.netlify.com/)** → **Add new site** → **Import an existing project** → Sélectionnez votre dépôt GitHub.
3. Paramètres de build sur Netlify :
   - **Build command :** `npm run build`
   - **Publish directory :** `dist`
4. Cliquez sur **Deploy site**. Vos 8 pages seront immédiatement en ligne avec certificat HTTPS automatique.
