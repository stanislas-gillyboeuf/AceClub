import Foundation

struct OrganizationStatsDTO: Codable {
    let totalMembers: Int
    let matchesThisMonth: Int
    let activeMembers: Int
    let activityRate: Int
}
