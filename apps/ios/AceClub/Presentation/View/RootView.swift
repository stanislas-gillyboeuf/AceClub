//
//  RootView.swift
//  AceClub
//
//  Created by Nicolas Becharat on 14/01/2026.
//

import SwiftUI

struct RootView: View {
    @Environment(AuthViewModel.self) private var authViewModel
    @Environment(DeepLinkManager.self) private var deepLinkManager
    @Environment(NotificationManager.self) private var notificationManager
    @State private var selection: Tab = .feed
    @State private var showingCreateMatch = false
    @StateObject private var profileViewModel = ProfileViewModel()
    @StateObject private var organizationViewModel = OrganizationViewModel()
    @StateObject private var invitationViewModel = InvitationViewModel()
    @StateObject private var progressionViewModel = ProgressionViewModel()
    @StateObject private var conversationListViewModel = ConversationListViewModel()

    private enum Tab {
        case feed
        case matches
        case chat
        case discover
        case admin
        case profile
    }

    private var isAdmin: Bool {
        authViewModel.currentUser?.role?.lowercased() == "admin"
    }

    private func handleNotificationDeepLink(_ deepLink: NotificationDeepLink?) {
        guard let deepLink else { return }

        switch deepLink.type {
        case "new_message":
            // Navigate to chat with the conversation
            deepLinkManager.pendingConversationId = deepLink.referenceId
            selection = .chat
            notificationManager.clearPendingDeepLink()

        case "match_request_accepted", "new_match_request", "match_reminder":
            // Navigate to match
            deepLinkManager.pendingMatchId = deepLink.referenceId
            selection = .matches
            notificationManager.clearPendingDeepLink()

        default:
            break
        }
    }

    var body: some View {
        TabView(selection: $selection) {
            HomeView()
                .tabItem {
                    Label("Accueil", systemImage: "list.dash")
                }
                .tag(Tab.feed)

            MatchesView()
                .tabItem {
                    Label("Matchs", systemImage: "tennis.racket")
                }
                .tag(Tab.matches)

            ConversationListView(viewModel: conversationListViewModel)
                .tabItem {
                    Label("Chat", systemImage: "bubble.left.and.bubble.right")
                }
                .tag(Tab.chat)
                .badge(conversationListViewModel.totalUnreadCount > 0 ? conversationListViewModel.totalUnreadCount : 0)

            MatchIntentsView()
                .tabItem {
                    Label("Découvrir", systemImage: "list.dash")
                }
                .tag(Tab.discover)
            ProfileView(
                profileViewModel: profileViewModel,
                organizationViewModel: organizationViewModel,
                invitationViewModel: invitationViewModel,
                progressionViewModel: progressionViewModel
            )
                .tabItem {
                    Label("Profil", systemImage: "person")
                }
                .tag(Tab.profile)

            if isAdmin {
                AdminView()
                    .tabItem {
                        Label("Admin", systemImage: "square.and.pencil")
                    }
                    .tabBarMinimizeBehavior(.automatic)
                    .tag(Tab.admin)
            }
        }
        .tabViewStyle(.sidebarAdaptable)
        .environmentObject(organizationViewModel)
        .onChange(of: isAdmin) { _, newValue in
            if !newValue {
                selection = .feed
            }
        }
        .onChange(of: deepLinkManager.pendingMatchId) { _, matchId in
            if matchId != nil {
                selection = .matches
            }
        }
        .onChange(of: deepLinkManager.pendingConversationId) { _, conversationId in
            if conversationId != nil {
                selection = .chat
            }
        }
        .onChange(of: notificationManager.pendingDeepLink) { _, deepLink in
            handleNotificationDeepLink(deepLink)
        }
        .onAppear {
            if let deepLink = notificationManager.pendingDeepLink {
                handleNotificationDeepLink(deepLink)
            }
        }
        .background(Theme.primaryBackground)
    }
}
