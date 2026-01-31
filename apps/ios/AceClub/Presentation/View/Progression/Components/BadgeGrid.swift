import SwiftUI

struct BadgeGrid: View {
    let badges: [Badge]
    let allBadges: [Badge]

    private let columns = [
        GridItem(.flexible()),
        GridItem(.flexible()),
        GridItem(.flexible()),
        GridItem(.flexible())
    ]

    var body: some View {
        LazyVGrid(columns: columns, spacing: 16) {
            ForEach(allBadges) { badge in
                BadgeItem(badge: badge)
            }
        }
    }
}

struct BadgeItem: View {
    let badge: Badge

    var body: some View {
        VStack(spacing: 8) {
            AsyncImage(url: badge.imageURL) { phase in
                switch phase {
                case .success(let image):
                    image
                        .resizable()
                        .scaledToFit()
                case .failure:
                    placeholderIcon
                case .empty:
                    ProgressView()
                @unknown default:
                    placeholderIcon
                }
            }
            .frame(width: 56, height: 56)
            .clipShape(Circle())
            .grayscale(badge.isUnlocked ? 0 : 1)

            Text(badge.name)
                .font(.caption2)
                .foregroundStyle(badge.isUnlocked ? .primary : .secondary)
                .lineLimit(2)
                .multilineTextAlignment(.center)
        }
        .opacity(badge.isUnlocked ? 1.0 : 0.6)
    }

    private var placeholderIcon: some View {
        Circle()
            .fill(badge.category.color.opacity(0.15))
            .frame(width: 56, height: 56)
            .overlay {
                Image(systemName: "medal.fill")
                    .font(.title2)
                    .foregroundStyle(badge.category.color)
            }
    }
}

private extension BadgeCategory {
    var color: Color {
        switch self {
        case .level: return .blue
        case .achievement: return .green
        case .milestone: return .orange
        case .special: return .purple
        }
    }
}

#Preview {
    BadgeGrid(
        badges: [],
        allBadges: [
            Badge(id: "1", code: "level_5", category: .level, name: "Niveau 5", description: "Atteindre niveau 5", imageUrl: "https://bucket-production-f7ab.up.railway.app/aceclub-production/badges/level_5.png", requiredLevel: 5, isUnlocked: true, unlockedAt: Date()),
            Badge(id: "2", code: "level_10", category: .level, name: "Niveau 10", description: "Atteindre niveau 10", imageUrl: "https://bucket-production-f7ab.up.railway.app/aceclub-production/badges/level_10.png", requiredLevel: 10, isUnlocked: false, unlockedAt: nil),
            Badge(id: "3", code: "premiers_pas", category: .achievement, name: "Premiers pas", description: "Bienvenue !", imageUrl: "https://bucket-production-f7ab.up.railway.app/aceclub-production/badges/premiers_pas.png", requiredLevel: nil, isUnlocked: true, unlockedAt: Date()),
            Badge(id: "4", code: "joueur_regulier", category: .achievement, name: "Joueur régulier", description: "5 matchs ce mois", imageUrl: "https://bucket-production-f7ab.up.railway.app/aceclub-production/badges/joueur_regulier.png", requiredLevel: nil, isUnlocked: false, unlockedAt: nil)
        ]
    )
    .padding()
    .background(Theme.primaryBackground)
}
