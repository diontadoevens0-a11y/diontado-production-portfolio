# DIONTADO PRODUCTION – Site web

Site statique (HTML, CSS, JavaScript) en 8 pages : `index.html`, `apropos.html`, `services.html`, `tarifs.html`, `reservation.html`, `realisations.html`, `videos.html`, `contact.html`.
Aucun outil d’installation n’est nécessaire : ouvrez `index.html` dans un navigateur pour tester.

## Structure

```
index.html … contact.html      les 8 pages
assets/css/style.css           le design (couleurs en haut du fichier)
assets/js/config.js            LA configuration à modifier (WhatsApp, Wave, galerie, vidéos)
assets/js/main.js              le fonctionnement (à ne pas modifier en général)
assets/images/cover.jpg        photo de couverture de l’accueil (à ajouter)
assets/images/portrait.jpg     portrait professionnel, page À propos (à ajouter)
assets/images/realisations/    photos de la galerie
assets/images/videos/          miniatures des vidéos (facultatif)
assets/videos/                 réservé à vos fichiers vidéo si besoin
assets/icons/favicon.svg       icône du site
netlify.toml                   réglage de publication Netlify
```

## 1. Modifier les coordonnées

- **Numéro WhatsApp** : dans `assets/js/config.js`, remplacez `221XXXXXXXXX` par votre numéro au format international, sans `+` ni espaces (ex. `221771234567`). Tant que ce n’est pas fait, le bouton WhatsApp est désactivé et le site l’indique.
- **E-mail** : ligne `email` du même fichier (et dans le pied de page / la page Contact de chaque fichier `.html`).
- **Biographie** : dans `apropos.html`, remplacez le texte « Emplacement pour votre courte biographie ».
- **Tarifs** : dans `tarifs.html`.

## 2. Remplacer les images

1. **Couverture** : ajoutez `assets/images/cover.jpg` (format paysage, idéalement 1920 px de large).
2. **Portrait** : ajoutez `assets/images/portrait.jpg` (format portrait 3:4).
3. **Galerie** : placez vos photos dans `assets/images/realisations/` en gardant les noms de `config.js` (ex. `mariage-01.jpg`), ou changez les noms et titres dans la liste `gallery` de `config.js`. Pour ajouter une photo, ajoutez une ligne dans cette liste.
4. Les images de démonstration disparaissent automatiquement dès que le fichier existe.

Conseil : exportez les photos en JPEG, 1600 px de large maximum et moins de 400 Ko chacune, pour un site rapide.

## 3. Ajouter vos vidéos

Dans `assets/js/config.js`, liste `videos` : collez le lien YouTube dans `url` (ex. `https://www.youtube.com/watch?v=XXXXXXXXXXX`). La miniature YouTube est utilisée automatiquement, ou placez votre propre image dans `assets/images/videos/` et indiquez son nom dans `thumb`.

## 4. Réservation et contact

Les formulaires vérifient les champs obligatoires, puis **préparent** un message récapitulatif. Rien n’est envoyé automatiquement : la personne choisit « Envoyer via WhatsApp », « Envoyer par e-mail » ou « Copier le message ». Le site n’affirme jamais que la demande a été reçue.

## 5. Paiement Wave Business

Le paiement n’est **pas activé**. Le site l’indique tant que `wave` est vide dans `config.js`.

- **Option simple** : quand vous aurez un lien de paiement Wave Business, collez-le dans `wave` (il doit commencer par `https://`). Un bouton « Payer avec Wave » apparaîtra sur les pages Tarifs et Réservation.
- **Intégration officielle (paiement avec confirmation automatique)** : elle demande un petit serveur (par exemple une fonction Netlify). Les clés API fournies par Wave doivent y être stockées dans des variables d’environnement, jamais dans les fichiers du site. Suivez la documentation officielle de Wave Business pour les étapes exactes. Un paiement ne doit être déclaré réussi que sur confirmation de Wave.
- Ne placez jamais de code PIN, de clé secrète ou de clé API dans `config.js` ou dans une page.

## 6. Publier sur GitHub puis Netlify

1. Créez un dépôt sur github.com et envoyez-y tout le contenu de ce dossier (bouton « Add file » > « Upload files », ou `git push`).
2. Sur netlify.com : « Add new site » > « Import an existing project » > choisissez GitHub et votre dépôt.
3. Laissez la commande de build **vide** et le dossier de publication à `.` (déjà réglé par `netlify.toml`), puis « Deploy ».
4. Pour mettre à jour le site : modifiez les fichiers dans GitHub, Netlify republie automatiquement.

Autre option sans GitHub : faites glisser le dossier du projet sur la page « Deploy manually » de Netlify.
