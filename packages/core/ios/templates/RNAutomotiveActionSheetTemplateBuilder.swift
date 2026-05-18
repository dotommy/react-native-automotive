import CarPlay
import Foundation
import React

/// Builds `CPActionSheetTemplate` instances from JS-side config dictionaries.
///
/// Config shape (from `src/templates/ActionSheetTemplate.ts`):
/// ```
/// {
///   title: string,
///   message: string,
///   actions: [{ id: string, title: string, style: "default" | "cancel" | "destructive" }]
/// }
/// ```
///
/// Emits `actionButtonPressed` events with `{ templateId, id }` body when a
/// CarPlay user taps any action button (shared parser with AlertTemplate).
///
/// Migrated from inline Objective-C in `RNCarPlay.m`'s `createTemplate:`
/// dispatch table as part of Step 6 (Obj-C → Swift template builders).
@objc(RNAutomotiveActionSheetTemplateBuilder)
@objcMembers
public final class ActionSheetTemplateBuilder: NSObject {

  @objc public static func build(
    config: NSDictionary,
    templateId: String,
    emitter: RCTEventEmitter?
  ) -> CPActionSheetTemplate {
    let title = config["title"] as? String
    let message = config["message"] as? String
    let actionsConfig = (config["actions"] as? [NSDictionary]) ?? []

    let actions = actionsConfig.map { actionConfig in
      AlertActionParser.parse(
        action: actionConfig,
        templateId: templateId,
        emitter: emitter
      )
    }

    return CPActionSheetTemplate(title: title, message: message, actions: actions)
  }
}
