import Foundation

class GetAcesHistoryUseCase {
    let repository = LevelRepository()

    func execute(page: Int = 1, limit: Int = 20) async throws -> [AcesTransaction] {
        return try await repository.getAcesHistory(page: page, limit: limit)
    }
}
