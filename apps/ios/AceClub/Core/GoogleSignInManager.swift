//
//  GoogleSignInManager.swift
//  AceClub
//
//  Created by Nicolas Becharat on 12/01/2026.
//

import Foundation
import GoogleSignIn

enum GoogleSignInError: Error, LocalizedError {
    case signInFailed
    case noIdToken
    case cancelled
    case serverError(String)
    case networkError(Error)

    var errorDescription: String? {
        switch self {
        case .signInFailed:
            return "Google Sign-In failed"
        case .noIdToken:
            return "Failed to get ID token from Google"
        case .cancelled:
            return "Sign-in was cancelled"
        case .serverError(let message):
            return message
        case .networkError(let error):
            return "Network error: \(error.localizedDescription)"
        }
    }
}

@MainActor
class GoogleSignInManager {
    static let shared = GoogleSignInManager()

    private init() {}

    /// Configure Google Sign-In with the client ID
    /// Call this in AceClubApp init or on first launch
    func configure() {

    }

    /// Handle URL callback from Google Sign-In
    func handle(_ url: URL) -> Bool {
        return GIDSignIn.sharedInstance.handle(url)
    }

    /// Restore previous sign-in session if available
    func restorePreviousSignIn() async -> GIDGoogleUser? {
        do {
            return try await GIDSignIn.sharedInstance.restorePreviousSignIn()
        } catch {
            return nil
        }
    }

    /// Initiate Google Sign-In flow
    /// - Parameter presentingViewController: The view controller to present the sign-in UI from
    /// - Returns: The Google user with ID token for backend authentication
    func signIn(presentingViewController: UIViewController) async throws -> (idToken: String, accessToken: String, user: GIDGoogleUser) {
        do {
            let result = try await GIDSignIn.sharedInstance.signIn(withPresenting: presentingViewController)

            guard let idToken = result.user.idToken?.tokenString else {
                throw GoogleSignInError.noIdToken
            }

            let accessToken = result.user.accessToken.tokenString

            return (idToken: idToken, accessToken: accessToken, user: result.user)
        } catch let error as GIDSignInError {
            if error.code == .canceled {
                throw GoogleSignInError.cancelled
            }
            throw GoogleSignInError.signInFailed
        } catch {
            throw GoogleSignInError.networkError(error)
        }
    }

    /// Sign out from Google
    func signOut() {
        GIDSignIn.sharedInstance.signOut()
    }

    /// Disconnect Google account (revokes access)
    func disconnect() async {
        do {
            try await GIDSignIn.sharedInstance.disconnect()
        } catch {
            // Silently fail - user is already signed out locally
        }
    }
}
