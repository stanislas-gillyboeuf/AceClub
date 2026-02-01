//
//  SendMessageUseCase.swift
//  AceClub
//
//  Created by Nicolas Becharat on 01/02/2026.
//

import Foundation

class SendMessageUseCase {

    private let conversationRepository = ConversationRepository()

    func execute(
        conversationId: String,
        content: String,
        clientMessageId: String = UUID().uuidString
    ) async throws -> Message {
        return try await conversationRepository.sendMessage(
            conversationId: conversationId,
            content: content,
            clientMessageId: clientMessageId
        )
    }
}
