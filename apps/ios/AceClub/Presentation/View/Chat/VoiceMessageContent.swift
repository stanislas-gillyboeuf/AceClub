//
//  VoiceMessageContent.swift
//  AceClub
//

import SwiftUI

struct VoiceMessageContent: View {

    let message: Message
    @ObservedObject private var player = AudioPlayerManager.shared

    private var isCurrentlyPlaying: Bool {
        player.currentMessageId == message.id && player.isPlaying
    }

    private var isCurrentlyLoading: Bool {
        player.currentMessageId == message.id && player.isLoading
    }

    private var currentProgress: Double {
        player.currentMessageId == message.id ? player.progress : 0
    }

    var body: some View {
        HStack(spacing: 10) {
            Button {
                guard let url = message.attachmentURL else {
                    print("[VoiceMessage] No attachment URL for message \(message.id)")
                    return
                }
                print("[VoiceMessage] Toggle playback: \(url)")
                player.togglePlayback(url: url, messageId: message.id)
            } label: {
                if isCurrentlyLoading {
                    ProgressView()
                        .scaleEffect(0.8)
                        .tint(message.isFromMe ? .white : Theme.accentGreen)
                        .frame(width: 32, height: 32)
                } else {
                    Image(systemName: isCurrentlyPlaying ? "pause.fill" : "play.fill")
                        .font(.body.weight(.semibold))
                        .foregroundStyle(message.isFromMe ? .white : Theme.accentGreen)
                        .frame(width: 32, height: 32)
                        .contentTransition(.symbolEffect(.replace))
                }
            }

            WaveformView(
                messageId: message.id,
                progress: currentProgress,
                tintColor: message.isFromMe ? .white.opacity(0.9) : Theme.accentGreen
            )

            Text(message.formattedDuration)
                .font(.caption2.monospacedDigit())
                .foregroundStyle(message.isFromMe ? .white.opacity(0.8) : Theme.labelSecondary)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
    }
}
