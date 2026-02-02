import SwiftUI
import SwiftData

struct FeedMatchRowView: View {
    let match: MatchModel
    let currentUserId: String
    var onShowAllComments: (() -> Void)?

    private var homePlayer: MatchParticipantModel? {
        match.homeParticipant
    }

    private var awayPlayer: MatchParticipantModel? {
        match.awayParticipant
    }

    private var currentUserWon: Bool {
        match.participants.first { $0.userId == currentUserId }?.isWinner ?? false
    }

    private var previewComments: [MatchCommentModel] {
        Array(match.comments.sorted { $0.createdAt > $1.createdAt }.prefix(2))
    }

    private var hasMoreComments: Bool {
        match.comments.count > 2
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


                    Text(currentUserWon ? "Victoire" : "Défaite")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(currentUserWon ? Color.green : Color.red)
                        .clipShape(Capsule())

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

            // Comments preview section
            if !previewComments.isEmpty {
                commentsPreviewSection
            }
        }
        .padding(Theme.paddingCard)
        .background(Theme.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous)
                .strokeBorder(Theme.borderColor, lineWidth: Theme.borderWidthSubtle)
        }
    }

    // MARK: - Comments Preview

    @ViewBuilder
    private var commentsPreviewSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Divider()

            ForEach(previewComments) { comment in
                commentPreviewRow(comment: comment)
            }

            if hasMoreComments {
                Button {
                    onShowAllComments?()
                } label: {
                    Text("Voir les \(match.comments.count) commentaires")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                .buttonStyle(.plain)
            }
        }
    }

    @ViewBuilder
    private func commentPreviewRow(comment: MatchCommentModel) -> some View {
        HStack(alignment: .center, spacing: 8) {
            commentAvatar(comment: comment)

            (Text(comment.userName).fontWeight(.semibold) + Text(" ") + Text(comment.content))
                .font(.caption)
                .lineLimit(2)
        }
    }

    @ViewBuilder
    private func commentAvatar(comment: MatchCommentModel) -> some View {
        Group {
            if let imageURL = comment.cacheBustedImageURL() {
                CachedAsyncImage(url: imageURL) { image in
                    image
                        .resizable()
                        .scaledToFill()
                } placeholder: {
                    initialsPlaceholder(initials: comment.userInitials, size: 24)
                }
            } else {
                initialsPlaceholder(initials: comment.userInitials, size: 24)
            }
        }
        .frame(width: 24, height: 24)
        .clipShape(Circle())
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
        Group {
            if let imageURL = participant?.cacheBustedImageURL() {
                CachedAsyncImage(url: imageURL) { image in
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

    private var formattedDate: String {
        let date = match.finishedAt ?? match.startedAt ?? match.createdAt
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "fr_FR")
        formatter.dateFormat = "EEE. d MMM"
        return formatter.string(from: date).capitalized
    }
}
