//
//  OrganizationModel.swift
//  AceClub
//
//  SwiftData model for Organization
//

import SwiftData
import Foundation

@Model
final class OrganizationModel {
    @Attribute(.unique) var id: String
    var name: String
    var slug: String
    var logo: String?
    var createdAt: Date
    var metadata: String?

    // Relationship to members
    @Relationship(deleteRule: .cascade, inverse: \MemberModel.organization)
    var members: [MemberModel] = []

    // Cache metadata
    var lastSyncedAt: Date?

    // Flag to identify active organization
    var isActive: Bool = false

    init(
        id: String,
        name: String,
        slug: String,
        logo: String? = nil,
        createdAt: Date,
        metadata: String? = nil,
        isActive: Bool = false
    ) {
        self.id = id
        self.name = name
        self.slug = slug
        self.logo = logo
        self.createdAt = createdAt
        self.metadata = metadata
        self.isActive = isActive
        self.lastSyncedAt = Date()
    }

    // MARK: - Computed Properties

    var logoURL: URL? {
        guard let logo, !logo.isEmpty else { return nil }
        return URL(string: logo)
    }

    var formattedCreatedAt: String {
        createdAt.formatted(date: .abbreviated, time: .shortened)
    }

    var memberCount: Int {
        members.count
    }

    var owners: [MemberModel] {
        members.filter { $0.role == "owner" }
    }

    var admins: [MemberModel] {
        members.filter { $0.role == "admin" || $0.role == "owner" }
    }
}
