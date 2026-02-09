import SwiftUI

struct OnboardingNavigationButtons: View {
    @ObservedObject var viewModel: OnboardingViewModel
    let onFinish: () -> Void

    var body: some View {
        VStack(spacing: 14) {
            // Back button
            if viewModel.canGoBack {
                Button {
                    triggerHaptic()
                    viewModel.goBack()
                } label: {
                    Text("Retour")
                        .font(.subheadline)
                        .foregroundStyle(Theme.labelSecondary)
                }
                .buttonStyle(.plain)
            }

            // Primary button
            Button {
                if viewModel.isLastStep {
                    triggerHaptic()
                    onFinish()
                } else {
                    triggerHaptic()
                    viewModel.goNext()
                }
            } label: {
                Group {
                    if viewModel.isSubmitting && viewModel.isLastStep {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    } else {
                        Text(viewModel.isLastStep ? "Terminer" : "Continuer")
                    }
                }
            }
            .buttonStyle(.appPrimary)
            .disabled(!viewModel.canGoNext || (viewModel.isSubmitting && viewModel.isLastStep))
        }
        .padding(.top, 8)
    }

    private func triggerHaptic() {
        let generator = UIImpactFeedbackGenerator(style: .light)
        generator.impactOccurred()
    }
}

#Preview {
    OnboardingNavigationButtons(viewModel: OnboardingViewModel()) {}
        .padding()
}
