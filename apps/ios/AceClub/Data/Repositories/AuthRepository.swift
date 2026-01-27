//
//  AuthRepository.swift
//  AceClub
//
//  Created by Nicolas Becharat on 12/01/2026.
//

import Foundation

protocol AuthRepositoryProtocol {
    func signInWithGoogle(idToken: String, accessToken: String) async throws -> (user: User, session: AuthSession)
    func signOut(token: String) async throws
}

class AuthRepository: AuthRepositoryProtocol {
    private let dataSource: AuthAPIDataSource

    init(dataSource: AuthAPIDataSource = AuthAPIDataSource()) {
        self.dataSource = dataSource
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
