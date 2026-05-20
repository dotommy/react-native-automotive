import { Automotive } from '../Automotive';

export interface RouteChoice {
  additionalInformationVariants: string[];
  selectionSummaryVariants: string[];
  summaryVariants: string[];
}

export interface TripPoint {
  latitude: number;
  longitude: number;
  name: string;
}

export interface TripConfig {
  id?: string;
  origin: TripPoint;
  destination: TripPoint;
  routeChoices: RouteChoice[];
}

export class Trip {
  public id!: string;

  constructor(public config: TripConfig) {
    if (config.id) {
      this.id = config.id;
    }

    if (!this.id) {
      this.id = `trip-${Date.now()}-${Math.round(Math.random() * Number.MAX_SAFE_INTEGER)}`;
    }

    Automotive.bridge.createTrip(this.id, config);
  }
}
