import CarPlay
import Foundation

/// Process-wide singleton holding CarPlay connection state and per-id
/// stores for templates, trips, and navigation sessions.
///
/// Bridged to Objective-C as `RNAutomotiveStore` so the legacy
/// `RNCarPlay.m` module can keep using it during the Obj-C → Swift
/// migration. All public API mirrors the call sites in `RNCarPlay.m`
/// (formerly `RNCPStore`).
@objc(RNAutomotiveStore)
@objcMembers
public final class RNAutomotiveStore: NSObject {

  // MARK: - Singleton

  /// Shared instance. Exposed to Obj-C as `+sharedManager` for
  /// compatibility with existing RNCarPlay.m call sites.
  @objc(sharedManager)
  public static let shared = RNAutomotiveStore()

  private override init() {
    super.init()
  }

  // MARK: - Connection state

  /// Active CarPlay interface controller. `nil` when CarPlay is not connected.
  public var interfaceController: CPInterfaceController?

  /// Active CarPlay window. `nil` when CarPlay is not connected.
  public var window: CPWindow?

  /// Connection flag. Mutate via `setConnected(_:)`.
  public private(set) var isConnected: Bool = false

  /// Updates the connection flag. Exposed to Obj-C as `-setConnected:`.
  public func setConnected(_ connected: Bool) {
    isConnected = connected
  }

  // MARK: - Templates

  private var templates: [String: CPTemplate] = [:]

  public func findTemplateById(_ id: String) -> CPTemplate? {
    return templates[id]
  }

  @discardableResult
  public func setTemplate(_ id: String, template: CPTemplate) -> String {
    templates[id] = template
    return id
  }

  // MARK: - Trips

  private var trips: [String: CPTrip] = [:]

  public func findTripById(_ id: String) -> CPTrip? {
    return trips[id]
  }

  @discardableResult
  public func setTrip(_ id: String, trip: CPTrip) -> String {
    trips[id] = trip
    return id
  }

  // MARK: - Navigation sessions

  private var navigationSessions: [String: CPNavigationSession] = [:]

  public func findNavigationSessionById(_ id: String) -> CPNavigationSession? {
    return navigationSessions[id]
  }

  @discardableResult
  public func setNavigationSession(_ id: String, navigationSession: CPNavigationSession) -> String {
    navigationSessions[id] = navigationSession
    return id
  }
}
