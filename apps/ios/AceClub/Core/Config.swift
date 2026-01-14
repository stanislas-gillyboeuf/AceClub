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
        // Try to get from environment variable first (for development)
        if let envURL = ProcessInfo.processInfo.environment["API_BASE_URL"], !envURL.isEmpty {
            return envURL
        }
        
        // Fallback to default localhost for development
#if DEBUG
        return "http://localhost:3000/api"
#else
        // Production URL - à remplacer par ton URL de production
        return "https://api.yourproductiondomain.com"
#endif
    }
}

