import SwiftUI
import PhotosUI

struct EditableAvatarView: View {
    let currentImageURL: URL?
    let fallbackInitials: String
    @Binding var selectedImage: UIImage?
    var isUploading: Bool = false
    var size: CGFloat = 100

    @State private var selectedItem: PhotosPickerItem?

    var body: some View {
        PhotosPicker(selection: $selectedItem, matching: .images) {
            ZStack {
                // Avatar
                avatarContent
                    .frame(width: size, height: size)
                    .clipShape(Circle())
                    .overlay(
                        Circle()
                            .strokeBorder(Theme.borderColor, lineWidth: Theme.borderWidth)
                    )

                // Camera badge
                cameraBadge
                    .offset(x: size * 0.35, y: size * 0.35)

                // Loading overlay
                if isUploading {
                    Circle()
                        .fill(.ultraThinMaterial)
                        .frame(width: size, height: size)
                    ProgressView()
                }
            }
        }
        .buttonStyle(.plain)
        .onChange(of: selectedItem) { _, newItem in
            Task {
                if let data = try? await newItem?.loadTransferable(type: Data.self),
                   let image = UIImage(data: data) {
                    await MainActor.run {
                        selectedImage = image
                    }
                }
            }
        }
    }

    @ViewBuilder
    private var avatarContent: some View {
        if let selectedImage {
            Image(uiImage: selectedImage)
                .resizable()
                .scaledToFill()
        } else if let url = currentImageURL {
            AsyncImage(url: url) { phase in
                switch phase {
                case .success(let image):
                    image
                        .resizable()
                        .scaledToFill()
                case .failure:
                    initialsView
                case .empty:
                    ProgressView()
                @unknown default:
                    initialsView
                }
            }
        } else {
            initialsView
        }
    }

    private var initialsView: some View {
        ZStack {
            Theme.secondaryBackground
            Text(fallbackInitials)
                .font(.system(size: size * 0.35, weight: .semibold))
                .foregroundStyle(.secondary)
        }
    }

    private var cameraBadge: some View {
        ZStack {
            Circle()
                .fill(Theme.tintColor)
                .frame(width: size * 0.3, height: size * 0.3)
            Image(systemName: "camera.fill")
                .font(.system(size: size * 0.12))
                .foregroundStyle(.white)
        }
    }
}

#Preview {
    VStack(spacing: 24) {
        EditableAvatarView(
            currentImageURL: nil,
            fallbackInitials: "NB",
            selectedImage: .constant(nil)
        )

        EditableAvatarView(
            currentImageURL: URL(string: "https://example.com/avatar.jpg"),
            fallbackInitials: "NB",
            selectedImage: .constant(nil),
            isUploading: true
        )
    }
    .padding()
}
