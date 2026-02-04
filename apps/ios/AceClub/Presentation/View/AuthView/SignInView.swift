//
//  SignInView.swift
//  AceClub
//
//  Created by Nicolas Becharat on 12/01/2026.
//

import SwiftUI
import GoogleSignIn
import GoogleSignInSwift
import AuthenticationServices

struct SignInView: View {
    @Environment(AuthViewModel.self) private var authViewModel
    @State private var showTermsOfService = false
    @State private var showPrivacyPolicy = false

    private var isProductionEnvironment: Bool {
        Config.environment == "production"
    }

    var body: some View {
        VStack(spacing: 0) {
            Spacer()

            // Hero section
            VStack(spacing: 24) {
                // App icon
                Image("AceClubLogo")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 100, height: 100)
                    .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))
                    .shadow(color: .black.opacity(0.1), radius: 12, x: 0, y: 4)

                // Welcome text
                VStack(spacing: 8) {
                    Text("Bienvenue sur AceClub")
                        .font(.title)
                        .fontWeight(.bold)

                    Text("Trouve des partenaires, organise tes matchs et rejoins ta communaute.")
                        .font(.body)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 24)
                }
            }

            Spacer()

            // Sign in buttons
            VStack(spacing: 12) {
                // Error Message
                if let errorMessage = authViewModel.errorMessage {
                    HStack(spacing: 8) {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .font(.caption)
                        Text(errorMessage)
                            .font(.footnote)
                    }
                    .foregroundStyle(.red)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)
                    .background(Color.red.opacity(0.1))
                    .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
                    .padding(.bottom, 8)
                }

                // Apple Sign-In Button (primary on iOS)
                if isProductionEnvironment {
                    Button(action: handleAppleSignIn) {
                        HStack(spacing: 12) {
                            Image(systemName: "apple.logo")
                                .font(.system(size: 18, weight: .medium))

                            if authViewModel.isLoading {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            } else {
                                Text("Continuer avec Apple")
                                    .fontWeight(.medium)
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .frame(height: Theme.buttonHeight)
                        .foregroundStyle(.white)
                        .background(Color.black)
                        .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusSmall, style: .continuous))
                    }
                    .disabled(authViewModel.isLoading)
                }

                // Google Sign-In Button
                Button(action: handleGoogleSignIn) {
                    HStack(spacing: 12) {
                        GoogleLogoView()
                            .frame(width: 18, height: 18)

                        if authViewModel.isLoading && !isProductionEnvironment {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: .primary))
                        } else {
                            Text("Continuer avec Google")
                                .fontWeight(.medium)
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .frame(height: Theme.buttonHeight)
                }
                .buttonStyle(.appOutlined)
                .disabled(authViewModel.isLoading)

                // Debug mode info
                if !isProductionEnvironment {
                    Text("Mode developpement - Apple Sign-In desactive")
                        .font(.caption2)
                        .foregroundStyle(.tertiary)
                        .padding(.top, 4)
                }
            }
            .padding(.horizontal, Theme.paddingHorizontal)

            // Footer
            VStack(spacing: 8) {
                Text("En continuant, tu acceptes nos")
                    .font(.caption)
                    .foregroundStyle(.secondary)

                HStack(spacing: 4) {
                    Button("Conditions d'utilisation") {
                        showTermsOfService = true
                    }
                    .font(.caption)

                    Text("et")
                        .font(.caption)
                        .foregroundStyle(.secondary)

                    Button("Politique de confidentialité") {
                        showPrivacyPolicy = true
                    }
                    .font(.caption)
                }
            }
            .padding(.top, 24)
            .padding(.bottom, 16)
        }
        .background(Color(.systemBackground))
        .sheet(isPresented: $showTermsOfService) {
            TermsOfServiceView()
        }
        .sheet(isPresented: $showPrivacyPolicy) {
            PrivacyPolicyView()
        }
    }

    private func handleGoogleSignIn() {
        Task {
            await authViewModel.signInWithGoogle()
        }
    }

    private func handleAppleSignIn() {
        guard isProductionEnvironment else { return }
        Task {
            await authViewModel.signInWithApple()
        }
    }
}

// MARK: - Google Logo View
struct GoogleLogoView: View {
    var body: some View {
        Canvas { context, size in
            let scale = min(size.width, size.height) / 32

            // Blue path (right side arc) - opacity 0.4
            var bluePath = Path()
            bluePath.move(to: CGPoint(x: 29.44 * scale, y: 16.318 * scale))
            bluePath.addCurve(
                to: CGPoint(x: 29.185 * scale, y: 13.454 * scale),
                control1: CGPoint(x: 29.44 * scale, y: 15.325 * scale),
                control2: CGPoint(x: 29.351 * scale, y: 14.371 * scale)
            )
            bluePath.addLine(to: CGPoint(x: 16 * scale, y: 13.454 * scale))
            bluePath.addLine(to: CGPoint(x: 16 * scale, y: 18.876 * scale))
            bluePath.addLine(to: CGPoint(x: 23.535 * scale, y: 18.876 * scale))
            bluePath.addCurve(
                to: CGPoint(x: 20.722 * scale, y: 23.089 * scale),
                control1: CGPoint(x: 23.204 * scale, y: 20.62 * scale),
                control2: CGPoint(x: 22.211 * scale, y: 22.096 * scale)
            )
            bluePath.addLine(to: CGPoint(x: 25.266 * scale, y: 26.614 * scale))
            bluePath.addCurve(
                to: CGPoint(x: 29.44 * scale, y: 16.318 * scale),
                control1: CGPoint(x: 27.913 * scale, y: 24.17 * scale),
                control2: CGPoint(x: 29.44 * scale, y: 20.581 * scale)
            )
            bluePath.closeSubpath()
            context.fill(bluePath, with: .color(Color(red: 66/255, green: 133/255, blue: 244/255).opacity(0.4)))

            // Green path (bottom right)
            var greenPath = Path()
            greenPath.move(to: CGPoint(x: 16 * scale, y: 30 * scale))
            greenPath.addCurve(
                to: CGPoint(x: 25.265 * scale, y: 26.615 * scale),
                control1: CGPoint(x: 19.78 * scale, y: 30 * scale),
                control2: CGPoint(x: 22.949 * scale, y: 28.753 * scale)
            )
            greenPath.addLine(to: CGPoint(x: 20.721 * scale, y: 23.09 * scale))
            greenPath.addCurve(
                to: CGPoint(x: 15.999 * scale, y: 24.439 * scale),
                control1: CGPoint(x: 19.474 * scale, y: 23.93 * scale),
                control2: CGPoint(x: 17.883 * scale, y: 24.439 * scale)
            )
            greenPath.addCurve(
                to: CGPoint(x: 8.159 * scale, y: 18.674 * scale),
                control1: CGPoint(x: 12.359 * scale, y: 24.439 * scale),
                control2: CGPoint(x: 9.266 * scale, y: 22.13 * scale)
            )
            greenPath.addLine(to: CGPoint(x: 5.442 * scale, y: 20.764 * scale))
            greenPath.addLine(to: CGPoint(x: 3.501 * scale, y: 22.289 * scale))
            greenPath.addCurve(
                to: CGPoint(x: 16 * scale, y: 30 * scale),
                control1: CGPoint(x: 5.805 * scale, y: 26.858 * scale),
                control2: CGPoint(x: 10.526 * scale, y: 30 * scale)
            )
            greenPath.closeSubpath()
            context.fill(greenPath, with: .color(Color(red: 52/255, green: 168/255, blue: 83/255)))

            // Yellow path (left side) - opacity 0.4
            var yellowPath = Path()
            yellowPath.move(to: CGPoint(x: 8.16 * scale, y: 18.66 * scale))
            yellowPath.addCurve(
                to: CGPoint(x: 7.715 * scale, y: 16 * scale),
                control1: CGPoint(x: 7.88 * scale, y: 17.82 * scale),
                control2: CGPoint(x: 7.715 * scale, y: 16.929 * scale)
            )
            yellowPath.addCurve(
                to: CGPoint(x: 8.16 * scale, y: 13.34 * scale),
                control1: CGPoint(x: 7.715 * scale, y: 15.071 * scale),
                control2: CGPoint(x: 7.88 * scale, y: 14.18 * scale)
            )
            yellowPath.addLine(to: CGPoint(x: 8.16 * scale, y: 9.725 * scale))
            yellowPath.addLine(to: CGPoint(x: 3.502 * scale, y: 9.725 * scale))
            yellowPath.addCurve(
                to: CGPoint(x: 2 * scale, y: 16 * scale),
                control1: CGPoint(x: 2.547 * scale, y: 11.609 * scale),
                control2: CGPoint(x: 2 * scale, y: 13.734 * scale)
            )
            yellowPath.addCurve(
                to: CGPoint(x: 3.502 * scale, y: 22.275 * scale),
                control1: CGPoint(x: 2 * scale, y: 18.266 * scale),
                control2: CGPoint(x: 2.547 * scale, y: 20.391 * scale)
            )
            yellowPath.addLine(to: CGPoint(x: 6.834 * scale, y: 18.66 * scale))
            yellowPath.addLine(to: CGPoint(x: 8.16 * scale, y: 18.66 * scale))
            yellowPath.closeSubpath()
            context.fill(yellowPath, with: .color(Color(red: 251/255, green: 188/255, blue: 5/255).opacity(0.4)))

            // Red path (top)
            var redPath = Path()
            redPath.move(to: CGPoint(x: 16 * scale, y: 7.575 * scale))
            redPath.addCurve(
                to: CGPoint(x: 21.358 * scale, y: 9.662 * scale),
                control1: CGPoint(x: 18.062 * scale, y: 7.575 * scale),
                control2: CGPoint(x: 19.895 * scale, y: 8.288 * scale)
            )
            redPath.addLine(to: CGPoint(x: 25.367 * scale, y: 5.653 * scale))
            redPath.addCurve(
                to: CGPoint(x: 16 * scale, y: 2 * scale),
                control1: CGPoint(x: 22.936 * scale, y: 3.388 * scale),
                control2: CGPoint(x: 19.78 * scale, y: 2 * scale)
            )
            redPath.addCurve(
                to: CGPoint(x: 3.502 * scale, y: 9.725 * scale),
                control1: CGPoint(x: 10.527 * scale, y: 2 * scale),
                control2: CGPoint(x: 5.805 * scale, y: 5.144 * scale)
            )
            redPath.addLine(to: CGPoint(x: 8.16 * scale, y: 13.34 * scale))
            redPath.addCurve(
                to: CGPoint(x: 16 * scale, y: 7.575 * scale),
                control1: CGPoint(x: 9.267 * scale, y: 10.031 * scale),
                control2: CGPoint(x: 12.36 * scale, y: 7.575 * scale)
            )
            redPath.closeSubpath()
            context.fill(redPath, with: .color(Color(red: 234/255, green: 67/255, blue: 53/255)))
        }
    }
}

#Preview {
    SignInView()
        .environment(AuthViewModel())
}
