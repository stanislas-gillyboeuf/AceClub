//
//  ChatViewModel.swift
//  AceClub
//
//  Created by Nicolas Becharat on 01/02/2026.
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
    private let markReadUseCase = MarkConversationReadUseCase()
    private var cancellables = Set<AnyCancellable>()
    private var typingTimer: Timer?

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
            let loadedMessages = try await listMessagesUseCase.execute(conversationId: conversation.id)
            messages = loadedMessages
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
                messages.append(contentsOf: olderMessages)
            }
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func sendMessage(_ content: String) async {
        let trimmedContent = content.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmedContent.isEmpty else { return }

        let clientMessageId = UUID().uuidString

        // Optimistic update
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
                clientMessageId: clientMessageId
            )

            // Replace optimistic message with real one
            if let index = messages.firstIndex(where: { $0.clientMessageId == clientMessageId }) {
                messages[index] = sentMessage
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

    func retryFailedMessage(_ message: Message) async {
        guard message.sendStatus == .failed else { return }

        // Remove the failed message
        messages.removeAll { $0.id == message.id }

        // Resend
        await sendMessage(message.content)
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
        case .newMessage(let messageDTO):
            guard messageDTO.conversationId == conversation.id else { return }

            // Check if we already have this message (via clientMessageId)
            if let clientId = messageDTO.clientMessageId,
               messages.contains(where: { $0.clientMessageId == clientId }) {
                return
            }

            let message = ConversationMapper.map(messageDTO: messageDTO)
            messages.insert(message, at: 0)

            // Mark as read immediately since we're viewing
            Task {
                try? await markReadUseCase.execute(conversationId: conversation.id)
            }

        case .typing(let conversationId, let userId):
            guard conversationId == self.conversation.id else { return }

            // Check if it's from another user
            let isOtherUser = conversation.otherParticipants.contains { $0.userId == userId }
            guard isOtherUser else { return }

            isOtherUserTyping = true

            // Reset after 3 seconds
            typingTimer?.invalidate()
            typingTimer = Timer.scheduledTimer(withTimeInterval: 3.0, repeats: false) { [weak self] _ in
                Task { @MainActor in
                    self?.isOtherUserTyping = false
                }
            }

        default:
            break
        }
    }
}
