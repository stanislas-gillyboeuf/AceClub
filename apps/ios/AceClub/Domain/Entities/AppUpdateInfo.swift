import Foundation

struct AppUpdateInfo: Identifiable {
    let id: String
    let currentVersion: String
    let availableVersion: String
    let releaseNotes: String
    let appLogo: String
    let appURL: String
}
