import SwiftUI

struct SplashView: View {
    private let brandOrange = Color(red: 0.85, green: 0.38, blue: 0.15)

    @State private var animateCircle = false
    @State private var animateStrokes = false
    @State private var animateGrid = false
    @State private var collapse = false

    var body: some View {
        ZStack {
            Color("LaunchScreenBackground")
                .ignoresSafeArea()

            ZStack {
                Circle()
                    .fill(brandOrange.gradient)
                    .scaleEffect(animateCircle ? 2.5 : 0)

                GridLines()

                CircleStrokesView()

                // Logo always visible
                VStack(spacing: 12) {
                    Image("AceClubLogo")
                        .resizable()
                        .scaledToFit()
                        .frame(width: 80, height: 80)
                        .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
                        .shadow(color: .black.opacity(0.25), radius: 12, y: 4)

                    Text("Ace Club")
                        .font(.title3.bold())
                        .foregroundStyle(.white)
                }
            }
            .frame(width: collapse ? 160 : 300, height: collapse ? 160 : 300)
            .clipShape(RoundedRectangle(cornerRadius: collapse ? 36 : 68, style: .continuous))
        }
        .task {
            try? await Task.sleep(for: .seconds(0.3))
            withAnimation(.easeInOut(duration: 0.5)) {
                animateCircle = true
            }

            try? await Task.sleep(for: .seconds(0.6))
            withAnimation(.linear(duration: 0.8)) {
                animateStrokes = true
            }

            try? await Task.sleep(for: .seconds(0.3))
            withAnimation(.linear(duration: 0.6)) {
                animateGrid = true
            }

            try? await Task.sleep(for: .seconds(0.5))
            withAnimation(.bouncy(duration: 0.5)) {
                collapse = true
            }
        }
    }

    // MARK: - Circle Strokes

    @ViewBuilder
    private func CircleStrokesView() -> some View {
        ZStack {
            Circle()
                .trim(from: 0, to: animateStrokes ? 1 : 0)
                .stroke(.white.opacity(0.25), lineWidth: 0.5)
                .frame(width: 60, height: 60)
                .scaleEffect(collapse ? 2 : 1)

            Circle()
                .trim(from: 0, to: animateStrokes ? 1 : 0)
                .stroke(.white.opacity(0.15), lineWidth: 0.5)
                .frame(width: 160, height: 160)

            Circle()
                .trim(from: 0, to: animateStrokes ? 1 : 0)
                .stroke(.white.opacity(0.1), lineWidth: 0.5)
                .frame(width: 240, height: 240)
        }
        .compositingGroup()
        .scaleEffect(collapse ? 1.3 : 1)
        .opacity(collapse ? 0 : animateCircle ? 1 : 0)
    }

    // MARK: - Grid Lines

    @ViewBuilder
    private func GridLines() -> some View {
        ZStack {
            HStack(spacing: 0) {
                ForEach(1...3, id: \.self) { index in
                    Rectangle()
                        .fill(.white.opacity(0.08))
                        .frame(width: 0.5, height: animateGrid ? nil : 0)
                        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
                        .scaleEffect(y: index == 2 ? -1 : 1)
                }
            }

            VStack(spacing: 0) {
                ForEach(1...3, id: \.self) { index in
                    Rectangle()
                        .fill(.white.opacity(0.08))
                        .frame(width: animateGrid ? nil : 0, height: 0.5)
                        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
                        .scaleEffect(x: index == 2 ? -1 : 1)
                }
            }
        }
        .compositingGroup()
        .opacity(collapse ? 0 : animateCircle ? 1 : 0)
    }
}

#Preview {
    SplashView()
}
