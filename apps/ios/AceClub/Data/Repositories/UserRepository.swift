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

    func completeOnboarding(organizationId: String, sport: String, skillLevel: String, phoneNumber: String) async throws -> User {
        let userDTO = try await userDataSource.completeOnboarding(
            organizationId: organizationId,
            sport: sport,
            skillLevel: skillLevel,
            phoneNumber: phoneNumber
        )
        return UserMapper.map(userDTO: userDTO)
    }

    func getPreferences() async throws -> UserPreferences {
        let preferencesDTO = try await userDataSource.getPreferences()
        return UserMapper.map(userPreferencesDTO: preferencesDTO)
    }

    func updateProfile(
        name: String?,
        phoneNumber: String?,
        organizationId: String?,
        sport: String?,
        skillLevel: String?
    ) async throws -> User {
        let userDTO = try await userDataSource.updateProfile(
            name: name,
            phoneNumber: phoneNumber,
            organizationId: organizationId,
            sport: sport,
            skillLevel: skillLevel
        )
        return UserMapper.map(userDTO: userDTO)
    }

    func createGhost(name: String, email: String) async throws -> User {
        let ghostDTO = try await userDataSource.createGhost(name: name, email: email)
        return UserMapper.map(ghostUserDTO: ghostDTO)
    }
}
