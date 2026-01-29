//
//  MatchRowView.swift
//  AceClub
//
//  Created by Nicolas Becharat on 21/01/2026.
//

import SwiftUI
import SwiftData

// MARK: - MatchRowView for MatchModel (SwiftData)

struct MatchRowView: View {
    let match: MatchModel

    var body: some View {
        HStack(alignment: .center, spacing: 12) {
            // Date proéminente (style carnet de bord)
            dateView

            // Détails du match
            VStack(alignment: .leading, spacing: 4) {
                // Badges type + statut
                HStack(spacing: 6) {
                    // Badge type
                    Label(match.matchType.displayName, systemImage: match.matchType.icon)
                        .font(.caption2.weight(.medium))
                        .foregroundStyle(.secondary)

                    // Badge statut
                    Text(match.matchStatus.displayName)
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(statusColor)
                        .clipShape(Capsule())
                }

                // Participants inline
                HStack(spacing: 6) {
                    Text(homeName)
                        .font(.subheadline.weight(isHomeWinner ? .bold : .regular))
                    if isHomeWinner { crownIcon }

                    Text("vs")
                        .font(.caption)
                        .foregroundStyle(.secondary)

                    if isAwayWinner { crownIcon }
                    Text(awayName)
                        .font(.subheadline.weight(isAwayWinner ? .bold : .regular))
                }
            }

            Spacer()
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
        match.homeParticipant?.isWinner ?? false
    }

    private var isAwayWinner: Bool {
        match.awayParticipant?.isWinner ?? false
    }

    private var statusColor: Color {
        switch match.matchStatus {
        case .scheduled:
            return .blue
        case .ongoing:
            return .orange
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
                // Badges type + statut
                HStack(spacing: 6) {
                    // Badge type
                    Label(match.type.displayName, systemImage: match.type.icon)
                        .font(.caption2.weight(.medium))
                        .foregroundStyle(.secondary)

                    // Badge statut
                    Text(match.status.displayName)
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(statusColor)
                        .clipShape(Capsule())
                }

                // Participants inline
                HStack(spacing: 6) {
                    Text(homeName)
                        .font(.subheadline.weight(isHomeWinner ? .bold : .regular))
                    if isHomeWinner { crownIcon }

                    Text("vs")
                        .font(.caption)
                        .foregroundStyle(.secondary)

                    if isAwayWinner { crownIcon }
                    Text(awayName)
                        .font(.subheadline.weight(isAwayWinner ? .bold : .regular))
                }
            }

            Spacer()
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
        match.homeParticipant?.user?.name ?? "N/A"
    }

    private var awayName: String {
        match.awayParticipant?.user?.name ?? "N/A"
    }

    private var isHomeWinner: Bool {
        guard let homeId = match.homeParticipant?.id else { return false }
        return match.winner?.id == homeId
    }

    private var isAwayWinner: Bool {
        guard let awayId = match.awayParticipant?.id else { return false }
        return match.winner?.id == awayId
    }

    private var statusColor: Color {
        switch match.status {
        case .scheduled:
            return .blue
        case .ongoing:
            return .orange
        case .finished:
            return .green
        }
    }
}
