import Foundation

class RewardRepository {
    let dataSource = RewardAPIDataSource()

    func getMyBadges() async throws -> [Badge] {
        let dto = try await dataSource.getMyBadges()
        return RewardMapper.map(myBadgesDTO: dto)
    }

    func getAllBadges() async throws -> [Badge] {
        let dto = try await dataSource.getAllBadges()
        return RewardMapper.map(allBadgesDTO: dto)
    }

    func getMyTitles() async throws -> [Title] {
        let dto = try await dataSource.getMyTitles()
        return RewardMapper.map(titlesDTO: dto)
    }

    func equipTitle(titleId: String) async throws {
        _ = try await dataSource.equipTitle(titleId: titleId)
    }
}
