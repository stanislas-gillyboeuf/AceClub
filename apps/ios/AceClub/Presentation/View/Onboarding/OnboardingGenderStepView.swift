import SwiftUI

struct OnboardingGenderStepView: View {
    @ObservedObject var viewModel: OnboardingViewModel
    @State private var appeared = false

    var body: some View {
        VStack(spacing: 0) {
            OnboardingStepHeader(
                icon: "person.fill",
                title: "Ton genre",
                subtitle: "Pour mieux adapter ton profil."
            )

            VStack(spacing: 12) {
                ForEach(Array(Gender.allCases.enumerated()), id: \.element.id) { index, gender in
                    GenderTile(
                        gender: gender,
                        isSelected: viewModel.selectedGender == gender
                    ) {
                        withAnimation(.easeOut(duration: 0.25)) {
                            viewModel.selectedGender = gender
                        }
                        triggerHaptic()
                    }
                    .opacity(appeared ? 1 : 0)
                    .offset(y: appeared ? 0 : 20)
                    .animation(
                        .easeOut(duration: 0.4).delay(Double(index) * 0.08),
                        value: appeared
                    )
                }
            }
            .padding(.horizontal, Theme.paddingHorizontal)
            .padding(.top, 24)

            Spacer()
        }
        .onAppear {
            withAnimation { appeared = true }
        }
    }

    private func triggerHaptic() {
        let generator = UISelectionFeedbackGenerator()
        generator.selectionChanged()
    }
}

// MARK: - Gender Tile

private struct GenderTile: View {
    let gender: Gender
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 16) {
                ZStack {
                    Circle()
                        .fill(isSelected ? Theme.tintColor.opacity(0.15) : Theme.tintColor.opacity(0.08))
                        .frame(width: 52, height: 52)

                    Image(systemName: gender.icon)
                        .font(.system(size: 22, weight: .medium))
                        .foregroundStyle(isSelected ? Theme.tintColor : Theme.labelSecondary)
                }

                Text(gender.displayName)
                    .font(.headline)
                    .foregroundStyle(isSelected ? Theme.tintColor : Theme.labelPrimary)

                Spacer()

                if isSelected {
                    ZStack {
                        Circle()
                            .fill(Theme.tintColor)
                            .frame(width: 26, height: 26)

                        Image(systemName: "checkmark")
                            .font(.caption.weight(.bold))
                            .foregroundStyle(.white)
                    }
                    .transition(.scale.combined(with: .opacity))
                }
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 16)
            .background(
                RoundedRectangle(cornerRadius: Theme.cornerRadiusLarge, style: .continuous)
                    .fill(isSelected ? Theme.tintColor.opacity(0.05) : Theme.cardBackground)
            )
            .overlay(
                RoundedRectangle(cornerRadius: Theme.cornerRadiusLarge, style: .continuous)
                    .stroke(
                        isSelected ? Theme.tintColor.opacity(0.4) : Theme.borderColor,
                        lineWidth: isSelected ? 2 : Theme.borderWidthSubtle
                    )
            )
            .shadow(
                color: isSelected ? Theme.tintColor.opacity(0.12) : .clear,
                radius: 8, y: 3
            )
            .scaleEffect(isSelected ? 1.02 : 1.0)
            .animation(.easeOut(duration: 0.25), value: isSelected)
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    OnboardingGenderStepView(viewModel: OnboardingViewModel())
}
