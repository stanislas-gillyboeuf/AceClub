//
//  UserSummary.swift
//  AceClub
//
//  Created by Nicolas Becharat on 01/02/2026.
//

import Foundation

// MARK: - User Summary (minimal user info for embedded references)

struct UserSummary: Identifiable, Equatable, Hashable {
    let id: String
    let name: String
    let image: String?

    var imageURL: URL? {
        guard let image else { return nil }
        return URL(string: image)
    }

    var initials: String {
        let components = name.split(separator: " ")
        if components.count >= 2 {
            return String(components[0].prefix(1) + components[1].prefix(1)).uppercased()
        }
        return String(name.prefix(1)).uppercased()
    }
}

// MARK: - Message Sender

struct MessageSender: Identifiable, Equatable, Hashable {
    let id: String
    let name: String
    let image: String?

    var imageURL: URL? {
        guard let image else { return nil }
        return URL(string: image)
    }
}

// MARK: - User Profile (full profile info for conversation participants)

struct UserProfile: Identifiable, Equatable, Hashable {
    let id: String
    let name: String
    let image: String?
    let level: Int
    let totalAces: Int
    let title: ParticipantTitle?
    let badges: [ParticipantBadge]
    let currentStreak: Int
    let longestStreak: Int
    let globalRank: Int?

    var imageURL: URL? {
        guard let image else { return nil }
        return URL(string: image)
    }

    var initials: String {
        let components = name.split(separator: " ")
        if components.count >= 2 {
            return String(components[0].prefix(1) + components[1].prefix(1)).uppercased()
        }
        return String(name.prefix(1)).uppercased()
    }

    var localizedTitle: String? {
        title?.localizedName
    }

    var hasActiveStreak: Bool {
        currentStreak > 0
    }
}
