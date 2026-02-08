import SwiftUI

struct PinEntrySheet: View {
    @State private var pin: String = ""
    @State private var errorMessage: String?
    @FocusState private var isFocused: Bool

    let onValidate: (String) -> Void
    let onDismiss: () -> Void

    var body: some View {
        NavigationStack {
            VStack(spacing: 32) {
                Spacer()

                VStack(spacing: 8) {
                    Image(systemName: "lock.fill")
                        .font(.system(size: 40))
                        .foregroundStyle(Theme.tintColor)

                    Text("Code PIN")
                        .font(.title2)
                        .fontWeight(.bold)

                    Text("Entre le code PIN du club pour le rejoindre")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 32)
                }

                // PIN display boxes
                HStack(spacing: 14) {
                    ForEach(0..<4, id: \.self) { index in
                        let digit = index < pin.count ? String(pin[pin.index(pin.startIndex, offsetBy: index)]) : ""
                        ZStack {
                            RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous)
                                .fill(Theme.cardBackground)
                            RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous)
                                .stroke(
                                    errorMessage != nil ? Theme.destructiveColor :
                                    index < pin.count ? Theme.tintColor : Theme.borderColor,
                                    lineWidth: index < pin.count ? 2 : 1
                                )

                            Text(digit)
                                .font(.system(size: 28, weight: .bold, design: .rounded))
                                .foregroundStyle(Theme.labelPrimary)
                        }
                        .frame(width: 56, height: 64)
                    }
                }

                // Hidden TextField for keyboard input
                TextField("", text: $pin)
                    .keyboardType(.numberPad)
                    .focused($isFocused)
                    .frame(width: 1, height: 1)
                    .opacity(0.01)
                    .onChange(of: pin) { _, newValue in
                        let filtered = newValue.filter(\.isNumber)
                        if filtered.count > 4 {
                            pin = String(filtered.prefix(4))
                        } else if filtered != newValue {
                            pin = filtered
                        }
                        errorMessage = nil
                    }

                if let errorMessage {
                    Text(errorMessage)
                        .font(.footnote)
                        .foregroundStyle(Theme.destructiveColor)
                }

                Spacer()

                VStack(spacing: 12) {
                    Button("Valider") {
                        onValidate(pin)
                    }
                    .buttonStyle(.appPrimary)
                    .disabled(pin.count != 4)

                    Button("Annuler") {
                        onDismiss()
                    }
                    .font(.body.weight(.medium))
                    .foregroundStyle(.secondary)
                }
                .padding(.horizontal, Theme.paddingHorizontal)
                .padding(.bottom, 20)
            }
            .contentShape(Rectangle())
            .onTapGesture {
                isFocused = true
            }
            .onAppear {
                isFocused = true
            }
        }
        .presentationDetents([.medium])
        .presentationBackground(.regularMaterial)
    }

    func showError(_ message: String) {
        errorMessage = message
        pin = ""
    }
}
