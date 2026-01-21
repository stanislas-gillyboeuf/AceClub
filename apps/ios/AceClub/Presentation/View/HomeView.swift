//
//  HomeView.swift
//  AceClub
//
//  Created by Nicolas Becharat on 12/01/2026.
//

import SwiftUI

struct HomeView: View {
    @Environment(AuthViewModel.self) private var authViewModel

    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                
                if let user = authViewModel.currentUser {
                    VStack(spacing: 8) {
                        Text("Welcome!")
                            .font(.largeTitle)
                            .fontWeight(.bold)
                        
                        Text(user.name)
                            .font(.title2)
                            .foregroundColor(.secondary)
                        
                        Text(user.email)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    .padding(.top, 40)
                }
                
                Spacer()
                
                Button(action: handleSignOut) {
                    if authViewModel.isLoading {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            .frame(maxWidth: .infinity)
                            .frame(height: 50)
                    } else {
                        Text("Sign Out")
                            .fontWeight(.semibold)
                            .frame(maxWidth: .infinity)
                            .frame(height: 50)
                    }
                }
                .buttonStyle(.bordered)
                .tint(.red)
                .disabled(authViewModel.isLoading)
                .padding(.horizontal, 24)
                .padding(.bottom, 40)
            }
            .navigationTitle("AceClub")
        }
    }

    private func handleSignOut() {
        Task {
            await authViewModel.signOut()
        }
    }
}

