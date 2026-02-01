//
//  MemberModel.swift
//  AceClub
//
//  SwiftData model for Organization Member
//

import SwiftData
import Foundation

@Model
final class MemberModel {
    @Attribute(.unique) var id: String
    var organizationId: String
    var userId: String
    var role: String  // "owner", "admin", "member"
    var createdAt: Date

    // User denormalized
    var userName: String?
    var userEmail: String?
    var userImage: String?

    // Relationship back to organization
    var organization: OrganizationModel?

    // Cache metadata
    var lastSyncedAt: Date?

    init(
        id: String,
        organizationId: String,
        userId: String,
        role: String,
        createdAt: Date,
        userName: String? = nil,
        userEmail: String? = nil,
        userImage: String? = nil
    ) {
        self.id = id
        self.organizationId = organizationId
        self.userId = userId
        self.role = role
        self.createdAt = createdAt
        self.userName = userName
        self.userEmail = userEmail
        self.userImage = userImage
        self.lastSyncedAt = Date()
    }

    // MARK: - Computed Properties

    var memberRole: MemberRole {
        MemberRole(rawValue: role) ?? .member
    }

    var isOwner: Bool { role == "owner" }
    var isAdmin: Bool { role == "admin" || role == "owner" }

    var userImageURL: URL? {
        guard let userImage, !userImage.isEmpty else { return nil }
        return URL(string: userImage)
    }

    var userInitials: String {
        guard let userName else { return "??" }
        let components = userName.split(separator: " ")
        if components.count >= 2 {
            let firstInitial = components[0].prefix(1)
            let lastInitial = components[1].prefix(1)
            return "\(firstInitial)\(lastInitial)".uppercased()
        } else if let first = components.first {
            return String(first.prefix(2)).uppercased()
        }
        return "??"
    }

    var formattedCreatedAt: String {
        createdAt.formatted(date: .abbreviated, time: .shortened)
    }
}
