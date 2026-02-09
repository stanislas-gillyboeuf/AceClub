import SwiftUI

struct ContentView: View {
    @Environment(AuthViewModel.self) private var authViewModel
    @State private var showSplash = true

    var body: some View {
        ZStack {
            if !showSplash {
                Group {
                    if authViewModel.isAuthenticated {
                        if let user = authViewModel.currentUser, user.isOnboardingCompleted == false {
                            OnboardingView()
                        } else {
                            RootView()
                        }
                    } else {
                        SignInView()
                    }
                }
                .transition(.opacity)
            }

            if showSplash {
                SplashView()
                    .transition(.opacity)
            }
        }
        .animation(.easeInOut(duration: 0.4), value: showSplash)
        .task {
            await authViewModel.checkSession()
            withAnimation(.easeOut(duration: 0.4)) {
                showSplash = false
            }
        }
    }
}
