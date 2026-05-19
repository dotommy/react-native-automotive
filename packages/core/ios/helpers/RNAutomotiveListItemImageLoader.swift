import CarPlay
import Foundation
import UIKit

/// Asynchronous image loader for CPListItem / CPListImageRowItem rows.
///
/// JS-side List items can declare `imgUrl` (single async image) or `imgUrls`
/// (array of async row images). This helper performs the URLSession fetch
/// off the main queue and applies the result on main. Failures are logged
/// to stderr but never raise — the row simply shows its original placeholder.
///
/// Swift port of the Obj-C `updateItemImageWithURL:` and
/// `updateListRowItemImageWithURL:imgUrl:index:` helpers from RNCarPlay.m.
@objc(RNAutomotiveListItemImageLoader)
@objcMembers
public final class ListItemImageLoader: NSObject {

  /// Loads a single image into a `CPListItem`.
  @objc public static func load(into item: CPListItem, from urlString: String) {
    guard let url = URL(string: urlString) else {
      NSLog("Failed to parse URL: %@", urlString)
      return
    }
    URLSession.shared.dataTask(with: url) { data, _, _ in
      guard let data = data, let image = UIImage(data: data) else {
        NSLog("Failed to load image from URL: %@", urlString)
        return
      }
      DispatchQueue.main.async {
        item.setImage(image)
      }
    }.resume()
  }

  /// Loads a single image into a slot of a `CPListImageRowItem` grid (iOS 14+).
  @available(iOS 14.0, *)
  @objc public static func load(
    into rowItem: CPListImageRowItem,
    from urlString: String,
    at index: Int
  ) {
    guard let url = URL(string: urlString) else {
      NSLog("Failed to parse URL: %@", urlString)
      return
    }
    URLSession.shared.dataTask(with: url) { data, _, _ in
      guard let data = data, let image = UIImage(data: data) else {
        NSLog("Failed to load image for CPListImageRowItem from URL: %@", urlString)
        return
      }
      DispatchQueue.main.async {
        var newImages = rowItem.gridImages
        guard index < newImages.count else {
          NSLog("Failed to update images array of CPListImageRowItem (index OOB)")
          return
        }
        newImages[index] = image
        rowItem.update(newImages)
      }
    }.resume()
  }
}
