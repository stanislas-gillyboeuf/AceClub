//
//  NotificationBellButton.swift
//  AceClub
//
//  Created by Claude on 29/01/2026.
//

import SwiftUI

struct NotificationBellButton: View {
    @StateObject private var viewModel = NotificationViewModel()
    @State private var showNotifications = false

    var body: some View {
        Button {
            showNotifications = true
        } label: {
            ZStack(alignment: .topTrailing) {
                Image(systemName: "bell")
                    .font(.body)

                if viewModel.hasUnread {
                    badgeView
                }
            }
        }
        .task {
            await viewModel.refreshUnreadCount()
        }
        .sheet(isPresented: $showNotifications) {
            NotificationListView()
                .onDisappear {
                    Task {
                        await viewModel.refreshUnreadCount()
                    }
                }
        }
    }

    private var badgeView: some View {
        Group {
            if viewModel.unreadCount > 0 {
                Text(viewModel.unreadCount > 99 ? "99+" : "\(viewModel.unreadCount)")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 4)
                    .padding(.vertical, 2)
                    .background(Color.red)
                    .clipShape(Capsule())
                    .offset(x: 8, y: -8)
            }
        }
    }
}

#Preview {
    NavigationStack {
        Text("Content")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    NotificationBellButton()
                }
            }
    }
}
