import Foundation

extension DateFormatter {
    /// Formate une date ISO8601 en format lisible (style medium, locale FR)
    /// - Parameter isoDateString: La date au format ISO8601
    /// - Returns: La date formatée en français, ou la chaîne originale si le parsing échoue
    static func formatISODate(_ isoDateString: String) -> String {
        let isoFormatter = ISO8601DateFormatter()
        isoFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

        guard let date = isoFormatter.date(from: isoDateString) else {
            return isoDateString
        }

        let displayFormatter = DateFormatter()
        displayFormatter.dateStyle = .medium
        displayFormatter.timeStyle = .none
        displayFormatter.locale = Locale(identifier: "fr_FR")

        return displayFormatter.string(from: date)
    }

    /// Formate une date ISO8601 en format lisible avec l'heure
    /// - Parameter isoDateString: La date au format ISO8601
    /// - Returns: La date et l'heure formatées en français
    static func formatISODateTime(_ isoDateString: String) -> String {
        let isoFormatter = ISO8601DateFormatter()
        isoFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

        guard let date = isoFormatter.date(from: isoDateString) else {
            return isoDateString
        }

        let displayFormatter = DateFormatter()
        displayFormatter.dateStyle = .medium
        displayFormatter.timeStyle = .short
        displayFormatter.locale = Locale(identifier: "fr_FR")

        return displayFormatter.string(from: date)
    }

    /// Formate une date ISO8601 en format relatif (il y a X jours)
    /// - Parameter isoDateString: La date au format ISO8601
    /// - Returns: La date en format relatif
    static func formatISODateRelative(_ isoDateString: String) -> String {
        let isoFormatter = ISO8601DateFormatter()
        isoFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

        guard let date = isoFormatter.date(from: isoDateString) else {
            return isoDateString
        }

        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .full
        formatter.locale = Locale(identifier: "fr_FR")

        return formatter.localizedString(for: date, relativeTo: Date())
    }
}
