//
//  MatchInfoCard.swift
//  AceClub
//
//  Match information card - type, dates, duration
//

import SwiftUI

struct MatchInfoCard: View {
    let match: MatchModel

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Section header
            Text("INFORMATIONS")
                .font(.caption.weight(.bold))
                .foregroundStyle(Theme.labelTertiary)
                .tracking(1.5)
                .padding(.horizontal, Theme.paddingCard)

            VStack(spacing: 0) {
                // Match type
                infoRow(icon: match.matchType.icon, label: "Type") {
                    Text(match.matchType.displayName)
                        .foregroundStyle(match.matchType == .match ? .blue : Theme.accentOrange)
                }

                // Scheduled date
                if let scheduledAt = match.formattedScheduledAt {
                    thinDivider
                    infoRow(icon: "calendar", label: "Date pr\u{00e9}vue") {
                        Text(scheduledAt)
                    }
                }

                // Started at
                if let startedAt = match.formattedStartedAt {
                    thinDivider
                    infoRow(icon: "play.circle", label: "D\u{00e9}marr\u{00e9} le") {
                        Text(startedAt)
                    }
                }

                // Finished at
                if let finishedAt = match.formattedFinishedAt {
                    thinDivider
                    infoRow(icon: "checkmark.circle", label: "Termin\u{00e9} le") {
                        Text(finishedAt)
                    }
                }

                // Duration
                if let duration = match.formattedDuration {
                    thinDivider
                    infoRow(icon: "timer", label: "Dur\u{00e9}e") {
                        Text(duration)
                            .fontWeight(.medium)
                    }
                }
            }
            .padding(.horizontal, Theme.paddingCard)
        }
        .padding(.vertical, Theme.paddingCard)
        .cardStyle(cornerRadius: Theme.cornerRadiusMedium)
    }

    // MARK: - Info Row

    private func infoRow<Content: View>(icon: String, label: String, @ViewBuilder value: () -> Content) -> some View {
        HStack {
            HStack(spacing: 8) {
                Image(systemName: icon)
                    .font(.caption)
                    .foregroundStyle(Theme.labelTertiary)
                    .frame(width: 16)

                Text(label)
                    .font(.subheadline)
                    .foregroundStyle(Theme.labelSecondary)
            }

            Spacer()

            value()
                .font(.subheadline)
        }
        .padding(.vertical, 11)
    }

    // MARK: - Divider

    private var thinDivider: some View {
        Rectangle()
            .fill(Theme.borderColorSubtle)
            .frame(height: 0.5)
    }
}
