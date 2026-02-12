//
//  ChatViewModel.swift
//  AceClub
//

import Foundation
import Combine

@MainActor
class ChatViewModel: ObservableObject {

    // MARK: - Published Properties

    @Published var messages: [Message] = []
    @Published var isLoading = false
    @Published var isSending = false
    @Published var errorMessage: String?
    @Published var isOtherUserTyping = false
    @Published var hasMoreMessages = true

    // MARK: - Properties

    let conversation: Conversation

    // MARK: - Private Properties

    private let listMessagesUseCase = ListMessagesUseCase()
    private let sendMessageUseCase = SendMessageUseCase()
    private let deleteMessageUseCase = DeleteMessageUseCase()
    private let markReadUseCase = MarkConversationReadUseCase()
    private let e2eeRepository = E2EERepository()
    private var cancellables = Set<AnyCancellable>()
    private var typingTimer: Timer?
    private var participantPublicKey: String?

    // MARK: - Init

    init(conversation: Conversation) {
        self.conversation = conversation
        setupWebSocketListener()
    }

    // MARK: - Public Methods

    func loadMessages() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            // Pre-fetch the other participant's public key for decryption
            await prefetchParticipantPublicKey()

            let loadedMessages = try await listMessagesUseCase.execute(conversationId: conversation.id)
            messages = loadedMessages.map { decryptMessageIfNeeded($0) }
            // If we loaded fewer than the default limit, there are no more messages
            hasMoreMessages = loadedMessages.count >= 50
            // Mark as read when loading
            try? await markReadUseCase.execute(conversationId: conversation.id)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func loadMoreMessages() async {
        guard hasMoreMessages, !isLoading, let oldestMessage = messages.last else { return }

        isLoading = true
        defer { isLoading = false }

        do {
            let olderMessages = try await listMessagesUseCase.execute(
                conversationId: conversation.id,
                before: oldestMessage.createdAt,
                limit: 50
            )

            if olderMessages.isEmpty {
                hasMoreMessages = false
            } else {
                messages.append(contentsOf: olderMessages.map { decryptMessageIfNeeded($0) })
            }
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func sendMessage(_ content: String) async {
        let trimmedContent = content.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmedContent.isEmpty else { return }

        let clientMessageId = UUID().uuidString

        // Optimistic update - show plaintext to sender
        let optimisticMessage = Message(
            id: clientMessageId,
            conversationId: conversation.id,
            sender: MessageSender(id: "", name: "Moi", image: nil),
            content: trimmedContent,
            createdAt: Date(),
            clientMessageId: clientMessageId,
            isFromMe: true,
            sendStatus: .sending
        )
        messages.insert(optimisticMessage, at: 0)

        isSending = true
        defer { isSending = false }

        do {
            let sentMessage = try await sendMessageUseCase.execute(
                conversationId: conversation.id,
                content: trimmedContent,
                clientMessageId: clientMessageId,
                conversationType: conversation.type,
                otherParticipantId: conversation.otherParticipants.first?.userId
            )

            // Replace optimistic message with real one (decrypt if needed for display)
            if let index = messages.firstIndex(where: { $0.clientMessageId == clientMessageId }) {
                // The sent message content may be encrypted, but we already show the plaintext optimistically
                // Replace but keep the original plaintext content for display
                var displayMessage = sentMessage
                if sentMessage.isEncrypted {
                    displayMessage = Message(
                        id: sentMessage.id,
                        conversationId: sentMessage.conversationId,
                        sender: sentMessage.sender,
                        content: trimmedContent,
                        createdAt: sentMessage.createdAt,
                        clientMessageId: sentMessage.clientMessageId,
                        isFromMe: sentMessage.isFromMe,
                        isEncrypted: sentMessage.isEncrypted,
                        sendStatus: .sent
                    )
                }
                messages[index] = displayMessage
            }
        } catch {
            // Mark as failed
            if let index = messages.firstIndex(where: { $0.clientMessageId == clientMessageId }) {
                messages[index].sendStatus = .failed
            }
            errorMessage = error.localizedDescription
        }
    }

    func sendTypingIndicator() {
        WebSocketManager.shared.sendTypingIndicator(conversationId: conversation.id)
    }

    func deleteMessage(_ message: Message) async {
        // Optimistic removal from UI
        messages.removeAll { $0.id == message.id }

        do {
            try await deleteMessageUseCase.execute(
                conversationId: conversation.id,
                messageId: message.id
            )
        } catch {
            // Restore message on failure
            messages.insert(message, at: 0)
            messages.sort { $0.createdAt > $1.createdAt }
            errorMessage = error.localizedDescription
        }
    }

    func retryFailedMessage(_ message: Message) async {
        guard message.sendStatus == .failed else { return }

        // Remove the failed message
        messages.removeAll { $0.id == message.id }

        // Resend
        await sendMessage(message.content)
    }

    // MARK: - E2EE Helpers

    private func prefetchParticipantPublicKey() async {
        guard participantPublicKey == nil,
              (conversation.type == .direct || conversation.type == .match),
              let otherUserId = conversation.otherParticipants.first?.userId else { return }

        participantPublicKey = try? await e2eeRepository.getPublicKey(userId: otherUserId)
    }

    private func decryptMessageIfNeeded(_ message: Message) -> Message {
        guard message.isEncrypted, !message.content.isEmpty else { return message }

        do {
            guard let theirPublicKey = message.isFromMe ? participantPublicKey : participantPublicKey else {
                return makeUndecryptableMessage(message)
            }

            // For messages from me, we need the other participant's key
            // For messages from them, we also need their key (ECDH is symmetric)
            let key = try E2EEManager.shared.deriveConversationKey(
                theirPublicKeyBase64: theirPublicKey,
                conversationId: message.conversationId
            )
            let decrypted = try E2EEManager.shared.decryptMessage(message.content, withKey: key)

            return Message(
                id: message.id,
                conversationId: message.conversationId,
                sender: message.sender,
                content: decrypted,
                createdAt: message.createdAt,
                clientMessageId: message.clientMessageId,
                isFromMe: message.isFromMe,
                isEncrypted: message.isEncrypted,
                sendStatus: message.sendStatus
            )
        } catch {
            return makeUndecryptableMessage(message)
        }
    }

    private func makeUndecryptableMessage(_ message: Message) -> Message {
        Message(
            id: message.id,
            conversationId: message.conversationId,
            sender: message.sender,
            content: String(localized: "[Message chiffré - impossible à déchiffrer]"),
            createdAt: message.createdAt,
            clientMessageId: message.clientMessageId,
            isFromMe: message.isFromMe,
            isEncrypted: message.isEncrypted,
            sendStatus: message.sendStatus
        )
    }

    // MARK: - Private Methods

    private func setupWebSocketListener() {
        WebSocketManager.shared.events
            .receive(on: DispatchQueue.main)
            .sink { [weak self] event in
                self?.handleWebSocketEvent(event)
            }
            .store(in: &cancellables)
    }

    private func handleWebSocketEvent(_ event: WebSocketEvent) {
        switch event {
        case .reconnected:
            // WebSocket reconnected after a drop — catch up on missed messages and retry failed sends
            Task { [weak self] in
                await self?.fetchMissedMessages()
                await self?.retryPendingMessages()
            }

        case .newMessage(let messageDTO):
            guard messageDTO.conversationId == conversation.id else { return }

            // Dedup by clientMessageId (optimistic update) or by message id (already loaded)
            if let clientId = messageDTO.clientMessageId,
               messages.contains(where: { $0.clientMessageId == clientId }) {
                return
            }
            if messages.contains(where: { $0.id == messageDTO.id }) {
                return
            }

            var message = ConversationMapper.map(messageDTO: messageDTO)
            message = decryptMessageIfNeeded(message)
            messages.insert(message, at: 0)

            // Mark as read immediately since we're viewing
            Task {
                try? await markReadUseCase.execute(conversationId: conversation.id)
            }

        case .typing(let conversationId, let userId):
            guard conversationId == self.conversation.id else { return }

            let isOtherUser = conversation.otherParticipants.contains { $0.userId == userId }
            guard isOtherUser else { return }

            isOtherUserTyping = true

            typingTimer?.invalidate()
            typingTimer = Timer.scheduledTimer(withTimeInterval: 3.0, repeats: false) { [weak self] _ in
                Task { @MainActor in
                    self?.isOtherUserTyping = false
                }
            }

        case .messageRead(let conversationId, _):
            guard conversationId == self.conversation.id else { return }

            // Mark all my sent messages as read
            for i in messages.indices where messages[i].isFromMe && messages[i].sendStatus == .sent {
                messages[i].sendStatus = .read
            }

        default:
            break
        }
    }

    /// Silently fetches recent messages and merges any missed during a WebSocket disconnection.
    private func fetchMissedMessages() async {
        guard !messages.isEmpty else { return }

        do {
            let recentMessages = try await listMessagesUseCase.execute(conversationId: conversation.id)
            let existingIds = Set(messages.map(\.id))

            let newMessages = recentMessages
                .filter { !existingIds.contains($0.id) }
                .map { decryptMessageIfNeeded($0) }

            guard !newMessages.isEmpty else { return }

            messages.insert(contentsOf: newMessages, at: 0)
            messages.sort { $0.createdAt > $1.createdAt }

            try? await markReadUseCase.execute(conversationId: conversation.id)
        } catch {
            // Silent — not critical
        }
    }

    /// Automatically retries all failed messages after reconnection.
    private func retryPendingMessages() async {
        let failedMessages = messages.filter { $0.sendStatus == .failed && $0.isFromMe }
        for message in failedMessages {
            await retryFailedMessage(message)
        }
    }
}
