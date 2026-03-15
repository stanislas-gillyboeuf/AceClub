
# CLAUDE - Guide de l'agent de recherche de code
Il faut que tu penses scalablement. Ne me donne pas une réponse unique à une question qui touche plusieurs parties du codebase. Si la question est complexe, divise-la en plusieurs questions plus simples et lance plusieurs mgrep. Le but est d'avoir des réponses précises et actionnables, pas une réponse vague qui couvre tout le codebase.


# Components - Expo Mobile
Il faut que tu rendes le code lisible et compréhensible, séparé en composants. Les composants sont générique ou spécifiques à une feature, mais ils ne doivent jamais être un mélange des deux. Si tu vois un composant qui fait 2-3 choses différentes, c'est un signal que tu dois le refactorer en plusieurs composants plus simples.

# Scalabilité
Si tu vois une logique qui est répétée dans plusieurs composants, c'est un signal que tu dois l'extraire dans un composant générique réutilisable. Par exemple, si tu vois plusieurs écrans avec une barre de recherche qui ont des styles similaires, tu peux créer un composant `SearchBar` générique que tu réutilises partout.

# mgrep - Ton assistant de recherche de code

**mgrep est ton outil principal pour explorer le codebase.** Il te donne la réponse en langage naturel + la source pertinente, tout servi.

## Commande de base

```bash
mgrep "ta question en langage naturel" --store "aceclub" -a -m <nombre>
```

Ici le store est "aceclub"

## Paramètres essentiels

| Paramètre | Description |
|-----------|-------------|
| `--store "aceclub"` | **Obligatoire** - le store indexé du projet |
| `-a` | Active la réponse en langage naturel |
| `-m <n>` | Nombre de résultats du retrieval (minimum 10) |

## Ajuster `-m` selon la complexité

| Type de requête | `-m` recommandé |
|-----------------|-----------------|
| Question simple (1-2 fichiers) | 10 |
| Question moyenne (flow, feature) | 20-30 |
| Question complexe (debug, architecture) | 30-50 |

## Stratégie pour requêtes complexes

Si la requête touche **plusieurs parties du codebase**, lance plusieurs mgrep en parallèle plutôt qu'une seule requête surchargée :

```bash
# Exemple : comprendre le système d'auth complet
mgrep "comment fonctionne l'authentification LinkedIn côté frontend" --store "aceclub" -a -m <n>
mgrep "comment le token LinkedIn est géré côté API" --store "aceclub" -a -m <n>
mgrep "comment Better Auth gère les sessions" --store "aceclub" -a -m <n>
```

## Règles

- **OBLIGATOIRE** : Utilise mgrep pour TOUTE recherche de code. N'utilise JAMAIS grep, Grep tool, ou Glob pour chercher du code.
- **Langage naturel** : mgrep est un agent IA comme toi. Parle-lui comme à un collègue, pas comme à un moteur de recherche.
  - ❌ `"architecture block icon color complete status"` (mots-clés robotiques)
  - ✅ `"Quelle est la couleur de l'icône des blocs d'architecture quand ils sont complétés ?"` (question naturelle)


---

# Subagents (Task tool)

**Les subagents n'héritent PAS des instructions de ce fichier.**

Quand tu lances un subagent Explore, copie-colle les instructions sur mgrep de ce CLAUDE.md dans le prompt du subagent.

---

# Expo Mobile - Patterns UI

## Listes scrollables

**Ne JAMAIS imbriquer un `FlatList` dans un `ScrollView`** — erreur "VirtualizedLists should never be nested inside plain ScrollViews".

**Ne JAMAIS utiliser un `View` comme conteneur racine d'un écran avec liste** — le contenu passe sous le header natif.

**Pattern correct** (cf. `club-selection.tsx`, `chat/new.tsx`) : utiliser `FlatList` comme conteneur scroll principal avec `contentInsetAdjustmentBehavior="automatic"` pour respecter le header.
```tsx
<>
  <Stack.Screen options={{ ... }} />
  <FlatList
    style={{ flex: 1 }}
    data={items}
    renderItem={renderItem}
    ListHeaderComponent={<SearchBar />}
    ListEmptyComponent={isLoading ? <Loader /> : <EmptyState />}
    contentInsetAdjustmentBehavior="automatic"
    keyboardShouldPersistTaps="handled"
  />
</>
```

## FormSheet et KeyboardAvoidingView

**Ne JAMAIS utiliser `KeyboardAvoidingView` dans un écran `presentation: "formSheet"`** — le formSheet iOS gère nativement le clavier. `KeyboardAvoidingView` provoque des conflits de layout et peut rendre le contenu invisible (hauteur 0).

**Pattern correct** : utiliser un `View` simple avec `flex: 1` ou mettre `style={{ flex: 1 }}` directement sur le `FlatList`/`ScrollView`.
```tsx
// MAUVAIS — contenu invisible dans formSheet
<KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
  <FlatList ... />
</KeyboardAvoidingView>

// BON — formSheet gère le clavier nativement
<FlatList style={{ flex: 1 }} ... />
```

> **Note** : `KeyboardAvoidingView` reste valide pour `fullScreenModal` et les écrans non-modaux.

## Glass Effect (iOS 26+)

On utilise `expo-glass-effect` (`GlassView`) pour le design Liquid Glass iOS. `GlassView` fallback en `View` standard sur iOS < 26 et Android.

**Règles** :
- **Ne JAMAIS mettre `opacity < 1`** sur un `GlassView` ou ses parents — l'effet render mal. Utiliser `transform: [{ scale: 0.98 }]` pour les états pressed.
- **Supprimer `backgroundColor`, `borderWidth`, `shadow*`, `elevation`** des styles quand on remplace un `View` par `GlassView` — le glass gère le visuel.
- Utiliser `tintColor` pour colorer le glass (ex: `tintColor={colors.accentGreen}`).
- `isInteractive` ne peut être set qu'au mount (pas de changement dynamique).

**Usages actuels** :
- `club-selection.tsx` : barre de recherche + cartes de club
- `discover/index.tsx` : bouton filtre rayon + menu rayon
- `discover-card.tsx` : badges distance et type sur les cartes
- `discover-card-stack.tsx` : boutons pass/like
- `discover-detail-sheet.tsx` : bouton close + cartes disponibilité/description
- `ChatBottomBar.tsx` : bouton +, input row, bouton send

```tsx
// Carte avec glass
<Pressable onPress={onPress} style={({ pressed }) => [pressed && { transform: [{ scale: 0.98 }] }]}>
  <GlassView style={styles.card}>
    {/* contenu */}
  </GlassView>
</Pressable>

// Badge avec tint
<GlassView style={styles.badge} tintColor="#3B82F6">
  <Text style={styles.badgeText}>Match</Text>
</GlassView>
```

---

# Architecture Mobile - React Native Expo

```
apps/mobile/
├── app/                    # Expo Router (file-based routing)
│   ├── _layout.tsx         # Root layout + providers
│   ├── (tabs)/             # Bottom tabs (feed, matches, chat, discover, profile)
│   ├── (auth)/             # Auth routes
│   └── (onboarding)/       # Onboarding flow
├── components/             # Composants UI partagés
│   └── ui/                 # Composants de base (card, avatar, button, glass-view, skeleton...)
├── features/               # Modules par feature
│   └── <feature>/
│       ├── components/     # Composants spécifiques à la feature
│       ├── hooks/          # Hooks spécifiques
│       └── lib/            # Utilitaires
├── hooks/                  # Hooks globaux (use-user, use-match, use-conversation...)
├── services/               # Couche API (wrappers HTTP par domaine)
├── lib/                    # Utilitaires core (api client, auth, query-client, websocket...)
├── store/                  # Zustand stores (formulaires multi-étapes)
├── types/                  # Types TypeScript par domaine
└── constants/              # Thème, couleurs, spacing
```

## Features actuelles

`auth`, `chat`, `discover`, `feed`, `leaderboard`, `match-intent`, `matches`, `onboarding`, `profile`, `progression`, `settings`

## Flux de données

```
Component → React Query Hook (hooks/) → Service (services/) → API Client (lib/api.ts) → Backend
```

## Stack technique

- Expo SDK 55 (New Architecture + React Compiler)
- Expo Router (file-based routing, typed routes)
- React Query v5 (server state, cache, refetch)
- Zustand (client state : formulaires multi-étapes)
- Better Auth (`@better-auth/expo`)
- React Native Reanimated v4 (animations)
- `expo-glass-effect` (Liquid Glass iOS 26+)
- `lucide-react-native` (icônes)

## Conventions de nommage

| Type | Convention | Exemple |
|------|-----------|---------|
| Service | `<domain>.ts` | `services/user.ts`, `services/match.ts` |
| Hook global | `use-<domain>.ts` | `hooks/use-user.ts`, `hooks/use-match.ts` |
| Hook feature | `use-<action>.ts` | `features/discover/hooks/use-discover-state.ts` |
| Type | `<domain>.ts` | `types/user.ts`, `types/match.ts` |
| Store | `<action>-form.ts` | `store/create-match-form.ts` |
| UI component | `<name>.tsx` (kebab-case) | `components/ui/glass-view.tsx` |
| Feature component | `<Name>.tsx` (PascalCase) | `features/chat/components/ChatBottomBar.tsx` |

## Règles

1. **Services** = wrappers HTTP fins (pas de logique métier)
2. **React Query** gère TOUT le server state (pas de state local pour les données API)
3. **Zustand** uniquement pour les formulaires multi-étapes
4. **Invalidation de cache** dans `onSuccess` des mutations
5. `staleTime: 5min`, `gcTime: 30min` par défaut
6. **Imports** avec alias `@/*`

---

# Architecture Web - Next.js

```
apps/web/src/
├── app/                    # Next.js App Router
│   ├── (marketing)/        # Site public (homepage, contact, privacy, cgu)
│   ├── (admin)/            # Dashboard admin protégé
│   │   └── dashboard/      # Users, organizations, matches, feature-flags
│   ├── (auth)/             # Login
│   └── api/                # API routes (contact form)
├── components/
│   ├── ui/                 # shadcn/ui (button, card, dialog, table, sidebar...)
│   ├── custom/             # Composants métier (data-table, columns, actions)
│   └── sections/           # Sections marketing (hero, features, pricing...)
├── hooks/                  # React Query hooks (use-admin-queries, use-admin-mutations)
├── lib/                    # Utilitaires (auth-client, api-client, utils, config)
└── types/                  # Types admin
```

## Stack technique

- Next.js 16 (App Router, React Compiler)
- React 19
- Tailwind CSS 4 + shadcn/ui (New York style)
- React Query v5 (data fetching)
- TanStack Table v8 (tableaux admin)
- Better Auth (organization + admin plugins)
- Framer Motion (animations marketing)
- Recharts (graphiques dashboard)
- Lucide React (icônes)

## Conventions de nommage

| Type | Convention | Exemple |
|------|-----------|---------|
| Page | `page.tsx` | `app/(admin)/dashboard/users/page.tsx` |
| Layout | `layout.tsx` | `app/(admin)/layout.tsx` |
| UI component | kebab-case | `components/ui/button.tsx` |
| Custom component | kebab-case | `components/custom/data-table.tsx` |
| Hook | `use-<action>.ts` | `hooks/use-admin-queries.ts` |

## Règles

1. **Marketing** = Server Components (pas de `use client`)
2. **Admin** = Client Components (`use client` pour React Query + state)
3. **Protection admin** : vérifier `session.user.role === "admin"` dans le layout
4. **API client** utilise `credentials: "include"` (cookies)
5. **Tables** : colonnes définies séparément dans `*-columns.tsx`
6. **Styling** : Tailwind classes uniquement, pas de CSS-in-JS

---

# Architecture API - Hono + Drizzle

```
services/api/
├── index.ts                 # Point d'entrée - Configuration Hono, CORS, routes principales
├── auth.ts                  # Configuration Better Auth
├── drizzle.config.ts        # Configuration Drizzle ORM
├── db/                      # Couche base de données
│   ├── index.ts             # Export connexion DB
│   └── schema/              # Schémas Drizzle (15 modules)
│       ├── index.ts         # Barrel export des schémas
│       ├── auth/            # user, session, account, verification, organization, member
│       ├── match/           # match, match_participant, match_set, match_comment, match_feedback
│       ├── match_intents/   # match_intent, match_request
│       ├── event/           # event, event_rsvp
│       ├── challenge/       # challenge, user_challenge
│       ├── conversation/    # conversation, message, conversation_participant
│       ├── level/           # level_tier, user_level, aces_transaction
│       ├── reward/          # badge, user_badge, user_title
│       ├── streak/          # streak
│       ├── notification/    # device_token
│       ├── user-preference/ # user_preference
│       ├── club-request/    # club_request
│       ├── e2ee/            # e2ee_key
│       ├── feature-flag/    # feature_flag
│       └── account-deletion-request/
├── middleware/              # Middlewares Hono
│   ├── index.ts             # Barrel export
│   ├── auth.ts              # authMiddleware, requireAuth
│   ├── admin.ts             # isAdmin
│   ├── org-member.ts        # assertOrgAdmin
│   └── cors.ts              # Configuration CORS
├── server/                  # Logique serveur par domaine (17 routers)
│   ├── router.ts            # Router principal (monte les sous-routers)
│   ├── user/                # /api/user
│   ├── admin/               # /api/admin
│   ├── organization/        # /api/organization
│   ├── match/               # /api/match
│   ├── match_intents/       # /api/match-intents
│   ├── event/               # /api/event (Luma-style)
│   ├── conversation/        # /api/conversation
│   ├── notification/        # /api/notification
│   ├── level/               # /api/level
│   ├── challenge/           # /api/challenge
│   ├── streak/              # /api/streak
│   ├── reward/              # /api/reward
│   ├── leaderboard/         # /api/leaderboard
│   ├── upload/              # /api/upload
│   ├── cron/                # /api/cron
│   ├── e2ee/                # /api/e2ee
│   ├── ws/                  # WebSocket
│   └── account-deletion-request/
└── types/                   # Types TypeScript partagés
    └── hono.ts              # Types de contexte Hono
```

## Middlewares

| Middleware | Rôle |
|-----------|------|
| `authMiddleware` | Auth optionnelle (set user/session si présent) |
| `requireAuth` | Auth obligatoire (401 si non authentifié) |
| `isAdmin` | Admin only (403 si pas admin) |
| `assertOrgAdmin` | Vérifie owner/admin de l'organisation |

## Structure d'un domaine

```
server/<domaine>/
├── router.ts        # Définit les routes et applique les middlewares
├── validators.ts    # Schémas Zod pour valider les inputs
├── queries/         # Handlers de lecture (GET)
│   └── index.ts
└── mutations/       # Handlers d'écriture (POST, PUT, DELETE)
    └── index.ts
```

## Conventions API

1. **Nommage** : kebab-case pour les routes, camelCase pour les variables
2. **Validation** : Zod pour tous les inputs utilisateur
3. **Erreurs** : Retourner des objets `{ error: string, message: string }`
4. **Auth** : Bearer token via header `Authorization` (mobile), cookies (web)
5. **IDs** : `ulid()` pour générer les identifiants
6. **Timestamps** : `defaultNow()` + `$onUpdate()` sur les schémas Drizzle
7. **Enums** : `pgEnum()` pour les valeurs prédéfinies

## Conventions HTTP Admin

- GET : `/admin/list-users`, `/admin/list-user-sessions` (query params)
- POST/PUT : mutations `/admin/*` avec payload JSON (ex: `/admin/set-role`)

## Ajout d'un nouveau domaine API

```bash
server/
└── <nouveau-domaine>/
    ├── router.ts        # Créer et exporter le router
    ├── validators.ts    # Schémas Zod
    ├── queries/
    │   └── index.ts
    └── mutations/
        └── index.ts
```

Puis monter dans `server/router.ts` :
```typescript
import { nouveauDomaineRouter } from './<nouveau-domaine>/router'
serverRouter.route('/<nouveau-domaine>', nouveauDomaineRouter)
```
