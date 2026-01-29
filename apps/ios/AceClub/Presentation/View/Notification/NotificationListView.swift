//
//  NotificationListView.swift
//  AceClub
//
//  Created by Claude on 29/01/2026.
//

import SwiftUI

struct NotificationListView: View {
    @StateObject private var viewModel = NotificationViewModel()
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading && viewModel.notifications.isEmpty {
                    List {
                        SkeletonList(count: 6) {
                            NotificationRowSkeleton()
                                .listRowInsets(EdgeInsets(top: 4, leading: 16, bottom: 4, trailing: 16))
                        }
                    }
                    .listStyle(.plain)
                } else if viewModel.notifications.isEmpty {
                    emptyStateView
                } else {
                    notificationsList
                }
            }
            .navigationTitle("Notifications")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Fermer") {
                        dismiss()
                    }
                }

                if viewModel.hasUnread {
                    ToolbarItem(placement: .topBarTrailing) {
                        Button("Tout lire") {
                            Task {
                                await viewModel.markAllAsRead()
                            }
                        }
                        .font(.caption)
                    }
                }
            }
            .task {
                await viewModel.loadNotifications()
            }
            .refreshable {
                await viewModel.loadNotifications()
            }
        }
    }

    // MARK: - Subviews

    private var notificationsList: some View {
        List {
            ForEach(viewModel.notifications) { notification in
                NotificationRowView(notification: notification) {
                    Task {
                        await viewModel.markAsRead(notification: notification)
                        handleNotificationTap(notification)
                    }
                }
                .listRowInsets(EdgeInsets(top: 4, leading: 16, bottom: 4, trailing: 16))
            }

            if viewModel.hasMorePages {
                ProgressView()
                    .frame(maxWidth: .infinity)
                    .listRowSeparator(.hidden)
                    .task {
                        await viewModel.loadMoreNotifications()
                    }
            }
        }
        .listStyle(.plain)
    }

    private var emptyStateView: some View {
        ContentUnavailableView(
            "Aucune notification",
            systemImage: "bell.slash",
            description: Text("Vous n'avez pas encore de notifications")
        )
    }

    // MARK: - Actions

    private func handleNotificationTap(_ notification: AppNotification) {
        // Handle navigation based on notification type
        // This will be connected to the deep link system
        switch notification.type {
        case .matchRequestAccepted:
            if let matchId = notification.referenceId {
                // Navigate to match detail
                print("[NotificationListView] Navigate to match: \(matchId)")
            }
        case .invitationAccepted:
            if let orgId = notification.referenceId {
                // Navigate to organization
                print("[NotificationListView] Navigate to organization: \(orgId)")
            }
        default:
            break
        }
    }
}

#Preview {
    NotificationListView()
}
