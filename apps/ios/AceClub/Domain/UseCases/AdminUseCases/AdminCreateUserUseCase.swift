//
//  AdminCreateUserUseCase.swift
//  AceClub
//
//  Created by Nicolas Becharat on 14/01/2026.
//

import Foundation

class AdminCreateUserUseCase {
    private let repository = AdminRepository()

    func execute(name: String, email: String, password: String) async throws -> User {
        return try await repository.createUser(name: name, email: email, password: password)
    }
}
