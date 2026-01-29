//
//  MatchIntentModel.swift
//  AceClub
//
//  SwiftData model for Match Intent
//

import SwiftData
import Foundation

@Model
final class MatchIntentModel {
    @Attribute(.unique) var id: String
    var userId: String
    var date: Date?
    var time: Date?
    var duration: Int
    var type: String  // "match", "training"
    var intentDescription: String?  // renamed from 'description' to avoid conflict
    var status: String  // "pending", "accepted", "rejected"
    var createdAt: Date?

    // User denormalized for discover view
    var userName: String?
    var userEmail: String?
    var userImage: String?

    // Relationship to requests
    @Relationship(deleteRule: .cascade, inverse: \MatchRequestModel.matchIntent)
    var requests: [MatchRequestModel] = []

    // Cache metadata
    var lastSyncedAt: Date?

    init(
        id: String,
        userId: String,
        date: Date? = nil,
        time: Date? = nil,
        duration: Int,
        type: String,
        intentDescription: String? = nil,
        status: String,
        createdAt: Date? = nil,
        userName: String? = nil,
        userEmail: String? = nil,
        userImage: String? = nil
    ) {
        self.id = id
        self.userId = userId
        self.date = date
        self.time = time
        self.duration = duration
        self.type = type
        self.intentDescription = intentDescription
        self.status = status
        self.createdAt = createdAt
        self.userName = userName
        self.userEmail = userEmail
        self.userImage = userImage
        self.lastSyncedAt = Date()
    }

    // MARK: - Computed Properties

    var intentStatus: MatchIntentStatus {
        MatchIntentStatus(rawValue: status) ?? .pending
    }

    var intentType: MatchIntentType {
        MatchIntentType(rawValue: type) ?? .match
    }

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
}
