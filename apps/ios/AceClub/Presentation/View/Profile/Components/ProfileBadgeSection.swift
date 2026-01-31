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
                Text("Aucun badge d\u{00E9}bloqu\u{00E9}")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding(.vertical, 8)
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

#Preview {
    List {
        Section {
            ProfileBadgeSection(badges: [
                Badge(id: "1", code: "premiers_pas", category: .achievement, name: "Premiers pas", description: "Bienvenue !", imageUrl: "https://bucket-production-f7ab.up.railway.app/aceclub-production/badges/premiers_pas.png", requiredLevel: nil, isUnlocked: true, unlockedAt: Date()),
                Badge(id: "2", code: "joueur_regulier", category: .achievement, name: "Joueur régulier", description: "5 matchs ce mois", imageUrl: "https://bucket-production-f7ab.up.railway.app/aceclub-production/badges/joueur_regulier.png", requiredLevel: nil, isUnlocked: true, unlockedAt: Date().addingTimeInterval(-86400)),
                Badge(id: "3", code: "en_forme", category: .achievement, name: "En forme", description: "3 mois", imageUrl: "https://bucket-production-f7ab.up.railway.app/aceclub-production/badges/en_forme.png", requiredLevel: nil, isUnlocked: false, unlockedAt: nil)
            ])
        }
    }
    .listStyle(.insetGrouped)
}
