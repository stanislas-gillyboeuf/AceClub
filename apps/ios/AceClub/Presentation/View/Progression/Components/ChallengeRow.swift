import SwiftUI

struct ChallengeRow: View {
    let challenge: Challenge

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(challenge.title)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(.primary)

                    Text(challenge.description)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(2)
                }

                Spacer()

                acesBadge
            }

            HStack(spacing: 12) {
                GeometryReader { geometry in
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 4)
                            .fill(Color(.systemGray5))
                            .frame(height: 8)

                        RoundedRectangle(cornerRadius: 4)
                            .fill(progressColor)
                            .frame(width: geometry.size.width * challenge.progressPercent, height: 8)
                    }
                }
                .frame(height: 8)

                Text(challenge.formattedProgress)
                    .font(.caption.weight(.medium))
                    .foregroundStyle(.secondary)
                    .frame(minWidth: 40, alignment: .trailing)
            }

            HStack {
                Label(challenge.type.displayName, systemImage: challenge.type.icon)
                    .font(.caption2)
                    .foregroundStyle(.secondary)

                Spacer()

                if challenge.status == .completed {
                    Label("Terminé", systemImage: "checkmark.circle.fill")
                        .font(.caption2.weight(.medium))
                        .foregroundStyle(.green)
                } else if let timeRemaining = challenge.timeRemaining {
                    Text(timeRemaining)
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }
        }
        .padding(Theme.paddingCard)
        .background(Theme.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous)
                .strokeBorder(Theme.borderColor, lineWidth: Theme.borderWidthSubtle)
        }
        .opacity(challenge.status == .completed ? 0.7 : 1.0)
    }

    private var acesBadge: some View {
        Text(challenge.formattedAcesReward)
            .font(.caption.weight(.bold))
            .foregroundStyle(Theme.tintColor)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(Theme.tintColor.opacity(0.1))
            .clipShape(Capsule())
    }

    private var progressColor: Color {
        switch challenge.status {
        case .completed: return .green
        case .active: return Theme.tintColor
        case .expired: return .gray
        }
    }
}

#Preview {
    VStack(spacing: 12) {
        ChallengeRow(challenge: Challenge(
            id: "1",
            code: "play_5_matches",
            type: .quantitative,
            difficulty: .medium,
            title: "Jouer 5 matchs",
            description: "Participe à 5 matchs cette semaine pour gagner des Aces bonus.",
            currentProgress: 3,
            targetValue: 5,
            acesReward: 150,
            status: .active,
            expiresAt: Date().addingTimeInterval(3 * 24 * 3600)
        ))

        ChallengeRow(challenge: Challenge(
            id: "2",
            code: "win_set_60",
            type: .performance,
            difficulty: .hard,
            title: "Gagner un set 6-0",
            description: "Remporte un set sans perdre un seul jeu.",
            currentProgress: 1,
            targetValue: 1,
            acesReward: 250,
            status: .completed,
            expiresAt: Date()
        ))
    }
    .padding()
    .background(Theme.primaryBackground)
}
