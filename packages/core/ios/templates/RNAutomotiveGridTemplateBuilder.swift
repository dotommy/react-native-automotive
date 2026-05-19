import CarPlay
import Foundation
import React
import UIKit

/// Builds `CPGridTemplate` instances from JS-side config dictionaries.
///
/// Config shape (from `src/templates/GridTemplate.ts`):
/// ```
/// {
///   title: string,
///   buttons: [{
///     id: string,
///     titleVariants: [string],
///     image: ImageSourcePropType,
///     disabled?: boolean
///   }],
///   leadingNavigationBarButtons?: BarButton[],
///   trailingNavigationBarButtons?: BarButton[]
/// }
/// ```
///
/// Emits:
/// - `gridButtonPressed` with `{ id, templateId, index }` on grid button tap
/// - `barButtonPressed` with `{ id, templateId }` on nav bar button tap
///   (via shared `BarButtonParser`)
///
/// Migrated from inline Objective-C in `RNCarPlay.m`'s `createTemplate:`
/// dispatch table as part of Step 6.
@objc(RNAutomotiveGridTemplateBuilder)
@objcMembers
public final class GridTemplateBuilder: NSObject {

  @objc public static func build(
    config: NSDictionary,
    templateId: String,
    emitter: RCTEventEmitter?
  ) -> CPGridTemplate {
    let title = config["title"] as? String ?? ""
    let buttons = parseGridButtons(
      buttonsConfig: (config["buttons"] as? [NSDictionary]) ?? [],
      templateId: templateId,
      emitter: emitter
    )

    let template = CPGridTemplate(title: title, gridButtons: buttons)
    template.leadingNavigationBarButtons = BarButtonParser.parseAll(
      buttons: (config["leadingNavigationBarButtons"] as? [NSDictionary]) ?? [],
      templateId: templateId,
      emitter: emitter
    )
    template.trailingNavigationBarButtons = BarButtonParser.parseAll(
      buttons: (config["trailingNavigationBarButtons"] as? [NSDictionary]) ?? [],
      templateId: templateId,
      emitter: emitter
    )
    return template
  }

  // MARK: - Private

  private static func parseGridButtons(
    buttonsConfig: [NSDictionary],
    templateId: String,
    emitter: RCTEventEmitter?
  ) -> [CPGridButton] {
    buttonsConfig.enumerated().map { index, buttonConfig in
      let buttonId = buttonConfig["id"] as? String ?? ""
      let titleVariants = (buttonConfig["titleVariants"] as? [String]) ?? []
      let image = RCTConvert.uiImage(buttonConfig["image"]) ?? UIImage()

      let button = CPGridButton(titleVariants: titleVariants, image: image) { _ in
        emitter?.sendEvent(
          withName: "gridButtonPressed",
          body: [
            "id": buttonId,
            "templateId": templateId,
            "index": index,
          ]
        )
      }

      // Same pointer-truthiness bug fix as BarButtonParser.
      let disabled = buttonConfig["disabled"] as? Bool ?? false
      button.isEnabled = !disabled
      return button
    }
  }
}
