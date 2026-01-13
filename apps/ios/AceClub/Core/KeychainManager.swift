//
//  KeychainManager.swift
//  AceClub
//
//  Created by Nicolas Becharat on 12/01/2026.
//

import Foundation
import Security

class KeychainManager {
    static let shared = KeychainManager()

    private init() {}

    private let service = "com.aceclub.app"

    enum KeychainError: Error {
        case itemNotFound
        case duplicateItem
        case invalidData
        case unexpectedStatus(OSStatus)
    }

    // MARK: - Save
    func save(key: String, value: String) throws {
        guard let data = value.data(using: .utf8) else {
            throw KeychainError.invalidData
        }

        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
            kSecValueData as String: data
        ]

        // Delete any existing item
        SecItemDelete(query as CFDictionary)

        // Add the new item
        let status = SecItemAdd(query as CFDictionary, nil)

        guard status == errSecSuccess else {
            throw KeychainError.unexpectedStatus(status)
        }
    }

    // MARK: - Get
    func get(key: String) throws -> String {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        guard status == errSecSuccess else {
            if status == errSecItemNotFound {
                throw KeychainError.itemNotFound
            }
            throw KeychainError.unexpectedStatus(status)
        }

        guard let data = result as? Data,
              let string = String(data: data, encoding: .utf8) else {
            throw KeychainError.invalidData
        }

        return string
    }

    // MARK: - Delete
    func delete(key: String) throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key
        ]

        let status = SecItemDelete(query as CFDictionary)

        guard status == errSecSuccess || status == errSecItemNotFound else {
            throw KeychainError.unexpectedStatus(status)
        }
    }
}

// MARK: - Convenience Extensions for Auth Token
extension KeychainManager {
    private static let tokenKey = "auth_token"

    func saveAuthToken(_ token: String) throws {
        try save(key: Self.tokenKey, value: token)
    }

    func getAuthToken() throws -> String {
        try get(key: Self.tokenKey)
    }

    func deleteAuthToken() throws {
        try delete(key: Self.tokenKey)
    }
}
