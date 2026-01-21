//
//  AdminListUserSessionsUseCase.swift
//  AceClub
//
//  Created by Nicolas Becharat on 14/01/2026.
//

import Foundation

class AdminListUserSessionsUseCase {
    private let repository = AdminRepository()

    func execute(userId: String) async throws -> [Session] {
        return try await repository.listUserSessions(userId: userId)
    }
}
