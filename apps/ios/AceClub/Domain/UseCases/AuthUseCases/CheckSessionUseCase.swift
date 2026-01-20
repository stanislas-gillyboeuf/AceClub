//
//  CheckSessionUseCase.swift
//  AceClub
//
//  Created by Nicolas Becharat on 13/01/2026.
//

import Foundation

class CheckSessionUseCase {
    private let repository = AuthRepository()

    func execute() async throws -> User? {
        return try await repository.getSession()
    }
}
