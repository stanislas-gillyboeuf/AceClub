import Foundation
import CoreLocation

@MainActor
class LocationManager: NSObject, ObservableObject {

    // MARK: - Published Properties

    @Published var userLatitude: Double?
    @Published var userLongitude: Double?
    @Published var authorizationStatus: CLAuthorizationStatus = .notDetermined

    // MARK: - Private

    private let manager = CLLocationManager()

    // MARK: - Init

    override init() {
        super.init()
        manager.delegate = self
        manager.desiredAccuracy = kCLLocationAccuracyKilometer
        authorizationStatus = manager.authorizationStatus
    }

    // MARK: - Public Methods

    func requestPermission() {
        manager.requestWhenInUseAuthorization()
    }

    func requestLocation() {
        guard authorizationStatus == .authorizedWhenInUse || authorizationStatus == .authorizedAlways else {
            return
        }
        manager.requestLocation()
    }

    /// Uses the active organization's coordinates as fallback when GPS is unavailable
    func applyFallback(latitude: Double?, longitude: Double?) {
        guard userLatitude == nil, userLongitude == nil else { return }
        userLatitude = latitude
        userLongitude = longitude
    }

    var hasLocation: Bool {
        userLatitude != nil && userLongitude != nil
    }
}

// MARK: - CLLocationManagerDelegate

extension LocationManager: CLLocationManagerDelegate {

    nonisolated func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        let status = manager.authorizationStatus
        Task { @MainActor in
            self.authorizationStatus = status
            if status == .authorizedWhenInUse || status == .authorizedAlways {
                manager.requestLocation()
            }
        }
    }

    nonisolated func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else { return }
        Task { @MainActor in
            self.userLatitude = location.coordinate.latitude
            self.userLongitude = location.coordinate.longitude
        }
    }

    nonisolated func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        // Location failed - fallback will be used if set
    }
}
