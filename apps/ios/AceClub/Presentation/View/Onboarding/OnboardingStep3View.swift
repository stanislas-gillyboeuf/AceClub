import SwiftUI

struct OnboardingStep3View: View {
    @ObservedObject var viewModel: OnboardingViewModel

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            VStack(alignment: .leading, spacing: 6) {
                Text("Ton niveau")
                    .font(.title2)
                    .fontWeight(.semibold)
                Text(subtitle)
                    .foregroundStyle(.secondary)
            }

            if let sport = viewModel.selectedSport {
                let levels = SkillLevel.levels(for: sport)
                let selection = Binding<SkillLevel>(
                    get: { viewModel.selectedSkillLevel ?? levels[0] },
                    set: { viewModel.selectedSkillLevel = $0 }
                )

                Picker("Niveau", selection: selection) {
                    ForEach(levels) { level in
                        Text(level.displayName).tag(level)
                    }
                }
                .pickerStyle(.wheel)
            } else {
                Text("Sélectionne d’abord un sport.")
                    .foregroundStyle(.secondary)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .onAppear {
            // Preselect first level if needed
            if viewModel.selectedSkillLevel == nil, let sport = viewModel.selectedSport {
                viewModel.selectedSkillLevel = SkillLevel.levels(for: sport).first
            }
        }
    }

    private var subtitle: String {
        guard let sport = viewModel.selectedSport else { return "Choisis ton niveau." }
        switch sport {
        case .tennis:
            return "Choisis ton classement tennis."
        case .padel:
            return "Choisis ton niveau padel."
        }
    }
}

#Preview {
    let vm = OnboardingViewModel()
    vm.selectedSport = .tennis
    return OnboardingStep3View(viewModel: vm)
        .padding()
}

