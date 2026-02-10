# AceClub - Conventions Générales

## Architecture

### iOS - Clean Architecture MVVM

```
View (SwiftUI)
    ↓
ViewModel (@MainActor, ObservableObject or @Observable)
    ↓
UseCase (execute() async throws)
    ↓
Repository (concrete class)
    ↓
DataSource (APIClient.shared)
    ↓
API
```

### API - Hono + Drizzle

```
Router (Hono)
    ↓
Middleware (auth)
    ↓
Validator (Zod)
    ↓
Handler (query/mutation)
    ↓
Database (Drizzle ORM)
```

## Conventions de nommage

### iOS (Swift)

| Type | Convention | Exemple |
|------|------------|---------|
| ViewModel | `<Screen>ViewModel` | `ProfileViewModel` |
| UseCase | `<Action><Domain>UseCase` | `GetMeUseCase` |
| Repository | `<Domain>Repository` | `UserRepository` |
| DataSource | `<Domain>APIDataSource` | `AuthAPIDataSource` |
| DTO | `<Name>DTO` | `UserDTO` |
| Mapper | `<Name>Mapper` | `UserMapper` |
| Entity | `<Name>` | `User` |
| View | `<Screen>View` | `HomeView` |

### API (TypeScript)

| Type | Convention | Exemple |
|------|------------|---------|
| Router file | `router.ts` | `server/user/router.ts` |
| Validator | `<action>Validator` | `createUserValidator` |
| Handler | `<action>.ts` | `queries/me.ts` |
| Route path | `kebab-case` | `/list-users` |
| JSON keys | `camelCase` | `{ userId: "..." }` |

## Patterns de code récurrents

### iOS - Chargement async

```swift
func loadData() async {
    isLoading = true
    errorMessage = nil
    defer { isLoading = false }

    do {
        data = try await useCase.execute()
    } catch is CancellationError {
        // SwiftUI peut annuler les Tasks - ne rien faire
    } catch {
        errorMessage = error.localizedDescription
    }
}
```

### API - Vérification d'existence

```typescript
const [existing] = await db
  .select()
  .from(table)
  .where(eq(table.id, id))
  .limit(1);

if (!existing) {
  return c.json({ error: "NotFound", message: "Not found" }, 404);
}
```

### API - Création avec ID

```typescript
const [created] = await db
  .insert(table)
  .values({ id: ulid(), ...data })
  .returning();

return c.json(created, 201);
```

## Règles importantes

1. **Dépendances** : `Presentation → Domain ← Data` (Domain ne dépend de rien)
2. **Async/Await** : Utiliser `async/await` partout, pas de callbacks
3. **Erreurs** : Format API = `{ error: "Type", message: "Description" }`
4. **IDs** : Utiliser `ulid()` pour générer les identifiants
5. **Validation** : Zod côté API, types stricts côté iOS
6. **Tests** : Écrire des tests pour les UseCases et handlers critiques

## Structure des dossiers

### iOS

```
apps/ios/AceClub/
├── Core/           # App entry point
├── Data/           # DataSources, DTOs, Mappers, Repositories
├── Domain/         # Entities, UseCases
└── Presentation/   # Views, ViewModels
```

### API

```
services/api/
├── db/             # Database schema
├── middleware/     # Auth, CORS
├── server/         # Domain routers
│   └── <domain>/   # router.ts, validators.ts, queries/, mutations/
└── types/          # TypeScript types
```
