//
//  SignOutUseCase.swift
//  AceClub
//
//  Created by Nicolas Becharat on 12/01/2026.
//

import Foundation

class SignOutUseCase {
    private let repository = AuthRepository()

    func execute() async throws {
        let token = try KeychainManager.shared.getAuthToken()

        try await repository.signOut(token: token)

        try KeychainManager.shared.deleteAuthToken()
    }
}
