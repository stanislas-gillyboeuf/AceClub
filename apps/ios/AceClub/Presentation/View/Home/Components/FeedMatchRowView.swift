import SwiftUI
import SwiftData

struct FeedMatchRowView: View {
    let match: MatchModel
    let currentUserId: String

    private var homePlayer: MatchParticipantModel? {
        match.homeParticipant
    }

    private var awayPlayer: MatchParticipantModel? {
        match.awayParticipant
    }

    private var isCurrentUserMatch: Bool {
        match.participants.contains { $0.userId == currentUserId }
    }

    private var currentUserWon: Bool {
        match.participants.first { $0.userId == currentUserId }?.isWinner ?? false
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Label {
                    Text(formattedDate)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                } icon: {
                    Image(systemName: "calendar")
                        .foregroundStyle(Theme.tintColor)
                }

                Spacer()

                if isCurrentUserMatch {
                    Text(currentUserWon ? "Victoire" : "Défaite")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(currentUserWon ? Color.green : Color.red)
                        .clipShape(Capsule())
                }
            }

            HStack(alignment: .center, spacing: 12) {
                playerView(participant: homePlayer, isWinner: homePlayer?.isWinner ?? false)

                Text("vs")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)

                playerView(participant: awayPlayer, isWinner: awayPlayer?.isWinner ?? false)

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
        .background(Theme.secondaryBackground)
        .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous)
                .strokeBorder(Theme.borderColor, lineWidth: Theme.borderWidthSubtle)
        }
    }

    @ViewBuilder
    private func playerView(participant: MatchParticipantModel?, isWinner: Bool) -> some View {
        HStack(spacing: 8) {
            playerAvatar(participant: participant)

            VStack(alignment: .leading, spacing: 2) {
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
    }

    @ViewBuilder
    private func playerAvatar(participant: MatchParticipantModel?) -> some View {
        ZStack {
            Circle()
                .fill(Color(.tertiarySystemFill))

            if let initials = participant?.userInitials {
                Text(initials)
                    .font(.system(size: 14, weight: .semibold, design: .rounded))
                    .foregroundStyle(.secondary)
            }

            if let imageURLString = participant?.userImage,
               let imageURL = URL(string: imageURLString) {
                AsyncImage(url: imageURL) { phase in
                    switch phase {
                    case .success(let image):
                        image
                            .resizable()
                            .scaledToFill()
                    case .empty:
                        ProgressView()
                            .tint(Theme.tintColor)
                    case .failure:
                        EmptyView()
                    @unknown default:
                        EmptyView()
                    }
                }
            }
        }
        .frame(width: 40, height: 40)
        .clipShape(Circle())
    }

    private var formattedDate: String {
        let date = match.finishedAt ?? match.startedAt ?? match.createdAt
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "fr_FR")
        formatter.dateFormat = "EEE. d MMM"
        return formatter.string(from: date).capitalized
    }
}
