//
//  Config.swift
//  AceClub
//
//  Created by Nicolas Becharat on 12/01/2026.
//

import Foundation

enum Config {
    // MARK: - API Configuration
    static var apiBaseURL: String {
        // Read from Info.plist (populated from xcconfig files)
        if let infoDictionary = Bundle.main.infoDictionary,
           let apiURL = infoDictionary["API_BASE_URL"] as? String,
           !apiURL.isEmpty {
            return apiURL
        }

        // Fallback to default localhost for development
#if DEBUG
        return "http://localhost:3000/api"
#else
        // Production URL fallback (should not be reached if xcconfig is properly configured)
        return "https://aceclub-production.up.railway.app/api"
#endif
    }

    // MARK: - Environment
    static var environment: String {
        if let infoDictionary = Bundle.main.infoDictionary,
           let env = infoDictionary["APP_ENV"] as? String {
            return env
        }

#if DEBUG
        return "development"
#else
        return "production"
#endif
    }

    // MARK: - WebSocket Configuration
    static var wsBaseURL: String {
        // Derive WebSocket URL from API URL
        let apiURL = apiBaseURL

        // Replace /api suffix and change protocol
        var wsURL = apiURL
            .replacingOccurrences(of: "/api", with: "")
            .replacingOccurrences(of: "https://", with: "wss://")
            .replacingOccurrences(of: "http://", with: "ws://")

        return wsURL
    }
}

