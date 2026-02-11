import SwiftUI

struct NextActivityCardView: View {
    let match: MatchModel
    let currentUserId: String
    let onStart: () -> Void
    let onFinish: () -> Void
    let onTap: () -> Void

    private var isScheduled: Bool { match.isScheduled }
    private var isOngoing: Bool { match.isOngoing }

    private var typeLabel: String {
        match.matchType == .training ? "Entraînement" : "Match"
    }

    private var typeIcon: String {
        match.matchType == .training ? "figure.run" : "sportscourt"
    }

    var body: some View {
        VStack(spacing: 0) {
            // Header ribbon
            headerRibbon
                .padding(.horizontal, 20)
                .padding(.top, 20)
                .padding(.bottom, 16)

            // Players + Score
            playersRow
                .padding(.horizontal, 20)
                .padding(.bottom, 16)

            // Context info
            contextInfo
                .padding(.horizontal, 20)
                .padding(.bottom, 16)

            // Divider
            Rectangle()
                .fill(Color.white.opacity(0.15))
                .frame(height: 0.5)

            // Action buttons
            actionButtons
                .padding(.horizontal, 20)
                .padding(.vertical, 14)
        }
        .background(cardGradient)
        .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusXLarge, style: .continuous))
        .shadow(color: accentColor.opacity(0.25), radius: 16, x: 0, y: 8)
        .onTapGesture { onTap() }
    }

    // MARK: - Header

    private var headerRibbon: some View {
        HStack {
            HStack(spacing: 8) {
                Image(systemName: typeIcon)
                    .font(.subheadline.weight(.semibold))

                Text(isOngoing ? "\(typeLabel) en cours" : "Prochain \(typeLabel.lowercased())")
                    .font(.subheadline.weight(.semibold))
            }
            .foregroundStyle(.white)

            Spacer()

            if isOngoing {
                liveBadge
            } else if let scheduledAt = match.scheduledAt {
                Text(formattedRelativeDate(scheduledAt))
                    .font(.caption.weight(.medium))
                    .foregroundStyle(.white.opacity(0.8))
                    .padding(.horizontal, 10)
                    .padding(.vertical, 4)
                    .background(.white.opacity(0.15))
                    .clipShape(Capsule())
            }
        }
    }

    private var liveBadge: some View {
        HStack(spacing: 6) {
            Circle()
                .fill(.white)
                .frame(width: 6, height: 6)
                .modifier(PulseAnimation())

            Text("LIVE")
                .font(.caption2.weight(.heavy))
                .foregroundStyle(.white)
                .tracking(1)
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 4)
        .background(.white.opacity(0.2))
        .clipShape(Capsule())
    }

    // MARK: - Players

    private var playersRow: some View {
        HStack(spacing: 0) {
            playerColumn(participant: match.homeParticipant)

            // Score or VS
            VStack(spacing: 4) {
                if isOngoing || !match.sets.isEmpty {
                    Text(match.formattedMatchScore)
                        .font(.system(size: 44, weight: .heavy, design: .rounded))
                        .foregroundStyle(.white)
                        .contentTransition(.numericText())

                    if !match.sets.isEmpty {
                        Text("SETS")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundStyle(.white.opacity(0.5))
                            .tracking(2)
                    }
                } else {
                    Text("VS")
                        .font(.system(size: 36, weight: .heavy, design: .rounded))
                        .foregroundStyle(.white.opacity(0.4))
                }
            }
            .frame(minWidth: 80)

            playerColumn(participant: match.awayParticipant)
        }
    }

    private func playerColumn(participant: MatchParticipantModel?) -> some View {
        VStack(spacing: 8) {
            participantAvatar(participant: participant, size: 56)

            Text(participant?.userName ?? "Joueur")
                .font(.footnote.weight(.semibold))
                .foregroundStyle(.white)
                .lineLimit(1)
        }
        .frame(maxWidth: .infinity)
    }

    @ViewBuilder
    private func participantAvatar(participant: MatchParticipantModel?, size: CGFloat) -> some View {
        if let imageURL = participant?.cacheBustedImageURL() {
            AsyncImage(url: imageURL) { phase in
                switch phase {
                case .success(let image):
                    image
                        .resizable()
                        .scaledToFill()
                        .frame(width: size, height: size)
                        .clipShape(Circle())
                        .overlay {
                            Circle()
                                .strokeBorder(.white.opacity(0.3), lineWidth: 2)
                        }
                default:
                    avatarPlaceholder(initials: participant?.userInitials ?? "?", size: size)
                }
            }
        } else {
            avatarPlaceholder(initials: participant?.userInitials ?? "?", size: size)
        }
    }

    private func avatarPlaceholder(initials: String, size: CGFloat) -> some View {
        Circle()
            .fill(.white.opacity(0.15))
            .frame(width: size, height: size)
            .overlay {
                Text(initials)
                    .font(.callout.weight(.semibold))
                    .foregroundStyle(.white.opacity(0.8))
            }
            .overlay {
                Circle()
                    .strokeBorder(.white.opacity(0.2), lineWidth: 2)
            }
    }

    // MARK: - Context

    @ViewBuilder
    private var contextInfo: some View {
        if isOngoing, let startedAt = match.startedAt {
            HStack(spacing: 6) {
                Image(systemName: "timer")
                    .font(.caption)
                Text("Depuis \(startedAt.formatted(date: .omitted, time: .shortened))")
                    .font(.footnote.weight(.medium))
            }
            .foregroundStyle(.white.opacity(0.7))
        } else if let scheduledAt = match.scheduledAt {
            HStack(spacing: 6) {
                Image(systemName: "calendar")
                    .font(.caption)
                Text(scheduledAt.formatted(date: .abbreviated, time: .shortened))
                    .font(.footnote.weight(.medium))
            }
            .foregroundStyle(.white.opacity(0.7))
        }
    }

    // MARK: - Actions

    private var actionButtons: some View {
        HStack(spacing: 12) {
            if isScheduled {
                Button(action: onStart) {
                    Label("Commencer", systemImage: "play.fill")
                        .font(.subheadline.weight(.semibold))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                }
                .foregroundStyle(accentColor)
                .background(.white)
                .clipShape(Capsule())
            }

            if isOngoing {
                Button(action: onTap) {
                    Label("Scores", systemImage: "pencil")
                        .font(.subheadline.weight(.semibold))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                }
                .foregroundStyle(.white)
                .background(.white.opacity(0.2))
                .clipShape(Capsule())

                Button(action: onFinish) {
                    Label("Terminer", systemImage: "checkmark")
                        .font(.subheadline.weight(.semibold))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                }
                .foregroundStyle(accentColor)
                .background(.white)
                .clipShape(Capsule())
            }
        }
    }

    // MARK: - Styling

    private var accentColor: Color {
        isOngoing ? Theme.accentOrange : Theme.accentGreen
    }

    private var cardGradient: some ShapeStyle {
        LinearGradient(
            colors: isOngoing
                ? [Theme.accentOrange, Theme.accentOrange.opacity(0.8)]
                : [Theme.accentGreen, Theme.accentGreen.opacity(0.8)],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }

    // MARK: - Helpers

    private func formattedRelativeDate(_ date: Date) -> String {
        let calendar = Calendar.current
        if calendar.isDateInToday(date) {
            return "Aujourd'hui \(date.formatted(date: .omitted, time: .shortened))"
        } else if calendar.isDateInTomorrow(date) {
            return "Demain \(date.formatted(date: .omitted, time: .shortened))"
        } else {
            let formatter = DateFormatter()
            formatter.locale = Locale(identifier: "fr_FR")
            formatter.dateFormat = "EEE d MMM"
            return formatter.string(from: date).capitalized
        }
    }
}

// MARK: - Pulse Animation

private struct PulseAnimation: ViewModifier {
    @State private var isPulsing = false

    func body(content: Content) -> some View {
        content
            .opacity(isPulsing ? 0.3 : 1.0)
            .animation(
                .easeInOut(duration: 1.0).repeatForever(autoreverses: true),
                value: isPulsing
            )
            .onAppear { isPulsing = true }
    }
}
