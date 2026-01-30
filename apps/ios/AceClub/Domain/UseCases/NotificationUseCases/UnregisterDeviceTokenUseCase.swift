//
//  UnregisterDeviceTokenUseCase.swift
//  AceClub
//

import Foundation

final class UnregisterDeviceTokenUseCase {
    private let repository: NotificationRepository

    init(repository: NotificationRepository = NotificationRepository()) {
        self.repository = repository
    }

    func execute(token: String) async throws {
        try await repository.unregisterDeviceToken(token)
    }
}
