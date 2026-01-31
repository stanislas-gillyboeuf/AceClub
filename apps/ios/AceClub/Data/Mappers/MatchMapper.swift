//
//  MatchMapper.swift
//  AceClub
//
//  Created by Nicolas Becharat on 12/01/2026.
//

import Foundation

class MatchMapper {

    // MARK: - Date Parsing

    private static let isoDateFormatter: ISO8601DateFormatter = {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter
    }()

    private static func parseDate(_ dateString: String) -> Date? {
        // Try with fractional seconds first
        if let date = isoDateFormatter.date(from: dateString) {
            return date
        }

        // Try without fractional seconds
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime]
        return formatter.date(from: dateString)
    }

    // MARK: - Match Status Mapping

    private static func mapStatus(_ statusString: String) -> MatchStatus {
        switch statusString.lowercased() {
        case "scheduled":
            return .scheduled
        case "ongoing":
            return .ongoing
        case "finished":
            return .finished
        default:
            return .scheduled // Default fallback
        }
    }

    // MARK: - Match Side Mapping

    private static func mapSide(_ sideString: String) -> MatchSide {
        switch sideString.lowercased() {
        case "home":
            return .home
        case "away":
            return .away
        default:
            return .home // Default fallback
        }
    }

    // MARK: - Match Type Mapping

    private static func mapType(_ typeString: String?) -> MatchType {
        switch typeString?.lowercased() {
        case "training":
            return .training
        case "match", .none:
            return .match // Default fallback
        default:
            return .match
        }
    }

    // MARK: - Match Mapping

    static func map(matchDTO: MatchDTO) -> Match {
        return Match(
            id: matchDTO.id,
            createdBy: matchDTO.createdBy,
            status: mapStatus(matchDTO.status),
            type: mapType(matchDTO.type),
            createdAt: parseDate(matchDTO.createdAt) ?? Date(),
            scheduledAt: matchDTO.scheduledAt.flatMap { parseDate($0) },
            startedAt: matchDTO.startedAt.flatMap { parseDate($0) },
            finishedAt: matchDTO.finishedAt.flatMap { parseDate($0) }
        )
    }

    // MARK: - Participant Mapping

    static func map(participantDTO: MatchParticipantDTO) -> MatchParticipant {
        return MatchParticipant(
            id: participantDTO.id,
            matchId: participantDTO.matchId,
            userId: participantDTO.userId,
            side: mapSide(participantDTO.side),
            isWinner: participantDTO.isWinner,
            createdAt: parseDate(participantDTO.createdAt) ?? Date(),
            user: participantDTO.user.map { UserMapper.map(userDTO: $0) }
        )
    }

    // MARK: - Set Score Mapping

    static func map(scoreDTO: SetScoreDTO) -> SetScore {
        return SetScore(
            id: scoreDTO.participantId, // Using participantId as identifier
            participantId: scoreDTO.participantId,
            userId: scoreDTO.userId,
            side: mapSide(scoreDTO.side ?? "home"),
            games: scoreDTO.games
        )
    }

    // MARK: - Set Mapping

    static func map(setDTO: SetDTO) -> MatchSet {
        let scores = setDTO.scores?.map { map(scoreDTO: $0) } ?? []

        return MatchSet(
            id: setDTO.id,
            matchId: setDTO.matchId,
            setNumber: setDTO.setNumber,
            createdAt: parseDate(setDTO.createdAt) ?? Date(),
            scores: scores
        )
    }

    // MARK: - Match Detail Mapping

    static func map(detailDTO: MatchDetailResponseDTO) -> MatchDetail {
        let match = map(matchDTO: detailDTO.match)
        let participants = detailDTO.participants.map { map(participantDTO: $0) }
        let sets = detailDTO.sets.map { map(setDTO: $0) }

        return MatchDetail(
            match: match,
            participants: participants,
            sets: sets
        )
    }

    // MARK: - Match List Item Mapping

    static func map(matchWithParticipantsDTO: MatchWithParticipantsDTO) -> MatchListItem {
        let participants = matchWithParticipantsDTO.participants.map { map(participantDTO: $0) }

        return MatchListItem(
            id: matchWithParticipantsDTO.id,
            createdBy: matchWithParticipantsDTO.createdBy,
            status: mapStatus(matchWithParticipantsDTO.status),
            type: mapType(matchWithParticipantsDTO.type),
            createdAt: parseDate(matchWithParticipantsDTO.createdAt) ?? Date(),
            scheduledAt: matchWithParticipantsDTO.scheduledAt.flatMap { parseDate($0) },
            startedAt: matchWithParticipantsDTO.startedAt.flatMap { parseDate($0) },
            finishedAt: matchWithParticipantsDTO.finishedAt.flatMap { parseDate($0) },
            participants: participants
        )
    }

    // MARK: - Match List Response Mapping

    static func map(listResponseDTO: ListMatchesResponseDTO) -> MatchListResult {
        let matches = listResponseDTO.matches.map { map(matchWithParticipantsDTO: $0) }

        return MatchListResult(
            matches: matches,
            page: listResponseDTO.pagination.page,
            limit: listResponseDTO.pagination.limit,
            total: listResponseDTO.pagination.total,
            totalPages: listResponseDTO.pagination.totalPages
        )
    }

    // MARK: - Create Match Request Mapping (Entity -> DTO)

    static func mapToCreateRequest(
        createdBy: String,
        status: MatchStatus,
        type: MatchType = .match,
        createdAt: Date,
        scheduledAt: Date?,
        startedAt: Date?,
        finishedAt: Date?,
        participants: [(userId: String, side: MatchSide, isWinner: Bool)],
        sets: [(setNumber: Int, scores: [(userId: String, score: Int)])]
    ) -> CreateMatchRequestDTO {
        let participantDTOs = participants.map { participant in
            CreateParticipantDTO(
                userId: participant.userId,
                side: participant.side.rawValue,
                isWinner: participant.isWinner
            )
        }

        let setDTOs = sets.map { set in
            let scoreDTOs = set.scores.map { score in
                CreateScoreDTO(
                    userId: score.userId,
                    score: score.score
                )
            }

            return CreateSetDTO(
                setNumber: set.setNumber,
                scores: scoreDTOs
            )
        }

        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

        return CreateMatchRequestDTO(
            createdBy: createdBy,
            status: status.rawValue,
            type: type.rawValue,
            createdAt: formatter.string(from: createdAt),
            scheduledAt: scheduledAt.map { formatter.string(from: $0) },
            startedAt: startedAt.map { formatter.string(from: $0) },
            finishedAt: finishedAt.map { formatter.string(from: $0) },
            participants: participantDTOs,
            sets: setDTOs
        )
    }

    // MARK: - Update Match Request Mapping (Entity -> DTO)

    static func mapToUpdateRequest(
        status: MatchStatus?,
        scheduledAt: Date? = nil,
        startedAt: Date? = nil,
        finishedAt: Date? = nil,
        winnerId: String? = nil
    ) -> UpdateMatchRequestDTO {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

        return UpdateMatchRequestDTO(
            status: status?.rawValue,
            scheduledAt: scheduledAt.map { formatter.string(from: $0) },
            startedAt: startedAt.map { formatter.string(from: $0) },
            finishedAt: finishedAt.map { formatter.string(from: $0) },
            winnerId: winnerId
        )
    }

    // MARK: - Update Scores Request Mapping (Entity -> DTO)

    static func mapToUpdateScoresRequest(
        sets: [(setNumber: Int, scores: [(userId: String, score: Int)])]
    ) -> UpdateMatchScoresRequestDTO {
        let setDTOs = sets.map { set in
            let scoreDTOs = set.scores.map { score in
                UpdateScoreDTO(
                    userId: score.userId,
                    score: score.score
                )
            }

            return UpdateSetScoresDTO(
                setNumber: set.setNumber,
                scores: scoreDTOs
            )
        }

        return UpdateMatchScoresRequestDTO(sets: setDTOs)
    }

    // MARK: - Create Match Response Mapping

    static func map(createResponseDTO: CreateMatchResponseDTO) -> MatchDetail {
        let match = map(matchDTO: createResponseDTO.match)
        let participants = createResponseDTO.participants.map { map(participantDTO: $0) }

        // Map sets with scores from the response
        let sets = createResponseDTO.sets.map { setDTO -> MatchSet in
            // Get scores for this set from the scores array
            let scoresForSet = createResponseDTO.scores
                .filter { $0.setId == setDTO.id }
                .compactMap { scoreResponseDTO -> SetScore? in
                    // Find the participant for this score
                    guard let participant = participants.first(where: { $0.id == scoreResponseDTO.participantId }) else {
                        return nil
                    }

                    return SetScore(
                        id: scoreResponseDTO.participantId,
                        participantId: scoreResponseDTO.participantId,
                        userId: participant.userId,
                        side: participant.side,
                        games: scoreResponseDTO.games
                    )
                }

            return MatchSet(
                id: setDTO.id,
                matchId: setDTO.matchId,
                setNumber: setDTO.setNumber,
                createdAt: parseDate(setDTO.createdAt) ?? Date(),
                scores: scoresForSet
            )
        }

        return MatchDetail(
            match: match,
            participants: participants,
            sets: sets
        )
    }

    // MARK: - Update Match Response Mapping

    static func map(updateResponseDTO: UpdateMatchResponseDTO) -> Match {
        return map(matchDTO: updateResponseDTO.match)
    }

    // MARK: - Comment Mapping

    static func map(commentDTO: MatchCommentDTO) -> MatchComment {
        return MatchComment(
            id: commentDTO.id,
            matchId: commentDTO.matchId,
            userId: commentDTO.userId,
            content: commentDTO.content,
            userName: commentDTO.userName,
            userImage: commentDTO.userImage,
            createdAt: parseDate(commentDTO.createdAt) ?? Date(),
            updatedAt: parseDate(commentDTO.updatedAt) ?? Date()
        )
    }

    // MARK: - Create Comment Request Mapping (Entity -> DTO)

    static func mapToCreateCommentRequest(content: String) -> CreateCommentRequestDTO {
        return CreateCommentRequestDTO(content: content)
    }

    // MARK: - Update Comment Request Mapping (Entity -> DTO)

    static func mapToUpdateCommentRequest(content: String) -> UpdateCommentRequestDTO {
        return UpdateCommentRequestDTO(content: content)
    }
}
