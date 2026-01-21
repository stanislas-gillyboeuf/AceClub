//
//  AuthViewModel.swift
//  AceClub
//
//  Created by Nicolas Becharat on 12/01/2026.
//

import Foundation
import Observation

@Observable
class AuthViewModel {
    // MARK: - Properties
    var isAuthenticated = false
    var currentUser: User?
    var isLoading = false
    var errorMessage: String?

    // MARK: - Use Cases
    private let signUpUseCase = SignUpUseCase()
    private let signInUseCase = SignInUseCase()
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

    // MARK: - Sign Up
    @MainActor
    func signUp(name: String, email: String, password: String) async {
        isLoading = true
        errorMessage = nil

        do {
            let user = try await signUpUseCase.execute(name: name, email: email, password: password)
            currentUser = user
            isAuthenticated = true
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    // MARK: - Sign In
    @MainActor
    func signIn(email: String, password: String, rememberMe: Bool = true) async {
        isLoading = true
        errorMessage = nil

        do {
            let user = try await signInUseCase.execute(email: email, password: password, rememberMe: rememberMe)
            currentUser = user
            isAuthenticated = true
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
