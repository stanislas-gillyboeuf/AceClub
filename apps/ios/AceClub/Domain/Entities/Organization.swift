import Foundation

struct Organization: Identifiable {
    let id: String
    let name: String
    let slug: String
    let logo: String?
    let createdAt: String
    let metadata: String?

    var logoURL: URL? {
        guard let logo, !logo.isEmpty else { return nil }
        return URL(string: logo)
    }
}
