//
//  ListConversationsUseCase.swift
//  AceClub
//
//  Created by Nicolas Becharat on 01/02/2026.
//

import Foundation

class ListConversationsUseCase {

    private let conversationRepository = ConversationRepository()

    func execute() async throws -> [Conversation] {
        return try await conversationRepository.listConversations()
    }
}
