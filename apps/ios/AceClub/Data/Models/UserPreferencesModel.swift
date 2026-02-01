//
//  UserPreferencesModel.swift
//  AceClub
//
//  SwiftData model for User Preferences
//

import SwiftData
import Foundation

@Model
final class UserPreferencesModel {
    @Attribute(.unique) var id: String
    var userId: String
    var organizationId: String
    var sport: String
    var skillLevel: String
    var createdAt: Date
    var updatedAt: Date

    // Cache metadata
    var lastSyncedAt: Date?

    init(
        id: String,
        userId: String,
        organizationId: String,
        sport: String,
        skillLevel: String,
        createdAt: Date,
        updatedAt: Date
    ) {
        self.id = id
        self.userId = userId
        self.organizationId = organizationId
        self.sport = sport
        self.skillLevel = skillLevel
        self.createdAt = createdAt
        self.updatedAt = updatedAt
        self.lastSyncedAt = Date()
    }

    // MARK: - Computed Properties

    var sportType: Sport {
        Sport(rawValue: sport) ?? .tennis
    }

    var skillLevelValue: SkillLevel {
        SkillLevel(value: skillLevel, displayName: skillLevel)
    }

    var formattedCreatedAt: String {
        createdAt.formatted(date: .abbreviated, time: .shortened)
    }

    var formattedUpdatedAt: String {
        updatedAt.formatted(date: .abbreviated, time: .shortened)
    }
}
