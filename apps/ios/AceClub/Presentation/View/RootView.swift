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
    @StateObject private var profileViewModel = ProfileViewModel()
    @StateObject private var organizationViewModel = OrganizationViewModel()

    private enum Tab {
        case feed
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
            ProfileView()
                .environmentObject(profileViewModel)
                .environmentObject(organizationViewModel)
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
        .onChange(of: isAdmin) { newValue in
            if !newValue {
                selection = .feed
            }
        }
    }
}

#Preview {
    RootView()
        .environment(AuthViewModel())
}
