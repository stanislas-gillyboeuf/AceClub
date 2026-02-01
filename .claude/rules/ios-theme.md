---
paths: apps/ios/**/*.swift
---
# iOS Theme & Design System Rules

## IMPORTANT : Utiliser le Design System

TOUJOURS utiliser les tokens et styles définis dans `Core/Theme/` au lieu de valeurs hardcodées.

## Tokens disponibles (Theme.swift)

### Corner Radius

```swift
// ✅ BON
.clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusSmall))   // 8
.clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium))  // 12
.clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusLarge))   // 16

// ❌ MAUVAIS
.clipShape(RoundedRectangle(cornerRadius: 8))
.cornerRadius(12)
```

### Spacing & Padding

```swift
// ✅ BON
.padding(.horizontal, Theme.paddingHorizontal)  // 20
.padding(Theme.paddingCard)                     // 16
.padding(.vertical, Theme.paddingButtonVertical) // 14
.frame(height: Theme.buttonHeight)              // 52

// ❌ MAUVAIS
.padding(.horizontal, 20)
.padding(16)
.frame(height: 52)
```

### Border

```swift
// ✅ BON
.strokeBorder(Theme.borderColor, lineWidth: Theme.borderWidth)        // 1
.strokeBorder(Theme.borderColorSubtle, lineWidth: Theme.borderWidthSubtle)  // 0.5

// ❌ MAUVAIS
.strokeBorder(Color.gray, lineWidth: 1)
```

### Couleurs sémantiques

```swift
// ✅ BON - Couleurs adaptatives light/dark
Theme.primaryBackground      // Background principal
Theme.secondaryBackground    // Background secondaire
Theme.tertiaryBackground     // Background tertiaire
Theme.cardBackground         // Background des cartes
Theme.inputBackground        // Background des champs de saisie
Theme.borderColor            // Bordure standard
Theme.borderColorSubtle      // Bordure subtile
Theme.labelPrimary           // Texte principal
Theme.labelSecondary         // Texte secondaire
Theme.labelTertiary          // Texte tertiaire
Theme.tintColor              // Couleur d'accent
Theme.destructiveColor       // Rouge pour actions destructives

// ❌ MAUVAIS
Color(.systemBackground)
Color.gray.opacity(0.3)
Color.primary
```

## View Modifiers disponibles

### Card Style

```swift
// ✅ BON
VStack { ... }
    .cardStyle()  // Background + corner radius + optionnel border

VStack { ... }
    .cardStyle(withBorder: true)

VStack { ... }
    .cardStyle(cornerRadius: Theme.cornerRadiusLarge, withBorder: true)

// ❌ MAUVAIS
VStack { ... }
    .background(Color(.secondarySystemBackground))
    .clipShape(RoundedRectangle(cornerRadius: 12))
```

### Input Field Style

```swift
// ✅ BON
HStack { ... }
    .inputFieldStyle()  // Pour les conteneurs de champs de recherche, etc.

// ❌ MAUVAIS
HStack { ... }
    .background(Color(.secondarySystemBackground))
    .clipShape(RoundedRectangle(cornerRadius: 8))
```

### TextField Style

```swift
// ✅ BON
TextField("Placeholder", text: $text)
    .aceTextFieldStyle()  // Style unifié pour tous les TextFields

// ❌ MAUVAIS
TextField("Placeholder", text: $text)
    .padding(.horizontal, 14)
    .padding(.vertical, 14)
    .background(Color(.secondarySystemBackground))
    .clipShape(RoundedRectangle(cornerRadius: 10))
```

## Button Styles disponibles (AppButtonStyles.swift)

### Primary Button (CTA principal)

```swift
// ✅ BON
Button("Connexion") { }
    .buttonStyle(.appPrimary)

// ❌ MAUVAIS
Button("Connexion") { }
    .font(.body.weight(.semibold))
    .frame(maxWidth: .infinity)
    .frame(height: 52)
    .foregroundStyle(.white)
    .background(Color.accentColor)
    .clipShape(RoundedRectangle(cornerRadius: 8))
```

### Secondary Button (actions secondaires)

```swift
// ✅ BON
Button("Annuler") { }
    .buttonStyle(.appSecondary)
```

### Outlined Button (OAuth, etc.)

```swift
// ✅ BON
Button { } label: {
    Label("Continuer avec Google", image: "google-logo")
}
.buttonStyle(.appOutlined)
```

### Destructive Button (Sign out, Supprimer)

```swift
// ✅ BON
Button("Se déconnecter") { }
    .buttonStyle(.appDestructiveOutlined)
```

### Card Row Button (lignes cliquables)

```swift
// ✅ BON
Button { } label: {
    HStack {
        Text("Mon organisation")
        Spacer()
        Image(systemName: "chevron.right")
    }
}
.buttonStyle(.appCardRow)
```

## Règles

1. **JAMAIS de valeurs hardcodées** pour spacing, corner radius, couleurs
2. **TOUJOURS utiliser les modifiers** : `.cardStyle()`, `.inputFieldStyle()`, `.aceTextFieldStyle()`
3. **TOUJOURS utiliser les ButtonStyles** : `.appPrimary`, `.appSecondary`, `.appOutlined`, `.appDestructiveOutlined`, `.appCardRow`
4. **Couleurs sémantiques** : Utiliser `Theme.xxx` au lieu de `Color.xxx` ou `Color(.systemXxx)`

## Quand créer un nouveau token

Si un nouveau style est nécessaire :
1. L'ajouter dans `Theme.swift` ou `AppButtonStyles.swift`
2. Documenter son usage
3. Ne PAS créer de style inline dans une View
