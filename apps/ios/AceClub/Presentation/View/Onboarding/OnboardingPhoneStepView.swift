import SwiftUI

struct OnboardingPhoneStepView: View {
    @ObservedObject var viewModel: OnboardingViewModel
    @FocusState private var isPhoneFocused: Bool

    var body: some View {
        VStack(spacing: 0) {
            OnboardingStepHeader(
                icon: "phone.fill",
                title: "Ton numéro",
                subtitle: "Pour que tes partenaires puissent te contacter."
            )

            // Phone input
            VStack(alignment: .leading, spacing: 12) {
                HStack(spacing: 10) {
                    Text("+33")
                        .font(.body)
                        .foregroundStyle(Theme.labelPrimary)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 14)
                        .background(Theme.inputBackground)
                        .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: 10, style: .continuous)
                                .stroke(Theme.borderColor, lineWidth: Theme.borderWidthSubtle)
                        )

                    TextField("6 12 34 56 78", text: $viewModel.phoneNumber)
                        .keyboardType(.phonePad)
                        .textContentType(.telephoneNumber)
                        .focused($isPhoneFocused)
                        .font(.body)
                        .foregroundStyle(Theme.labelPrimary)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 14)
                        .background(Theme.inputBackground)
                        .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: 10, style: .continuous)
                                .stroke(Theme.borderColor, lineWidth: Theme.borderWidthSubtle)
                        )
                        .onChange(of: viewModel.phoneNumber) { _, newValue in
                            filterPhoneNumber(newValue)
                        }
                }


            }
            .padding(.horizontal, Theme.paddingHorizontal)
            .padding(.top, 24)

            Spacer()
        }
        .onAppear {
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) {
                isPhoneFocused = true
            }
        }
        .onTapGesture {
            isPhoneFocused = false
        }
    }

    private func filterPhoneNumber(_ value: String) {
        let allowed = CharacterSet(charactersIn: "+0123456789 ()-")
        let filtered = value.filter { character in
            character.unicodeScalars.allSatisfy { allowed.contains($0) }
        }
        if filtered != value {
            viewModel.phoneNumber = filtered
        }
    }
}
