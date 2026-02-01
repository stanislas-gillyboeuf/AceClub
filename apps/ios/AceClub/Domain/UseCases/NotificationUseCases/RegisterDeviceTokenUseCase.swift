//
//  RegisterDeviceTokenUseCase.swift
//  AceClub
//

import Foundation

final class RegisterDeviceTokenUseCase {
    private let repository: NotificationRepository

    init(repository: NotificationRepository = NotificationRepository()) {
        self.repository = repository
    }

    func execute(token: String, platform: String = "ios") async throws {
        try await repository.registerDeviceToken(token, platform: platform)
    }
}
