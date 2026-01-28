import SwiftUI

struct OnboardingStep2View: View {
    @ObservedObject var viewModel: OnboardingViewModel

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            VStack(alignment: .leading, spacing: 6) {
                Text("Choisis ton sport")
                    .font(.title2)
                    .fontWeight(.semibold)
                Text("Sélectionne le sport que tu pratiques principalement.")
                    .foregroundStyle(.secondary)
            }

            VStack(spacing: 12) {
                ForEach(Sport.allCases) { sport in
                    Button {
                        viewModel.selectedSport = sport
                        viewModel.selectedSkillLevel = nil // reset levels when switching sport
                    } label: {
                        HStack(spacing: 12) {
                            Image(systemName: sport.icon)
                                .font(.title3)
                                .frame(width: 28)
                            Text(sport.displayName)
                                .font(.headline)
                            Spacer()
                            if viewModel.selectedSport == sport {
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundStyle(.accent)
                            }
                        }
                        .padding()
                        .background(
                            RoundedRectangle(cornerRadius: 12)
                                .fill(Color.secondary.opacity(0.10))
                        )
                    }
                    .buttonStyle(.plain)
                }
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    }
}

#Preview {
    OnboardingStep2View(viewModel: OnboardingViewModel())
        .padding()
}

