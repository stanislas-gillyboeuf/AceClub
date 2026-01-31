import SwiftUI
import PhotosUI

struct OrganizationHeaderCard: View {
    let organization: Organization
    let selectedLogo: UIImage?
    let isUploadingLogo: Bool
    let isAdmin: Bool
    @Binding var selectedLogoItem: PhotosPickerItem?
    let onSaveLogo: () async -> Void
    let onEditOrganization: () -> Void

    var body: some View {
        VStack(spacing: 20) {
            // Logo
            logoSection

            // Organization info
            VStack(spacing: 6) {
                Text(organization.name)
                    .font(.title2.weight(.bold))
                    .multilineTextAlignment(.center)

                Text("@\(organization.slug)")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            // Save logo button if logo is selected
            if selectedLogo != nil {
                saveLogoButton
            }

            // Edit button for admins
            if isAdmin {
                editButton
            }
        }
        .frame(maxWidth: .infinity)
        .padding(24)
        .background(Theme.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusLarge, style: .continuous))
    }

    // MARK: - Subviews

    @ViewBuilder
    private var logoSection: some View {
        if isAdmin {
            PhotosPicker(selection: $selectedLogoItem, matching: .images) {
                logoContent
            }
            .buttonStyle(.plain)
        } else {
            logoContent
        }
    }

    private var logoContent: some View {
        ZStack {
            // Logo image
            Group {
                if let selectedLogo {
                    Image(uiImage: selectedLogo)
                        .resizable()
                        .scaledToFill()
                } else if let logoURL = organization.logoURL {
                    AsyncImage(url: logoURL) { phase in
                        switch phase {
                        case .success(let image):
                            image
                                .resizable()
                                .scaledToFill()
                        case .failure:
                            logoPlaceholder
                        case .empty:
                            ProgressView()
                        @unknown default:
                            logoPlaceholder
                        }
                    }
                } else {
                    logoPlaceholder
                }
            }
            .frame(width: 100, height: 100)
            .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: 20, style: .continuous)
                    .strokeBorder(Theme.borderColor, lineWidth: Theme.borderWidth)
            }

            // Camera badge for admins
            if isAdmin {
                cameraBadge
                    .offset(x: 35, y: 35)
            }

            // Loading overlay
            if isUploadingLogo {
                RoundedRectangle(cornerRadius: 20, style: .continuous)
                    .fill(.ultraThinMaterial)
                    .frame(width: 100, height: 100)
                ProgressView()
            }
        }
    }

    private var logoPlaceholder: some View {
        ZStack {
            Theme.secondaryBackground
            Image(systemName: "building.2.fill")
                .font(.system(size: 36))
                .foregroundStyle(.secondary)
        }
    }

    private var cameraBadge: some View {
        ZStack {
            Circle()
                .fill(Theme.tintColor)
                .frame(width: 30, height: 30)
            Image(systemName: "camera.fill")
                .font(.system(size: 12))
                .foregroundStyle(.white)
        }
    }

    private var saveLogoButton: some View {
        Button {
            Task {
                await onSaveLogo()
            }
        } label: {
            HStack(spacing: 8) {
                if isUploadingLogo {
                    ProgressView()
                        .tint(.white)
                } else {
                    Image(systemName: "checkmark.circle.fill")
                }
                Text("Enregistrer le logo")
            }
            .font(.subheadline.weight(.semibold))
            .foregroundStyle(.white)
            .padding(.horizontal, 20)
            .padding(.vertical, 12)
            .background(Theme.tintColor)
            .clipShape(Capsule())
        }
        .disabled(isUploadingLogo)
    }

    private var editButton: some View {
        Button {
            onEditOrganization()
        } label: {
            HStack(spacing: 6) {
                Image(systemName: "pencil")
                Text("Modifier")
            }
            .font(.subheadline.weight(.medium))
            .foregroundStyle(Theme.tintColor)
        }
    }
}
