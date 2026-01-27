import SwiftUI

struct OnboardingNavigationButtons: View {
    @ObservedObject var viewModel: OnboardingViewModel
    let onFinish: () -> Void

    var body: some View {
        HStack(spacing: 12) {
            if viewModel.canGoBack {
                Button("Retour") {
                    viewModel.goBack()
                }
                .buttonStyle(.bordered)
            }

            Spacer()

            Button {
                if viewModel.isLastStep {
                    onFinish()
                } else {
                    viewModel.goNext()
                }
            } label: {
                if viewModel.isSubmitting && viewModel.isLastStep {
                    ProgressView()
                } else {
                    Text(viewModel.isLastStep ? "Terminer l’inscription" : "Suivant")
                }
            }
            .buttonStyle(.borderedProminent)
            .disabled(!viewModel.canGoNext || (viewModel.isSubmitting && viewModel.isLastStep))
        }
    }
}

