---
paths: apps/ios/**/Entities/**/*.swift
---
# iOS Entity Rules

## Nommage
- Fichier : `<Nom>.swift`
- Struct : `<Nom>`

## Structure

```swift
struct <Name>: Identifiable {
    let id: String
    let name: String
    let email: String
    let optionalField: String?

    // Computed properties pour la logique métier
    var displayName: String {
        name.isEmpty ? "Unknown" : name
    }

    var initials: String {
        let components = name.split(separator: " ")
        if components.count >= 2 {
            return "\(components[0].prefix(1))\(components[1].prefix(1))".uppercased()
        }
        return "??"
    }

    var isValid: Bool {
        !name.isEmpty && !email.isEmpty
    }
}
```

## Règles

1. **Identifiable** : DOIT conformer à `Identifiable`
2. **Pas de Codable** : Ne PAS conformer à `Codable` (c'est le rôle des DTOs)
3. **Immuables** : Utiliser `let` pour toutes les propriétés stockées
4. **Computed properties** : Logique métier via computed properties
5. **Pas de dépendances** : Aucune référence à Data layer ou Presentation layer

## Computed properties recommandées

```swift
// URL depuis String optionnel
var imageURL: URL? {
    guard let image, !image.isEmpty else { return nil }
    return URL(string: image)
}

// Valeur par défaut pour Bool optionnel
var isVerified: Bool {
    emailVerified ?? false
}

// Formatage pour l'affichage
var formattedDate: String {
    guard let createdAt else { return "N/A" }
    // formatter logic
}
```

## Anti-patterns

- Ne PAS ajouter de méthodes qui appellent des services
- Ne PAS stocker de références à des ViewModels
- Ne PAS utiliser `var` pour les propriétés stockées
- Ne PAS conformer à `Codable`
