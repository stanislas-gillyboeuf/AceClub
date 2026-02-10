//
//  ChatView.swift
//  AceClub
//
//  Created by Nicolas Becharat on 01/02/2026.
//

import SwiftUI

struct ChatView: View {

    @StateObject private var viewModel: ChatViewModel
    @State private var messageText = ""
    @FocusState private var isInputFocused: Bool

    init(conversation: Conversation) {
        _viewModel = StateObject(wrappedValue: ChatViewModel(conversation: conversation))
    }

    @State private var showProfileSheet = false

    var body: some View {
        VStack(spacing: 0) {
            // Messages list (inverted)
            messagesScrollView

            // Typing indicator
            if viewModel.isOtherUserTyping {
                typingIndicator
            }

            Divider()

            // Input bar
            inputBar
        }
        .background(Theme.primaryBackground)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .principal) {
                Button {
                    showProfileSheet = true
                } label: {
                    HStack(spacing: 8) {
                        // Avatar
                        if let imageURL = viewModel.conversation.avatarURL,
                           let url = URL(string: imageURL) {
                            AsyncImage(url: url) { image in
                                image
                                    .resizable()
                                    .scaledToFill()
                            } placeholder: {
                                Circle()
                                    .fill(Color(.tertiarySystemFill))
                                    .overlay {
                                        Text(String(viewModel.conversation.displayName.prefix(1)).uppercased())
                                            .font(.caption.weight(.semibold))
                                            .foregroundStyle(Theme.labelSecondary)
                                    }
                            }
                            .frame(width: 32, height: 32)
                            .clipShape(Circle())
                        } else {
                            Circle()
                                .fill(Color(.tertiarySystemFill))
                                .frame(width: 32, height: 32)
                                .overlay {
                                    Text(String(viewModel.conversation.displayName.prefix(1)).uppercased())
                                        .font(.caption.weight(.semibold))
                                        .foregroundStyle(Theme.labelSecondary)
                                }
                        }

                        Text(viewModel.conversation.displayName)
                            .font(.headline)
                            .foregroundStyle(Theme.labelPrimary)

                        Image(systemName: "chevron.right")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(Theme.labelSecondary)
                    }
                }
                .buttonStyle(.plain)
            }
        }
        .sheet(isPresented: $showProfileSheet) {
            if let participant = viewModel.conversation.otherParticipants.first {
                UserProfileSheet(profile: participant)
                    .presentationDetents([.medium, .large])
                    .presentationDragIndicator(.visible)
            }
        }
        .task {
            await viewModel.loadMessages()
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
    }

    // MARK: - Views

    private var messagesScrollView: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(spacing: 12) {
                    ForEach(viewModel.messages) { message in
                        MessageBubble(message: message) {
                            Task {
                                await viewModel.retryFailedMessage(message)
                            }
                        }
                        .id(message.id)
                        .rotationEffect(.degrees(180))
                    }

                    if viewModel.hasMoreMessages && !viewModel.messages.isEmpty {
                        ProgressView()
                            .tint(Theme.tintColor)
                            .onAppear {
                                Task { await viewModel.loadMoreMessages() }
                            }
                            .rotationEffect(.degrees(180))
                    }
                }
                .padding(.horizontal, Theme.paddingHorizontal)
                .padding(.vertical, 12)
            }
            .rotationEffect(.degrees(180))
            .background(Theme.primaryBackground)
        }
    }

    private var typingIndicator: some View {
        HStack {
            Text("\(viewModel.conversation.displayName) est en train d'ecrire...")
                .font(.caption)
                .foregroundStyle(.secondary)
                .italic()
            Spacer()
        }
        .padding(.horizontal)
        .padding(.vertical, 4)
    }

    private var inputBar: some View {
        HStack(spacing: 12) {
            TextField("Message...", text: $messageText, axis: .vertical)
                .textFieldStyle(.plain)
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
                .background(Theme.cardBackground)
                .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
                .overlay {
                    RoundedRectangle(cornerRadius: 20, style: .continuous)
                        .strokeBorder(Theme.borderColor, lineWidth: Theme.borderWidthSubtle)
                }
                .focused($isInputFocused)
                .lineLimit(1...5)
                .onChange(of: messageText) { _, _ in
                    viewModel.sendTypingIndicator()
                }

            Button {
                Task {
                    let text = messageText
                    messageText = ""
                    await viewModel.sendMessage(text)
                }
            } label: {
                Image(systemName: "arrow.up.circle.fill")
                    .font(.system(size: 32))
                    .foregroundStyle(
                        messageText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || viewModel.isSending
                        ? Theme.labelSecondary.opacity(0.5)
                        : Theme.tintColor
                    )
            }
            .disabled(messageText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || viewModel.isSending)
        }
        .padding(.horizontal, Theme.paddingHorizontal)
        .padding(.vertical, 12)
        .background(.ultraThinMaterial)
    }
}

// MARK: - Message Bubble

struct MessageBubble: View {

    let message: Message
    let onRetry: () -> Void

    var body: some View {
        HStack(alignment: .bottom, spacing: 8) {
            if message.isFromMe { Spacer(minLength: 60) }

            VStack(alignment: message.isFromMe ? .trailing : .leading, spacing: 4) {
                // Message content
                Text(message.content)
                    .font(.body)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 10)
                    .background(
                        message.isFromMe
                            ? AnyShapeStyle(Theme.tintColor)
                            : AnyShapeStyle(Theme.cardBackground)
                    )
                    .foregroundStyle(message.isFromMe ? .white : Theme.labelPrimary)
                    .clipShape(
                        RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous)
                    )
                    .overlay {
                        if !message.isFromMe {
                            RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous)
                                .strokeBorder(Theme.borderColor, lineWidth: Theme.borderWidthSubtle)
                        }
                    }

                // Status row
                HStack(spacing: 4) {
                    Text(message.formattedTime)
                        .font(.caption2)
                        .foregroundStyle(Theme.labelSecondary)

                    if message.isFromMe {
                        statusIcon
                    }
                }
            }

            if !message.isFromMe { Spacer(minLength: 60) }
        }
    }

    @ViewBuilder
    private var statusIcon: some View {
        switch message.sendStatus {
        case .sending:
            ProgressView()
                .scaleEffect(0.5)
                .tint(Theme.labelSecondary)
        case .sent:
            Image(systemName: "checkmark")
                .font(.caption2)
                .foregroundStyle(Theme.labelSecondary)
        case .failed:
            Button {
                onRetry()
            } label: {
                HStack(spacing: 2) {
                    Image(systemName: "exclamationmark.circle.fill")
                        .foregroundStyle(.red)
                    Text("Réessayer")
                        .foregroundStyle(.red)
                }
                .font(.caption2)
            }
        }
    }
}

