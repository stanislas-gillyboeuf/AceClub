import SwiftUI

struct OnboardingWelcomeStepView: View {
    @ObservedObject var viewModel: OnboardingViewModel

    @State private var showLogo = false
    @State private var showTitle = false
    @State private var showFeatures = false
    @State private var showButton = false

    var body: some View {
        VStack(spacing: 0) {
            Spacer()

            // Logo
            Image("AceClubLogo")
                .resizable()
                .scaledToFit()
                .frame(width: 110, height: 110)
                .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
                .shadow(color: .black.opacity(0.15), radius: 16, y: 6)
                .opacity(showLogo ? 1 : 0)
                .scaleEffect(showLogo ? 1 : 0.8)

            // Title
            VStack(spacing: 10) {
                Text("Bienvenue sur")
                    .font(.title2)
                    .foregroundStyle(Theme.labelSecondary)

                Text("Ace Club")
                    .font(.system(size: 38, weight: .bold, design: .rounded))
                    .foregroundStyle(Theme.labelPrimary)

                Text("Ton club de tennis et padel,\ndans ta poche.")
                    .font(.body)
                    .foregroundStyle(Theme.labelSecondary)
                    .multilineTextAlignment(.center)
                    .padding(.top, 4)
            }
            .padding(.top, 20)
            .opacity(showTitle ? 1 : 0)
            .offset(y: showTitle ? 0 : 16)

            // Features
            VStack(spacing: 12) {
                FeatureRow(
                    icon: "figure.tennis",
                    color: Theme.accentOrange,
                    title: "Trouve des partenaires",
                    subtitle: "Connecte-toi avec les joueurs de ton club",
                    isVisible: showFeatures,
                    delay: 0
                )

                FeatureRow(
                    icon: "trophy.fill",
                    color: Theme.tintColor,
                    title: "Suis tes performances",
                    subtitle: "Historique de matchs et statistiques",
                    isVisible: showFeatures,
                    delay: 0.06
                )

                FeatureRow(
                    icon: "calendar",
                    color: Theme.accentOrange,
                    title: "Organise tes matchs",
                    subtitle: "Planifie et rejoins des sessions",
                    isVisible: showFeatures,
                    delay: 0.12
                )
            }
            .padding(.top, 32)
            .padding(.horizontal, Theme.paddingHorizontal)

            Spacer()

            // CTA
            VStack(spacing: 12) {
                Button {
                    triggerHaptic()
                    viewModel.goNext()
                } label: {
                    HStack(spacing: 8) {
                        Text("C'est parti !")
                        Image(systemName: "arrow.right")
                            .font(.body.weight(.semibold))
                    }
                }
                .buttonStyle(.appPrimary)

                Text("Quelques questions pour personnaliser ton experience")
                    .font(.footnote)
                    .foregroundStyle(Theme.labelTertiary)
                    .multilineTextAlignment(.center)
            }
            .padding(.horizontal, Theme.paddingHorizontal)
            .padding(.bottom, 28)
            .opacity(showButton ? 1 : 0)
            .offset(y: showButton ? 0 : 12)
        }
        .onAppear { startAnimations() }
    }

    private func startAnimations() {
        withAnimation(.easeOut(duration: 0.5).delay(0.1)) {
            showLogo = true
        }
        withAnimation(.easeOut(duration: 0.5).delay(0.3)) {
            showTitle = true
        }
        withAnimation(.easeOut(duration: 0.4).delay(0.5)) {
            showFeatures = true
        }
        withAnimation(.easeOut(duration: 0.4).delay(0.7)) {
            showButton = true
        }
    }

    private func triggerHaptic() {
        let generator = UIImpactFeedbackGenerator(style: .medium)
        generator.impactOccurred()
    }
}

// MARK: - Feature Row

private struct FeatureRow: View {
    let icon: String
    let color: Color
    let title: String
    let subtitle: String
    let isVisible: Bool
    let delay: Double

    var body: some View {
        HStack(spacing: 14) {
            ZStack {
                Circle()
                    .fill(color.opacity(0.12))
                    .frame(width: 46, height: 46)

                Image(systemName: icon)
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundStyle(color)
            }

            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(Theme.labelPrimary)

                Text(subtitle)
                    .font(.caption)
                    .foregroundStyle(Theme.labelSecondary)
            }

            Spacer()
        }
        .padding(.horizontal, Theme.paddingCard)
        .padding(.vertical, 10)
        .background(
            RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous)
                .fill(Theme.cardBackground)
        )
        .overlay(
            RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous)
                .stroke(Theme.borderColor, lineWidth: Theme.borderWidthSubtle)
        )
        .opacity(isVisible ? 1 : 0)
        .offset(y: isVisible ? 0 : 12)
        .animation(
            .easeOut(duration: 0.4).delay(delay),
            value: isVisible
        )
    }
}

#Preview {
    OnboardingWelcomeStepView(viewModel: OnboardingViewModel())
}
