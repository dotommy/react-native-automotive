import CarPlay
import Foundation
import React
import UIKit

/// Builds and configures `CPMapTemplate` instances from JS-side config.
///
/// Config shape (from `src/templates/MapTemplate.ts`):
/// ```
/// {
///   guidanceBackgroundColor?: ColorValue,
///   tripEstimateStyle?: "dark" | "light",
///   leadingNavigationBarButtons?: BarButton[],
///   trailingNavigationBarButtons?: BarButton[],
///   mapButtons?: MapButton[],
///   automaticallyHidesNavigationBar?: boolean,
///   hidesButtonsWithNavigationBar?: boolean,
///   render?: any  // truthy → mount React content via RCTRootView
/// }
/// ```
///
/// Two entry points:
///
/// 1. `build(...)` — invoked from the `createTemplate:` dispatch table to
///    construct a fresh CPMapTemplate, attach config, wire the delegate.
/// 2. `applyConfig(...)` — invoked from the `updateMapTemplateConfig:` RCT
///    method (still in Obj-C) to mutate an existing template's config in
///    place. Single source of truth: this is what `applyConfigForMapTemplate`
///    used to live in Obj-C.
///
/// Map delegate (gestures, alerts, trip previews) lives on legacy `RNCarPlay`
/// — forwarded via cast on `emitter`.
///
/// Migrated from inline Objective-C in `RNCarPlay.m`'s `createTemplate:`
/// dispatch table as part of Step 6.
@objc(RNAutomotiveMapTemplateBuilder)
@objcMembers
public final class MapTemplateBuilder: NSObject {

  @objc public static func build(
    config: NSDictionary,
    templateId: String,
    emitter: RCTEventEmitter?
  ) -> CPMapTemplate {
    let template = CPMapTemplate()
    applyConfig(
      mapTemplate: template,
      templateId: templateId,
      config: config,
      emitter: emitter
    )

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
    template.userInfo = ["templateId": templateId]

    if let delegate = emitter as? CPMapTemplateDelegate {
      template.mapDelegate = delegate
    }
    return template
  }

  /// Applies a subset of config to an existing CPMapTemplate. Called by
  /// both the createTemplate dispatch (above) and the legacy
  /// updateMapTemplateConfig RCT method.
  @objc public static func applyConfig(
    mapTemplate: CPMapTemplate,
    templateId: String,
    config: NSDictionary,
    emitter: RCTEventEmitter?
  ) {
    if let colorAny = config["guidanceBackgroundColor"],
       let color = RCTConvert.uiColor(colorAny) {
      mapTemplate.guidanceBackgroundColor = color
    } else if mapTemplate.guidanceBackgroundColor == nil {
      mapTemplate.guidanceBackgroundColor = .systemGray5
    }

    if let styleRaw = config["tripEstimateStyle"] as? String {
      mapTemplate.tripEstimateStyle = parseTripEstimateStyle(styleRaw)
    } else if mapTemplate.tripEstimateStyle == .light {
      // Match the Obj-C default-on-create behaviour: dark when unset.
      mapTemplate.tripEstimateStyle = .dark
    }

    // The outer-scope leading/trailing are set in build() above; these
    // additional sets handle the updateMapTemplateConfig path where the
    // caller may want to update bar buttons without recreating the template.
    if let leading = config["leadingNavigationBarButtons"] as? [NSDictionary] {
      mapTemplate.leadingNavigationBarButtons = BarButtonParser.parseAll(
        buttons: leading,
        templateId: templateId,
        emitter: emitter
      )
    }
    if let trailing = config["trailingNavigationBarButtons"] as? [NSDictionary] {
      mapTemplate.trailingNavigationBarButtons = BarButtonParser.parseAll(
        buttons: trailing,
        templateId: templateId,
        emitter: emitter
      )
    }

    if let mapButtons = config["mapButtons"] as? [NSDictionary] {
      mapTemplate.mapButtons = parseMapButtons(
        configs: mapButtons,
        mapTemplate: mapTemplate,
        emitter: emitter
      )
    }

    if let value = config["automaticallyHidesNavigationBar"] as? Bool {
      mapTemplate.automaticallyHidesNavigationBar = value
    }
    if let value = config["hidesButtonsWithNavigationBar"] as? Bool {
      mapTemplate.hidesButtonsWithNavigationBar = value
    }

    // The `render` flag mounts a React-rendered overlay via RCTRootView
    // attached to the CarPlay window's rootViewController. Requires the
    // bridge from the emitter (which is the RNCarPlay RCTEventEmitter).
    if config["render"] != nil, let bridge = emitter?.bridge {
      let rootView = RCTRootView(
        bridge: bridge,
        moduleName: templateId,
        initialProperties: [:]
      )
      let viewController = RNCarPlayViewController(rootView: rootView)
      RNAutomotiveStore.shared.window?.rootViewController = viewController
    }
  }

  // MARK: - Private

  private static func parseTripEstimateStyle(_ raw: String) -> CPTripEstimateStyle {
    raw == "light" ? .light : .dark
  }

  private static func parseMapButtons(
    configs: [NSDictionary],
    mapTemplate: CPMapTemplate,
    emitter: RCTEventEmitter?
  ) -> [CPMapButton] {
    configs.map { mapButtonConfig -> CPMapButton in
      let buttonId = mapButtonConfig["id"] as? String ?? ""

      let mapButton = CPMapButton { _ in
        TemplateEventEmitter.emit(
          eventName: "mapButtonPressed",
          body: ["id": buttonId],
          forTemplate: mapTemplate,
          emitter: emitter
        )
      }
      if let image = RCTConvert.uiImage(mapButtonConfig["image"]) {
        mapButton.image = image
      }
      if let focusedImage = RCTConvert.uiImage(mapButtonConfig["focusedImage"]) {
        mapButton.focusedImage = focusedImage
      }
      if let disabled = mapButtonConfig["disabled"] as? Bool {
        mapButton.isEnabled = !disabled
      }
      if let hidden = mapButtonConfig["hidden"] as? Bool {
        mapButton.isHidden = hidden
      }
      return mapButton
    }
  }
}
