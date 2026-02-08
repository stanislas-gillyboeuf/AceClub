import SwiftUI

struct OrganizationPinSection: View {
    let pin: String?
    let isPinEnabled: Bool
    let onToggle: () -> Void
    let onRegenerate: () -> Void

    @State private var isPinVisible = true
    @State private var showRegenerateConfirmation = false

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionHeader(title: "Code PIN", icon: "lock.fill")

            VStack(spacing: 0) {
                // PIN display
                HStack(spacing: 12) {
                    Image(systemName: isPinEnabled ? "lock.fill" : "lock.open.fill")
                        .font(.title3)
                        .foregroundStyle(isPinEnabled ? .green : .secondary)
                        .frame(width: 28)

                    VStack(alignment: .leading, spacing: 2) {
                        HStack(spacing: 8) {
                            Text("Code PIN")
                                .font(.subheadline.weight(.medium))
                                .foregroundStyle(.primary)

                            Text(isPinEnabled ? "Actif" : "Inactif")
                                .font(.caption2.weight(.semibold))
                                .foregroundStyle(isPinEnabled ? .green : .secondary)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(
                                    Capsule()
                                        .fill(isPinEnabled ? Color.green.opacity(0.15) : Color.secondary.opacity(0.15))
                                )
                        }

                        Text("Les membres doivent saisir ce code pour rejoindre le club")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }

                    Spacer()

                    Toggle("", isOn: .init(
                        get: { isPinEnabled },
                        set: { _ in onToggle() }
                    ))
                    .labelsHidden()
                }
                .padding(16)

                if isPinEnabled {
                    Divider()
                        .padding(.leading, 52)

                    // PIN value
                    HStack(spacing: 12) {
                        Spacer()
                            .frame(width: 28)

                        HStack(spacing: 14) {
                            ForEach(0..<4, id: \.self) { index in
                                let pinStr = pin ?? ""
                                let digit = index < pinStr.count ? String(pinStr[pinStr.index(pinStr.startIndex, offsetBy: index)]) : "-"
                                Text(isPinVisible ? digit : "\u{2022}")
                                    .font(.system(size: 24, weight: .bold, design: .rounded))
                                    .foregroundStyle(Theme.labelPrimary)
                                    .frame(width: 36, height: 44)
                                    .background(Theme.inputBackground)
                                    .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusSmall, style: .continuous))
                            }
                        }

                        Spacer()

                        Button {
                            isPinVisible.toggle()
                        } label: {
                            Image(systemName: isPinVisible ? "eye.slash" : "eye")
                                .font(.body)
                                .foregroundStyle(.secondary)
                        }

                        if let pin {
                            Button {
                                UIPasteboard.general.string = pin
                            } label: {
                                Image(systemName: "doc.on.doc")
                                    .font(.body)
                                    .foregroundStyle(.secondary)
                            }
                        }
                    }
                    .padding(16)

                    Divider()
                        .padding(.leading, 52)

                    // Regenerate button
                    Button {
                        showRegenerateConfirmation = true
                    } label: {
                        HStack(spacing: 12) {
                            Image(systemName: "arrow.triangle.2.circlepath")
                                .font(.title3)
                                .foregroundStyle(Theme.tintColor)
                                .frame(width: 28)

                            VStack(alignment: .leading, spacing: 2) {
                                Text("Régénérer le PIN")
                                    .font(.subheadline.weight(.medium))
                                    .foregroundStyle(.primary)

                                Text("Génère un nouveau code à 4 chiffres")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }

                            Spacer()
                        }
                        .padding(16)
                    }
                    .buttonStyle(.plain)
                }
            }
            .background(Theme.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
        }
        .confirmationDialog(
            "Régénérer le PIN ?",
            isPresented: $showRegenerateConfirmation,
            titleVisibility: .visible
        ) {
            Button("Régénérer") {
                onRegenerate()
            }
            Button("Annuler", role: .cancel) {}
        } message: {
            Text("L'ancien code ne sera plus valide. Les membres devront utiliser le nouveau code pour rejoindre le club.")
        }
    }

    // MARK: - Helpers

    private func sectionHeader(title: String, icon: String) -> some View {
        Label(title, systemImage: icon)
            .font(.subheadline.weight(.semibold))
            .foregroundStyle(.secondary)
            .textCase(.uppercase)
    }
}
