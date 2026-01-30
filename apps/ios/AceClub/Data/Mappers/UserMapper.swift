//
//  UserMapper.swift
//  AceClub
//
//  Created by Nicolas Becharat on 12/01/2026.
//

import Foundation

class UserMapper {
    static func map(userDTO: UserDTO) -> User {
        return User(
            id: userDTO.id,
            name: userDTO.name,
            email: userDTO.email,
            emailVerified: userDTO.emailVerified,
            image: userDTO.image,
            createdAt: userDTO.createdAt,
            updatedAt: userDTO.updatedAt,
            role: userDTO.role,
            banned: userDTO.banned,
            banReason: userDTO.banReason,
            banExpires: userDTO.banExpires,
            onboardingCompleted: userDTO.onboardingCompleted,
            phoneNumber: userDTO.phoneNumber,
            isGhost: nil
        )
    }

    static func map(listUsersResponseDTO: ListUsersResponseDTO) -> ListUsersResult {
        return ListUsersResult(
            users: listUsersResponseDTO.users.map { map(userDTO: $0) },
            total: listUsersResponseDTO.total,
            limit: listUsersResponseDTO.limit,
            offset: listUsersResponseDTO.offset
        )
    }

    static func map(userSearchItemDTO: UserSearchItemDTO) -> User {
        return User(
            id: userSearchItemDTO.id,
            name: userSearchItemDTO.name,
            email: userSearchItemDTO.email,
            emailVerified: nil,
            image: userSearchItemDTO.image,
            createdAt: nil,
            updatedAt: nil,
            role: nil,
            banned: nil,
            banReason: nil,
            banExpires: nil,
            onboardingCompleted: nil,
            phoneNumber: nil,
            isGhost: userSearchItemDTO.isGhost
        )
    }

    static func map(ghostUserDTO: GhostUserDTO) -> User {
        return User(
            id: ghostUserDTO.id,
            name: ghostUserDTO.name,
            email: ghostUserDTO.email,
            emailVerified: nil,
            image: ghostUserDTO.image,
            createdAt: ghostUserDTO.createdAt,
            updatedAt: nil,
            role: nil,
            banned: nil,
            banReason: nil,
            banExpires: nil,
            onboardingCompleted: nil,
            phoneNumber: nil,
            isGhost: ghostUserDTO.isGhost
        )
    }

    static func map(userSearchResponseDTO: UserSearchResponseDTO) -> [User] {
        return userSearchResponseDTO.users.map { map(userSearchItemDTO: $0) }
    }

    static func map(userPreferencesDTO: UserPreferencesResponseDTO) -> UserPreferences {
        return UserPreferences(
            id: userPreferencesDTO.id,
            userId: userPreferencesDTO.userId,
            organizationId: userPreferencesDTO.organizationId,
            organizationName: userPreferencesDTO.organizationName,
            sport: userPreferencesDTO.sport,
            skillLevel: userPreferencesDTO.skillLevel,
            createdAt: userPreferencesDTO.createdAt,
            updatedAt: userPreferencesDTO.updatedAt
        )
    }
}

