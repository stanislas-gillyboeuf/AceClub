import SwiftUI
import UIKit

struct SettingsView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(AuthViewModel.self) private var authViewModel
    @StateObject private var viewModel = SettingsViewModel()
    @State private var showClubSelection = false
    @State private var notificationsEnabled = false
    @State private var locationEnabled = false
    @StateObject private var locationManager = LocationManager()
    @State private var showDeleteAccountConfirmation = false
    @State private var isDeletingAccount = false
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
                        locationSection

                        LegalLinksSection()

                        dangerZoneSection

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
                locationEnabled = locationManager.isPermissionGranted
            }
            .onChange(of: locationManager.authorizationStatus) { _, _ in
                locationEnabled = locationManager.isPermissionGranted
            }
            .sheet(isPresented: $showClubSelection) {
                ClubSelectionView(viewModel: viewModel)
            }
            .confirmationDialog(
                "Supprimer mon compte",
                isPresented: $showDeleteAccountConfirmation,
                titleVisibility: .visible
            ) {
                Button("Supprimer définitivement", role: .destructive) {
                    Task {
                        await handleDeleteAccount()
                    }
                }
                Button("Annuler", role: .cancel) {}
            } message: {
                Text("Cette action est irréversible. Toutes vos données seront supprimées définitivement.")
            }
        }
        .presentationBackground(.regularMaterial)
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

    // MARK: - Location Section

    private var locationSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionHeader(title: "Localisation", icon: "location.fill")

            VStack(spacing: 0) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Localisation")
                            .foregroundStyle(.primary)

                        Text("Permet de trouver des joueurs proches de vous")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }

                    Spacer()

                    Toggle("", isOn: $locationEnabled)
                        .labelsHidden()
                        .onChange(of: locationEnabled) { _, newValue in
                            if newValue {
                                locationManager.requestPermission()
                                if !locationManager.isPermissionGranted {
                                    locationEnabled = false
                                    if let url = URL(string: UIApplication.openSettingsURLString) {
                                        UIApplication.shared.open(url)
                                    }
                                }
                            } else {
                                // Can't revoke programmatically, open Settings
                                if let url = URL(string: UIApplication.openSettingsURLString) {
                                    UIApplication.shared.open(url)
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
                            .contentShape(Rectangle())
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

    // MARK: - Danger Zone Section

    private var dangerZoneSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionHeader(title: "Zone de danger", icon: "exclamationmark.triangle.fill")

            Button {
                showDeleteAccountConfirmation = true
            } label: {
                HStack(spacing: 12) {
                    Image(systemName: "trash")
                        .font(.body)
                        .foregroundStyle(Theme.destructiveColor)
                        .frame(width: 24)

                    VStack(alignment: .leading, spacing: 2) {
                        Text("Supprimer mon compte")
                            .foregroundStyle(Theme.destructiveColor)

                        Text("Cette action est définitive et irréversible")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }

                    Spacer()

                    if isDeletingAccount {
                        ProgressView()
                    }
                }
                .padding(16)
            }
            .buttonStyle(.plain)
            .disabled(isDeletingAccount)
            .background(Theme.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
        }
    }

    private func handleDeleteAccount() async {
        isDeletingAccount = true
        await authViewModel.deleteAccount()
        isDeletingAccount = false
        dismiss()
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
                        Spacer()
                        Image(systemName: "building.2")
                            .font(.system(size: 40, weight: .light))
                            .foregroundStyle(.tertiary)
                        Text("Aucun club trouvé")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)

                        Button {
                            viewModel.showRequestClubSheet = true
                        } label: {
                            HStack(spacing: 6) {
                                Image(systemName: "plus.circle")
                                Text("Proposer mon club")
                            }
                        }
                        .font(.subheadline)
                        .foregroundStyle(Color.accentColor)
                        .padding(.top, 8)

                        Spacer()
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
                                    .contentShape(Rectangle())
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
            .sheet(isPresented: $viewModel.showRequestClubSheet) {
                SettingsRequestClubSheet(viewModel: viewModel)
            }
        }
        .presentationBackground(.regularMaterial)
    }
}

// MARK: - Request Club Sheet

struct SettingsRequestClubSheet: View {
    @ObservedObject var viewModel: SettingsViewModel
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                if viewModel.clubRequestSuccess {
                    successView
                } else {
                    formView
                }
            }
            .navigationTitle("Proposer un club")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Fermer") {
                        viewModel.resetClubRequest()
                        dismiss()
                    }
                }
            }
        }
        .presentationDetents([.medium])
        .presentationBackground(.regularMaterial)
    }

    private var formView: some View {
        VStack(spacing: 20) {
            VStack(alignment: .leading, spacing: 6) {
                Text("Ton club n'est pas encore disponible ?")
                    .font(.headline)
                Text("Propose-le et nous l'ajouterons prochainement.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, Theme.paddingHorizontal)
            .padding(.top, 20)

            VStack(spacing: 12) {
                TextField("Nom du club", text: $viewModel.clubRequestName)
                    .aceTextFieldStyle()

                TextField("Ville", text: $viewModel.clubRequestCity)
                    .aceTextFieldStyle()
            }
            .padding(.horizontal, Theme.paddingHorizontal)

            if let message = viewModel.clubRequestMessage, !viewModel.clubRequestSuccess {
                Text(message)
                    .font(.footnote)
                    .foregroundStyle(.red)
                    .padding(.horizontal, Theme.paddingHorizontal)
            }

            Spacer()

            Button {
                Task {
                    await viewModel.submitClubRequest()
                }
            } label: {
                if viewModel.isSubmittingClubRequest {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                } else {
                    Text("Envoyer")
                }
            }
            .buttonStyle(.appPrimary)
            .disabled(!viewModel.canSubmitClubRequest || viewModel.isSubmittingClubRequest)
            .padding(.horizontal, Theme.paddingHorizontal)
            .padding(.bottom, 20)
        }
    }

    private var successView: some View {
        VStack(spacing: 20) {
            Spacer()

            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 60))
                .foregroundStyle(.green)

            Text("Demande envoyée !")
                .font(.title2)
                .fontWeight(.semibold)

            Text(viewModel.clubRequestMessage ?? "Nous avons bien reçu ta demande.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, Theme.paddingHorizontal)

            Spacer()

            Button("Fermer") {
                viewModel.resetClubRequest()
                dismiss()
            }
            .buttonStyle(.appPrimary)
            .padding(.horizontal, Theme.paddingHorizontal)
            .padding(.bottom, 20)
        }
    }
}
