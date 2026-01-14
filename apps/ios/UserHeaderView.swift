import SwiftUI

struct UserHeaderView: View {
    let user: HeaderUser
    
    var body: some View {
        HStack(spacing: 12) {
            AvatarView(imageURL: user.imageURL)
                .frame(width: 56, height: 56)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(user.name)
                    .font(.headline)
                Text(user.email)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                
                HStack(spacing: 6) {
                    Image(systemName: user.isEmailVerified ? "checkmark.seal.fill" : "exclamationmark.triangle.fill")
                        .foregroundStyle(user.isEmailVerified ? .green : .orange)
                        .imageScale(.small)
                    Text(user.emailVerificationStatusText)
                        .font(.caption)
                        .foregroundStyle(user.isEmailVerified ? .green : .orange)
                }
            }
            Spacer()
        }
        .padding(.vertical, 8)
    }
}

private struct AvatarView: View {
    let imageURL: URL?
    
    var body: some View {
        Group {
            if let imageURL {
                AsyncImage(url: imageURL) { phase in
                    switch phase {
                    case .empty:
                        ProgressView()
                    case .success(let image):
                        image.resizable().scaledToFill()
                    case .failure:
                        placeholder
                    @unknown default:
                        placeholder
                    }
                }
            } else {
                placeholder
            }
        }
        .clipShape(Circle())
        .overlay(
            Circle().stroke(.quaternary, lineWidth: 1)
        )
    }
    
    private var placeholder: some View {
        ZStack {
            Circle().fill(Color.gray.opacity(0.15))
            Image(systemName: "person.crop.circle.fill")
                .font(.system(size: 28))
                .foregroundStyle(.gray.opacity(0.6))
        }
    }
}

// Minimal HeaderUser model for this view to be self-contained
struct HeaderUser {
    let id: String
    let name: String
    let email: String
    let emailVerified: Bool
    let image: String? // URL string
    let createdAt: String
    let updatedAt: String
    let role: String?
    let banned: Bool
    let banReason: String?
    let banExpires: String?
    
    var imageURL: URL? {
        guard let image = image else { return nil }
        return URL(string: image)
    }
    
    var isEmailVerified: Bool {
        emailVerified
    }
    
    var emailVerificationStatusText: String {
        emailVerified ? "Email Verified" : "Email Not Verified"
    }
}

#Preview {
    VStack(spacing: 16) {
        UserHeaderView(user: HeaderUser(
            id: "1",
            name: "Nicolas",
            email: "nicolas@impulselab.ai",
            emailVerified: false,
            image: nil as String?,
            createdAt: "",
            updatedAt: "",
            role: "admin",
            banned: false,
            banReason: nil as String?,
            banExpires: nil as String?
        ))
        
        UserHeaderView(user: HeaderUser(
            id: "2",
            name: "Alice",
            email: "alice@example.com",
            emailVerified: true,
            image: "https://picsum.photos/200",
            createdAt: "",
            updatedAt: "",
            role: nil as String?,
            banned: false,
            banReason: nil as String?,
            banExpires: nil as String?
        ))
    }
    .padding()
}

