//
//  RootView.swift
//  AceClub
//
//  Created by Nicolas Becharat on 14/01/2026.
//

import SwiftUI

struct RootView: View {
    @Environment(AuthViewModel.self) private var authViewModel
    @State private var selection: Tab = .feed
    @State private var showingCreateMatch = false
    @StateObject private var profileViewModel = ProfileViewModel()
    @StateObject private var organizationViewModel = OrganizationViewModel()
    @StateObject private var invitationViewModel = InvitationViewModel()
    @StateObject private var progressionViewModel = ProgressionViewModel()

    private enum Tab {
        case feed
        case matches
        case discover
        case admin
        case profile
    }

    private var isAdmin: Bool {
        authViewModel.currentUser?.role?.lowercased() == "admin"
    }

    var body: some View {
        TabView(selection: $selection) {
            HomeView()
                .tabItem {
                    Label("Feed", systemImage: "list.dash")
                }
                .tag(Tab.feed)

            MatchesView()
                .tabItem {
                    Label("Matchs", systemImage: "tennis.racket")
                }
                .tag(Tab.matches)

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
                    Label("Profile", systemImage: "person")
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
        .background(Theme.primaryBackground)
    }
}
