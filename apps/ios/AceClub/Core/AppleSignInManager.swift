//
//  AppleSignInManager.swift
//  AceClub
//
//  Created on 2026-01-27.
//

import Foundation
import UIKit
import AuthenticationServices
import CryptoKit

/// Errors that can occur during Apple Sign-In
enum AppleSignInError: Error, LocalizedError {
    case authorizationFailed
    case noIdentityToken
    case cancelled
    case invalidCredential
    case networkError(Error)
    case configurationError(String)

    var errorDescription: String? {
        switch self {
        case .authorizationFailed:
            return "L'autorisation Apple a échoué"
        case .noIdentityToken:
            return "Token d'identité Apple manquant"
        case .cancelled:
            return "Connexion annulée"
        case .invalidCredential:
            return "Identifiants Apple invalides"
        case .networkError(let error):
            let nsError = error as NSError
            return "Erreur Apple Sign-In (code: \(nsError.code)): \(error.localizedDescription)"
        case .configurationError(let message):
            return "Erreur de configuration: \(message)"
        }
    }
}

/// Result of a successful Apple Sign-In
struct AppleSignInResult {
    let identityToken: String
    let nonce: String
    let authorizationCode: String?
}

/// Singleton manager for Apple Sign-In using AuthenticationServices
@MainActor
class AppleSignInManager: NSObject {
    static let shared = AppleSignInManager()

    private var currentContinuation: CheckedContinuation<AppleSignInResult, Error>?
    private var currentNonce: String?

    private override init() {
        super.init()
    }

    /// Initiates Apple Sign-In flow
    /// - Parameter presentingWindow: The window to present the authorization UI
    /// - Returns: AppleSignInResult containing identity token and nonce
    func signIn(presentingWindow: UIWindow) async throws -> AppleSignInResult {
        return try await withCheckedThrowingContinuation { continuation in
            self.currentContinuation = continuation

            // Generate cryptographically secure nonce
            let nonce = generateNonce()
            self.currentNonce = nonce

            // Create Apple ID request
            let appleIDProvider = ASAuthorizationAppleIDProvider()
            let request = appleIDProvider.createRequest()
            request.requestedScopes = [.fullName, .email]
            request.nonce = sha256(nonce)

            // Create and configure authorization controller
            let authorizationController = ASAuthorizationController(authorizationRequests: [request])
            authorizationController.delegate = self
            authorizationController.presentationContextProvider = self
            authorizationController.performRequests()
        }
    }

    /// Generates a cryptographically secure random nonce (32 characters)
    private func generateNonce() -> String {
        let charset = Array("0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._")
        var result = ""
        var remainingLength = 32

        while remainingLength > 0 {
            let randoms: [UInt8] = (0..<16).map { _ in
                var random: UInt8 = 0
                let errorCode = SecRandomCopyBytes(kSecRandomDefault, 1, &random)
                if errorCode != errSecSuccess {
                    fatalError("Unable to generate nonce. SecRandomCopyBytes failed with OSStatus \(errorCode)")
                }
                return random
            }

            randoms.forEach { random in
                if remainingLength == 0 {
                    return
                }

                if random < charset.count {
                    result.append(charset[Int(random)])
                    remainingLength -= 1
                }
            }
        }

        return result
    }

    /// Hashes a string using SHA256
    private func sha256(_ input: String) -> String {
        let inputData = Data(input.utf8)
        let hashedData = SHA256.hash(data: inputData)
        let hashString = hashedData.compactMap {
            String(format: "%02x", $0)
        }.joined()

        return hashString
    }
}

// MARK: - ASAuthorizationControllerDelegate
extension AppleSignInManager: ASAuthorizationControllerDelegate {
    func authorizationController(controller: ASAuthorizationController, didCompleteWithAuthorization authorization: ASAuthorization) {
        guard let appleIDCredential = authorization.credential as? ASAuthorizationAppleIDCredential else {
            currentContinuation?.resume(throwing: AppleSignInError.invalidCredential)
            currentContinuation = nil
            currentNonce = nil
            return
        }

        guard let identityTokenData = appleIDCredential.identityToken,
              let identityToken = String(data: identityTokenData, encoding: .utf8) else {
            currentContinuation?.resume(throwing: AppleSignInError.noIdentityToken)
            currentContinuation = nil
            currentNonce = nil
            return
        }

        guard let nonce = currentNonce else {
            currentContinuation?.resume(throwing: AppleSignInError.authorizationFailed)
            currentContinuation = nil
            return
        }

        let authorizationCode: String?
        if let authorizationCodeData = appleIDCredential.authorizationCode {
            authorizationCode = String(data: authorizationCodeData, encoding: .utf8)
        } else {
            authorizationCode = nil
        }

        let result = AppleSignInResult(
            identityToken: identityToken,
            nonce: nonce,
            authorizationCode: authorizationCode
        )

        currentContinuation?.resume(returning: result)
        currentContinuation = nil
        currentNonce = nil
    }

    func authorizationController(controller: ASAuthorizationController, didCompleteWithError error: Error) {
        if let authError = error as? ASAuthorizationError {
            switch authError.code {
            case .canceled:
                currentContinuation?.resume(throwing: AppleSignInError.cancelled)
            case .failed:
                currentContinuation?.resume(throwing: AppleSignInError.authorizationFailed)
            case .invalidResponse:
                currentContinuation?.resume(throwing: AppleSignInError.invalidCredential)
            case .notHandled:
                currentContinuation?.resume(throwing: AppleSignInError.authorizationFailed)
            case .unknown:
                currentContinuation?.resume(throwing: AppleSignInError.networkError(error))
            @unknown default:
                currentContinuation?.resume(throwing: AppleSignInError.networkError(error))
            }
        } else {
            currentContinuation?.resume(throwing: AppleSignInError.networkError(error))
        }

        currentContinuation = nil
        currentNonce = nil
    }
}

// MARK: - ASAuthorizationControllerPresentationContextProviding
extension AppleSignInManager: ASAuthorizationControllerPresentationContextProviding {
    func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let window = windowScene.windows.first else {
            fatalError("No window available for presenting Apple Sign-In")
        }
        return window
    }
}
