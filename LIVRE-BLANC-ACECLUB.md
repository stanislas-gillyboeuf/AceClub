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
- **Email + mot de passe**

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


1. **L'app mobile** (ce que l'utilisateur voit) est codée en **React Native** avec **Expo**. C'est un framework qui permet d'écrire du code une seule fois et de le faire tourner sur iPhone ET Android.

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
