import Foundation

class GetXpHistoryUseCase {
    let repository = LevelRepository()

    func execute(page: Int = 1, limit: Int = 20) async throws -> [XpTransaction] {
        return try await repository.getXpHistory(page: page, limit: limit)
    }
}
