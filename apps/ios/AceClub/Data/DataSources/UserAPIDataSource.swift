import Foundation
import Config

enum UserAPIDateSourceError: Error {
    case invalidURL
    case requestFailed
    case decodingFailed
    case unauthorized
    case unknown
}

class UserAPIDataSource {
    func getMe() async throws -> UserDTO {
    
        guard let url = URL(string: "\(APIConfig.baseURL)/api/user/me") else {
            throw UserAPIDateSourceError.invalidURL
        }

        let (data, response) = try await URLSession.shared.data(for: url)
        guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
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