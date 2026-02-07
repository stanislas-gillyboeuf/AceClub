//
//  MatchIntentRepository.swift
//  AceClub
//

import Foundation

protocol MatchIntentRepositoryProtocol {
    func listMatchIntents(cursor: String?, limit: Int) async throws -> MatchIntentListResult
    func discover(cursor: String?, limit: Int, latitude: Double?, longitude: Double?, radius: Int?) async throws -> DiscoverListResult
    func listRequests() async throws -> [MatchRequestWithDetails]
    func createMatchIntent(date: Date, time: Date, duration: Int, type: MatchIntentType, description: String?) async throws -> MatchIntent
    func deleteMatchIntent(id: String) async throws
    func swipe(matchIntentId: String, action: String) async throws -> SwipeResult
    func acceptRequest(id: String) async throws -> AcceptMatchRequestResult
    func rejectRequest(id: String) async throws -> RejectMatchRequestResult
}

class MatchIntentRepository: MatchIntentRepositoryProtocol {
    private let dataSource: MatchIntentAPIDataSource

    init(dataSource: MatchIntentAPIDataSource = MatchIntentAPIDataSource()) {
        self.dataSource = dataSource
    }

    func listMatchIntents(cursor: String? = nil, limit: Int = 20) async throws -> MatchIntentListResult {
        let dto = try await dataSource.listMatchIntents(cursor: cursor, limit: limit)
        return MatchIntentMapper.map(listDTO: dto)
    }

    func discover(cursor: String? = nil, limit: Int = 20, latitude: Double? = nil, longitude: Double? = nil, radius: Int? = nil) async throws -> DiscoverListResult {
        let dto = try await dataSource.discover(cursor: cursor, limit: limit, latitude: latitude, longitude: longitude, radius: radius)
        return MatchIntentMapper.map(discoverDTO: dto)
    }

    func listRequests() async throws -> [MatchRequestWithDetails] {
        let dtos = try await dataSource.listRequests()
        return MatchIntentMapper.map(detailsDTOs: dtos)
    }

    func createMatchIntent(date: Date, time: Date, duration: Int, type: MatchIntentType, description: String?) async throws -> MatchIntent {
        let request = MatchIntentMapper.mapToCreateRequest(date: date, time: time, duration: duration, type: type, description: description)
        let dto = try await dataSource.createMatchIntent(request: request)
        return MatchIntentMapper.map(intentDTO: dto)
    }

    func deleteMatchIntent(id: String) async throws {
        try await dataSource.deleteMatchIntent(id: id)
    }

    func swipe(matchIntentId: String, action: String) async throws -> SwipeResult {
        let request = SwipeMatchIntentRequestDTO(matchIntentId: matchIntentId, action: action)
        let dto = try await dataSource.swipe(request: request)
        return MatchIntentMapper.map(swipeResponseDTO: dto)
    }

    func acceptRequest(id: String) async throws -> AcceptMatchRequestResult {
        let dto = try await dataSource.acceptRequest(id: id)
        return MatchIntentMapper.map(acceptResponseDTO: dto)
    }

    func rejectRequest(id: String) async throws -> RejectMatchRequestResult {
        let dto = try await dataSource.rejectRequest(id: id)
        return MatchIntentMapper.map(rejectResponseDTO: dto)
    }
}
