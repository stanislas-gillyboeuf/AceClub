import SwiftUI

struct ProfileSectionHeader: View {
    let title: String
    let icon: String
    let action: (() -> Void)?

    init(title: String, icon: String, action: (() -> Void)? = nil) {
        self.title = title
        self.icon = icon
        self.action = action
    }

    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: icon)
                .font(.headline)
                .foregroundColor(.blue)

            Text(title)
                .font(.title3)
                .fontWeight(.bold)
                .foregroundColor(.primary)

            Spacer()

            if let action = action {
                Button(action: action) {
                    Image(systemName: "plus.circle.fill")
                        .font(.title3)
                        .foregroundColor(.blue)
                }
            }
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 8)
    }
}
