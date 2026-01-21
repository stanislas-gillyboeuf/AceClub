import Foundation

class CreateInvitationUseCase {
    private let repository = InvitationRepository()

    func execute(email: String, role: String = "member", organizationId: String? = nil, resend: Bool? = nil) async throws -> Invitation {
        // Validate email
        guard isValidEmail(email) else {
            throw ValidationError.invalidEmail
        }

        return try await repository.createInvitation(email: email, role: role, organizationId: organizationId, resend: resend)
    }

    private func isValidEmail(_ email: String) -> Bool {
        let emailRegex = "[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}"
        let emailPredicate = NSPredicate(format: "SELF MATCHES %@", emailRegex)
        return emailPredicate.evaluate(with: email)
    }
}
