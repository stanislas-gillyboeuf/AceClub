//
//  SignInView.swift
//  AceClub
//
//  Created by Nicolas Becharat on 12/01/2026.
//

import SwiftUI

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
}

#Preview {
    SignInView()
        .environment(AuthViewModel())
}
