//
//  NotificationDTO.swift
//  AceClub
//
//  Created by Claude on 29/01/2026.
//

import Foundation

// MARK: - Notification DTO

struct NotificationDTO: Codable {
    let id: String
    let userId: String
    let type: String
    let title: String
    let body: String
    let data: String?
    let referenceId: String?
    let referenceType: String?
    let isRead: Bool
    let readAt: String?
    let sentAt: String?
    let createdAt: String
}

// MARK: - List Notifications Response

struct ListNotificationsResponseDTO: Codable {
    let notifications: [NotificationDTO]
    let total: Int
    let limit: Int
    let offset: Int
}

// MARK: - Unread Count Response

struct UnreadCountResponseDTO: Codable {
    let unreadCount: Int
}

// MARK: - Register Token Request

struct RegisterDeviceTokenRequestDTO: Codable {
    let token: String
    let platform: String
}

// MARK: - Unregister Token Request

struct UnregisterDeviceTokenRequestDTO: Codable {
    let token: String
}

// MARK: - Mark Read Request

struct MarkNotificationReadRequestDTO: Codable {
    let notificationId: String
}

// MARK: - Generic Success Response

struct NotificationSuccessResponseDTO: Codable {
    let success: Bool
    let message: String?
    let notification: NotificationDTO?
}
