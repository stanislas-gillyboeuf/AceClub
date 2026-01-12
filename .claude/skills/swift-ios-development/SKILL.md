---
name: swift-ios-development
description: Develop professional iOS applications with Swift and SwiftUI. Use when creating iOS views, view models, services, networking, or discussing iOS architecture patterns.
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
---

# Swift iOS Development Standards

Professional guidelines for building production-ready iOS applications with Swift and SwiftUI.

## Core Principles

1. **Swift Best Practices**: Modern Swift syntax, protocols, and type safety
2. **MVVM Architecture**: Separation of UI (View), logic (ViewModel), and data (Model)
3. **SwiftUI Declarative**: Leverage SwiftUI's declarative paradigm
4. **Async/Await**: Use modern concurrency for network and async operations
5. **Error Handling**: Comprehensive error handling with proper user feedback

## Standard Project Structure

```
YourApp/
├── App/
│   └── YourAppApp.swift        # App entry point
├── Models/                     # Data models
├── ViewModels/                 # Business logic and state
├── Views/                      # SwiftUI views
├── Services/                   # Networking, persistence, etc.
├── Config/                     # Configuration files
└── Utils/                      # Helper functions and extensions
```

## MVVM Architecture Pattern

### Model (Data Layer)

```swift
// Models/User.swift
import Foundation

struct User: Codable, Identifiable {
    let id: String
    let name: String
    let email: String
    let createdAt: Date
}

// Response wrapper for API
struct APIResponse<T: Codable>: Codable {
    let data: T
}

struct ErrorResponse: Codable {
    let error: ErrorDetail
}

struct ErrorDetail: Codable {
    let message: String
    let code: String?
}
```

### ViewModel (Business Logic)

```swift
// ViewModels/UsersViewModel.swift
import Foundation

@MainActor
class UsersViewModel: ObservableObject {
    @Published var users: [User] = []
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let apiService: APIService

    init(apiService: APIService = APIService.shared) {
        self.apiService = apiService
    }

    func fetchUsers() async {
        isLoading = true
        errorMessage = nil

        do {
            users = try await apiService.fetchUsers()
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    func deleteUser(_ user: User) async {
        do {
            try await apiService.deleteUser(id: user.id)
            users.removeAll { $0.id == user.id }
        } catch {
            errorMessage = "Failed to delete user: \(error.localizedDescription)"
        }
    }
}
```

### View (UI Layer)

```swift
// Views/UsersView.swift
import SwiftUI

struct UsersView: View {
    @StateObject private var viewModel = UsersViewModel()

    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading {
                    ProgressView("Loading users...")
                } else if let error = viewModel.errorMessage {
                    ErrorView(message: error) {
                        Task { await viewModel.fetchUsers() }
                    }
                } else {
                    usersList
                }
            }
            .navigationTitle("Users")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button("Add", systemImage: "plus") {
                        // Show add user sheet
                    }
                }
            }
            .task {
                await viewModel.fetchUsers()
            }
        }
    }

    private var usersList: some View {
        List {
            ForEach(viewModel.users) { user in
                NavigationLink(value: user) {
                    UserRow(user: user)
                }
            }
            .onDelete { indexSet in
                for index in indexSet {
                    Task {
                        await viewModel.deleteUser(viewModel.users[index])
                    }
                }
            }
        }
        .navigationDestination(for: User.self) { user in
            UserDetailView(user: user)
        }
    }
}

// Reusable error view
struct ErrorView: View {
    let message: String
    let retry: () -> Void

    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "exclamationmark.triangle")
                .font(.largeTitle)
                .foregroundStyle(.red)

            Text(message)
                .multilineTextAlignment(.center)
                .foregroundStyle(.secondary)

            Button("Retry", action: retry)
                .buttonStyle(.borderedProminent)
        }
        .padding()
    }
}
```

## Networking with APIService

### API Service Pattern

```swift
// Services/APIService.swift
import Foundation

enum APIError: LocalizedError {
    case invalidURL
    case invalidResponse
    case unauthorized
    case serverError(String)
    case decodingError

    var errorDescription: String? {
        switch self {
        case .invalidURL: return "Invalid URL"
        case .invalidResponse: return "Invalid response from server"
        case .unauthorized: return "Please log in again"
        case .serverError(let message): return message
        case .decodingError: return "Failed to process server response"
        }
    }
}

class APIService {
    static let shared = APIService()

    private let baseURL: String
    private let session: URLSession

    init(baseURL: String = "https://api.example.com",
         session: URLSession = .shared) {
        self.baseURL = baseURL
        self.session = session
    }

    // MARK: - Generic Request Method

    private func request<T: Decodable>(
        _ endpoint: String,
        method: HTTPMethod = .get,
        body: (any Encodable)? = nil,
        headers: [String: String] = [:]
    ) async throws -> T {
        guard let url = URL(string: baseURL + endpoint) else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = method.rawValue
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        // Add authentication token
        if let token = await AuthService.shared.getToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        // Add custom headers
        for (key, value) in headers {
            request.setValue(value, forHTTPHeaderField: key)
        }

        // Add body
        if let body = body {
            request.httpBody = try JSONEncoder().encode(body)
        }

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }

        switch httpResponse.statusCode {
        case 200...299:
            do {
                return try JSONDecoder().decode(T.self, from: data)
            } catch {
                print("Decoding error: \(error)")
                throw APIError.decodingError
            }

        case 401:
            throw APIError.unauthorized

        default:
            if let errorResponse = try? JSONDecoder().decode(ErrorResponse.self, from: data) {
                throw APIError.serverError(errorResponse.error.message)
            }
            throw APIError.serverError("Request failed with status \(httpResponse.statusCode)")
        }
    }

    // MARK: - API Methods

    func fetchUsers() async throws -> [User] {
        let response: APIResponse<[User]> = try await request("/api/users")
        return response.data
    }

    func createUser(_ user: CreateUserRequest) async throws -> User {
        let response: APIResponse<User> = try await request(
            "/api/users",
            method: .post,
            body: user
        )
        return response.data
    }

    func updateUser(id: String, _ user: UpdateUserRequest) async throws -> User {
        let response: APIResponse<User> = try await request(
            "/api/users/\(id)",
            method: .patch,
            body: user
        )
        return response.data
    }

    func deleteUser(id: String) async throws {
        let _: EmptyResponse = try await request(
            "/api/users/\(id)",
            method: .delete
        )
    }
}

// MARK: - Supporting Types

enum HTTPMethod: String {
    case get = "GET"
    case post = "POST"
    case put = "PUT"
    case patch = "PATCH"
    case delete = "DELETE"
}

struct EmptyResponse: Decodable {}

struct CreateUserRequest: Encodable {
    let name: String
    let email: String
}

struct UpdateUserRequest: Encodable {
    let name: String?
    let email: String?
}
```

## Configuration Management

```swift
// Config/APIConfig.swift
import Foundation

enum Environment {
    case development
    case staging
    case production

    var baseURL: String {
        switch self {
        case .development: return "http://localhost:3000"
        case .staging: return "https://staging-api.example.com"
        case .production: return "https://api.example.com"
        }
    }
}

struct APIConfig {
    static let environment: Environment = {
        #if DEBUG
        return .development
        #else
        return .production
        #endif
    }()

    static let baseURL = environment.baseURL
}
```

## SwiftUI Best Practices

### View Composition

```swift
// Break down large views into smaller components
struct ProductCard: View {
    let product: Product

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            ProductImage(url: product.imageURL)
            ProductInfo(product: product)
            ProductPrice(price: product.price)
        }
        .padding()
        .background(.background)
        .cornerRadius(12)
        .shadow(radius: 2)
    }
}

// Use ViewBuilders for complex logic
@ViewBuilder
func statusBadge(for status: Status) -> some View {
    switch status {
    case .active:
        Label("Active", systemImage: "checkmark.circle.fill")
            .foregroundStyle(.green)
    case .pending:
        Label("Pending", systemImage: "clock.fill")
            .foregroundStyle(.orange)
    case .inactive:
        Label("Inactive", systemImage: "xmark.circle.fill")
            .foregroundStyle(.gray)
    }
}
```

### State Management

```swift
// @State for local view state
@State private var isSheetPresented = false
@State private var searchText = ""

// @StateObject for view model ownership
@StateObject private var viewModel = MyViewModel()

// @ObservedObject for passed-in view models
@ObservedObject var viewModel: MyViewModel

// @EnvironmentObject for app-wide state
@EnvironmentObject var appState: AppState

// @AppStorage for UserDefaults
@AppStorage("hasSeenOnboarding") private var hasSeenOnboarding = false
```

### Performance Optimization

```swift
// Use Identifiable for list performance
struct Item: Identifiable {
    let id: UUID
    let name: String
}

// Lazy loading for large lists
LazyVStack {
    ForEach(items) { item in
        ItemRow(item: item)
    }
}

// Task lifecycle
.task {
    // Runs when view appears, cancels when disappears
    await viewModel.load()
}

// Prevent unnecessary redraws
.equatable() // Only redraw when properties change
```

## Error Handling Patterns

```swift
// Custom error types
enum ValidationError: LocalizedError {
    case emptyField(String)
    case invalidEmail
    case passwordTooShort

    var errorDescription: String? {
        switch self {
        case .emptyField(let field):
            return "\(field) cannot be empty"
        case .invalidEmail:
            return "Please enter a valid email address"
        case .passwordTooShort:
            return "Password must be at least 8 characters"
        }
    }
}

// Error display in UI
struct FormView: View {
    @State private var errorMessage: String?

    var body: some View {
        Form {
            // Form fields...

            if let error = errorMessage {
                Text(error)
                    .foregroundStyle(.red)
                    .font(.caption)
            }
        }
    }
}
```

## Testing Patterns

### Unit Testing ViewModels

```swift
import XCTest
@testable import YourApp

@MainActor
class UsersViewModelTests: XCTestCase {
    var viewModel: UsersViewModel!
    var mockAPIService: MockAPIService!

    override func setUp() {
        super.setUp()
        mockAPIService = MockAPIService()
        viewModel = UsersViewModel(apiService: mockAPIService)
    }

    func testFetchUsersSuccess() async {
        // Given
        let expectedUsers = [
            User(id: "1", name: "John", email: "john@example.com", createdAt: Date())
        ]
        mockAPIService.usersToReturn = expectedUsers

        // When
        await viewModel.fetchUsers()

        // Then
        XCTAssertEqual(viewModel.users, expectedUsers)
        XCTAssertNil(viewModel.errorMessage)
        XCTAssertFalse(viewModel.isLoading)
    }

    func testFetchUsersFailure() async {
        // Given
        mockAPIService.shouldThrowError = true

        // When
        await viewModel.fetchUsers()

        // Then
        XCTAssertTrue(viewModel.users.isEmpty)
        XCTAssertNotNil(viewModel.errorMessage)
        XCTAssertFalse(viewModel.isLoading)
    }
}

class MockAPIService: APIService {
    var usersToReturn: [User] = []
    var shouldThrowError = false

    override func fetchUsers() async throws -> [User] {
        if shouldThrowError {
            throw APIError.serverError("Mock error")
        }
        return usersToReturn
    }
}
```

## Code Organization Best Practices

- One model/view/viewmodel per file
- Group related files in folders
- Use extensions to organize code by functionality
- Keep files under 300 lines
- Use meaningful variable names
- Add comments only when logic isn't obvious

## Swift Naming Conventions

```swift
// Types: UpperCamelCase
class UserManager { }
struct Product { }
enum Status { }

// Variables, functions: lowerCamelCase
var userName: String
func fetchUserData() { }

// Constants: lowerCamelCase
let maxRetryCount = 3

// Private properties: prefix with underscore (optional)
private var _internalState: Int

// Boolean names: use is/has/should prefix
var isLoading: Bool
var hasSeenOnboarding: Bool
func shouldShowAlert() -> Bool
```

## Common SwiftUI Modifiers

```swift
// Layout
.padding()
.frame(width: 100, height: 50)
.background(.blue)
.cornerRadius(8)

// Navigation
.navigationTitle("Title")
.navigationBarTitleDisplayMode(.inline)
.toolbar { }

// Presentation
.sheet(isPresented: $showSheet) { }
.alert("Title", isPresented: $showAlert) { }

// Lists
.listStyle(.insetGrouped)
.swipeActions { }
.onDelete { }

// Performance
.task { }
.refreshable { }
```

## Security Best Practices

- Never hardcode API keys or secrets
- Use Keychain for sensitive data
- Validate all user input
- Use HTTPS for all network requests
- Implement certificate pinning for production
- Obfuscate sensitive data in logs
- Handle authentication token expiry

## Quick Reference

```bash
# Run iOS app
Cmd+R in Xcode

# Run tests
Cmd+U in Xcode

# Clean build
Cmd+Shift+K

# Format code
Ctrl+I
```

## Additional Resources

- [Swift Documentation](https://docs.swift.org)
- [SwiftUI Documentation](https://developer.apple.com/documentation/swiftui)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines)
