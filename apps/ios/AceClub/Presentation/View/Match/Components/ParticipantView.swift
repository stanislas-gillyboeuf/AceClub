//
//  ParticipantView.swift
//  AceClub
//
//  Created by Nicolas Becharat on 21/01/2026.
//

import SwiftUI

struct ParticipantView: View {
    let participant: MatchParticipant?
    let side: MatchSide
    let isWinner: Bool

    var body: some View {
        HStack {
            if side == .home {
                winnerBadge
            }

            VStack(alignment: side == .home ? .leading : .trailing) {
                Text(side.displayName)
                    .font(.caption2)
                    .foregroundStyle(.secondary)

                Text(participant?.userId ?? "N/A")
                    .font(.subheadline)
                    .fontWeight(isWinner ? .bold : .regular)
                    .lineLimit(1)
            }

            if side == .away {
                winnerBadge
            }
        }
        .frame(maxWidth: .infinity, alignment: side == .home ? .leading : .trailing)
    }

    @ViewBuilder
    private var winnerBadge: some View {
        if isWinner {
            Image(systemName: "crown.fill")
                .font(.caption)
                .foregroundStyle(.yellow)
        }
    }
}
