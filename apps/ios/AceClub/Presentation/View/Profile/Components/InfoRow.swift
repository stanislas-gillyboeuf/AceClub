import SwiftUI

struct InfoRow: View {
    let icon: String
    let label: String
    let value: String
    let valueColor: Color

    init(icon: String, label: String, value: String, valueColor: Color = .primary) {
        self.icon = icon
        self.label = label
        self.value = value
        self.valueColor = valueColor
    }

    var body: some View {
        HStack(spacing: 8) {
            Text(label)
                .font(.subheadline)
                .foregroundColor(.secondary)

            Spacer()

            Text(value)
                .font(.subheadline)
                .foregroundColor(valueColor)
        }
        .padding(.vertical, 4)
    }
}
