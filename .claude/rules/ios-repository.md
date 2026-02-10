---
paths:
  - apps/ios/**/Repositories/**/*.swift
  - apps/ios/**/DataSources/**/*.swift
---
# iOS Repository & DataSource Rules

## Repository

### Nommage
- Fichier : `<Domaine>Repository.swift`
- **Pas de protocol** : Les repositories sont des classes concrètes

### Structure

```swift
class <Domain>Repository {
    private let dataSource = <Domain>APIDataSource()

    func <method>(<params>) async throws -> <Entity> {
        let dto = try await dataSource.<method>(<params>)
        return <Domain>Mapper.map(<dto>DTO: dto)
    }
}
```

### Règles Repository

1. **Classe concrète** : Pas de protocol, pas de `<Domain>RepositoryProtocol`
2. **DataSource instancié directement** : `private let dataSource = <Domain>APIDataSource()` (pas d'injection via init)
3. **Mapper** : Toujours utiliser un Mapper pour transformer DTO → Entity
4. **Retour** : Retourner des Entities, jamais des DTOs

---

## DataSource

### Nommage
- Fichier : `<Domaine>APIDataSource.swift`

### Structure

```swift
class <Domain>APIDataSource {
    func <method>(<params>) async throws -> <DTO> {
        guard let url = URL(string: "\(Config.apiBaseURL)/<endpoint>") else {
            throw <Domain>Error.invalidURL
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(
            url: url,
            method: "GET" // ou "POST", "PUT", "DELETE"
        )

        guard let httpResponse = response as? HTTPURLResponse else {
            throw <Domain>Error.invalidResponse
        }

        switch httpResponse.statusCode {
        case 200:
            return try JSONDecoder().decode(<DTO>.self, from: data)
        case 401:
            throw <Domain>Error.unauthorized
        default:
            throw <Domain>Error.serverError("Status: \(httpResponse.statusCode)")
        }
    }
}
```

### Pour les requêtes avec body (POST/PUT)

```swift
func create<Entity>(<params>) async throws -> <DTO> {
    guard let url = URL(string: "\(Config.apiBaseURL)/<endpoint>") else {
        throw <Domain>Error.invalidURL
    }

    let body = try JSONEncoder().encode(requestBody)

    let (data, response) = try await APIClient.shared.authenticatedRequest(
        url: url,
        method: "POST",
        body: body
    )

    guard let httpResponse = response as? HTTPURLResponse else {
        throw <Domain>Error.invalidResponse
    }

    guard httpResponse.statusCode == 201 else {
        throw <Domain>Error.serverError("Status: \(httpResponse.statusCode)")
    }

    return try JSONDecoder().decode(<DTO>.self, from: data)
}
```

### Error Enum

```swift
enum <Domain>Error: LocalizedError {
    case invalidURL
    case invalidResponse
    case unauthorized
    case serverError(String)

    var errorDescription: String? {
        switch self {
        case .invalidURL: return "URL invalide"
        case .invalidResponse: return "Réponse invalide"
        case .unauthorized: return "Non autorisé"
        case .serverError(let msg): return msg
        }
    }
}
```

### Règles DataSource

1. **APIClient.shared** : Utiliser `APIClient.shared.authenticatedRequest(url:method:body:)` pour les appels HTTP (JAMAIS URLSession directement)
2. **Erreurs typées** : Définir un enum `<Domain>Error: LocalizedError` spécifique au domaine
3. **Gestion des status codes** : Switch sur les codes HTTP (200, 201, 401, etc.)
4. **Retour** : Retourner des DTOs (pas d'Entities)

## Flux de données

```
UseCase → Repository → DataSource → APIClient.shared → API
                ↓
          Mapper (DTO → Entity)
```
