import Foundation
import Combine

@MainActor
class ProfileViewModel: ObservableObject {
    @Published var user: User? = nil
    @Published var errorMessage: String? = nil
    @Published var isLoading: Bool = false

    private let getMeUseCase = GetMeUseCase()

    func getUser() async {
        isLoading = true
        errorMessage = nil
        do {
            let result = try await getMeUseCase.execute()
            self.user = result
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }
}