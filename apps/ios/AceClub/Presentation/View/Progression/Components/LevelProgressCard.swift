import SwiftUI

struct LevelProgressCard: View {
    let userLevel: UserLevel

    var body: some View {
        VStack(spacing: 16) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(userLevel.formattedLevel)
                        .font(.title.weight(.bold))
                        .foregroundStyle(.primary)

                    Text(userLevel.formattedTotalAces + " total")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }

                Spacer()

                levelBadge
            }

            if !userLevel.isMaxLevel {
                VStack(alignment: .leading, spacing: 8) {
                    GeometryReader { geometry in
                        ZStack(alignment: .leading) {
                            RoundedRectangle(cornerRadius: 6)
                                .fill(Color(.systemGray5))
                                .frame(height: 12)

                            RoundedRectangle(cornerRadius: 6)
                                .fill(
                                    LinearGradient(
                                        colors: [Theme.tintColor, Theme.tintColor.opacity(0.7)],
                                        startPoint: .leading,
                                        endPoint: .trailing
                                    )
                                )
                                .frame(width: geometry.size.width * userLevel.progressPercent, height: 12)
                        }
                    }
                    .frame(height: 12)

                    HStack {
                        Text(userLevel.formattedProgress)
                            .font(.caption)
                            .foregroundStyle(.secondary)

                        Spacer()

                        Text("Niveau \(userLevel.level + 1)")
                            .font(.caption.weight(.medium))
                            .foregroundStyle(Theme.tintColor)
                    }
                }
            }
        }
        .padding(Theme.paddingCard)
        .background(Theme.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusLarge, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: Theme.cornerRadiusLarge, style: .continuous)
                .strokeBorder(Theme.borderColor, lineWidth: Theme.borderWidthSubtle)
        }
    }

    private var levelBadge: some View {
        ZStack {
            Circle()
                .fill(Theme.tintColor.opacity(0.15))
                .frame(width: 64, height: 64)

            Circle()
                .strokeBorder(Theme.tintColor, lineWidth: 3)
                .frame(width: 64, height: 64)

            Text("\(userLevel.level)")
                .font(.system(size: 24, weight: .bold, design: .rounded))
                .foregroundStyle(Theme.tintColor)
        }
    }
}

#Preview {
    LevelProgressCard(userLevel: UserLevel(
        totalAces: 1250,
        level: 8,
        currentLevelAces: 150,
        acesToNextLevel: 150,
        progressPercent: 0.5
    ))
    .padding()
    .background(Theme.primaryBackground)
}
