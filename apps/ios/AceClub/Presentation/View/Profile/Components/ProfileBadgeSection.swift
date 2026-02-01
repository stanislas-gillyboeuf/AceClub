import SwiftUI

struct ProfileBadgeSection: View {
    let badges: [Badge]

    private var recentUnlockedBadges: [Badge] {
        badges
            .filter { $0.isUnlocked }
            .sorted { ($0.unlockedAt ?? .distantPast) > ($1.unlockedAt ?? .distantPast) }
            .prefix(4)
            .map { $0 }
    }

    private var unlockedCount: Int {
        badges.filter(\.isUnlocked).count
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Badges")
                    .font(.subheadline.weight(.semibold))
                Spacer()
                Text("\(unlockedCount)/\(badges.count)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            if recentUnlockedBadges.isEmpty {
                ContentUnavailableView {
                    Label("Aucun badge", systemImage: "rosette")
                } description: {
                    Text("Tu recevras des badges pour tes performances.")
                }
            } else {
                HStack(spacing: 16) {
                    ForEach(recentUnlockedBadges) { badge in
                        BadgeItem(badge: badge)
                    }
                    Spacer()
                }
            }
        }
        .padding(.vertical, 4)
    }
}
