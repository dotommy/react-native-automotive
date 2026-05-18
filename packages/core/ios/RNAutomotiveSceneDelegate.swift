import CarPlay
import UIKit

/// CarPlay scene delegate provided by react-native-automotive.
///
/// Two integration modes:
///
/// 1. **Drop-in scene delegate.** Reference this class as the scene
///    delegate in your app's `Info.plist` under the CarPlay scene's
///    `UISceneConfiguration` (the Expo config plugin will set this
///    up automatically in Step 9):
///
///    ```xml
///    <key>UIApplicationSceneManifest</key>
///    <dict>
///      <key>UISceneConfigurations</key>
///      <dict>
///        <key>CPTemplateApplicationSceneSessionRoleApplication</key>
///        <array>
///          <dict>
///            <key>UISceneConfigurationName</key>
///            <string>RNAutomotive</string>
///            <key>UISceneDelegateClassName</key>
///            <string>react_native_automotive.RNAutomotiveSceneDelegate</string>
///          </dict>
///        </array>
///      </dict>
///    </dict>
///    ```
///
/// 2. **Custom scene delegate.** Implement your own
///    `CPTemplateApplicationSceneDelegate` and forward the connect /
///    disconnect callbacks to the static helpers below:
///
///    ```swift
///    class MySceneDelegate: UIResponder, CPTemplateApplicationSceneDelegate {
///      func templateApplicationScene(_ scene: CPTemplateApplicationScene,
///                                    didConnect controller: CPInterfaceController,
///                                    to window: CPWindow) {
///        RNAutomotiveSceneDelegate.handleConnect(controller: controller, window: window)
///      }
///
///      func templateApplicationScene(_ scene: CPTemplateApplicationScene,
///                                    didDisconnectInterfaceController controller: CPInterfaceController) {
///        RNAutomotiveSceneDelegate.handleDisconnect()
///      }
///    }
///    ```
@objc(RNAutomotiveSceneDelegate)
@objcMembers
public final class RNAutomotiveSceneDelegate: UIResponder, CPTemplateApplicationSceneDelegate {

  // MARK: - CPTemplateApplicationSceneDelegate (iOS 13+)

  public func templateApplicationScene(
    _ templateApplicationScene: CPTemplateApplicationScene,
    didConnect interfaceController: CPInterfaceController,
    to window: CPWindow
  ) {
    RNAutomotiveSceneDelegate.handleConnect(controller: interfaceController, window: window)
  }

  public func templateApplicationScene(
    _ templateApplicationScene: CPTemplateApplicationScene,
    didDisconnectInterfaceController interfaceController: CPInterfaceController,
    from window: CPWindow
  ) {
    RNAutomotiveSceneDelegate.handleDisconnect()
  }

  /// Legacy disconnect signature kept for older CarPlay frameworks that
  /// don't pass the `from window:` parameter. Forwarded to the same handler.
  public func templateApplicationScene(
    _ templateApplicationScene: CPTemplateApplicationScene,
    didDisconnectInterfaceController interfaceController: CPInterfaceController
  ) {
    RNAutomotiveSceneDelegate.handleDisconnect()
  }

  // MARK: - Static helpers (for custom scene delegates)

  /// Forwarded by your scene delegate when CarPlay connects.
  /// Stores the interface controller and window in
  /// ``RNAutomotiveStore`` and emits the `didConnect` event to JS.
  public static func handleConnect(controller: CPInterfaceController, window: CPWindow) {
    RNCarPlay.connect(with: controller, window: window)
  }

  /// Forwarded by your scene delegate when CarPlay disconnects.
  /// Clears the connection state in ``RNAutomotiveStore`` and emits
  /// the `didDisconnect` event to JS.
  public static func handleDisconnect() {
    RNCarPlay.disconnect()
  }
}
