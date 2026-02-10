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

    var body: some View {
        HStack(alignment: .center, spacing: 12) {
            dateView

            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 6) {
                    Label(match.matchType.displayName, systemImage: match.matchType.icon)
                        .font(.caption.weight(.medium))
                        .foregroundStyle(typeColor)

                    Text("•")
                        .foregroundStyle(.tertiary)

                    Text(match.matchStatus.displayName)
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(statusColor)
                        .clipShape(Capsule())
                }

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
        match.homeParticipant?.isWinner ?? false
    }

    private var isAwayWinner: Bool {
        match.awayParticipant?.isWinner ?? false
    }

    private var typeColor: Color {
        switch match.matchType {
        case .match:
            return .blue
        case .training:
            return Theme.accentOrange
        }
    }

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
            // Date proéminente (style carnet de bord)
            dateView

            // Détails du match
            VStack(alignment: .leading, spacing: 4) {
                // Type coloré + statut badge
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
        // Priorité : scheduledAt (date prévue) > startedAt (date réelle) > createdAt
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
