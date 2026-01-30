import Foundation

class LevelRepository {
    let dataSource = LevelAPIDataSource()

    func getMyLevel() async throws -> UserLevel {
        let dto = try await dataSource.getMyLevel()
        return LevelMapper.map(userLevelDTO: dto)
    }

    func getUserLevel(userId: String) async throws -> UserLevel {
        let dto = try await dataSource.getUserLevel(userId: userId)
        return LevelMapper.map(userLevelDTO: dto)
    }

    func getAcesHistory(page: Int = 1, limit: Int = 20) async throws -> [AcesTransaction] {
        let dto = try await dataSource.getAcesHistory(page: page, limit: limit)
        return LevelMapper.map(acesHistoryDTO: dto)
    }
}
