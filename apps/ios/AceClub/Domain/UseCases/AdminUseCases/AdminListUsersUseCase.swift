//
//  AdminListUsersUseCase.swift
//  AceClub
//
//  Created by Nicolas Becharat on 14/01/2026.
//

import Foundation

class AdminListUsersUseCase {
    private let repository = AdminRepository()

    func execute() async throws -> ListUsersResult {
        return try await repository.listUsers()
    }
}
