import SwiftUI

struct EditOrganizationSheet: View {
    @ObservedObject var organizationViewModel: OrganizationViewModel
    @Binding var isPresented: Bool
    let organization: Organization

    @State private var name: String = ""
    @State private var slug: String = ""
    @State private var isSaving = false
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Name field
                    nameSection

                    // Slug field
                    slugSection

                    // Error message
                    if let error = errorMessage {
                        errorBanner(error)
                    }
                }
                .padding(.horizontal, Theme.paddingHorizontal)
                .padding(.vertical, 16)
            }
            .background(Theme.primaryBackground)
            .navigationTitle("Modifier le club")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Annuler") {
                        isPresented = false
                    }
                }

                ToolbarItem(placement: .confirmationAction) {
                    Button("Enregistrer") {
                        Task {
                            await save()
                        }
                    }
                    .disabled(!canSave || isSaving)
                }
            }
            .onAppear {
                name = organization.name
                slug = organization.slug
            }
            .interactiveDismissDisabled(hasChanges)
        }
    }

    // MARK: - Sections

    private var nameSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionHeader(title: "Nom du club", icon: "building.2.fill")

            VStack(spacing: 0) {
                inputRow(title: "Nom") {
                    TextField("Nom du club", text: $name)
                        .textContentType(.organizationName)
                        .autocorrectionDisabled()
                }
            }
            .background(Theme.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
        }
    }

    private var slugSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionHeader(title: "Identifiant unique", icon: "at")

            VStack(spacing: 0) {
                inputRow(title: "Slug") {
                    HStack(spacing: 4) {
                        Text("@")
                            .foregroundStyle(.secondary)
                        TextField("mon-club", text: $slug)
                            .textInputAutocapitalization(.never)
                            .autocorrectionDisabled()
                            .onChange(of: slug) { _, newValue in
                                // Auto-format slug
                                slug = formatSlug(newValue)
                            }
                    }
                }

                Divider()
                    .padding(.leading, 16)

                Text("L'identifiant unique permet de retrouver facilement votre club. Il ne peut contenir que des lettres minuscules, des chiffres et des tirets.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .padding(16)
            }
            .background(Theme.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
        }
    }

    // MARK: - Helpers

    private func sectionHeader(title: String, icon: String) -> some View {
        Label(title, systemImage: icon)
            .font(.subheadline.weight(.semibold))
            .foregroundStyle(.secondary)
            .textCase(.uppercase)
    }

    private func inputRow<Content: View>(title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)

            content()
        }
        .padding(16)
    }

    private func errorBanner(_ message: String) -> some View {
        HStack(spacing: 12) {
            Image(systemName: "exclamationmark.circle.fill")
                .foregroundStyle(.red)

            Text(message)
                .font(.subheadline)
                .foregroundStyle(.primary)

            Spacer()
        }
        .padding(16)
        .background(Color.red.opacity(0.1))
        .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
    }

    private func formatSlug(_ input: String) -> String {
        input
            .lowercased()
            .replacingOccurrences(of: " ", with: "-")
            .filter { $0.isLetter || $0.isNumber || $0 == "-" }
    }

    // MARK: - Computed Properties

    private var hasChanges: Bool {
        name != organization.name || slug != organization.slug
    }

    private var canSave: Bool {
        hasChanges && !name.isEmpty && !slug.isEmpty && slug.count >= 3
    }

    // MARK: - Actions

    private func save() async {
        isSaving = true
        errorMessage = nil

        do {
            _ = try await organizationViewModel.updateOrganization(
                organizationId: organization.id,
                name: name != organization.name ? name : nil,
                slug: slug != organization.slug ? slug : nil
            )
            await MainActor.run {
                isPresented = false
            }
        } catch {
            await MainActor.run {
                errorMessage = error.localizedDescription
                isSaving = false
            }
        }
    }
}
