//
//  UploadChatAttachmentUseCase.swift
//  AceClub
//

import Foundation

class UploadChatAttachmentUseCase {

    private let conversationRepository = ConversationRepository()

    func execute(
        conversationId: String,
        fileData: Data,
        fileName: String,
        mimeType: String
    ) async throws -> String {
        return try await conversationRepository.uploadAttachment(
            conversationId: conversationId,
            fileData: fileData,
            fileName: fileName,
            mimeType: mimeType
        )
    }
}
