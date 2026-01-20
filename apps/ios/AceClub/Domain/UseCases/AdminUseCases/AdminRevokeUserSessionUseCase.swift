//
//  AdminRevokeUserSessionUseCase.swift
//  AceClub
//
//  Created by Nicolas Becharat on 14/01/2026.
//

import Foundation

class AdminRevokeUserSessionUseCase {
    private let repository = AdminRepository()

    func execute(userId: String, sessionId: String) async throws -> User {
        return try await repository.revokeUserSession(userId: userId, sessionId: sessionId)
    }
}
