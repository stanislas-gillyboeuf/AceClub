//
//  NewConversationView.swift
//  AceClub
//
//  Created by Nicolas Becharat on 09/02/2026.
//

import SwiftUI

struct NewConversationView: View {

    let currentUserId: String
    let onConversationCreated: (Conversation) -> Void

    @Environment(\.dismiss) private var dismiss
    @StateObject private var viewModel = NewConversationViewModel()
    @State private var searchText = ""

    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading {
                    ProgressView()
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if filteredMembers.isEmpty {
                    emptyState
                } else {
                    memberList
                }
            }
            .navigationTitle("Nouvelle conversation")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Annuler") {
                        dismiss()
                    }
                }
            }
            .searchable(text: $searchText, prompt: "Rechercher un membre")
            .onAppear {
                Task {
                    await viewModel.loadMembers(currentUserId: currentUserId)
                }
            }
            .alert("Erreur", isPresented: .constant(viewModel.errorMessage != nil)) {
                Button("OK") {
                    viewModel.errorMessage = nil
                }
            } message: {
                if let error = viewModel.errorMessage {
                    Text(error)
                }
            }
            .overlay {
                if viewModel.isCreating {
                    Color.black.opacity(0.3)
                        .ignoresSafeArea()
                        .overlay {
                            ProgressView()
                                .tint(.white)
                                .scaleEffect(1.2)
                        }
                }
            }
            .disabled(viewModel.isCreating)
            .background(Theme.primaryBackground)
        }
    }

    private var filteredMembers: [Member] {
        if searchText.isEmpty {
            return viewModel.members
        }
        return viewModel.members.filter { member in
            guard let user = member.user else { return false }
            return user.displayName.localizedCaseInsensitiveContains(searchText)
        }
    }

    private var emptyState: some View {
        ContentUnavailableView {
            Label("Aucun membre", systemImage: "person.2")
        } description: {
            if searchText.isEmpty {
                Text("Aucun membre disponible pour demarrer une conversation.")
            } else {
                Text("Aucun membre ne correspond a votre recherche.")
            }
        }
    }

    private var memberList: some View {
        List {
            ForEach(filteredMembers) { member in
                Button {
                    Task {
                        await startConversation(with: member)
                    }
                } label: {
                    ConversationMemberRow(member: member)
                }
            }
        }
        .listStyle(.insetGrouped)
    }

    private func startConversation(with member: Member) async {
        guard let conversation = await viewModel.startConversation(with: member) else {
            return
        }

        dismiss()
        onConversationCreated(conversation)
    }
}

// MARK: - Conversation Member Row

private struct ConversationMemberRow: View {

    let member: Member

    private var user: User? { member.user }

    var body: some View {
        HStack(spacing: 14) {
            avatarView

            VStack(alignment: .leading, spacing: 4) {
                Text(user?.displayName ?? "Membre")
                    .font(.body.weight(.semibold))
                    .foregroundStyle(Theme.labelPrimary)
                    .lineLimit(1)

                Text(member.role.displayName)
                    .font(.subheadline)
                    .foregroundStyle(Theme.labelSecondary)
                    .lineLimit(1)
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.caption.weight(.semibold))
                .foregroundStyle(Theme.labelSecondary)
        }
    }

    private var avatarView: some View {
        ZStack {
            if let url = user?.imageURL {
                AsyncImage(url: url) { image in
                    image
                        .resizable()
                        .scaledToFill()
                } placeholder: {
                    placeholderAvatar
                }
            } else {
                placeholderAvatar
            }
        }
        .frame(width: 50, height: 50)
        .clipShape(Circle())
        .overlay {
            Circle()
                .strokeBorder(Theme.borderColor, lineWidth: Theme.borderWidthSubtle)
        }
    }

    private var placeholderAvatar: some View {
        Circle()
            .fill(Color(.tertiarySystemFill))
            .overlay {
                Text(user?.initials ?? "??")
                    .font(.title3.weight(.semibold))
                    .foregroundStyle(Theme.labelSecondary)
            }
    }
}

#Preview {
    NewConversationView(currentUserId: "preview-user") { _ in }
}
