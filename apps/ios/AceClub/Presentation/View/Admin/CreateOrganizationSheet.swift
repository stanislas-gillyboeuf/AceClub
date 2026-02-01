import SwiftUI

struct CreateOrganizationSheet: View {
    @ObservedObject var viewModel: AdminViewModel
    @Binding var isPresented: Bool
    @State private var currentStep = 0
    @State private var name = ""
    @State private var slug = ""
    @State private var memberEmails: [String] = []
    @State private var newEmail = ""
    @State private var createdOrganizationId: String?

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                stepIndicator

                ScrollView {
                    VStack(spacing: 24) {
                        if currentStep == 0 {
                            stepOneContent
                        } else {
                            stepTwoContent
                        }
                    }
                    .padding()
                }

                navigationButtons
            }
            .navigationTitle(currentStep == 0 ? "Créer une organisation" : "Inviter des membres")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Annuler") {
                        isPresented = false
                    }
                }
            }
        }
    }

    private var stepIndicator: some View {
        HStack(spacing: 8) {
            ForEach(0..<2) { step in
                Circle()
                    .fill(step <= currentStep ? Theme.tintColor : Theme.labelTertiary.opacity(0.3))
                    .frame(width: 10, height: 10)
            }
        }
        .padding(.top, 16)
        .padding(.bottom, 8)
    }

    private var stepOneContent: some View {
        VStack(spacing: 24) {
            Text("Créer une nouvelle organisation")
                .font(.subheadline)
                .foregroundColor(.secondary)

            TextField("Nom de l'organisation", text: $name)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .onChange(of: name) { _, newValue in
                    slug = slugify(name: newValue)
                }
                .autocapitalization(.none)
                .autocorrectionDisabled(true)

            VStack(alignment: .leading, spacing: 4) {
                Text("Slug")
                    .font(.caption)
                    .foregroundColor(.secondary)
                Text(slug.isEmpty ? "your-organization-slug" : slug)
                    .font(.body)
                    .foregroundColor(slug.isEmpty ? .gray : .primary)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding()
            .background(Theme.cardBackground)
            .cornerRadius(8)
        }
    }

    private var stepTwoContent: some View {
        VStack(spacing: 24) {
            Text("Inviter des membres dans votre organisation")
                .font(.subheadline)
                .foregroundColor(.secondary)

            HStack {
                TextField("Adresse email", text: $newEmail)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .textInputAutocapitalization(.never)
                    .keyboardType(.emailAddress)
                    .autocorrectionDisabled(true)

                Button(action: addEmail) {
                    Image(systemName: "plus.circle.fill")
                        .font(.title2)
                }
                .disabled(newEmail.isEmpty || !isValidEmail(newEmail))
            }

            if !memberEmails.isEmpty {
                List {
                    Section("Membres à inviter") {
                        ForEach(memberEmails, id: \.self) { email in
                            Text(email)
                        }
                        .onDelete(perform: deleteEmails)
                    }
                }
                .listStyle(.insetGrouped)
                .frame(height: 300)
            }
        }
    }

    private var navigationButtons: some View {
        HStack(spacing: 16) {
            if currentStep > 0 {
                Button("Retour") {
                    withAnimation {
                        currentStep -= 1
                    }
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Theme.tertiaryBackground)
            }

            Button(currentStep == 0 ? "Suivant" : "Créer") {
                if currentStep == 0 {
                    withAnimation {
                        currentStep += 1
                    }
                } else {
                    Task {
                        await createOrganizationAndInviteMembers()
                    }
                }
            }
            .frame(maxWidth: .infinity)
            .padding()
            .background(canProceed ? Theme.tintColor : Theme.tertiaryBackground)
            .foregroundStyle(canProceed ? .white : Theme.labelSecondary)
            .disabled(!canProceed || viewModel.isLoading)
        }
        .padding()
    }

    private var canProceed: Bool {
        if currentStep == 0 {
            return !name.isEmpty && !slug.isEmpty
        } else {
            return true
        }
    }

    private func addEmail() {
        guard !newEmail.isEmpty, isValidEmail(newEmail) else { return }
        memberEmails.append(newEmail)
        newEmail = ""
    }

    private func deleteEmails(at offsets: IndexSet) {
        memberEmails.remove(atOffsets: offsets)
    }

    private func createOrganizationAndInviteMembers() async {
        guard let organization = await viewModel.createOrganization(name: name, slug: slug) else {
            return
        }

        createdOrganizationId = organization.id

        for email in memberEmails {
            await viewModel.createInvitation(email: email, organizationId: organization.id)
        }

        isPresented = false
    }

    private func slugify(name: String) -> String {
        return name.lowercased()
            .replacingOccurrences(of: " ", with: "-")
            .replacingOccurrences(of: ".", with: "-")
            .replacingOccurrences(of: ",", with: "-")
            .replacingOccurrences(of: ":", with: "-")
            .replacingOccurrences(of: ";", with: "-")
            .replacingOccurrences(of: "!", with: "-")
            .replacingOccurrences(of: "?", with: "-")
    }

    private func isValidEmail(_ email: String) -> Bool {
        let emailRegex = "[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}"
        let emailPredicate = NSPredicate(format: "SELF MATCHES %@", emailRegex)
        return emailPredicate.evaluate(with: email)
    }
}
