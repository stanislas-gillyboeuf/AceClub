import SwiftUI

struct RequestClubSheet: View {
    @ObservedObject var viewModel: OnboardingViewModel
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

            Text("Demande envoyee !")
                .font(.title2)
                .fontWeight(.semibold)

            Text(viewModel.clubRequestMessage ?? "Nous avons bien recu ta demande.")
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

#Preview {
    RequestClubSheet(viewModel: OnboardingViewModel())
}
