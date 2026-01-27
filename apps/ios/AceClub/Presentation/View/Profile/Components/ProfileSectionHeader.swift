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
            
            Text(title)
                .font(.headline)
                .fontWeight(.semibold)

            Spacer()

            if let action = action {
                Button(action: action) {
                    Image(systemName: "plus")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding(.horizontal, Theme.paddingHorizontal)
        .padding(.vertical, 8)
    }
}


