//
//  ContentView.swift
//  AceClub
//
//  Created by Nicolas Becharat on 12/01/2026.
//

import SwiftUI

struct ContentView: View {
    @Environment(AuthViewModel.self) private var authViewModel

    var body: some View {
        Group {
            if authViewModel.isLoading {
                ProgressView()
            } else if authViewModel.isAuthenticated {
                if let user = authViewModel.currentUser, user.isOnboardingCompleted == false {
                    OnboardingView()
                } else {
                    RootView()
                }
            } else {
                SignInView()
            }
        }
        .task {
            await authViewModel.checkSession()
        }
    }
}
