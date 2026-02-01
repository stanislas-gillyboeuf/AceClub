import SwiftUI

struct LeaderboardRow: View {
    let entry: LeaderboardEntry

    var body: some View {
        HStack(spacing: 12) {
            rankBadge

            avatar

            VStack(alignment: .leading, spacing: 2) {
                Text(entry.name)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.primary)
                    .lineLimit(1)

                Text("Niveau \(entry.level)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 2) {
                Text(entry.formattedAces)
                    .font(.subheadline.weight(.bold))
                    .foregroundStyle(.primary)

                if entry.streak > 0 {
                    HStack(spacing: 2) {
                        Image(systemName: "flame.fill")
                            .font(.caption2)
                        Text("\(entry.streak)")
                            .font(.caption2)
                    }
                    .foregroundStyle(.orange)
                }
            }
        }
        .padding(.vertical, 8)
        .padding(.horizontal, 12)
        .background(entry.rank <= 3 ? rankBackgroundColor.opacity(0.08) : Color.clear)
        .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusSmall, style: .continuous))
    }

    @ViewBuilder
    private var rankBadge: some View {
        ZStack {
            if entry.rank <= 3 {
                Circle()
                    .fill(rankColor)
                    .frame(width: 32, height: 32)

                if let icon = entry.rankIcon {
                    Image(systemName: icon)
                        .font(.system(size: 14, weight: .bold))
                        .foregroundStyle(.white)
                } else {
                    Text(entry.formattedRank)
                        .font(.system(size: 12, weight: .bold))
                        .foregroundStyle(.white)
                }
            } else {
                Text("\(entry.rank)")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(.secondary)
                    .frame(width: 32)
            }
        }
    }

    @ViewBuilder
    private var avatar: some View {
        ZStack {
            Circle()
                .fill(Color(.tertiarySystemFill))
                .frame(width: 40, height: 40)

            Text(initials(from: entry.name))
                .font(.system(size: 14, weight: .semibold, design: .rounded))
                .foregroundStyle(.secondary)

            if let imageURLString = entry.image,
               let imageURL = URL(string: imageURLString) {
                AsyncImage(url: imageURL) { phase in
                    switch phase {
                    case .success(let image):
                        image
                            .resizable()
                            .scaledToFill()
                    default:
                        EmptyView()
                    }
                }
            }
        }
        .frame(width: 40, height: 40)
        .clipShape(Circle())
    }

    private var rankColor: Color {
        switch entry.rank {
        case 1: return .yellow
        case 2: return .gray
        case 3: return .brown
        default: return .clear
        }
    }

    private var rankBackgroundColor: Color {
        switch entry.rank {
        case 1: return .yellow
        case 2: return .gray
        case 3: return .brown
        default: return .clear
        }
    }

    private func initials(from name: String) -> String {
        let parts = name.split(whereSeparator: { $0.isWhitespace }).prefix(2)
        let letters = parts.compactMap { $0.first }.map { String($0).uppercased() }
        let value = letters.joined()
        return value.isEmpty ? "?" : value
    }
}

#Preview {
    List {
        LeaderboardRow(
            entry: LeaderboardEntry(
                rank: 1,
                userId: "1",
                name: "Jean Dupont",
                image: nil,
                aces: 5420,
                level: 25,
                streak: 5
            )
        )

        LeaderboardRow(
            entry: LeaderboardEntry(
                rank: 2,
                userId: "2",
                name: "Marie Martin",
                image: nil,
                aces: 4890,
                level: 23,
                streak: 3
            )
        )

        LeaderboardRow(
            entry: LeaderboardEntry(
                rank: 3,
                userId: "3",
                name: "Pierre Bernard",
                image: nil,
                aces: 4200,
                level: 21,
                streak: 0
            )
        )

        LeaderboardRow(
            entry: LeaderboardEntry(
                rank: 4,
                userId: "4",
                name: "Sophie Petit",
                image: nil,
                aces: 3800,
                level: 19,
                streak: 2
            )
        )
    }
    .listStyle(.plain)
}
