//
//  AuthRepository.swift
//  AceClub
//
//  Created by Nicolas Becharat on 12/01/2026.
//

import Foundation

protocol AuthRepositoryProtocol {
    func signUp(name: String, email: String, password: String) async throws -> (user: User, session: AuthSession)
    func signIn(email: String, password: String, rememberMe: Bool) async throws -> (user: User, session: AuthSession)
    func signInWithGoogle(idToken: String, accessToken: String) async throws -> (user: User, session: AuthSession)
    func signOut(token: String) async throws
}

class AuthRepository: AuthRepositoryProtocol {
    private let dataSource: AuthAPIDataSource

    init(dataSource: AuthAPIDataSource = AuthAPIDataSource()) {
        self.dataSource = dataSource
    }

    func signUp(name: String, email: String, password: String) async throws -> (user: User, session: AuthSession) {
        let response = try await dataSource.signUp(name: name, email: email, password: password)
        return AuthMapper.map(authResponseDTO: response)
    }

    func signIn(email: String, password: String, rememberMe: Bool = true) async throws -> (user: User, session: AuthSession) {
        let response = try await dataSource.signIn(email: email, password: password, rememberMe: rememberMe)
        return AuthMapper.map(authResponseDTO: response)
    }

    func signInWithGoogle(idToken: String, accessToken: String) async throws -> (user: User, session: AuthSession) {
        let response = try await dataSource.signInWithGoogle(idToken: idToken, accessToken: accessToken)
        return AuthMapper.map(authResponseDTO: response)
    }

    func signOut(token: String) async throws {
        try await dataSource.signOut(token: token)
    }

    func getSession() async throws -> User? {
        let response = try await dataSource.getSession()
        guard let userDTO = response.user else {
            return nil
        }
        return UserMapper.map(userDTO: userDTO)
    }
}
