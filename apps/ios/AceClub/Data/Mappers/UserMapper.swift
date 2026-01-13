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
            updatedAt: userDTO.updatedAt
        )
    }
}

