//
//  ValidationError.swift
//  AceClub
//
//  Created by Nicolas Becharat on 12/01/2026.
//

import Foundation

enum ValidationError: Error, LocalizedError {
    case invalidEmail
    case invalidSwipeAction

    var errorDescription: String? {
        switch self {
        case .invalidEmail:
            return "Please enter a valid email address"
        case .invalidSwipeAction:
            return "Action must be \"like\" or \"pass\""
        }
    }
}
