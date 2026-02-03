//
//  MatchParticipantModel.swift
//  AceClub
//
//  SwiftData model for Match Participant
//

import SwiftData
import Foundation

@Model
final class MatchParticipantModel {
    @Attribute(.unique) var id: String
    var matchId: String
    var userId: String
    var side: String  // "home", "away"
    var isWinner: Bool
    var createdAt: Date

    // User denormalized (to avoid complex joins)
    var userName: String?
    var userEmail: String?
    var userImage: String?

    // Relationship back to match
    var match: MatchModel?

    init(
        id: String,
        matchId: String,
        userId: String,
        side: String,
        isWinner: Bool = false,
        createdAt: Date,
        userName: String? = nil,
        userEmail: String? = nil,
        userImage: String? = nil
    ) {
        self.id = id
        self.matchId = matchId
        self.userId = userId
        self.side = side
        self.isWinner = isWinner
        self.createdAt = createdAt
        self.userName = userName
        self.userEmail = userEmail
        self.userImage = userImage
    }

    // MARK: - Computed Properties

    var matchSide: MatchSide {
        MatchSide(rawValue: side) ?? .home
    }

    var winnerBadge: String {
        isWinner ? "🏆" : ""
    }

    var userImageURL: URL? {
        guard let userImage, !userImage.isEmpty else { return nil }
        return URL(string: userImage)
    }

    /// Returns image URL with cache busting parameter when the image has been invalidated
    func cacheBustedImageURL(with cacheManager: ImageCacheManager = .shared) -> URL? {
        guard let userImage, !userImage.isEmpty else { return nil }
        return cacheManager.cacheBustedURL(for: userImage, userId: userId)
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
