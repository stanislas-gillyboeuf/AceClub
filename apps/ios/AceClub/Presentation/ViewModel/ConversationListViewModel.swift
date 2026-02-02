//
//  ConversationListViewModel.swift
//  AceClub
//
//  Created by Nicolas Becharat on 01/02/2026.
//

import Foundation
import Combine

@MainActor
class ConversationListViewModel: ObservableObject {

    // MARK: - Published Properties

    @Published var conversations: [Conversation] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var totalUnreadCount = 0

    // MARK: - Private Properties

    private let listConversationsUseCase = ListConversationsUseCase()
    private let deleteConversationUseCase = DeleteConversationUseCase()
    private var cancellables = Set<AnyCancellable>()
    private var isLoadingInProgress = false

    // MARK: - Init

    init() {
        setupWebSocketListener()
    }

    // MARK: - Public Methods

    func loadConversations(force: Bool = false) async {
        guard !isLoadingInProgress || force else { return }

        isLoadingInProgress = true
        isLoading = conversations.isEmpty
        errorMessage = nil
        defer {
            isLoading = false
            isLoadingInProgress = false
        }

        do {
            conversations = try await listConversationsUseCase.execute()
            totalUnreadCount = conversations.reduce(0) { $0 + $1.unreadCount }
        } catch let error as URLError where error.code == .cancelled {
            // Request was cancelled, ignore silently
        } catch is CancellationError {
            // Task was cancelled, ignore silently
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func loadConversationsIfNeeded() async {
        guard conversations.isEmpty, !isLoadingInProgress else { return }
        await loadConversations()
    }

    func deleteConversation(at offsets: IndexSet) async {
        for index in offsets {
            let conversation = conversations[index]
            do {
                try await deleteConversationUseCase.execute(conversationId: conversation.id)
                conversations.remove(at: index)
            } catch {
                errorMessage = error.localizedDescription
            }
        }
    }

    func deleteConversation(_ conversation: Conversation) async {
        do {
            try await deleteConversationUseCase.execute(conversationId: conversation.id)
            conversations.removeAll { $0.id == conversation.id }
        } catch {
            errorMessage = error.localizedDescription
        }
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
            // Update the conversation list when a new message arrives
            if let index = conversations.firstIndex(where: { $0.id == messageDTO.conversationId }) {
                var updatedConversation = conversations[index]

                // Update last message info
                conversations[index] = Conversation(
                    id: updatedConversation.id,
                    name: updatedConversation.name,
                    type: updatedConversation.type,
                    lastMessageAt: Date(),
                    lastMessagePreview: messageDTO.content,
                    lastMessageSenderId: messageDTO.sender.id,
                    createdAt: updatedConversation.createdAt,
                    unreadCount: (messageDTO.isFromMe ?? false) ? updatedConversation.unreadCount : updatedConversation.unreadCount + 1,
                    isMuted: updatedConversation.isMuted,
                    otherParticipants: updatedConversation.otherParticipants
                )

                // Move to top
                let conversation = conversations.remove(at: index)
                conversations.insert(conversation, at: 0)

                // Update total unread count
                totalUnreadCount = conversations.reduce(0) { $0 + $1.unreadCount }
            } else {
                // New conversation, reload the list
                Task {
                    await loadConversations()
                }
            }

        default:
            break
        }
    }
}
