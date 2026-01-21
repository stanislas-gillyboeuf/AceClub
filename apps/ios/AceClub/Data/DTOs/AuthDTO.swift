//
//  AuthDTO.swift
//  AceClub
//
//  Created by Nicolas Becharat on 12/01/2026.
//

import Foundation

// MARK: - Sign Up Request
struct SignUpRequestDTO: Codable {
    let name: String
    let email: String
    let password: String
}

// MARK: - Sign In Request
struct SignInRequestDTO: Codable {
    let email: String
    let password: String
    let rememberMe: Bool
}

// MARK: - Auth Response
struct AuthResponseDTO: Codable {
    let user: UserDTO
    let token: String
    let redirect: Bool
}

// MARK: - Sign Out Response
struct SignOutResponseDTO: Codable {
    let success: Bool
}

// MARK: - Session Response
struct SessionResponseDTO: Codable {
    let user: UserDTO?
    let session: SessionInfoDTO?
}

struct SessionInfoDTO: Codable {
    let id: String
    let expiresAt: String
    let userId: String
}
