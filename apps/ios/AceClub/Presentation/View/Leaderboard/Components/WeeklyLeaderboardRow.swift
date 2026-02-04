import SwiftUI

struct WeeklyLeaderboardRow: View {
    let entry: WeeklyLeaderboardEntry

    var body: some View {
        HStack(spacing: 12) {
            rankBadge

            avatar

            VStack(alignment: .leading, spacing: 2) {
                Text(entry.name)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.primary)
                    .lineLimit(1)

                Text(entry.formattedRank)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 2) {
                Text(entry.formattedWeeklyAces)
                    .font(.subheadline.weight(.bold))
                    .foregroundStyle(Theme.tintColor)
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

                Text("\(entry.rank)")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundStyle(.white)
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
        WeeklyLeaderboardRow(
            entry: WeeklyLeaderboardEntry(
                rank: 1,
                user: UserSummary(id: "1", name: "Jean Dupont", image: nil),
                weeklyAces: 850
            )
        )

        WeeklyLeaderboardRow(
            entry: WeeklyLeaderboardEntry(
                rank: 2,
                user: UserSummary(id: "2", name: "Marie Martin", image: nil),
                weeklyAces: 720
            )
        )
    }
    .listStyle(.plain)
}
