import SwiftUI

struct OnboardingProgressView: View {
    let currentStep: Int
    let totalSteps: Int

    var body: some View {
        HStack(spacing: 6) {
            ForEach(0..<totalSteps, id: \.self) { index in
                Capsule()
                    .fill(index <= currentStep ? Color.accentColor : Color.gray.opacity(0.3))
                    .frame(height: 4)
                    .animation(.easeInOut(duration: 0.25), value: currentStep)
            }
        }
        .padding(.vertical, 8)
    }
}

#Preview {
    VStack(spacing: 24) {
        OnboardingProgressView(currentStep: 0, totalSteps: 4)
        OnboardingProgressView(currentStep: 1, totalSteps: 4)
        OnboardingProgressView(currentStep: 2, totalSteps: 4)
        OnboardingProgressView(currentStep: 3, totalSteps: 4)
    }
    .padding()
}
