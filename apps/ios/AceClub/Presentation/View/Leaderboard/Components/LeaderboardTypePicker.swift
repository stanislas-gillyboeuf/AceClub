import SwiftUI

struct LeaderboardTypePicker: View {
    @Binding var selectedType: LeaderboardType

    var body: some View {
        Picker("Type", selection: $selectedType) {
            ForEach(LeaderboardType.allCases, id: \.self) { type in
                Text(type.displayName).tag(type)
            }
        }
        .pickerStyle(.segmented)
    }
}

#Preview {
    struct PreviewWrapper: View {
        @State var selected: LeaderboardType = .global

        var body: some View {
            VStack(spacing: 20) {
                LeaderboardTypePicker(selectedType: $selected)

                Text("Selected: \(selected.displayName)")
            }
            .padding()
        }
    }

    return PreviewWrapper()
}
