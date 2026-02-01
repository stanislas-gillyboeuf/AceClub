//
//  SignInWithAppleUseCase.swift
//  AceClub
//
//  Created on 2026-01-27.
//

import Foundation
import UIKit

class SignInWithAppleUseCase {
    private let repository: AuthRepositoryProtocol

    init(repository: AuthRepositoryProtocol = AuthRepository()) {
        self.repository = repository
    }

    @MainActor
    func execute(presentingWindow: UIWindow) async throws -> User {
        // 1. Get Apple ID token + user info via AuthenticationServices
        let appleResult = try await AppleSignInManager.shared.signIn(presentingWindow: presentingWindow)

        // 2. Exchange with Better Auth backend
        let (user, session) = try await repository.signInWithApple(
            idToken: appleResult.identityToken,
            email: appleResult.email,
            name: appleResult.fullName
        )

        // 3. Save session token to Keychain
        try KeychainManager.shared.saveAuthToken(session.token)

        return user
    }
}
