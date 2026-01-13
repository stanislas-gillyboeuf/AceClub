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
            return "Invalid URL"
        case .invalidResponse:
            return "Invalid response from server"
        case .serverError(let message):
            return message
        case .decodingError:
            return "Failed to decode response"
        case .networkError(let error):
            return "Network error: \(error.localizedDescription)"
        }
    }
}

class AuthAPIDataSource {
    private let session = URLSession.shared

    // MARK: - Sign Up
    func signUp(name: String, email: String, password: String) async throws -> AuthResponseDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/sign-up/email") else {
            throw AuthError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("aceclub://", forHTTPHeaderField: "Origin")

        let body = SignUpRequestDTO(name: name, email: email, password: password)
        request.httpBody = try JSONEncoder().encode(body)

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
                throw AuthError.serverError("Sign up failed with status code: \(httpResponse.statusCode)")
            }

            let authResponse = try JSONDecoder().decode(AuthResponseDTO.self, from: data)
            return authResponse

        } catch let error as AuthError {
            throw error
        } catch {
            throw AuthError.networkError(error)
        }
    }

    // MARK: - Sign In
    func signIn(email: String, password: String, rememberMe: Bool = true) async throws -> AuthResponseDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/sign-in/email") else {
            throw AuthError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("aceclub://", forHTTPHeaderField: "Origin")

        let body = SignInRequestDTO(email: email, password: password, rememberMe: rememberMe)
        request.httpBody = try JSONEncoder().encode(body)

        do {
            let (data, response) = try await session.data(for: request)

            guard let httpResponse = response as? HTTPURLResponse else {
                throw AuthError.invalidResponse
            }

            // DEBUG: Print raw response
            if let jsonString = String(data: data, encoding: .utf8) {
                print("🔵 Sign In Response: \(jsonString)")
            }

            if httpResponse.statusCode != 200 {
                if let errorResponse = try? JSONDecoder().decode([String: String].self, from: data),
                   let message = errorResponse["message"] {
                    throw AuthError.serverError(message)
                }
                throw AuthError.serverError("Sign in failed with status code: \(httpResponse.statusCode)")
            }

            let authResponse = try JSONDecoder().decode(AuthResponseDTO.self, from: data)
            return authResponse

        } catch let error as AuthError {
            throw error
        } catch {
            print("🔴 Decoding error: \(error)")
            throw AuthError.networkError(error)
        }
    }

    // MARK: - Sign Out
    func signOut(token: String) async throws {
        guard let url = URL(string: "\(Config.apiBaseURL)/sign-out") else {
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
                throw AuthError.serverError("Sign out failed with status code: \(httpResponse.statusCode)")
            }

        } catch let error as AuthError {
            throw error
        } catch {
            throw AuthError.networkError(error)
        }
    }

    // MARK: - Get Session
    func getSession() async throws -> SessionResponseDTO {
        guard let url = URL(string: "\(Config.apiBaseURL)/api/session") else {
            throw AuthError.invalidURL
        }

        let (data, response) = try await APIClient.shared.authenticatedRequest(url: url)

        guard response.statusCode == 200 else {
            throw AuthError.serverError("Get session failed with status code: \(response.statusCode)")
        }

        do {
            let sessionResponse = try JSONDecoder().decode(SessionResponseDTO.self, from: data)
            return sessionResponse
        } catch {
            throw AuthError.decodingError
        }
    }
}
