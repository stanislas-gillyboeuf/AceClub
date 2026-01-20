import SwiftUI

struct ProfileHeaderCard: View {
    let user: User

    var body: some View {
        VStack(spacing: 16) {
            // Avatar
            ZStack {
                Circle()
                    .fill(
                        Color.gray.opacity(0.15)
                    )
                    .frame(width: 100, height: 100)

                if let imageURL = user.imageURL {
                    AsyncImage(url: imageURL) { image in
                        image
                            .resizable()
                            .scaledToFill()
                    } placeholder: {
                        ProgressView()
                    }
                    .frame(width: 100, height: 100)
                    .clipShape(Circle())
                } else {
                    Text(user.name.prefix(2).uppercased())
                        .font(.system(size: 36, weight: .bold))
                        .foregroundColor(.white)
                }
            }
            .shadow(color: .black.opacity(0.1), radius: 10, x: 0, y: 5)

            // User Name
            Text(user.name)
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(.primary)

            // Email
            HStack(spacing: 4) {
                Image(systemName: "envelope.fill")
                    .font(.caption)
                    .foregroundColor(.secondary)
                Text(user.email)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }

            // Email Verification Badge
            HStack(spacing: 6) {
                Image(systemName: user.emailVerified ? "checkmark.seal.fill" : "exclamationmark.triangle.fill")
                    .font(.caption)
                    .foregroundColor(user.emailVerified ? .green : .orange)
                Text(user.emailVerificationStatusText)
                    .font(.caption)
                    .foregroundColor(user.emailVerified ? .green : .orange)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(
                Capsule()
                    .fill(user.emailVerified ? Color.green.opacity(0.1) : Color.orange.opacity(0.1))
            )

            // Role Badge (if exists)
            if let role = user.role {
                HStack(spacing: 6) {
                    Image(systemName: "shield.fill")
                        .font(.caption)
                    Text(role.capitalized)
                        .font(.caption)
                        .fontWeight(.medium)
                }
                .foregroundColor(.blue)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(
                    Capsule()
                        .fill(Color.blue.opacity(0.1))
                )
            }

            // Member Since
            Text("Membre depuis \(DateFormatter.formatISODate(user.createdAt))")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding(24)
        .frame(maxWidth: .infinity)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(Color(.systemBackground))
                .shadow(color: .black.opacity(0.05), radius: 15, x: 0, y: 5)
        )
    }
}
