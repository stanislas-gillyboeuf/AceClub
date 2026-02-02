import SwiftUI

struct OngoingMatchCardView: View {
    let match: MatchModel
    let currentUserId: String

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("En cours")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.orange)
                    .clipShape(Capsule())

                Spacer()

                Text("Set \(match.sets.count)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            HStack(spacing: 8) {
                playerView(participant: match.homeParticipant)

                Spacer()

                Text(match.formattedMatchScore)
                    .font(.title3.weight(.bold))
                    .monospacedDigit()

                Spacer()

                playerView(participant: match.awayParticipant)
            }
        }
        .padding(12)
        .frame(width: 200)
        .background(Theme.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous)
                .strokeBorder(Color.orange.opacity(0.3), lineWidth: 2)
        }
    }

    @ViewBuilder
    private func playerView(participant: MatchParticipantModel?) -> some View {
        VStack(spacing: 4) {
            ZStack {
                Circle()
                    .fill(Color(.tertiarySystemFill))

                if let initials = participant?.userInitials {
                    Text(initials)
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(.secondary)
                }

                if let imageURL = participant?.cacheBustedImageURL() {
                    CachedAsyncImage(url: imageURL) { image in
                        image
                            .resizable()
                            .scaledToFill()
                    } placeholder: {
                        EmptyView()
                    }
                }
            }
            .frame(width: 32, height: 32)
            .clipShape(Circle())

            Text(participant?.userName ?? "N/A")
                .font(.caption2)
                .lineLimit(1)
        }
    }
}
