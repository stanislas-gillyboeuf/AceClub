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
                        .foregroundStyle(.secondary)
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
                            .font(.body)
                            .fontWeight(.semibold)
                    }
                }
                .frame(maxWidth: .infinity)
                .frame(height: Theme.buttonHeight)
                .foregroundStyle(.white)
                .background(
                    RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous)
                        .fill(viewModel.canGoNext ? Color.accentColor : Color.gray.opacity(0.3))
                )
            }
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
