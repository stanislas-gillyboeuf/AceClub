import SwiftUI

struct OnboardingSportStepView: View {
    @ObservedObject var viewModel: OnboardingViewModel
    @State private var appeared = false

    var body: some View {
        VStack(spacing: 0) {
            OnboardingStepHeader(
                icon: "figure.tennis",
                title: "Choisis ton sport",
                subtitle: "Quel sport pratiques-tu principalement ?"
            )

            HStack(spacing: 14) {
                ForEach(Array(Sport.allCases.enumerated()), id: \.element.id) { index, sport in
                    SportTile(
                        sport: sport,
                        isSelected: viewModel.selectedSport == sport
                    ) {
                        withAnimation(.easeOut(duration: 0.25)) {
                            viewModel.selectedSport = sport
                            viewModel.selectedSkillLevel = nil
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

// MARK: - Sport Tile

private struct SportTile: View {
    let sport: Sport
    let isSelected: Bool
    let action: () -> Void

    private var sportColor: Color {
        switch sport {
        case .tennis: return .orange
        case .padel: return .blue
        }
    }

    private var sportSubtitle: String {
        switch sport {
        case .tennis: return "Classements FFT"
        case .padel: return "Niveaux debutant a expert"
        }
    }

    var body: some View {
        Button(action: action) {
            VStack(spacing: 14) {
                ZStack {
                    Circle()
                        .fill(isSelected ? sportColor.opacity(0.15) : sportColor.opacity(0.08))
                        .frame(width: 72, height: 72)

                    Image(systemName: sport.icon)
                        .font(.system(size: 28, weight: .medium))
                        .foregroundStyle(isSelected ? sportColor : Theme.labelSecondary)
                }

                VStack(spacing: 4) {
                    Text(sport.displayName)
                        .font(.headline)
                        .foregroundStyle(isSelected ? sportColor : Theme.labelPrimary)

                    Text(sportSubtitle)
                        .font(.caption)
                        .foregroundStyle(Theme.labelSecondary)
                        .multilineTextAlignment(.center)
                }
            }
            .frame(maxWidth: .infinity)
            .frame(height: 190)
            .background(
                RoundedRectangle(cornerRadius: 20, style: .continuous)
                    .fill(isSelected ? sportColor.opacity(0.05) : Theme.cardBackground)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 20, style: .continuous)
                    .stroke(
                        isSelected ? sportColor.opacity(0.5) : Theme.borderColor,
                        lineWidth: isSelected ? 2 : Theme.borderWidthSubtle
                    )
            )
            .overlay(alignment: .topTrailing) {
                if isSelected {
                    ZStack {
                        Circle()
                            .fill(sportColor)
                            .frame(width: 26, height: 26)

                        Image(systemName: "checkmark")
                            .font(.caption.weight(.bold))
                            .foregroundStyle(.white)
                    }
                    .padding(12)
                    .transition(.opacity)
                }
            }
            .shadow(
                color: isSelected ? sportColor.opacity(0.12) : .clear,
                radius: 8, y: 3
            )
            .scaleEffect(isSelected ? 1.02 : 1.0)
            .animation(.easeOut(duration: 0.25), value: isSelected)
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    OnboardingSportStepView(viewModel: OnboardingViewModel())
}
