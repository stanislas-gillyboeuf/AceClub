import SwiftUI

struct OnboardingLevelStepView: View {
    @ObservedObject var viewModel: OnboardingViewModel
    @State private var appeared = false

    var body: some View {
        VStack(spacing: 0) {
            OnboardingStepHeader(
                icon: "chart.bar.fill",
                title: "Ton niveau",
                subtitle: subtitleText
            )

            if let sport = viewModel.selectedSport {
                levelPicker(for: sport)
                    .padding(.top, 14)
            } else {
                VStack(spacing: 8) {
                    Spacer()
                    Text("Selectionne d'abord un sport")
                        .font(.subheadline)
                        .foregroundStyle(Theme.labelSecondary)
                    Spacer()
                }
            }

            Spacer()
        }
        .onAppear {
            preselectFirstLevelIfNeeded()
            withAnimation(.easeOut(duration: 0.3).delay(0.2)) {
                appeared = true
            }
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

        switch sport {
        case .padel:
            // Grid 2x2 for padel (4 levels)
            LazyVGrid(columns: [
                GridItem(.flexible(), spacing: 12),
                GridItem(.flexible(), spacing: 12)
            ], spacing: 12) {
                ForEach(Array(levels.enumerated()), id: \.element.id) { index, level in
                    PadelLevelTile(
                        level: level,
                        isSelected: viewModel.selectedSkillLevel == level
                    ) {
                        withAnimation(.easeOut(duration: 0.25)) {
                            viewModel.selectedSkillLevel = level
                        }
                        triggerHaptic()
                    }
                    .opacity(appeared ? 1 : 0)
                    .offset(y: appeared ? 0 : 20)
                    .animation(
                        .easeOut(duration: 0.35).delay(Double(index) * 0.06),
                        value: appeared
                    )
                }
            }
            .padding(.horizontal, Theme.paddingHorizontal)

        case .tennis:
            List {
                ForEach(Array(levels.enumerated()), id: \.element.id) { index, level in
                    TennisLevelRow(
                        level: level,
                        isSelected: viewModel.selectedSkillLevel == level
                    ) {
                        withAnimation(.easeOut(duration: 0.25)) {
                            viewModel.selectedSkillLevel = level
                        }
                        triggerHaptic()
                    }
                    .opacity(appeared ? 1 : 0)
                    .offset(y: appeared ? 0 : 15)
                    .animation(
                        .easeOut(duration: 0.3).delay(Double(index) * 0.02),
                        value: appeared
                    )
                }
            }
            .listStyle(.insetGrouped)
        }
    }

    private func preselectFirstLevelIfNeeded() {
        if viewModel.selectedSkillLevel == nil, let sport = viewModel.selectedSport {
            viewModel.selectedSkillLevel = SkillLevel.levels(for: sport).first
        }
    }

    private func triggerHaptic() {
        let generator = UIImpactFeedbackGenerator(style: .light)
        generator.impactOccurred()
    }
}

// MARK: - Padel Level Tile (Grid)

private struct PadelLevelTile: View {
    let level: SkillLevel
    let isSelected: Bool
    let action: () -> Void

    @State private var iconPulse = false

    private var levelIcon: String {
        switch level.value {
        case "Débutant": return "1.circle.fill"
        case "Intermédiaire": return "2.circle.fill"
        case "Avancé": return "3.circle.fill"
        case "Expert": return "4.circle.fill"
        default: return "circle.fill"
        }
    }

    var body: some View {
        Button(action: {
            action()
            withAnimation(.easeOut(duration: 0.2)) {
                iconPulse = true
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) {
                withAnimation(.easeOut(duration: 0.2)) {
                    iconPulse = false
                }
            }
        }) {
            VStack(spacing: 10) {
                Image(systemName: levelIcon)
                    .font(.system(size: 30, weight: .medium))
                    .foregroundStyle(isSelected ? Theme.tintColor : Theme.labelSecondary)
                    .scaleEffect(iconPulse ? 1.2 : 1)

                Text(level.displayName)
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(isSelected ? Theme.tintColor : Theme.labelPrimary)
            }
            .frame(maxWidth: .infinity)
            .frame(height: 110)
            .background(
                RoundedRectangle(cornerRadius: Theme.cornerRadiusLarge, style: .continuous)
                    .fill(isSelected ? Theme.tintColor.opacity(0.06) : Theme.cardBackground)
            )
            .overlay(
                RoundedRectangle(cornerRadius: Theme.cornerRadiusLarge, style: .continuous)
                    .stroke(isSelected ? Theme.tintColor.opacity(0.4) : Theme.borderColor, lineWidth: isSelected ? 2 : Theme.borderWidthSubtle)
            )
            .overlay(alignment: .topTrailing) {
                if isSelected {
                    ZStack {
                        Circle()
                            .fill(Theme.tintColor)
                            .frame(width: 22, height: 22)

                        Image(systemName: "checkmark")
                            .font(.caption2.weight(.bold))
                            .foregroundStyle(.white)
                    }
                    .padding(8)
                    .transition(.scale.combined(with: .opacity))
                }
            }
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

// MARK: - Tennis Level Row (List)

private struct TennisLevelRow: View {
    let level: SkillLevel
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Circle()
                    .fill(isSelected ? Theme.tintColor : Theme.borderColor)
                    .frame(width: 8, height: 8)

                Text(level.displayName)
                    .font(.body)
                    .foregroundStyle(isSelected ? Theme.tintColor : Theme.labelPrimary)

                Spacer()

                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.body)
                        .foregroundStyle(Theme.tintColor)
                        .transition(.scale.combined(with: .opacity))
                }
            }
            .animation(.easeOut(duration: 0.25), value: isSelected)
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    let vm = OnboardingViewModel()
    vm.selectedSport = .padel
    return OnboardingLevelStepView(viewModel: vm)
}
