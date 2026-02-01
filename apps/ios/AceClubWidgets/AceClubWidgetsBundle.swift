//
//  AceClubWidgetsBundle.swift
//  AceClubWidgets
//
//  Created by Nicolas Becharat on 01/02/2026.
//

import WidgetKit
import SwiftUI

@main
struct AceClubWidgetsBundle: WidgetBundle {
    var body: some Widget {
        AceClubWidgets()
        AceClubWidgetsControl()
        AceClubWidgetsLiveActivity()
    }
}
