//
//  MatchRowView.swift
//  AceClub
//
//  Created by Nicolas Becharat on 21/01/2026.
//

import SwiftUI

struct MatchRowView: View {
    let match: MatchListItem

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(match.status.displayName)
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundStyle(.white)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(statusColor)
                    .clipShape(Capsule())

                Spacer()

                Text(match.formattedCreatedAt)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            HStack(spacing: 16) {
                ParticipantView(
                    participant: match.homeParticipant,
                    side: .home,
                    isWinner: match.winner?.id == match.homeParticipant?.id
                )

                Text("VS")
                    .font(.caption)
                    .fontWeight(.bold)
                    .foregroundStyle(.secondary)

                ParticipantView(
                    participant: match.awayParticipant,
                    side: .away,
                    isWinner: match.winner?.id == match.awayParticipant?.id
                )
            }
        }
        .padding(.vertical, 4)
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
