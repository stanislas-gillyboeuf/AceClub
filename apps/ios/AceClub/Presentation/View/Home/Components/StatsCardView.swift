import SwiftUI

struct StatsCardView: View {
    let stats: UserMatchStats

    var body: some View {
        VStack(spacing: 0) {
            HStack(spacing: 0) {
                statItem(
                    icon: "trophy",
                    value: "\(stats.totalMatches)",
                    label: "Matchs\ntotaux"
                )

                Divider()
                    .frame(height: 60)

                statItem(
                    icon: "chart.line.uptrend.xyaxis",
                    value: stats.formattedWinRate,
                    label: "Taux de\nvictoire"
                )

                Divider()
                    .frame(height: 60)

                statItem(
                    icon: "clock",
                    value: stats.formattedPlayTime,
                    label: "Temps de jeu"
                )
            }
            .padding(.vertical, 20)

            Divider()

            VStack(alignment: .leading, spacing: 10) {
                Text("Ce mois-ci")
                    .font(.headline)

                GeometryReader { geometry in
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 4)
                            .fill(Color(.systemGray5))
                            .frame(height: 8)

                        RoundedRectangle(cornerRadius: 4)
                            .fill(Theme.tintColor)
                            .frame(width: geometry.size.width * stats.monthlyProgress, height: 8)
                    }
                }
                .frame(height: 8)

                Text("\(stats.matchesThisMonth) matchs joués")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            .padding(16)
        }
        .background(Theme.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusLarge, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: Theme.cornerRadiusLarge, style: .continuous)
                .strokeBorder(Theme.borderColor, lineWidth: Theme.borderWidthSubtle)
        }
    }

    @ViewBuilder
    private func statItem(icon: String, value: String, label: String) -> some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundStyle(Theme.tintColor)

            Text(value)
                .font(.system(size: 28, weight: .bold, design: .rounded))

            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
    }
}
