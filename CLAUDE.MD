


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
mgrep "comment fonctionne l'authentification LinkedIn côté frontend" --store "nom-projet" -a -m <n>
mgrep "comment le token LinkedIn est géré côté Convex" --store "nom-projet" -a -m <n>
mgrep "comment le background script gère les sessions" --store "nom-projet" -a -m <n>
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

# Architecture iOS - Clean Architecture MVVM

```
apps/ios/AceClub/
├── Core/                    # Point d'entrée et configuration de l'app
├── Data/                    # Couche Data - Implémentation des sources de données
│   ├── DataSources/         # Sources de données (API, local storage, etc.)
│   ├── DTOs/                # Data Transfer Objects - Modèles de sérialisation
│   ├── Repositories/        # Implémentations des Repository (accès aux données)
│   └── Mappers/             # Transformations DTO <-> Entity
├── Domain/                  # Couche Domain - Logique métier pure
│   ├── Entities/            # Modèles métier (indépendants de l'infra)
│   └── UseCases/            # Cas d'usage - Orchestration de la logique métier
└── Presentation/            # Couche Presentation - UI et état
    ├── View/                # Vues SwiftUI
    └── ViewModel/           # ViewModels - État et logique de présentation
```

## Détail des dossiers iOS

### `Core/`
**Objectif** : Configuration et bootstrap de l'application.
- `AceClubApp.swift` : Point d'entrée `@main`, configuration de l'app SwiftUI
- `ContentView.swift` : Vue racine de navigation
- `Assets.xcassets` : Ressources (icônes, couleurs, images)

### `Data/`
**Objectif** : Couche d'implémentation des accès aux données. Gère la communication avec les sources externes (API, base locale) et transforme les données brutes en objets utilisables par le Domain.

#### `Data/DataSources/`
**Objectif** : Sources de données concrètes. Chaque DataSource encapsule les appels réseau ou l'accès au stockage local pour un domaine fonctionnel.
- **Pattern** : Un fichier par domaine fonctionnel (ex: `UserAPIDataSource.swift`)
- **Responsabilité** : Appels HTTP, gestion des erreurs réseau, décodage JSON

#### `Data/DTOs/`
**Objectif** : Data Transfer Objects. Structures qui représentent exactement le format JSON de l'API. Séparés des Entities pour découpler le format API des modèles métier.
- **Convention** : `<Nom>DTO.swift`
- **Caractéristique** : Conformes à `Codable` uniquement

#### `Data/Repositories/`
**Objectif** : Implémentations des interfaces Repository définies dans le Domain. Orchestrent les DataSources et appliquent les Mappers.
- **Pattern** : Implémente les protocoles définis dans Domain
- **Responsabilité** : Coordination des DataSources, caching si nécessaire

#### `Data/Mappers/`
**Objectif** : Fonctions de transformation entre DTOs et Entities. Isolent la logique de mapping pour faciliter les tests et évolutions de l'API.
- **Convention** : `<Nom>Mapper.swift`
- **Pattern** : Fonctions statiques ou extensions

### `Domain/`
**Objectif** : Couche métier pure, sans dépendance aux frameworks. Contient la logique business et les règles de l'application.

#### `Domain/Entities/`
**Objectif** : Modèles métier. Structures représentant les concepts du domaine, indépendantes du format de l'API ou de la base de données.
- **Caractéristique** : Conformes à `Identifiable`, pas de logique de sérialisation
- **Principe** : Immuables quand possible

#### `Domain/UseCases/`
**Objectif** : Cas d'usage de l'application. Chaque UseCase encapsule une action métier unique et orchestre les Repository nécessaires.
- **Convention** : `<Action><Domaine>UseCase.swift` (ex: `GetMeUseCase.swift`)
- **Pattern** : Une méthode `execute()` par UseCase
- **Principe** : Un UseCase = une responsabilité

### `Presentation/`
**Objectif** : Couche UI. Gère l'affichage et les interactions utilisateur via le pattern MVVM.

#### `Presentation/View/`
**Objectif** : Vues SwiftUI. Composants visuels déclaratifs, sans logique métier.
- **Responsabilité** : Affichage, layout, animations
- **Principe** : Les vues observent les ViewModels et déclenchent des actions

#### `Presentation/ViewModel/`
**Objectif** : ViewModels. Gèrent l'état de l'UI et orchestrent les UseCases.
- **Pattern** : `@Observable` ou `ObservableObject`
- **Responsabilité** : État de l'UI, appels aux UseCases, formatage des données pour l'affichage

## Flux de données iOS

```
View → ViewModel → UseCase → Repository → DataSource → API
                                    ↓
                               Mapper (DTO → Entity)
```

## Règles d'architecture iOS

1. **Dépendances** : `Presentation → Domain ← Data` (le Domain ne dépend de rien)
2. **Injection** : Les ViewModels reçoivent leurs UseCases par injection
3. **Async** : Utiliser `async/await` pour les opérations asynchrones
4. **Erreurs** : Propager les erreurs via `throws`, gérer dans les ViewModels

---

# Architecture API - Hono + Drizzle

```
services/api/
├── index.ts                 # Point d'entrée - Configuration Hono, CORS, routes principales
├── auth.ts                  # Configuration Better Auth
├── drizzle.config.ts        # Configuration Drizzle ORM
├── db/                      # Couche base de données
│   ├── index.ts             # Export connexion DB
│   └── schema/              # Schémas Drizzle
│       ├── index.ts         # Barrel export des schémas
│       └── auth/            # Schémas liés à l'authentification
│           ├── index.ts
│           └── schema.ts    # Tables user, session, account, verification
├── middleware/              # Middlewares Hono
│   ├── index.ts             # Barrel export
│   ├── auth.ts              # Middlewares d'authentification
│   └── cors.ts              # Configuration CORS
├── server/                  # Logique serveur par domaine
│   ├── router.ts            # Router principal (monte les sous-routers)
│   └── user/                # Domaine User
│       ├── router.ts        # Routes /user/*
│       ├── validators.ts    # Schémas de validation Zod
│       ├── queries/         # Handlers de lecture (GET)
│       │   ├── index.ts
│       │   └── me.ts        # GET /user/me
│       └── mutations/       # Handlers d'écriture (POST, PUT, DELETE)
└── types/                   # Types TypeScript partagés
    └── hono.ts              # Types de contexte Hono
```

## Détail des dossiers API

### Conventions HTTP Admin

- GET : `/admin/list-users`, `/admin/list-user-sessions` (query params)
- POST/PUT : mutations `/admin/*` avec payload JSON (ex: `/admin/set-role`)

### `index.ts`
**Objectif** : Point d'entrée de l'API. Configure l'app Hono, les middlewares globaux (logging, CORS), et monte les routes.

### `auth.ts`
**Objectif** : Configuration de Better Auth (authentification). Définit l'adaptateur DB, les providers OAuth, et le plugin bearer token.

### `db/`
**Objectif** : Couche d'accès à la base de données PostgreSQL via Drizzle ORM.

#### `db/schema/`
**Objectif** : Définition des tables et relations avec Drizzle.
- **Convention** : Un sous-dossier par domaine fonctionnel
- **Pattern** : Chaque `schema.ts` exporte les tables et leurs relations

#### `db/schema/auth/`
**Objectif** : Tables liées à l'authentification Better Auth.
- `user` : Utilisateurs
- `session` : Sessions actives
- `account` : Comptes OAuth liés
- `verification` : Tokens de vérification email

### `middleware/`
**Objectif** : Middlewares Hono réutilisables.

#### `middleware/auth.ts`
**Objectif** : Middlewares d'authentification.
- `authMiddleware` : Auth optionnelle (set user/session si présent)
- `requireAuth` : Auth obligatoire (401 si non authentifié)

#### `middleware/cors.ts`
**Objectif** : Configuration CORS pour l'app iOS et le développement local.

### `server/`
**Objectif** : Logique serveur organisée par domaine fonctionnel.

#### `server/router.ts`
**Objectif** : Router principal qui agrège tous les sous-routers de domaines.

#### `server/<domain>/`
**Objectif** : Chaque domaine a son propre dossier avec une structure standardisée.

**Structure d'un domaine** :
- `router.ts` : Définit les routes et applique les middlewares
- `validators.ts` : Schémas Zod pour valider les inputs
- `queries/` : Handlers pour les opérations de lecture (GET)
- `mutations/` : Handlers pour les opérations d'écriture (POST, PUT, DELETE)

### `types/`
**Objectif** : Types TypeScript partagés.

#### `types/hono.ts`
**Objectif** : Définit le type `HonoContext` pour typer les variables de contexte (user, session).

## Routes API

| Route | Méthode | Description | Auth |
|-------|---------|-------------|------|
| `/api/auth/*` | GET/POST | Endpoints Better Auth (signup, signin, signout) | Non |
| `/api/session` | GET | Récupère la session courante | Non |
| `/api/user/me` | GET | Infos de l'utilisateur connecté | Oui |
| `/health` | GET | Health check | Non |

## Conventions API

1. **Nommage** : kebab-case pour les routes, camelCase pour les variables
2. **Validation** : Zod pour tous les inputs utilisateur
3. **Erreurs** : Retourner des objets `{ error: string, message: string }`
4. **Auth** : Bearer token via header `Authorization`

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
