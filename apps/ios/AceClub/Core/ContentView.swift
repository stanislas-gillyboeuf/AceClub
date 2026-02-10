import SwiftUI

struct ContentView: View {
    @Environment(AuthViewModel.self) private var authViewModel
    @State private var showSplash = true
    @State private var appUpdateInfo: AppUpdateInfo?
    @State private var forcedAppUpdate: Bool = false

    private let checkAppUpdateUseCase = CheckAppUpdateUseCase()

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
        .sheet(item: $appUpdateInfo) { info in
            AppUpdateView(appInfo: info, forcedUpdate: $forcedAppUpdate)
        }
        .task {
            await authViewModel.checkSession()
            withAnimation(.easeOut(duration: 0.4)) {
                showSplash = false
            }
        }
        .task {
            if let result = try? await checkAppUpdateUseCase.execute() {
                appUpdateInfo = result
            }
        }
    }
}
