//
//  NotificationMapper.swift
//  AceClub
//
//  Created by Claude on 29/01/2026.
//

import Foundation

enum NotificationMapper {

    static func map(dto: NotificationDTO) -> AppNotification {
        let dateFormatter = ISO8601DateFormatter()
        dateFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

        return AppNotification(
            id: dto.id,
            userId: dto.userId,
            type: NotificationType(rawValue: dto.type) ?? .unknown,
            title: dto.title,
            body: dto.body,
            data: dto.data,
            referenceId: dto.referenceId,
            referenceType: dto.referenceType,
            isRead: dto.isRead,
            readAt: dto.readAt.flatMap { dateFormatter.date(from: $0) },
            sentAt: dto.sentAt.flatMap { dateFormatter.date(from: $0) },
            createdAt: dateFormatter.date(from: dto.createdAt) ?? Date()
        )
    }

    static func map(dtos: [NotificationDTO]) -> [AppNotification] {
        dtos.map { map(dto: $0) }
    }

    static func map(listResponseDTO: ListNotificationsResponseDTO) -> (notifications: [AppNotification], total: Int) {
        let notifications = map(dtos: listResponseDTO.notifications)
        return (notifications, listResponseDTO.total)
    }
}
