//
//  MarkNotificationReadUseCase.swift
//  AceClub
//
//  Created by Claude on 29/01/2026.
//

import Foundation

class MarkNotificationReadUseCase {

    private let repository = NotificationRepository()

    func execute(notificationId: String) async throws -> AppNotification {
        try await repository.markAsRead(notificationId: notificationId)
    }
}
