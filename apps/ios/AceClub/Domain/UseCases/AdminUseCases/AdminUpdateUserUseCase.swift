//
//  AdminUpdateUserUseCase.swift
//  AceClub
//
//  Created by Nicolas Becharat on 14/01/2026.
//

import Foundation

class AdminUpdateUserUseCase {
    private let repository = AdminRepository()

    func execute(userId: String, name: String, email: String, password: String) async throws -> User {
        return try await repository.updateUser(userId: userId, name: name, email: email, password: password)
    }
}
