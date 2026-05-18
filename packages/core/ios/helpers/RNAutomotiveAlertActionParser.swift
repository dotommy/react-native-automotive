import CarPlay
import Foundation
import React

/// Shared helper for translating a JS-side action dictionary into a
/// `CPAlertAction` with an event-emitting handler.
///
/// Used by both `AlertTemplate` and `ActionSheetTemplate` (and by the
/// `presentNavigationAlert` flow when that path migrates to Swift).
///
/// All handlers emit a single event:
/// ```
/// actionButtonPressed: { templateId, id }
/// ```
@objc(RNAutomotiveAlertActionParser)
@objcMembers
public final class AlertActionParser: NSObject {

  /// Builds a `CPAlertAction` from an `[id, title, style]` config dict.
  /// The action's tap handler emits `actionButtonPressed` to JS.
  @objc public static func parse(
    action: NSDictionary,
    templateId: String,
    emitter: RCTEventEmitter?
  ) -> CPAlertAction {
    let title = action["title"] as? String ?? ""
    let style = parseStyle(action["style"] as? String)
    let actionId = action["id"] as? String ?? ""

    return CPAlertAction(title: title, style: style) { _ in
      emitter?.sendEvent(
        withName: "actionButtonPressed",
        body: ["templateId": templateId, "id": actionId]
      )
    }
  }

  /// Maps the JS `style` string to the corresponding CarPlay enum case.
  /// Unknown / missing → `.default`.
  @objc public static func parseStyle(_ raw: String?) -> CPAlertAction.Style {
    switch raw {
    case "cancel":      return .cancel
    case "destructive": return .destructive
    default:            return .default
    }
  }
}
