//
//  UserRepository.swift
//  AceClub
//
//  Created by Nicolas Becharat on 12/01/2026.
//

import Foundation
class UserRepository {

    let userDataSource = UserAPIDataSource() 
    func getMe() async throws -> User {
        let userDTO = try await userDataSource.getMe()
        return UserMapper.map(userDTO: userDTO)
    }

    func searchUsers(query: String, limit: Int) async throws -> [User] {
        let userSearchResponse = try await userDataSource.searchUsers(query: query, limit: limit)
        return UserMapper.map(userSearchResponseDTO: userSearchResponse)
    }

    func completeOnboarding(organizationId: String, sport: String, skillLevel: String) async throws -> User {
        let userDTO = try await userDataSource.completeOnboarding(
            organizationId: organizationId,
            sport: sport,
            skillLevel: skillLevel
        )
        return UserMapper.map(userDTO: userDTO)
    }
}
