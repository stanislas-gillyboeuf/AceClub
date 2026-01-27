//
//  AuthViewModel.swift
//  AceClub
//
//  Created by Nicolas Becharat on 12/01/2026.
//

import Foundation
import Observation
import UIKit

@Observable
class AuthViewModel {
    // MARK: - Properties
    var isAuthenticated = false
    var currentUser: User?
    var isLoading = false
    var errorMessage: String?

    // MARK: - Use Cases
    private let signInWithGoogleUseCase = SignInWithGoogleUseCase()
    private let signInWithAppleUseCase = SignInWithAppleUseCase()
    private let signOutUseCase = SignOutUseCase()
    private let checkSessionUseCase = CheckSessionUseCase()

    // MARK: - Init
    init() {
        // Check local token existence but wait for server validation via checkSession()
        if let token = try? KeychainManager.shared.getAuthToken(), !token.isEmpty {
            isLoading = true
        }
    }

    // MARK: - Check Session (validates token with server)
    @MainActor
    func checkSession() async {
        guard (try? KeychainManager.shared.getAuthToken()) != nil else {
            isAuthenticated = false
            return
        }

        isLoading = true

        do {
            if let user = try await checkSessionUseCase.execute() {
                currentUser = user
                isAuthenticated = true
            } else {
                try? KeychainManager.shared.deleteAuthToken()
                currentUser = nil
                isAuthenticated = false
            }
        } catch {
            // Token invalid or network error
            try? KeychainManager.shared.deleteAuthToken()
            currentUser = nil
            isAuthenticated = false
        }

        isLoading = false
    }

    // MARK: - Sign In with Google
    @MainActor
    func signInWithGoogle() async {
        isLoading = true
        errorMessage = nil

        // Get the root view controller to present Google Sign-In
        guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let rootViewController = windowScene.windows.first?.rootViewController else {
            errorMessage = "Unable to present Google Sign-In"
            isLoading = false
            return
        }

        do {
            let user = try await signInWithGoogleUseCase.execute(presentingViewController: rootViewController)
            currentUser = user
            isAuthenticated = true
        } catch let error as GoogleSignInError {
            if case .cancelled = error {
                // User cancelled, don't show error
            } else {
                errorMessage = error.localizedDescription
            }
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    // MARK: - Sign In with Apple
    @MainActor
    func signInWithApple() async {
        isLoading = true
        errorMessage = nil

        // Get window for Apple Sign-In presentation
        guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let window = windowScene.windows.first else {
            errorMessage = "Unable to present Apple Sign-In"
            isLoading = false
            return
        }

        do {
            let user = try await signInWithAppleUseCase.execute(presentingWindow: window)
            currentUser = user
            isAuthenticated = true
        } catch let error as AppleSignInError {
            if case .cancelled = error {
                // User cancelled, don't show error
            } else {
                errorMessage = error.localizedDescription
            }
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    // MARK: - Sign Out
    @MainActor
    func signOut() async {
        isLoading = true
        errorMessage = nil

        do {
            try await signOutUseCase.execute()
            currentUser = nil
            isAuthenticated = false
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    // MARK: - Clear Error
    func clearError() {
        errorMessage = nil
    }
}
