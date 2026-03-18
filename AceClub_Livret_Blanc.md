# Livret Blanc — AceClub

> **Version** : 1.0
> **Date** : Mars 2026
> **Auteur** : Équipe AceClub

---

## Table des matières

1. [Présentation du projet](#1-présentation-du-projet)
2. [Architecture générale](#2-architecture-générale)
3. [Application mobile (iOS & Android)](#3-application-mobile-ios--android)
4. [Application web (Marketing & Admin)](#4-application-web-marketing--admin)
5. [API Backend](#5-api-backend)
6. [Base de données](#6-base-de-données)
7. [Authentification & Sécurité](#7-authentification--sécurité)
8. [Temps réel & Notifications](#8-temps-réel--notifications)
9. [Infrastructure & Déploiement](#9-infrastructure--déploiement)
10. [Services externes](#10-services-externes)
11. [Fonctionnalités détaillées](#11-fonctionnalités-détaillées)
12. [Stack technique récapitulative](#12-stack-technique-récapitulative)

---

## 1. Présentation du projet

**AceClub** est une application mobile gratuite conçue pour connecter les joueurs de tennis et de padel au sein de leurs clubs. Elle facilite l'organisation de matchs, la découverte de partenaires, la communication entre joueurs, et le suivi de progression via un système de gamification complet.

### Objectifs principaux

- Permettre aux joueurs de trouver des partenaires de niveau adapté
- Organiser et suivre les matchs (scores, sets, commentaires, feedback)
- Communiquer en temps réel entre joueurs (messagerie instantanée)
- Motiver les joueurs grâce à un système de niveaux, badges, défis et classements
- Gérer les clubs (organisations) avec rôles d'administration

### Plateformes

| Plateforme | Technologie | Distribution |
|-----------|------------|-------------|
| **iOS** | React Native (Expo) | App Store |
| **Android** | React Native (Expo) | Google Play |
| **Web** | Next.js | ace-club.app |

---

## 2. Architecture générale

Le projet est organisé en **trois applications indépendantes** partageant une API commune :

```
AceClub/
├── apps/
│   ├── mobile/          # Application mobile React Native Expo
│   └── web/             # Site web Next.js (marketing + admin)
└── services/
    └── api/             # API REST Hono + Drizzle ORM
```

### Flux de données

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Mobile    │     │     Web     │     │    Admin    │
│  (Expo)     │     │  (Next.js)  │     │  (Next.js)  │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                    ┌──────▼──────┐
                    │   API REST  │
                    │   (Hono)    │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
       ┌──────▼──────┐ ┌──▼───┐ ┌──────▼──────┐
       │ PostgreSQL  │ │Redis │ │  S3/MinIO   │
       │  (Drizzle)  │ │      │ │  (Fichiers) │
       └─────────────┘ └──────┘ └─────────────┘
```

### Flux côté mobile

```
Component → React Query Hook → Service HTTP → API Client → Backend API
```

### Flux côté web

```
Page / Component → React Query Hook → API Client → Backend API
```

### Flux côté API

```
Router (Hono) → Middleware (auth) → Validator (Zod) → Handler → Database (Drizzle)
```

---

## 3. Application mobile (iOS & Android)

### Stack technique

| Couche | Technologie |
|--------|------------|
| Framework | React Native + Expo SDK 55 (New Architecture + React Compiler) |
| Navigation | Expo Router (file-based routing, typed routes) |
| State serveur | React Query v5 |
| State client | Zustand (formulaires multi-étapes uniquement) |
| Authentification | Better Auth (`@better-auth/expo`) |
| Animations | React Native Reanimated v4 |
| Design | `expo-glass-effect` (Liquid Glass iOS 26+) |
| Icônes | `lucide-react-native`, SF Symbols (iOS), Material Icons (Android) |
| Temps réel | WebSocket natif |
| Notifications | Firebase Cloud Messaging (FCM) |

### Structure des dossiers

```
apps/mobile/
├── app/                    # Routes (Expo Router)
│   ├── _layout.tsx         # Layout racine + providers
│   ├── (tabs)/             # Navigation par onglets
│   │   ├── feed/           # Fil d'activité, classements, progression
│   │   ├── matches/        # Liste et création de matchs
│   │   ├── chat/           # Conversations
│   │   ├── discover/       # Découverte de partenaires
│   │   └── profile/        # Profil, paramètres, admin
│   ├── (auth)/             # Authentification (sign-in)
│   ├── (onboarding)/       # Onboarding post-inscription
│   └── conversation/       # Vue détaillée d'une conversation
├── components/             # Composants UI partagés
│   └── ui/                 # Composants de base (button, card, avatar, skeleton...)
├── features/               # Modules par fonctionnalité
│   ├── auth/               # Composants d'authentification
│   ├── chat/               # UI et utilitaires de chat
│   ├── discover/           # Interface de découverte
│   ├── events/             # Événements
│   ├── feed/               # Cartes et composants du fil
│   ├── leaderboard/        # Affichage des classements
│   ├── match-intent/       # Création de disponibilités
│   ├── matches/            # Organisation et détail des matchs
│   ├── onboarding/         # Assistant de configuration
│   ├── profile/            # Affichage et édition du profil
│   ├── progression/        # Suivi des niveaux
│   └── settings/           # Préférences utilisateur
├── hooks/                  # Hooks React Query globaux
├── services/               # Wrappers HTTP par domaine
├── lib/                    # Utilitaires (api client, auth, WebSocket...)
├── store/                  # Zustand stores
├── types/                  # Types TypeScript
└── constants/              # Thème, couleurs, spacing
```

### Navigation principale (5 onglets)

| Onglet | Icône | Fonctionnalités |
|--------|-------|----------------|
| **Feed** | Maison | Statistiques, progression de niveau, matchs récents, événements |
| **Matches** | Court de tennis | Liste des matchs, création, détail, scores, feedback |
| **Chat** | Messages | Conversations, messagerie temps réel, réactions |
| **Discover** | Recherche | Découverte de partenaires, création de disponibilités, swipe |
| **Profile** | Personne | Profil utilisateur, paramètres, administration du club |

### Parcours utilisateur principal

1. **Inscription** : Connexion Apple/Google → Onboarding (nom, genre, date de naissance, club, sport, niveau, photo, notifications, localisation) → Feed
2. **Trouver un partenaire** : Onglet Discover → Créer une disponibilité ou parcourir → Swipe like/pass → Match mutuel
3. **Organiser un match** : Onglet Matches → Créer → Détails → Inviter → Jouer → Scores → Feedback
4. **Progresser** : Jouer des matchs → Gagner des Aces → Monter de niveau → Débloquer des badges
5. **Communiquer** : Onglet Chat → Conversations → Messages en temps réel

### Services HTTP (couche API)

| Service | Domaine |
|---------|---------|
| `user.ts` | Profil et gestion de compte |
| `match.ts` | CRUD matchs, scores, feedback |
| `match-intent.ts` | Propositions de disponibilité |
| `conversation.ts` | Messagerie et chat |
| `organization.ts` | Gestion des clubs |
| `leaderboard.ts` | Classements |
| `level.ts` | Système de progression |
| `challenge.ts` | Défis hebdomadaires |
| `reward.ts` | Badges et récompenses |
| `streak.ts` | Suivi des séries |
| `event.ts` | Gestion des événements |
| `notification.ts` | Notifications push |
| `upload.ts` | Upload d'images/fichiers |
| `admin.ts` | Opérations d'administration |

---

## 4. Application web (Marketing & Admin)

### Stack technique

| Couche | Technologie |
|--------|------------|
| Framework | Next.js 16 (App Router) + React 19 |
| Styling | Tailwind CSS 4 + shadcn/ui (style New York) |
| State | React Query v5 |
| Tableaux | TanStack Table v8 |
| Authentification | Better Auth (organization + admin plugins) |
| Animations | Framer Motion |
| Graphiques | Recharts |
| Icônes | Lucide React |

### Structure

```
apps/web/src/
├── app/
│   ├── (marketing)/              # Site public (Server Components)
│   │   ├── page.tsx              # Landing page (hero, features, pricing)
│   │   ├── contact/              # Formulaire de contact
│   │   ├── cgu/                  # Conditions générales
│   │   ├── privacy/              # Politique de confidentialité
│   │   └── delete-account/       # Suppression de compte
│   ├── (admin)/                  # Dashboard admin (Client Components)
│   │   └── dashboard/
│   │       ├── users/            # Gestion des utilisateurs
│   │       ├── organizations/    # Gestion des clubs
│   │       ├── matches/          # Statistiques des matchs
│   │       ├── events/           # Gestion des événements
│   │       ├── feature-flags/    # Feature flags
│   │       └── deletion-requests/# Demandes de suppression
│   ├── (auth)/                   # Page de connexion
│   └── api/contact/              # API route (envoi d'email)
├── components/
│   ├── ui/                       # shadcn/ui (button, card, dialog, table...)
│   ├── custom/                   # Composants métier (data-table, colonnes...)
│   └── sections/                 # Sections marketing (hero, features...)
├── hooks/                        # Hooks React Query
└── lib/                          # Utilitaires (auth-client, api-client, config)
```

### Pages marketing (Server Components)

- **Landing page** : Hero, fonctionnalités, tarification, FAQ, CTA
- **Contact** : Formulaire d'envoi d'email via Resend
- **CGU & Confidentialité** : Pages légales
- **Suppression de compte** : Formulaire RGPD

### Dashboard admin (Client Components)

| Section | Fonctionnalité |
|---------|---------------|
| **Utilisateurs** | Tableau de gestion, rôles, bannissement |
| **Organisations** | Administration des clubs |
| **Matchs** | Statistiques et vue d'ensemble |
| **Événements** | Gestion des événements |
| **Feature flags** | Activation/désactivation de fonctionnalités |
| **Demandes de suppression** | Traitement des demandes RGPD |

**Accès** : Protégé par vérification `session.user.role === "admin"` dans le layout.

---

## 5. API Backend

### Stack technique

| Couche | Technologie |
|--------|------------|
| Runtime | Bun |
| Framework | Hono 4.x |
| ORM | Drizzle ORM 0.45 |
| Base de données | PostgreSQL |
| Validation | Zod + Hono Zod Validator |
| Authentification | Better Auth 1.5 |
| Cache | Redis |
| Stockage fichiers | MinIO (S3-compatible) + Sharp |
| Jobs planifiés | Trigger.dev |
| WebSocket | Bun natif + Redis pub/sub |
| IDs | ULID |

### Structure

```
services/api/
├── index.ts                 # Point d'entrée (serveur Bun, CORS, WebSocket)
├── auth.ts                  # Configuration Better Auth
├── db/
│   ├── index.ts             # Connexion PostgreSQL
│   └── schema/              # 15 modules de schéma Drizzle
├── middleware/
│   ├── auth.ts              # authMiddleware, requireAuth
│   ├── admin.ts             # isAdmin
│   ├── org-member.ts        # assertOrgAdmin
│   └── cors.ts              # Configuration CORS
├── server/
│   ├── router.ts            # Router principal
│   └── [17 domaines]/       # Routers par domaine
└── lib/
    ├── cache.ts             # Utilitaires de cache Redis
    ├── redis.ts             # Client Redis
    └── minio.ts             # Utilitaires S3/MinIO
```

### 17 domaines API

| Domaine | Route | Description |
|---------|-------|-------------|
| **user** | `/api/user/*` | Profil, préférences, recherche, onboarding |
| **match** | `/api/match/*` | CRUD matchs, scores, commentaires, photos, feedback, likes |
| **match_intents** | `/api/match-intents/*` | Disponibilités, swipe like/pass, demandes de match |
| **conversation** | `/api/conversation/*` | Chat, messages, pièces jointes, réactions, mute |
| **event** | `/api/event/*` | Événements (style Luma), inscriptions, participants |
| **organization** | `/api/organization/*` | Clubs, membres, invitations, PIN, demandes |
| **level** | `/api/level/*` | Niveau utilisateur, historique des Aces |
| **challenge** | `/api/challenge/*` | Défis hebdomadaires, templates |
| **reward** | `/api/reward/*` | Badges, titres, équipement |
| **streak** | `/api/streak/*` | Suivi des séries de jeu |
| **leaderboard** | `/api/leaderboard/*` | Classements global, club, hebdomadaire |
| **notification** | `/api/notification/*` | Push, tokens, historique, lecture |
| **upload** | `/api/upload/*` | Upload images (utilisateur, logo club) |
| **e2ee** | `/api/e2ee/*` | Échange de clés de chiffrement |
| **admin** | `/api/admin/*` | Gestion admin (utilisateurs, sessions, feature flags) |
| **cron** | `/api/cron/*` | Jobs planifiés (défis, nettoyage) |
| **account-deletion** | `/api/account-deletion-request/*` | Demandes de suppression RGPD |

### Structure d'un domaine

```
server/<domaine>/
├── router.ts        # Routes et middlewares
├── validators.ts    # Schémas Zod de validation
├── queries/         # Handlers GET
│   └── index.ts
└── mutations/       # Handlers POST/PUT/DELETE
    └── index.ts
```

### Middlewares

| Middleware | Rôle |
|-----------|------|
| `authMiddleware` | Auth optionnelle (set user/session si présent) |
| `requireAuth` | Auth obligatoire (401 si non authentifié) |
| `isAdmin` | Admin uniquement (403 si pas admin) |
| `assertOrgAdmin` | Vérifie owner/admin de l'organisation |

### Conventions

- **Routes** : kebab-case (`/list-users`)
- **JSON** : camelCase (`{ userId: "..." }`)
- **IDs** : `ulid()` pour tous les identifiants
- **Erreurs** : `{ error: "Type", message: "Description" }`
- **Codes HTTP** : 200 (succès), 201 (créé), 400 (validation), 401 (non authentifié), 403 (interdit), 404 (non trouvé)

---

## 6. Base de données

### Technologie

- **SGBD** : PostgreSQL 17
- **ORM** : Drizzle ORM avec migrations
- **Gestion** : `drizzle-kit` pour les migrations et Drizzle Studio pour l'exploration

### 15 modules de schéma

#### Auth (tables principales)

| Table | Description |
|-------|-------------|
| `user` | Utilisateurs (nom, email, image, genre, date de naissance, onboarding, ghost) |
| `session` | Sessions avec `activeOrganizationId` (multi-club) |
| `account` | Providers OAuth (Google, Apple), liaison de comptes |
| `verification` | Tokens de vérification email/téléphone |
| `organization` | Clubs (nom, adresse, latitude, longitude, PIN) |
| `member` | Adhésions avec rôles (owner, admin, member) |
| `invitation` | Invitations aux clubs |

#### Match (7 tables)

| Table | Description |
|-------|-------------|
| `match` | Matchs (type, statut, date, durée, lieu) |
| `match_participant` | Participants (équipe domicile/extérieur, vainqueur) |
| `set` | Sets de tennis/padel (jusqu'à 5) |
| `set_score` | Score par set par équipe |
| `match_feedback` | Feedback post-match (bad/average/good/great) |
| `match_photo` | Photos de match |
| `match_like` | Likes sur les matchs |
| `match_comment` | Commentaires sur les matchs |

#### Conversation (4 tables)

| Table | Description |
|-------|-------------|
| `conversation` | Salons de chat (match/groupe/direct), clés de chiffrement |
| `conversation_participant` | Participants (statut de lecture, mute, suppression soft) |
| `message` | Messages (E2EE, pièces jointes, réponses) |
| `message_reaction` | Réactions emoji sur les messages |

#### Match Intents (3 tables)

| Table | Description |
|-------|-------------|
| `match_intent` | Disponibilités (date, heure, durée) |
| `match_intent_swipe` | Like/pass sur les intents |
| `match_request` | Demandes confirmées (pending/accepted/rejected) |

#### Gamification (9 tables)

| Table | Description |
|-------|-------------|
| `user_level` | Niveau et total d'Aces |
| `aces_transaction` | Transactions de points (participation, victoire, défi, streak, bonus) |
| `challenge_template` | Templates de défis (type, difficulté, récompense) |
| `user_challenge` | Défis assignés (progression, expiration) |
| `badge` | Définitions de badges (code, catégorie, nom, image, niveau requis) |
| `user_badge` | Badges débloqués |
| `title` | Définitions de titres (niveau requis) |
| `user_title` | Titre équipé par utilisateur |
| `user_streak` | Séries (actuelle, la plus longue, dernière semaine active) |

#### Autres modules

| Table | Description |
|-------|-------------|
| `event` | Événements (statut, capacité, prix) |
| `event_participant` | Inscriptions (registered/waitlisted/cancelled) |
| `device_token` | Tokens push (iOS/Android, statut actif) |
| `notification` | Historique des notifications |
| `user_e2ee_key` | Clés publiques et backup chiffré |
| `user_preference` | Préférences utilisateur |
| `feature_flag` | Feature flags |
| `club_request` | Demandes d'adhésion aux clubs |
| `account_deletion_request` | Demandes de suppression de compte |

---

## 7. Authentification & Sécurité

### Better Auth

| Fonctionnalité | Détail |
|---------------|--------|
| **Providers sociaux** | Google (offline access), Apple (appBundleIdentifier: `dev.aceclub.app`) |
| **Email/mot de passe** | Activé (développement) |
| **Tokens** | Bearer token (mobile), cookies (web) |
| **Liaison de comptes** | Permet de lier Google + Apple au même compte |
| **Multi-organisation** | Un utilisateur peut appartenir à plusieurs clubs |

### Plugins Better Auth

| Plugin | Rôle |
|--------|------|
| `expo()` | Support SDK Expo mobile |
| `bearer()` | Authentification par Bearer token |
| `admin()` | Gestion des rôles administrateur |
| `organization()` | Multi-club avec champs personnalisés (adresse, GPS, PIN) |
| `phoneNumber()` | Support numéro de téléphone |

### Hooks d'authentification

- **Création utilisateur** : Attribution automatique du badge "premiers_pas"
- **Création session** : Définition de `activeOrganizationId` sur la première adhésion
- **Création compte OAuth** : Retrait du flag `isGhost` si liaison OAuth

### Origines de confiance

`localhost`, `aceclub://`, `mobile://`, `ace-club.app`, `exp://` (dev Expo)

### Chiffrement de bout en bout (E2EE)

- Échange de clés publiques via API
- Sauvegarde de clé privée chiffrée
- Cache Redis des clés publiques (1 heure)
- Prêt pour le chiffrement des messages de chat

---

## 8. Temps réel & Notifications

### WebSocket

| Aspect | Détail |
|--------|--------|
| **Endpoint** | `/ws/chat` (WebSocket natif Bun) |
| **Auth** | Query params : `?token=<bearer>` ou `?cookie=<session>` |
| **Fonctionnalités** | Messages, indicateurs de frappe, accusés de lecture |
| **Multi-pod** | Redis pub/sub pour synchronisation entre instances |
| **Reconnexion** | Automatique avec backoff exponentiel (max 5 tentatives) |
| **Heartbeat** | Ping/pong pour maintien de connexion |

### Notifications push

| Type | Déclencheur |
|------|------------|
| `match_request_accepted` | Demande de match acceptée |
| `new_match_request` | Nouvelle demande de match |
| `match_reminder` | Rappel avant un match |
| `challenge_assigned` | Nouveau défi hebdomadaire |
| `streak_warning` | Alerte série en danger |
| `new_message` | Nouveau message de chat |
| `match_liked` | Like sur un match |
| `invitation_accepted` | Invitation au club acceptée |

**Service** : Expo Server SDK → Tokens FCM/APNs → Désactivation automatique des tokens invalides.

### Cache Redis

| Clé | TTL | Usage |
|-----|-----|-------|
| `user:me:<userId>` | 1 min | Profil utilisateur |
| `leaderboard:global:*` | 5 min | Classement global |
| `leaderboard:weekly:*` | 5 min | Classement hebdomadaire |
| `leaderboard:org:<orgId>:*` | 5 min | Classement par club |
| `org:stats:<orgId>` | 15 min | Statistiques club |
| `e2ee:pubkey:<userId>` | 1 heure | Clé publique E2EE |

---

## 9. Infrastructure & Déploiement

### Environnement de développement

| Service | Configuration |
|---------|--------------|
| PostgreSQL | Docker Compose, port 5558 |
| API | Bun, port 3000 (hot reload) |
| Web | Next.js dev server, port 3000 |
| Mobile | Expo dev client |

### Production

| Application | Plateforme | Domaine |
|------------|-----------|---------|
| **Web** | Railway | `ace-club.app` |
| **API** | Railway | Port 3000 |
| **PostgreSQL** | Railway | Via `DATABASE_URL` |
| **Redis** | Railway | Via `REDIS_PUBLIC_URL` |
| **S3/MinIO** | Railway | Bucket de fichiers |
| **Mobile iOS** | App Store (via EAS) | - |
| **Mobile Android** | Google Play (via EAS) | - |

### CI/CD

#### Déploiement mobile (EAS)

1. Déclenchement via création de release GitHub (tag)
2. Merge automatique `dev` → `main`
3. Mise à jour de la version dans `app.json`
4. Build parallèle iOS + Android via EAS
5. Soumission App Store (iOS)
6. Vérification de fingerprint pour mise à jour OTA si build existant

#### Workflow GitHub Actions

- **`release.yml`** : Auto-increment version, merge dev → main, tag, déploiement mobile via EAS

### Jobs planifiés (Trigger.dev)

| Job | Fréquence | Description |
|-----|-----------|-------------|
| `assign-weekly-challenges` | Lundi 00:00 UTC | Assigner les nouveaux défis hebdomadaires |
| `expire-challenges` | Quotidien 00:05 UTC | Marquer les défis expirés |
| `streak-warning` | Vendredi 18:00 UTC | Alerter les séries en danger |
| `cleanup-expired-intents` | Quotidien 01:00 UTC | Nettoyer les disponibilités expirées |

---

## 10. Services externes

| Service | Usage | Configuration |
|---------|-------|--------------|
| **PostgreSQL** | Base de données principale | `DATABASE_URL` |
| **Redis** | Cache, pub/sub temps réel | `REDIS_PUBLIC_URL` |
| **Google OAuth** | Connexion sociale | `GOOGLE_CLIENT_ID/SECRET` |
| **Apple OAuth** | Connexion sociale iOS | `APPLE_CLIENT_ID/SECRET` |
| **MinIO / AWS S3** | Stockage fichiers (photos, logos) | `MINIO_*` |
| **Expo / EAS** | Build et déploiement mobile | `.eas/workflows/` |
| **Trigger.dev** | Jobs planifiés et tâches en arrière-plan | `TRIGGER_SECRET_KEY` |
| **Resend** | Envoi d'emails (formulaire de contact) | `RESEND_API_KEY` |
| **APNs** | Notifications push iOS | Certificats `APNS_*` |
| **Railway** | Hébergement production (web, API, BDD, Redis) | `railway.toml` |

---

## 11. Fonctionnalités détaillées

### 11.1 Gestion des matchs

- **Création** : Type (match/entraînement), sport, participants, date, lieu
- **Suivi des scores** : Jusqu'à 5 sets avec score détaillé par jeu
- **Feedback post-match** : Sensation de jeu (bad/average/good/great)
- **Commentaires** : Discussion sur chaque match
- **Photos** : Upload de photos de match
- **Likes** : Les joueurs peuvent liker un match

### 11.2 Découverte de partenaires

- **Intentions de match** : Les joueurs publient leurs disponibilités (date, heure, durée)
- **Système de swipe** : Like/pass sur les disponibilités des autres joueurs
- **Matching mutuel** : Création automatique d'une demande de match si like réciproque
- **Filtres** : Par niveau, sport, disponibilité

### 11.3 Gamification

#### Points (Aces)

| Source | Description |
|--------|-------------|
| Participation à un match | Points de base |
| Victoire | Bonus victoire |
| Défi complété | Récompense du défi |
| Série maintenue | Bonus multiplicateur |
| Montée de niveau | Bonus one-shot |
| Badge débloqué | Bonus one-shot |

#### Niveaux

- Progression par accumulation d'Aces
- Chaque niveau requiert un seuil d'Aces croissant
- Affichage sur le profil et dans les classements

#### Défis hebdomadaires

- Assignés automatiquement chaque lundi
- Types : quantitatifs (nombre de matchs), sociaux (partenaires différents), performance
- Récompensés en Aces selon la difficulté
- Expiration automatique

#### Séries (Streaks)

- Semaines consécutives de jeu
- Multiplicateur de points (ex: série de 4 semaines = x1.2)
- Alerte le vendredi si série en danger

#### Badges & Titres

- Badges débloqués par accomplissements
- Titres équipables sur le profil (un seul actif)
- Badge "premiers_pas" attribué automatiquement à l'inscription

#### Classements

| Type | Portée |
|------|--------|
| Global | Tous les joueurs de la plateforme |
| Club | Joueurs au sein d'un club |
| Hebdomadaire | Meilleurs performeurs de la semaine |

### 11.4 Messagerie temps réel

- **Conversations** : Match, groupe, direct
- **Messages** : Texte, pièces jointes (images, audio)
- **Réactions** : Emojis sur les messages
- **Réponses** : Fils de réponse
- **Accusés de lecture** : Statut lu/non lu
- **Indicateurs de frappe** : Typing en temps réel
- **Mute** : Désactivation des notifications par conversation
- **E2EE** : Prêt pour le chiffrement de bout en bout

### 11.5 Gestion des clubs (organisations)

- **Création de club** : Nom, adresse, logo, coordonnées GPS
- **PIN de sécurité** : Code PIN optionnel pour rejoindre un club
- **Rôles** : Owner, admin, member
- **Invitations** : Envoi, renvoi, annulation
- **Demandes d'adhésion** : Workflow de validation
- **Statistiques** : Données du club (cachées 15 min)
- **Multi-club** : Un joueur peut appartenir à plusieurs clubs

### 11.6 Événements

- Style Luma : création, inscription, liste d'attente
- Statuts : draft, presale, on_sale, completed, full, cancelled
- Capacité maximale et gestion des inscriptions
- Participants : registered, waitlisted, cancelled

### 11.7 Administration

- **Gestion utilisateurs** : Tableau, rôles, bannissement
- **Gestion clubs** : Supervision des organisations
- **Statistiques matchs** : Vue d'ensemble
- **Feature flags** : Activation/désactivation de fonctionnalités
- **Demandes de suppression** : Traitement RGPD

### 11.8 Conformité RGPD

- Page de suppression de compte accessible publiquement
- Workflow de demande de suppression
- Traitement via dashboard admin

---

## 12. Stack technique récapitulative

### Mobile

| | Technologie |
|-|------------|
| **Langage** | TypeScript |
| **Framework** | React Native + Expo SDK 55 |
| **Navigation** | Expo Router |
| **State management** | React Query v5 + Zustand |
| **Auth** | Better Auth (Expo plugin) |
| **Animations** | Reanimated v4 |
| **UI** | expo-glass-effect, lucide-react-native |
| **Temps réel** | WebSocket |
| **Notifications** | FCM |

### Web

| | Technologie |
|-|------------|
| **Langage** | TypeScript |
| **Framework** | Next.js 16 + React 19 |
| **Styling** | Tailwind CSS 4 + shadcn/ui |
| **State** | React Query v5 |
| **Tableaux** | TanStack Table v8 |
| **Auth** | Better Auth |
| **Animations** | Framer Motion |
| **Graphiques** | Recharts |

### API

| | Technologie |
|-|------------|
| **Langage** | TypeScript |
| **Runtime** | Bun |
| **Framework** | Hono 4.x |
| **ORM** | Drizzle ORM 0.45 |
| **BDD** | PostgreSQL 17 |
| **Cache** | Redis |
| **Validation** | Zod |
| **Auth** | Better Auth 1.5 |
| **Stockage** | MinIO (S3-compatible) + Sharp |
| **Jobs** | Trigger.dev |
| **WebSocket** | Bun natif + Redis pub/sub |
| **IDs** | ULID |

### Infrastructure

| | Technologie |
|-|------------|
| **Hébergement** | Railway |
| **CI/CD mobile** | GitHub Actions + EAS |
| **Dev local** | Docker Compose (PostgreSQL) |
| **Email** | Resend |

---

> **AceClub** — Connecter les joueurs, organiser les matchs, progresser ensemble.
