//
//  MatchRowView.swift
//  AceClub
//
//  Created by Nicolas Becharat on 21/01/2026.
//

import SwiftUI
import SwiftData

struct MatchRowView: View {
    let match: MatchModel

    private var displayDate: Date {
        match.scheduledAt ?? match.startedAt ?? match.createdAt
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Top row: time + status badge
            HStack {
                Label {
                    Text(displayDate, format: .dateTime.hour().minute())
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                } icon: {
                    Image(systemName: "clock")
                        .foregroundStyle(Theme.tintColor)
                }

                Spacer()

                Text(match.matchStatus.displayName)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(statusColor)
                    .clipShape(Capsule())
            }

            // Players row: avatars + names + score
            HStack(alignment: .center, spacing: 12) {
                playerView(participant: match.homeParticipant, isWinner: match.homeParticipant?.isWinner ?? false)

                Text("vs")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)

                playerView(participant: match.awayParticipant, isWinner: match.awayParticipant?.isWinner ?? false)

                Spacer()

                VStack(alignment: .trailing, spacing: 4) {
                    Text(match.formattedMatchScore)
                        .font(.title3.weight(.bold))
                        .monospacedDigit()

                    if let duration = match.formattedDuration {
                        HStack(spacing: 4) {
                            Image(systemName: "clock")
                                .font(.caption2)
                            Text(duration)
                                .font(.caption)
                        }
                        .foregroundStyle(.secondary)
                    }
                }
            }
        }
        .padding(Theme.paddingCard)
        .background(Theme.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous)
                .strokeBorder(
                    match.isOngoing ? Theme.accentOrange.opacity(0.3) : Theme.borderColor,
                    lineWidth: match.isOngoing ? 2 : Theme.borderWidthSubtle
                )
        }
    }

    // MARK: - Subviews

    @ViewBuilder
    private func playerView(participant: MatchParticipantModel?, isWinner: Bool) -> some View {
        HStack(spacing: 8) {
            playerAvatar(participant: participant)

            HStack(spacing: 4) {
                Text(participant?.userName ?? "N/A")
                    .font(.subheadline.weight(isWinner ? .bold : .regular))
                    .lineLimit(1)

                if isWinner {
                    Image(systemName: "crown.fill")
                        .font(.caption2)
                        .foregroundStyle(.yellow)
                }
            }
        }
    }

    @ViewBuilder
    private func playerAvatar(participant: MatchParticipantModel?) -> some View {
        Group {
            if let imageURL = participant?.cacheBustedImageURL() {
                AsyncImage(url: imageURL) { image in
                    image
                        .resizable()
                        .scaledToFill()
                } placeholder: {
                    initialsPlaceholder(initials: participant?.userInitials ?? "?", size: 40)
                }
            } else {
                initialsPlaceholder(initials: participant?.userInitials ?? "?", size: 40)
            }
        }
        .frame(width: 40, height: 40)
        .clipShape(Circle())
    }

    private func initialsPlaceholder(initials: String, size: CGFloat) -> some View {
        Circle()
            .fill(Theme.tintColor.opacity(0.15))
            .overlay {
                Text(initials)
                    .font(.system(size: size * 0.35, weight: .semibold, design: .rounded))
                    .foregroundStyle(Theme.tintColor)
            }
    }

    // MARK: - Computed Properties

    private var statusColor: Color {
        switch match.matchStatus {
        case .scheduled:
            return .blue
        case .ongoing:
            return Theme.accentOrange
        case .finished:
            return .green
        }
    }
}

// MARK: - Legacy MatchRowView for MatchListItem (Domain Entity)

struct MatchRowViewLegacy: View {
    let match: MatchListItem

    var body: some View {
        HStack(alignment: .center, spacing: 12) {
            // Date proeminente (style carnet de bord)
            dateView

            // Details du match
            VStack(alignment: .leading, spacing: 4) {
                // Type colore + statut badge
                HStack(spacing: 6) {
                    Label(match.type.displayName, systemImage: match.type.icon)
                        .font(.caption.weight(.medium))
                        .foregroundStyle(typeColor)

                    Text("•")
                        .foregroundStyle(.tertiary)

                    Text(match.status.displayName)
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(statusColor)
                        .clipShape(Capsule())
                }

                // Participants inline
                HStack(spacing: 6) {
                    Text(homeName)
                        .font(.subheadline.weight(isHomeWinner ? .bold : .regular))
                        .lineLimit(1)
                    if isHomeWinner { crownIcon }

                    Text("vs")
                        .font(.caption)
                        .foregroundStyle(.secondary)

                    if isAwayWinner { crownIcon }
                    Text(awayName)
                        .font(.subheadline.weight(isAwayWinner ? .bold : .regular))
                        .lineLimit(1)
                }
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.caption.weight(.semibold))
                .foregroundStyle(.tertiary)
        }
        .contentShape(Rectangle())
    }

    // MARK: - Subviews

    @ViewBuilder
    private var dateView: some View {
        VStack(spacing: 2) {
            Text(displayDate, format: .dateTime.day())
                .font(.title2.weight(.bold))
            Text(displayDate, format: .dateTime.month(.abbreviated))
                .font(.caption.weight(.medium))
                .foregroundStyle(.secondary)
                .textCase(.uppercase)
        }
        .frame(width: 50)
    }

    private var crownIcon: some View {
        Image(systemName: "crown.fill")
            .font(.caption2)
            .foregroundStyle(.yellow)
    }

    // MARK: - Computed Properties

    private var displayDate: Date {
        match.scheduledAt ?? match.startedAt ?? match.createdAt
    }

    private var homeName: String {
        match.homeParticipant?.userName ?? "N/A"
    }

    private var awayName: String {
        match.awayParticipant?.userName ?? "N/A"
    }

    private var isHomeWinner: Bool {
        guard let homeId = match.homeParticipant?.id else { return false }
        return match.winner?.id == homeId
    }

    private var isAwayWinner: Bool {
        guard let awayId = match.awayParticipant?.id else { return false }
        return match.winner?.id == awayId
    }

    private var typeColor: Color {
        switch match.type {
        case .match:
            return .blue
        case .training:
            return Theme.accentOrange
        }
    }

    private var statusColor: Color {
        switch match.status {
        case .scheduled:
            return .blue
        case .ongoing:
            return Theme.accentOrange
        case .finished:
            return .green
        }
    }
}
