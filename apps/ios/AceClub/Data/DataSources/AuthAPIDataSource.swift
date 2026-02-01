//
//  AuthAPIDataSource.swift
//  AceClub
//
//  Created by Nicolas Becharat on 12/01/2026.
//

import Foundation

enum AuthError: Error, LocalizedError {
    case invalidURL
    case invalidResponse
    case serverError(String)
    case decodingError
    case networkError(Error)

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "URL invalide"
        case .invalidResponse:
            return "Réponse invalide du serveur"
        case .serverError(let message):
            return message
        case .decodingError:
            return "Échec du décodage de la réponse"
        case .networkError(let error):
            return "Erreur réseau : \(error.localizedDescription)"
        }
    }
}

class AuthAPIDataSource {
    private let session = URLSession.shared

    // MARK: - Sign Out
    func signOut(token: String) async throws {
        guard let url = URL(string: "\(Config.apiBaseURL)/auth/sign-out") else {
            throw AuthError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.setValue("aceclub://", forHTTPHeaderField: "Origin")
        request.httpBody = "{}".data(using: .utf8)

        do {
            let (_, response) = try await session.data(for: request)

            guard let httpResponse = response as? HTTPURLResponse else {
                throw AuthError.invalidResponse
            }

            if httpResponse.statusCode != 200 {
                throw AuthError.serverError("Échec de la déconnexion (code \(httpResponse.statusCode))")
            }

        } catch let error as AuthError {
            throw error
        } catch {
            throw AuthError.networkError(error)
        }
    }

    // MARK: - Sign In with Google (Better Auth callback)
    func signInWithGoogle(idToken: String, accessToken: String) async throws -> AuthResponseDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/auth/sign-in/social") else {
            throw AuthError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("aceclub://", forHTTPHeaderField: "Origin")

        let body: [String: Any] = [
            "provider": "google",
            "idToken": [
                "token": idToken,
                "accessToken": accessToken
            ]
        ]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        do {
            let (data, response) = try await session.data(for: request)

            guard let httpResponse = response as? HTTPURLResponse else {
                throw AuthError.invalidResponse
            }

            if httpResponse.statusCode != 200 {
                if let errorResponse = try? JSONDecoder().decode([String: String].self, from: data),
                   let message = errorResponse["message"] {
                    throw AuthError.serverError(message)
                }
                throw AuthError.serverError("Échec de la connexion Google (code \(httpResponse.statusCode))")
            }

            let authResponse = try JSONDecoder().decode(AuthResponseDTO.self, from: data)
            return authResponse

        } catch let error as AuthError {
            throw error
        } catch {
            throw AuthError.networkError(error)
        }
    }

    // MARK: - Sign In with Apple (Better Auth callback)
    func signInWithApple(idToken: String, email: String?, name: String?) async throws -> AuthResponseDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/auth/sign-in/social") else {
            throw AuthError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("aceclub://", forHTTPHeaderField: "Origin")

        var body: [String: Any] = [
            "provider": "apple",
            "idToken": [
                "token": idToken
            ]
        ]

        if let email = email {
            body["email"] = email
        }

        if let name = name {
            body["name"] = name
        }

        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        do {
            let (data, response) = try await session.data(for: request)

            guard let httpResponse = response as? HTTPURLResponse else {
                throw AuthError.invalidResponse
            }

            if httpResponse.statusCode != 200 {
                if let errorResponse = try? JSONDecoder().decode([String: String].self, from: data),
                   let message = errorResponse["message"] {
                    throw AuthError.serverError(message)
                }
                throw AuthError.serverError("Échec de la connexion Apple (code \(httpResponse.statusCode))")
            }

            let authResponse = try JSONDecoder().decode(AuthResponseDTO.self, from: data)
            return authResponse

        } catch let error as AuthError {
            throw error
        } catch {
            throw AuthError.networkError(error)
        }
    }

    // MARK: - Get Session
    func getSession() async throws -> SessionResponseDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/session") else {
            throw AuthError.invalidURL
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url)

        guard response.statusCode == 200 else {
            throw AuthError.serverError("Échec de la récupération de session (code \(response.statusCode))")
        }

        do {
            let sessionResponse = try JSONDecoder().decode(SessionResponseDTO.self, from: data)
            return sessionResponse
        } catch {
            throw AuthError.decodingError
        }
    }
}
