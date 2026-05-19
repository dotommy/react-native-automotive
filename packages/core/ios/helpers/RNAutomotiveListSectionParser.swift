import CarPlay
import Foundation
import React
import UIKit

/// Parses `CPListSection` arrays from JS-side config.
///
/// JS config shape (from `src/templates/ListTemplate.ts`):
/// ```
/// sections: [{
///   header?: string,
///   sectionIndexTitle?: string,
///   items: [{
///     text: string,
///     detailText?: string,
///     image?: ImageSourcePropType,
///     images?: ImageSourcePropType[],   // multi-image grid (iOS 14+)
///     imgUrl?: string,                  // single async URL
///     imgUrls?: string[],               // multi-image async URLs (iOS 14+)
///     showsDisclosureIndicator?: boolean,
///     isPlaying?: boolean,
///   }]
/// }]
/// ```
///
/// Each parsed item is tagged with `userInfo: { index: <flat-list-index> }`
/// so the list delegate can identify which item the user selected.
@objc(RNAutomotiveListSectionParser)
@objcMembers
public final class ListSectionParser: NSObject {

  /// Parses an array of section dicts into `CPListSection` instances.
  @objc public static func parseAll(
    sections sectionsConfig: [NSDictionary],
    templateId: String,
    emitter: RCTEventEmitter?
  ) -> [CPListSection] {
    var result: [CPListSection] = []
    var flatIndex = 0
    for sectionConfig in sectionsConfig {
      let itemsConfig = (sectionConfig["items"] as? [NSDictionary]) ?? []
      let header = sectionConfig["header"] as? String
      let sectionIndexTitle = sectionConfig["sectionIndexTitle"] as? String

      let items = parseItems(
        items: itemsConfig,
        startIndex: flatIndex,
        templateId: templateId,
        emitter: emitter
      )

      let section = CPListSection(
        items: items,
        header: header,
        sectionIndexTitle: sectionIndexTitle
      )
      result.append(section)
      flatIndex += itemsConfig.count
    }
    return result
  }

  // MARK: - Private

  private static func parseItems(
    items itemsConfig: [NSDictionary],
    startIndex: Int,
    templateId: String,
    emitter: RCTEventEmitter?
  ) -> [CPListTemplateItem] {
    var result: [CPListTemplateItem] = []
    var listIndex = startIndex
    for itemConfig in itemsConfig {
      let showsDisclosure = (itemConfig["showsDisclosureIndicator"] as? Int) == 1
      let detailText = itemConfig["detailText"] as? String
      let text = (itemConfig["text"] as? String) ?? ""
      let imageObj = itemConfig["image"]

      let imageItems = itemConfig["images"] as? [Any]
      let imageUrls = itemConfig["imgUrls"] as? [String]

      if imageItems == nil && imageUrls == nil {
        // Single image (or no image)
        let image = RCTConvert.uiImage(imageObj)
        let item: CPListItem
        if #available(iOS 14.0, *) {
          let accessoryType: CPListItemAccessoryType =
            showsDisclosure ? .disclosureIndicator : .none
          item = CPListItem(
            text: text,
            detailText: detailText,
            image: image,
            accessoryImage: nil,
            accessoryType: accessoryType
          )
        } else {
          item = CPListItem(
            text: text,
            detailText: detailText,
            image: image,
            showsDisclosureIndicator: showsDisclosure
          )
        }
        if let isPlaying = itemConfig["isPlaying"] as? Bool {
          item.isPlaying = isPlaying
        }
        if let imgUrl = itemConfig["imgUrl"] as? String {
          ListItemImageLoader.load(into: item, from: imgUrl)
        }
        item.userInfo = ["index": listIndex]
        result.append(item)
      } else if #available(iOS 14.0, *) {
        // Multi-image row (CPListImageRowItem)
        let rowItem: CPListImageRowItem

        // Prefer the synchronous images array if present.
        if let imageItems = imageItems, !imageItems.isEmpty {
          let slice = Array(
            imageItems.prefix(CPMaximumNumberOfGridImages)
          )
          let images = slice.compactMap { RCTConvert.uiImage($0) }
          rowItem = CPListImageRowItem(text: text, images: images)
        } else {
          // Async URLs: start with empty placeholders, replace asynchronously.
          let urls = imageUrls ?? []
          let sliced = Array(urls.prefix(CPMaximumNumberOfGridImages))
          let placeholders = (0..<sliced.count).map { _ in UIImage() }
          rowItem = CPListImageRowItem(text: text, images: placeholders)
          for (i, imgUrl) in sliced.enumerated() {
            ListItemImageLoader.load(into: rowItem, from: imgUrl, at: i)
          }
        }

        let capturedIndex = listIndex
        rowItem.listImageRowHandler = { _, index, _ in
          // The handler receives the row item; the event needs the parent
          // template's templateId, looked up via the shared store.
          guard let template = RNAutomotiveStore.shared.findTemplateById(templateId)
          else { return }
          TemplateEventEmitter.emit(
            eventName: "didSelectListItemRowImage",
            body: ["index": capturedIndex, "imageIndex": index],
            forTemplate: template,
            emitter: emitter
          )
        }
        rowItem.userInfo = ["index": listIndex]
        result.append(rowItem)
      }

      listIndex += 1
    }
    return result
  }
}
