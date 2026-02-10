//
//  DeleteMessageUseCase.swift
//  AceClub
//
//  Created by Claude on 10/02/2026.
//

import Foundation

class DeleteMessageUseCase {

    private let conversationRepository = ConversationRepository()

    func execute(conversationId: String, messageId: String) async throws {
        try await conversationRepository.deleteMessage(conversationId: conversationId, messageId: messageId)
    }
}
