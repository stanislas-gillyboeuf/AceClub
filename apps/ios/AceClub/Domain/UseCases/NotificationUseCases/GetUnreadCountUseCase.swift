//
//  GetUnreadCountUseCase.swift
//  AceClub
//
//  Created by Claude on 29/01/2026.
//

import Foundation

class GetUnreadCountUseCase {

    private let repository = NotificationRepository()

    func execute() async throws -> Int {
        try await repository.getUnreadCount()
    }
}
