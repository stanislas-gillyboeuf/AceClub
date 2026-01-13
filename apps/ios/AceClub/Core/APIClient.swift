//
//  APIClient.swift
//  AceClub
//
//  Created by Nicolas Becharat on 13/01/2026.
//

import Foundation

class APIClient {
    static let shared = APIClient()

    private init() {}

    // MARK: - Authenticated Request
    func authenticatedRequest(url: URL, method: String = "GET", body: Data? = nil) async throws -> (Data, HTTPURLResponse) {
        let token = try KeychainManager.shared.getAuthToken()

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        if let body = body {
            request.httpBody = body
        }

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIClientError.invalidResponse
        }

        return (data, httpResponse)
    }
}

enum APIClientError: Error {
    case invalidResponse
    case unauthorized
}
