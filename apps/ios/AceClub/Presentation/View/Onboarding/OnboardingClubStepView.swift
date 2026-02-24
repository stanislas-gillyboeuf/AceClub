import SwiftUI

struct OnboardingClubStepView: View {
    @ObservedObject var viewModel: OnboardingViewModel
    @FocusState private var isSearchFocused: Bool

    var body: some View {
        VStack(spacing: 0) {
            OnboardingStepHeader(
                icon: "building.2.fill",
                title: "Dans quel club joues-tu ?",
                subtitle: "Rejoins ton club pour acceder aux matchs et evenements."
            )

            // Search field
            HStack(spacing: 10) {
                Image(systemName: "magnifyingglass")
                    .foregroundStyle(Theme.labelSecondary)

                TextField("Rechercher un club...", text: $viewModel.searchQuery)
                    .textFieldStyle(.plain)
                    .autocorrectionDisabled()
                    .focused($isSearchFocused)
                    .submitLabel(.search)
                    .onChange(of: viewModel.searchQuery) { _, _ in
                        viewModel.onSearchQueryChanged()
                    }

                if !viewModel.searchQuery.isEmpty {
                    Button {
                        viewModel.searchQuery = ""
                        viewModel.onSearchQueryChanged()
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundStyle(Theme.labelTertiary)
                    }
                }
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 12)
            .inputFieldStyle()
            .padding(.horizontal, Theme.paddingHorizontal)
            .padding(.top, 16)

            // Content
            Group {
                if viewModel.isLoadingOrganizations {
                    loadingView
                } else if viewModel.organizations.isEmpty {
                    emptyView
                } else {
                    organizationsList
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
        .sheet(isPresented: $viewModel.showRequestClubSheet) {
            RequestClubSheet(viewModel: viewModel)
        }
        .sheet(isPresented: $viewModel.showPinSheet) {
            PinEntrySheet(
                isVerifying: viewModel.isVerifyingPin,
                errorMessage: viewModel.pinError,
                onValidate: { pinValue in
                    Task { await viewModel.validatePin(pinValue) }
                },
                onDismiss: {
                    viewModel.showPinSheet = false
                    viewModel.selectedOrganization = nil
                    viewModel.pin = ""
                    viewModel.isPinVerified = false
                }
            )
        }
    }

    private var loadingView: some View {
        VStack(spacing: 12) {
            Spacer()
            ProgressView()
            Text("Recherche...")
                .font(.subheadline)
                .foregroundStyle(Theme.labelSecondary)
            Spacer()
        }
    }

    private var emptyView: some View {
        VStack(spacing: 16) {
            Spacer()
            Image(systemName: "building.2")
                .font(.system(size: 40, weight: .light))
                .foregroundStyle(Theme.labelTertiary)
            Text("Aucun club trouve")
                .font(.subheadline)
                .foregroundStyle(Theme.labelSecondary)

            Button {
                viewModel.showRequestClubSheet = true
            } label: {
                HStack(spacing: 6) {
                    Image(systemName: "plus.circle")
                    Text("Proposer mon club")
                }
            }
            .buttonStyle(.appSecondary)
            .padding(.horizontal, Theme.paddingHorizontal)
            .padding(.top, 8)

            Spacer()
        }
    }

    private var organizationsList: some View {
        List {
            ForEach(viewModel.organizations) { org in
                OnboardingOrganizationRow(
                    name: org.name,
                    isSelected: viewModel.selectedOrganization?.id == org.id,
                    pinEnabled: org.pinEnabled,
                    pinValidated: viewModel.selectedOrganization?.id == org.id && viewModel.isPinVerified
                ) {
                    withAnimation(.easeOut(duration: 0.25)) {
                        viewModel.selectOrganization(org)
                    }
                    triggerHaptic()
                }
            }
        }
        .listStyle(.insetGrouped)
        .scrollDismissesKeyboard(.interactively)
    }

    private func triggerHaptic() {
        let generator = UISelectionFeedbackGenerator()
        generator.selectionChanged()
    }
}

// MARK: - Organization Row

private struct OnboardingOrganizationRow: View {
    let name: String
    let isSelected: Bool
    var pinEnabled: Bool = false
    var pinValidated: Bool = false
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                ZStack {
                    Circle()
                        .fill(isSelected ? Theme.tintColor.opacity(0.15) : Theme.borderColor.opacity(0.3))
                        .frame(width: 44, height: 44)

                    Text(String(name.prefix(1)).uppercased())
                        .font(.body.weight(.semibold))
                        .foregroundStyle(isSelected ? Theme.tintColor : Theme.labelSecondary)
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text(name)
                        .font(.body)
                        .foregroundStyle(isSelected ? Theme.tintColor : Theme.labelPrimary)
                        .lineLimit(1)

                    if pinEnabled {
                        HStack(spacing: 4) {
                            Image(systemName: pinValidated ? "lock.open.fill" : "lock.fill")
                                .font(.caption2)
                            Text(pinValidated ? "Code valide" : "Code requis")
                                .font(.caption)
                        }
                        .foregroundStyle(pinValidated ? .green : Theme.labelTertiary)
                    } else {
                        Text("Club")
                            .font(.caption)
                            .foregroundStyle(Theme.labelSecondary)
                    }
                }

                Spacer()

                if pinEnabled && !pinValidated {
                    Image(systemName: "lock.fill")
                        .font(.caption)
                        .foregroundStyle(Theme.labelTertiary)
                }

                if isSelected && (!pinEnabled || pinValidated) {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.title3)
                        .foregroundStyle(Theme.tintColor)
                }
            }
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    OnboardingClubStepView(viewModel: OnboardingViewModel())
}
