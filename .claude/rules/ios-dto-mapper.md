---
paths:
  - apps/ios/**/DTOs/**/*.swift
  - apps/ios/**/Mappers/**/*.swift
---
# iOS DTO & Mapper Rules

## DTO (Data Transfer Object)

### Nommage
- Fichier : `<Nom>DTO.swift`
- Struct : `<Nom>DTO`

### Structure

```swift
struct <Name>DTO: Codable {
    let id: String
    let name: String
    let optionalField: String?
    let nestedObject: NestedDTO?
}

// Pour les réponses de liste
struct List<Name>ResponseDTO: Codable {
    let items: [<Name>DTO]
    let total: Int
    let limit: Int?
    let offset: Int?
}
```

### Règles DTO

1. **Codable uniquement** : Conformer UNIQUEMENT à `Codable`
2. **Pas d'Identifiable** : Ne PAS conformer à `Identifiable`
3. **Optionnels** : Utiliser `?` pour les champs nullables dans l'API
4. **Pas de logique** : Aucune computed property ou méthode
5. **Correspondance API** : Les propriétés doivent correspondre exactement au JSON

---

## Mapper

### Nommage
- Fichier : `<Nom>Mapper.swift`
- Class : `<Nom>Mapper`

### Structure

```swift
class <Name>Mapper {
    static func map(<name>DTO: <Name>DTO) -> <Name> {
        return <Name>(
            id: <name>DTO.id,
            name: <name>DTO.name,
            optionalField: <name>DTO.optionalField
        )
    }

    // Pour les listes
    static func map(list<Name>ResponseDTO: List<Name>ResponseDTO) -> List<Name>Result {
        return List<Name>Result(
            items: list<Name>ResponseDTO.items.map { map(<name>DTO: $0) },
            total: list<Name>ResponseDTO.total,
            limit: list<Name>ResponseDTO.limit,
            offset: list<Name>ResponseDTO.offset
        )
    }
}
```

### Règles Mapper

1. **Méthodes statiques** : TOUTES les méthodes sont `static`
2. **Nommage paramètre** : `<name>DTO:` en camelCase
3. **Transformation** : DTO en entrée → Entity en sortie
4. **Pas d'état** : Pas de propriétés d'instance
5. **Plusieurs méthodes** : Une méthode par type de transformation

## Exemple complet

```swift
// UserDTO.swift
struct UserDTO: Codable {
    let id: String
    let name: String
    let email: String
    let image: String?
    let role: String?
}

// UserMapper.swift
class UserMapper {
    static func map(userDTO: UserDTO) -> User {
        return User(
            id: userDTO.id,
            name: userDTO.name,
            email: userDTO.email,
            image: userDTO.image,
            role: userDTO.role
        )
    }
}
```
