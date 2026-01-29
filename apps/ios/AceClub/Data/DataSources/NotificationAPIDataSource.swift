//
//  NotificationAPIDataSource.swift
//  AceClub
//
//  Created by Claude on 29/01/2026.
//

import Foundation

enum NotificationAPIDataSourceError: Error {
    case invalidURL
    case requestFailed
    case decodingFailed
    case unauthorized
    case notFound
    case unknown
}

class NotificationAPIDataSource {

    // MARK: - List Notifications

    func listNotifications(
        limit: Int = 20,
        offset: Int = 0,
        unreadOnly: Bool = false
    ) async throws -> ListNotificationsResponseDTO {
        var components = URLComponents(string: "\(Config.apiBaseURL)/notification")
        components?.queryItems = [
            URLQueryItem(name: "limit", value: String(limit)),
            URLQueryItem(name: "offset", value: String(offset)),
            URLQueryItem(name: "unreadOnly", value: String(unreadOnly))
        ]

        guard let url = components?.url else {
            throw NotificationAPIDataSourceError.invalidURL
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url)

        if response.statusCode == 401 {
            throw NotificationAPIDataSourceError.unauthorized
        }

        guard response.statusCode == 200 else {
            throw NotificationAPIDataSourceError.requestFailed
        }

        do {
            return try JSONDecoder().decode(ListNotificationsResponseDTO.self, from: data)
        } catch {
            throw NotificationAPIDataSourceError.decodingFailed
        }
    }

    // MARK: - Get Unread Count

    func getUnreadCount() async throws -> Int {
        guard let url = URL(string: "\(Config.apiBaseURL)/notification/unread-count") else {
            throw NotificationAPIDataSourceError.invalidURL
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url)

        if response.statusCode == 401 {
            throw NotificationAPIDataSourceError.unauthorized
        }

        guard response.statusCode == 200 else {
            throw NotificationAPIDataSourceError.requestFailed
        }

        do {
            let dto = try JSONDecoder().decode(UnreadCountResponseDTO.self, from: data)
            return dto.unreadCount
        } catch {
            throw NotificationAPIDataSourceError.decodingFailed
        }
    }

    // MARK: - Register Device Token

    func registerDeviceToken(_ token: String, platform: String) async throws {
        guard let url = URL(string: "\(Config.apiBaseURL)/notification/register-token") else {
            throw NotificationAPIDataSourceError.invalidURL
        }

        let requestBody = RegisterDeviceTokenRequestDTO(token: token, platform: platform)
        let body = try JSONEncoder().encode(requestBody)

        let (_, response) = try await APIClient.shared.authenticatedRequest(
            url: url,
            method: "POST",
            body: body
        )

        if response.statusCode == 401 {
            throw NotificationAPIDataSourceError.unauthorized
        }

        guard response.statusCode == 200 else {
            throw NotificationAPIDataSourceError.requestFailed
        }
    }

    // MARK: - Unregister Device Token

    func unregisterDeviceToken(_ token: String) async throws {
        guard let url = URL(string: "\(Config.apiBaseURL)/notification/unregister-token") else {
            throw NotificationAPIDataSourceError.invalidURL
        }

        let requestBody = UnregisterDeviceTokenRequestDTO(token: token)
        let body = try JSONEncoder().encode(requestBody)

        let (_, response) = try await APIClient.shared.authenticatedRequest(
            url: url,
            method: "POST",
            body: body
        )

        if response.statusCode == 401 {
            throw NotificationAPIDataSourceError.unauthorized
        }

        guard response.statusCode == 200 else {
            throw NotificationAPIDataSourceError.requestFailed
        }
    }

    // MARK: - Mark Notification as Read

    func markAsRead(notificationId: String) async throws -> NotificationDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/notification/mark-read") else {
            throw NotificationAPIDataSourceError.invalidURL
        }

        let requestBody = MarkNotificationReadRequestDTO(notificationId: notificationId)
        let body = try JSONEncoder().encode(requestBody)

        let (data, response) = try await APIClient.shared.authenticatedRequest(
            url: url,
            method: "POST",
            body: body
        )

        if response.statusCode == 401 {
            throw NotificationAPIDataSourceError.unauthorized
        }

        if response.statusCode == 404 {
            throw NotificationAPIDataSourceError.notFound
        }

        guard response.statusCode == 200 else {
            throw NotificationAPIDataSourceError.requestFailed
        }

        do {
            let result = try JSONDecoder().decode(NotificationSuccessResponseDTO.self, from: data)
            guard let notification = result.notification else {
                throw NotificationAPIDataSourceError.decodingFailed
            }
            return notification
        } catch {
            throw NotificationAPIDataSourceError.decodingFailed
        }
    }

    // MARK: - Mark All Notifications as Read

    func markAllAsRead() async throws {
        guard let url = URL(string: "\(Config.apiBaseURL)/notification/mark-all-read") else {
            throw NotificationAPIDataSourceError.invalidURL
        }

        let (_, response) = try await APIClient.shared.authenticatedRequest(
            url: url,
            method: "POST",
            body: nil
        )

        if response.statusCode == 401 {
            throw NotificationAPIDataSourceError.unauthorized
        }

        guard response.statusCode == 200 else {
            throw NotificationAPIDataSourceError.requestFailed
        }
    }
}
