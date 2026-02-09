//
//  NewConversationViewModel.swift
//  AceClub
//
//  Created by Nicolas Becharat on 09/02/2026.
//

import Foundation
import Combine

@MainActor
class NewConversationViewModel: ObservableObject {

    @Published var members: [Member] = []
    @Published var isLoading = false
    @Published var isCreating = false
    @Published var errorMessage: String?

    private let organizationRepository: OrganizationRepository
    private let conversationRepository: ConversationRepository

    init(
        organizationRepository: OrganizationRepository = OrganizationRepository(),
        conversationRepository: ConversationRepository = ConversationRepository()
    ) {
        self.organizationRepository = organizationRepository
        self.conversationRepository = conversationRepository
    }

    func loadMembers(currentUserId: String) async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            let result = try await organizationRepository.listMembers()
            members = result.members.filter { member in
                member.userId != currentUserId && member.user != nil
            }
        } catch {
            errorMessage = "Impossible de charger les membres: \(error.localizedDescription)"
        }
    }

    func startConversation(with member: Member) async -> Conversation? {
        isCreating = true
        defer { isCreating = false }

        do {
            let result = try await conversationRepository.findOrCreateConversation(participantId: member.userId)
            let conversation = try await conversationRepository.getConversation(id: result.conversationId)
            return conversation
        } catch {
            errorMessage = "Impossible de créer la conversation: \(error.localizedDescription)"
            return nil
        }
    }
}
