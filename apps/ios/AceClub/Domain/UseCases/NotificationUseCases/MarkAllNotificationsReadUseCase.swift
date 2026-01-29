//
//  MarkAllNotificationsReadUseCase.swift
//  AceClub
//
//  Created by Claude on 29/01/2026.
//

import Foundation

class MarkAllNotificationsReadUseCase {

    private let repository = NotificationRepository()

    func execute() async throws {
        try await repository.markAllAsRead()
    }
}
