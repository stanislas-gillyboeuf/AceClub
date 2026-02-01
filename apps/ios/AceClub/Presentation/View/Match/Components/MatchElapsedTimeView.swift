//
//  MatchElapsedTimeView.swift
//  AceClub
//
//  Chrono temps réel pour les matchs en cours - Style scoreboard moderne
//

import SwiftUI

struct MatchElapsedTimeView: View {
    let startedAt: Date

    @State private var elapsedTime: TimeInterval = 0
    @State private var timer: Timer?

    var body: some View {
        VStack(spacing: 12) {
            // Header
            HStack(spacing: 6) {
                Circle()
                    .fill(.red)
                    .frame(width: 8, height: 8)
                    .modifier(PulseAnimation())

                Text("En cours")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.red)
            }

            // Chrono principal
            HStack(spacing: 4) {
                Image(systemName: "timer")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundStyle(.secondary)

                Text(formattedElapsedTime)
                    .font(.system(size: 32, weight: .bold, design: .rounded))
                    .monospacedDigit()
                    .contentTransition(.numericText(value: elapsedTime))
            }

            // Label
            Text("Temps de jeu")
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
        .padding(Theme.paddingCard)
        .frame(maxWidth: .infinity)
        .background(Theme.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusLarge, style: .continuous))
        .onAppear {
            startTimer()
        }
        .onDisappear {
            stopTimer()
        }
    }

    // MARK: - Private

    private var formattedElapsedTime: String {
        let hours = Int(elapsedTime) / 3600
        let minutes = (Int(elapsedTime) % 3600) / 60
        let seconds = Int(elapsedTime) % 60

        if hours > 0 {
            return String(format: "%d:%02d:%02d", hours, minutes, seconds)
        } else {
            return String(format: "%02d:%02d", minutes, seconds)
        }
    }

    private func startTimer() {
        updateElapsedTime()
        timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { _ in
            withAnimation(.snappy(duration: 0.2)) {
                updateElapsedTime()
            }
        }
    }

    private func stopTimer() {
        timer?.invalidate()
        timer = nil
    }

    private func updateElapsedTime() {
        elapsedTime = Date().timeIntervalSince(startedAt)
    }
}

// MARK: - Pulse Animation Modifier

private struct PulseAnimation: ViewModifier {
    @State private var isPulsing = false

    func body(content: Content) -> some View {
        content
            .opacity(isPulsing ? 0.4 : 1.0)
            .animation(
                .easeInOut(duration: 0.8)
                .repeatForever(autoreverses: true),
                value: isPulsing
            )
            .onAppear {
                isPulsing = true
            }
    }
}

// MARK: - Preview

#Preview {
    VStack(spacing: 16) {
        // Chrono à 5 minutes
        MatchElapsedTimeView(startedAt: Date().addingTimeInterval(-300))

        // Chrono à 1h30
        MatchElapsedTimeView(startedAt: Date().addingTimeInterval(-5400))

        // Chrono à 2h15m30s
        MatchElapsedTimeView(startedAt: Date().addingTimeInterval(-8130))
    }
    .padding()
    .background(Theme.primaryBackground)
}
