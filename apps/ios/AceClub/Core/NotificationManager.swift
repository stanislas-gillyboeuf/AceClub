//
//  NotificationManager.swift
//  AceClub
//
//  Created by Claude on 29/01/2026.
//

import Foundation
import UserNotifications
import UIKit

struct NotificationDeepLink: Equatable {
    let type: String
    let referenceId: String
}

@MainActor
@Observable
final class NotificationManager {
    static let shared = NotificationManager()

    var isPermissionGranted = false
    var pendingDeepLink: NotificationDeepLink?

    private let registerTokenUseCase = RegisterDeviceTokenUseCase()
    private let unregisterTokenUseCase = UnregisterDeviceTokenUseCase()
    private let keychainManager = KeychainManager.shared

    private init() {}

    // MARK: - Permission

    func requestPermission() async -> Bool {
        let center = UNUserNotificationCenter.current()
        do {
            let granted = try await center.requestAuthorization(options: [.alert, .badge, .sound])
            isPermissionGranted = granted
            if granted {
                UIApplication.shared.registerForRemoteNotifications()
            }
            return granted
        } catch {
            print("[NotificationManager] Permission request failed: \(error.localizedDescription)")
            return false
        }
    }

    func checkPermissionStatus() async {
        let center = UNUserNotificationCenter.current()
        let settings = await center.notificationSettings()
        isPermissionGranted = settings.authorizationStatus == .authorized
    }

    // MARK: - Device Token

    func registerDeviceToken(_ token: String) async {
        do {
            try await registerTokenUseCase.execute(token: token)
            try keychainManager.save(key: "device_token", value: token)
            print("[NotificationManager] Device token registered successfully")
        } catch {
            print("[NotificationManager] Failed to register device token: \(error.localizedDescription)")
        }
    }

    func unregisterDeviceToken() async {
        guard let token = try? keychainManager.get(key: "device_token") else {
            print("[NotificationManager] No device token to unregister")
            return
        }

        do {
            try await unregisterTokenUseCase.execute(token: token)
            try keychainManager.delete(key: "device_token")
            print("[NotificationManager] Device token unregistered successfully")
        } catch {
            print("[NotificationManager] Failed to unregister device token: \(error.localizedDescription)")
        }
    }

    // MARK: - Deep Link Handling

    func handleNotificationResponse(_ response: UNNotificationResponse) {
        let userInfo = response.notification.request.content.userInfo

        guard let type = userInfo["type"] as? String else { return }

        // For new_message, the conversationId may be in referenceId or directly in data
        let referenceId: String? = {
            if let id = userInfo["referenceId"] as? String {
                return id
            }
            if type == "new_message", let conversationId = userInfo["conversationId"] as? String {
                return conversationId
            }
            return nil
        }()

        if let referenceId {
            pendingDeepLink = NotificationDeepLink(type: type, referenceId: referenceId)
            print("[NotificationManager] Deep link set: type=\(type), referenceId=\(referenceId)")
        }
    }

    func clearPendingDeepLink() {
        pendingDeepLink = nil
    }
}
