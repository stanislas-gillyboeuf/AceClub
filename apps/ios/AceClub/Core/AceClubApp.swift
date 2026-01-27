//
//  AceClubApp.swift
//  AceClub
//
//  Created by Nicolas Becharat on 12/01/2026.
//

import SwiftUI
import GoogleSignIn

@main
struct AceClubApp: App {
    @State private var authViewModel = AuthViewModel()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(authViewModel)
                .tint(Theme.tintColor)
                .onOpenURL { url in
                    // Handle Google Sign-In callback URL
                    GoogleSignInManager.shared.handle(url)
                }
        }
    }
}
