//
//  SignUpUseCase.swift
//  AceClub
//
//  Created by Nicolas Becharat on 12/01/2026.
//

import Foundation

class SignUpUseCase {
    private let repository = AuthRepository()

    func execute(name: String, email: String, password: String) async throws -> User {
        // Validate inputs
        guard !name.isEmpty else {
            throw ValidationError.emptyName
        }

        guard isValidEmail(email) else {
            throw ValidationError.invalidEmail
        }

        guard password.count >= 8 else {
            throw ValidationError.passwordTooShort
        }

        let (user, session) = try await repository.signUp(name: name, email: email, password: password)

        // Save token to Keychain
        try KeychainManager.shared.saveAuthToken(session.token)

        return user
    }

    private func isValidEmail(_ email: String) -> Bool {
        let emailRegex = "[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}"
        let emailPredicate = NSPredicate(format:"SELF MATCHES %@", emailRegex)
        return emailPredicate.evaluate(with: email)
    }
}

enum ValidationError: Error, LocalizedError {
    case emptyName
    case invalidEmail
    case passwordTooShort
    case invalidSwipeAction

    var errorDescription: String? {
        switch self {
        case .emptyName:
            return "Name cannot be empty"
        case .invalidEmail:
            return "Please enter a valid email address"
        case .passwordTooShort:
            return "Password must be at least 8 characters"
        case .invalidSwipeAction:
            return "Action must be \"like\" or \"pass\""
        }
    }
}
