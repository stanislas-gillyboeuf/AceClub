import SwiftUI

struct OnboardingPhoneStepView: View {
    @ObservedObject var viewModel: OnboardingViewModel
    @FocusState private var isPhoneFocused: Bool

    var body: some View {
        VStack(spacing: 0) {
            // Header
            VStack(alignment: .leading, spacing: 6) {
                Text("Ton numero")
                    .font(.title2)
                    .fontWeight(.bold)

                Text("Pour que tes partenaires puissent te contacter.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, Theme.paddingHorizontal)
            .padding(.top, 20)

            // Phone input
            VStack(alignment: .leading, spacing: 8) {
                HStack(spacing: 10) {
                    Text("+33")
                        .font(.body)
                        .foregroundStyle(.primary)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 14)
                        .background(Color(uiColor: .tertiarySystemFill))
                        .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))

                    TextField("6 12 34 56 78", text: $viewModel.phoneNumber)
                        .font(.body)
                        .keyboardType(.phonePad)
                        .textContentType(.telephoneNumber)
                        .focused($isPhoneFocused)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 14)
                        .background(Color(uiColor: .secondarySystemBackground))
                        .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                        .onChange(of: viewModel.phoneNumber) { _, newValue in
                            filterPhoneNumber(newValue)
                        }
                }

                HStack(spacing: 4) {
                    Image(systemName: "lock.fill")
                        .font(.caption2)
                    Text("Visible uniquement par tes contacts")
                        .font(.caption)
                }
                .foregroundStyle(.tertiary)
                .padding(.top, 2)
            }
            .padding(.horizontal, Theme.paddingHorizontal)
            .padding(.top, 20)

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

#Preview {
    OnboardingPhoneStepView(viewModel: OnboardingViewModel())
}
