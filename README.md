# 🎬 RanTube Converter

Convertisseur et téléchargeur YouTube haute performance en **MP4** (jusqu'en 4K) et **MP3** (jusqu'à 320 kbps) avec **intégration automatique de la miniature en pochette d'album ID3v2**, conçu avec une architecture moderne compatible **GitHub Pages**.

---

## ✨ Fonctionnalités Clés

- 🎧 **Audio MP3 Haute Fidélité** :
  - Choix complet de débits : **320 kbps** (Qualité Studio), **256 kbps**, **192 kbps** (Optimal YouTube), **128 kbps**, **64 kbps**.
  - **Pochette d'album intégrée (ID3v2 APIC)** : La miniature YouTube originale est recadrée au format carré HD (800x800) et injectée directement dans les métadonnées du fichier MP3. Le visuel s'affiche parfaitement sur toutes vos applications musicales (Apple Music, Spotify local, VLC, Poweramp, smartphones iOS/Android, autoradios Bluetooth / CarPlay).
  - Métadonnées complètes injectées (Titre, Artiste/Chaîne, Album, Année).

- 📺 **Vidéo MP4 Haute Définition** :
  - Détection dynamique de **toutes les résolutions disponibles** pour la vidéo : **4K (2160p)**, **2K (1440p)**, **1080p Full HD**, **720p HD**, **480p**, **360p**, **240p**, **144p**.
  - Prise en charge des vidéos à haut taux de rafraîchissement (**60 FPS**) et **HDR**.
  - Fusion instantanée du flux vidéo et audio sans perte via FFmpeg.

- ⚡ **Expérience Utilisateur Ultra-Fluide** :
  - Suivi en temps réel de la progression du téléchargement et de la conversion (Server-Sent Events).
  - Lecteur audio intégré dans le navigateur pour pré-écouter le fichier MP3 avant ou après le téléchargement.
  - Estimation de la taille de chaque fichier selon la qualité choisie.
  - Interface moderne, réactive et élégante en mode sombre (Glassmorphism & Tailwind CSS).

- 🌐 **Compatibilité GitHub Pages** :
  - Le frontend est une application monopage (SPA) statique compilée avec des chemins relatifs (`base: './'`).
  - Déployable sur GitHub Pages en 1 clic grâce au workflow GitHub Actions inclus.
  - Modal de configuration permettant de connecter le site GitHub Pages soit à votre backend local, soit à un backend hébergé dans le cloud (Render, Railway, Fly.io).

---

## 🏛️ Architecture du Projet

```text
RantubeConvertor/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Déploiement automatique GitHub Actions vers gh-pages
├── backend/                    # API Node.js / Express
│   ├── src/
│   │   ├── config.js           # Détection automatique de FFmpeg et yt-dlp
│   │   ├── routes/
│   │   │   └── api.js          # Endpoints /api/info, /api/convert, /api/download...
│   │   ├── services/
│   │   │   ├── ytdlp.js        # Extraction yt-dlp & conversion de formats
│   │   │   ├── tagger.js       # Injection pochette ID3v2 + recadrage Sharp
│   │   │   └── jobManager.js   # Gestionnaire de tâches & progression en temps réel
│   │   └── server.js           # Serveur Express & service des fichiers statiques
│   ├── Dockerfile              # Déploiement cloud conteneurisé (Render, Railway...)
│   ├── render.yaml             # Blueprint 1-clic pour Render
│   └── package.json
├── frontend/                   # Interface utilisateur moderne (Vite + React)
│   ├── src/
│   │   ├── components/         # Navbar, UrlInput, VideoCard, QualitySelector...
│   │   ├── services/           # api.js avec support d'URL backend dynamique
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js          # Base relative './' pour GitHub Pages
│   ├── tailwind.config.js
│   └── package.json
├── start-demo.bat              # Lanceur 1-clic pour Windows
├── package.json                # Orchestration racine
└── README.md
```

---

## 🚀 Démarrer la Démo Locale (Sur ce PC)

### Méthode 1 : En un seul double-clic (Recommandé sous Windows)
Double-cliquez simplement sur le fichier **`start-demo.bat`**.
Il vérifie les composants, démarre le serveur unifié et ouvre automatiquement votre navigateur sur **`http://localhost:5000`**.

### Méthode 2 : En ligne de commande
```bash
# 1. Lancer le serveur local de démo
npm start
```
Ouvrez ensuite votre navigateur à l'adresse suivante :  
👉 **`http://localhost:5000`**

Le serveur sert simultanément l'interface React compilée et l'API backend sur le même port, évitant tout problème de CORS !

---

## 💻 Développement Actif

Si vous souhaitez modifier le frontend avec rechargement à chaud (Hot Module Replacement) :
```bash
# Terminal 1 : Backend API (port 5000)
npm run dev:backend

# Terminal 2 : Frontend Vite Dev (port 3000 avec proxy vers l'API)
npm run dev:frontend
```

---

## 🌍 Déploiement sur GitHub Pages

### 1. Pousser le projet sur votre dépôt GitHub
```bash
git add .
git commit -m "feat: RanTube Converter initial release"
git remote add origin https://github.com/VOTRE_PSEUDO/VOTRE_REPO.git
git branch -M main
git push -u origin main
```

### 2. Activation automatique de GitHub Pages
Le fichier `.github/workflows/deploy.yml` compile automatiquement le frontend et déploie le dossier `frontend/dist` sur la branche `gh-pages`.
1. Rendez-vous sur votre dépôt GitHub : **Settings** > **Pages**.
2. Dans **Build and deployment** > **Source**, sélectionnez **Deploy from a branch**.
3. Choisissez la branche **`gh-pages`** et le dossier **`/(root)`**, puis cliquez sur **Save**.
4. Votre site sera accessible à l'adresse : `https://VOTRE_PSEUDO.github.io/VOTRE_REPO/`

### 3. Connexion du Frontend GitHub Pages au Backend
GitHub Pages héberge uniquement des fichiers statiques (HTML/CSS/JS) et ne peut pas exécuter FFmpeg ni Node.js sur ses serveurs.  
Pour convertir vos vidéos depuis votre site en ligne :
- **En local** : Vous pouvez laisser tourner `npm start` sur votre machine, et le site GitHub Pages se connectera automatiquement à votre backend local (`http://localhost:5000`).
- **En ligne (24h/24)** : Vous pouvez déployer gratuitement le dossier `backend` sur des plateformes comme **Render** ou **Railway** via le `Dockerfile` inclus, puis renseigner l'URL obtenue dans le bouton **Paramètres ⚙️** en haut à droite du site.

---

## 🛡️ Technologies Utilisées

- **Frontend** : React 18, Vite, Tailwind CSS, Lucide Icons.
- **Backend** : Node.js, Express, Server-Sent Events (SSE).
- **Moteur multimédia** : `yt-dlp` (extracteur de signatures YouTube à jour), `ffmpeg-static` (transcodage et fusion de flux).
- **Métadonnées audio** : `node-id3` (ID3v2 tags), `sharp` (traitement d'image haute fidélité pour pochette 1:1).

