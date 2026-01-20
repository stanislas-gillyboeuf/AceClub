//
//  AdminSetUserPasswordUseCase.swift
//  AceClub
//
//  Created by Nicolas Becharat on 14/01/2026.
//

import Foundation

class AdminSetUserPasswordUseCase {
    private let repository = AdminRepository()

    func execute(userId: String, password: String) async throws -> User {
        return try await repository.setUserPassword(userId: userId, password: password)
    }
}
