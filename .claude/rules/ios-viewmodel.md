---
paths: apps/ios/**/*ViewModel.swift
---
# iOS ViewModel Rules

## Structure obligatoire

Tous les ViewModels DOIVENT suivre ce pattern :

```swift
@MainActor
class <Name>ViewModel: ObservableObject {
    // MARK: - Published Properties
    @Published var items: [Item] = []
    @Published var isLoading = false
    @Published var errorMessage: String?

    // MARK: - UseCases (injection directe)
    private let fetchItemsUseCase = FetchItemsUseCase()

    // MARK: - Methods
    func loadItems() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            items = try await fetchItemsUseCase.execute()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
```

## Règles

1. **@MainActor obligatoire** : Toujours annoter la classe avec `@MainActor`
2. **ObservableObject** : Toujours conformer à `ObservableObject`
3. **@Published** : Utiliser uniquement pour les propriétés observables par la View
4. **Pattern de chargement** :
   - Toujours avoir `isLoading: Bool` et `errorMessage: String?`
   - Utiliser `defer { isLoading = false }` pour garantir la réinitialisation
   - Reset `errorMessage = nil` au début de chaque opération
5. **Injection** : Instancier les UseCases directement comme propriétés privées
6. **Async** : Les méthodes de chargement sont `async` (pas de callbacks)
7. **Gestion d'erreurs** : `do-catch` avec `error.localizedDescription`

## Anti-patterns

- Ne PAS utiliser `@StateObject` dans le ViewModel
- Ne PAS faire d'appels réseau directement (passer par UseCase)
- Ne PAS utiliser de singletons pour les dépendances
