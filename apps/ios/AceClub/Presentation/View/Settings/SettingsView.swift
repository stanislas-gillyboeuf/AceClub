import SwiftUI

struct SettingsView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(AuthViewModel.self) private var authViewModel
    @StateObject private var viewModel = SettingsViewModel()
    @State private var showClubSelection = false
    var onProfileUpdated: ((User) -> Void)?

    var body: some View {
        NavigationStack {
            Form {
                if viewModel.isLoadingPreferences {
                    Section {
                        HStack {
                            Spacer()
                            ProgressView("Chargement...")
                            Spacer()
                        }
                    }
                } else {
                    // Personal Info Section
                    Section {
                        TextField("Nom complet", text: $viewModel.name)
                            .textContentType(.name)
                            .autocorrectionDisabled()

                        TextField("Numéro de téléphone", text: $viewModel.phoneNumber)
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
                    } header: {
                        Label("Informations personnelles", systemImage: "person.fill")
                    }

                    // Club Section
                    Section {
                        Button {
                            showClubSelection = true
                        } label: {
                            HStack {
                                Text("Club")
                                    .foregroundStyle(.primary)
                                Spacer()
                                Text(viewModel.selectedOrganization?.name ?? "Non sélectionné")
                                    .foregroundStyle(.secondary)
                                Image(systemName: "chevron.right")
                                    .font(.caption)
                                    .foregroundStyle(.tertiary)
                            }
                        }
                    } header: {
                        Label("Club", systemImage: "building.2.fill")
                    }

                    // Sport Section
                    Section {
                        ForEach(Sport.allCases) { sport in
                            Button {
                                viewModel.selectSport(sport)
                            } label: {
                                HStack {
                                    Image(systemName: sport.icon)
                                        .frame(width: 24)
                                    Text(sport.displayName)
                                    Spacer()
                                    if viewModel.selectedSport == sport {
                                        Image(systemName: "checkmark")
                                            .foregroundStyle(.accent)
                                    }
                                }
                            }
                            .foregroundStyle(.primary)
                        }
                    } header: {
                        Label("Sport", systemImage: "figure.tennis")
                    }

                    // Skill Level Section
                    if let sport = viewModel.selectedSport {
                        Section {
                            Picker("Niveau", selection: Binding(
                                get: { viewModel.selectedSkillLevel ?? SkillLevel.levels(for: sport).first! },
                                set: { viewModel.selectedSkillLevel = $0 }
                            )) {
                                ForEach(SkillLevel.levels(for: sport)) { level in
                                    Text(level.displayName).tag(level)
                                }
                            }
                            .pickerStyle(.wheel)
                        } header: {
                            Label("Niveau", systemImage: "chart.bar.fill")
                        }
                    }

                    // Error/Success Messages
                    if let error = viewModel.errorMessage {
                        Section {
                            Text(error)
                                .foregroundStyle(.red)
                        }
                    }

                    if let success = viewModel.successMessage {
                        Section {
                            Text(success)
                                .foregroundStyle(.green)
                        }
                    }
                }
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
            }
            .sheet(isPresented: $showClubSelection) {
                ClubSelectionView(viewModel: viewModel)
            }
        }
    }
}

// MARK: - Club Selection View

struct ClubSelectionView: View {
    @ObservedObject var viewModel: SettingsViewModel
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 16) {
                TextField("Rechercher un club...", text: $viewModel.searchQuery)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .autocorrectionDisabled()
                    .padding(.horizontal)
                    .padding(.top)
                    .onChange(of: viewModel.searchQuery) { _, _ in
                        viewModel.onSearchQueryChanged()
                    }

                if viewModel.isLoadingOrganizations {
                    VStack {
                        Spacer()
                        ProgressView()
                        Spacer()
                    }
                    .frame(maxWidth: .infinity)
                } else if viewModel.organizations.isEmpty {
                    ContentUnavailableView(
                        "Aucun club trouvé",
                        systemImage: "building.2",
                        description: Text("Essaie avec un autre nom")
                    )
                } else {
                    List(viewModel.organizations) { org in
                        Button {
                            viewModel.selectedOrganization = org
                            dismiss()
                        } label: {
                            HStack {
                                Text(org.name)
                                    .foregroundStyle(viewModel.selectedOrganization?.id == org.id ? .accent : .primary)
                                Spacer()
                                if viewModel.selectedOrganization?.id == org.id {
                                    Image(systemName: "checkmark.circle.fill")
                                        .foregroundStyle(.accent)
                                }
                            }
                        }
                    }
                    .listStyle(.plain)
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
        }
    }
}
