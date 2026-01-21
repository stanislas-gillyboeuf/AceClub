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
            banExpires: userDTO.banExpires
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
}
