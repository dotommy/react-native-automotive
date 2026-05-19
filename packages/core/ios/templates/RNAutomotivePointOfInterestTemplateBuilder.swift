import CarPlay
import Foundation
import MapKit
import React

/// Builds `CPPointOfInterestTemplate` instances from JS-side config dictionaries.
///
/// Config shape (from `src/templates/PointOfInterestTemplate.ts`):
/// ```
/// {
///   title: string,
///   items: [{
///     location: { latitude: number, longitude: number, name?: string },
///     title: string,
///     subtitle?: string,
///     summary?: string,
///     detailTitle?: string,
///     detailSubtitle?: string,
///     detailSummary?: string
///   }]
/// }
/// ```
///
/// Each POI's original config is stored verbatim in `userInfo` so the
/// delegate can echo it back to JS when the user taps a pin.
///
/// Delegate forwarding: `CPPointOfInterestTemplateDelegate` methods
/// (didSelectPointOfInterest, didChangeMapRegion) live on the legacy
/// Obj-C `RNCarPlay` module — passed via cast on `emitter`.
///
/// Migrated from inline Objective-C in `RNCarPlay.m`'s `createTemplate:`
/// dispatch table as part of Step 6.
@objc(RNAutomotivePointOfInterestTemplateBuilder)
@objcMembers
public final class PointOfInterestTemplateBuilder: NSObject {

  @objc public static func build(
    config: NSDictionary,
    templateId: String,
    emitter: RCTEventEmitter?
  ) -> CPPointOfInterestTemplate {
    let title = config["title"] as? String ?? ""
    let itemsConfig = (config["items"] as? [NSDictionary]) ?? []

    let items = itemsConfig.map { itemConfig -> CPPointOfInterest in
      let poi = parsePointOfInterest(config: itemConfig)
      poi.userInfo = itemConfig
      return poi
    }

    let template = CPPointOfInterestTemplate(
      title: title,
      pointsOfInterest: items,
      selectedIndex: 0
    )

    if let delegate = emitter as? CPPointOfInterestTemplateDelegate {
      template.pointOfInterestDelegate = delegate
    }

    return template
  }

  // MARK: - Private

  private static func parsePointOfInterest(config: NSDictionary) -> CPPointOfInterest {
    let location = parseMapItem(config["location"] as? NSDictionary)
    let title = config["title"] as? String ?? ""

    return CPPointOfInterest(
      location: location,
      title: title,
      subtitle: config["subtitle"] as? String,
      summary: config["summary"] as? String,
      detailTitle: config["detailTitle"] as? String,
      detailSubtitle: config["detailSubtitle"] as? String,
      detailSummary: config["detailSummary"] as? String,
      pinImage: nil
    )
  }

  private static func parseMapItem(_ config: NSDictionary?) -> MKMapItem {
    let latitude = (config?["latitude"] as? Double) ?? 0
    let longitude = (config?["longitude"] as? Double) ?? 0
    let coordinate = CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
    let placemark = MKPlacemark(coordinate: coordinate)
    let item = MKMapItem(placemark: placemark)
    item.name = config?["name"] as? String
    return item
  }
}
