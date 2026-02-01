import SwiftUI

struct BadgeGrid: View {
    let badges: [Badge]
    let allBadges: [Badge]

    private let columns = [
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
        VStack(spacing: 4) {
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
            .frame(width: 70, height: 70)
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
            .frame(width: 70, height: 70)
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
