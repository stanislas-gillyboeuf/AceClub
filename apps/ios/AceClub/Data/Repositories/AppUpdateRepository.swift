import Foundation

class AppUpdateRepository {

    private let dataSource = AppStoreAPIDataSource()

    func checkForUpdate() async throws -> AppUpdateInfo? {
        guard let bundleId = Bundle.main.bundleIdentifier,
              let currentVersion = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String else {
            return nil
        }

        let dto = try await dataSource.lookupApp(bundleId: bundleId)

        if currentVersion.compare(dto.version, options: .numeric) == .orderedAscending {
            return AppUpdateMapper.map(dto: dto, currentVersion: currentVersion)
        }

        return nil
    }
}
