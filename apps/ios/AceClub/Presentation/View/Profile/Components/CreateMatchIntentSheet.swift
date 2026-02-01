//
//  CreateMatchIntentSheet.swift
//  AceClub
//

import SwiftUI

struct CreateMatchIntentSheet: View {
    @Binding var isPresented: Bool
    var onCreated: (() -> Void)?

    @State private var matchDate = Date()
    @State private var matchTime = Calendar.current.date(byAdding: .hour, value: 1, to: Date()) ?? Date()
    @State private var durationMinutes: Int = 90
    @State private var intentType: MatchIntentType = .match
    @State private var intentDescription: String = ""
    @State private var isLoading = false
    @State private var errorMessage: String?

    private let createUseCase = CreateMatchIntentUseCase()
    private let durationOptions = [60, 90, 120, 180]

    private var minimumDateTime: Date {
        Calendar.current.date(byAdding: .hour, value: 1, to: Date()) ?? Date()
    }
    private var combinedDateTime: Date {
        let calendar = Calendar.current
        var components = calendar.dateComponents([.year, .month, .day], from: matchDate)
        let timeComponents = calendar.dateComponents([.hour, .minute], from: matchTime)
        components.hour = timeComponents.hour
        components.minute = timeComponents.minute
        return calendar.date(from: components) ?? matchDate
    }

    private var isTimeValid: Bool {
        combinedDateTime >= minimumDateTime
    }

    private var timeValidationMessage: String? {
        guard !isTimeValid else { return nil }
        let formatter = DateFormatter()
        formatter.dateFormat = "HH:mm"
        let minTime = formatter.string(from: minimumDateTime)
        return "L'heure doit être au moins 1h dans le futur (minimum \(minTime) aujourd'hui)"
    }

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    DatePicker("Date", selection: $matchDate, in: Date()..., displayedComponents: .date)
                    DatePicker("Heure", selection: $matchTime, displayedComponents: .hourAndMinute)
                } header: {
                    Text("Quand ?")
                } footer: {
                    if let message = timeValidationMessage {
                        Text(message)
                            .foregroundStyle(.red)
                    }
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
                    Text("Durée")
                }

                Section {
                    Picker("Type", selection: $intentType) {
                        ForEach(MatchIntentType.allCases, id: \.self) { type in
                            Label(type.displayName, systemImage: type.icon)
                                .tag(type)
                        }
                    }
                    .pickerStyle(.segmented)
                } header: {
                    Text("Type d'activité")
                }

                Section {
                    TextField("Description (optionnel)", text: $intentDescription, axis: .vertical)
                        .lineLimit(2...4)
                } header: {
                    Text("Description")
                } footer: {
                    Text("Ajoute des précisions : niveau recherché, lieu préféré...")
                }

                if let error = errorMessage {
                    Section {
                        Text(error)
                            .foregroundStyle(.red)
                            .font(.caption)
                    }
                }
            }
            .scrollContentBackground(.hidden)
            .navigationTitle(intentType == .match ? "Je cherche un match" : "Je cherche un entraînement")
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
                    .disabled(isLoading || !isTimeValid)
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
        .presentationBackground(.regularMaterial)
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
            let desc = intentDescription.trimmingCharacters(in: .whitespacesAndNewlines)
            _ = try await createUseCase.execute(
                date: dateTime,
                time: dateTime,
                duration: durationMinutes,
                type: intentType,
                description: desc.isEmpty ? nil : desc
            )
            onCreated?()
            isPresented = false
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }
}
