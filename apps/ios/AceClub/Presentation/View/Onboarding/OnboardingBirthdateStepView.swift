import SwiftUI

struct OnboardingBirthdateStepView: View {
    @ObservedObject var viewModel: OnboardingViewModel
    @State private var appeared = false

    private let dateRange: ClosedRange<Date> = {
        let calendar = Calendar.current
        let minDate = calendar.date(byAdding: .year, value: -100, to: Date()) ?? Date()
        let maxDate = calendar.date(byAdding: .year, value: -5, to: Date()) ?? Date()
        return minDate...maxDate
    }()

    var body: some View {
        VStack(spacing: 0) {
            OnboardingStepHeader(
                icon: "gift.fill",
                title: "Ta date de naissance",
                subtitle: "Pour personnaliser ton experience."
            )

            VStack(spacing: 20) {
                DatePicker(
                    "Date de naissance",
                    selection: $viewModel.selectedBirthdate,
                    in: dateRange,
                    displayedComponents: .date
                )
                .datePickerStyle(.wheel)
                .labelsHidden()
                .environment(\.locale, Locale(identifier: "fr_FR"))
                .opacity(appeared ? 1 : 0)
                .offset(y: appeared ? 0 : 20)
                .animation(.easeOut(duration: 0.4).delay(0.15), value: appeared)
            }
            .padding(.horizontal, Theme.paddingHorizontal)
            .padding(.top, 24)

            Spacer()
        }
        .onAppear {
            withAnimation(.easeOut(duration: 0.3)) {
                appeared = true
            }
        }
        .onChange(of: viewModel.selectedBirthdate) { _, _ in
            if !viewModel.hasBirthdateBeenSet {
                viewModel.hasBirthdateBeenSet = true
            }
        }
    }
}

#Preview {
    OnboardingBirthdateStepView(viewModel: OnboardingViewModel())
}
