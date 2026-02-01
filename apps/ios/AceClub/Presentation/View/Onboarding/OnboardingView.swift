import SwiftUI

struct OnboardingView: View {
    @Environment(AuthViewModel.self) private var authViewModel
    @StateObject private var viewModel = OnboardingViewModel()
    @State private var keyboardHeight: CGFloat = 0

    var body: some View {
        VStack(spacing: 0) {
            // Progress bar
            OnboardingProgressView(
                currentStep: viewModel.currentStep.rawValue,
                totalSteps: OnboardingViewModel.OnboardingStep.allCases.count
            )
            .padding(.horizontal, Theme.paddingHorizontal)
            .padding(.top, 12)

            // Content
            TabView(selection: $viewModel.currentStep) {
                OnboardingClubStepView(viewModel: viewModel)
                    .tag(OnboardingViewModel.OnboardingStep.clubSelection)

                OnboardingSportStepView(viewModel: viewModel)
                    .tag(OnboardingViewModel.OnboardingStep.sportSelection)

                OnboardingLevelStepView(viewModel: viewModel)
                    .tag(OnboardingViewModel.OnboardingStep.skillLevelSelection)

                OnboardingPhoneStepView(viewModel: viewModel)
                    .tag(OnboardingViewModel.OnboardingStep.phoneNumber)
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
            .gesture(DragGesture())
            .animation(.easeInOut(duration: 0.25), value: viewModel.currentStep)

            // Error
            if let error = viewModel.errorMessage {
                Text(error)
                    .font(.caption)
                    .foregroundStyle(.red)
                    .padding(.horizontal, Theme.paddingHorizontal)
            }

            // Buttons
            OnboardingNavigationButtons(viewModel: viewModel) {
                Task { await finish() }
            }
            .padding(.horizontal, Theme.paddingHorizontal)
            .padding(.bottom, keyboardHeight > 0 ? 8 : 28)
        }
        .background(Color(.systemBackground))
        .task {
            await viewModel.searchOrganizations(query: nil)
        }
        .onReceive(NotificationCenter.default.publisher(for: UIResponder.keyboardWillShowNotification)) { notification in
            if let keyboardFrame = notification.userInfo?[UIResponder.keyboardFrameEndUserInfoKey] as? CGRect {
                withAnimation(.easeOut(duration: 0.2)) {
                    keyboardHeight = keyboardFrame.height
                }
            }
        }
        .onReceive(NotificationCenter.default.publisher(for: UIResponder.keyboardWillHideNotification)) { _ in
            withAnimation(.easeOut(duration: 0.2)) {
                keyboardHeight = 0
            }
        }
    }

    @MainActor
    private func finish() async {
        do {
            let updatedUser = try await viewModel.submit()
            authViewModel.currentUser = updatedUser
        } catch {
            viewModel.errorMessage = error.localizedDescription
        }
    }
}

#Preview {
    OnboardingView()
        .environment(AuthViewModel())
}
