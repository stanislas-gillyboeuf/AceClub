---
paths: apps/ios/**/UseCases/**/*.swift
---
# iOS UseCase Rules

## Nommage

Format : `<Action><Domaine>UseCase.swift`

Exemples :
- `GetMeUseCase.swift`
- `AdminListUsersUseCase.swift`
- `CreateOrganizationUseCase.swift`
- `CompleteOnboardingUseCase.swift`

## Structure obligatoire

```swift
class <Action><Domain>UseCase {
    private let repository = <Domain>Repository()

    func execute(<params>) async throws -> <ReturnType> {
        return try await repository.<method>(<params>)
    }
}
```

## Règles

1. **Une responsabilité** : Un UseCase = une action métier unique
2. **Méthode execute()** : Toujours nommer la méthode principale `execute()`
3. **Async throws** : La méthode `execute()` DOIT être `async throws`
4. **Repository** : Injecter le Repository comme propriété privée
5. **Pas de logique UI** : Aucune référence à SwiftUI ou UIKit
6. **Pas de @MainActor** : Les UseCases ne sont pas liés au main thread

## Exemples valides

```swift
// Simple
class GetMeUseCase {
    private let repository = UserRepository()

    func execute() async throws -> User {
        return try await repository.getMe()
    }
}

// Avec paramètres
class GetOrganizationLeaderboardUseCase {
    private let repository = LeaderboardRepository()

    func execute(orgId: String, page: Int = 1, limit: Int = 20) async throws -> Leaderboard {
        return try await repository.getOrganizationLeaderboard(orgId: orgId, page: page, limit: limit)
    }
}
```

## Anti-patterns

- Ne PAS ajouter de logique de formatage pour l'UI
- Ne PAS appeler directement les DataSources (passer par Repository)
- Ne PAS avoir plusieurs méthodes publiques
