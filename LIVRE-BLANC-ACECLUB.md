# AceClub - Livre Blanc Technique (pour non-techs)

> Ce document explique comment fonctionne AceClub, comment installer le projet et comment contribuer, même si tu n'as jamais codé de ta vie.

---

## Table des matières

1. [C'est quoi AceClub ?](#1-cest-quoi-aceclub-)
2. [Les features de l'app](#2-les-features-de-lapp)
3. [Comment c'est construit (l'architecture)](#3-comment-cest-construit-larchitecture)
4. [Ce qu'il te faut avant de commencer](#4-ce-quil-te-faut-avant-de-commencer)
5. [Installation pas à pas](#5-installation-pas-à-pas)
6. [Lancer le projet](#6-lancer-le-projet)
7. [Structure du projet (où sont les fichiers)](#7-structure-du-projet-où-sont-les-fichiers)
8. [Comment modifier quelque chose](#8-comment-modifier-quelque-chose)
9. [Glossaire](#9-glossaire)
10. [Builder l'app pour la distribuer (Expo + EAS)](#10-builder-lapp-pour-la-distribuer-expo--eas)
11. [Déployer et mettre à jour l'app en production](#11-déployer-et-mettre-à-jour-lapp-en-production)
12. [Déployer l'API et le site web (Railway)](#12-déployer-lapi-et-le-site-web-railway)
13. [Pour aller plus loin](#13-pour-aller-plus-loin)
14. [Trigger.dev (tâches en arrière-plan)](#14-triggerdev-tâches-en-arrière-plan)

---

## 1. C'est quoi AceClub ?

AceClub est une **app mobile pour les joueurs de tennis**. Elle permet de :

- Trouver des partenaires de jeu autour de soi
- Organiser des matchs
- Rejoindre des clubs
- Discuter avec d'autres joueurs
- Suivre sa progression (classement, streaks, badges)
- Participer à des challenges

C'est un peu le **Tinder du tennis** : tu swipes pour trouver un partenaire, tu matches, tu joues.

L'app est disponible sur **iPhone** et **Android**. Il y a aussi un **site web** (pour l'admin et le marketing).

---

## 2. Les features de l'app

### 2.1 Authentification (login)

L'utilisateur peut se connecter avec :
- **Apple** (Sign in with Apple)
- **Google** (Google Sign-In)
- **Email + mot de passe** (développeur mode)

Le système d'auth est géré par **Better Auth**, une librairie qui gère tout : sessions, tokens, cookies.

### 2.2 Onboarding (inscription)

Quand un nouveau joueur arrive, il passe par un **parcours d'inscription** :
1. Il entre ses infos (prénom, nom, âge)
2. Il choisit son **club** (ou en crée un)
3. Il configure son profil joueur (niveau, disponibilités, etc.)

### 2.3 Discover (découvrir des joueurs)

C'est le cœur de l'app. L'utilisateur voit des **cartes de joueurs** à proximité et peut :
- **Swiper à droite** = intéressé pour jouer
- **Swiper à gauche** = passer
- Filtrer par **rayon** (distance en km)
- Voir le **détail** d'un joueur (disponibilités, description, niveau)

### 2.4 Matches

Quand deux joueurs se swipent mutuellement, c'est un **match** ! Ils peuvent :
- Organiser un match de tennis
- Enregistrer les scores (sets)
- Laisser des commentaires/feedback

### 2.5 Match Intents (intentions de match)

Un joueur peut créer une **intention de match** : "Je veux jouer samedi à 14h au club X". D'autres joueurs peuvent répondre à cette intention.

### 2.6 Chat

Les joueurs matchés peuvent **discuter** entre eux :
- Messages texte
- Messages vocaux (audio)
- Photos
- Conversations de groupe

Le chat fonctionne en **temps réel** grâce aux WebSockets (les messages arrivent instantanément, pas besoin de rafraîchir).

### 2.7 Feed (fil d'actualité)

Un flux d'actualités avec les événements récents du club :
- Matchs joués
- Nouveaux membres
- Challenges terminés

### 2.8 Profil

Chaque joueur a un profil avec :
- Photo de profil
- Niveau de jeu
- Statistiques (matchs joués, victoires, etc.)
- Badges et titres gagnés
- Streak (nombre de jours consécutifs d'activité)

### 2.9 Progression & Gamification

Le système de progression comprend :
- **Levels** : monter de niveau en gagnant des "Aces" (points d'XP)
- **Badges** : récompenses pour des accomplissements (ex: "10 matchs joués")
- **Titres** : titres honorifiques affichés sur le profil
- **Streaks** : nombre de jours consécutifs d'activité
- **Challenges** : défis à relever pour gagner des Aces
- **Leaderboard** : classement des joueurs du club

### 2.10 Organisations (Clubs)

Les joueurs sont regroupés en **clubs** (organisations). Un club a :
- Des membres avec différents rôles (owner, admin, membre)
- Un système d'invitation
- Des demandes d'adhésion (club requests)

### 2.11 Events

Les clubs peuvent créer des **événements** (tournois, sessions d'entraînement, etc.) avec :
- Inscription (RSVP)
- Date, lieu, description

### 2.12 Notifications push

L'app envoie des **notifications push** pour :
- Nouveau match
- Nouveau message
- Challenge terminé
- Rappel d'événement

### 2.13 Site web

Le site web comprend :
- **Pages marketing** : page d'accueil, contact, mentions légales, CGU
- **Dashboard admin** : gestion des utilisateurs, organisations, matchs, feature flags

---

## 3. Comment c'est construit (l'architecture)

### Le schéma global

```
┌─────────────────┐     ┌─────────────────┐
│   App Mobile    │     │    Site Web      │
│  (React Native) │     │   (Next.js)     │
│   iPhone/Android│     │   Marketing +   │
│                 │     │   Admin         │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │    Requêtes HTTP      │
         │    + WebSocket        │
         ▼                       ▼
┌─────────────────────────────────────────┐
│              API Backend                │
│           (Hono + TypeScript)           │
│                                         │
│  Auth │ Users │ Matchs │ Chat │ ...     │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│           Base de données               │
│           (PostgreSQL)                  │
│                                         │
│  Users │ Matchs │ Messages │ Badges │...│
└─────────────────────────────────────────┘
```


1. **L'app mobile** (ce que l'utilisateur voit) est codée en **React Native** avec **Expo** SDK 55. C'est un framework qui permet d'écrire du code une seule fois et de le faire tourner sur iPhone ET Android.

2. **Le site web** est codé en **Next.js** (un framework basé sur React pour le web). Il sert pour le marketing (landing page) et l'administration.

3. **L'API** (le cerveau) est codée en **TypeScript** avec **Hono** (un framework web léger). C'est elle qui gère toute la logique : créer un match, envoyer un message, calculer un score, etc.

4. **La base de données** (la mémoire) est **PostgreSQL**, une base de données relationnelle. C'est là que sont stockées toutes les données : utilisateurs, matchs, messages, etc.

### Les briques technologiques principales

| Brique | Rôle | Analogie simple |
|--------|------|-----------------|
| **React Native / Expo** | Construire l'app mobile | Le "Word" pour fabriquer des apps |
| **Next.js** | Construire le site web | Le "WordPress" en plus puissant |
| **Hono** | Serveur API | Le "serveur au restaurant" qui prend les commandes |
| **PostgreSQL** | Base de données | Le "classeur" qui range toutes les infos |
| **Drizzle ORM** | Communiquer avec la base de données | Le "traducteur" entre le code et la base |
| **Better Auth** | Gérer les connexions (login/logout) | Le "vigile" à l'entrée |
| **React Query** | Gérer les données dans l'app | Le "cache" qui évite de redemander tout au serveur |
| **Zustand** | Gérer l'état local (formulaires) | Le "bloc-notes" temporaire |
| **WebSocket** | Messages en temps réel | Le "talkie-walkie" entre l'app et le serveur |
| **Trigger.dev** | Tâches en arrière-plan | Le "robot" qui fait des trucs pendant que tu dors |

---

## 4. Ce qu'il te faut avant de commencer

### 4.1 Un Mac

Pour développer une app iOS, tu as **besoin d'un Mac**. C'est une contrainte d'Apple, pas de nous. Pour Android, n'importe quel ordinateur fonctionne.

### 4.2 Logiciels à installer

Voici la liste de tout ce qu'il faut installer, dans l'ordre :

#### a) Xcode (pour iPhone)

- **C'est quoi ?** L'outil officiel d'Apple pour développer des apps iPhone.
- **Comment l'installer ?** Ouvre l'App Store sur ton Mac, cherche "Xcode" et installe-le. C'est gratuit mais ça pèse ~12 Go.
- **Après l'installation** : ouvre Xcode une fois pour accepter les licences, puis va dans `Xcode > Settings > Platforms` et installe "iOS 18.x" (le simulateur iPhone).

#### b) Android Studio (pour Android)

- **C'est quoi ?** L'outil officiel de Google pour développer des apps Android.
- **Comment l'installer ?** Va sur [developer.android.com/studio](https://developer.android.com/studio) et télécharge.
- **Après l'installation** : ouvre Android Studio, suis le wizard de setup, et crée un émulateur (Virtual Device) dans le Device Manager.

#### c) Homebrew (gestionnaire de paquets Mac)

- **C'est quoi ?** Un "app store en ligne de commande" pour Mac. Il permet d'installer des outils de développement facilement.
- **Comment l'installer ?** Ouvre le Terminal (cherche "Terminal" dans Spotlight) et colle :

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### d) Node.js (le moteur JavaScript)

- **C'est quoi ?** Le moteur qui fait tourner le JavaScript côté serveur.
- **Comment l'installer ?**

```bash
brew install node@20
```

#### e) Bun (gestionnaire de paquets rapide)

- **C'est quoi ?** Un outil comme npm mais en beaucoup plus rapide. On l'utilise pour installer les dépendances et lancer les scripts.
- **Comment l'installer ?**

```bash
brew install oven-sh/bun/bun
```

#### f) Git (gestion de versions)

- **C'est quoi ?** L'outil qui permet de sauvegarder et partager le code. Pense à Google Docs mais pour le code.
- **Comment l'installer ?**

```bash
brew install git
```

#### g) PostgreSQL (base de données)

- **C'est quoi ?** La base de données où sont stockées toutes les données de l'app.
- **Option recommandée** : utiliser Docker (un outil qui fait tourner la base de données dans un conteneur isolé).

```bash
brew install --cask docker
```

Puis ouvre Docker Desktop depuis le Launchpad.

#### h) Un éditeur de code

- **Recommandé** : [Cursor](https://cursor.sh) (éditeur avec IA intégrée, parfait pour le vibe coding)
- **Alternative** : [VS Code](https://code.visualstudio.com) (gratuit, très populaire)

---

## 5. Installation pas à pas

### Étape 1 : Récupérer le code

Ouvre le Terminal et tape :

```bash
# Aller dans le dossier où tu veux mettre le projet
cd ~/Documents

# Cloner (télécharger) le projet depuis GitHub
git clone https://github.com/miicolas/AceClub.git

# Entrer dans le dossier du projet
cd AceClub
```

### Étape 2 : Installer les dépendances de l'API

```bash
# Aller dans le dossier de l'API
cd services/api

# Installer toutes les dépendances
bun install
```

### Étape 3 : Configurer la base de données

```bash
# Lancer PostgreSQL avec Docker
docker run --name aceclub-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=db -p 5558:5432 -d postgres:16
```

Créer un fichier `.env` dans `services/api/` :

```bash
# Copie-colle ça dans le fichier .env
DATABASE_URL=postgresql://postgres:postgres@localhost:5558/db
BETTER_AUTH_SECRET=une-cle-secrete-pour-le-dev
BETTER_AUTH_URL=http://localhost:3000
```

> Demande les autres variables d'environnement nécessaires (clés API, etc.)

Puis lancer les migrations (créer les tables dans la base de données) :

```bash
bun run drizzle:push
```

### Étape 4 : Installer les dépendances mobile

```bash
# Retourner à la racine du projet
cd ../../apps/mobile

# Installer les dépendances
bun install
```

### Étape 5 : Installer les pods iOS (uniquement sur Mac)

```bash
# Installer les dépendances natives iOS
cd ios && pod install && cd ..
```

> Si `pod` n'est pas trouvé : `brew install cocoapods`

### Étape 6 : Installer les dépendances web (optionnel)

```bash
cd ../../apps/web

bun install
```

---

## 6. Lancer le projet

### 6.1 Lancer l'API (le backend)

```bash
# Depuis services/api/
cd services/api
bun run dev
```

L'API tourne maintenant sur `http://localhost:3000`. Tu peux vérifier en ouvrant cette URL dans ton navigateur — tu devrais voir une réponse.

### 6.2 Lancer l'app mobile

```bash
# Depuis apps/mobile/
cd apps/mobile
bun start
```

Le terminal affiche un QR code et des options :
- Appuie sur `i` pour ouvrir le **simulateur iPhone**
- Appuie sur `a` pour ouvrir l'**émulateur Android**
- Scanne le QR code avec l'app **Expo Go** sur ton vrai téléphone

### 6.3 Lancer le site web (optionnel)

```bash
# Depuis apps/web/
cd apps/web
bun run dev
```

Le site tourne sur `http://localhost:3001`.

### 6.4 Voir la base de données (optionnel)

```bash
# Depuis services/api/
cd services/api
bun run drizzle:studio
```

Ça ouvre **Drizzle Studio**, une interface visuelle pour voir et modifier les données dans la base. Pratique pour débugger.

---

## 7. Structure du projet (où sont les fichiers)

```
AceClub/
│
├── apps/
│   ├── mobile/                 ← L'APP MOBILE (React Native / Expo)
│   │   ├── app/                ← Les écrans (chaque fichier = un écran)
│   │   │   ├── (tabs)/         ← Les 5 onglets en bas de l'app
│   │   │   │   ├── feed/       ← Fil d'actualité
│   │   │   │   ├── matches/    ← Mes matchs
│   │   │   │   ├── discover/   ← Découvrir des joueurs (le swipe)
│   │   │   │   ├── chat/       ← Conversations
│   │   │   │   └── profile/    ← Mon profil
│   │   │   ├── (auth)/         ← Écrans de connexion
│   │   │   └── (onboarding)/   ← Parcours d'inscription
│   │   ├── components/         ← Composants visuels réutilisables
│   │   ├── features/           ← Code organisé par fonctionnalité
│   │   ├── hooks/              ← Logique réutilisable (appels API, etc.)
│   │   ├── services/           ← Communication avec l'API
│   │   └── constants/          ← Couleurs, thème, tailles
│   │
│   └── web/                    ← LE SITE WEB (Next.js)
│       └── src/
│           ├── app/            ← Les pages web
│           ├── components/     ← Composants visuels
│           └── lib/            ← Utilitaires
│
└── services/
    └── api/                    ← L'API BACKEND (Hono)
        ├── db/schema/          ← Structure de la base de données
        ├── server/             ← La logique métier, organisée par domaine
        │   ├── user/           ← Tout ce qui concerne les utilisateurs
        │   ├── match/          ← Tout ce qui concerne les matchs
        │   ├── conversation/   ← Tout ce qui concerne le chat
        │   └── ...             ← (17 domaines au total)
        └── middleware/         ← Vérifications de sécurité (auth, admin)
```

### Comment trouver un fichier ?

| Tu veux modifier... | Va dans... |
|---------------------|-----------|
| L'écran de découverte (swipe) | `apps/mobile/app/(tabs)/discover/` |
| Le design d'une carte joueur | `apps/mobile/features/discover/components/` |
| Les couleurs de l'app | `apps/mobile/constants/` |
| La logique d'un match | `services/api/server/match/` |
| La structure de la base de données | `services/api/db/schema/` |
| La page d'accueil du site | `apps/web/src/app/(marketing)/` |
| Le dashboard admin | `apps/web/src/app/(admin)/dashboard/` |

---

## 8. Comment modifier quelque chose

### 8.1 Le workflow de base

```
1. Tu modifies un fichier dans ton éditeur
2. L'app se rafraîchit automatiquement (hot reload)
3. Tu vois le résultat immédiatement sur le simulateur
4. Si c'est bon, tu sauvegardes avec Git
```

### 8.2 Modifier un texte ou un style dans l'app mobile

Exemple : changer le titre de l'écran Discover.

1. Ouvre le fichier `apps/mobile/app/(tabs)/discover/index.tsx`
2. Cherche le texte que tu veux changer
3. Modifie-le
4. Sauvegarde — l'app se met à jour toute seule

### 8.3 Modifier la logique côté API

Exemple : ajouter un champ à la réponse d'un endpoint.

1. Va dans `services/api/server/<domaine>/queries/` ou `mutations/`
2. Modifie le handler
3. L'API redémarre automatiquement (hot reload avec `bun --hot`)

### 8.4 Modifier la base de données (ajouter un champ)

1. Va dans `services/api/db/schema/<domaine>/`
2. Ajoute ton champ dans le schéma
3. Génère une migration :

```bash
cd services/api
bun run drizzle:generate
```

4. Applique la migration :

```bash
bun run drizzle:push
```

### 8.5 Sauvegarder ses modifications (Git)

```bash
# Voir ce qui a changé
git status

# Ajouter tes modifications
git add .

# Créer un "point de sauvegarde" (commit)
git commit -m "Description de ce que tu as changé"

# Envoyer sur GitHub (partager avec l'équipe)
git push
```

---

## 9. Glossaire

| Terme | Explication simple |
|-------|-------------------|
| **API** | Le "serveur" qui répond aux demandes de l'app. Comme un serveur au restaurant. |
| **Backend** | La partie invisible : serveur, base de données, logique métier. |
| **Frontend** | La partie visible : l'interface de l'app que l'utilisateur voit et touche. |
| **Base de données (DB)** | L'endroit où sont stockées toutes les données (utilisateurs, matchs, messages...). |
| **Migration** | Un changement dans la structure de la base de données (ajouter une colonne, une table...). |
| **Endpoint** | Une "adresse" sur l'API que l'app appelle. Ex: `/api/user/me` pour récupérer son profil. |
| **Dépendances** | Les librairies/outils externes utilisés par le projet. Comme des Legos préfabriqués. |
| **Hot reload** | Le fait que l'app se mette à jour automatiquement quand tu modifies le code. |
| **Simulateur/Émulateur** | Un faux iPhone/Android qui tourne sur ton Mac pour tester l'app. |
| **Git** | Un système de versioning. Permet de sauvegarder l'historique du code, comme un Google Docs. |
| **Commit** | Un "point de sauvegarde" dans Git. Chaque commit a un message qui décrit le changement. |
| **Push** | Envoyer tes commits sur GitHub pour les partager avec l'équipe. |
| **Pull** | Récupérer les dernières modifications de l'équipe depuis GitHub. |
| **Branch** | Une "copie" du code pour travailler sur une feature sans casser le code principal. |
| **PR (Pull Request)** | Une demande pour intégrer tes modifications dans le code principal. L'équipe review avant. |
| **Composant** | Un bout d'interface réutilisable (un bouton, une carte, un header...). |
| **Hook** | Un bout de logique réutilisable (appeler l'API, gérer un état...). |
| **Store** | Un "coffre-fort" pour stocker des données temporaires dans l'app (formulaires en cours...). |
| **Query** | Une requête de lecture (demander des données au serveur). |
| **Mutation** | Une requête d'écriture (modifier des données sur le serveur). |
| **Schema** | La "structure" d'une table dans la base de données (quelles colonnes, quels types...). |
| **Middleware** | Un "filtre" qui s'exécute avant une requête API (vérifier l'auth, les permissions...). |
| **WebSocket** | Une connexion permanente entre l'app et le serveur pour le temps réel (chat). |
| **Docker** | Un outil qui fait tourner des logiciels dans des "boîtes" isolées (conteneurs). |
| **TypeScript** | JavaScript avec des types. Aide à éviter les bugs en vérifiant le code avant qu'il tourne. |
| **ORM** | Un outil qui traduit le code en requêtes SQL pour parler à la base de données. |
| **Feature flag** | Un interrupteur pour activer/désactiver une fonctionnalité sans redéployer l'app. |

---

## Annexe : Commandes utiles

| Commande | Ce qu'elle fait | Où la lancer |
|----------|----------------|--------------|
| `bun install` | Installe les dépendances | N'importe quel dossier du projet |
| `bun run dev` | Lance le serveur de développement | `services/api/` ou `apps/web/` |
| `bun start` | Lance l'app mobile | `apps/mobile/` |
| `bun run drizzle:studio` | Ouvre la base de données visuellement | `services/api/` |
| `bun run drizzle:push` | Applique les changements de schéma | `services/api/` |
| `bun run drizzle:generate` | Génère les fichiers de migration | `services/api/` |
| `git status` | Voir les fichiers modifiés | Partout |
| `git add .` | Préparer tous les fichiers pour le commit | Partout |
| `git commit -m "message"` | Créer un point de sauvegarde | Partout |
| `git push` | Envoyer sur GitHub | Partout |
| `git pull` | Récupérer les dernières modifications | Partout |

---

## 10. Builder l'app pour la distribuer (Expo + EAS)

Jusqu'ici on a fait tourner l'app sur ton simulateur en mode "développeur". Pour la donner à un testeur ou la publier sur l'App Store / Play Store, il faut **builder l'app** — c'est-à-dire la transformer en un vrai fichier installable (`.ipa` pour iPhone, `.aab` pour Android).

On utilise pour ça **EAS Build**, le service cloud d'Expo qui compile l'app sur leurs serveurs (pas besoin que ton Mac fasse le boulot).

### 10.1 Pourquoi pas Expo Go ?

**Expo Go** est l'app gratuite sur l'App Store qui permet de tester rapidement des apps Expo "vanilla". **Mais AceClub ne tourne pas dans Expo Go** : on utilise des modules natifs (Liquid Glass iOS 26, Google Sign-In, expo-maps, notifications push avec APNS, etc.) qu'Expo Go ne supporte pas.

À la place on utilise un **development build** : c'est une version "développeur" de l'app, signée et installable, qui se connecte au bundler Metro sur ton Mac pour le hot reload.

### 10.2 Installer EAS CLI

```bash
bun add -g eas-cli
eas login
```

Demande à un admin d'AceClub de t'ajouter à l'organisation Expo (project ID `55848fd1-bd32-4e6d-bd4b-d8d2066fcdc6`).

### 10.3 Les 3 profils de build (`apps/mobile/eas.json`)

| Profil | À quoi ça sert | Pointeur API |
|--------|---------------|--------------|
| **development** | Dev build avec hot reload, pour bosser au quotidien | celui de ton `.env` (localhost) |
| **preview** | Build de test à filer à des testeurs internes (TestFlight) | `https://api.ace-club.app` (prod) |
| **production** | Build officiel envoyé à l'App Store et Play Store | `https://api.ace-club.app` (prod) |

### 10.4 Faire ton premier dev build (le plus utile au quotidien)

```bash
cd apps/mobile

# Build pour le simulateur iPhone (gratuit, rapide, marche sans Apple Developer)
eas build --profile development --platform ios

# Build pour Android (émulateur ou téléphone)
eas build --profile development --platform android
```

EAS fait le build sur ses serveurs (~10-15 min). À la fin, il te donne un lien `expo.dev/...` avec un bouton "Install" :
- **Simulateur iOS** : drag-and-drop le `.tar.gz` sur le simulateur, ou `eas build:run -p ios --latest`
- **Android** : scanne le QR code ou installe le `.apk`

Une fois installé, tu lances Metro avec `bun start` et l'app dev build s'y connecte.

### 10.5 Quand re-builder le dev client ?

- **Tu modifies du JS/TS, des styles, des composants** → pas besoin de rebuilder, le hot reload suffit.
- **Tu ajoutes une lib avec du code natif** (ex : `expo-haptics`, `expo-maps`) ou tu modifies `app.json` (plugins, permissions) → il **faut** rebuilder le dev client. Sinon l'app crashera au lancement.

### 10.6 Builds physiques (vrai iPhone / vrai Android)

Pour installer sur un **vrai iPhone** (utile pour tester l'appareil photo, les push notifs, GPS) :
1. Inscris ton iPhone dans Apple Developer : `eas device:create`
2. Modifie `eas.json` : passer `"simulator": false` dans le profil development
3. Rebuild : `eas build --profile development --platform ios`
4. EAS t'envoie un lien que tu ouvres depuis Safari sur l'iPhone → "Installer"

Pour **Android** un simple `.apk` suffit, pas besoin de provisioning.

---

## 11. Déployer et mettre à jour l'app en production

### 11.1 Les deux types de mise à jour

C'est **le concept clé** à comprendre : il existe deux façons de mettre à jour une app mobile en prod.

| Type | Quand ? | Comment ? | Délai utilisateur |
|------|---------|-----------|-------------------|
| **OTA (Over-The-Air)** | Tu changes uniquement du **JS/TS, des images, des styles** | `eas update` publie le nouveau JS — l'app le télécharge au prochain lancement | Quasi instantané, pas de review Apple |
| **Build natif** | Tu changes le **code natif** (ajout d'un plugin, modif `app.json`, bump SDK Expo) | `eas build` recompile + `eas submit` envoie à l'App Store / Play Store | Review Apple (24-48h) puis update par l'utilisateur |

**Analogie** : OTA = changer le contenu d'un site web (mise à jour immédiate). Build natif = ré-éditer une application installée sur ton ordi (faut la réinstaller).

### 11.2 Le workflow magique : GitHub Releases

Le repo a déjà tout câblé pour que tu n'aies **rien à faire à la main**. Le mécanisme :

1. Tu pousses ton code sur la branche `dev`.
2. Quand tu veux livrer, tu crées une **GitHub Release** avec un tag comme `v2.1.4` :
   - Sur GitHub : Releases → Draft a new release → tag `v2.1.4` → Publish
   - Ou en ligne de commande : `gh release create v2.1.4 --target dev --generate-notes`
3. GitHub Actions (`.github/workflows/release.yml`) prend le relais :
   - merge `dev` → `main`
   - met à jour la version dans `apps/mobile/app.json`
   - lance le workflow EAS de prod
4. EAS calcule un **"fingerprint" natif** de l'app :
   - **Si le fingerprint est identique à un build prod existant** = pas de changement natif → **OTA update automatique** sur la branch `production`. Les utilisateurs reçoivent la mise à jour en quelques minutes.
   - **Si le fingerprint a changé** = code natif modifié → **nouveau build EAS + soumission automatique à l'App Store et au Play Store**.

**Concrètement, pour livrer une feature :**
- Push sur `dev` → Pull request → merge → GitHub Release → c'est livré.
- Tu ne touches **jamais** `eas build` ou `eas submit` à la main pour la prod.

### 11.3 Pré-requis côté GitHub

Une seule fois, configurer le secret `EXPO_TOKEN` dans Settings → Secrets and variables → Actions du repo. C'est un token Expo (à créer sur expo.dev/accounts/<org>/settings/access-tokens). Sans ça, le workflow plante au step "Setup EAS".

### 11.4 Soumissions manuelles (rare, pour hotfix)

Si tu dois bypass GitHub Releases (urgence) :

```bash
cd apps/mobile

# Forcer une OTA prod tout de suite
eas update --branch production --message "fix: crash launcher"

# Build prod manuel + soumission
eas build --profile production --platform all
eas submit --profile production --platform ios --latest
eas submit --profile production --platform android --latest
```

### 11.5 TestFlight (beta testeurs avant prod)

Le profil `preview` produit un build interne distribuable :

```bash
eas build --profile preview --platform ios
```

EAS uploade le `.ipa` sur App Store Connect → TestFlight → tes testeurs reçoivent une invitation par email pour installer la beta sur leur iPhone.

---

## 12. Déployer l'API et le site web (Railway)

L'app mobile parle à une **API hébergée dans le cloud**. On utilise [Railway](https://railway.app) pour héberger :

| Service | URL prod | Hébergement |
|---------|----------|-------------|
| **API** (Hono) | `https://api.ace-club.app` | Railway — déploiement auto sur push `main` |
| **Site web** (Next.js) | (configuré via `apps/web/railway.toml`) | Railway |
| **PostgreSQL** | Interne à Railway | Railway Postgres add-on |
| **Redis** (pub/sub WebSocket) | Interne à Railway | Railway Redis add-on |
| **MinIO** (stockage photos) | `https://bucket-production-4a13.up.railway.app` | Railway |

### 12.1 Cycle de déploiement API/Web

1. Tu merges une PR dans `main`.
2. Railway détecte le push et redéploie automatiquement les services modifiés.
3. Les variables d'environnement (`.env` de prod) sont configurées **dans le dashboard Railway** (pas dans le repo, c'est secret).
4. Au bout de quelques minutes, la nouvelle version est en ligne.

### 12.2 Les tâches programmées (cron)

Les tâches récurrentes (envoyer une notif streak, expirer des challenges...) ne tournent **pas** sur Railway mais sur **Trigger.dev**, un service spécialisé. Détails complets en [§14](#14-triggerdev-tâches-en-arrière-plan). En résumé :

| Tâche | Fréquence | Ce que ça fait |
|-------|-----------|----------------|
| `assign-weekly-challenges` | Lundis 09:00 UTC | Crée les nouveaux challenges hebdomadaires |
| `expire-challenges` | Tous les jours 00:05 UTC | Expire les challenges dont la deadline est passée |
| `cleanup-expired-intents` | Tous les jours 01:00 UTC | Supprime les match intents périmés |
| `streak-warning` | Vendredis 18:00 UTC | Notif push à ceux qui vont perdre leur streak |
| `update-monthly-badges` | Tous les jours minuit (Paris) | Met à jour les badges mensuels |

### 12.3 Migrations de la base de données

Quand tu modifies un schéma Drizzle (`services/api/db/schema/`) et que ça part en prod :

```bash
# 1. Générer le fichier SQL de migration en local
cd services/api
bun run drizzle:generate

# 2. Commit + push + merge (Railway redéploie)
# 3. Sur Railway : lancer la migration depuis le dashboard
#    (ou ajouter `bun run drizzle:migrate` au startCommand de l'API si on l'automatise)
```

**Règle d'or** : tester la migration en local sur la DB Docker avant de pousser. Une migration cassée en prod = downtime.

---

## 13. Pour aller plus loin

### 13.1 Récap du flow complet d'une nouvelle feature

1. **Récupérer la dernière version** : `git pull` sur `dev`
2. **Créer une branche** : `git checkout -b feat/ma-feature`
3. **Coder** : modifier le mobile + l'API + éventuellement la DB
4. **Tester en local** : Docker + API + Metro + dev build sur simulateur
5. **Commit + push** : `git add . && git commit -m "feat: ..." && git push`
6. **Pull Request** sur GitHub → review → merge dans `dev`
7. **Release** : créer une GitHub Release `vX.Y.Z` quand on est prêts à livrer
8. **EAS + Railway font le reste tout seuls** (OTA ou build, redéploiement API)

### 13.2 Ce qui n'est pas couvert dans ce livre blanc

- **Tests** : pas encore de suite de tests automatisés sur le mobile (chantier en cours, Phase 13 de la migration).
- **Monitoring** : pas de Sentry/PostHog configuré pour l'instant — quand un user crash, on n'a pas la stack trace remontée.
- **Feature flags** : il y a un système de feature flags en DB (`feature_flag` table) géré depuis le dashboard admin, mais pas documenté ici.

### 13.3 Où demander de l'aide

- **Pour comprendre le code** : `mgrep "ta question" --store "aceclub" -a -m 20` (cf. `CLAUDE.md`) — c'est un assistant IA qui répond avec la source.
- **Pour les bugs prod** : dashboard Railway (logs) + Drizzle Studio (DB) + dashboard Expo (crash reports).
- **Pour les soumissions stores** : dashboard App Store Connect + Google Play Console.

### 13.4 Glossaire complémentaire

| Terme | Explication simple |
|-------|--------------------|
| **EAS** | Expo Application Services. Le cloud d'Expo qui build, signe et soumet ton app. |
| **OTA update** | Over-The-Air. Mise à jour du JS de l'app sans repasser par l'App Store. |
| **Fingerprint** | Empreinte du code natif. EAS s'en sert pour décider OTA vs rebuild. |
| **TestFlight** | App d'Apple pour distribuer des beta privées avant la sortie en prod. |
| **App Store Connect** | Le dashboard Apple pour gérer les apps publiées. |
| **Provisioning profile** | Un certificat qui autorise une app à tourner sur un iPhone donné. EAS le gère pour toi. |
| **Railway** | L'hébergeur cloud où tournent l'API, le site, Postgres et Redis. |
| **Cron** | Une tâche programmée qui tourne automatiquement à une heure donnée. |
| **Dev build** | Une version "développeur" de l'app, hot-reloadable, qui remplace Expo Go. |

---

**Bienvenue chez AceClub.** Bon code.

---

## 14. Trigger.dev (tâches en arrière-plan)

### 14.1 C'est quoi et pourquoi on en a besoin

Une API "classique" répond à une requête en quelques millisecondes : l'utilisateur clique, le serveur répond. Mais certaines choses ne tiennent pas dans une requête :

- **Tâches récurrentes** : "tous les lundis matin, distribuer des nouveaux challenges à 50 000 joueurs" — ça prend plusieurs minutes, faut le faire automatiquement.
- **Tâches longues** : envoyer 10 000 notifications push, redimensionner une vidéo, faire appel à OpenAI sur une grosse génération.
- **Tâches qui doivent retry** : si une notif APNS échoue, on veut réessayer dans 30 secondes, puis dans 2 minutes, etc.

**Trigger.dev** est un service externe spécialisé là-dedans. On lui dit "voici une fonction TypeScript, exécute-la tous les lundis à 9h UTC, retry 3 fois si elle plante, log-moi tout". Il s'occupe du planning, des retries, des logs, de la scalabilité.

**Analogie** : si l'API est le serveur du restaurant, Trigger.dev est le **commis en cuisine** qui prépare des plats en parallèle pendant que le serveur continue de prendre les commandes.

### 14.2 Comment c'est branché ici

Tout est dans `services/api/trigger/` :

```
services/api/
├── trigger.config.ts            ← config : projet Trigger.dev, retries, etc.
└── trigger/
    ├── assign-weekly-challenges.ts   ← lundi 09:00 UTC
    ├── expire-challenges.ts          ← daily 00:05 UTC
    ├── cleanup-expired-intents.ts    ← daily 01:00 UTC
    ├── streak-warning.ts             ← vendredi 18:00 UTC
    ├── update-monthly-badges.ts      ← daily minuit Paris
    └── index.ts                      ← barrel export
```

Chaque tâche est une **fonction TypeScript** qui ressemble à ça :

```typescript
import { schedules } from "@trigger.dev/sdk";

export const streakWarningTask = schedules.task({
  id: "streak-warning",
  cron: { pattern: "0 18 * * 5", timezone: "UTC" },  // vendredi 18:00 UTC
  run: async (payload) => {
    // ... la logique : récupérer les users en streak, envoyer les notifs
    return { success: true };
  },
});
```

Le `cron pattern` est la **syntaxe cron standard** : `minute heure jour-du-mois mois jour-de-la-semaine`. `0 18 * * 5` = minute 0, heure 18, n'importe quel jour/mois, jour de la semaine 5 (vendredi).

### 14.3 Les 5 tâches actuelles, en détail

| Tâche | Quand | Ce que ça fait concrètement |
|-------|-------|------------------------------|
| **`assign-weekly-challenges`** | Lundi 09:00 UTC (`0 9 * * 1`) | Appelle `assignWeeklyChallenges()` qui pour chaque joueur sélectionne 3 challenges hebdo selon son niveau, crée des rows `user_challenge`, prépare les rewards. |
| **`expire-challenges`** | Daily 00:05 UTC (`5 0 * * *`) | Passe tous les `user_challenge` dont `expiresAt < now` à l'état `expired`. Empêche un joueur de compléter un challenge dont la fenêtre est passée. |
| **`cleanup-expired-intents`** | Daily 01:00 UTC (`0 1 * * *`) | Supprime les `match_intent` dont la date est passée. Évite que Discover affiche des intentions périmées. |
| **`streak-warning`** | Vendredi 18:00 UTC (`0 18 * * 5`) | Trouve tous les joueurs avec un streak actif qui n'ont pas joué cette semaine et leur envoie une notif push "Plus que 2 jours pour garder ton streak !". |
| **`update-monthly-badges`** | Daily 00:00 Europe/Paris (`0 0 * * *`) | Recalcule l'éligibilité aux badges mensuels (ex: "20 matchs ce mois-ci") et débloque ceux qui passent le seuil. |

### 14.4 Les retries automatiques

Configuré dans `trigger.config.ts` (cf. lignes 7-15) : chaque tâche qui plante est **rejouée jusqu'à 3 fois**, avec un délai exponentiel (1s, 2s, 4s, 8s... jusqu'à 30s max) + un peu de randomisation pour éviter les "thundering herds" si plusieurs tâches échouent en même temps.

`enabledInDev: false` = en local on ne retry pas (sinon on s'embrouille avec des doublons quand on debug).

### 14.5 Développer localement une tâche Trigger.dev

```bash
cd services/api

# Lancer le "dev server" Trigger.dev en local
bun run trigger:dev
```

Ça ouvre une connexion entre ta machine et le cloud Trigger.dev. Tu peux :
- Voir tes tâches sur https://cloud.trigger.dev/orgs/.../projects/proj_zqlindsznuttfkofouqq
- **Trigger manuellement** une tâche depuis le dashboard (bouton "Test") — utile pour tester sans attendre vendredi 18h.
- Voir les logs en temps réel dans le terminal et dans le dashboard.

**Workflow type pour ajouter une nouvelle tâche planifiée** :
1. Créer `services/api/trigger/ma-nouvelle-tache.ts` sur le modèle existant.
2. Lancer `bun run trigger:dev` — Trigger.dev détecte la nouvelle tâche et l'enregistre.
3. Cliquer "Test" dans le dashboard pour la déclencher manuellement.
4. Commit + push.
5. Au prochain `bun run trigger:deploy` (cf. §14.6), le cron sera enregistré pour de bon en prod.

### 14.6 Déployer en production

Trigger.dev ne se déploie **pas** automatiquement avec l'API Railway. Il faut une commande explicite :

```bash
cd services/api
bun run trigger:deploy
```

Ça :
1. Bundle le code des tâches (avec `pg` en externe, cf. `trigger.config.ts:18`).
2. Upload sur Trigger.dev cloud.
3. Met à jour les crons (création / suppression / modification de pattern).

À faire après chaque modification de `trigger/`. **Tu peux automatiser** ce déploiement en ajoutant le step au workflow GitHub Actions, mais ce n'est pas fait aujourd'hui.

### 14.7 Quand utiliser Trigger.dev vs un appel API direct ?

| Cas | Outil |
|-----|-------|
| Action immédiate suite à un clic user (envoyer un message, créer un match) | Endpoint Hono classique, dans `server/<domaine>/mutations/` |
| Action récurrente automatique (daily, weekly, monthly) | Tâche Trigger.dev `schedules.task` |
| Action longue déclenchée par un user (générer un rapport IA, traiter une vidéo) | Tâche Trigger.dev déclenchée depuis Hono avec `myTask.trigger({...})`, puis on renvoie `202 Accepted` au user pour qu'il ne bloque pas |
| Action fan-out (envoyer 5000 notifs en parallèle) | Tâche Trigger.dev avec `batchTrigger` pour paralléliser |

Pour l'instant AceClub n'utilise Trigger.dev **que pour les 5 schedules** ci-dessus. C'est l'endroit naturel où mettre du traitement IA, du resize d'images uploadées, des rapports d'analytics, etc.

### 14.8 Variables d'environnement Trigger.dev

Côté API, deux clés sont nécessaires (cf. `.env.example`) :

- `TRIGGER_SECRET_KEY` : token serveur, format `tr_dev_xxx` (dev) ou `tr_prod_xxx` (prod). Récupérable dans le dashboard Trigger.dev → Settings → API Keys.
- (côté `trigger.config.ts`, le `project` est en dur : `proj_zqlindsznuttfkofouqq` — c'est l'identifiant public du projet, pas un secret).

En prod sur Railway, mettre `TRIGGER_SECRET_KEY` avec un token `tr_prod_...` pour que les tâches qui appellent l'API (push notifs via l'API mobile, par exemple) puissent s'authentifier.

## 15.8 Possibilité de migration des services 

### 15.1 Github Repo

Il est possible de faire un transfère de repo Github permettant la possibilité d'acquérir le code source de la plateforme. Il nécessitera donc le besoin d'une reconnexion des serveurs Railway, permettant la mise à jour automatique des commits sur le serveur et d'effectuer les migrations pour la base de données. 

Si cela n'est pas fait alors l'API de l'application ne sera pas mis à jour. 

###
