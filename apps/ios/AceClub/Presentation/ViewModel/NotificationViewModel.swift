//
//  NotificationViewModel.swift
//  AceClub
//
//  Created by Claude on 29/01/2026.
//

import Foundation
import Combine

@MainActor
class NotificationViewModel: ObservableObject {

    // MARK: - Published Properties

    @Published var notifications: [AppNotification] = []
    @Published var unreadCount: Int = 0
    @Published var isLoading = false
    @Published var isLoadingMore = false
    @Published var errorMessage: String?

    // MARK: - Pagination

    private var total: Int = 0
    private var currentOffset: Int = 0
    private let pageSize: Int = 20

    var hasMorePages: Bool {
        currentOffset + notifications.count < total
    }

    // MARK: - Use Cases

    private let listNotificationsUseCase = ListNotificationsUseCase()
    private let getUnreadCountUseCase = GetUnreadCountUseCase()
    private let markReadUseCase = MarkNotificationReadUseCase()
    private let markAllReadUseCase = MarkAllNotificationsReadUseCase()

    // MARK: - Public API

    func loadNotifications() async {
        isLoading = true
        errorMessage = nil
        currentOffset = 0

        do {
            let result = try await listNotificationsUseCase.execute(
                limit: pageSize,
                offset: 0,
                unreadOnly: false
            )
            notifications = result.notifications
            total = result.total
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    func loadMoreNotifications() async {
        guard !isLoadingMore && hasMorePages else { return }

        isLoadingMore = true
        let nextOffset = notifications.count

        do {
            let result = try await listNotificationsUseCase.execute(
                limit: pageSize,
                offset: nextOffset,
                unreadOnly: false
            )
            notifications.append(contentsOf: result.notifications)
            total = result.total
            currentOffset = nextOffset
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoadingMore = false
    }

    func refreshUnreadCount() async {
        do {
            unreadCount = try await getUnreadCountUseCase.execute()
        } catch {
            print("[NotificationViewModel] Failed to get unread count: \(error)")
        }
    }

    func markAsRead(notification: AppNotification) async {
        guard notification.isUnread else { return }

        do {
            let updated = try await markReadUseCase.execute(notificationId: notification.id)
            if let index = notifications.firstIndex(where: { $0.id == notification.id }) {
                notifications[index] = updated
            }
            unreadCount = max(0, unreadCount - 1)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func markAllAsRead() async {
        isLoading = true
        errorMessage = nil

        do {
            try await markAllReadUseCase.execute()
            // Update local state
            notifications = notifications.map { notification in
                AppNotification(
                    id: notification.id,
                    userId: notification.userId,
                    type: notification.type,
                    title: notification.title,
                    body: notification.body,
                    data: notification.data,
                    referenceId: notification.referenceId,
                    referenceType: notification.referenceType,
                    isRead: true,
                    readAt: Date(),
                    sentAt: notification.sentAt,
                    createdAt: notification.createdAt
                )
            }
            unreadCount = 0
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    // MARK: - Computed

    var unreadNotifications: [AppNotification] {
        notifications.filter { $0.isUnread }
    }

    var hasUnread: Bool {
        unreadCount > 0
    }
}
