import CarPlay
import Foundation
import React

/// Builds `CPAlertTemplate` instances from JS-side config dictionaries.
///
/// Config shape (from `src/templates/AlertTemplate.ts`):
/// ```
/// {
///   titleVariants: [string],
///   actions: [{ id: string, title: string, style: "default" | "cancel" | "destructive" }]
/// }
/// ```
///
/// Emits `actionButtonPressed` events with `{ templateId, id }` body when a
/// CarPlay user taps any action button.
///
/// Migrated from inline Objective-C in `RNCarPlay.m`'s `createTemplate:`
/// dispatch table as part of Step 6 (Obj-C → Swift template builders).
@objc(RNAutomotiveAlertTemplateBuilder)
@objcMembers
public final class AlertTemplateBuilder: NSObject {

  @objc public static func build(
    config: NSDictionary,
    templateId: String,
    emitter: RCTEventEmitter?
  ) -> CPAlertTemplate {
    let titleVariants = (config["titleVariants"] as? [String]) ?? []
    let actionsConfig = (config["actions"] as? [[String: Any]]) ?? []

    let actions: [CPAlertAction] = actionsConfig.map { actionConfig in
      let title = actionConfig["title"] as? String ?? ""
      let style = parseStyle(actionConfig["style"] as? String)
      let actionId = actionConfig["id"] as? String ?? ""

      return CPAlertAction(title: title, style: style) { _ in
        emitter?.sendEvent(
          withName: "actionButtonPressed",
          body: ["templateId": templateId, "id": actionId]
        )
      }
    }

    return CPAlertTemplate(titleVariants: titleVariants, actions: actions)
  }

  // MARK: - Private

  private static func parseStyle(_ raw: String?) -> CPAlertAction.Style {
    switch raw {
    case "cancel":      return .cancel
    case "destructive": return .destructive
    default:            return .default
    }
  }
}
