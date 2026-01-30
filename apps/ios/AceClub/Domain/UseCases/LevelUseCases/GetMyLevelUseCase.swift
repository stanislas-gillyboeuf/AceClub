import Foundation

class GetMyLevelUseCase {
    let repository = LevelRepository()

    func execute() async throws -> UserLevel {
        return try await repository.getMyLevel()
    }
}
