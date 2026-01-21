//
//  UserRepository.swift
//  AceClub
//
//  Created by Nicolas Becharat on 12/01/2026.
//

import Foundation
class AdminRepository {
    
    let adminDataSource = AdminAPIDataSource() 

    func listUsers() async throws -> ListUsersResult {
        let listUsersResponse = try await adminDataSource.listUsers()
        return UserMapper.map(listUsersResponseDTO: listUsersResponse)
    }

    func listUserSessions(userId: String) async throws -> [Session] {
        let sessionsDTO = try await adminDataSource.listUserSessions(userId: userId)
        return sessionsDTO.map { SessionMapper.map(sessionDTO: $0) }
    }

    func revokeUserSession(userId: String, sessionId: String) async throws -> User {
        let userDTO = try await adminDataSource.revokeUserSession(userId: userId, sessionId: sessionId)
        return UserMapper.map(userDTO: userDTO)
    }

    func revokeUserSessions(userId: String) async throws -> User {
        let userDTO = try await adminDataSource.revokeUserSessions(userId: userId)
        return UserMapper.map(userDTO: userDTO)
    }

    func banUser(userId: String) async throws -> User {
        let userDTO = try await adminDataSource.banUser(userId: userId)
        return UserMapper.map(userDTO: userDTO)
    }

    func unbanUser(userId: String) async throws -> User {
        let userDTO = try await adminDataSource.unbanUser(userId: userId)
        return UserMapper.map(userDTO: userDTO)
    }

    func createUser(name: String, email: String, password: String) async throws -> User {
        let userDTO = try await adminDataSource.createUser(name: name, email: email, password: password)
        return UserMapper.map(userDTO: userDTO)
    }

    func updateUser(userId: String, name: String, email: String, password: String) async throws -> User {
        let userDTO = try await adminDataSource.updateUser(userId: userId, name: name, email: email, password: password)
        return UserMapper.map(userDTO: userDTO)
    }

    func setRole(userId: String, role: String) async throws -> User {
        let userDTO = try await adminDataSource.setRole(userId: userId, role: role)
        return UserMapper.map(userDTO: userDTO)
    }

    func setUserPassword(userId: String, password: String) async throws -> User {
        let userDTO = try await adminDataSource.setUserPassword(userId: userId, password: password)
        return UserMapper.map(userDTO: userDTO)
    }
}
