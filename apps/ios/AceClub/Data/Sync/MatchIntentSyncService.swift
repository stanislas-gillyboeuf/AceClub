//
//  MatchIntentSyncService.swift
//  AceClub
//
//  Sync service for MatchIntent - orchestrates API calls and SwiftData updates
//

import SwiftData
import Foundation

@MainActor
final class MatchIntentSyncService {
    private let dataSource = MatchIntentAPIDataSource()
    private let modelContext: ModelContext

    init(modelContext: ModelContext) {
        self.modelContext = modelContext
    }

    // MARK: - Date Parsing

    private static let isoDateFormatter: ISO8601DateFormatter = {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter
    }()

    private static let dateOnlyFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter
    }()

    private static let timeOnlyFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "HH:mm"
        return formatter
    }()

    private func parseDate(_ dateString: String?) -> Date? {
        guard let dateString else { return nil }

        if let date = Self.isoDateFormatter.date(from: dateString) {
            return date
        }

        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime]
        return formatter.date(from: dateString)
    }

    private func parseDateOnly(_ dateString: String?) -> Date? {
        guard let dateString else { return nil }
        return Self.dateOnlyFormatter.date(from: dateString)
    }

    private func parseTimeOnly(_ timeString: String?) -> Date? {
        guard let timeString else { return nil }
        return Self.timeOnlyFormatter.date(from: timeString)
    }

    // MARK: - Sync from API to SwiftData

    /// Sync user's match intents
    func syncMyIntents(cursor: String? = nil, limit: Int = 20) async throws {
        let dto = try await dataSource.listMatchIntents(cursor: cursor, limit: limit)

        for intentDTO in dto.data {
            upsertIntent(from: intentDTO)
        }
        try modelContext.save()
    }

    /// Sync discover feed
    func syncDiscoverFeed(cursor: String? = nil, limit: Int = 20) async throws {
        let dto = try await dataSource.discover(cursor: cursor, limit: limit)

        for itemDTO in dto.data {
            upsertIntentFromDiscover(from: itemDTO)
        }
        try modelContext.save()
    }

    /// Sync incoming requests
    func syncRequests() async throws {
        let requests = try await dataSource.listRequests()

        for requestDTO in requests {
            upsertRequestWithDetails(from: requestDTO)
        }
        try modelContext.save()
    }

    // MARK: - Mutations (API + SwiftData)

    /// Create a new match intent
    func createIntent(
        date: Date,
        time: Date,
        duration: Int,
        type: MatchIntentType,
        description: String?
    ) async throws -> MatchIntentModel {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        let dateString = formatter.string(from: date)

        let timeFormatter = DateFormatter()
        timeFormatter.dateFormat = "HH:mm"
        let timeString = timeFormatter.string(from: time)

        let requestDTO = CreateMatchIntentRequestDTO(
            date: dateString,
            time: timeString,
            duration: duration,
            type: type.rawValue,
            description: description
        )

        let responseDTO = try await dataSource.createMatchIntent(request: requestDTO)
        let model = upsertIntent(from: responseDTO)
        try modelContext.save()

        return model
    }

    /// Swipe on an intent (like/pass)
    func swipe(matchIntentId: String, action: String) async throws -> SwipeResult {
        let requestDTO = SwipeMatchIntentRequestDTO(
            matchIntentId: matchIntentId,
            action: action
        )

        let responseDTO = try await dataSource.swipe(request: requestDTO)

        // If a request was created, save it
        if let requestData = responseDTO.request {
            upsertRequest(from: requestData)
            try modelContext.save()
        }

        // Convert to domain result
        var matchRequest: MatchRequest?
        if let reqDTO = responseDTO.request {
            matchRequest = MatchRequest(
                id: reqDTO.id,
                matchIntentId: reqDTO.matchIntentId,
                requesterId: reqDTO.requesterId,
                receiverId: reqDTO.receiverId,
                status: MatchRequestStatus(rawValue: reqDTO.status) ?? .pending,
                createdAt: parseDate(reqDTO.createdAt) ?? Date(),
                respondedAt: parseDate(reqDTO.respondedAt)
            )
        }

        return SwipeResult(
            matchRequest: matchRequest,
            message: responseDTO.message
        )
    }

    /// Accept a match request
    func acceptRequest(id: String) async throws -> AcceptMatchRequestResult {
        let responseDTO = try await dataSource.acceptRequest(id: id)

        // Update request in SwiftData
        if let existing = fetchRequest(id: id) {
            existing.status = "accepted"
            existing.respondedAt = Date()
            try modelContext.save()
        }

        // Convert to domain result
        var match: Match?
        if let matchDTO = responseDTO.match {
            match = Match(
                id: matchDTO.id,
                createdBy: matchDTO.createdBy,
                status: MatchStatus(rawValue: matchDTO.status) ?? .scheduled,
                type: MatchType(rawValue: matchDTO.type ?? "match") ?? .match,
                createdAt: parseDate(matchDTO.createdAt) ?? Date(),
                scheduledAt: parseDate(matchDTO.scheduledAt),
                startedAt: parseDate(matchDTO.startedAt),
                finishedAt: parseDate(matchDTO.finishedAt)
            )
        }

        var request: MatchRequest?
        if let reqDTO = responseDTO.request {
            request = MatchRequest(
                id: reqDTO.id,
                matchIntentId: reqDTO.matchIntentId,
                requesterId: reqDTO.requesterId,
                receiverId: reqDTO.receiverId,
                status: MatchRequestStatus(rawValue: reqDTO.status) ?? .pending,
                createdAt: parseDate(reqDTO.createdAt) ?? Date(),
                respondedAt: parseDate(reqDTO.respondedAt)
            )
        }

        var requester: UserContact?
        if let requesterDTO = responseDTO.requester {
            requester = UserContact(
                id: requesterDTO.id,
                name: requesterDTO.name,
                image: requesterDTO.image,
                phoneNumber: requesterDTO.phoneNumber
            )
        }

        return AcceptMatchRequestResult(
            match: match,
            request: request,
            requester: requester,
            message: responseDTO.message
        )
    }

    /// Reject a match request
    func rejectRequest(id: String) async throws -> RejectMatchRequestResult {
        let responseDTO = try await dataSource.rejectRequest(id: id)

        // Update request in SwiftData
        if let existing = fetchRequest(id: id) {
            existing.status = "rejected"
            existing.respondedAt = Date()
            try modelContext.save()
        }

        // Convert to domain result
        var request: MatchRequest?
        if let reqDTO = responseDTO.request {
            request = MatchRequest(
                id: reqDTO.id,
                matchIntentId: reqDTO.matchIntentId,
                requesterId: reqDTO.requesterId,
                receiverId: reqDTO.receiverId,
                status: MatchRequestStatus(rawValue: reqDTO.status) ?? .pending,
                createdAt: parseDate(reqDTO.createdAt) ?? Date(),
                respondedAt: parseDate(reqDTO.respondedAt)
            )
        }

        return RejectMatchRequestResult(
            request: request,
            message: responseDTO.message
        )
    }

    /// Delete a match intent
    func deleteIntent(id: String) async throws {
        try await dataSource.deleteMatchIntent(id: id)

        if let existing = fetchIntent(id: id) {
            modelContext.delete(existing)
            try modelContext.save()
        }
    }

    // MARK: - Private Helpers - Fetch

    private func fetchIntent(id: String) -> MatchIntentModel? {
        let predicate = #Predicate<MatchIntentModel> { $0.id == id }
        let descriptor = FetchDescriptor(predicate: predicate)
        return try? modelContext.fetch(descriptor).first
    }

    private func fetchRequest(id: String) -> MatchRequestModel? {
        let predicate = #Predicate<MatchRequestModel> { $0.id == id }
        let descriptor = FetchDescriptor(predicate: predicate)
        return try? modelContext.fetch(descriptor).first
    }

    // MARK: - Private Helpers - Upsert

    @discardableResult
    private func upsertIntent(from dto: MatchIntentDTO) -> MatchIntentModel {
        if let existing = fetchIntent(id: dto.id) {
            existing.userId = dto.userId
            existing.date = parseDateOnly(dto.date)
            existing.time = parseTimeOnly(dto.time)
            existing.duration = dto.duration ?? 60
            existing.type = dto.type ?? "match"
            existing.intentDescription = dto.description
            existing.status = dto.status ?? "pending"
            existing.createdAt = parseDate(dto.createdAt)
            existing.lastSyncedAt = Date()
            return existing
        } else {
            let model = MatchIntentModel(
                id: dto.id,
                userId: dto.userId,
                date: parseDateOnly(dto.date),
                time: parseTimeOnly(dto.time),
                duration: dto.duration ?? 60,
                type: dto.type ?? "match",
                intentDescription: dto.description,
                status: dto.status ?? "pending",
                createdAt: parseDate(dto.createdAt)
            )
            modelContext.insert(model)
            return model
        }
    }

    @discardableResult
    private func upsertIntentFromDiscover(from dto: MatchIntentWithUserDTO) -> MatchIntentModel {
        if let existing = fetchIntent(id: dto.id) {
            existing.userId = dto.userId
            existing.date = parseDateOnly(dto.date)
            existing.time = parseTimeOnly(dto.time)
            existing.duration = dto.duration ?? 60
            existing.type = dto.type ?? "match"
            existing.intentDescription = dto.description
            existing.status = dto.status ?? "pending"
            existing.createdAt = parseDate(dto.createdAt)
            existing.userName = dto.user?.name
            existing.userEmail = dto.user?.email
            existing.lastSyncedAt = Date()
            return existing
        } else {
            let model = MatchIntentModel(
                id: dto.id,
                userId: dto.userId,
                date: parseDateOnly(dto.date),
                time: parseTimeOnly(dto.time),
                duration: dto.duration ?? 60,
                type: dto.type ?? "match",
                intentDescription: dto.description,
                status: dto.status ?? "pending",
                createdAt: parseDate(dto.createdAt),
                userName: dto.user?.name,
                userEmail: dto.user?.email
            )
            modelContext.insert(model)
            return model
        }
    }

    @discardableResult
    private func upsertRequest(from dto: MatchRequestDTO) -> MatchRequestModel {
        if let existing = fetchRequest(id: dto.id) {
            existing.status = dto.status
            existing.respondedAt = parseDate(dto.respondedAt)
            existing.lastSyncedAt = Date()
            return existing
        } else {
            let model = MatchRequestModel(
                id: dto.id,
                matchIntentId: dto.matchIntentId,
                requesterId: dto.requesterId,
                receiverId: dto.receiverId,
                status: dto.status,
                createdAt: parseDate(dto.createdAt) ?? Date(),
                respondedAt: parseDate(dto.respondedAt)
            )
            modelContext.insert(model)
            return model
        }
    }

    @discardableResult
    private func upsertRequestWithDetails(from dto: MatchRequestWithDetailsDTO) -> MatchRequestModel {
        if let existing = fetchRequest(id: dto.id) {
            existing.status = dto.status
            existing.respondedAt = parseDate(dto.respondedAt)
            existing.requesterName = dto.requester?.name
            existing.requesterEmail = dto.requester?.email
            existing.lastSyncedAt = Date()
            return existing
        } else {
            let model = MatchRequestModel(
                id: dto.id,
                matchIntentId: dto.matchIntentId,
                requesterId: dto.requesterId,
                receiverId: dto.receiverId,
                status: dto.status,
                createdAt: parseDate(dto.createdAt) ?? Date(),
                respondedAt: parseDate(dto.respondedAt),
                requesterName: dto.requester?.name,
                requesterEmail: dto.requester?.email
            )

            // Also upsert the intent if present
            if let intentDTO = dto.matchIntent {
                let intent = upsertIntent(from: intentDTO)
                model.matchIntent = intent
            }

            modelContext.insert(model)
            return model
        }
    }
}
