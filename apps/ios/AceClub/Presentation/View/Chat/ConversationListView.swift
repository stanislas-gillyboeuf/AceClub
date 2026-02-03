//
//  ConversationListView.swift
//  AceClub
//
//  Created by Nicolas Becharat on 01/02/2026.
//

import SwiftUI

struct ConversationListView: View {

    @ObservedObject var viewModel: ConversationListViewModel
    @Environment(DeepLinkManager.self) private var deepLinkManager
    @State private var navigationPath = NavigationPath()

    var body: some View {
        NavigationStack(path: $navigationPath) {
            Group {
                if viewModel.isLoading && viewModel.conversations.isEmpty {
                    ProgressView()
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if viewModel.conversations.isEmpty {
                    emptyState
                } else {
                    conversationList
                }
            }
            .navigationTitle("Messages")
            .refreshable {
                await viewModel.loadConversations(force: true)
            }
            .onAppear {
                Task {
                    await viewModel.loadConversationsIfNeeded()
                    await WebSocketManager.shared.connect()
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
            .navigationDestination(for: Conversation.self) { conversation in
                ChatView(conversation: conversation)
            }
            .onChange(of: deepLinkManager.pendingConversationId) { _, conversationId in
                handleDeepLink(conversationId: conversationId)
            }
            .onAppear {
                if let conversationId = deepLinkManager.pendingConversationId {
                    handleDeepLink(conversationId: conversationId)
                }
            }
            .background(Theme.primaryBackground)
        }
    }

    private func handleDeepLink(conversationId: String?) {
        guard let conversationId else { return }

        if let conversation = viewModel.conversations.first(where: { $0.id == conversationId }) {
            navigationPath.append(conversation)
            deepLinkManager.pendingConversationId = nil
        }
    }

    // MARK: - Views

    private var emptyState: some View {
        ContentUnavailableView {
            Label("Aucune conversation", systemImage: "bubble.left.and.bubble.right")
        } description: {
            Text("Vos conversations avec vos adversaires apparaitront ici apres avoir cree un match.")
        }
    }

    private var conversationList: some View {
        ScrollView {
            LazyVStack(spacing: 12) {
                ForEach(viewModel.conversations) { conversation in
                    NavigationLink(value: conversation) {
                        ConversationRow(conversation: conversation)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal, Theme.paddingHorizontal)
            .padding(.top, 8)
        }
        .background(Theme.primaryBackground)
    }
}

// MARK: - Conversation Row

struct ConversationRow: View {

    let conversation: Conversation

    var body: some View {
        HStack(spacing: 14) {
            // Avatar
            avatarView

            // Content
            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text(conversation.displayName)
                        .font(.body.weight(.semibold))
                        .foregroundStyle(Theme.labelPrimary)
                        .lineLimit(1)

                    Spacer()

                    if let time = conversation.formattedLastMessageTime {
                        Text(time)
                            .font(.caption)
                            .foregroundStyle(Theme.labelSecondary)
                    }
                }

                HStack {
                    if let preview = conversation.lastMessagePreview {
                        Text(preview)
                            .font(.subheadline)
                            .foregroundStyle(Theme.labelSecondary)
                            .lineLimit(2)
                    }

                    Spacer()

                    if conversation.hasUnreadMessages {
                        unreadBadge
                    }

                    if conversation.isMuted {
                        Image(systemName: "bell.slash.fill")
                            .font(.caption)
                            .foregroundStyle(Theme.labelSecondary)
                    }
                }
            }

            Image(systemName: "chevron.right")
                .font(.caption.weight(.semibold))
                .foregroundStyle(Theme.labelSecondary)
        }
        .padding(Theme.paddingCard)
        .background(Theme.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous)
                .strokeBorder(Theme.borderColor, lineWidth: Theme.borderWidthSubtle)
        }
    }

    private var avatarView: some View {
        ZStack {
            if let imageURL = conversation.avatarURL,
               let url = URL(string: imageURL) {
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
        .frame(width: 54, height: 54)
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
                Text(String(conversation.displayName.prefix(1)).uppercased())
                    .font(.title3.weight(.semibold))
                    .foregroundStyle(Theme.labelSecondary)
            }
    }

    private var unreadBadge: some View {
        Text("\(conversation.unreadCount)")
            .font(.caption2.weight(.bold))
            .foregroundStyle(.white)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(Theme.tintColor)
            .clipShape(Capsule())
    }
}

#Preview {
    ConversationListView(viewModel: ConversationListViewModel())
}
