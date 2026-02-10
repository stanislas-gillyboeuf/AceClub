//
//  CreateMatchIntentSheet.swift
//  AceClub
//

import SwiftUI

// MARK: - Step enum

private enum CreateIntentStep: CaseIterable {
    case activityType
    case dateTime
    case duration
    case description
}

// MARK: - CreateMatchIntentSheet

struct CreateMatchIntentSheet: View {
    @Binding var isPresented: Bool
    var onCreated: (() -> Void)?

    @State private var currentStep: CreateIntentStep = .activityType
    @State private var intentType: MatchIntentType?
    @State private var matchDate = Date()
    @State private var matchTime = Date()
    @State private var durationMinutes: Int?
    @State private var intentDescription: String = ""
    @State private var isLoading = false
    @State private var errorMessage: String?

    private let createUseCase = CreateMatchIntentUseCase()
    private let durationOptions = [60, 90, 120, 180, 300]

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
        return "L'heure doit \u{00ea}tre au moins 1h dans le futur (minimum \(minTime))"
    }

    var body: some View {
        VStack(spacing: 0) {
            sheetHeader
                .padding(.bottom, 8)

            ZStack {
                switch currentStep {
                case .activityType:
                    activityTypeStep
                        .geometryGroup()
                        .transition(.blurReplace(.upUp))
                case .dateTime:
                    dateTimeStep
                        .geometryGroup()
                        .transition(.blurReplace(.upUp))
                case .duration:
                    durationStep
                        .geometryGroup()
                        .transition(.blurReplace(.upUp))
                case .description:
                    descriptionStep
                        .geometryGroup()
                        .transition(.blurReplace(.upUp))
                }
            }
            .geometryGroup()
            .animation(.snappy(duration: 0.3), value: currentStep)
        }
        .padding(.horizontal, Theme.paddingHorizontal)
        .padding(.top, 16)
        .padding(.bottom, 10)
        .overlay {
            if isLoading {
                RoundedRectangle(cornerRadius: Theme.cornerRadiusLarge, style: .continuous)
                    .fill(.ultraThinMaterial)
                ProgressView()
            }
        }
        .onAppear {
            matchTime = Calendar.current.date(byAdding: .minute, value: 65, to: Date()) ?? Date()
        }
    }

    // MARK: - Header

    private var sheetHeader: some View {
        HStack {
            if currentStep != .activityType {
                Button {
                    triggerHaptic()
                    goBack()
                } label: {
                    Image(systemName: "chevron.left")
                        .font(.body.weight(.semibold))
                        .foregroundStyle(Theme.labelSecondary)
                }
            }

            Spacer()

            Text(stepTitle)
                .font(.headline)

            Spacer()

            Button {
                isPresented = false
            } label: {
                Image(systemName: "xmark.circle.fill")
                    .font(.title3)
                    .foregroundStyle(Theme.labelTertiary)
            }
        }
    }

    private var stepTitle: String {
        switch currentStep {
        case .activityType: return "Type d'activit\u{00e9}"
        case .dateTime: return "Quand ?"
        case .duration: return "Dur\u{00e9}e"
        case .description: return "Description"
        }
    }

    // MARK: - Step 1: Activity Type

    private var activityTypeStep: some View {
        VStack(spacing: 14) {
            HStack(spacing: 14) {
                ForEach(MatchIntentType.allCases, id: \.self) { type in
                    activityTile(type: type)
                }
            }

            continueButton {
                triggerHaptic()
                currentStep = .dateTime
            }
            .disabledWithOpacity(intentType == nil)

            backButton(label: "Annuler") {
                isPresented = false
            }
        }
    }

    private func activityTile(type: MatchIntentType) -> some View {
        let isSelected = intentType == type

        return Button {
            withAnimation(.easeOut(duration: 0.25)) {
                intentType = type
            }
            triggerHaptic()
        } label: {
            VStack(spacing: 14) {
                ZStack {
                    Circle()
                        .fill(isSelected ? Theme.tintColor.opacity(0.15) : Theme.tintColor.opacity(0.08))
                        .frame(width: 72, height: 72)

                    Image(systemName: type.icon)
                        .font(.system(size: 28, weight: .medium))
                        .foregroundStyle(isSelected ? Theme.tintColor : Theme.labelSecondary)
                }

                Text(type.displayName)
                    .font(.headline)
                    .foregroundStyle(isSelected ? Theme.tintColor : Theme.labelPrimary)
            }
            .frame(maxWidth: .infinity)
            .frame(height: 160)
            .overlay(
                RoundedRectangle(cornerRadius: Theme.cornerRadiusLarge, style: .continuous)
                    .stroke(
                        isSelected ? Theme.tintColor.opacity(0.4) : Theme.borderColor,
                        lineWidth: isSelected ? 2 : Theme.borderWidthSubtle
                    )
            )
            .overlay(alignment: .topTrailing) {
                if isSelected {
                    ZStack {
                        Circle()
                            .fill(Theme.tintColor)
                            .frame(width: 24, height: 24)

                        Image(systemName: "checkmark")
                            .font(.caption.weight(.bold))
                            .foregroundStyle(.white)
                    }
                    .padding(10)
                    .transition(.scale.combined(with: .opacity))
                }
            }
            .shadow(
                color: isSelected ? Theme.tintColor.opacity(0.12) : .clear,
                radius: 8, y: 3
            )
            .scaleEffect(isSelected ? 1.02 : 1.0)
            .animation(.easeOut(duration: 0.25), value: isSelected)
        }
        .buttonStyle(.plain)
    }

    // MARK: - Step 2: Date & Time

    private var dateTimeStep: some View {
        VStack(spacing: 16) {
            VStack(spacing: 12) {
                DatePicker("Date", selection: $matchDate, in: Date()..., displayedComponents: .date)
                    .padding(.horizontal, Theme.paddingCard)
                    .padding(.vertical, 10)
                    .background(
                        RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous)
                            .fill(Theme.cardBackground)
                    )

                DatePicker("Heure", selection: $matchTime, displayedComponents: .hourAndMinute)
                    .padding(.horizontal, Theme.paddingCard)
                    .padding(.vertical, 10)
                    .background(
                        RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous)
                            .fill(Theme.cardBackground)
                    )
            }

            if let message = timeValidationMessage {
                Text(message)
                    .font(.caption)
                    .foregroundStyle(Theme.destructiveColor)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }

            continueButton {
                triggerHaptic()
                currentStep = .duration
            }
            .disabledWithOpacity(!isTimeValid)

            backButton {
                triggerHaptic()
                goBack()
            }
        }
    }

    // MARK: - Step 3: Duration

    private var durationStep: some View {
        VStack(spacing: 16) {
            LazyVGrid(columns: [
                GridItem(.flexible(), spacing: 12),
                GridItem(.flexible(), spacing: 12)
            ], spacing: 12) {
                ForEach(durationOptions, id: \.self) { minutes in
                    durationTile(minutes: minutes)
                }
            }

            continueButton {
                triggerHaptic()
                currentStep = .description
            }
            .disabledWithOpacity(durationMinutes == nil)

            backButton {
                triggerHaptic()
                goBack()
            }
        }
    }

    private func durationTile(minutes: Int) -> some View {
        let isSelected = durationMinutes == minutes

        return Button {
            withAnimation(.easeOut(duration: 0.25)) {
                durationMinutes = minutes
            }
            triggerHaptic()
        } label: {
            VStack(spacing: 10) {
                Image(systemName: "clock.fill")
                    .font(.system(size: 24, weight: .medium))
                    .foregroundStyle(isSelected ? Theme.tintColor : Theme.labelSecondary)

                Text(durationLabel(minutes))
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(isSelected ? Theme.tintColor : Theme.labelPrimary)
            }
            .frame(maxWidth: .infinity)
            .frame(height: 90)
            .overlay(
                RoundedRectangle(cornerRadius: Theme.cornerRadiusLarge, style: .continuous)
                    .stroke(
                        isSelected ? Theme.tintColor.opacity(0.4) : Theme.borderColor,
                        lineWidth: isSelected ? 2 : Theme.borderWidthSubtle
                    )
            )
            .overlay(alignment: .topTrailing) {
                if isSelected {
                    ZStack {
                        Circle()
                            .fill(Theme.tintColor)
                            .frame(width: 22, height: 22)

                        Image(systemName: "checkmark")
                            .font(.caption2.weight(.bold))
                            .foregroundStyle(.white)
                    }
                    .padding(8)
                    .transition(.scale.combined(with: .opacity))
                }
            }
            .shadow(
                color: isSelected ? Theme.tintColor.opacity(0.12) : .clear,
                radius: 8, y: 3
            )
            .scaleEffect(isSelected ? 1.02 : 1.0)
            .animation(.easeOut(duration: 0.25), value: isSelected)
        }
        .buttonStyle(.plain)
    }

    // MARK: - Step 4: Description

    private var descriptionStep: some View {
        VStack(spacing: 16) {
            Text("Ajoute des pr\u{00e9}cisions : niveau recherch\u{00e9}, lieu pr\u{00e9}f\u{00e9}r\u{00e9}...")
                .font(.subheadline)
                .foregroundStyle(Theme.labelSecondary)
                .frame(maxWidth: .infinity, alignment: .leading)

            TextField("Description (optionnel)", text: $intentDescription, axis: .vertical)
                .lineLimit(2...4)
                .aceTextFieldStyle()

            if let error = errorMessage {
                Text(error)
                    .font(.caption)
                    .foregroundStyle(Theme.destructiveColor)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }

            Button {
                Task { await createIntent() }
            } label: {
                Group {
                    if isLoading {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    } else {
                        Text("Publier")
                    }
                }
            }
            .buttonStyle(.appPrimary)
            .disabled(isLoading)
            .padding(.top, 4)

            backButton {
                triggerHaptic()
                goBack()
            }
        }
    }

    // MARK: - Shared buttons

    private func continueButton(action: @escaping () -> Void) -> some View {
        Button("Continuer", action: action)
            .buttonStyle(.appPrimary)
            .padding(.top, 8)
    }

    private func backButton(label: String = "Retour", action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(label)
                .font(.subheadline)
                .foregroundStyle(Theme.labelSecondary)
        }
        .buttonStyle(.plain)
    }

    // MARK: - Navigation

    private func goBack() {
        switch currentStep {
        case .activityType:
            break
        case .dateTime:
            currentStep = .activityType
        case .duration:
            currentStep = .dateTime
        case .description:
            currentStep = .duration
        }
    }

    // MARK: - Helpers

    private func durationLabel(_ minutes: Int) -> String {
        if minutes >= 60 {
            let h = minutes / 60
            let m = minutes % 60
            return m > 0 ? "\(h)h\(m)" : "\(h)h"
        }
        return "\(minutes) min"
    }

    private func triggerHaptic() {
        let generator = UIImpactFeedbackGenerator(style: .light)
        generator.impactOccurred()
    }

    // MARK: - Create Intent

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
                duration: durationMinutes ?? 90,
                type: intentType ?? .match,
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
