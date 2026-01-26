//
//  CreateMatchIntentSheet.swift
//  AceClub
//

import SwiftUI

struct CreateMatchIntentSheet: View {
    @Binding var isPresented: Bool
    var onCreated: (() -> Void)?

    @State private var matchDate = Date()
    @State private var matchTime = Date()
    @State private var durationMinutes: Int = 90
    @State private var isLoading = false
    @State private var errorMessage: String?

    private let createUseCase = CreateMatchIntentUseCase()
    private let durationOptions = [60, 90, 120, 180]

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    DatePicker("Date", selection: $matchDate, displayedComponents: .date)
                    DatePicker("Heure", selection: $matchTime, displayedComponents: .hourAndMinute)
                } header: {
                    Text("Quand ?")
                }

                Section {
                    Picker("Durée", selection: $durationMinutes) {
                        ForEach(durationOptions, id: \.self) { minutes in
                            Text(durationLabel(minutes))
                                .tag(minutes)
                        }
                    }
                    .pickerStyle(.menu)
                } header: {
                    Text("Durée du match")
                }

                if let error = errorMessage {
                    Section {
                        Text(error)
                            .foregroundStyle(.red)
                            .font(.caption)
                    }
                }
            }
            .navigationTitle("Je cherche un match")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Annuler") {
                        isPresented = false
                    }
                    .disabled(isLoading)
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Publier") {
                        Task { await createIntent() }
                    }
                    .disabled(isLoading)
                    .fontWeight(.semibold)
                }
            }
            .overlay {
                if isLoading {
                    Color.black.opacity(0.2)
                        .ignoresSafeArea()
                    ProgressView()
                }
            }
        }
        .onAppear {
            errorMessage = nil
        }
    }

    private func durationLabel(_ minutes: Int) -> String {
        if minutes >= 60 {
            let h = minutes / 60
            let m = minutes % 60
            return m > 0 ? "\(h) h \(m) min" : "\(h) h"
        }
        return "\(minutes) min"
    }

    private func createIntent() async {
        errorMessage = nil
        isLoading = true

        let calendar = Calendar.current
        var components = calendar.dateComponents([.year, .month, .day], from: matchDate)
        let timeComponents = calendar.dateComponents([.hour, .minute], from: matchTime)
        components.hour = timeComponents.hour
        components.minute = timeComponents.minute
        let dateTime = calendar.date(from: components) ?? matchDate

        do {
            _ = try await createUseCase.execute(date: dateTime, time: dateTime, duration: durationMinutes)
            onCreated?()
            isPresented = false
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }
}
