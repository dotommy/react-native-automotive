import CarPlay
import Foundation
import React
import UIKit

/// Builds `CPContactTemplate` instances from JS-side config dictionaries.
///
/// Config shape (from `src/templates/ContactTemplate.ts`):
/// ```
/// {
///   name: string,
///   image: ImageSourcePropType,
///   subtitle?: string,
///   actions: [{
///     id: string,
///     type: "call" | "message" | "directions",
///     title?: string,
///     phoneOrEmail?: string,  // type === "message"
///     disabled?: boolean
///   }]
/// }
/// ```
///
/// Emits `buttonPressed` with `{ id, templateId }` when an interactive button
/// is tapped (call / directions). The message button is a system-handled
/// `CPContactMessageButton` initialised with a phone/email URI — no JS event.
///
/// Migrated from inline Objective-C in `RNCarPlay.m`'s `createTemplate:`
/// dispatch table as part of Step 6.
@objc(RNAutomotiveContactTemplateBuilder)
@objcMembers
public final class ContactTemplateBuilder: NSObject {

  @objc public static func build(
    config: NSDictionary,
    templateId: String,
    emitter: RCTEventEmitter?
  ) -> CPContactTemplate {
    let name = config["name"] as? String ?? ""
    // CPContact requires a non-optional UIImage in Swift; the Obj-C call site
    // could pass nil (silent UB). Fall back to an empty UIImage so the contact
    // renders with a blank avatar when no image is provided.
    let image = RCTConvert.uiImage(config["image"]) ?? UIImage()

    let contact = CPContact(name: name, image: image)
    contact.subtitle = config["subtitle"] as? String
    contact.actions = parseButtons(
      buttonsConfig: (config["actions"] as? [NSDictionary]) ?? [],
      templateId: templateId,
      emitter: emitter
    )

    return CPContactTemplate(contact: contact)
  }

  // MARK: - Private

  private static func parseButtons(
    buttonsConfig: [NSDictionary],
    templateId: String,
    emitter: RCTEventEmitter?
  ) -> [CPButton] {
    buttonsConfig.compactMap { buttonConfig -> CPButton? in
      let buttonId = buttonConfig["id"] as? String ?? ""
      let type = buttonConfig["type"] as? String

      let button: CPButton?
      switch type {
      case "call":
        button = CPContactCallButton { _ in
          emitter?.sendEvent(
            withName: "buttonPressed",
            body: ["id": buttonId, "templateId": templateId]
          )
        }
      case "message":
        let phoneOrEmail = buttonConfig["phoneOrEmail"] as? String ?? ""
        button = CPContactMessageButton(phoneOrEmail: phoneOrEmail)
      case "directions":
        button = CPContactDirectionsButton { _ in
          emitter?.sendEvent(
            withName: "buttonPressed",
            body: ["id": buttonId, "templateId": templateId]
          )
        }
      default:
        button = nil
      }

      guard let valid = button else { return nil }
      // Fixed a latent bug from the Obj-C original: `BOOL _disabled = [dict
      // objectForKey:@"disabled"]` was a pointer-truthy check, not the actual
      // bool value (always true if the key was present, even when set false).
      // Here we read the bool properly.
      let disabled = buttonConfig["disabled"] as? Bool ?? false
      valid.isEnabled = !disabled
      if let title = buttonConfig["title"] as? String {
        valid.title = title
      }
      return valid
    }
  }
}
