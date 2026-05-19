import CarPlay
import Foundation
import React

/// Emits an RN event scoped to a CarPlay template.
///
/// The convention used across the codebase: every template stores its
/// `templateId` in `CPTemplate.userInfo`. Template-scoped events
/// (e.g. row selection, map gestures, navigation alerts) include that
/// `templateId` in the event body so JS handlers can route correctly.
///
/// Swift port of the Obj-C `sendTemplateEventWithName:name:json:` helper.
@objc(RNAutomotiveTemplateEventEmitter)
@objcMembers
public final class TemplateEventEmitter: NSObject {

  /// Emits `eventName` with `body` enriched by the template's `templateId`.
  /// Safe to call with a nil emitter (no-op).
  @objc public static func emit(
    eventName: String,
    body: NSDictionary,
    forTemplate template: CPTemplate,
    emitter: RCTEventEmitter?
  ) {
    guard let emitter = emitter else { return }
    var fullBody = (body as? [String: Any]) ?? [:]
    if let userInfo = template.userInfo as? [String: Any],
       let templateId = userInfo["templateId"] {
      fullBody["templateId"] = templateId
    }
    emitter.sendEvent(withName: eventName, body: fullBody)
  }
}
