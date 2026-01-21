//
//  SearchUsersUseCase.swift
//  AceClub
//
//  Created by Claude on 21/01/2026.
//

import Foundation

class SearchUsersUseCase {
    let userRepository = UserRepository()

    func execute(query: String, limit: Int = 10) async throws -> [User] {
        guard !query.isEmpty else {
            return []
        }
        return try await userRepository.searchUsers(query: query, limit: limit)
    }
}
