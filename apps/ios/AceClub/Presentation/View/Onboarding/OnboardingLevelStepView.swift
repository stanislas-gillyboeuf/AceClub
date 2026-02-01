import SwiftUI

struct OnboardingLevelStepView: View {
    @ObservedObject var viewModel: OnboardingViewModel

    var body: some View {
        VStack(spacing: 0) {
            // Header
            VStack(alignment: .leading, spacing: 6) {
                Text("Ton niveau")
                    .font(.title2)
                    .fontWeight(.bold)

                Text(subtitleText)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, Theme.paddingHorizontal)
            .padding(.top, 20)

            if let sport = viewModel.selectedSport {
                levelPicker(for: sport)
                    .padding(.top, 14)
            } else {
                VStack(spacing: 8) {
                    Spacer()
                    Text("Selectionne d'abord un sport")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    Spacer()
                }
            }

            Spacer()
        }
        .onAppear {
            preselectFirstLevelIfNeeded()
        }
    }

    private var subtitleText: String {
        guard let sport = viewModel.selectedSport else {
            return "Selectionne ton niveau."
        }
        switch sport {
        case .tennis: return "Quel est ton classement FFT ?"
        case .padel: return "Quel est ton niveau ?"
        }
    }

    @ViewBuilder
    private func levelPicker(for sport: Sport) -> some View {
        let levels = SkillLevel.levels(for: sport)

        ScrollView {
            LazyVStack(spacing: 6) {
                ForEach(levels) { level in
                    LevelCard(
                        level: level,
                        isSelected: viewModel.selectedSkillLevel == level
                    ) {
                        withAnimation(.easeInOut(duration: 0.15)) {
                            viewModel.selectedSkillLevel = level
                        }
                        triggerHaptic()
                    }
                }
            }
            .padding(.horizontal, Theme.paddingHorizontal)
            .padding(.bottom, 8)
        }
    }

    private func preselectFirstLevelIfNeeded() {
        if viewModel.selectedSkillLevel == nil, let sport = viewModel.selectedSport {
            viewModel.selectedSkillLevel = SkillLevel.levels(for: sport).first
        }
    }

    private func triggerHaptic() {
        let generator = UISelectionFeedbackGenerator()
        generator.selectionChanged()
    }
}

// MARK: - Level Card

private struct LevelCard: View {
    let level: SkillLevel
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack {
                Text(level.displayName)
                    .font(.body)
                    .foregroundStyle(isSelected ? Color.accentColor : .primary)

                Spacer()

                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.body)
                        .foregroundStyle(Color.accentColor)
                }
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 12)
            .background(
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .fill(isSelected ? Color.accentColor.opacity(0.06) : Color(uiColor: .secondarySystemBackground))
            )
            .overlay(
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .stroke(isSelected ? Color.accentColor.opacity(0.25) : Color.clear, lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    let vm = OnboardingViewModel()
    vm.selectedSport = .tennis
    return OnboardingLevelStepView(viewModel: vm)
}
