import SwiftUI

struct OnboardingProgressView: View {
    let currentStep: Int
    let totalSteps: Int

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 8) {
                ForEach(0..<totalSteps, id: \.self) { index in
                    RoundedRectangle(cornerRadius: 8)
                        .fill(index <= currentStep ? Color.accentColor : Color.secondary.opacity(0.25))
                        .frame(height: 8)
                }
            }

            Text("Étape \(currentStep + 1) sur \(totalSteps)")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
    }
}

#Preview {
    OnboardingProgressView(currentStep: 0, totalSteps: 3)
        .padding()
}

