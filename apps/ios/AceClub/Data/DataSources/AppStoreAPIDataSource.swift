import Foundation

enum AppStoreAPIDataSourceError: LocalizedError {
    case invalidURL
    case requestFailed
    case noResults
    case parsingFailed

    var errorDescription: String? {
        switch self {
        case .invalidURL: return "URL invalide"
        case .requestFailed: return "Échec de la requête App Store"
        case .noResults: return "Aucun résultat trouvé"
        case .parsingFailed: return "Échec du parsing de la réponse"
        }
    }
}

class AppStoreAPIDataSource {

    func lookupApp(bundleId: String) async throws -> AppStoreLookupResultDTO {
        guard let url = URL(string: "https://itunes.apple.com/lookup?bundleId=\(bundleId)") else {
            throw AppStoreAPIDataSourceError.invalidURL
        }

        let (data, _) = try await URLSession.shared.data(from: url)

        guard let rawJSON = try JSONSerialization.jsonObject(with: data) as? [String: Any],
              let results = rawJSON["results"] as? [[String: Any]],
              let first = results.first else {
            throw AppStoreAPIDataSourceError.noResults
        }

        guard let version = first["version"] as? String,
              let artworkUrl512 = first["artworkUrl512"] as? String,
              let trackViewUrl = (first["trackViewUrl"] as? String)?.components(separatedBy: "?").first,
              let releaseNotes = first["releaseNotes"] as? String else {
            throw AppStoreAPIDataSourceError.parsingFailed
        }

        return AppStoreLookupResultDTO(
            version: version,
            artworkUrl512: artworkUrl512,
            trackViewUrl: trackViewUrl,
            releaseNotes: releaseNotes
        )
    }
}
