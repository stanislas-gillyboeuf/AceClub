import SwiftUI

struct SplashView: View {
    @State private var logoScale: CGFloat = 1.0
    @State private var opacity: Double = 1.0

    var body: some View {
        ZStack {
            Color("LaunchScreenBackground")
                .ignoresSafeArea()

            VStack(spacing: 16) {
                Image("AceClubLogo")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 100, height: 100)
                    .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))
                    .shadow(color: .black.opacity(0.2), radius: 12, y: 4)

                Text("Ace Club")
                    .font(.title2.bold())
                    .foregroundStyle(.white)
            }
            .scaleEffect(logoScale)
        }
        .opacity(opacity)
    }

    func animateOut(completion: @escaping () -> Void) {
        withAnimation(.easeOut(duration: 0.4)) {
            logoScale = 1.2
            opacity = 0
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) {
            completion()
        }
    }
}

#Preview {
    SplashView()
}
