import Foundation

enum UserAPIDateSourceError: Error {
    case invalidURL
    case requestFailed
    case decodingFailed
    case unauthorized
    case unknown
}

class UserAPIDataSource {
    func getMe() async throws -> UserDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/user/me") else {
            throw UserAPIDateSourceError.invalidURL
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url)

        if response.statusCode == 401 {
            throw UserAPIDateSourceError.unauthorized
        }

        guard response.statusCode == 200 else {
            throw UserAPIDateSourceError.requestFailed
        }

        do {
            let me = try JSONDecoder().decode(UserDTO.self, from: data)
            return me
        } catch {
            throw UserAPIDateSourceError.decodingFailed
        }
    }
}
