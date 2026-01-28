import SwiftUI

struct OnboardingStep1View: View {
    @ObservedObject var viewModel: OnboardingViewModel
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            VStack(alignment: .leading, spacing: 6) {
                Text("Choisis ton club")
                    .font(.title2)
                    .fontWeight(.semibold)
                Text("Recherche et sélectionne ton club pour personnaliser ton expérience.")
                    .foregroundStyle(.secondary)
            }
            
            TextField("Rechercher un club…", text: $viewModel.searchQuery)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .autocorrectionDisabled()
                .onChange(of: viewModel.searchQuery) { _ in
                    viewModel.onSearchQueryChanged()
                }
            
            
            if viewModel.isLoadingOrganizations {
                VStack(spacing: 12) {
                    Spacer()
                    ProgressView()
                        .controlSize(.regular)
                    Text("Recherche en cours...")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    Spacer()
                }
                .frame(maxWidth: .infinity)
            } else if viewModel.organizations.isEmpty {
                VStack(spacing: 12) {
                    Spacer()    
                    ContentUnavailableView(
                        "Aucun club trouvé",
                        systemImage: "building.2",
                        description: Text("Essaie avec un autre nom")
                    )
                        .symbolVariant(.none)
                        .foregroundStyle(.secondary)
                    
                    Spacer()
                }
                .frame(maxWidth: .infinity)
            } else {
                ScrollView {
                    LazyVStack(spacing: 8) {
                        ForEach(viewModel.organizations) { org in
                            Button {
                                viewModel.selectedOrganization = org
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
                                .padding(.horizontal, 16)
                                .padding(.vertical, 14)
                                .background(
                                    RoundedRectangle(cornerRadius: 12)
                                        .fill(viewModel.selectedOrganization?.id == org.id ? Color.accent.opacity(0.1) : Color(.systemGray6))
                                )
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(viewModel.selectedOrganization?.id == org.id ? Color.accent : Color.clear, lineWidth: 1.5)
                                )
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(.all, 4)
                }
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    }
}

