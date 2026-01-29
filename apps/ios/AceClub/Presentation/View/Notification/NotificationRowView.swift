//
//  NotificationRowView.swift
//  AceClub
//
//  Created by Claude on 29/01/2026.
//

import SwiftUI

struct NotificationRowView: View {
    let notification: AppNotification
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack(alignment: .top, spacing: 12) {
                // Icon
                Image(systemName: notification.icon)
                    .font(.title3)
                    .foregroundStyle(notification.isUnread ? Theme.tintColor : .secondary)
                    .frame(width: 32, height: 32)

                // Content
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text(notification.title)
                            .font(.subheadline)
                            .fontWeight(notification.isUnread ? .semibold : .regular)
                            .foregroundStyle(.primary)

                        Spacer()

                        Text(notification.formattedDate)
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                    }

                    Text(notification.body)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(2)
                }

                // Unread indicator
                if notification.isUnread {
                    Circle()
                        .fill(Theme.tintColor)
                        .frame(width: 8, height: 8)
                }
            }
            .padding(.vertical, 8)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    VStack {
        NotificationRowView(
            notification: AppNotification(
                id: "1",
                userId: "user1",
                type: .matchRequestAccepted,
                title: "Match confirme !",
                body: "Jean Dupont a accepte votre demande de match",
                data: nil,
                referenceId: "match1",
                referenceType: "match",
                isRead: false,
                readAt: nil,
                sentAt: Date(),
                createdAt: Date()
            ),
            onTap: {}
        )

        NotificationRowView(
            notification: AppNotification(
                id: "2",
                userId: "user1",
                type: .invitationAccepted,
                title: "Invitation acceptee",
                body: "Marie Martin a rejoint Tennis Club Paris",
                data: nil,
                referenceId: "org1",
                referenceType: "organization",
                isRead: true,
                readAt: Date(),
                sentAt: Date().addingTimeInterval(-3600),
                createdAt: Date().addingTimeInterval(-3600)
            ),
            onTap: {}
        )
    }
    .padding()
}
