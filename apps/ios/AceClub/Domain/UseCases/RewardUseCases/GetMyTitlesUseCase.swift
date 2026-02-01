import Foundation

class GetMyTitlesUseCase {
    let repository = RewardRepository()

    func execute() async throws -> [Title] {
        return try await repository.getMyTitles()
    }
}
