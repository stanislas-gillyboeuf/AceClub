import SwiftUI

struct OnboardingView: View {
    @Environment(AuthViewModel.self) private var authViewModel
    @StateObject private var viewModel = OnboardingViewModel()

    var body: some View {
        NavigationStack {
            VStack(spacing: 16) {
                OnboardingProgressView(
                    currentStep: viewModel.currentStep.rawValue,
                    totalSteps: OnboardingViewModel.OnboardingStep.allCases.count
                )

                if let error = viewModel.errorMessage {
                    Text(error)
                        .foregroundStyle(.red)
                        .multilineTextAlignment(.center)
                }

                TabView(selection: $viewModel.currentStep) {
                    OnboardingStep1View(viewModel: viewModel)
                        .tag(OnboardingViewModel.OnboardingStep.clubSelection)

                    OnboardingStep2View(viewModel: viewModel)
                        .tag(OnboardingViewModel.OnboardingStep.sportSelection)

                    OnboardingStep3View(viewModel: viewModel)
                        .tag(OnboardingViewModel.OnboardingStep.skillLevelSelection)

                    OnboardingStep4View(viewModel: viewModel)
                        .tag(OnboardingViewModel.OnboardingStep.phoneNumber)
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
                .gesture(DragGesture()) // disables swipe navigation
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)

                OnboardingNavigationButtons(viewModel: viewModel) {
                    Task { await finish() }
                }
            }
            .padding()
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
            .navigationTitle("Onboarding")
            .navigationBarTitleDisplayMode(.inline)
            .task {
                await viewModel.searchOrganizations(query: nil)
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

