//
//  NotificationRepository.swift
//  AceClub
//
//  Created by Claude on 29/01/2026.
//

import Foundation

class NotificationRepository {

    private let dataSource = NotificationAPIDataSource()

    // MARK: - List Notifications

    func listNotifications(
        limit: Int = 20,
        offset: Int = 0,
        unreadOnly: Bool = false
    ) async throws -> (notifications: [AppNotification], total: Int) {
        let dto = try await dataSource.listNotifications(
            limit: limit,
            offset: offset,
            unreadOnly: unreadOnly
        )
        return NotificationMapper.map(listResponseDTO: dto)
    }

    // MARK: - Get Unread Count

    func getUnreadCount() async throws -> Int {
        try await dataSource.getUnreadCount()
    }

    // MARK: - Register Device Token

    func registerDeviceToken(_ token: String, platform: String) async throws {
        try await dataSource.registerDeviceToken(token, platform: platform)
    }

    // MARK: - Unregister Device Token

    func unregisterDeviceToken(_ token: String) async throws {
        try await dataSource.unregisterDeviceToken(token)
    }

    // MARK: - Mark as Read

    func markAsRead(notificationId: String) async throws -> AppNotification {
        let dto = try await dataSource.markAsRead(notificationId: notificationId)
        return NotificationMapper.map(dto: dto)
    }

    // MARK: - Mark All as Read

    func markAllAsRead() async throws {
        try await dataSource.markAllAsRead()
    }
}
