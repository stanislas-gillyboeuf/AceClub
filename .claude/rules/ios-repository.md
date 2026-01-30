---
paths:
  - apps/ios/**/Repositories/**/*.swift
  - apps/ios/**/DataSources/**/*.swift
---
# iOS Repository & DataSource Rules

## Repository

### Nommage
- Fichier : `<Domaine>Repository.swift`
- Protocol : `<Domaine>RepositoryProtocol`

### Structure

```swift
protocol <Domain>RepositoryProtocol {
    func <method>(<params>) async throws -> <Entity>
}

class <Domain>Repository: <Domain>RepositoryProtocol {
    private let dataSource: <Domain>APIDataSource

    init(dataSource: <Domain>APIDataSource = <Domain>APIDataSource()) {
        self.dataSource = dataSource
    }

    func <method>(<params>) async throws -> <Entity> {
        let dto = try await dataSource.<method>(<params>)
        return <Domain>Mapper.map(<dto>DTO: dto)
    }
}
```

### Règles Repository

1. **Protocol** : Toujours définir un protocol pour le Repository
2. **Injection** : DataSource injecté via init avec valeur par défaut
3. **Mapper** : Toujours utiliser un Mapper pour transformer DTO → Entity
4. **Retour** : Retourner des Entities, jamais des DTOs

---

## DataSource

### Nommage
- Fichier : `<Domaine>APIDataSource.swift`

### Structure

```swift
class <Domain>APIDataSource {
    private let session: URLSession

    init(session: URLSession = .shared) {
        self.session = session
    }

    func <method>(<params>) async throws -> <DTO> {
        guard let url = URL(string: "\(Config.apiBaseURL)/<endpoint>") else {
            throw <Domain>Error.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = "GET" // ou POST, PUT, DELETE
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(AuthManager.shared.token ?? "")", forHTTPHeaderField: "Authorization")

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw <Domain>Error.invalidResponse
        }

        guard httpResponse.statusCode == 200 else {
            throw <Domain>Error.serverError("Status: \(httpResponse.statusCode)")
        }

        return try JSONDecoder().decode(<DTO>.self, from: data)
    }
}
```

### Règles DataSource

1. **URLSession** : Utiliser URLSession pour les appels HTTP
2. **Erreurs typées** : Définir des erreurs spécifiques au domaine
3. **Bearer token** : Ajouter le header Authorization
4. **Retour** : Retourner des DTOs (pas d'Entities)
5. **Vérification status** : Toujours vérifier le code HTTP

## Flux de données

```
UseCase → Repository → DataSource → API
                ↓
          Mapper (DTO → Entity)
```
