import CarPlay
import Foundation
import React
import UIKit

/// Shared parser for `CPBarButton` arrays (navigation bar buttons).
///
/// Used by every template with leading / trailing navigation bar buttons:
/// Grid, List, Map, NowPlaying, POI, etc. Single source of truth keeps the
/// event wire format (`barButtonPressed` with `{ id, templateId }`)
/// consistent.
///
/// JS config shape per button:
/// ```
/// {
///   id: string,
///   type?: "text" | "image",   // default: "text"
///   title?: string,            // when type === "text"
///   image?: ImageSourcePropType, // when type === "image"
///   disabled?: boolean
/// }
/// ```
@objc(RNAutomotiveBarButtonParser)
@objcMembers
public final class BarButtonParser: NSObject {

  /// Parses an array of button dicts into `CPBarButton` instances.
  @objc public static func parseAll(
    buttons: [NSDictionary],
    templateId: String,
    emitter: RCTEventEmitter?
  ) -> [CPBarButton] {
    buttons.map { buttonConfig in
      parse(button: buttonConfig, templateId: templateId, emitter: emitter)
    }
  }

  /// Parses a single button dict.
  @objc public static func parse(
    button buttonConfig: NSDictionary,
    templateId: String,
    emitter: RCTEventEmitter?
  ) -> CPBarButton {
    let buttonId = buttonConfig["id"] as? String ?? ""
    let type = buttonConfig["type"] as? String

    let handler: (CPBarButton) -> Void = { _ in
      emitter?.sendEvent(
        withName: "barButtonPressed",
        body: ["id": buttonId, "templateId": templateId]
      )
    }

    let button: CPBarButton
    if type == "image" {
      let image = RCTConvert.uiImage(buttonConfig["image"]) ?? UIImage()
      button = CPBarButton(image: image, handler: handler)
    } else {
      let title = buttonConfig["title"] as? String ?? ""
      button = CPBarButton(title: title, handler: handler)
    }

    // Fixed latent bug: the Obj-C original treated `dict[@"disabled"]` as a
    // BOOL via pointer-truthiness — present-key meant disabled even when
    // value was false. Swift reads the actual bool.
    let disabled = buttonConfig["disabled"] as? Bool ?? false
    button.isEnabled = !disabled
    return button
  }
}
