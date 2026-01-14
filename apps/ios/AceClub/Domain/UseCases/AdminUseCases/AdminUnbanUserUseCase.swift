//
//  AdminUnbanUserUseCase.swift
//  AceClub
//
//  Created by Nicolas Becharat on 14/01/2026.
//

import Foundation

class AdminUnbanUserUseCase {
    private let repository = AdminRepository()

    func execute(userId: String) async throws -> User {
        return try await repository.unbanUser(userId: userId)
    }
}
