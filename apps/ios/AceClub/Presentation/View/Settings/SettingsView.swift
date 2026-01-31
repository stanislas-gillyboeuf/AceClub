import SwiftUI
import UIKit

struct SettingsView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(AuthViewModel.self) private var authViewModel
    @StateObject private var viewModel = SettingsViewModel()
    @State private var showClubSelection = false
    @State private var notificationsEnabled = false
    var onProfileUpdated: ((User) -> Void)?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    if viewModel.isLoadingPreferences {
                        loadingView
                    } else {
                        profilePhotoSection
                        personalInfoSection
                        clubSection
                        sportSection

                        if viewModel.selectedSport != nil {
                            skillLevelSection
                        }

                        notificationsSection

                        if let error = viewModel.errorMessage {
                            errorBanner(error)
                        }

                        if let success = viewModel.successMessage {
                            successBanner(success)
                        }
                    }
                }
                .padding(.horizontal, Theme.paddingHorizontal)
                .padding(.vertical, 16)
            }
            .background(Theme.primaryBackground)
            .navigationTitle("Paramètres")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Fermer") {
                        dismiss()
                    }
                }

                ToolbarItem(placement: .confirmationAction) {
                    Button("Enregistrer") {
                        Task {
                            if let updatedUser = await viewModel.save() {
                                onProfileUpdated?(updatedUser)
                                dismiss()
                            }
                        }
                    }
                    .disabled(!viewModel.canSave || viewModel.isSaving)
                }
            }
            .task {
                if let user = authViewModel.currentUser {
                    await viewModel.loadData(user: user)
                }
                await NotificationManager.shared.checkPermissionStatus()
                notificationsEnabled = NotificationManager.shared.isPermissionGranted
            }
            .sheet(isPresented: $showClubSelection) {
                ClubSelectionView(viewModel: viewModel)
            }
        }
    }

    // MARK: - Loading View

    private var loadingView: some View {
        VStack(spacing: 16) {
            ProgressView()
            Text("Chargement...")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 40)
        .background(Theme.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
    }

    // MARK: - Profile Photo Section

    private var profilePhotoSection: some View {
        VStack(alignment: .center, spacing: 12) {
            sectionHeader(title: "Photo de profil", icon: "camera.fill")
                .frame(maxWidth: .infinity, alignment: .leading)

            EditableAvatarView(
                currentImageURL: authViewModel.currentUser?.imageURL,
                fallbackInitials: authViewModel.currentUser?.initials ?? "?",
                selectedImage: $viewModel.selectedImage,
                isUploading: viewModel.isUploadingImage,
                size: 100
            )
            .frame(maxWidth: .infinity)

            Text("Appuyez pour modifier")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding(16)
        .background(Theme.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
    }

    // MARK: - Personal Info Section

    private var personalInfoSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionHeader(title: "Informations personnelles", icon: "person.fill")

            VStack(spacing: 0) {
                inputRow(title: "Nom complet") {
                    TextField("Entrer votre nom", text: $viewModel.name)
                        .textContentType(.name)
                        .autocorrectionDisabled()
                }

                Divider()
                    .padding(.leading, 16)

                inputRow(title: "Téléphone") {
                    TextField("Entrer votre numéro", text: $viewModel.phoneNumber)
                        .textContentType(.telephoneNumber)
                        .keyboardType(.phonePad)
                        .onChange(of: viewModel.phoneNumber) { _, newValue in
                            let allowed = CharacterSet(charactersIn: "+0123456789 ()-")
                            let filtered = newValue.filter { character in
                                character.unicodeScalars.allSatisfy { allowed.contains($0) }
                            }
                            if filtered != newValue {
                                viewModel.phoneNumber = filtered
                            }
                        }
                }
            }
            .background(Theme.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
        }
    }

    // MARK: - Club Section

    private var clubSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionHeader(title: "Club", icon: "building.2.fill")

            Button {
                showClubSelection = true
            } label: {
                HStack {
                    Text(viewModel.selectedOrganization?.name ?? "Sélectionner un club")
                        .foregroundStyle(viewModel.selectedOrganization != nil ? .primary : .secondary)

                    Spacer()

                    Image(systemName: "chevron.right")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(.tertiary)
                }
                .padding(16)
                .background(Theme.cardBackground)
                .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
            }
            .buttonStyle(.plain)
        }
    }

    // MARK: - Sport Section

    private var sportSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionHeader(title: "Sport", icon: "figure.tennis")

            VStack(spacing: 0) {
                ForEach(Array(Sport.allCases.enumerated()), id: \.element.id) { index, sport in
                    Button {
                        viewModel.selectSport(sport)
                    } label: {
                        HStack(spacing: 12) {
                            Image(systemName: sport.icon)
                                .font(.body)
                                .foregroundStyle(viewModel.selectedSport == sport ? Theme.tintColor : .secondary)
                                .frame(width: 24)

                            Text(sport.displayName)
                                .foregroundStyle(.primary)

                            Spacer()

                            if viewModel.selectedSport == sport {
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundStyle(Theme.tintColor)
                            }
                        }
                        .padding(16)
                    }
                    .buttonStyle(.plain)

                    if index < Sport.allCases.count - 1 {
                        Divider()
                            .padding(.leading, 52)
                    }
                }
            }
            .background(Theme.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
        }
    }

    // MARK: - Notifications Section

    private var notificationsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionHeader(title: "Notifications", icon: "bell.fill")

            VStack(spacing: 0) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Notifications push")
                            .foregroundStyle(.primary)

                        Text("Recevez des alertes pour les matchs et invitations")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }

                    Spacer()

                    Toggle("", isOn: $notificationsEnabled)
                        .labelsHidden()
                        .onChange(of: notificationsEnabled) { _, newValue in
                            if newValue {
                                Task {
                                    let granted = await NotificationManager.shared.requestPermission()
                                    if !granted {
                                        notificationsEnabled = false
                                        // Open settings if permission was denied
                                        if let url = URL(string: UIApplication.openSettingsURLString) {
                                            await UIApplication.shared.open(url)
                                        }
                                    }
                                }
                            }
                        }
                }
                .padding(16)
            }
            .background(Theme.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
        }
    }

    // MARK: - Skill Level Section

    private var skillLevelSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionHeader(title: "Niveau", icon: "chart.bar.fill")

            if let sport = viewModel.selectedSport {
                VStack(spacing: 0) {
                    ForEach(Array(SkillLevel.levels(for: sport).enumerated()), id: \.element.id) { index, level in
                        let levels = SkillLevel.levels(for: sport)

                        Button {
                            viewModel.selectedSkillLevel = level
                        } label: {
                            HStack {
                                Text(level.displayName)
                                    .foregroundStyle(.primary)

                                Spacer()

                                if viewModel.selectedSkillLevel == level {
                                    Image(systemName: "checkmark.circle.fill")
                                        .foregroundStyle(Theme.tintColor)
                                }
                            }
                            .padding(16)
                        }
                        .buttonStyle(.plain)

                        if index < levels.count - 1 {
                            Divider()
                                .padding(.leading, 16)
                        }
                    }
                }
                .background(Theme.cardBackground)
                .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
            }
        }
    }

    // MARK: - Helpers

    private func sectionHeader(title: String, icon: String) -> some View {
        Label(title, systemImage: icon)
            .font(.subheadline.weight(.semibold))
            .foregroundStyle(.secondary)
            .textCase(.uppercase)
    }

    private func inputRow<Content: View>(title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)

            content()
        }
        .padding(16)
    }

    private func errorBanner(_ message: String) -> some View {
        HStack(spacing: 12) {
            Image(systemName: "exclamationmark.circle.fill")
                .foregroundStyle(.red)

            Text(message)
                .font(.subheadline)
                .foregroundStyle(.primary)

            Spacer()
        }
        .padding(16)
        .background(Color.red.opacity(0.1))
        .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
    }

    private func successBanner(_ message: String) -> some View {
        HStack(spacing: 12) {
            Image(systemName: "checkmark.circle.fill")
                .foregroundStyle(.green)

            Text(message)
                .font(.subheadline)
                .foregroundStyle(.primary)

            Spacer()
        }
        .padding(16)
        .background(Color.green.opacity(0.1))
        .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
    }
}

// MARK: - Club Selection View

struct ClubSelectionView: View {
    @ObservedObject var viewModel: SettingsViewModel
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Search bar
                HStack(spacing: 12) {
                    Image(systemName: "magnifyingglass")
                        .foregroundStyle(.secondary)

                    TextField("Rechercher un club...", text: $viewModel.searchQuery)
                        .autocorrectionDisabled()
                        .onChange(of: viewModel.searchQuery) { _, _ in
                            viewModel.onSearchQueryChanged()
                        }

                    if !viewModel.searchQuery.isEmpty {
                        Button {
                            viewModel.searchQuery = ""
                        } label: {
                            Image(systemName: "xmark.circle.fill")
                                .foregroundStyle(.secondary)
                        }
                    }
                }
                .padding(12)
                .background(Theme.cardBackground)
                .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusSmall, style: .continuous))
                .padding(.horizontal, Theme.paddingHorizontal)
                .padding(.vertical, 12)

                // Content
                if viewModel.isLoadingOrganizations {
                    VStack(spacing: 16) {
                        Spacer()
                        ProgressView()
                        Spacer()
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if viewModel.organizations.isEmpty {
                    VStack(spacing: 16) {
                        ContentUnavailableView {
                            Label("Aucun club trouvé", systemImage: "building.2")
                        } description: {
                            Text("Essaie avec un autre nom")
                        }
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    ScrollView {
                        LazyVStack(spacing: 0) {
                            ForEach(Array(viewModel.organizations.enumerated()), id: \.element.id) { index, org in
                                Button {
                                    viewModel.selectedOrganization = org
                                    dismiss()
                                } label: {
                                    HStack {
                                        Text(org.name)
                                            .foregroundStyle(.primary)

                                        Spacer()

                                        if viewModel.selectedOrganization?.id == org.id {
                                            Image(systemName: "checkmark.circle.fill")
                                                .foregroundStyle(Theme.tintColor)
                                        }
                                    }
                                    .padding(16)
                                }
                                .buttonStyle(.plain)

                                if index < viewModel.organizations.count - 1 {
                                    Divider()
                                        .padding(.leading, 16)
                                }
                            }
                        }
                        .background(Theme.cardBackground)
                        .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
                        .padding(.horizontal, Theme.paddingHorizontal)
                        .padding(.top, 4)
                    }
                }
            }
            .background(Theme.primaryBackground)
            .navigationTitle("Choisir un club")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Fermer") {
                        dismiss()
                    }
                }
            }
            .task {
                if viewModel.organizations.isEmpty {
                    await viewModel.searchOrganizations()
                }
            }
        }
    }
}
