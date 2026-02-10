//
//  DiscoverCardView.swift
//  AceClub
//

import SwiftUI

struct DiscoverCardView: View {
    let item: MatchIntentDiscoverItem

    private var displayName: String {
        item.user?.name ?? "Joueur"
    }

    private var tier: LevelTier {
        LevelTier.tier(for: item.user?.level ?? 1)
    }

    var body: some View {
        GeometryReader { geometry in
            let tagWidth = geometry.size.width - Theme.glassInset * 2

            ZStack {
                photoBackground

                bottomGradient

                infoOverlay(availableWidth: tagWidth)
                    .padding(.horizontal, Theme.glassInset)
                    .padding(.bottom, Theme.glassInset + 4)
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomLeading)

                topBadges
                    .padding(.horizontal, Theme.glassInset)
                    .padding(.top, Theme.glassInset)
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
            }
        }
        .aspectRatio(0.7, contentMode: .fit)
        .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusXLarge, style: .continuous))
        .shadow(color: .black.opacity(0.15), radius: 20, x: 0, y: 10)
    }

    // MARK: - Photo Background

    @ViewBuilder
    private var photoBackground: some View {
        if let imageURL = item.user?.imageURL {
            AsyncImage(url: imageURL) { phase in
                switch phase {
                case .success(let image):
                    image.resizable().scaledToFill()
                case .empty:
                    initialsFallback.overlay { ProgressView().tint(.white) }
                case .failure:
                    initialsFallback
                @unknown default:
                    initialsFallback
                }
            }
        } else {
            initialsFallback
        }
    }

    private var initialsFallback: some View {
        ZStack {
            LinearGradient(
                colors: [tier.color.opacity(0.7), tier.color.opacity(0.3)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            Text(item.user?.initials ?? "?")
                .font(.system(size: 80, weight: .bold, design: .rounded))
                .foregroundStyle(.white.opacity(0.6))
        }
    }

    // MARK: - Bottom Gradient

    private var bottomGradient: some View {
        VStack {
            Spacer()
            LinearGradient(
                colors: [.clear, .black.opacity(0.3), .black.opacity(0.65)],
                startPoint: .top,
                endPoint: .bottom
            )
            .frame(height: 240)
        }
    }

    // MARK: - Info Overlay

    private func infoOverlay(availableWidth: CGFloat) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(displayName)
                .font(.title2.weight(.bold))
                .foregroundStyle(.white)
                .lineLimit(1)

            WrappingHStack(availableWidth: availableWidth, spacing: 6) {
                tagView(
                    icon: tier.icon,
                    text: "Niv. \(item.user?.level ?? 1)",
                    iconColor: tier.color
                )

                if let org = item.user?.organization {
                    tagView(icon: "building.2.fill", text: org.name)
                }

                if let date = item.intent.date {
                    tagView(icon: "calendar", text: formatDate(date))
                }

                if let time = item.intent.time {
                    tagView(icon: "clock", text: formatTime(time))
                }

                if item.intent.duration > 0 {
                    tagView(icon: "timer", text: durationLabel(minutes: item.intent.duration))
                }
            }
        }
    }

    private var typeBadge: some View {
        Label(item.intent.type.displayName, systemImage: item.intent.type.icon)
            .font(.subheadline.weight(.semibold))
            .foregroundStyle(item.intent.type == .match ? .blue : Theme.accentOrange)
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(
                (item.intent.type == .match ? Color.blue : Theme.accentOrange)
                    .opacity(0.12)
            )
            .clipShape(Capsule())
    }

    private func tagView(icon: String, text: String, iconColor: Color? = nil) -> some View {
        HStack(spacing: 4) {
            Image(systemName: icon)
                .font(.caption2.weight(.semibold))
                .foregroundStyle(iconColor ?? .white.opacity(0.9))
            Text(text)
                .font(.caption.weight(.semibold))
                .foregroundStyle(.white)
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 5)
        .background(.white.opacity(0.15), in: Capsule())
    }

    // MARK: - Top Badges

    private var topBadges: some View {
        HStack {
            if let distance = item.distance {
                HStack(spacing: 4) {
                    Image(systemName: "location.fill")
                        .font(.caption2)
                    Text(distance < 1
                        ? String(format: "%.0f m", distance * 1000)
                        : String(format: "%.1f km", distance))
                        .font(.caption.weight(.semibold))
                }
                .foregroundStyle(.white)
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(.ultraThinMaterial, in: Capsule())
            }

            Spacer()

            Label(item.intent.type.displayName, systemImage: item.intent.type.icon)
                .font(.caption.weight(.semibold))
                .foregroundStyle(.white)
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(
                    (item.intent.type == .match ? Color.blue : Color.orange).opacity(0.85),
                    in: Capsule()
                )
        }
    }

    // MARK: - Helpers

    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "fr_FR")
        formatter.dateFormat = "EEE d MMM"
        return formatter.string(from: date).capitalized
    }

    private func formatTime(_ time: Date) -> String {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "fr_FR")
        formatter.dateFormat = "HH:mm"
        return formatter.string(from: time)
    }

    private func durationLabel(minutes: Int) -> String {
        if minutes >= 60 {
            let h = minutes / 60
            let m = minutes % 60
            return m > 0 ? "\(h)h \(m)min" : "\(h)h"
        }
        return "\(minutes)min"
    }
}

// MARK: - WrappingHStack

private struct WrappingHStack: Layout {
    var availableWidth: CGFloat
    var spacing: CGFloat = 6

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let maxWidth = availableWidth
        var currentX: CGFloat = 0
        var currentY: CGFloat = 0
        var rowHeight: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if currentX + size.width > maxWidth, currentX > 0 {
                currentX = 0
                currentY += rowHeight + spacing
                rowHeight = 0
            }
            currentX += size.width + spacing
            rowHeight = max(rowHeight, size.height)
        }

        return CGSize(width: maxWidth, height: currentY + rowHeight)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let maxWidth = availableWidth
        var currentX: CGFloat = bounds.minX
        var currentY: CGFloat = bounds.minY
        var rowHeight: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if currentX - bounds.minX + size.width > maxWidth, currentX > bounds.minX {
                currentX = bounds.minX
                currentY += rowHeight + spacing
                rowHeight = 0
            }
            subview.place(at: CGPoint(x: currentX, y: currentY), proposal: .unspecified)
            currentX += size.width + spacing
            rowHeight = max(rowHeight, size.height)
        }
    }
}
