//
//  CreateGhostUserUseCase.swift
//  AceClub
//
//  Created by Claude on 30/01/2026.
//

import Foundation

class CreateGhostUserUseCase {
    private let userRepository = UserRepository()

    func execute(name: String, email: String) async throws -> User {
        guard !name.isEmpty else {
            throw CreateGhostError.nameRequired
        }
        guard !email.isEmpty, email.contains("@") else {
            throw CreateGhostError.invalidEmail
        }
        return try await userRepository.createGhost(name: name, email: email)
    }
}

enum CreateGhostError: LocalizedError {
    case nameRequired
    case invalidEmail

    var errorDescription: String? {
        switch self {
        case .nameRequired:
            return "Le nom est requis"
        case .invalidEmail:
            return "L'email est invalide"
        }
    }
}
