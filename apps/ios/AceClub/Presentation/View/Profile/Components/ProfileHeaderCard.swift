import SwiftUI

struct ProfileHeaderCard: View {
    let user: User

    var body: some View {
        HStack(spacing: 16) {
            avatar

            VStack(alignment: .leading, spacing: 6) {
                Text(user.name.isEmpty ? "—" : user.name)
                    .font(.headline)
                    .foregroundStyle(.primary)
                    .lineLimit(1)

                Text(user.email)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .lineLimit(1)

            }

            Spacer(minLength: 0)
        }
        .padding(Theme.paddingCard)
        // Carte claire sur fond gris (plus lisible / “natif”)
        .background(Theme.secondaryBackground)
        .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusLarge, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: Theme.cornerRadiusLarge, style: .continuous)
                .strokeBorder(Theme.tintColor.opacity(0.18), lineWidth: 1)
        }
    }

    private var avatar: some View {
        ZStack {
            Circle()
                .fill(Color(.tertiarySystemFill))

            Text(initials(from: user.name))
                .font(.system(size: 26, weight: .semibold, design: .rounded))
                .foregroundStyle(.secondary)

            if let imageURL = user.imageURL {
                AsyncImage(url: imageURL) { phase in
                    switch phase {
                    case .empty:
                        ProgressView()
                            .tint(Theme.tintColor)
                    case .success(let image):
                        image
                            .resizable()
                            .scaledToFill()
                    case .failure:
                        EmptyView()
                    @unknown default:
                        EmptyView()
                    }
                }
            }
        }
        .frame(width: 72, height: 72)
        .clipShape(Circle())
        .background(Theme.primaryBackground)
        .accessibilityLabel("Avatar")
    }

    private func initials(from name: String) -> String {
        let parts = name
            .split(whereSeparator: { $0.isWhitespace })
            .prefix(2)
        let letters = parts.compactMap { $0.first }.map { String($0).uppercased() }
        let value = letters.joined()
        return value.isEmpty ? "?" : value
    }
}
