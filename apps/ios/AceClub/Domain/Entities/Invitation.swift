import Foundation

struct Invitation: Identifiable {
    let id: String
    let organizationId: String
    let email: String
    let role: MemberRole
    let status: InvitationStatus
    let expiresAt: String
    let createdAt: String?
    let inviterId: String
    let organization: Organization?

    var isExpired: Bool {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        guard let expireDate = formatter.date(from: expiresAt) else {
            // Try without fractional seconds
            formatter.formatOptions = [.withInternetDateTime]
            guard let expireDate = formatter.date(from: expiresAt) else {
                return false
            }
            return expireDate < Date()
        }
        return expireDate < Date()
    }

    var isPending: Bool { status == .pending }
}

enum InvitationStatus: String, Codable {
    case pending
    case accepted
    case rejected
    case canceled
}
