//
//  ChatView.swift
//  AceClub
//
//  Created by Nicolas Becharat on 01/02/2026.
//

import SwiftUI

struct ChatView: View {

    @StateObject private var viewModel: ChatViewModel
    @ObservedObject private var wsManager = WebSocketManager.shared
    @State private var messageText = ""

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
                TypingIndicatorView()
                    .padding(.horizontal, Theme.paddingHorizontal)
                    .padding(.vertical, 4)
                    .transition(.move(edge: .bottom).combined(with: .opacity))
            }

            // Input bar
            ChatBottomBar(
                message: $messageText,
                sendMessage: {
                    let text = messageText
                    messageText = ""
                    Task { await viewModel.sendMessage(text) }
                },
                onRecordingStart: {
                    AudioRecorderManager.shared.startRecording()
                },
                onRecordingFinished: { discarded in
                    if discarded {
                        AudioRecorderManager.shared.cancelRecording()
                    } else {
                        if let result = AudioRecorderManager.shared.stopRecording() {
                            let (url, duration) = result
                            if let data = try? Data(contentsOf: url) {
                                Task { await viewModel.sendVoiceMessage(data, duration: duration) }
                            }
                            try? FileManager.default.removeItem(at: url)
                        }
                    }
                },
                onSendImage: { data, size in
                    Task { await viewModel.sendImageMessage(data, size: size) }
                },
                onTyping: {
                    viewModel.sendTypingIndicator()
                }
            )
            .padding(.horizontal, 15)
            .padding(.bottom, 12)
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

                        VStack(alignment: .leading, spacing: 1) {
                            Text(viewModel.conversation.displayName)
                                .font(.headline)
                                .foregroundStyle(Theme.labelPrimary)

                            if !wsManager.isConnected {
                                HStack(spacing: 4) {
                                    if wsManager.connectionState == .reconnecting || wsManager.connectionState == .connecting {
                                        ProgressView()
                                            .controlSize(.mini)
                                            .tint(Theme.labelTertiary)
                                    } else {
                                        Circle()
                                            .fill(Theme.labelTertiary)
                                            .frame(width: 6, height: 6)
                                    }

                                    Text(wsManager.connectionState == .reconnecting || wsManager.connectionState == .connecting
                                         ? "Reconnexion..."
                                         : "Vous etes hors ligne")
                                        .font(.caption2)
                                        .foregroundStyle(Theme.labelTertiary)
                                }
                            }
                        }

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
                UserProfileSheet(profile: participant) {
                    AnyView(
                        VStack(spacing: 12) {
                            Button {
                                viewModel.toggleMute()
                            } label: {
                                Label(
                                    viewModel.conversation.isMuted ? "Reactiver" : "Mettre en sourdine",
                                    systemImage: viewModel.conversation.isMuted ? "bell.fill" : "bell.slash.fill"
                                )
                            }
                            .buttonStyle(.appSecondary)

                            Button {
                                showProfileSheet = false
                                Task {
                                    await viewModel.deleteConversation()
                                }
                            } label: {
                                Label("Supprimer la conversation", systemImage: "trash")
                            }
                            .buttonStyle(.appDestructiveOutlined)
                        }
                    )
                }
                .presentationDetents([.medium, .large])
                .presentationDragIndicator(.visible)
            }
        }
        .task {
            await viewModel.loadMessages()
            await WebSocketManager.shared.connect()
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
                LazyVStack(spacing: 6) {
                    if viewModel.hasMoreMessages && !viewModel.messages.isEmpty {
                        ProgressView()
                            .tint(Theme.tintColor)
                            .onAppear {
                                Task { await viewModel.loadMoreMessages() }
                            }
                    }

                    let reversed = Array(viewModel.messages.reversed())
                    ForEach(Array(reversed.enumerated()), id: \.element.id) { index, message in
                        let isLast = index == reversed.count - 1
                        let showTime: Bool = {
                            if isLast { return true }
                            let next = reversed[index + 1]
                            return next.createdAt.timeIntervalSince(message.createdAt) > 300
                        }()

                        MessageBubble(message: message, showTime: showTime) {
                            Task {
                                await viewModel.retryFailedMessage(message)
                            }
                        } onDelete: {
                            Task {
                                await viewModel.deleteMessage(message)
                            }
                        }
                        .id(message.id)
                        .transition(.asymmetric(
                            insertion: .move(edge: .bottom).combined(with: .opacity),
                            removal: .opacity
                        ))
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
            }
            .defaultScrollAnchor(.bottom)
            .scrollDismissesKeyboard(.interactively)
            .background(Theme.primaryBackground)
        }
    }
}

// MARK: - Message Bubble

struct MessageBubble: View {

    let message: Message
    var showTime: Bool = true
    let onRetry: () -> Void
    let onDelete: () -> Void

    var body: some View {
        HStack(alignment: .bottom, spacing: 6) {
            if message.isFromMe { Spacer(minLength: 50) }

            VStack(alignment: message.isFromMe ? .trailing : .leading, spacing: 2) {
                // Message content by type
                messageContent
                    .background(bubbleBackground)
                    .clipShape(bubbleShape)
                    .contextMenu {
                        if message.type == .text {
                            Button {
                                UIPasteboard.general.string = message.content
                            } label: {
                                Label("Copier", systemImage: "doc.on.doc")
                            }
                        }

                        if message.isFromMe && message.sendStatus == .sent {
                            Button(role: .destructive) {
                                onDelete()
                            } label: {
                                Label("Supprimer", systemImage: "trash")
                            }
                        }
                    } preview: {
                        messageContent
                            .background(bubbleBackground)
                            .clipShape(bubbleShape)
                    }

                // Status row
                if showTime {
                    HStack(spacing: 4) {
                        Text(message.formattedTime)
                            .font(.caption2)
                            .foregroundStyle(Theme.labelSecondary)

                        if message.isFromMe {
                            statusIcon
                                .contentTransition(.symbolEffect(.replace))
                        }
                    }
                }
            }

            if !message.isFromMe { Spacer(minLength: 50) }
        }
        .padding(.vertical, 1)
    }

    // MARK: - Message Content

    @ViewBuilder
    private var messageContent: some View {
        switch message.type {
        case .text:
            Text(message.content)
                .font(.body)
                .padding(.horizontal, 14)
                .padding(.vertical, 10)
                .foregroundStyle(message.isFromMe ? .white : Theme.labelPrimary)

        case .voice:
            VoiceMessageContent(message: message)

        case .image:
            ImageMessageContent(message: message)
                .padding(3)
        }
    }

    // MARK: - Bubble Shape & Background

    private var bubbleBackground: some View {
        Group {
            if message.isFromMe {
                Theme.accentGreen
            } else {
                Color(.systemGray5)
            }
        }
    }

    private var isShortMessage: Bool {
        message.type == .text && !message.content.contains("\n") && message.content.count <= 40
    }

    private var bubbleShape: UnevenRoundedRectangle {
        let tail: CGFloat = isShortMessage ? 4 : 18
        if message.isFromMe {
            return UnevenRoundedRectangle(
                topLeadingRadius: 18,
                bottomLeadingRadius: 18,
                bottomTrailingRadius: tail,
                topTrailingRadius: 18
            )
        } else {
            return UnevenRoundedRectangle(
                topLeadingRadius: 18,
                bottomLeadingRadius: tail,
                bottomTrailingRadius: 18,
                topTrailingRadius: 18
            )
        }
    }

    // MARK: - Status Icon

    @ViewBuilder
    private var statusIcon: some View {
        switch message.sendStatus {
        case .sending:
            Image(systemName: "clock")
                .font(.caption2)
                .foregroundStyle(Theme.labelSecondary)
        case .sent:
            Image(systemName: "checkmark")
                .font(.caption2)
                .foregroundStyle(Theme.labelSecondary)
        case .read:
            HStack(spacing: -3) {
                Image(systemName: "checkmark")
                Image(systemName: "checkmark")
            }
            .font(.caption2)
            .foregroundStyle(Theme.accentGreen)
        case .failed:
            Button {
                onRetry()
            } label: {
                HStack(spacing: 2) {
                    Image(systemName: "exclamationmark.circle.fill")
                        .foregroundStyle(.red)
                    Text("Reessayer")
                        .foregroundStyle(.red)
                }
                .font(.caption2)
            }
        }
    }
}

