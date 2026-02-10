---
paths: apps/ios/**/*.swift
---
# iOS Theme & Design System Rules

## IMPORTANT : Utiliser le Design System

TOUJOURS utiliser les tokens et styles définis dans `Core/Theme/` au lieu de valeurs hardcodées.

## Palette de couleurs

L'app utilise une palette **vert + orange** :

- **Vert** : Couleur principale / accent (tint, CTA, statuts positifs)
- **Orange** : Couleur secondaire / highlight (badges, alertes, éléments d'emphase)

Utiliser les couleurs sémantiques `Theme.xxx` qui encapsulent cette palette.

## Tokens disponibles (Theme.swift)

### Corner Radius

```swift
// BON
.clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusSmall))   // 8
.clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium))  // 12
.clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusLarge))   // 16

// MAUVAIS
.clipShape(RoundedRectangle(cornerRadius: 8))
.cornerRadius(12)
```

### Spacing & Padding

```swift
// BON
.padding(.horizontal, Theme.paddingHorizontal)  // 20
.padding(Theme.paddingCard)                     // 16
.padding(.vertical, Theme.paddingButtonVertical) // 14
.frame(height: Theme.buttonHeight)              // 52

// MAUVAIS
.padding(.horizontal, 20)
.padding(16)
.frame(height: 52)
```

### Border

```swift
// BON
.strokeBorder(Theme.borderColor, lineWidth: Theme.borderWidth)        // 1
.strokeBorder(Theme.borderColorSubtle, lineWidth: Theme.borderWidthSubtle)  // 0.5

// MAUVAIS
.strokeBorder(Color.gray, lineWidth: 1)
```

### Couleurs sémantiques

```swift
// BON - Couleurs adaptatives light/dark
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
Theme.tintColor              // Couleur d'accent (vert)
Theme.destructiveColor       // Rouge pour actions destructives

// MAUVAIS
Color(.systemBackground)
Color.gray.opacity(0.3)
Color.primary
```

## Liquid Glass (iOS 26+)

L'app adopte le design Liquid Glass d'Apple pour les éléments flottants.

### Quand utiliser Liquid Glass

- Toolbars et barres d'action flottantes
- Boutons d'action (FAB, actions contextuelles)
- Cards et panels flottants au-dessus du contenu
- Tab bars et navigation overlays

### Quand NE PAS utiliser Liquid Glass

- Listes denses et tableaux
- Surfaces plein écran
- Layouts texte-heavy
- Contenu principal (glass = navigation layer seulement)

### API de base

```swift
// Glass effect simple
Text("Action")
    .padding()
    .glassEffect()  // Default: .regular, capsule shape

// Variantes
.glassEffect(.regular)    // Standard - toolbars, boutons, tab bars
.glassEffect(.clear)      // Haute transparence - au-dessus de photos/maps
.glassEffect(.identity)   // Désactivé - pour toggle conditionnel

// Tinting avec les couleurs de l'app
.glassEffect(.regular.tint(.green))    // Accent principal
.glassEffect(.regular.tint(.orange))   // Accent secondaire

// Boutons interactifs (scaling, bounce, shimmer)
Button("Action") { }
    .glassEffect(.regular.interactive())

// Combiné
.glassEffect(.regular.tint(.green).interactive())
```

### Shapes personnalisées

```swift
.glassEffect(.regular, in: .capsule)
.glassEffect(.regular, in: .circle)
.glassEffect(.regular, in: RoundedRectangle(cornerRadius: 16))
```

### GlassEffectContainer (grouper plusieurs éléments glass)

```swift
GlassEffectContainer {
    HStack(spacing: 20) {
        Button { } label: { Image(systemName: "pencil") }
            .glassEffect(.regular.interactive())

        Button { } label: { Image(systemName: "trash") }
            .glassEffect(.regular.interactive())
    }
}
```

### Morphing transitions avec glassEffectID

```swift
@Namespace private var namespace

GlassEffectContainer(spacing: 30) {
    Button(isExpanded ? "Collapse" : "Expand") {
        withAnimation(.bouncy) { isExpanded.toggle() }
    }
    .glassEffect()
    .glassEffectID("toggle", in: namespace)

    if isExpanded {
        Button("Action") { }
            .glassEffect()
            .glassEffectID("action", in: namespace)
    }
}
```

### Règles Liquid Glass

1. **Navigation layer seulement** : Glass pour les overlays flottants, JAMAIS pour le contenu
2. **GlassEffectContainer** : Toujours grouper les éléments glass dans un container
3. **Tinting sémantique** : Utiliser `.tint(.green)` pour les CTA, `.tint(.orange)` pour les highlights
4. **Interactive** : Ajouter `.interactive()` sur tous les boutons glass
5. **Accessibilité** : Le système gère automatiquement Reduce Transparency / Reduce Motion

## View Modifiers disponibles

### Card Style

```swift
// BON
VStack { ... }
    .cardStyle()  // Background + corner radius + optionnel border

VStack { ... }
    .cardStyle(withBorder: true)

VStack { ... }
    .cardStyle(cornerRadius: Theme.cornerRadiusLarge, withBorder: true)

// MAUVAIS
VStack { ... }
    .background(Color(.secondarySystemBackground))
    .clipShape(RoundedRectangle(cornerRadius: 12))
```

### Input Field Style

```swift
// BON
HStack { ... }
    .inputFieldStyle()  // Pour les conteneurs de champs de recherche, etc.

// MAUVAIS
HStack { ... }
    .background(Color(.secondarySystemBackground))
    .clipShape(RoundedRectangle(cornerRadius: 8))
```

### TextField Style

```swift
// BON
TextField("Placeholder", text: $text)
    .aceTextFieldStyle()  // Style unifié pour tous les TextFields

// MAUVAIS
TextField("Placeholder", text: $text)
    .padding(.horizontal, 14)
    .padding(.vertical, 14)
    .background(Color(.secondarySystemBackground))
    .clipShape(RoundedRectangle(cornerRadius: 10))
```

## Button Styles disponibles (AppButtonStyles.swift)

### Primary Button (CTA principal)

```swift
// BON
Button("Connexion") { }
    .buttonStyle(.appPrimary)

// MAUVAIS
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
Button("Annuler") { }
    .buttonStyle(.appSecondary)
```

### Outlined Button (OAuth, etc.)

```swift
Button { } label: {
    Label("Continuer avec Google", image: "google-logo")
}
.buttonStyle(.appOutlined)
```

### Destructive Button (Sign out, Supprimer)

```swift
Button("Se déconnecter") { }
    .buttonStyle(.appDestructiveOutlined)
```

### Card Row Button (lignes cliquables)

```swift
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
5. **Palette vert/orange** : Vert = accent principal, Orange = accent secondaire
6. **Liquid Glass** : Pour les éléments flottants et navigation, avec tinting vert/orange

## Quand créer un nouveau token

Si un nouveau style est nécessaire :
1. L'ajouter dans `Theme.swift` ou `AppButtonStyles.swift`
2. Documenter son usage
3. Ne PAS créer de style inline dans une View
