import CarPlay
import Foundation
import React
import UIKit

/// Builds (or rather, configures the shared) `CPNowPlayingTemplate`.
///
/// Unlike other templates, `CPNowPlayingTemplate` is a system singleton —
/// CarPlay routes the playing media UI through a single shared instance.
/// This builder configures the shared template and returns it.
///
/// Config shape (from `src/templates/NowPlayingTemplate.ts`):
/// ```
/// {
///   albumArtistButtonEnabled?: boolean,
///   upNextButtonTitle?: string,
///   upNextButtonEnabled?: boolean,
///   buttons?: [{
///     id: string,
///     type: "shuffle" | "add-to-library" | "more" | "playback" | "repeat" | "image",
///     image?: ImageSourcePropType  // type === "image"
///   }]
/// }
/// ```
///
/// Emits `buttonPressed` with `{ templateId, id }` when any button is tapped.
/// The `upNextButtonPressed` / `albumArtistButtonPressed` events come from
/// the observer pattern (added separately by `enableNowPlaying` RCT method,
/// still in legacy Obj-C).
///
/// Migrated from inline Objective-C in `RNCarPlay.m`'s `createTemplate:`
/// dispatch table as part of Step 6.
@objc(RNAutomotiveNowPlayingTemplateBuilder)
@objcMembers
public final class NowPlayingTemplateBuilder: NSObject {

  @objc public static func build(
    config: NSDictionary,
    templateId: String,
    emitter: RCTEventEmitter?
  ) -> CPNowPlayingTemplate {
    let template = CPNowPlayingTemplate.shared

    template.isAlbumArtistButtonEnabled = (config["albumArtistButtonEnabled"] as? Bool) ?? false
    template.upNextTitle = (config["upNextButtonTitle"] as? String) ?? ""
    template.isUpNextButtonEnabled = (config["upNextButtonEnabled"] as? Bool) ?? false

    let buttons = parseButtons(
      buttonsConfig: (config["buttons"] as? [NSDictionary]) ?? [],
      templateId: templateId,
      emitter: emitter
    )
    template.updateNowPlayingButtons(buttons)

    return template
  }

  // MARK: - Private

  private static func parseButtons(
    buttonsConfig: [NSDictionary],
    templateId: String,
    emitter: RCTEventEmitter?
  ) -> [CPNowPlayingButton] {
    buttonsConfig.compactMap { buttonConfig -> CPNowPlayingButton? in
      let buttonId = buttonConfig["id"] as? String ?? ""
      let type = buttonConfig["type"] as? String

      // Generic handler closure for the non-image button subclasses, all of
      // which share `init(handler: (CPNowPlayingButton) -> Void)`.
      let emit: (CPNowPlayingButton) -> Void = { _ in
        emitter?.sendEvent(
          withName: "buttonPressed",
          body: ["templateId": templateId, "id": buttonId]
        )
      }

      switch type {
      case "shuffle":        return CPNowPlayingShuffleButton(handler: emit)
      case "add-to-library": return CPNowPlayingAddToLibraryButton(handler: emit)
      case "more":           return CPNowPlayingMoreButton(handler: emit)
      case "playback":       return CPNowPlayingPlaybackRateButton(handler: emit)
      case "repeat":         return CPNowPlayingRepeatButton(handler: emit)
      case "image":
        let image = RCTConvert.uiImage(buttonConfig["image"]) ?? UIImage()
        // CPNowPlayingImageButton has its own typed handler signature,
        // so duplicate the small body construction rather than fight types.
        return CPNowPlayingImageButton(image: image) { _ in
          emitter?.sendEvent(
            withName: "buttonPressed",
            body: ["templateId": templateId, "id": buttonId]
          )
        }
      default:
        return nil
      }
    }
  }
}
