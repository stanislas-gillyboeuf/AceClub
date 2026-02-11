//
//  MatchScoreCard.swift
//  AceClub
//
//  Hero score card for MatchDetailView - tennis match card style
//

import SwiftUI

struct MatchScoreCard: View {
    let match: MatchModel
    let currentUserId: String

    var body: some View {
        VStack(spacing: 20) {
            // Status pill
            statusPill

            // Players + Score row
            HStack(spacing: 0) {
                playerColumn(
                    participant: match.homeParticipant,
                    clubName: match.homeOrganizationName,
                    isWinner: match.homeParticipant?.isWinner == true,
                    isLoser: match.isFinished && match.homeParticipant?.isWinner == false && match.winner != nil
                )

                // Central score / VS
                VStack(spacing: 6) {
                    if match.isScheduled && match.sets.isEmpty {
                        Text("VS")
                            .font(.system(size: 40, weight: .heavy, design: .rounded))
                            .foregroundStyle(Theme.labelTertiary.opacity(0.5))
                    } else {
                        Text(match.formattedMatchScore)
                            .font(.system(size: 56, weight: .heavy, design: .rounded))
                            .foregroundStyle(Theme.labelPrimary)
                            .contentTransition(.numericText())
                    }

                    if !match.sets.isEmpty {
                        Text("SETS")
                            .font(.caption2.weight(.bold))
                            .foregroundStyle(Theme.labelTertiary)
                            .tracking(2)
                    }
                }
                .frame(minWidth: 90)

                playerColumn(
                    participant: match.awayParticipant,
                    clubName: match.awayOrganizationName,
                    isWinner: match.awayParticipant?.isWinner == true,
                    isLoser: match.isFinished && match.awayParticipant?.isWinner == false && match.winner != nil
                )
            }

            // Context line with thin divider
            VStack(spacing: 10) {
                Rectangle()
                    .fill(Theme.borderColorSubtle)
                    .frame(height: 0.5)

                contextLine
            }
        }
        .padding(Theme.paddingCard)
        .padding(.vertical, 8)
        .frame(maxWidth: .infinity)
        .cardStyle(cornerRadius: Theme.cornerRadiusLarge)
    }

    // MARK: - Status Pill

    private var statusPill: some View {
        HStack(spacing: 6) {
            if match.isOngoing {
                Circle()
                    .fill(.red)
                    .frame(width: 6, height: 6)
            }

            Text(match.matchStatus.displayName.uppercased())
                .font(.caption2.weight(.bold))
                .tracking(1.5)
                .foregroundStyle(statusColor)
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 4)
        .background(statusColor.opacity(0.1))
        .clipShape(Capsule())
    }

    // MARK: - Player Column

    private func playerColumn(
        participant: MatchParticipantModel?,
        clubName: String?,
        isWinner: Bool,
        isLoser: Bool
    ) -> some View {
        VStack(spacing: 8) {
            ZStack(alignment: .top) {
                participantAvatar(participant: participant, size: 64)

                if isWinner {
                    Image(systemName: "crown.fill")
                        .font(.system(size: 16))
                        .foregroundStyle(.yellow)
                        .shadow(color: .yellow.opacity(0.5), radius: 4)
                        .offset(y: -10)
                }
            }

            VStack(spacing: 2) {
                Text(participant?.userName ?? "Joueur")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(Theme.labelPrimary)
                    .lineLimit(1)

                if let clubName {
                    Text(clubName)
                        .font(.caption2)
                        .foregroundStyle(Theme.labelTertiary)
                        .lineLimit(1)
                }
            }
        }
        .frame(maxWidth: .infinity)
        .opacity(isLoser ? 0.6 : 1.0)
    }

    // MARK: - Context Line

    @ViewBuilder
    private var contextLine: some View {
        switch match.matchStatus {
        case .scheduled:
            if let scheduledAt = match.scheduledAt {
                Text(scheduledAt.formatted(date: .abbreviated, time: .shortened))
                    .font(.footnote)
                    .foregroundStyle(Theme.labelTertiary)
            }
        case .ongoing:
            if let startedAt = match.startedAt {
                Text("Depuis \(startedAt.formatted(date: .omitted, time: .shortened))")
                    .font(.footnote)
                    .foregroundStyle(Theme.labelTertiary)
            }
        case .finished:
            if let duration = match.formattedDuration {
                HStack(spacing: 4) {
                    Image(systemName: "timer")
                        .font(.caption2)
                    Text(duration)
                        .font(.footnote.weight(.medium))
                }
                .foregroundStyle(Theme.labelTertiary)
            } else if let finishedAt = match.formattedFinishedAt {
                Text(finishedAt)
                    .font(.footnote)
                    .foregroundStyle(Theme.labelTertiary)
            }
        }
    }

    // MARK: - Avatar

    @ViewBuilder
    private func participantAvatar(participant: MatchParticipantModel?, size: CGFloat) -> some View {
        if let imageURL = participant?.cacheBustedImageURL() {
            AsyncImage(url: imageURL) { phase in
                switch phase {
                case .success(let image):
                    image
                        .resizable()
                        .scaledToFill()
                        .frame(width: size, height: size)
                        .clipShape(Circle())
                case .failure, .empty:
                    avatarPlaceholder(initials: participant?.userInitials ?? "?", size: size)
                @unknown default:
                    avatarPlaceholder(initials: participant?.userInitials ?? "?", size: size)
                }
            }
        } else {
            avatarPlaceholder(initials: participant?.userInitials ?? "?", size: size)
        }
    }

    private func avatarPlaceholder(initials: String, size: CGFloat) -> some View {
        Circle()
            .fill(Theme.tintColor.opacity(0.15))
            .frame(width: size, height: size)
            .overlay {
                Text(initials)
                    .font(.callout.weight(.semibold))
                    .foregroundStyle(Theme.tintColor)
            }
    }

    // MARK: - Helpers

    private var statusColor: Color {
        switch match.matchStatus {
        case .scheduled: return .blue
        case .ongoing: return .red
        case .finished: return .green
        }
    }
}
