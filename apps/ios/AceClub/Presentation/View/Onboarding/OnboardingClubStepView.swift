import SwiftUI

struct OnboardingClubStepView: View {
    @ObservedObject var viewModel: OnboardingViewModel
    @FocusState private var isSearchFocused: Bool

    var body: some View {
        VStack(spacing: 0) {
            // Header
            VStack(alignment: .leading, spacing: 6) {
                Text("Choisis ton club")
                    .font(.title2)
                    .fontWeight(.bold)

                Text("Rejoins ton club pour acceder aux matchs et evenements.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, Theme.paddingHorizontal)
            .padding(.top, 20)

            // Search field
            HStack(spacing: 10) {
                Image(systemName: "magnifyingglass")
                    .foregroundStyle(.secondary)

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
                            .foregroundStyle(.tertiary)
                    }
                }
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 12)
            .background(Color(uiColor: .secondarySystemBackground))
            .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
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
    }

    private var loadingView: some View {
        VStack(spacing: 12) {
            Spacer()
            ProgressView()
            Text("Recherche...")
                .font(.subheadline)
                .foregroundStyle(.secondary)
            Spacer()
        }
    }

    private var emptyView: some View {
        VStack(spacing: 16) {
            Spacer()
            Image(systemName: "building.2")
                .font(.system(size: 40, weight: .light))
                .foregroundStyle(.tertiary)
            Text("Aucun club trouve")
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
    }

    private var organizationsList: some View {
        ScrollView {
            LazyVStack(spacing: 8) {
                ForEach(viewModel.organizations) { org in
                    OnboardingOrganizationRow(
                        name: org.name,
                        isSelected: viewModel.selectedOrganization?.id == org.id
                    ) {
                        withAnimation(.easeInOut(duration: 0.15)) {
                            viewModel.selectedOrganization = org
                        }
                        triggerHaptic()
                    }
                }
            }
            .padding(.horizontal, Theme.paddingHorizontal)
            .padding(.top, 14)
            .padding(.bottom, 8)
        }
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
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                // Avatar
                ZStack {
                    Circle()
                        .fill(isSelected ? Color.accentColor.opacity(0.15) : Color(uiColor: .tertiarySystemFill))
                        .frame(width: 40, height: 40)

                    Text(String(name.prefix(1)).uppercased())
                        .font(.subheadline)
                        .fontWeight(.semibold)
                        .foregroundStyle(isSelected ? Color.accentColor : .secondary)
                }

                Text(name)
                    .font(.body)
                    .foregroundStyle(isSelected ? Color.accentColor : .primary)

                Spacer()

                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.body)
                        .foregroundStyle(Color.accentColor)
                }
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 12)
            .background(
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .fill(isSelected ? Color.accentColor.opacity(0.06) : Color(uiColor: .secondarySystemBackground))
            )
            .overlay(
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .stroke(isSelected ? Color.accentColor.opacity(0.25) : Color.clear, lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    OnboardingClubStepView(viewModel: OnboardingViewModel())
}
