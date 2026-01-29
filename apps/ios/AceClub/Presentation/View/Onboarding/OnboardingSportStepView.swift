import SwiftUI

struct OnboardingSportStepView: View {
    @ObservedObject var viewModel: OnboardingViewModel

    var body: some View {
        VStack(spacing: 0) {
            // Header
            VStack(alignment: .leading, spacing: 6) {
                Text("Choisis ton sport")
                    .font(.title2)
                    .fontWeight(.bold)

                Text("Quel sport pratiques-tu principalement ?")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, Theme.paddingHorizontal)
            .padding(.top, 20)

            // Sports list
            VStack(spacing: 10) {
                ForEach(Sport.allCases) { sport in
                    SportCard(
                        sport: sport,
                        isSelected: viewModel.selectedSport == sport
                    ) {
                        withAnimation(.easeInOut(duration: 0.15)) {
                            viewModel.selectedSport = sport
                            viewModel.selectedSkillLevel = nil
                        }
                        triggerHaptic()
                    }
                }
            }
            .padding(.horizontal, Theme.paddingHorizontal)
            .padding(.top, 20)

            Spacer()
        }
    }

    private func triggerHaptic() {
        let generator = UISelectionFeedbackGenerator()
        generator.selectionChanged()
    }
}

// MARK: - Sport Card

private struct SportCard: View {
    let sport: Sport
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 14) {
                // Icon
                ZStack {
                    RoundedRectangle(cornerRadius: 10, style: .continuous)
                        .fill(isSelected ? sportColor.opacity(0.15) : Color(uiColor: .tertiarySystemFill))
                        .frame(width: 48, height: 48)

                    Image(systemName: sport.icon)
                        .font(.system(size: 20, weight: .medium))
                        .foregroundStyle(isSelected ? sportColor : .secondary)
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text(sport.displayName)
                        .font(.body)
                        .fontWeight(isSelected ? .medium : .regular)
                        .foregroundStyle(isSelected ? sportColor : .primary)

                    Text(sportSubtitle)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Spacer()

                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.title3)
                        .foregroundStyle(sportColor)
                }
            }
            .padding(14)
            .background(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .fill(isSelected ? sportColor.opacity(0.06) : Color(uiColor: .secondarySystemBackground))
            )
            .overlay(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .stroke(isSelected ? sportColor.opacity(0.25) : Color.clear, lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
    }

    private var sportColor: Color {
        switch sport {
        case .tennis: return .orange
        case .padel: return .blue
        }
    }

    private var sportSubtitle: String {
        switch sport {
        case .tennis: return "Classements FFT"
        case .padel: return "Niveaux P10 a P25"
        }
    }
}

#Preview {
    OnboardingSportStepView(viewModel: OnboardingViewModel())
}
