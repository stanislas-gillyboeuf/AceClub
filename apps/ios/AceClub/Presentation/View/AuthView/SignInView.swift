//
//  SignInView.swift
//  AceClub
//
//  Created by Nicolas Becharat on 12/01/2026.
//

import SwiftUI
import GoogleSignIn
import GoogleSignInSwift

struct SignInView: View {
    @Environment(AuthViewModel.self) private var authViewModel

    @State private var email = ""
    @State private var password = ""
    @State private var rememberMe = true
    @State private var showPassword = false
    @State private var showSignUp = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Header
                    VStack(spacing: 8) {
                        Text("Welcome Back")
                            .font(.largeTitle)
                            .fontWeight(.bold)

                        Text("Sign in to your account")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    .padding(.top, 60)

                    // Form
                    VStack(spacing: 16) {
                        // Email Field
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Email")
                                .font(.subheadline)
                                .fontWeight(.medium)

                            TextField("Enter your email", text: $email)
                                .textFieldStyle(.roundedBorder)
                                .textContentType(.emailAddress)
                                .textInputAutocapitalization(.never)
                                .keyboardType(.emailAddress)
                                .disabled(authViewModel.isLoading)
                        }

                        // Password Field
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Password")
                                .font(.subheadline)
                                .fontWeight(.medium)

                            HStack {
                                if showPassword {
                                    TextField("Enter your password", text: $password)
                                        .textContentType(.password)
                                        .disabled(authViewModel.isLoading)
                                } else {
                                    SecureField("Enter your password", text: $password)
                                        .textContentType(.password)
                                        .disabled(authViewModel.isLoading)
                                }

                                Button(action: { showPassword.toggle() }) {
                                    Image(systemName: showPassword ? "eye.slash" : "eye")
                                        .foregroundColor(.secondary)
                                }
                            }
                            .padding(12)
                            .background(Color(.systemGray6))
                            .cornerRadius(8)
                        }

                        // Remember Me
                        HStack {
                            Toggle("Remember me", isOn: $rememberMe)
                                .font(.subheadline)

                            Spacer()
                        }
                    }
                    .padding(.top, 20)

                    // Error Message
                    if let errorMessage = authViewModel.errorMessage {
                        Text(errorMessage)
                            .font(.caption)
                            .foregroundColor(.red)
                            .frame(maxWidth: .infinity, alignment: .leading)
                    }

                    // Sign In Button
                    Button(action: handleSignIn) {
                        if authViewModel.isLoading {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                .frame(maxWidth: .infinity)
                                .frame(height: 50)
                        } else {
                            Text("Sign In")
                                .fontWeight(.semibold)
                                .frame(maxWidth: .infinity)
                                .frame(height: 50)
                        }
                    }
                    .buttonStyle(.borderedProminent)
                    .disabled(authViewModel.isLoading || !isFormValid)

                    // Divider
                    HStack {
                        Rectangle()
                            .frame(height: 1)
                            .foregroundColor(.secondary.opacity(0.3))
                        Text("or")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                        Rectangle()
                            .frame(height: 1)
                            .foregroundColor(.secondary.opacity(0.3))
                    }
                    .padding(.vertical, 8)

                    // Google Sign-In Button
                    Button(action: handleGoogleSignIn) {
                        HStack(spacing: 12) {
                            GoogleLogoView()
                                .frame(width: 20, height: 20)
                            Text("Continue with Google")
                                .fontWeight(.medium)
                        }
                        .frame(maxWidth: .infinity)
                        .frame(height: 50)
                        .foregroundColor(.primary)
                        .background(Color(.systemBackground))
                        .overlay(
                            RoundedRectangle(cornerRadius: 8)
                                .stroke(Color.secondary.opacity(0.3), lineWidth: 1)
                        )
                        .cornerRadius(8)
                    }
                    .disabled(authViewModel.isLoading)

                    // Sign Up Link
                    HStack {
                        Text("Don't have an account?")
                            .foregroundColor(.secondary)

                        Button("Sign Up") {
                            showSignUp = true
                        }
                        .fontWeight(.semibold)
                    }
                    .font(.subheadline)
                }
                .padding(.horizontal, 24)
            }
            .sheet(isPresented: $showSignUp) {
                SignUpView()
            }
        }
    }

    private var isFormValid: Bool {
        !email.isEmpty && !password.isEmpty
    }

    private func handleSignIn() {
        Task {
            await authViewModel.signIn(email: email, password: password, rememberMe: rememberMe)
        }
    }

    private func handleGoogleSignIn() {
        Task {
            await authViewModel.signInWithGoogle()
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
