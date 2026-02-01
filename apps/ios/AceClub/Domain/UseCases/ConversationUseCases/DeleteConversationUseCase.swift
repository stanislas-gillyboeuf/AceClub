//
//  DeleteConversationUseCase.swift
//  AceClub
//
//  Created by Nicolas Becharat on 01/02/2026.
//

import Foundation

class DeleteConversationUseCase {

    private let conversationRepository = ConversationRepository()

    func execute(conversationId: String) async throws {
        try await conversationRepository.deleteConversation(conversationId: conversationId)
    }
}
