//
//  SignInWithGoogleUseCase.swift
//  AceClub
//
//  Created by Nicolas Becharat on 12/01/2026.
//

import Foundation
import UIKit

class SignInWithGoogleUseCase {
    private let repository = AuthRepository()

    @MainActor
    func execute(presentingViewController: UIViewController) async throws -> User {
        // 1. Get Google ID token via Google Sign-In SDK
        let googleResult = try await GoogleSignInManager.shared.signIn(presentingViewController: presentingViewController)

        // 2. Exchange Google tokens with Better Auth backend
        let (user, session) = try await repository.signInWithGoogle(
            idToken: googleResult.idToken,
            accessToken: googleResult.accessToken
        )

        // 3. Save the session token
        try KeychainManager.shared.saveAuthToken(session.token)

        return user
    }
}
