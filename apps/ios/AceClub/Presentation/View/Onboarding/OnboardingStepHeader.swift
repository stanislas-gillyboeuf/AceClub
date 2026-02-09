import SwiftUI

struct OnboardingStepHeader: View {
    let icon: String
    let title: String
    let subtitle: String

    @State private var showIcon = false
    @State private var showText = false

    var body: some View {
        VStack(spacing: 12) {
            ZStack {
                RoundedRectangle(cornerRadius: Theme.cornerRadiusLarge, style: .continuous)
                    .fill(Theme.tintColor.opacity(0.12))
                    .frame(width: 80, height: 80)

                Image(systemName: icon)
                    .font(.system(size: 32, weight: .medium))
                    .foregroundStyle(Theme.tintColor)
            }
            .opacity(showIcon ? 1 : 0)
            .scaleEffect(showIcon ? 1 : 0.85)

            VStack(spacing: 6) {
                Text(title)
                    .font(.title.bold())
                    .multilineTextAlignment(.center)

                Text(subtitle)
                    .font(.subheadline)
                    .foregroundStyle(Theme.labelSecondary)
                    .multilineTextAlignment(.center)
            }
            .opacity(showText ? 1 : 0)
            .offset(y: showText ? 0 : 10)
        }
        .frame(maxWidth: .infinity)
        .padding(.horizontal, Theme.paddingHorizontal)
        .padding(.top, 20)
        .onAppear {
            withAnimation(.easeOut(duration: 0.4)) {
                showIcon = true
            }
            withAnimation(.easeOut(duration: 0.4).delay(0.12)) {
                showText = true
            }
        }
    }
}

#Preview {
    OnboardingStepHeader(
        icon: "building.2.fill",
        title: "Dans quel club joues-tu ?",
        subtitle: "Rejoins ton club pour acceder aux matchs."
    )
}
