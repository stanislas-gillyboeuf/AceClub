---
paths: apps/ios/**/*.swift
---
# iOS SwiftUI & Native Components Rules

## Framework obligatoire

**TOUJOURS utiliser SwiftUI** pour l'UI. Ne JAMAIS utiliser UIKit directement sauf cas exceptionnels (bridges nécessaires).

## Composants natifs Apple

### TOUJOURS utiliser les composants SwiftUI natifs

```swift
// Composants natifs
NavigationStack { }           // Navigation
TabView { }                   // Onglets
List { }                      // Listes scrollables
Form { }                      // Formulaires
Sheet { }                     // Modales
Alert { }                     // Alertes
ProgressView()                // Loading spinner
Toggle()                      // Switch on/off
Picker()                      // Sélection
DatePicker()                  // Sélection de date
TextField()                   // Champ texte
SecureField()                 // Champ mot de passe
TextEditor()                  // Texte multiligne
Button()                      // Boutons
Label()                       // Icône + texte
AsyncImage()                  // Images distantes
ContentUnavailableView()      // États vides
```

### Navigation

```swift
// NavigationStack moderne (iOS 16+)
NavigationStack {
    List(items) { item in
        NavigationLink(value: item) {
            ItemRow(item: item)
        }
    }
    .navigationDestination(for: Item.self) { item in
        ItemDetailView(item: item)
    }
}

// NavigationView deprecated - NE PAS UTILISER
```

### Connexion ViewModel ↔ View

```swift
// Pattern 1 : @StateObject pour ViewModel local
struct ProfileView: View {
    @StateObject private var vm = ProfileViewModel()

    var body: some View {
        // ...
    }
}

// Pattern 2 : @Environment pour ViewModel @Observable partagé (iOS 17+)
struct HomeView: View {
    @Environment(AuthViewModel.self) var authVM

    var body: some View {
        // ...
    }
}
```

### Modales et Sheets

```swift
// Sheet natif
.sheet(isPresented: $showSheet) {
    MySheetContent()
}

.sheet(item: $selectedItem) { item in
    ItemDetailSheet(item: item)
}

// DynamicSheet pour sheets à hauteur dynamique (composant custom du projet)
DynamicSheet(isPresented: $showSheet) {
    // Contenu qui détermine la hauteur automatiquement
}

// fullScreenCover pour les modales plein écran
.fullScreenCover(isPresented: $showFullScreen) {
    FullScreenModal()
}

// Confirmation dialog natif
.confirmationDialog("Supprimer ?", isPresented: $showConfirm) {
    Button("Supprimer", role: .destructive) { }
    Button("Annuler", role: .cancel) { }
}

// Alert natif
.alert("Erreur", isPresented: $showError) {
    Button("OK") { }
} message: {
    Text(errorMessage)
}
```

### Listes et Collections

```swift
// List natif avec swipe actions (pour listes simples avec comportement standard)
List {
    ForEach(items) { item in
        ItemRow(item: item)
            .swipeActions(edge: .trailing) {
                Button(role: .destructive) {
                    delete(item)
                } label: {
                    Label("Supprimer", systemImage: "trash")
                }
            }
    }
}
.listStyle(.plain)
.refreshable {
    await refresh()
}
.searchable(text: $searchText)

// ScrollView + LazyVStack pour layouts custom (cards, spacing custom, etc.)
ScrollView {
    LazyVStack(spacing: 12) {
        ForEach(items) { item in
            ItemCard(item: item)
        }
    }
    .padding(.horizontal, Theme.paddingHorizontal)
}
```

### États vides

```swift
// ContentUnavailableView pour les listes vides ou états sans contenu
if items.isEmpty && !isLoading {
    ContentUnavailableView(
        "Aucun résultat",
        systemImage: "magnifyingglass",
        description: Text("Essayez une autre recherche")
    )
}
```

### Skeleton Loading

Le projet utilise des composants de skeleton loading pour les états de chargement :

```swift
// SkeletonList / SkeletonRow pour simuler le chargement
if isLoading {
    SkeletonList()  // Affiche des lignes placeholder animées
}

// ShimmerModifier pour l'effet de shimmer
Rectangle()
    .modifier(ShimmerModifier())
```

### Images

```swift
// SF Symbols
Image(systemName: "person.fill")
    .imageScale(.large)
    .foregroundStyle(Theme.tintColor)

// AsyncImage pour images distantes
AsyncImage(url: user.imageURL) { image in
    image
        .resizable()
        .scaledToFill()
} placeholder: {
    ProgressView()
}
.frame(width: 50, height: 50)
.clipShape(Circle())
```

### Formulaires

```swift
// Form natif pour les settings/préférences
Form {
    Section("Compte") {
        TextField("Nom", text: $name)
        TextField("Email", text: $email)
    }

    Section("Préférences") {
        Toggle("Notifications", isOn: $notificationsEnabled)
        Picker("Langue", selection: $language) {
            ForEach(languages, id: \.self) { Text($0) }
        }
    }
}

// Picker natif
Picker("Sport", selection: $sport) {
    Text("Tennis").tag(Sport.tennis)
    Text("Padel").tag(Sport.padel)
}
.pickerStyle(.segmented)  // ou .menu, .wheel selon le contexte
```

### Loading States

```swift
// ProgressView natif
if isLoading {
    ProgressView()
        .progressViewStyle(.circular)
}

// Pour les boutons
Button("Envoyer") { }
    .disabled(isLoading)
    .overlay {
        if isLoading {
            ProgressView()
                .progressViewStyle(CircularProgressViewStyle(tint: .white))
        }
    }
```

### Gestures

```swift
// Gestures natifs
.onTapGesture { }
.onLongPressGesture { }
.swipeActions { }  // Pour List
.refreshable { }   // Pull to refresh
```

## Règles

1. **SwiftUI first** : Toujours privilégier SwiftUI sur UIKit
2. **Composants natifs** : Utiliser List, Form, NavigationStack, Sheet, Alert, etc.
3. **SF Symbols** : Utiliser les icônes système Apple
4. **AsyncImage** : Pour les images distantes (pas de lib tierce)
5. **NavigationStack** : Pas NavigationView (deprecated)
6. **iOS 16+** : Utiliser les APIs modernes (NavigationStack, etc.)
7. **DynamicSheet** : Pour les sheets à hauteur variable
8. **ContentUnavailableView** : Pour les états vides
9. **Skeleton loading** : Utiliser les composants skeleton du projet

## Anti-patterns

- Ne PAS créer de custom TabBar quand TabView suffit
- Ne PAS créer de custom Navigation quand NavigationStack suffit
- Ne PAS créer de custom Alert quand .alert() suffit
- Ne PAS créer de custom Picker quand Picker suffit
- Ne PAS wrapper UIKit sans raison valable
