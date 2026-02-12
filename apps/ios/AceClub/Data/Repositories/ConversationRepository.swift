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
        clientMessageId: String = UUID().uuidString,
        isEncrypted: Bool = false,
        type: String = "text",
        attachmentUrl: String? = nil,
        attachmentDuration: Int? = nil,
        attachmentWidth: Int? = nil,
        attachmentHeight: Int? = nil
    ) async throws -> Message {
        let messageDTO = try await conversationDataSource.sendMessage(
            conversationId: conversationId,
            content: content,
            clientMessageId: clientMessageId,
            isEncrypted: isEncrypted,
            type: type,
            attachmentUrl: attachmentUrl,
            attachmentDuration: attachmentDuration,
            attachmentWidth: attachmentWidth,
            attachmentHeight: attachmentHeight
        )
        return ConversationMapper.map(messageDTO: messageDTO)
    }

    // MARK: - Upload Attachment

    func uploadAttachment(
        conversationId: String,
        fileData: Data,
        fileName: String,
        mimeType: String
    ) async throws -> String {
        let response = try await conversationDataSource.uploadAttachment(
            conversationId: conversationId,
            fileData: fileData,
            fileName: fileName,
            mimeType: mimeType
        )
        return response.attachmentUrl
    }

    // MARK: - Mark Read

    func markRead(conversationId: String) async throws {
        try await conversationDataSource.markRead(conversationId: conversationId)
    }

    // MARK: - Delete Conversation

    func deleteConversation(conversationId: String) async throws {
        try await conversationDataSource.deleteConversation(conversationId: conversationId)
    }

    // MARK: - Delete Message

    func deleteMessage(conversationId: String, messageId: String) async throws {
        try await conversationDataSource.deleteMessage(conversationId: conversationId, messageId: messageId)
    }

    // MARK: - Mute Conversation

    func muteConversation(conversationId: String, isMuted: Bool) async throws {
        try await conversationDataSource.muteConversation(conversationId: conversationId, isMuted: isMuted)
    }

    // MARK: - Find Or Create Conversation

    func findOrCreateConversation(participantId: String) async throws -> (conversationId: String, created: Bool) {
        let response = try await conversationDataSource.findOrCreateConversation(participantId: participantId)
        return (conversationId: response.conversationId, created: response.created)
    }
}
