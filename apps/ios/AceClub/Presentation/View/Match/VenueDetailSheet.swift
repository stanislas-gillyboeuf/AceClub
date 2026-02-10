//
//  VenueDetailSheet.swift
//  AceClub
//

import SwiftUI
import MapKit
import UserNotifications

struct VenueDetailSheet: View {
    let match: MatchModel
    @Environment(\.dismiss) private var dismiss
    @StateObject private var locationManager = LocationManager()

    @State private var travelTime: String?
    @State private var travelTimeSeconds: TimeInterval?
    @State private var isCalculatingRoute = false
    @State private var routeError: String?
    @State private var selectedTransport: TransportMode = .car
    @State private var alarmEnabled = false
    @State private var alarmDate = Date()
    @State private var alarmScheduled = false
    @State private var notificationPermissionGranted = false
    @State private var hasAutoSetAlarm = false

    private var venueCoordinate: CLLocationCoordinate2D? {
        guard let lat = match.venueOrganizationLatitude,
              let lon = match.venueOrganizationLongitude else { return nil }
        return CLLocationCoordinate2D(latitude: lat, longitude: lon)
    }

    private var userCoordinate: CLLocationCoordinate2D? {
        guard let lat = locationManager.userLatitude,
              let lon = locationManager.userLongitude else { return nil }
        return CLLocationCoordinate2D(latitude: lat, longitude: lon)
    }

    enum TransportMode: String, CaseIterable, Identifiable {
        case car = "Voiture"
        case transit = "Transports"
        case bike = "Vélo"
        case walking = "À pied"

        var id: String { rawValue }

        var icon: String {
            switch self {
            case .car: return "car.fill"
            case .transit: return "tram.fill"
            case .bike: return "bicycle"
            case .walking: return "figure.walk"
            }
        }

        var mkTransportType: MKDirectionsTransportType {
            switch self {
            case .car: return .automobile
            case .transit: return .transit
            case .bike: return .walking
            case .walking: return .walking
            }
        }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    headerSection

                    if let coordinate = venueCoordinate {
                        mapSection(coordinate: coordinate)
                    }

                    transportPicker

                    travelTimeOrStatus

                    if venueCoordinate != nil {
                        openInMapsButton
                    }

                    alarmSection
                }
                .padding(Theme.paddingHorizontal)
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Lieu du match")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Fermer") { dismiss() }
                }
            }
            .task {
                await checkNotificationPermission()
                await checkExistingAlarm()
                if locationManager.isPermissionGranted {
                    locationManager.requestLocation()
                } else {
                    locationManager.requestPermission()
                }
            }
            .onChange(of: selectedTransport) { _, _ in
                Task { await calculateRoute() }
            }
            .onChange(of: locationManager.userLatitude) { _, newLat in
                if newLat != nil {
                    Task { await calculateRoute() }
                }
            }
            .onChange(of: locationManager.authorizationStatus) { _, newStatus in
                if newStatus == .authorizedWhenInUse || newStatus == .authorizedAlways {
                    locationManager.requestLocation()
                }
            }
        }
        .presentationDetents([.medium, .large])
    }

    // MARK: - Sections

    private var headerSection: some View {
        VStack(spacing: 6) {
            if let logo = match.venueOrganizationLogo, let url = URL(string: logo) {
                AsyncImage(url: url) { image in
                    image.resizable().scaledToFill()
                } placeholder: {
                    Image(systemName: "building.2.fill")
                        .font(.title)
                        .foregroundStyle(Theme.tintColor)
                }
                .frame(width: 56, height: 56)
                .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium))
            }

            Text(match.venueOrganizationName ?? "Lieu inconnu")
                .font(.title3.weight(.semibold))

            if let address = match.venueOrganizationAddress {
                Text(address)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(Theme.paddingCard)
        .glassEffect(.regular, in: .rect(cornerRadius: Theme.cornerRadiusMedium))
    }

    private func mapSection(coordinate: CLLocationCoordinate2D) -> some View {
        Map {
            Marker(match.venueOrganizationName ?? "Lieu", coordinate: coordinate)
        }
        .frame(height: 200)
        .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadiusMedium, style: .continuous))
        .allowsHitTesting(false)
    }

    private var transportPicker: some View {
        Picker("Transport", selection: $selectedTransport) {
            ForEach(TransportMode.allCases) { mode in
                Label(mode.rawValue, systemImage: mode.icon)
                    .tag(mode)
            }
        }
        .pickerStyle(.segmented)
    }

    @ViewBuilder
    private var travelTimeOrStatus: some View {
        if let travelTime {
            travelTimeSection(travelTime: travelTime)
        } else if isCalculatingRoute {
            statusRow {
                ProgressView().controlSize(.small)
                Text("Calcul de l'itinéraire...")
            }
        } else if let routeError {
            statusRow {
                Image(systemName: "exclamationmark.triangle")
                    .foregroundStyle(.orange)
                Text(routeError)
            }
        } else if !locationManager.isPermissionGranted {
            statusRow {
                Image(systemName: "location.slash")
                    .foregroundStyle(Theme.labelTertiary)
                Text("Activez la localisation pour voir le temps de trajet")
            }
        } else if !locationManager.hasLocation {
            statusRow {
                ProgressView().controlSize(.small)
                Text("En attente de votre position...")
            }
        }
    }

    private func statusRow<Content: View>(@ViewBuilder content: () -> Content) -> some View {
        HStack(spacing: 8) {
            content()
        }
        .font(.subheadline)
        .foregroundStyle(.secondary)
        .frame(maxWidth: .infinity)
        .padding(Theme.paddingCard)
        .glassEffect(.regular, in: .rect(cornerRadius: Theme.cornerRadiusMedium))
    }

    private func travelTimeSection(travelTime: String) -> some View {
        VStack(spacing: 8) {
            HStack {
                Image(systemName: selectedTransport.icon)
                    .font(.title3)
                    .foregroundStyle(Theme.tintColor)

                VStack(alignment: .leading, spacing: 2) {
                    Text("Temps de trajet")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    Text(travelTime)
                        .font(.headline)
                }

                Spacer()
            }

            if let departureTime = suggestedDepartureTime {
                Divider()
                HStack {
                    Image(systemName: "clock.arrow.trianglehead.counterclockwise.rotate.90")
                        .font(.title3)
                        .foregroundStyle(Theme.accentOrange)

                    VStack(alignment: .leading, spacing: 2) {
                        Text("Heure de départ suggérée")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                        Text(formattedDepartureTime(departureTime))
                            .font(.headline)
                            .foregroundStyle(departureTime < Date() ? .red : .primary)
                    }

                    Spacer()

                    if departureTime < Date() {
                        Text("Passée")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(.white)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(.red)
                            .clipShape(Capsule())
                    }
                }
            }
        }
        .padding(Theme.paddingCard)
        .glassEffect(.regular, in: .rect(cornerRadius: Theme.cornerRadiusMedium))
    }

    private var openInMapsButton: some View {
        Button {
            openInMaps()
        } label: {
            Label("Ouvrir dans Plans", systemImage: "map.fill")
                .frame(maxWidth: .infinity)
        }
        .buttonStyle(.appPrimary)
    }

    private var alarmSection: some View {
        VStack(spacing: 12) {
            Toggle(isOn: $alarmEnabled) {
                Label("Rappel de départ", systemImage: "alarm")
            }
            .onChange(of: alarmEnabled) { _, enabled in
                if !enabled && alarmScheduled {
                    cancelAlarm()
                }
            }

            if alarmEnabled {
                if let suggested = suggestedDepartureTime, suggested > Date() {
                    HStack(spacing: 8) {
                        Image(systemName: "sparkles")
                            .foregroundStyle(Theme.tintColor)
                        Text("Calculé automatiquement selon le temps de trajet")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                }

                DatePicker(
                    "Heure du rappel",
                    selection: $alarmDate,
                    in: Date()...,
                    displayedComponents: [.date, .hourAndMinute]
                )

                if alarmScheduled {
                    Button(role: .destructive) {
                        cancelAlarm()
                    } label: {
                        Label("Annuler le rappel", systemImage: "bell.slash")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.appDestructiveOutlined)
                } else {
                    Button {
                        Task { await scheduleAlarm() }
                    } label: {
                        Label("Programmer le rappel", systemImage: "bell.badge")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.appSecondary)
                }
            }
        }
        .padding(Theme.paddingCard)
        .glassEffect(.regular, in: .rect(cornerRadius: Theme.cornerRadiusMedium))
    }

    // MARK: - Methods

    private func calculateRoute() async {
        guard let venueCoord = venueCoordinate,
              let userCoord = userCoordinate else {
            travelTime = nil
            travelTimeSeconds = nil
            routeError = nil
            return
        }

        isCalculatingRoute = true
        travelTime = nil
        travelTimeSeconds = nil
        routeError = nil

        let source = MKMapItem(
            location: CLLocation(latitude: userCoord.latitude, longitude: userCoord.longitude),
            address: nil
        )
        let destination = MKMapItem(
            location: CLLocation(latitude: venueCoord.latitude, longitude: venueCoord.longitude),
            address: nil
        )

        let request = MKDirections.Request()
        request.source = source
        request.destination = destination
        request.transportType = selectedTransport.mkTransportType

        // Apple MapKit: .transit only supports ETA, not full route calculation.
        // Use calculateETA() for transit, calculate() for other modes.
        if selectedTransport == .transit {
            await calculateTransitETA(request: request)
        } else {
            await calculateDirections(request: request)
        }

        isCalculatingRoute = false
    }

    /// Transit mode: use calculateETA() (the only API Apple supports for transit)
    private func calculateTransitETA(request: MKDirections.Request) async {
        let directions = MKDirections(request: request)
        do {
            let eta = try await directions.calculateETA()
            applyTravelTime(eta.expectedTravelTime)
        } catch {
            routeError = "Temps de trajet en transports indisponible"
        }
    }

    /// Car/bike/walking: use calculate() for full route directions
    private func calculateDirections(request: MKDirections.Request) async {
        let directions = MKDirections(request: request)
        do {
            let response = try await directions.calculate()
            if let route = response.routes.first {
                applyTravelTime(route.expectedTravelTime)
            } else {
                routeError = "Aucun itinéraire trouvé"
            }
        } catch {
            routeError = "Itinéraire indisponible pour ce mode"
        }
    }

    private func applyTravelTime(_ seconds: TimeInterval) {
        travelTimeSeconds = seconds
        let minutes = Int(seconds / 60)
        if minutes >= 60 {
            let hours = minutes / 60
            let remainingMinutes = minutes % 60
            travelTime = "\(hours)h \(remainingMinutes)min"
        } else {
            travelTime = "\(minutes) min"
        }
        updateAutoDepartureAlarm()
    }

    private func openInMaps() {
        guard let coordinate = venueCoordinate else { return }

        let mapItem = MKMapItem(
            location: CLLocation(latitude: coordinate.latitude, longitude: coordinate.longitude),
            address: nil
        )
        mapItem.name = match.venueOrganizationName

        let launchOptions: [String: Any] = [
            MKLaunchOptionsDirectionsModeKey: directionsMode
        ]
        mapItem.openInMaps(launchOptions: launchOptions)
    }

    private var directionsMode: String {
        switch selectedTransport {
        case .car: return MKLaunchOptionsDirectionsModeDriving
        case .transit: return MKLaunchOptionsDirectionsModeTransit
        case .bike, .walking: return MKLaunchOptionsDirectionsModeWalking
        }
    }

    private func checkNotificationPermission() async {
        let center = UNUserNotificationCenter.current()
        let settings = await center.notificationSettings()
        notificationPermissionGranted = settings.authorizationStatus == .authorized
    }

    private func checkExistingAlarm() async {
        let center = UNUserNotificationCenter.current()
        let pending = await center.pendingNotificationRequests()
        let identifier = "match-departure-\(match.id)"
        if let existing = pending.first(where: { $0.identifier == identifier }),
           let trigger = existing.trigger as? UNCalendarNotificationTrigger,
           let nextDate = trigger.nextTriggerDate() {
            alarmEnabled = true
            alarmDate = nextDate
            alarmScheduled = true
        }
    }

    private func scheduleAlarm() async {
        let center = UNUserNotificationCenter.current()

        if !notificationPermissionGranted {
            do {
                let granted = try await center.requestAuthorization(options: [.alert, .sound])
                notificationPermissionGranted = granted
                guard granted else { return }
            } catch {
                return
            }
        }

        let content = UNMutableNotificationContent()
        content.title = "C'est l'heure de partir !"
        content.body = "Votre match à \(match.venueOrganizationName ?? "votre club") va bientôt commencer."
        content.sound = .default

        let components = Calendar.current.dateComponents(
            [.year, .month, .day, .hour, .minute],
            from: alarmDate
        )
        let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: false)

        let identifier = "match-departure-\(match.id)"
        let request = UNNotificationRequest(identifier: identifier, content: content, trigger: trigger)

        do {
            try await center.add(request)
            alarmScheduled = true
        } catch {
            // Notification scheduling failed
        }
    }

    private func cancelAlarm() {
        let center = UNUserNotificationCenter.current()
        let identifier = "match-departure-\(match.id)"
        center.removePendingNotificationRequests(withIdentifiers: [identifier])
        alarmScheduled = false
    }

    // MARK: - Auto Departure

    private func formattedDepartureTime(_ date: Date) -> String {
        if Calendar.current.isDateInToday(date) {
            return date.formatted(date: .omitted, time: .shortened)
        } else if Calendar.current.isDateInTomorrow(date) {
            return "Demain, \(date.formatted(date: .omitted, time: .shortened))"
        } else {
            return date.formatted(.dateTime.day().month(.wide).hour().minute())
        }
    }

    private var suggestedDepartureTime: Date? {
        guard let scheduledAt = match.scheduledAt,
              let seconds = travelTimeSeconds else { return nil }
        // Add 15 minutes buffer to travel time
        return scheduledAt.addingTimeInterval(-(seconds + 15 * 60))
    }

    private func updateAutoDepartureAlarm() {
        guard !hasAutoSetAlarm,
              !alarmScheduled,
              let departureTime = suggestedDepartureTime,
              departureTime > Date() else { return }

        hasAutoSetAlarm = true
        alarmDate = departureTime
        alarmEnabled = true
        Task { await scheduleAlarm() }
    }
}
