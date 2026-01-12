import Foundation

@MainActor
class ProfileViewModel: ObservableObject {
    @Published var user: User
    @Published var errorMessage: String? = nil
    @Published var isLoading: Bool = false


    private let getMeUseCase = GetMeUseCase()
    func getUser() async {
        isLoading = true
        errorMessage = nil
        do {
            result = try await getMeUseCase.execute()
            self.user = result
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }
}