---
paths: apps/ios/**/*.swift
---
# iOS SwiftUI & Native Components Rules

## Framework obligatoire

**TOUJOURS utiliser SwiftUI** pour l'UI. Ne JAMAIS utiliser UIKit directement sauf cas exceptionnels (bridges nécessaires).

## Composants natifs Apple

### TOUJOURS utiliser les composants SwiftUI natifs

```swift
// ✅ BON - Composants natifs
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

// ❌ MAUVAIS - UIKit wrappers inutiles
UIViewRepresentable pour un simple TextField
UIViewControllerRepresentable pour une navigation
```

### Navigation

```swift
// ✅ BON - NavigationStack moderne (iOS 16+)
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

// ❌ MAUVAIS - NavigationView deprecated
NavigationView { }
```

### Modales et Sheets

```swift
// ✅ BON - Sheet natif
.sheet(isPresented: $showSheet) {
    MySheetContent()
}

.sheet(item: $selectedItem) { item in
    ItemDetailSheet(item: item)
}

// ✅ BON - Confirmation dialog natif
.confirmationDialog("Supprimer ?", isPresented: $showConfirm) {
    Button("Supprimer", role: .destructive) { }
    Button("Annuler", role: .cancel) { }
}

// ✅ BON - Alert natif
.alert("Erreur", isPresented: $showError) {
    Button("OK") { }
} message: {
    Text(errorMessage)
}
```

### Listes et Collections

```swift
// ✅ BON - List natif avec swipe actions
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

// ❌ MAUVAIS - ScrollView + ForEach pour une liste simple
ScrollView {
    LazyVStack {
        ForEach(items) { item in
            ItemRow(item: item)
        }
    }
}
```

### Images

```swift
// ✅ BON - SF Symbols
Image(systemName: "person.fill")
    .imageScale(.large)
    .foregroundStyle(Theme.tintColor)

// ✅ BON - AsyncImage pour images distantes
AsyncImage(url: user.imageURL) { image in
    image
        .resizable()
        .scaledToFill()
} placeholder: {
    ProgressView()
}
.frame(width: 50, height: 50)
.clipShape(Circle())

// ❌ MAUVAIS - Librairie tierce pour les images
// Ne pas utiliser Kingfisher, SDWebImage, etc. sauf besoin spécifique
```

### Formulaires

```swift
// ✅ BON - Form natif pour les settings/préférences
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

// ✅ BON - Picker natif
Picker("Sport", selection: $sport) {
    Text("Tennis").tag(Sport.tennis)
    Text("Padel").tag(Sport.padel)
}
.pickerStyle(.segmented)  // ou .menu, .wheel selon le contexte
```

### Loading States

```swift
// ✅ BON - ProgressView natif
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

// ❌ MAUVAIS - Animation custom pour un simple loader
```

### Gestures

```swift
// ✅ BON - Gestures natifs
.onTapGesture { }
.onLongPressGesture { }
.swipeActions { }  // Pour List
.refreshable { }   // Pull to refresh

// ❌ MAUVAIS - UIGestureRecognizer via UIViewRepresentable
```

## Règles

1. **SwiftUI first** : Toujours privilégier SwiftUI sur UIKit
2. **Composants natifs** : Utiliser List, Form, NavigationStack, Sheet, Alert, etc.
3. **SF Symbols** : Utiliser les icônes système Apple
4. **AsyncImage** : Pour les images distantes (pas de lib tierce)
5. **NavigationStack** : Pas NavigationView (deprecated)
6. **iOS 16+** : Utiliser les APIs modernes (NavigationStack, etc.)

## Anti-patterns

- Ne PAS créer de custom TabBar quand TabView suffit
- Ne PAS créer de custom Navigation quand NavigationStack suffit
- Ne PAS créer de custom Alert quand .alert() suffit
- Ne PAS créer de custom Picker quand Picker suffit
- Ne PAS wrapper UIKit sans raison valable
