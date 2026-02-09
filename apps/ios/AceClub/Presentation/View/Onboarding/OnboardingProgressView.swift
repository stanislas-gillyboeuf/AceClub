import SwiftUI

struct OnboardingProgressView: View {
    let currentStep: Int
    let totalSteps: Int

    var body: some View {
        HStack(spacing: 6) {
            ForEach(0..<totalSteps, id: \.self) { index in
                Capsule()
                    .fill(index <= currentStep ? Theme.tintColor : Theme.borderColor)
                    .frame(height: 6)
                    .shadow(color: index <= currentStep ? Theme.tintColor.opacity(0.3) : .clear, radius: 2, y: 1)
                    .animation(.spring(response: 0.4, dampingFraction: 0.7), value: currentStep)
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
