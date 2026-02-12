//
//  WebSocketManager.swift
//  AceClub
//
//  Created by Nicolas Becharat on 01/02/2026.
//

import Foundation
import Combine
import Network
import UIKit

// MARK: - Connection State

enum ConnectionState: Equatable {
    case disconnected
    case connecting
    case connected
    case reconnecting
}

// MARK: - WebSocket Events

enum WebSocketEvent {
    case connected
    case reconnected
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

    @Published var connectionState: ConnectionState = .disconnected

    var isConnected: Bool { connectionState == .connected }

    // MARK: - Private Properties

    private var webSocketTask: URLSessionWebSocketTask?
    private var urlSession: URLSession?
    private var receiveTask: Task<Void, Never>?
    private var reconnectTask: Task<Void, Never>?
    private var pingTimer: Timer?
    private var awaitingPong = false
    private var reconnectAttempts = 0
    private let maxReconnectDelay: TimeInterval = 30
    private var shouldBeConnected = false
    private var hasConnectedBefore = false

    // Network
    private var networkMonitor: NWPathMonitor?
    private var isNetworkAvailable = true
    private var cancellables = Set<AnyCancellable>()

    private let eventSubject = PassthroughSubject<WebSocketEvent, Never>()

    // MARK: - Public Properties

    var events: AnyPublisher<WebSocketEvent, Never> {
        eventSubject.eraseToAnyPublisher()
    }

    // MARK: - Init

    private init() {
        setupNetworkMonitor()
        setupLifecycleObservers()
    }

    // MARK: - Public Methods

    func connect() async {
        shouldBeConnected = true

        // Already connected and healthy
        if connectionState == .connected, webSocketTask?.state == .running {
            return
        }

        // Cancel any scheduled reconnect — we connect right now
        reconnectTask?.cancel()
        reconnectTask = nil

        // Clean up stale connection
        cleanupConnection()

        guard isNetworkAvailable else {
            connectionState = .disconnected
            return
        }

        let isReconnect = hasConnectedBefore
        connectionState = isReconnect ? .reconnecting : .connecting

        do {
            let token = try KeychainManager.shared.getAuthToken()
            let wsURL = "\(Config.wsBaseURL)/ws/chat?token=\(token)"

            guard let url = URL(string: wsURL) else {
                connectionState = .disconnected
                eventSubject.send(.error(WebSocketError.invalidURL))
                return
            }

            let configuration = URLSessionConfiguration.default
            configuration.timeoutIntervalForRequest = 30
            configuration.timeoutIntervalForResource = 300

            let session = URLSession(configuration: configuration)
            self.urlSession = session

            webSocketTask = session.webSocketTask(with: url)
            webSocketTask?.resume()

            connectionState = .connected
            awaitingPong = false
            reconnectAttempts = 0
            hasConnectedBefore = true

            eventSubject.send(isReconnect ? .reconnected : .connected)

            startPingTimer()
            startReceiving()

        } catch {
            connectionState = .disconnected
            eventSubject.send(.error(error))
            scheduleReconnect()
        }
    }

    func disconnect() {
        shouldBeConnected = false
        reconnectTask?.cancel()
        reconnectTask = nil
        cleanupConnection()
        connectionState = .disconnected
        eventSubject.send(.disconnected)
    }

    func sendTypingIndicator(conversationId: String) {
        send(["type": "typing", "conversationId": conversationId])
    }

    // MARK: - Network Monitor

    private func setupNetworkMonitor() {
        networkMonitor = NWPathMonitor()
        networkMonitor?.pathUpdateHandler = { [weak self] path in
            Task { @MainActor [weak self] in
                guard let self else { return }
                let wasAvailable = self.isNetworkAvailable
                self.isNetworkAvailable = path.status == .satisfied

                // Network restored — reconnect immediately
                if !wasAvailable && self.isNetworkAvailable && self.shouldBeConnected {
                    self.reconnectAttempts = 0
                    await self.connect()
                }

                // Network lost — clean up but keep shouldBeConnected
                if wasAvailable && !self.isNetworkAvailable {
                    self.reconnectTask?.cancel()
                    self.reconnectTask = nil
                    self.cleanupConnection()
                    self.connectionState = .disconnected
                }
            }
        }
        networkMonitor?.start(queue: .global(qos: .utility))
    }

    // MARK: - App Lifecycle

    private func setupLifecycleObservers() {
        NotificationCenter.default.publisher(for: UIApplication.willEnterForegroundNotification)
            .receive(on: DispatchQueue.main)
            .sink { [weak self] _ in
                Task { @MainActor [weak self] in
                    guard let self, self.shouldBeConnected else { return }
                    self.reconnectAttempts = 0
                    await self.connect()
                }
            }
            .store(in: &cancellables)

        NotificationCenter.default.publisher(for: UIApplication.didEnterBackgroundNotification)
            .receive(on: DispatchQueue.main)
            .sink { [weak self] _ in
                Task { @MainActor [weak self] in
                    guard let self else { return }
                    // Keep shouldBeConnected = true so we reconnect on foreground
                    self.reconnectTask?.cancel()
                    self.reconnectTask = nil
                    self.cleanupConnection()
                    self.connectionState = .disconnected
                }
            }
            .store(in: &cancellables)
    }

    // MARK: - Private Methods

    private func cleanupConnection() {
        pingTimer?.invalidate()
        pingTimer = nil
        awaitingPong = false
        receiveTask?.cancel()
        receiveTask = nil
        webSocketTask?.cancel(with: .normalClosure, reason: nil)
        webSocketTask = nil
        urlSession?.invalidateAndCancel()
        urlSession = nil
    }

    private func send(_ message: [String: String]) {
        guard connectionState == .connected,
              let data = try? JSONEncoder().encode(message),
              let string = String(data: data, encoding: .utf8) else { return }

        webSocketTask?.send(.string(string)) { error in
            if let error {
                print("[WS] Send error: \(error)")
            }
        }
    }

    private func startReceiving() {
        guard let webSocketTask else { return }

        receiveTask?.cancel()
        receiveTask = Task {
            while !Task.isCancelled {
                do {
                    let message = try await webSocketTask.receive()
                    guard !Task.isCancelled else { return }

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
                    guard !Task.isCancelled else { return }
                    cleanupConnection()
                    connectionState = .disconnected
                    eventSubject.send(.error(error))
                    scheduleReconnect()
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
            print("[WS] Server confirmed connection")

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
            awaitingPong = false

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
        pingTimer = Timer.scheduledTimer(withTimeInterval: 15, repeats: true) { [weak self] _ in
            guard let self else { return }

            if self.awaitingPong {
                print("[WS] Pong timeout — forcing reconnect")
                self.cleanupConnection()
                self.connectionState = .disconnected
                self.scheduleReconnect()
                return
            }

            self.awaitingPong = true
            self.send(["type": "ping"])
        }
    }

    private func scheduleReconnect() {
        guard shouldBeConnected, isNetworkAvailable else { return }

        reconnectTask?.cancel()

        reconnectAttempts += 1
        let delay = min(pow(2.0, Double(reconnectAttempts - 1)), maxReconnectDelay)

        print("[WS] Reconnecting in \(delay)s (attempt \(reconnectAttempts))")

        connectionState = .reconnecting

        reconnectTask = Task {
            try? await Task.sleep(nanoseconds: UInt64(delay * 1_000_000_000))
            guard !Task.isCancelled, shouldBeConnected else { return }
            await connect()
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
            return "Échec de la connexion WebSocket"
        case .notConnected:
            return "WebSocket non connecté"
        }
    }
}
