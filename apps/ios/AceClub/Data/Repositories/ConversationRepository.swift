//
//  ConversationRepository.swift
//  AceClub
//
//  Created by Nicolas Becharat on 01/02/2026.
//

import Foundation

class ConversationRepository {

    private let conversationDataSource = ConversationAPIDataSource()

    // MARK: - List Conversations

    func listConversations() async throws -> [Conversation] {
        let conversationDTOs = try await conversationDataSource.listConversations()
        return ConversationMapper.map(conversationDTOs: conversationDTOs)
    }

    // MARK: - Get Conversation

    func getConversation(id: String) async throws -> Conversation {
        let conversationDTO = try await conversationDataSource.getConversation(id: id)
        return ConversationMapper.map(conversationDTO: conversationDTO)
    }

    // MARK: - List Messages

    func listMessages(
        conversationId: String,
        before: Date? = nil,
        limit: Int = 50
    ) async throws -> [Message] {
        let messageDTOs = try await conversationDataSource.listMessages(
            conversationId: conversationId,
            before: before,
            limit: limit
        )
        return ConversationMapper.map(messageDTOs: messageDTOs)
    }

    // MARK: - Send Message

    func sendMessage(
        conversationId: String,
        content: String,
        clientMessageId: String = UUID().uuidString
    ) async throws -> Message {
        let messageDTO = try await conversationDataSource.sendMessage(
            conversationId: conversationId,
            content: content,
            clientMessageId: clientMessageId
        )
        return ConversationMapper.map(messageDTO: messageDTO)
    }

    // MARK: - Mark Read

    func markRead(conversationId: String) async throws {
        try await conversationDataSource.markRead(conversationId: conversationId)
    }

    // MARK: - Delete Conversation

    func deleteConversation(conversationId: String) async throws {
        try await conversationDataSource.deleteConversation(conversationId: conversationId)
    }

    // MARK: - Mute Conversation

    func muteConversation(conversationId: String, isMuted: Bool) async throws {
        try await conversationDataSource.muteConversation(conversationId: conversationId, isMuted: isMuted)
    }
}
