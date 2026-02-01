import Foundation

class EquipTitleUseCase {
    let repository = RewardRepository()

    func execute(titleId: String) async throws {
        try await repository.equipTitle(titleId: titleId)
    }
}
