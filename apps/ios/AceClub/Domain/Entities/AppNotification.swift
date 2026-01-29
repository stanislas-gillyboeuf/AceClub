//
//  AppNotification.swift
//  AceClub
//
//  Created by Claude on 29/01/2026.
//

import Foundation

// Named AppNotification to avoid conflict with system Notification
struct AppNotification: Identifiable, Equatable {
    let id: String
    let userId: String
    let type: NotificationType
    let title: String
    let body: String
    let data: String?
    let referenceId: String?
    let referenceType: String?
    let isRead: Bool
    let readAt: Date?
    let sentAt: Date?
    let createdAt: Date

    // MARK: - Computed Properties

    var isUnread: Bool { !isRead }

    var formattedDate: String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: createdAt, relativeTo: Date())
    }

    var icon: String {
        switch type {
        case .matchRequestAccepted:
            return "checkmark.circle.fill"
        case .invitationAccepted:
            return "person.badge.plus"
        case .newMatchRequest:
            return "envelope.fill"
        case .matchReminder:
            return "bell.fill"
        case .unknown:
            return "bell"
        }
    }
}

// MARK: - Notification Type

enum NotificationType: String, Codable {
    case matchRequestAccepted = "match_request_accepted"
    case invitationAccepted = "invitation_accepted"
    case newMatchRequest = "new_match_request"
    case matchReminder = "match_reminder"
    case unknown

    var displayName: String {
        switch self {
        case .matchRequestAccepted:
            return "Match confirme"
        case .invitationAccepted:
            return "Invitation acceptee"
        case .newMatchRequest:
            return "Nouvelle demande"
        case .matchReminder:
            return "Rappel de match"
        case .unknown:
            return "Notification"
        }
    }
}
