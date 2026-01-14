//
//  AdminBanUserUseCase.swift
//  AceClub
//
//  Created by Nicolas Becharat on 14/01/2026.
//

import Foundation

class AdminBanUserUseCase {
    private let repository = AdminRepository()

    func execute(userId: String) async throws -> User {
        return try await repository.banUser(userId: userId)
    }
}
