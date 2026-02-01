import SwiftData
import Foundation

@MainActor
final class MatchSyncService {
    private let dataSource = MatchAPIDataSource()
    private let modelContext: ModelContext

    init(modelContext: ModelContext) {
        self.modelContext = modelContext
    }

    private static let isoDateFormatter: ISO8601DateFormatter = {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
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

    func syncMatch(id: String) async throws {
        let dto = try await dataSource.getMatch(id: id)
        upsertMatchDetail(from: dto)
        try modelContext.save()
    }

    func syncMatches(status: String? = nil, userId: String? = nil, page: Int = 1, limit: Int = 20) async throws {
        let dto = try await dataSource.listMatches(
            status: status,
            userId: userId,
            participantOnly: true,
            page: page,
            limit: limit
        )

        let apiMatchIds = Set(dto.matches.map { $0.id })

        for matchDTO in dto.matches {
            upsertMatchFromList(from: matchDTO)
        }

        if page == 1 {
            let localMatches = fetchAllMatches()
            for localMatch in localMatches {
                if !apiMatchIds.contains(localMatch.id) {
                    modelContext.delete(localMatch)
                }
            }
        }

        try modelContext.save()
    }

    struct SyncResult {
        let hasMore: Bool
        let totalPages: Int
        let currentPage: Int
    }

    func syncMatchesPage(page: Int = 1, limit: Int = 20, purgeOnFirstPage: Bool = true, participantOnly: Bool = true) async throws -> SyncResult {
        let dto = try await dataSource.listMatches(
            participantOnly: participantOnly,
            page: page,
            limit: limit
        )

        for matchDTO in dto.matches {
            upsertMatchFromList(from: matchDTO)
        }

        // Only purge local matches not in API on first page
        if page == 1 && purgeOnFirstPage {
            // Fetch all pages to get complete list of IDs for purge
            var allApiMatchIds = Set(dto.matches.map { $0.id })

            if dto.pagination.totalPages > 1 {
                for nextPage in 2...dto.pagination.totalPages {
                    let nextDto = try await dataSource.listMatches(
                        participantOnly: participantOnly,
                        page: nextPage,
                        limit: limit
                    )
                    allApiMatchIds.formUnion(nextDto.matches.map { $0.id })

                    for matchDTO in nextDto.matches {
                        upsertMatchFromList(from: matchDTO)
                    }
                }
            }

            let localMatches = fetchAllMatches()
            for localMatch in localMatches {
                if !allApiMatchIds.contains(localMatch.id) {
                    modelContext.delete(localMatch)
                }
            }
        }

        try modelContext.save()

        return SyncResult(
            hasMore: page < dto.pagination.totalPages,
            totalPages: dto.pagination.totalPages,
            currentPage: page
        )
    }

    @available(*, deprecated, message: "Use syncMatchesPage instead for pagination")
    func syncAllMatchesWithPurge() async throws {
        _ = try await syncMatchesPage(page: 1, limit: 100, purgeOnFirstPage: true)
    }

    func createMatch(
        createdBy: String,
        status: MatchStatus,
        type: MatchType = .match,
        createdAt: Date,
        scheduledAt: Date?,
        startedAt: Date?,
        finishedAt: Date?,
        participants: [(userId: String, side: MatchSide, isWinner: Bool)],
        sets: [(setNumber: Int, scores: [(userId: String, score: Int)])]
    ) async throws -> MatchModel {
        let requestDTO = MatchMapper.mapToCreateRequest(
            createdBy: createdBy,
            status: status,
            type: type,
            createdAt: createdAt,
            scheduledAt: scheduledAt,
            startedAt: startedAt,
            finishedAt: finishedAt,
            participants: participants,
            sets: sets
        )

        let responseDTO = try await dataSource.createMatch(request: requestDTO)
        let model = upsertMatchFromCreateResponse(from: responseDTO)
        try modelContext.save()

        return model
    }

    func updateMatch(
        id: String,
        status: MatchStatus? = nil,
        scheduledAt: Date? = nil,
        startedAt: Date? = nil,
        finishedAt: Date? = nil,
        winnerId: String? = nil
    ) async throws -> MatchModel? {
        let requestDTO = MatchMapper.mapToUpdateRequest(
            status: status,
            scheduledAt: scheduledAt,
            startedAt: startedAt,
            finishedAt: finishedAt,
            winnerId: winnerId
        )

        let responseDTO = try await dataSource.updateMatch(id: id, request: requestDTO)

        if let existing = fetchMatch(id: id) {
            existing.status = responseDTO.match.status
            if let scheduledAt = parseDate(responseDTO.match.scheduledAt) {
                existing.scheduledAt = scheduledAt
            }
            if let startedAt = parseDate(responseDTO.match.startedAt) {
                existing.startedAt = startedAt
            }
            if let finishedAt = parseDate(responseDTO.match.finishedAt) {
                existing.finishedAt = finishedAt
            }
            existing.lastSyncedAt = Date()

            if let winnerId {
                for participant in existing.participants {
                    participant.isWinner = participant.userId == winnerId
                }
            }

            try modelContext.save()
            return existing
        }

        return nil
    }

    func updateScores(
        matchId: String,
        sets: [(setNumber: Int, scores: [(userId: String, score: Int)])]
    ) async throws -> Bool {
        let requestDTO = MatchMapper.mapToUpdateScoresRequest(sets: sets)
        let responseDTO = try await dataSource.updateMatchScores(id: matchId, request: requestDTO)

        if responseDTO.success {
            try await syncMatch(id: matchId)
        }

        return responseDTO.success
    }

    func deleteMatch(id: String) async throws -> Bool {
        let responseDTO = try await dataSource.deleteMatch(id: id)

        if responseDTO.success, let existing = fetchMatch(id: id) {
            modelContext.delete(existing)
            try modelContext.save()
        }

        return responseDTO.success
    }

    // MARK: - Comment Operations

    func createComment(matchId: String, content: String) async throws -> MatchCommentModel {
        let requestDTO = MatchMapper.mapToCreateCommentRequest(content: content)
        let responseDTO = try await dataSource.createComment(matchId: matchId, request: requestDTO)

        guard let match = fetchMatch(id: matchId) else {
            throw MatchAPIDataSourceError.notFound
        }

        let model = upsertComment(from: responseDTO, match: match)
        try modelContext.save()

        return model
    }

    func updateComment(matchId: String, content: String) async throws -> MatchCommentModel {
        let requestDTO = MatchMapper.mapToUpdateCommentRequest(content: content)
        let responseDTO = try await dataSource.updateComment(matchId: matchId, request: requestDTO)

        guard let match = fetchMatch(id: matchId) else {
            throw MatchAPIDataSourceError.notFound
        }

        let model = upsertComment(from: responseDTO, match: match)
        try modelContext.save()

        return model
    }

    func deleteComment(matchId: String) async throws -> Bool {
        let responseDTO = try await dataSource.deleteComment(matchId: matchId)

        if responseDTO.success {
            try await syncMatch(id: matchId)
        }

        return responseDTO.success
    }

    // MARK: - Fetch

    private func fetchMatch(id: String) -> MatchModel? {
        let predicate = #Predicate<MatchModel> { $0.id == id }
        let descriptor = FetchDescriptor(predicate: predicate)
        return try? modelContext.fetch(descriptor).first
    }

    private func fetchAllMatches() -> [MatchModel] {
        let descriptor = FetchDescriptor<MatchModel>()
        return (try? modelContext.fetch(descriptor)) ?? []
    }

    private func fetchParticipant(id: String) -> MatchParticipantModel? {
        let predicate = #Predicate<MatchParticipantModel> { $0.id == id }
        let descriptor = FetchDescriptor(predicate: predicate)
        return try? modelContext.fetch(descriptor).first
    }

    private func fetchSet(id: String) -> MatchSetModel? {
        let predicate = #Predicate<MatchSetModel> { $0.id == id }
        let descriptor = FetchDescriptor(predicate: predicate)
        return try? modelContext.fetch(descriptor).first
    }

    private func fetchScore(id: String) -> SetScoreModel? {
        let predicate = #Predicate<SetScoreModel> { $0.id == id }
        let descriptor = FetchDescriptor(predicate: predicate)
        return try? modelContext.fetch(descriptor).first
    }

    private func fetchComment(id: String) -> MatchCommentModel? {
        let predicate = #Predicate<MatchCommentModel> { $0.id == id }
        let descriptor = FetchDescriptor(predicate: predicate)
        return try? modelContext.fetch(descriptor).first
    }

    // MARK: - Upsert

    @discardableResult
    private func upsertMatchDetail(from dto: MatchDetailResponseDTO) -> MatchModel {
        let matchDTO = dto.match
        let model: MatchModel

        if let existing = fetchMatch(id: matchDTO.id) {
            existing.createdBy = matchDTO.createdBy
            existing.status = matchDTO.status
            existing.type = matchDTO.type ?? "match"
            existing.scheduledAt = parseDate(matchDTO.scheduledAt)
            existing.startedAt = parseDate(matchDTO.startedAt)
            existing.finishedAt = parseDate(matchDTO.finishedAt)
            existing.lastSyncedAt = Date()
            model = existing
        } else {
            model = MatchModel(
                id: matchDTO.id,
                createdBy: matchDTO.createdBy,
                status: matchDTO.status,
                type: matchDTO.type ?? "match",
                createdAt: parseDate(matchDTO.createdAt) ?? Date(),
                scheduledAt: parseDate(matchDTO.scheduledAt),
                startedAt: parseDate(matchDTO.startedAt),
                finishedAt: parseDate(matchDTO.finishedAt)
            )
            modelContext.insert(model)
        }

        for participantDTO in dto.participants {
            upsertParticipant(from: participantDTO, match: model)
        }

        for setDTO in dto.sets {
            upsertSet(from: setDTO, match: model)
        }

        if let comments = dto.comments {
            let apiCommentIds = Set(comments.map { $0.id })

            for commentDTO in comments {
                upsertComment(from: commentDTO, match: model)
            }

            for existingComment in model.comments {
                if !apiCommentIds.contains(existingComment.id) {
                    modelContext.delete(existingComment)
                }
            }
        }

        return model
    }

    @discardableResult
    private func upsertMatchFromList(from dto: MatchWithParticipantsDTO) -> MatchModel {
        let model: MatchModel

        if let existing = fetchMatch(id: dto.id) {
            existing.createdBy = dto.createdBy
            existing.status = dto.status
            existing.type = dto.type ?? "match"
            existing.scheduledAt = parseDate(dto.scheduledAt)
            existing.startedAt = parseDate(dto.startedAt)
            existing.finishedAt = parseDate(dto.finishedAt)
            existing.lastSyncedAt = Date()
            model = existing
        } else {
            model = MatchModel(
                id: dto.id,
                createdBy: dto.createdBy,
                status: dto.status,
                type: dto.type ?? "match",
                createdAt: parseDate(dto.createdAt) ?? Date(),
                scheduledAt: parseDate(dto.scheduledAt),
                startedAt: parseDate(dto.startedAt),
                finishedAt: parseDate(dto.finishedAt)
            )
            modelContext.insert(model)
        }

        for participantDTO in dto.participants {
            upsertParticipant(from: participantDTO, match: model)
        }

        if let sets = dto.sets {
            for setDTO in sets {
                upsertSet(from: setDTO, match: model)
            }
        }

        return model
    }

    @discardableResult
    private func upsertMatchFromCreateResponse(from dto: CreateMatchResponseDTO) -> MatchModel {
        let matchDTO = dto.match
        let model: MatchModel

        if let existing = fetchMatch(id: matchDTO.id) {
            existing.createdBy = matchDTO.createdBy
            existing.status = matchDTO.status
            existing.type = matchDTO.type ?? "match"
            existing.scheduledAt = parseDate(matchDTO.scheduledAt)
            existing.startedAt = parseDate(matchDTO.startedAt)
            existing.finishedAt = parseDate(matchDTO.finishedAt)
            existing.lastSyncedAt = Date()
            model = existing
        } else {
            model = MatchModel(
                id: matchDTO.id,
                createdBy: matchDTO.createdBy,
                status: matchDTO.status,
                type: matchDTO.type ?? "match",
                createdAt: parseDate(matchDTO.createdAt) ?? Date(),
                scheduledAt: parseDate(matchDTO.scheduledAt),
                startedAt: parseDate(matchDTO.startedAt),
                finishedAt: parseDate(matchDTO.finishedAt)
            )
            modelContext.insert(model)
        }

        for participantDTO in dto.participants {
            upsertParticipant(from: participantDTO, match: model)
        }

        for setDTO in dto.sets {
            let setModel = upsertSet(from: setDTO, match: model)

            let scoresForSet = dto.scores.filter { $0.setId == setDTO.id }
            for scoreDTO in scoresForSet {
                if let participant = model.participants.first(where: { $0.id == scoreDTO.participantId }) {
                    upsertScore(
                        id: "\(setDTO.id)_\(scoreDTO.participantId)",
                        participantId: scoreDTO.participantId,
                        userId: participant.userId,
                        side: participant.side,
                        games: scoreDTO.games,
                        matchSet: setModel
                    )
                }
            }
        }

        return model
    }

    @discardableResult
    private func upsertParticipant(from dto: MatchParticipantDTO, match: MatchModel) -> MatchParticipantModel {
        if let existing = fetchParticipant(id: dto.id) {
            existing.side = dto.side
            existing.isWinner = dto.isWinner
            existing.userName = dto.user?.name
            existing.userEmail = dto.user?.email
            existing.userImage = dto.user?.image
            return existing
        } else {
            let participant = MatchParticipantModel(
                id: dto.id,
                matchId: dto.matchId,
                userId: dto.userId,
                side: dto.side,
                isWinner: dto.isWinner,
                createdAt: parseDate(dto.createdAt) ?? Date(),
                userName: dto.user?.name,
                userEmail: dto.user?.email,
                userImage: dto.user?.image
            )
            participant.match = match
            modelContext.insert(participant)
            return participant
        }
    }

    @discardableResult
    private func upsertSet(from dto: SetDTO, match: MatchModel) -> MatchSetModel {
        if let existing = fetchSet(id: dto.id) {
            existing.setNumber = dto.setNumber
            if let scores = dto.scores {
                for scoreDTO in scores {
                    let scoreId = "\(dto.id)_\(scoreDTO.participantId)"
                    upsertScore(
                        id: scoreId,
                        participantId: scoreDTO.participantId,
                        userId: scoreDTO.userId,
                        side: scoreDTO.side ?? "home",
                        games: scoreDTO.games,
                        matchSet: existing
                    )
                }
            }
            return existing
        } else {
            let matchSet = MatchSetModel(
                id: dto.id,
                matchId: dto.matchId,
                setNumber: dto.setNumber,
                createdAt: parseDate(dto.createdAt) ?? Date()
            )
            matchSet.match = match
            modelContext.insert(matchSet)

            if let scores = dto.scores {
                for scoreDTO in scores {
                    let scoreId = "\(dto.id)_\(scoreDTO.participantId)"
                    upsertScore(
                        id: scoreId,
                        participantId: scoreDTO.participantId,
                        userId: scoreDTO.userId,
                        side: scoreDTO.side ?? "home",
                        games: scoreDTO.games,
                        matchSet: matchSet
                    )
                }
            }

            return matchSet
        }
    }

    @discardableResult
    private func upsertScore(
        id: String,
        participantId: String,
        userId: String,
        side: String,
        games: Int,
        matchSet: MatchSetModel
    ) -> SetScoreModel {
        if let existing = fetchScore(id: id) {
            existing.games = games
            return existing
        } else {
            let score = SetScoreModel(
                id: id,
                participantId: participantId,
                userId: userId,
                side: side,
                games: games
            )
            score.matchSet = matchSet
            modelContext.insert(score)
            return score
        }
    }

    @discardableResult
    private func upsertComment(from dto: MatchCommentDTO, match: MatchModel) -> MatchCommentModel {
        if let existing = fetchComment(id: dto.id) {
            existing.content = dto.content
            existing.userName = dto.user?.name ?? ""
            existing.userImage = dto.user?.image
            existing.updatedAt = parseDate(dto.updatedAt) ?? Date()
            return existing
        } else {
            let comment = MatchCommentModel(
                id: dto.id,
                matchId: dto.matchId,
                userId: dto.userId,
                content: dto.content,
                userName: dto.user?.name ?? "",
                userImage: dto.user?.image,
                createdAt: parseDate(dto.createdAt) ?? Date(),
                updatedAt: parseDate(dto.updatedAt) ?? Date()
            )
            comment.match = match
            modelContext.insert(comment)
            return comment
        }
    }
}
