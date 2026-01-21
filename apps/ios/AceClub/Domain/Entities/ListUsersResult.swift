import Foundation

struct ListUsersResult {
    let users: [User]
    let total: Int
    let limit: Int?
    let offset: Int?
}
