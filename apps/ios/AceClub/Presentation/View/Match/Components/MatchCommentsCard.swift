//
//  MatchCommentsCard.swift
//  AceClub
//
//  Comments card for finished matches
//

import SwiftUI

struct MatchCommentsCard: View {
    let match: MatchModel
    let currentUserId: String
    let isParticipant: Bool
    var onAddComment: () -> Void
    var onEditComment: () -> Void

    private var hasUserCommented: Bool {
        match.comments.contains { $0.userId == currentUserId }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Section header
            Text("COMMENTAIRES")
                .font(.caption.weight(.bold))
                .foregroundStyle(Theme.labelTertiary)
                .tracking(1.5)

            if match.comments.isEmpty {
                // Empty state
                VStack(spacing: 8) {
                    Image(systemName: "bubble.left.and.bubble.right")
                        .font(.system(size: 28))
                        .foregroundStyle(Theme.labelTertiary)
                    Text("Aucun commentaire")
                        .font(.subheadline)
                        .foregroundStyle(Theme.labelTertiary)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
            } else {
                // Comments list
                VStack(spacing: 0) {
                    ForEach(Array(match.comments.sorted { $0.createdAt < $1.createdAt }.enumerated()), id: \.element.id) { index, comment in
                        if index > 0 {
                            Rectangle()
                                .fill(Theme.borderColorSubtle)
                                .frame(height: 0.5)
                        }
                        commentRow(comment: comment)
                            .padding(.vertical, 12)
                    }
                }
            }

            // Add comment button
            if !hasUserCommented && isParticipant {
                Button {
                    onAddComment()
                } label: {
                    HStack(spacing: 6) {
                        Image(systemName: "plus.bubble")
                            .font(.caption)
                        Text("Ajouter un commentaire")
                            .font(.subheadline.weight(.medium))
                    }
                    .foregroundStyle(Theme.tintColor)
                }
            }
        }
        .padding(Theme.paddingCard)
        .cardStyle(cornerRadius: Theme.cornerRadiusMedium)
    }

    // MARK: - Comment Row

    private func commentRow(comment: MatchCommentModel) -> some View {
        HStack(alignment: .top, spacing: 12) {
            commentAvatar(comment: comment)

            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(comment.userName)
                        .font(.subheadline.weight(.medium))

                    if comment.wasEdited {
                        Text("(modifi\u{00e9})")
                            .font(.caption2)
                            .foregroundStyle(Theme.labelTertiary)
                    }

                    Spacer()

                    Text(comment.formattedDate)
                        .font(.caption)
                        .foregroundStyle(Theme.labelTertiary)
                }

                Text(comment.content)
                    .font(.body)
                    .foregroundStyle(Theme.labelPrimary)
            }
        }
        .contentShape(Rectangle())
        .onTapGesture {
            if comment.userId == currentUserId {
                onEditComment()
            }
        }
    }

    // MARK: - Comment Avatar

    @ViewBuilder
    private func commentAvatar(comment: MatchCommentModel) -> some View {
        if let imageURL = comment.cacheBustedImageURL() {
            AsyncImage(url: imageURL) { phase in
                switch phase {
                case .success(let image):
                    image
                        .resizable()
                        .scaledToFill()
                        .frame(width: 32, height: 32)
                        .clipShape(Circle())
                case .failure, .empty:
                    avatarPlaceholder(initials: comment.userInitials, size: 32)
                @unknown default:
                    avatarPlaceholder(initials: comment.userInitials, size: 32)
                }
            }
        } else {
            avatarPlaceholder(initials: comment.userInitials, size: 32)
        }
    }

    private func avatarPlaceholder(initials: String, size: CGFloat) -> some View {
        Circle()
            .fill(Theme.tintColor.opacity(0.2))
            .frame(width: size, height: size)
            .overlay {
                Text(initials)
                    .font(size > 40 ? .subheadline.weight(.semibold) : .caption.weight(.semibold))
                    .foregroundStyle(Theme.tintColor)
            }
    }
}
