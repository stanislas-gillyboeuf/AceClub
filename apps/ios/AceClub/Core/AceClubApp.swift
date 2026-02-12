//
//  AceClubApp.swift
//  AceClub
//
//  Created by Nicolas Becharat on 12/01/2026.
//

import SwiftUI
import SwiftData
import GoogleSignIn
import ActivityKit

@main
struct AceClubApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    @State private var authViewModel = AuthViewModel()
    @State private var deepLinkManager = DeepLinkManager()
    @State private var notificationManager = NotificationManager.shared

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
            UserPreferencesModel.self,
            MatchFeedbackModel.self
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

        // Debug Live Activities status at app launch
        let authInfo = ActivityAuthorizationInfo()
        print("========================================")
        print("[App Launch] Live Activities Debug Info")
        print("[App Launch] areActivitiesEnabled: \(authInfo.areActivitiesEnabled)")
        print("[App Launch] frequentPushesEnabled: \(authInfo.frequentPushesEnabled)")
        print("========================================")
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(authViewModel)
                .environment(deepLinkManager)
                .environment(notificationManager)
                .tint(Theme.tintColor)
                .onOpenURL { url in
                    // Handle AceClub deep links first
                    if deepLinkManager.handle(url: url) {
                        return
                    }
                    // Handle Google Sign-In callback URL
                    GoogleSignInManager.shared.handle(url)
                }
        }
        .modelContainer(modelContainer)
    }
}
