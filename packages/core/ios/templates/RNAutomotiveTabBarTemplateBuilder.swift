import CarPlay
import Foundation
import React

/// Builds `CPTabBarTemplate` instances from JS-side config dictionaries.
///
/// `CPTabBarTemplate` is a *container* template: each tab is itself a
/// previously-created CPTemplate, looked up by id from the shared
/// `RNAutomotiveStore`. The JS side must therefore create the child
/// templates before creating the TabBar.
///
/// Config shape (from `src/templates/TabBarTemplate.ts`):
/// ```
/// {
///   templates: [{ id: string }]   // ids of previously-created child templates
/// }
/// ```
///
/// Delegate forwarding: `CPTabBarTemplateDelegate.didSelectTemplate`
/// lives on the legacy Obj-C `RNCarPlay` module — passed via cast on
/// `emitter`.
///
/// Migrated from inline Objective-C in `RNCarPlay.m`'s `createTemplate:`
/// dispatch table as part of Step 6.
@objc(RNAutomotiveTabBarTemplateBuilder)
@objcMembers
public final class TabBarTemplateBuilder: NSObject {

  @objc public static func build(
    config: NSDictionary,
    templateId: String,
    emitter: RCTEventEmitter?
  ) -> CPTabBarTemplate {
    let templates = resolveChildTemplates(
      from: (config["templates"] as? [NSDictionary]) ?? []
    )

    let tabBarTemplate = CPTabBarTemplate(templates: templates)

    if let delegate = emitter as? CPTabBarTemplateDelegate {
      tabBarTemplate.delegate = delegate
    }

    return tabBarTemplate
  }

  // MARK: - Private

  private static func resolveChildTemplates(from configs: [NSDictionary]) -> [CPTemplate] {
    configs.compactMap { tpl -> CPTemplate? in
      guard let id = tpl["id"] as? String else { return nil }
      return RNAutomotiveStore.shared.findTemplateById(id)
    }
  }
}
