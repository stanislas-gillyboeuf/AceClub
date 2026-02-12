import SwiftUI

struct StreakCard: View {
    let streak: UserStreak

    var body: some View {
        HStack(spacing: 16) {
            ZStack {
                Circle()
                    .fill(streakColor.opacity(0.15))
                    .frame(width: 56, height: 56)

                Image(systemName: streak.streakIcon)
                    .font(.title)
                    .foregroundStyle(streakColor)
            }

            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 8) {
                    Text("\(streak.currentStreak)")
                        .font(.title2.weight(.bold))
                        .foregroundStyle(.primary)

                    Text(streak.currentStreak == 1 ? "semaine" : "semaines")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }

                if let multiplierText = streak.formattedMultiplier {
                    Text("Multiplicateur \(multiplierText)")
                        .font(.caption.weight(.medium))
                        .foregroundStyle(Theme.tintColor)
                }
            }

            Spacer()

            if streak.longestStreak > 0 {
                VStack(alignment: .trailing, spacing: 2) {
                    Text("Record")
                        .font(.caption)
                        .foregroundStyle(.secondary)

                    Text("\(streak.longestStreak)")
                        .font(.headline.weight(.bold))
                        .foregroundStyle(.primary)
                }
            }
        }
        .padding(Theme.paddingCard)
        .background(Theme.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
    }

    private var streakColor: Color {
        switch streak.currentStreak {
        case 0: return .gray
        case 1...3: return Theme.accentOrange
        case 4...7: return .red
        default: return .purple
        }
    }
}

#Preview {
    VStack(spacing: 16) {
        StreakCard(streak: UserStreak(
            currentStreak: 5,
            longestStreak: 12,
            multiplier: 1.3,
            totalActiveWeeks: 20,
            streakStartDate: Date()
        ))

        StreakCard(streak: .empty)
    }
    .padding()
    .background(Theme.primaryBackground)
}
