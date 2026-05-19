import CarPlay
import Foundation
import React

/// Builds `CPInformationTemplate` instances from JS-side config dictionaries.
///
/// Config shape (from `src/templates/InformationTemplate.ts`):
/// ```
/// {
///   title: string,
///   leading: boolean,  // true → .leading layout, false → .twoColumn (default)
///   items: [{ title: string, detail: string }],
///   actions: [{ id: string, title: string }]
/// }
/// ```
///
/// Emits `actionButtonPressed` events with `{ templateId, id }` body when
/// the user taps any action button (same wire format as Alert / ActionSheet).
///
/// Migrated from inline Objective-C in `RNCarPlay.m`'s `createTemplate:`
/// dispatch table as part of Step 6.
@objc(RNAutomotiveInformationTemplateBuilder)
@objcMembers
public final class InformationTemplateBuilder: NSObject {

  @objc public static func build(
    config: NSDictionary,
    templateId: String,
    emitter: RCTEventEmitter?
  ) -> CPInformationTemplate {
    let title = config["title"] as? String ?? ""
    let layout: CPInformationTemplateLayout =
      (config["leading"] as? Bool) ?? false ? .leading : .twoColumn

    let itemsConfig = (config["items"] as? [NSDictionary]) ?? []
    let items = itemsConfig.map { itemConfig -> CPInformationItem in
      CPInformationItem(
        title: itemConfig["title"] as? String,
        detail: itemConfig["detail"] as? String
      )
    }

    let actionsConfig = (config["actions"] as? [NSDictionary]) ?? []
    let actions = actionsConfig.map { actionConfig -> CPTextButton in
      let actionTitle = actionConfig["title"] as? String ?? ""
      let actionId = actionConfig["id"] as? String ?? ""
      return CPTextButton(title: actionTitle, textStyle: .normal) { _ in
        emitter?.sendEvent(
          withName: "actionButtonPressed",
          body: ["templateId": templateId, "id": actionId]
        )
      }
    }

    return CPInformationTemplate(
      title: title,
      layout: layout,
      items: items,
      actions: actions
    )
  }
}
