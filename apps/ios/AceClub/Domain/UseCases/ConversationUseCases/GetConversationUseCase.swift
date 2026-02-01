//
//  GetConversationUseCase.swift
//  AceClub
//
//  Created by Nicolas Becharat on 01/02/2026.
//

import Foundation

class GetConversationUseCase {

    private let conversationRepository = ConversationRepository()

    func execute(conversationId: String) async throws -> Conversation {
        return try await conversationRepository.getConversation(id: conversationId)
    }
}
