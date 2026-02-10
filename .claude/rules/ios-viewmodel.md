---
paths: apps/ios/**/*ViewModel.swift
---
# iOS ViewModel Rules

## Deux patterns de ViewModel

### Pattern 1 : `ObservableObject` (pattern standard)

```swift
@MainActor
class <Name>ViewModel: ObservableObject {
    // MARK: - Published Properties
    @Published var items: [Item] = []
    @Published var isLoading = false
    @Published var errorMessage: String?

    // MARK: - UseCases (instanciation directe)
    private let fetchItemsUseCase = FetchItemsUseCase()

    // MARK: - Methods
    func loadItems() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            items = try await fetchItemsUseCase.execute()
        } catch is CancellationError {
            // SwiftUI peut annuler les Tasks - ne rien faire
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
```

**Connexion à la View** : `@StateObject private var vm = NameViewModel()`

### Pattern 2 : `@Observable` (iOS 17+, pour ViewModels partagés/racine)

Utilisé pour les ViewModels globaux comme `AuthViewModel`, `HomeFeedViewModel`.

```swift
@Observable
@MainActor
class <Name>ViewModel {
    var items: [Item] = []
    var isLoading = false
    var errorMessage: String?

    private let fetchItemsUseCase = FetchItemsUseCase()

    func loadItems() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            items = try await fetchItemsUseCase.execute()
        } catch is CancellationError {
            // SwiftUI peut annuler les Tasks - ne rien faire
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
```

**Connexion à la View** : `@Environment(NameViewModel.self) var vm`

## Règles

1. **@MainActor obligatoire** : Toujours annoter la classe avec `@MainActor`
2. **ObservableObject ou @Observable** : Les deux sont utilisés selon le contexte
   - `ObservableObject` + `@Published` : ViewModels locaux à un écran
   - `@Observable` : ViewModels partagés via `@Environment`
3. **CancellationError** : TOUJOURS catch `CancellationError` en premier dans les do-catch async (SwiftUI annule les Tasks lors de la navigation)
4. **Instanciation directe** : Instancier les UseCases directement comme propriétés privées (pas d'injection par constructeur)
5. **Async** : Les méthodes de chargement sont `async` (pas de callbacks)
6. **Gestion d'erreurs** : `do-catch` avec `error.localizedDescription`

## Pull-to-refresh pattern

SwiftUI peut annuler les Tasks du `.refreshable`. Pour éviter cela, utiliser un `Task` non-structuré :

```swift
func refresh() {
    Task {
        await loadItems()
    }
}
```

## Connexion ViewModel ↔ View

| Pattern | Usage | Exemple |
|---------|-------|---------|
| `@StateObject` | ViewModel local, créé par la View | `@StateObject private var vm = ProfileViewModel()` |
| `@Environment(VM.self)` | ViewModel `@Observable` injecté dans l'environnement | `@Environment(AuthViewModel.self) var authVM` |
| `@EnvironmentObject` | ViewModel `ObservableObject` injecté dans l'environnement | `@EnvironmentObject var authVM: AuthViewModel` |

## Singletons utilitaires

Le code utilise des singletons pour les services d'infrastructure. C'est le pattern établi :

- `APIClient.shared` : Requêtes HTTP authentifiées
- `KeychainManager.shared` : Stockage sécurisé (tokens)
- `NotificationManager.shared` : Push notifications

## Anti-patterns

- Ne PAS faire d'appels réseau directement dans le ViewModel (passer par UseCase)
- Ne PAS oublier `catch is CancellationError { }` dans les méthodes async
