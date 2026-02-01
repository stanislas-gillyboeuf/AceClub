//
//  APIClient.swift
//  AceClub
//
//  Created by Nicolas Becharat on 13/01/2026.
//

import Foundation

class APIClient {
    static let shared = APIClient()

    private init() {}

    // MARK: - Authenticated Request
    func authenticatedRequest(url: URL, method: String = "GET", body: Data? = nil) async throws -> (Data, HTTPURLResponse) {
        let token = try KeychainManager.shared.getAuthToken()

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        if let body = body {
            request.httpBody = body
        }

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIClientError.invalidResponse
        }

        return (data, httpResponse)
    }

    // MARK: - Authenticated Multipart Request
    func authenticatedMultipartRequest(
        url: URL,
        formFields: [String: String] = [:],
        fileField: String,
        fileData: Data,
        fileName: String,
        mimeType: String
    ) async throws -> (Data, HTTPURLResponse) {
        let token = try KeychainManager.shared.getAuthToken()
        let boundary = UUID().uuidString

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")

        var body = Data()

        // Add form fields
        for (key, value) in formFields {
            body.append("--\(boundary)\r\n".data(using: .utf8)!)
            body.append("Content-Disposition: form-data; name=\"\(key)\"\r\n\r\n".data(using: .utf8)!)
            body.append("\(value)\r\n".data(using: .utf8)!)
        }

        // Add file
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"\(fileField)\"; filename=\"\(fileName)\"\r\n".data(using: .utf8)!)
        body.append("Content-Type: \(mimeType)\r\n\r\n".data(using: .utf8)!)
        body.append(fileData)
        body.append("\r\n".data(using: .utf8)!)

        // Close boundary
        body.append("--\(boundary)--\r\n".data(using: .utf8)!)

        request.httpBody = body

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIClientError.invalidResponse
        }

        return (data, httpResponse)
    }
}

enum APIClientError: Error {
    case invalidResponse
    case unauthorized
}
