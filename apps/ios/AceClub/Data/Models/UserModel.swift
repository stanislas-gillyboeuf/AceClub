//
//  UserModel.swift
//  AceClub
//
//  SwiftData model for User - source of truth for user data
//

import SwiftData
import Foundation

@Model
final class UserModel {
    @Attribute(.unique) var id: String
    var name: String
    var email: String
    var emailVerified: Bool
    var image: String?
    var phoneNumber: String?
    var role: String?
    var banned: Bool
    var banReason: String?
    var banExpires: Date?
    var onboardingCompleted: Bool
    var createdAt: Date?
    var updatedAt: Date?

    // Cache metadata
    var lastSyncedAt: Date?

    // Flag to identify the current user
    var isCurrentUser: Bool = false

    init(
        id: String,
        name: String,
        email: String,
        emailVerified: Bool = false,
        image: String? = nil,
        phoneNumber: String? = nil,
        role: String? = nil,
        banned: Bool = false,
        banReason: String? = nil,
        banExpires: Date? = nil,
        onboardingCompleted: Bool = false,
        createdAt: Date? = nil,
        updatedAt: Date? = nil,
        isCurrentUser: Bool = false
    ) {
        self.id = id
        self.name = name
        self.email = email
        self.emailVerified = emailVerified
        self.image = image
        self.phoneNumber = phoneNumber
        self.role = role
        self.banned = banned
        self.banReason = banReason
        self.banExpires = banExpires
        self.onboardingCompleted = onboardingCompleted
        self.createdAt = createdAt
        self.updatedAt = updatedAt
        self.isCurrentUser = isCurrentUser
        self.lastSyncedAt = Date()
    }

    // MARK: - Computed Properties

    var imageURL: URL? {
        guard let image, !image.isEmpty else { return nil }
        return URL(string: image)
    }

    var isEmailVerified: Bool { emailVerified }

    var emailVerificationStatusText: String {
        emailVerified ? "Email vérifié" : "Email non vérifié"
    }

    var isBanned: Bool { banned }

    var isOnboardingCompleted: Bool { onboardingCompleted }

    var displayName: String { name }

    var initials: String {
        let components = name.split(separator: " ")
        if components.count >= 2 {
            let firstInitial = components[0].prefix(1)
            let lastInitial = components[1].prefix(1)
            return "\(firstInitial)\(lastInitial)".uppercased()
        } else if let first = components.first {
            return String(first.prefix(2)).uppercased()
        }
        return "??"
    }
}
