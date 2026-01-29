//
//  ScoreStepperView.swift
//  AceClub
//
//  Un composant de score stepper moderne et accessible
//

import SwiftUI

struct ScoreStepperView: View {
    @Binding var value: Int
    let minValue: Int
    let maxValue: Int
    let accentColor: Color

    @State private var decrementTrigger = false
    @State private var incrementTrigger = false

    init(
        value: Binding<Int>,
        minValue: Int = 0,
        maxValue: Int = 99,
        accentColor: Color = .accentColor
    ) {
        self._value = value
        self.minValue = minValue
        self.maxValue = maxValue
        self.accentColor = accentColor
    }

    var body: some View {
        HStack(spacing: 0) {
            // Bouton -
            stepperButton(
                systemImage: "minus",
                isEnabled: value > minValue
            ) {
                withAnimation(.snappy(duration: 0.15)) {
                    if value > minValue {
                        value -= 1
                        decrementTrigger.toggle()
                    }
                }
            }

            // Valeur centrale
            Text("\(value)")
                .font(.system(size: 32, weight: .bold, design: .rounded))
                .frame(minWidth: 56)
                .contentTransition(.numericText(value: Double(value)))
                .animation(.snappy(duration: 0.2), value: value)

            // Bouton +
            stepperButton(
                systemImage: "plus",
                isEnabled: value < maxValue
            ) {
                withAnimation(.snappy(duration: 0.15)) {
                    if value < maxValue {
                        value += 1
                        incrementTrigger.toggle()
                    }
                }
            }
        }
        .padding(4)
        .background(Theme.tertiaryBackground)
        .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
        .sensoryFeedback(.impact(flexibility: .soft), trigger: decrementTrigger)
        .sensoryFeedback(.impact(flexibility: .soft), trigger: incrementTrigger)
    }

    @ViewBuilder
    private func stepperButton(
        systemImage: String,
        isEnabled: Bool,
        action: @escaping () -> Void
    ) -> some View {
        Button(action: action) {
            Image(systemName: systemImage)
                .font(.system(size: 18, weight: .semibold))
                .foregroundStyle(isEnabled ? accentColor : .secondary.opacity(0.4))
                .frame(width: 44, height: 44)
                .background(isEnabled ? accentColor.opacity(0.15) : Color.clear)
                .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusSmall, style: .continuous))
        }
        .disabled(!isEnabled)
        .buttonStyle(.plain)
    }
}

#Preview {
    VStack(spacing: 24) {
        ScoreStepperView(value: .constant(6), accentColor: .blue)
        ScoreStepperView(value: .constant(4), accentColor: .orange)
        ScoreStepperView(value: .constant(0), accentColor: .green)
    }
    .padding()
}
