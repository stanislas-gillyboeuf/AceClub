import Foundation

struct SkillLevel: Identifiable, Hashable, Codable {
    let value: String
    let displayName: String

    var id: String { value }

    static let tennisLevels: [SkillLevel] = [
        "Négatif",
        "-4/6",
        "-2/6",
        "0",
        "1/6",
        "2/6",
        "3/6",
        "4/6",
        "5/6",
        "15",
        "15/1",
        "15/2",
        "15/3",
        "15/4",
        "15/5",
        "30",
        "30/1",
        "30/2",
        "30/3",
        "30/4",
        "30/5",
        "40",
        "NC"
    ].map { SkillLevel(value: $0, displayName: $0) }

    static let padelLevels: [SkillLevel] = [
        SkillLevel(value: "Débutant", displayName: "Débutant"),
        SkillLevel(value: "Intermédiaire", displayName: "Intermédiaire"),
        SkillLevel(value: "Avancé", displayName: "Avancé"),
        SkillLevel(value: "Expert", displayName: "Expert")
    ]

    static func levels(for sport: Sport) -> [SkillLevel] {
        switch sport {
        case .tennis: return tennisLevels
        case .padel: return padelLevels
        }
    }
}

