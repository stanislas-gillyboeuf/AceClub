import Foundation

class CheckAppUpdateUseCase {

    private let repository = AppUpdateRepository()

    func execute() async throws -> AppUpdateInfo? {
        return try await repository.checkForUpdate()
    }
}
