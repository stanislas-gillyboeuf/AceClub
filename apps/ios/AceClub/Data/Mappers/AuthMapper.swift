//
//  AuthMapper.swift
//  AceClub
//
//  Created by Nicolas Becharat on 12/01/2026.
//

import Foundation

class AuthMapper {
    static func map(authResponseDTO: AuthResponseDTO) -> (user: User, session: AuthSession) {
        return (
            user: UserMapper.map(userDTO: authResponseDTO.user),
            session: AuthSession(token: authResponseDTO.token)
        )
    }
}
