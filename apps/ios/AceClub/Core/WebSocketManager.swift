//
//  WebSocketManager.swift
//  AceClub
//
//  Created by Nicolas Becharat on 01/02/2026.
//

import Foundation
import Combine

// MARK: - WebSocket Events

enum WebSocketEvent {
    case connected
    case disconnected
    case newMessage(MessageDTO)
    case typing(conversationId: String, userId: String)
    case messageRead(conversationId: String, userId: String)
    case error(Error)
}

// MARK: - WebSocket Manager

@MainActor
class WebSocketManager: ObservableObject {

    // MARK: - Singleton

    static let shared = WebSocketManager()

    // MARK: - Published Properties

    @Published var isConnected = false

    // MARK: - Private Properties

    private var webSocketTask: URLSessionWebSocketTask?
    private var urlSession: URLSession?
    private var pingTimer: Timer?
    private var reconnectAttempts = 0
    private let maxReconnectAttempts = 5
    private var reconnectDelay: TimeInterval = 1.0

    private let eventSubject = PassthroughSubject<WebSocketEvent, Never>()

    // MARK: - Public Properties

    var events: AnyPublisher<WebSocketEvent, Never> {
        eventSubject.eraseToAnyPublisher()
    }

    // MARK: - Init

    private init() {}

    // MARK: - Public Methods

    func connect() async {
        guard !isConnected else { return }

        do {
            let token = try KeychainManager.shared.getAuthToken()
            let wsURL = "\(Config.wsBaseURL)/ws/chat?token=\(token)"

            guard let url = URL(string: wsURL) else {
                eventSubject.send(.error(WebSocketError.invalidURL))
                return
            }

            let configuration = URLSessionConfiguration.default
            configuration.timeoutIntervalForRequest = 30
            configuration.timeoutIntervalForResource = 60
            
            let session = URLSession(configuration: configuration)
            self.urlSession = session
            
            webSocketTask = session.webSocketTask(with: url)
            webSocketTask?.resume()

            isConnected = true
            reconnectAttempts = 0
            reconnectDelay = 1.0

            eventSubject.send(.connected)

            startPingTimer()
            receiveMessages()

        } catch {
            eventSubject.send(.error(error))
        }
    }

    func disconnect() {
        webSocketTask?.cancel(with: .normalClosure, reason: nil)
        webSocketTask = nil
        urlSession?.invalidateAndCancel()
        urlSession = nil
        isConnected = false
        pingTimer?.invalidate()
        pingTimer = nil
        eventSubject.send(.disconnected)
    }

    func sendTypingIndicator(conversationId: String) {
        let message: [String: String] = [
            "type": "typing",
            "conversationId": conversationId
        ]
        send(message)
    }

    // MARK: - Private Methods

    private func send(_ message: [String: String]) {
        guard let data = try? JSONEncoder().encode(message),
              let string = String(data: data, encoding: .utf8) else { return }

        webSocketTask?.send(.string(string)) { error in
            if let error = error {
                print("[WS] Send error: \(error)")
            }
        }
    }

    private func receiveMessages() {
        guard let webSocketTask else { return }

        Task {
            while isConnected {
                do {
                    let message = try await webSocketTask.receive()
                    switch message {
                    case .string(let text):
                        handleMessage(text)
                    case .data(let data):
                        if let text = String(data: data, encoding: .utf8) {
                            handleMessage(text)
                        }
                    @unknown default:
                        break
                    }
                } catch {
                    isConnected = false
                    eventSubject.send(.error(error))
                    attemptReconnect()
                    return
                }
            }
        }
    }

    private func handleMessage(_ text: String) {
        guard let data = text.data(using: .utf8),
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let type = json["type"] as? String else { return }

        switch type {
        case "connected":
            print("[WS] Connected confirmation received")

        case "new_message":
            if let messageData = json["message"] as? [String: Any] {
                do {
                    let jsonData = try JSONSerialization.data(withJSONObject: messageData)
                    let messageDTO = try JSONDecoder().decode(MessageDTO.self, from: jsonData)
                    eventSubject.send(.newMessage(messageDTO))
                } catch {
                    print("[WS] Failed to decode message: \(error)")
                }
            }

        case "typing":
            if let conversationId = json["conversationId"] as? String,
               let userId = json["userId"] as? String {
                eventSubject.send(.typing(conversationId: conversationId, userId: userId))
            }

        case "read":
            if let conversationId = json["conversationId"] as? String,
               let userId = json["userId"] as? String {
                eventSubject.send(.messageRead(conversationId: conversationId, userId: userId))
            }

        case "pong":
            // Heartbeat response - do nothing
            break

        case "error":
            if let errorMessage = json["message"] as? String {
                print("[WS] Server error: \(errorMessage)")
            }

        default:
            print("[WS] Unknown message type: \(type)")
        }
    }

    private func startPingTimer() {
        pingTimer?.invalidate()
        pingTimer = Timer.scheduledTimer(withTimeInterval: 30, repeats: true) { [weak self] _ in
            self?.send(["type": "ping"])
        }
    }

    private func attemptReconnect() {
        guard reconnectAttempts < maxReconnectAttempts else {
            print("[WS] Max reconnect attempts reached")
            return
        }

        reconnectAttempts += 1
        let delay = reconnectDelay * pow(2.0, Double(reconnectAttempts - 1))

        print("[WS] Attempting reconnect in \(delay) seconds (attempt \(reconnectAttempts)/\(maxReconnectAttempts))")

        Task {
            try? await Task.sleep(nanoseconds: UInt64(delay * 1_000_000_000))
            await self.connect()
        }
    }
}

// MARK: - WebSocket Error

enum WebSocketError: Error, LocalizedError {
    case invalidURL
    case connectionFailed
    case notConnected

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "URL WebSocket invalide"
        case .connectionFailed:
            return "Echec de la connexion WebSocket"
        case .notConnected:
            return "WebSocket non connecte"
        }
    }
}
