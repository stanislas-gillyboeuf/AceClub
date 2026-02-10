import SwiftUI
import PhotosUI

struct OnboardingPhotoStepView: View {
    @ObservedObject var viewModel: OnboardingViewModel
    @Environment(AuthViewModel.self) private var authViewModel

    @State private var selectedItem: PhotosPickerItem?

    private var fallbackInitials: String {
        authViewModel.currentUser?.initials ?? "?"
    }

    var body: some View {
        VStack(spacing: 0) {
            OnboardingStepHeader(
                icon: "camera.fill",
                title: "Ta photo de profil",
                subtitle: "Ajoute une photo pour que les autres joueurs te reconnaissent."
            )

            VStack(spacing: 20) {
                PhotosPicker(selection: $selectedItem, matching: .images) {
                    ZStack {
                        avatarContent
                            .frame(width: 160, height: 160)
                            .clipShape(Circle())
                            .overlay(
                                Circle()
                                    .strokeBorder(Theme.borderColor, lineWidth: Theme.borderWidth)
                            )

                        // Camera badge
                        ZStack {
                            Circle()
                                .fill(Theme.tintColor)
                                .frame(width: 44, height: 44)
                            Image(systemName: "camera.fill")
                                .font(.system(size: 18))
                                .foregroundStyle(.white)
                        }
                        .offset(x: 56, y: 56)
                    }
                }
                .buttonStyle(.plain)

                if viewModel.selectedProfileImage == nil {
                    Text("Appuie pour choisir une photo")
                        .font(.subheadline)
                        .foregroundStyle(Theme.labelSecondary)
                }
            }
            .padding(.top, 32)

            Spacer()
        }
        .onChange(of: selectedItem) { _, newItem in
            Task {
                if let data = try? await newItem?.loadTransferable(type: Data.self),
                   let image = UIImage(data: data) {
                    await MainActor.run {
                        viewModel.selectedProfileImage = image
                        viewModel.uploadedProfileImageURL = nil
                    }
                }
            }
        }
    }

    @ViewBuilder
    private var avatarContent: some View {
        if let selectedImage = viewModel.selectedProfileImage {
            Image(uiImage: selectedImage)
                .resizable()
                .scaledToFill()
        } else {
            ZStack {
                Theme.secondaryBackground
                Text(fallbackInitials)
                    .font(.system(size: 56, weight: .semibold))
                    .foregroundStyle(.secondary)
            }
        }
    }
}
