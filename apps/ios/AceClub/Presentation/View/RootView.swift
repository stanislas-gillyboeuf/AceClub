//
//  RootView.swift
//  AceClub
//
//  Created by Nicolas Becharat on 14/01/2026.
//

import SwiftUI

@available(iOS 26.0, *)
struct RootView: View {
    @Environment(AuthViewModel.self) private var authViewModel
    @Environment(DeepLinkManager.self) private var deepLinkManager
    @Environment(NotificationManager.self) private var notificationManager
    @State private var selection: Tab = .discover
    @State private var showingCreateMatch = false
    @StateObject private var profileViewModel = ProfileViewModel()
    @StateObject private var organizationViewModel = OrganizationViewModel()
    @StateObject private var invitationViewModel = InvitationViewModel()
    @StateObject private var progressionViewModel = ProgressionViewModel()
    @StateObject private var conversationListViewModel = ConversationListViewModel()
    @StateObject private var matchRequestsViewModel = MatchRequestsViewModel()

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
            deepLinkManager.pendingConversationId = deepLink.referenceId
            selection = .chat
            notificationManager.clearPendingDeepLink()

        case "new_match_request":
            // Rafraîchir les demandes et ouvrir la sheet
            Task { await matchRequestsViewModel.loadRequests() }
            deepLinkManager.shouldOpenMatchRequests = true
            selection = .matches
            notificationManager.clearPendingDeepLink()

        case "match_request_accepted", "match_reminder":
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
                    Label("Accueil", systemImage: "house")
                }
                .tag(Tab.feed)

            MatchesView(matchRequestsViewModel: matchRequestsViewModel)
                .tabItem {
                    Label("Matchs", systemImage: "tennis.racket")
                }
                .tag(Tab.matches)
                .badge(matchRequestsViewModel.pendingRequests.count)

            ConversationListView(viewModel: conversationListViewModel)
                .tabItem {
                    Label("Chat", systemImage: "bubble.left.and.bubble.right")
                }
                .tag(Tab.chat)
                .badge(conversationListViewModel.totalUnreadCount > 0 ? conversationListViewModel.totalUnreadCount : 0)

            MatchIntentsView()
                .tabItem {
                    Label("Découvrir", systemImage: "magnifyingglass")
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
        .task {
            // Load organization data at startup so it's available everywhere
            await organizationViewModel.loadOrganizations()
            await organizationViewModel.loadActiveMember()
        }
        .task {
            // Setup E2EE keys silently at launch
            do {
                let setupUseCase = SetupE2EEKeysUseCase()
                _ = try await setupUseCase.execute()
            } catch {
                print("[E2EE] Key setup failed: \(error.localizedDescription)")
            }
        }
        .task {
            await matchRequestsViewModel.loadRequests()
        }
    }
}
