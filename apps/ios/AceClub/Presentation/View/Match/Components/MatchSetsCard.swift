//
//  MatchSetsCard.swift
//  AceClub
//
//  Set scores card for MatchDetailView - tennis match card style
//

import SwiftUI

struct MatchSetsCard: View {
    let match: MatchModel

    private var sortedSets: [MatchSetModel] {
        match.sets.sorted { $0.setNumber < $1.setNumber }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Section header
            Text("SCORES PAR SET")
                .font(.caption.weight(.bold))
                .foregroundStyle(Theme.labelTertiary)
                .tracking(1.5)
                .padding(.horizontal, Theme.paddingCard)

            VStack(spacing: 0) {
                // Header: set numbers
                HStack(spacing: 0) {
                    Text("")
                        .frame(width: playerNameWidth, alignment: .leading)

                    ForEach(sortedSets) { set in
                        Text("S\(set.setNumber)")
                            .font(.caption2.weight(.bold))
                            .foregroundStyle(Theme.labelTertiary)
                            .tracking(0.5)
                            .frame(minWidth: columnWidth)
                    }
                }
                .padding(.horizontal, Theme.paddingCard)
                .padding(.vertical, 6)

                thinDivider

                // Home row
                scoreRow(side: .home)

                thinDivider

                // Away row
                scoreRow(side: .away)
            }
        }
        .padding(.vertical, Theme.paddingCard)
        .cardStyle(cornerRadius: Theme.cornerRadiusMedium)
    }

    // MARK: - Score Row

    private func scoreRow(side: MatchSide) -> some View {
        let participant = side == .home ? match.homeParticipant : match.awayParticipant
        let isMatchWinner = participant?.isWinner == true

        return HStack(spacing: 0) {
            HStack(spacing: 6) {
                Circle()
                    .fill(isMatchWinner ? Theme.tintColor : Theme.labelTertiary.opacity(0.3))
                    .frame(width: 6, height: 6)

                Text(participant?.userName ?? (side == .home ? "Joueur 1" : "Joueur 2"))
                    .font(.subheadline.weight(isMatchWinner ? .semibold : .regular))
                    .foregroundStyle(isMatchWinner ? Theme.labelPrimary : Theme.labelSecondary)
                    .lineLimit(1)
            }
            .frame(width: playerNameWidth, alignment: .leading)

            ForEach(sortedSets) { set in
                let score = scoreForSide(side, in: set)
                let isSetWinner = isWinnerOfSet(side: side, in: set)

                Text("\(score)")
                    .font(.subheadline.weight(isSetWinner ? .bold : .regular).monospacedDigit())
                    .foregroundStyle(isSetWinner ? Theme.labelPrimary : Theme.labelTertiary)
                    .contentTransition(.numericText())
                    .frame(minWidth: columnWidth)
            }
        }
        .padding(.horizontal, Theme.paddingCard)
        .padding(.vertical, 10)
    }

    // MARK: - Layout Constants

    private var playerNameWidth: CGFloat { 110 }
    private var columnWidth: CGFloat { 40 }

    // MARK: - Helpers

    private var thinDivider: some View {
        Rectangle()
            .fill(Theme.borderColorSubtle)
            .frame(height: 0.5)
            .padding(.horizontal, Theme.paddingCard)
    }

    private func scoreForSide(_ side: MatchSide, in set: MatchSetModel) -> Int {
        set.scores.first { $0.side == side.rawValue }?.games ?? 0
    }

    private func isWinnerOfSet(side: MatchSide, in set: MatchSetModel) -> Bool {
        guard let winnerId = set.winner else { return false }
        let participant = side == .home ? match.homeParticipant : match.awayParticipant
        return participant?.userId == winnerId
    }
}
