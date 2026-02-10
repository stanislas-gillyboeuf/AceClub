import Foundation

class AppUpdateMapper {

    static func map(dto: AppStoreLookupResultDTO, currentVersion: String) -> AppUpdateInfo {
        return AppUpdateInfo(
            id: UUID().uuidString,
            currentVersion: currentVersion,
            availableVersion: dto.version,
            releaseNotes: dto.releaseNotes,
            appLogo: dto.artworkUrl512,
            appURL: dto.trackViewUrl
        )
    }
}
