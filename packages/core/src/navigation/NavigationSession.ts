import { Automotive } from '../Automotive';
import { Maneuver } from '../interfaces/Maneuver';
import { PauseReason } from '../interfaces/PauseReason';
import { TravelEstimates } from '../interfaces/TravelEstimates';
import { MapTemplate } from '../templates/MapTemplate';
import { Trip } from './Trip';
import { Image, processColor } from 'react-native';

export class NavigationSession {
  public maneuvers: Maneuver[] = [];

  constructor(public id: string, public trip: Trip, public mapTemplate: MapTemplate) {}

  public updateManeuvers(maneuvers: Maneuver[]) {
    this.maneuvers = maneuvers;
    const windowScale = Automotive.window?.scale ?? 1;
    Automotive.bridge.updateManeuversNavigationSession(
      this.id,
      maneuvers.map(maneuver => {
        if (maneuver.symbolImage) {
          const image = Image.resolveAssetSource(maneuver.symbolImage);
          maneuver.symbolImage = image;
          maneuver.symbolImageSize = maneuver.symbolImageSize ?? { width: 50, height: 50 };
          const width = Math.floor((maneuver.symbolImageSize.width * windowScale) / image.scale);
          const height = Math.floor((maneuver.symbolImageSize.height * windowScale) / image.scale);
          maneuver.symbolImageSize = { width, height };
        }
        if (maneuver.junctionImage) {
          maneuver.junctionImage = Image.resolveAssetSource(maneuver.junctionImage);
        }
        if (maneuver.tintSymbolImage && typeof maneuver.tintSymbolImage === 'string') {
          maneuver.tintSymbolImage = processColor(maneuver.tintSymbolImage);
        }
        return maneuver;
      }),
    );
  }

  public updateTravelEstimates(maneuverIndex: number, travelEstimates: TravelEstimates) {
    if (!travelEstimates.distanceUnits) {
      travelEstimates.distanceUnits = 'kilometers';
    }
    Automotive.bridge.updateTravelEstimatesNavigationSession(this.id, maneuverIndex, travelEstimates);
  }

  public cancel() {
    Automotive.bridge.cancelNavigationSession(this.id);
  }

  public finish() {
    Automotive.bridge.finishNavigationSession(this.id);
  }

  public pause(reason: PauseReason, description?: string) {
    Automotive.bridge.pauseNavigationSession(this.id, reason, description);
  }
}
