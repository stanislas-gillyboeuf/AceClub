import SwiftUI

struct ProfileHeaderCard: View {
    let user: User

    var body: some View {
        VStack(spacing: 12) {
            // Avatar
            if let imageURL = user.imageURL {
                AsyncImage(url: imageURL) { image in
                    image
                        .resizable()
                        .scaledToFill()
                } placeholder: {
                    ProgressView()
                }
                .frame(width: 80, height: 80)
                .clipShape(Circle())
            } else {
                Circle()
                    .fill(Color.gray.opacity(0.2))
                    .frame(width: 80, height: 80)
                    .overlay(
                        Text(user.name.prefix(1).uppercased())
                            .font(.system(size: 32))
                            .foregroundColor(.secondary)
                    )
            }

            // User Name
            Text(user.name)
                .font(.title3)
                .fontWeight(.semibold)

            // Email
            Text(user.email)
                .font(.subheadline)
                .foregroundColor(.secondary)

            // Email Verification
            if !(user.emailVerified ?? false) {
                Text("Email non vérifié")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            // Role (if exists)
            if let role = user.role {
                Text(role.capitalized)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding(.vertical, 20)
    }
}
