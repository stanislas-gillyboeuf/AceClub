//
//  SendMessageUseCase.swift
//  AceClub
//

import Foundation

class SendMessageUseCase {

    private let conversationRepository = ConversationRepository()
    private let e2eeRepository = E2EERepository()

    @MainActor
    func execute(
        conversationId: String,
        content: String,
        clientMessageId: String = UUID().uuidString,
        conversationType: ConversationType? = nil,
        otherParticipantId: String? = nil,
        type: MessageType = .text,
        attachmentUrl: String? = nil,
        attachmentDuration: Int? = nil,
        attachmentWidth: Int? = nil,
        attachmentHeight: Int? = nil
    ) async throws -> Message {
        // Only encrypt text messages
        let shouldEncrypt = type == .text
            && (conversationType == .direct || conversationType == .match)
            && E2EEManager.shared.hasKeyPair
            && otherParticipantId != nil

        if shouldEncrypt {
            do {
                let theirPublicKey = try await e2eeRepository.getPublicKey(userId: otherParticipantId!)
                let key = try E2EEManager.shared.deriveConversationKey(
                    theirPublicKeyBase64: theirPublicKey,
                    conversationId: conversationId
                )
                let encrypted = try E2EEManager.shared.encryptMessage(content, withKey: key)
                return try await conversationRepository.sendMessage(
                    conversationId: conversationId,
                    content: encrypted,
                    clientMessageId: clientMessageId,
                    isEncrypted: true,
                    type: type.rawValue,
                    attachmentUrl: attachmentUrl,
                    attachmentDuration: attachmentDuration,
                    attachmentWidth: attachmentWidth,
                    attachmentHeight: attachmentHeight
                )
            } catch is E2EEAPIDataSourceError {
                // Fallback: other user doesn't have E2EE keys (404), send in clear
                return try await conversationRepository.sendMessage(
                    conversationId: conversationId,
                    content: content,
                    clientMessageId: clientMessageId,
                    isEncrypted: false,
                    type: type.rawValue,
                    attachmentUrl: attachmentUrl,
                    attachmentDuration: attachmentDuration,
                    attachmentWidth: attachmentWidth,
                    attachmentHeight: attachmentHeight
                )
            }
        }

        return try await conversationRepository.sendMessage(
            conversationId: conversationId,
            content: content,
            clientMessageId: clientMessageId,
            isEncrypted: false,
            type: type.rawValue,
            attachmentUrl: attachmentUrl,
            attachmentDuration: attachmentDuration,
            attachmentWidth: attachmentWidth,
            attachmentHeight: attachmentHeight
        )
    }
}
