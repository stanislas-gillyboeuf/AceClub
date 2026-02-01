//
//  ListMessagesUseCase.swift
//  AceClub
//
//  Created by Nicolas Becharat on 01/02/2026.
//

import Foundation

class ListMessagesUseCase {

    private let conversationRepository = ConversationRepository()

    func execute(
        conversationId: String,
        before: Date? = nil,
        limit: Int = 50
    ) async throws -> [Message] {
        return try await conversationRepository.listMessages(
            conversationId: conversationId,
            before: before,
            limit: limit
        )
    }
}
