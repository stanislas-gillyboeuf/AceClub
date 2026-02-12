//
//  MatchSetsCard.swift
//  AceClub
//
//  Set scores card for MatchDetailView - fluffy card-per-set style
//

import SwiftUI

struct MatchSetsCard: View {
    let match: MatchModel

    private var sortedSets: [MatchSetModel] {
        match.sets.sorted { $0.setNumber < $1.setNumber }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            // Section header
            Text("SCORES PAR SET")
                .font(.caption.weight(.bold))
                .foregroundStyle(Theme.labelTertiary)
                .tracking(1.5)

            // Individual set cards
            ForEach(sortedSets) { set in
                setCard(set)
            }
        }
    }

    // MARK: - Set Card

    private func setCard(_ set: MatchSetModel) -> some View {
        let homeScore = scoreForSide(.home, in: set)
        let awayScore = scoreForSide(.away, in: set)
        let homeWins = homeScore > awayScore
        let awayWins = awayScore > homeScore

        return VStack(spacing: 16) {
            // Set header
            HStack {
                Text("Set \(set.setNumber)")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.primary)
                Spacer()
            }

            // Scoreboard
            HStack(spacing: 12) {
                // Home player
                playerScoreColumn(
                    name: match.homeParticipant?.userName ?? "Joueur 1",
                    score: homeScore,
                    isWinner: homeWins,
                    accentColor: .blue
                )

                // VS separator
                VStack(spacing: 4) {
                    Text("VS")
                        .font(.caption2.weight(.bold))
                        .foregroundStyle(.tertiary)
                }
                .frame(width: 32)

                // Away player
                playerScoreColumn(
                    name: match.awayParticipant?.userName ?? "Joueur 2",
                    score: awayScore,
                    isWinner: awayWins,
                    accentColor: Theme.accentOrange
                )
            }
        }
        .padding(Theme.paddingCard)
        .background(Theme.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusLarge, style: .continuous))
    }

    // MARK: - Player Score Column

    private func playerScoreColumn(
        name: String,
        score: Int,
        isWinner: Bool,
        accentColor: Color
    ) -> some View {
        VStack(spacing: 12) {
            // Player name with chevron
            HStack(spacing: 4) {
                if isWinner {
                    Image(systemName: "chevron.right")
                        .font(.caption2.weight(.bold))
                        .foregroundStyle(accentColor)
                }

                Text(name)
                    .font(.caption.weight(.medium))
                    .foregroundStyle(isWinner ? .primary : .secondary)
                    .lineLimit(1)
            }

            // Score display (read-only stepper style)
            Text("\(score)")
                .font(.system(size: 32, weight: .bold, design: .rounded))
                .frame(maxWidth: .infinity)
                .frame(minHeight: 52)
                .background(Theme.tertiaryBackground)
                .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
                .overlay {
                    if isWinner {
                        RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous)
                            .strokeBorder(accentColor.opacity(0.3), lineWidth: 1.5)
                    }
                }
        }
        .frame(maxWidth: .infinity)
    }

    // MARK: - Helpers

    private func scoreForSide(_ side: MatchSide, in set: MatchSetModel) -> Int {
        set.scores.first { $0.side == side.rawValue }?.games ?? 0
    }
}
