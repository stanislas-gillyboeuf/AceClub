import Foundation

enum ClubRequestStatus: String {
    case pending
    case approved
    case rejected

    var displayName: String {
        switch self {
        case .pending: return "En attente"
        case .approved: return "Approuve"
        case .rejected: return "Refuse"
        }
    }
}

struct ClubRequestResult {
    let success: Bool
    let message: String
    let requestCount: Int
    let status: ClubRequestStatus
}
