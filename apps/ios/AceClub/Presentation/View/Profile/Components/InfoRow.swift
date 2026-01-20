import SwiftUI

struct InfoRow: View {
    let icon: String
    let label: String
    let value: String
    let valueColor: Color

    init(icon: String, label: String, value: String, valueColor: Color = .secondary) {
        self.icon = icon
        self.label = label
        self.value = value
        self.valueColor = valueColor
    }

    var body: some View {
        HStack(spacing: 12) {
            // Icon
            ZStack {
                Circle()
                    .fill(Color.blue.opacity(0.1))
                    .frame(width: 36, height: 36)

                Image(systemName: icon)
                    .font(.system(size: 14))
                    .foregroundColor(.blue)
            }

            // Label and Value
            VStack(alignment: .leading, spacing: 2) {
                Text(label)
                    .font(.caption)
                    .foregroundColor(.secondary)

                Text(value)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(valueColor)
            }

            Spacer()
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 8)
    }
}
