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

    func completeOnboarding(organizationId: String, sport: String, skillLevel: String, phoneNumber: String, imageUrl: String? = nil, pin: String? = nil, birthdate: String, gender: String) async throws -> User {
        let userDTO = try await userDataSource.completeOnboarding(
            organizationId: organizationId,
            sport: sport,
            skillLevel: skillLevel,
            phoneNumber: phoneNumber,
            imageUrl: imageUrl,
            pin: pin,
            birthdate: birthdate,
            gender: gender
        )
        return UserMapper.map(userDTO: userDTO)
    }

    func getPreferences() async throws -> UserPreferences {
        let preferencesDTO = try await userDataSource.getPreferences()
        return UserMapper.map(userPreferencesDTO: preferencesDTO)
    }

    func updateProfile(
        name: String?,
        image: String?,
        phoneNumber: String?,
        organizationId: String?,
        sport: String?,
        skillLevel: String?,
        pin: String? = nil
    ) async throws -> User {
        let userDTO = try await userDataSource.updateProfile(
            name: name,
            image: image,
            phoneNumber: phoneNumber,
            organizationId: organizationId,
            sport: sport,
            skillLevel: skillLevel,
            pin: pin
        )
        return UserMapper.map(userDTO: userDTO)
    }

    func createGhost(name: String, email: String) async throws -> User {
        let ghostDTO = try await userDataSource.createGhost(name: name, email: email)
        return UserMapper.map(ghostUserDTO: ghostDTO)
    }
}
