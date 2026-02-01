//
//  MatchCommentModel.swift
//  AceClub
//
//  SwiftData model for Match Comment
//

import SwiftData
import Foundation

@Model
final class MatchCommentModel {
    @Attribute(.unique) var id: String
    var matchId: String
    var userId: String
    var content: String
    var userName: String
    var userImage: String?
    var createdAt: Date
    var updatedAt: Date

    // Relationship back to match
    var match: MatchModel?

    init(
        id: String,
        matchId: String,
        userId: String,
        content: String,
        userName: String,
        userImage: String? = nil,
        createdAt: Date,
        updatedAt: Date
    ) {
        self.id = id
        self.matchId = matchId
        self.userId = userId
        self.content = content
        self.userName = userName
        self.userImage = userImage
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }

    // MARK: - Computed Properties

    var userImageURL: URL? {
        guard let userImage, !userImage.isEmpty else { return nil }
        return URL(string: userImage)
    }

    var userInitials: String {
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

    var formattedDate: String {
        createdAt.formatted(date: .abbreviated, time: .shortened)
    }

    var wasEdited: Bool {
        updatedAt > createdAt
    }
}
