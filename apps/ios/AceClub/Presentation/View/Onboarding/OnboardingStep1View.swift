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
                .textFieldStyle(.roundedBorder)
                .onChange(of: viewModel.searchQuery) { _ in
                    viewModel.onSearchQueryChanged()
                }

            if viewModel.isLoadingOrganizations {
                HStack { Spacer(); ProgressView(); Spacer() }
            } else if viewModel.organizations.isEmpty {
                Text("Aucun club trouvé.")
                    .foregroundStyle(.secondary)
            } else {
                List(viewModel.organizations) { org in
                    Button {
                        viewModel.selectedOrganization = org
                    } label: {
                        HStack {
                            VStack(alignment: .leading, spacing: 2) {
                                Text(org.name)
                                    .foregroundStyle(.primary)
                                Text(org.slug)
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
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
    }
}

#Preview {
    OnboardingStep1View(viewModel: OnboardingViewModel())
        .padding()
}

