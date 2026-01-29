//
//  AceClubApp.swift
//  AceClub
//
//  Created by Nicolas Becharat on 12/01/2026.
//

import SwiftUI
import SwiftData
import GoogleSignIn

@main
struct AceClubApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    @State private var authViewModel = AuthViewModel()

    let modelContainer: ModelContainer

    init() {
        let schema = Schema([
            UserModel.self,
            MatchModel.self,
            MatchParticipantModel.self,
            MatchSetModel.self,
            SetScoreModel.self,
            MatchIntentModel.self,
            MatchRequestModel.self,
            OrganizationModel.self,
            MemberModel.self,
            UserPreferencesModel.self
        ])

        let modelConfiguration = ModelConfiguration(
            schema: schema,
            isStoredInMemoryOnly: false
        )

        do {
            modelContainer = try ModelContainer(
                for: schema,
                configurations: modelConfiguration
            )
        } catch {
            fatalError("Failed to create ModelContainer: \(error)")
        }
    }

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
        .modelContainer(modelContainer)
    }
}
