import Foundation
import Intents
import React
import UIKit
import UserNotifications

/// React Native module exposing `AutomotiveNotifications.send(config)` to JS.
///
/// Bridged to JS as `NativeModules.AutomotiveNotifications` via the
/// companion Obj-C file `RNAutomotiveNotificationsModule.m` which uses
/// `RCT_EXTERN_MODULE` to register the class (Swift can't call the
/// RCT macros directly).
///
/// What `send()` does:
/// 1. Parses title / body / sender / actions from the JS config.
/// 2. Registers a one-shot `UNNotificationCategory` carrying the
///    action buttons (voice → UNTextInputNotificationAction,
///    quick_reply → UNNotificationAction).
/// 3. Builds an `INSendMessageIntent` with the sender as `INPerson`.
///    Required by Apple for the notification to surface on CarPlay.
/// 4. Donates the intent via `INInteraction` (informs the system that
///    this conversation happened — boosts CarPlay relevance).
/// 5. Wraps the intent in `UNMutableNotificationContent.updating(from:)`
///    (iOS 15+) or falls back to plain content (iOS 14).
/// 6. Adds the request to `UNUserNotificationCenter`.
///
/// Action button taps reach JS only if the app has installed
/// `NotificationsDelegate.shared` as the `UNUserNotificationCenter`
/// delegate — see `+setAsUserNotificationDelegate` (Step 9 Expo plugin
/// will install it automatically).
@objc(AutomotiveNotifications)
@objcMembers
public final class NotificationsModule: RCTEventEmitter {

  // MARK: - RCTEventEmitter overrides

  public override func supportedEvents() -> [String]! {
    return [Self.actionPressedEvent]
  }

  public override class func requiresMainQueueSetup() -> Bool {
    return true
  }

  // MARK: - Singleton bookkeeping

  /// Latest active instance — held weakly by `NotificationsDelegate` so
  /// it can forward `userNotificationCenter:didReceive:` callbacks.
  internal static weak var current: NotificationsModule?

  public override init() {
    super.init()
    NotificationsModule.current = self
  }

  // MARK: - Public API

  /// Posts the notification described by `config`. Returns the assigned
  /// notification id via the resolver.
  @objc public func send(
    _ config: NSDictionary,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) {
    let notificationId = UUID().uuidString
    let title = (config["title"] as? String) ?? ""
    let body = (config["body"] as? String) ?? ""
    let conversationId = (config["conversationId"] as? String) ?? notificationId
    let senderConfig = config["sender"] as? NSDictionary
    let actionsConfig = (config["actions"] as? [NSDictionary]) ?? []

    let senderName = senderConfig?["name"] as? String ?? ""
    let senderAvatar = RCTConvert.uiImage(senderConfig?["avatar"])

    // 1. Register category with actions (must be done BEFORE adding the
    //    request, otherwise the buttons don't appear).
    let categoryId = "RNAutomotive.Notification.\(notificationId)"
    registerCategory(id: categoryId, actionsConfig: actionsConfig)

    // 2. Build the INSendMessageIntent.
    let intent = makeIntent(
      senderName: senderName,
      senderAvatar: senderAvatar,
      body: body,
      conversationId: conversationId,
      notificationId: notificationId
    )

    // 3. Donate the intent to inform the system / boost CarPlay routing.
    let interaction = INInteraction(intent: intent, response: nil)
    interaction.direction = .incoming
    interaction.donate(completion: nil)

    // 4. Build the notification content, wrapping the intent when possible.
    let content = UNMutableNotificationContent()
    content.title = title
    content.body = body
    content.sound = .default
    content.threadIdentifier = conversationId
    content.categoryIdentifier = categoryId
    content.userInfo = ["notificationId": notificationId]

    let finalContent: UNNotificationContent = {
      if #available(iOS 15.0, *) {
        if let updated = try? content.updating(from: intent) {
          return updated
        }
      }
      return content
    }()

    // 5. Post.
    let request = UNNotificationRequest(
      identifier: notificationId,
      content: finalContent,
      trigger: nil
    )
    UNUserNotificationCenter.current().add(request) { error in
      if let error = error {
        rejecter(
          "E_NOTIFICATION_POST_FAILED",
          error.localizedDescription,
          error
        )
      } else {
        resolver(notificationId)
      }
    }
  }

  // MARK: - Internals

  internal static let actionPressedEvent = "actionPressed"

  private func registerCategory(id: String, actionsConfig: [NSDictionary]) {
    let unActions: [UNNotificationAction] = actionsConfig.compactMap { actionConfig in
      let actionId = actionConfig["id"] as? String ?? ""
      let label = actionConfig["label"] as? String ?? ""
      let type = actionConfig["type"] as? String

      switch type {
      case "voice":
        let placeholder = actionConfig["placeholder"] as? String ?? ""
        return UNTextInputNotificationAction(
          identifier: actionId,
          title: label,
          options: [],
          textInputButtonTitle: "Invia",
          textInputPlaceholder: placeholder
        )
      case "quick_reply":
        return UNNotificationAction(
          identifier: actionId,
          title: label,
          options: []
        )
      default:
        return nil
      }
    }

    let category = UNNotificationCategory(
      identifier: id,
      actions: unActions,
      intentIdentifiers: [],
      options: []
    )
    UNUserNotificationCenter.current().setNotificationCategories([category])
  }

  private func makeIntent(
    senderName: String,
    senderAvatar: UIImage?,
    body: String,
    conversationId: String,
    notificationId: String
  ) -> INSendMessageIntent {
    let handle = INPersonHandle(value: notificationId, type: .unknown)
    let sender = INPerson(
      personHandle: handle,
      nameComponents: nil,
      displayName: senderName,
      image: senderAvatar.map { INImage(uiImage: $0) },
      contactIdentifier: nil,
      customIdentifier: nil
    )

    let intent = INSendMessageIntent(
      recipients: nil,
      outgoingMessageType: .outgoingMessageText,
      content: body,
      speakableGroupName: INSpeakableString(spokenPhrase: senderName),
      conversationIdentifier: conversationId,
      serviceName: nil,
      sender: sender,
      attachments: nil
    )
    if let avatar = senderAvatar {
      intent.setImage(INImage(uiImage: avatar), forParameterNamed: \INSendMessageIntent.sender)
    }
    return intent
  }
}

/// Singleton `UNUserNotificationCenterDelegate` that forwards action
/// taps to the active `NotificationsModule` instance, which then emits
/// the `actionPressed` event to JS.
///
/// Install via `RNAutomotiveNotificationsDelegate.install()` from the
/// host app's `AppDelegate.application(_:didFinishLaunchingWithOptions:)`.
/// Step 9 Expo Config Plugin generates that call automatically.
@objc(RNAutomotiveNotificationsDelegate)
@objcMembers
public final class NotificationsDelegate: NSObject, UNUserNotificationCenterDelegate {

  @objc public static let shared = NotificationsDelegate()

  /// Registers this object as `UNUserNotificationCenter.current().delegate`.
  /// Idempotent — safe to call multiple times.
  @objc public static func install() {
    UNUserNotificationCenter.current().delegate = shared
  }

  // MARK: - UNUserNotificationCenterDelegate

  public func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    didReceive response: UNNotificationResponse,
    withCompletionHandler completionHandler: @escaping () -> Void
  ) {
    let notificationId =
      response.notification.request.content.userInfo["notificationId"] as? String
      ?? response.notification.request.identifier

    let actionId = response.actionIdentifier

    var body: [String: Any] = [
      "notificationId": notificationId,
      "actionId": actionId,
    ]
    if let textResponse = response as? UNTextInputNotificationResponse {
      body["response"] = textResponse.userText
    }

    NotificationsModule.current?.sendEvent(
      withName: NotificationsModule.actionPressedEvent,
      body: body
    )
    completionHandler()
  }

  /// Show the notification banner even when the app is foreground —
  /// otherwise iOS hides foreground notifications by default.
  public func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    willPresent notification: UNNotification,
    withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
  ) {
    if #available(iOS 14.0, *) {
      completionHandler([.banner, .sound, .badge])
    } else {
      completionHandler([.alert, .sound, .badge])
    }
  }
}
