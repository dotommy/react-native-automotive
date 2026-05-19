import CarPlay
import Foundation
import React
import UIKit

/// Builds `CPListTemplate` instances from JS-side config dictionaries.
///
/// Config shape (from `src/templates/ListTemplate.ts`):
/// ```
/// {
///   title: string,
///   sections: ListSection[],   // see ListSectionParser
///   leadingNavigationBarButtons?: BarButton[],
///   trailingNavigationBarButtons?: BarButton[],
///   backButtonHidden?: boolean,
///   emptyViewTitleVariants?: string[],
///   emptyViewSubtitleVariants?: string[],
///   assistant?: {
///     enabled: boolean,
///     position: "top" | "bottom",
///     visibility: "off" | "always" | "limited",
///     action: "playMedia" | "startCall"   // iOS 15+
///   }
/// }
/// ```
///
/// The list delegate is forwarded to the legacy `RNCarPlay` Obj-C module
/// (which conforms to `CPListTemplateDelegate`) until that module is
/// fully migrated. The shared `BarButtonParser` handles nav bar buttons.
///
/// Migrated from inline Objective-C in `RNCarPlay.m`'s `createTemplate:`
/// dispatch table as part of Step 6.
@objc(RNAutomotiveListTemplateBuilder)
@objcMembers
public final class ListTemplateBuilder: NSObject {

  @objc public static func build(
    config: NSDictionary,
    templateId: String,
    emitter: RCTEventEmitter?
  ) -> CPListTemplate {
    let title = config["title"] as? String ?? ""
    let sectionsConfig = (config["sections"] as? [NSDictionary]) ?? []
    let sections = ListSectionParser.parseAll(
      sections: sectionsConfig,
      templateId: templateId,
      emitter: emitter
    )

    let template = makeTemplate(title: title, sections: sections, config: config)

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

    applyBackButton(template: template, config: config, templateId: templateId, emitter: emitter)
    applyEmptyView(template: template, config: config)

    // Delegate forwarded to the legacy Obj-C module (CPListTemplateDelegate)
    // until that path is also migrated to Swift.
    if let delegate = emitter as? CPListTemplateDelegate {
      template.delegate = delegate
    }

    return template
  }

  // MARK: - Private

  private static func makeTemplate(
    title: String,
    sections: [CPListSection],
    config: NSDictionary
  ) -> CPListTemplate {
    if #available(iOS 15.0, *),
       let assistant = config["assistant"] as? NSDictionary,
       (assistant["enabled"] as? Bool) == true {
      let position = parseAssistantPosition(assistant["position"] as? String)
      let visibility = parseAssistantVisibility(assistant["visibility"] as? String)
      // Bug in the Obj-C original: it read the "visibility" key for the
      // assistantAction parameter (typo). Swift port reads "action".
      let action = parseAssistantAction(assistant["action"] as? String)
      let conf = CPAssistantCellConfiguration(
        position: position,
        visibility: visibility,
        assistantAction: action
      )
      return CPListTemplate(title: title, sections: sections, assistantCellConfiguration: conf)
    }
    return CPListTemplate(title: title, sections: sections)
  }

  private static func applyBackButton(
    template: CPListTemplate,
    config: NSDictionary,
    templateId: String,
    emitter: RCTEventEmitter?
  ) {
    let hidden = (config["backButtonHidden"] as? Bool) ?? false
    guard !hidden, #available(iOS 14.0, *) else { return }

    let backButton = CPBarButton(title: " Back") { [weak emitter] _ in
      emitter?.sendEvent(
        withName: "backButtonPressed",
        body: ["templateId": templateId]
      )
      // Pop the navigation stack to match the legacy Obj-C behaviour.
      RNAutomotiveStore.shared.interfaceController?.popTemplate(animated: false)
    }
    template.backButton = backButton
  }

  private static func applyEmptyView(template: CPListTemplate, config: NSDictionary) {
    guard #available(iOS 14.0, *) else { return }
    if let titles = config["emptyViewTitleVariants"] as? [String] {
      template.emptyViewTitleVariants = titles
    }
    if let subtitles = config["emptyViewSubtitleVariants"] as? [String] {
      template.emptyViewSubtitleVariants = subtitles
    }
  }

  // MARK: - Assistant enum parsers (iOS 15+)

  @available(iOS 15.0, *)
  private static func parseAssistantPosition(_ raw: String?) -> CPAssistantCellPosition {
    switch raw {
    case "bottom": return .bottom
    default:       return .top
    }
  }

  @available(iOS 15.0, *)
  private static func parseAssistantVisibility(_ raw: String?) -> CPAssistantCellVisibility {
    switch raw {
    case "always":  return .always
    case "limited": return .whileLimitedUIActive
    default:        return .off
    }
  }

  @available(iOS 15.0, *)
  private static func parseAssistantActionType(_ raw: String?) -> CPAssistantCellActionType {
    switch raw {
    case "playMedia": return .playMedia
    default:          return .startCall
    }
  }

  // Wrapper to keep call site clean even when caller doesn't gate on iOS 15.
  @available(iOS 15.0, *)
  private static func parseAssistantAction(_ raw: String?) -> CPAssistantCellActionType {
    parseAssistantActionType(raw)
  }
}
