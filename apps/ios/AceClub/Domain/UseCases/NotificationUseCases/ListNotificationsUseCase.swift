//
//  ListNotificationsUseCase.swift
//  AceClub
//
//  Created by Claude on 29/01/2026.
//

import Foundation

class ListNotificationsUseCase {

    private let repository = NotificationRepository()

    func execute(
        limit: Int = 20,
        offset: Int = 0,
        unreadOnly: Bool = false
    ) async throws -> (notifications: [AppNotification], total: Int) {
        try await repository.listNotifications(
            limit: limit,
            offset: offset,
            unreadOnly: unreadOnly
        )
    }
}
