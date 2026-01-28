import SwiftUI

struct OnboardingStep4View: View {
    @ObservedObject var viewModel: OnboardingViewModel

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            VStack(alignment: .leading, spacing: 6) {
                Text("Ton numéro")
                    .font(.title2)
                    .fontWeight(.semibold)
                Text("Il est obligatoire et permettra de te connecter à tes adversaires.")
                    .foregroundStyle(.secondary)
            }

            TextField("Numéro de téléphone", text: $viewModel.phoneNumber)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .keyboardType(.phonePad)
                .textContentType(.telephoneNumber)
                .autocorrectionDisabled()
                .onChange(of: viewModel.phoneNumber) { _, newValue in
                    // Keep only common phone characters.
                    let allowed = CharacterSet(charactersIn: "+0123456789 ()-")
                    let filtered = newValue.filter { character in
                        character.unicodeScalars.allSatisfy { allowed.contains($0) }
                    }
                    if filtered != newValue {
                        viewModel.phoneNumber = filtered
                    }
                }

            Text("Ex: +33612345678")
                .font(.footnote)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    }
}

#Preview {
    OnboardingStep4View(viewModel: OnboardingViewModel())
        .padding()
}

