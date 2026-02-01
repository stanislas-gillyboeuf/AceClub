//
//  MatchRequestModel.swift
//  AceClub
//
//  SwiftData model for Match Request
//

import SwiftData
import Foundation

@Model
final class MatchRequestModel {
    @Attribute(.unique) var id: String
    var matchIntentId: String
    var requesterId: String
    var receiverId: String
    var status: String  // "pending", "accepted", "rejected"
    var createdAt: Date
    var respondedAt: Date?

    // Requester denormalized
    var requesterName: String?
    var requesterEmail: String?
    var requesterImage: String?

    // Relationship back to intent
    var matchIntent: MatchIntentModel?

    // Cache metadata
    var lastSyncedAt: Date?

    init(
        id: String,
        matchIntentId: String,
        requesterId: String,
        receiverId: String,
        status: String,
        createdAt: Date,
        respondedAt: Date? = nil,
        requesterName: String? = nil,
        requesterEmail: String? = nil,
        requesterImage: String? = nil
    ) {
        self.id = id
        self.matchIntentId = matchIntentId
        self.requesterId = requesterId
        self.receiverId = receiverId
        self.status = status
        self.createdAt = createdAt
        self.respondedAt = respondedAt
        self.requesterName = requesterName
        self.requesterEmail = requesterEmail
        self.requesterImage = requesterImage
        self.lastSyncedAt = Date()
    }

    // MARK: - Computed Properties

    var requestStatus: MatchRequestStatus {
        MatchRequestStatus(rawValue: status) ?? .pending
    }

    var requesterImageURL: URL? {
        guard let requesterImage, !requesterImage.isEmpty else { return nil }
        return URL(string: requesterImage)
    }

    var requesterInitials: String {
        guard let requesterName else { return "??" }
        let components = requesterName.split(separator: " ")
        if components.count >= 2 {
            let firstInitial = components[0].prefix(1)
            let lastInitial = components[1].prefix(1)
            return "\(firstInitial)\(lastInitial)".uppercased()
        } else if let first = components.first {
            return String(first.prefix(2)).uppercased()
        }
        return "??"
    }

    var isPending: Bool { status == "pending" }
    var isAccepted: Bool { status == "accepted" }
    var isRejected: Bool { status == "rejected" }
}
