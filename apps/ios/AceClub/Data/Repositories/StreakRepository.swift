import Foundation

class StreakRepository {
    let dataSource = StreakAPIDataSource()

    func getMyStreak() async throws -> UserStreak {
        let dto = try await dataSource.getMyStreak()
        return StreakMapper.map(userStreakDTO: dto)
    }
}
