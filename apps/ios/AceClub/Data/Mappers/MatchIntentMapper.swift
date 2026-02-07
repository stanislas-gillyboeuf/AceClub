//
//  MatchIntentMapper.swift
//  AceClub
//

import Foundation

class MatchIntentMapper {

    private static let isoDateFormatter: ISO8601DateFormatter = {
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return f
    }()

    private static func parseDate(_ string: String?) -> Date? {
        guard let string = string else { return nil }
        if let date = isoDateFormatter.date(from: string) { return date }
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withInternetDateTime]
        return f.date(from: string)
    }

    private static func formatDate(_ date: Date) -> String {
        isoDateFormatter.string(from: date)
    }

    private static func mapIntentStatus(_ s: String?) -> MatchIntentStatus {
        guard let s = s else { return .pending }
        return MatchIntentStatus(rawValue: s) ?? .pending
    }

    private static func mapRequestStatus(_ s: String) -> MatchRequestStatus {
        MatchRequestStatus(rawValue: s) ?? .pending
    }

    private static func mapIntentType(_ s: String?) -> MatchIntentType {
        guard let s = s else { return .match }
        return MatchIntentType(rawValue: s) ?? .match
    }

    // MARK: - MatchIntent

    static func map(intentDTO: MatchIntentDTO) -> MatchIntent {
        MatchIntent(
            id: intentDTO.id,
            userId: intentDTO.userId,
            date: parseDate(intentDTO.date),
            time: parseDate(intentDTO.time),
            duration: intentDTO.duration ?? 60,
            type: mapIntentType(intentDTO.type),
            description: intentDTO.description,
            status: mapIntentStatus(intentDTO.status),
            createdAt: parseDate(intentDTO.createdAt)
        )
    }

    static func map(intentDTOs: [MatchIntentDTO]) -> [MatchIntent] {
        intentDTOs.map { map(intentDTO: $0) }
    }

    // MARK: - List result

    static func map(listDTO: ListMatchIntentsResponseDTO) -> MatchIntentListResult {
        MatchIntentListResult(
            data: map(intentDTOs: listDTO.data),
            nextCursor: listDTO.pagination.nextCursor,
            hasMore: listDTO.pagination.hasMore,
            limit: listDTO.pagination.limit
        )
    }

    // MARK: - OrganizationBrief

    static func map(organizationBriefDTO: OrganizationBriefDTO) -> OrganizationBrief {
        OrganizationBrief(
            id: organizationBriefDTO.id,
            name: organizationBriefDTO.name,
            logoURL: organizationBriefDTO.logo.flatMap { URL(string: $0) }
        )
    }

    // MARK: - UserBrief

    static func map(userBriefDTO: UserBriefDTO) -> UserBrief {
        UserBrief(
            id: userBriefDTO.id,
            name: userBriefDTO.name,
            email: userBriefDTO.email,
            imageURL: userBriefDTO.image.flatMap { URL(string: $0) },
            level: userBriefDTO.level ?? 1,
            organization: userBriefDTO.organization.map { map(organizationBriefDTO: $0) }
        )
    }

    // MARK: - UserContact

    static func map(userContactDTO: UserContactDTO) -> UserContact {
        UserContact(
            id: userContactDTO.id,
            name: userContactDTO.name,
            image: userContactDTO.image,
            phoneNumber: userContactDTO.phoneNumber
        )
    }

    // MARK: - Discover

    static func map(discoverItemDTO: MatchIntentWithUserDTO) -> MatchIntentDiscoverItem {
        let intent = MatchIntent(
            id: discoverItemDTO.id,
            userId: discoverItemDTO.userId,
            date: parseDate(discoverItemDTO.date),
            time: parseDate(discoverItemDTO.time),
            duration: discoverItemDTO.duration ?? 60,
            type: mapIntentType(discoverItemDTO.type),
            description: discoverItemDTO.description,
            status: mapIntentStatus(discoverItemDTO.status),
            createdAt: parseDate(discoverItemDTO.createdAt)
        )
        let user = discoverItemDTO.user.map { map(userBriefDTO: $0) }
        return MatchIntentDiscoverItem(intent: intent, user: user, distance: discoverItemDTO.distance)
    }

    static func map(discoverDTO: DiscoverMatchIntentsResponseDTO) -> DiscoverListResult {
        DiscoverListResult(
            data: discoverDTO.data.map { map(discoverItemDTO: $0) },
            nextCursor: discoverDTO.pagination.nextCursor,
            hasMore: discoverDTO.pagination.hasMore,
            limit: discoverDTO.pagination.limit
        )
    }

    // MARK: - Create intent (domain -> DTO)

    static func mapToCreateRequest(date: Date, time: Date, duration: Int, type: MatchIntentType, description: String?) -> CreateMatchIntentRequestDTO {
        CreateMatchIntentRequestDTO(
            date: formatDate(date),
            time: formatDate(time),
            duration: duration,
            type: type.rawValue,
            description: description
        )
    }

    // MARK: - MatchRequest

    static func map(requestDTO: MatchRequestDTO) -> MatchRequest {
        MatchRequest(
            id: requestDTO.id,
            matchIntentId: requestDTO.matchIntentId,
            requesterId: requestDTO.requesterId,
            receiverId: requestDTO.receiverId,
            status: mapRequestStatus(requestDTO.status),
            createdAt: parseDate(requestDTO.createdAt) ?? Date(),
            respondedAt: parseDate(requestDTO.respondedAt)
        )
    }

    static func map(detailsDTO: MatchRequestWithDetailsDTO) -> MatchRequestWithDetails {
        let request = MatchRequest(
            id: detailsDTO.id,
            matchIntentId: detailsDTO.matchIntentId,
            requesterId: detailsDTO.requesterId,
            receiverId: detailsDTO.receiverId,
            status: mapRequestStatus(detailsDTO.status),
            createdAt: parseDate(detailsDTO.createdAt) ?? Date(),
            respondedAt: parseDate(detailsDTO.respondedAt)
        )
        let intent = detailsDTO.matchIntent.map { map(intentDTO: $0) }
        let requester = detailsDTO.requester.map { map(userBriefDTO: $0) }
        return MatchRequestWithDetails(request: request, matchIntent: intent, requester: requester)
    }

    static func map(detailsDTOs: [MatchRequestWithDetailsDTO]) -> [MatchRequestWithDetails] {
        detailsDTOs.map { map(detailsDTO: $0) }
    }

    // MARK: - Swipe

    static func map(swipeResponseDTO: SwipeMatchIntentResponseDTO) -> SwipeResult {
        let request = swipeResponseDTO.request.map { map(requestDTO: $0) }
        return SwipeResult(matchRequest: request, message: swipeResponseDTO.message)
    }

    // MARK: - Accept

    static func map(acceptResponseDTO: AcceptMatchRequestResponseDTO) -> AcceptMatchRequestResult {
        let match = acceptResponseDTO.match.map { MatchMapper.map(matchDTO: $0) }
        let request = acceptResponseDTO.request.map { map(requestDTO: $0) }
        let requester = acceptResponseDTO.requester.map { map(userContactDTO: $0) }
        return AcceptMatchRequestResult(
            match: match,
            request: request,
            requester: requester,
            conversationId: acceptResponseDTO.conversationId,
            message: acceptResponseDTO.message
        )
    }

    // MARK: - Reject

    static func map(rejectResponseDTO: RejectMatchRequestResponseDTO) -> RejectMatchRequestResult {
        let request = rejectResponseDTO.request.map { map(requestDTO: $0) }
        return RejectMatchRequestResult(request: request, message: rejectResponseDTO.message)
    }
}
