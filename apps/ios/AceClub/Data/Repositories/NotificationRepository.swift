//
//  NotificationRepository.swift
//  AceClub
//

import Foundation

final class NotificationRepository {
    private let apiClient = APIClient.shared
    private let baseURL = Config.apiBaseURL

    func registerDeviceToken(_ token: String, platform: String) async throws {
        guard let url = URL(string: "\(baseURL)/notification/register-token") else {
            throw URLError(.badURL)
        }

        let body = try JSONEncoder().encode(["token": token, "platform": platform])
        let (_, response) = try await apiClient.authenticatedRequest(url: url, method: "POST", body: body)

        guard response.statusCode == 200 else {
            throw URLError(.badServerResponse)
        }
    }

    func unregisterDeviceToken(_ token: String) async throws {
        guard let url = URL(string: "\(baseURL)/notification/unregister-token") else {
            throw URLError(.badURL)
        }

        let body = try JSONEncoder().encode(["token": token])
        let (_, response) = try await apiClient.authenticatedRequest(url: url, method: "POST", body: body)

        guard response.statusCode == 200 else {
            throw URLError(.badServerResponse)
        }
    }
}
