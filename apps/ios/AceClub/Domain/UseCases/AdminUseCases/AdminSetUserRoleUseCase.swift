//
//  AdminSetUserRoleUseCase.swift
//  AceClub
//
//  Created by Nicolas Becharat on 14/01/2026.
//

import Foundation

class AdminSetUserRoleUseCase {
    private let repository = AdminRepository()

    func execute(userId: String, role: String) async throws -> User {
        return try await repository.setRole(userId: userId, role: role)
    }
}
