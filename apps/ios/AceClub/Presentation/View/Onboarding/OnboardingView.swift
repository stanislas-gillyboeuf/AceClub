import SwiftUI

struct OnboardingView: View {
    @Environment(AuthViewModel.self) private var authViewModel
    @StateObject private var viewModel = OnboardingViewModel()
    @State private var keyboardHeight: CGFloat = 0

    private var isWelcomeStep: Bool {
        viewModel.currentStep == .welcome
    }

    var body: some View {
        VStack(spacing: 0) {
            // Progress bar (hidden on welcome)
            if !isWelcomeStep {
                OnboardingProgressView(
                    currentStep: viewModel.currentStep.rawValue - 1,
                    totalSteps: OnboardingViewModel.OnboardingStep.allCases.count - 1
                )
                .padding(.horizontal, Theme.paddingHorizontal)
                .padding(.top, 12)
                .transition(.opacity.combined(with: .move(edge: .top)))
            }

            // Content
            TabView(selection: $viewModel.currentStep) {
                OnboardingWelcomeStepView(viewModel: viewModel)
                    .tag(OnboardingViewModel.OnboardingStep.welcome)

                OnboardingClubStepView(viewModel: viewModel)
                    .tag(OnboardingViewModel.OnboardingStep.clubSelection)

                OnboardingSportStepView(viewModel: viewModel)
                    .tag(OnboardingViewModel.OnboardingStep.sportSelection)

                OnboardingLevelStepView(viewModel: viewModel)
                    .tag(OnboardingViewModel.OnboardingStep.skillLevelSelection)

                OnboardingPhotoStepView(viewModel: viewModel)
                    .tag(OnboardingViewModel.OnboardingStep.profilePhoto)

                OnboardingPhoneStepView(viewModel: viewModel)
                    .tag(OnboardingViewModel.OnboardingStep.phoneNumber)
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
            .gesture(DragGesture())
            .animation(.easeOut(duration: 0.35), value: viewModel.currentStep)

            // Error
            if let error = viewModel.errorMessage {
                Text(error)
                    .font(.caption)
                    .foregroundStyle(.red)
                    .padding(.horizontal, Theme.paddingHorizontal)
            }

            // Buttons (hidden on welcome)
            if !isWelcomeStep {
                OnboardingNavigationButtons(viewModel: viewModel) {
                    Task { await finish() }
                }
                .padding(.horizontal, Theme.paddingHorizontal)
                .padding(.bottom, keyboardHeight > 0 ? 8 : 28)
                .transition(.opacity.combined(with: .move(edge: .bottom)))
            }
        }
        .background(Theme.primaryBackground)
        .animation(.easeOut(duration: 0.35), value: isWelcomeStep)
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
