//
//  SignInUseCase.swift
//  AceClub
//
//  Created by Nicolas Becharat on 12/01/2026.
//

import Foundation

class SignInUseCase {
    private let repository = AuthRepository()

    func execute(email: String, password: String, rememberMe: Bool = true) async throws -> User {
        guard !email.isEmpty else {
            throw ValidationError.invalidEmail
        }

        guard !password.isEmpty else {
            throw ValidationError.passwordTooShort
        }

        let (user, session) = try await repository.signIn(email: email, password: password, rememberMe: rememberMe)

        try KeychainManager.shared.saveAuthToken(session.token)

        return user
    }
}
