import {
  ImageSourcePropType,
  NativeEventEmitter,
  NativeModule,
  NativeModules,
  Platform,
} from 'react-native';
import { Action } from './interfaces/Action';
import { Maneuver } from './interfaces/Maneuver';
import { PauseReason } from './interfaces/PauseReason';
import { TextConfiguration } from './interfaces/TextConfiguration';
import { TimeRemainingColor } from './interfaces/TimeRemainingColor';
import { TravelEstimates } from './interfaces/TravelEstimates';
import { TripConfig } from './navigation/Trip';
import { ActionSheetTemplate } from './templates/ActionSheetTemplate';
import { AlertTemplate } from './templates/AlertTemplate';
import { ContactTemplate } from './templates/ContactTemplate';
import { GridTemplate } from './templates/GridTemplate';
import { InformationTemplate } from './templates/InformationTemplate';
import { ListTemplate } from './templates/ListTemplate';
import { MapTemplate } from './templates/MapTemplate';
import { NowPlayingTemplate } from './templates/NowPlayingTemplate';
import { PointOfInterestTemplate } from './templates/PointOfInterestTemplate';
import { SearchTemplate } from './templates/SearchTemplate';
import { TabBarTemplate } from './templates/TabBarTemplate';
import { VoiceControlTemplate } from './experimental/VoiceControlTemplate';
import { MessageTemplate } from './templates/android/MessageTemplate';
import { NavigationTemplate } from './templates/android/NavigationTemplate';
import { PaneTemplate } from './templates/android/PaneTemplate';
import { SignInTemplate } from './templates/android/SignInTemplate';
import { TabTemplate } from './templates/android/TabTemplate';
import { PlaceListMapTemplate } from './experimental/PlaceListMapTemplate';
import { PlaceListNavigationTemplate } from './experimental/PlaceListNavigationTemplate';
import { RoutePreviewNavigationTemplate } from './experimental/RoutePreviewNavigationTemplate';

export interface InternalAutomotive extends NativeModule {
  checkForConnection(): void;
  setRootTemplate(templateId: string, animated: boolean): void;
  pushTemplate(templateId: string, animated: boolean): void;
  popToTemplate(templateId: string, animated: boolean): void;
  popToRootTemplate(animated: boolean): void;
  popTemplate(animated: boolean): void;
  presentTemplate(templateId: string, animated: boolean): void;
  dismissTemplate(animated: boolean): void;
  enableNowPlaying(enabled: boolean): void;
  updateManeuversNavigationSession(id: string, x: Maneuver[]): void;
  updateTravelEstimatesNavigationSession(
    id: string,
    index: number,
    estimates: TravelEstimates,
  ): void;
  cancelNavigationSession(id: string): void;
  finishNavigationSession(id: string): void;
  pauseNavigationSession(id: string, reason: PauseReason, description?: string): void;
  createTrip(id: string, config: TripConfig): void;
  updateInformationTemplateItems(id: string, config: unknown): void;
  updateInformationTemplateActions(id: string, config: unknown): void;
  createTemplate(id: string, config: unknown, callback?: unknown): void;
  updateTemplate(id: string, config: unknown): void;
  invalidate(id: string): void;
  startNavigationSession(
    id: string,
    tripId: string,
  ): Promise<{
    tripId: string;
    navigationSessionId: string;
  }>;
  updateTravelEstimatesForTrip(
    id: string,
    tripId: string,
    travelEstimates: TravelEstimates,
    timeRemainingColor: TimeRemainingColor,
  ): void;
  updateMapTemplateConfig(id: string, config: unknown): void;
  updateMapTemplateMapButtons(id: string, config: unknown): void;
  hideTripPreviews(id: string): void;
  showTripPreviews(id: string, previews: string[], config: TextConfiguration): void;
  showRouteChoicesPreviewForTrip(id: string, tripId: string, config: TextConfiguration): void;
  presentNavigationAlert(id: string, config: unknown, animated: boolean): void;
  dismissNavigationAlert(id: string, animated: boolean): void;
  showPanningInterface(id: string, animated: boolean): void;
  dismissPanningInterface(id: string, animated: boolean): void;
  getMaximumListSectionCount(id: string): Promise<number>;
  getMaximumListItemCount(id: string): Promise<number>;
  getMaximumListItemImageSize(id: string): Promise<ImageSize>;
  getMaximumNumberOfGridImages(id: string): Promise<number>;
  getMaximumListImageRowItemImageSize(id: string): Promise<ImageSize>;
  reactToSelectedResult(status: boolean): void;
  updateListTemplateSections(id: string, config: unknown): void;
  updateListTemplateItem(id: string, config: unknown): void;
  reactToUpdatedSearchText(id: string, items: unknown): void;
  updateTabBarTemplates(id: string, config: unknown): void;
  activateVoiceControlState(id: string, identifier: string): void;
  // Android
  reload(): void;
  toast(message: string, duration: number): void;
  alert(config: {
    id: number;
    title: string;
    duration: number;
    subtitle?: string;
    icon?: ImageSourcePropType;
    actions?: Action[];
  }): void;
}

const { RNCarPlay } = NativeModules as { RNCarPlay: InternalAutomotive };

export type PushableTemplates =
  | MapTemplate
  | SearchTemplate
  | GridTemplate
  | PointOfInterestTemplate
  | ListTemplate
  | MessageTemplate
  | PaneTemplate
  | InformationTemplate
  | ContactTemplate
  | NowPlayingTemplate
  | NavigationTemplate
  | SignInTemplate
  | PlaceListMapTemplate
  | PlaceListNavigationTemplate
  | RoutePreviewNavigationTemplate;

export type PresentableTemplates = AlertTemplate | ActionSheetTemplate | VoiceControlTemplate;

export type RootOnlyTemplates = TabBarTemplate | TabTemplate;

export type WindowInformation = {
  width: number;
  height: number;
  scale: number;
};

export type ImageSize = {
  width: number;
  height: number;
};

export type OnConnectCallback = (window: WindowInformation) => void;
export type OnDisconnectCallback = () => void;

/**
 * Singleton controller for the car interface (CarPlay on iOS, Android Auto on
 * Android). Manages template navigation, connection lifecycle, and the bridge
 * to the native module.
 */
export class AutomotiveInterface {
  /**
   * React Native bridge to the native automotive module.
   */
  public bridge = RNCarPlay;

  /**
   * Whether the device is currently connected to a car head unit.
   */
  public connected = false;
  public window: WindowInformation | undefined;

  /**
   * Event emitter bridged to the native automotive module.
   */
  public emitter = new NativeEventEmitter(RNCarPlay);

  private onConnectCallbacks = new Set<OnConnectCallback>();
  private onDisconnectCallbacks = new Set<OnDisconnectCallback>();

  constructor() {
    this.emitter.addListener('didConnect', (window: WindowInformation) => {
      this.connected = true;
      this.window = window;
      this.onConnectCallbacks.forEach(callback => {
        callback(window);
      });
    });
    this.emitter.addListener('didDisconnect', () => {
      this.connected = false;
      this.window = undefined;
      this.onDisconnectCallbacks.forEach(callback => {
        callback();
      });
    });
    if (Platform.OS === 'android') {
      this.emitter.addListener('didPressMenuItem', e => {
        if (e?.title === 'Reload Android Auto') {
          this.bridge.reload();
        }
      });
    }

    // check if already connected this will fire any 'didConnect' events
    // if a connected is already present.
    this.bridge.checkForConnection();
  }

  /**
   * Fired when the car head unit (CarPlay or Android Auto) connects.
   */
  public registerOnConnect = (callback: OnConnectCallback) => {
    this.onConnectCallbacks.add(callback);
  };

  public unregisterOnConnect = (callback: OnConnectCallback) => {
    this.onConnectCallbacks.delete(callback);
  };

  /**
   * Fired when the car head unit (CarPlay or Android Auto) disconnects.
   */
  public registerOnDisconnect = (callback: OnDisconnectCallback) => {
    this.onDisconnectCallbacks.add(callback);
  };

  public unregisterOnDisconnect = (callback: OnDisconnectCallback) => {
    this.onDisconnectCallbacks.delete(callback);
  };

  /**
   * Sets the root template, starting a new stack for the template navigation hierarchy.
   * @param rootTemplate The root template. Replaces the current rootTemplate, if one exists.
   * @param animated Set TRUE to animate the presentation of the root template; ignored if there isn't a current rootTemplate.
   */
  public setRootTemplate(rootTemplate: PushableTemplates | RootOnlyTemplates, animated = true) {
    return this.bridge.setRootTemplate(rootTemplate.id, animated);
  }

  /**
   * Pushes a template onto the navigation stack and updates the display.
   * @param templateToPush The template to push onto the navigation stack.
   * @param animated Set TRUE to animate the presentation of the template.
   */
  public pushTemplate(templateToPush: PushableTemplates, animated = true) {
    return this.bridge.pushTemplate(templateToPush.id, animated);
  }

  /**
   * Pops templates until the specified template is at the top of the navigation stack.
   * @param targetTemplate The template that you want at the top of the stack. The template must be on the navigation stack before calling this method.
   * @param animated A Boolean value that indicates whether the system animates the display of transitioning templates.
   */
  public popToTemplate(targetTemplate: PushableTemplates, animated = true) {
    return this.bridge.popToTemplate(targetTemplate.id, animated);
  }

  /**
   * Pops all templates on the stack—except the root template—and updates the display.
   * @param animated A Boolean value that indicates whether the system animates the display of transitioning templates.
   */
  public popToRootTemplate(animated = true) {
    return this.bridge.popToRootTemplate(animated);
  }

  /**
   * Pops the top template from the navigation stack and updates the display.
   * @param animated A Boolean value that indicates whether the system animates the display of transitioning templates.
   */
  public popTemplate(animated = true) {
    return this.bridge.popTemplate(animated);
  }

  /**
   * presents a presentable template, alert / action / voice
   * @param templateToPresent The presentable template to present
   * @param animated A Boolean value that indicates whether the system animates the display of transitioning templates.
   */
  public presentTemplate(templateToPresent: PresentableTemplates, animated = true) {
    return this.bridge.presentTemplate(templateToPresent.id, animated);
  }

  /**
   * Dismisses the current presented template
   * * @param animated A Boolean value that indicates whether the system animates the display of transitioning templates.
   */
  public dismissTemplate(animated = true) {
    return this.bridge.dismissTemplate(animated);
  }

  /**
   * The current root template in the template navigation hierarchy.
   * @todo Not implemented yet
   */
  public get rootTemplate(): Promise<string> {
    return Promise.resolve('');
  }

  /**
   * The top-most template in the navigation hierarchy stack.
   * @todo Not implemented yet
   */
  public get topTemplate(): Promise<string> {
    return Promise.resolve('');
  }

  /**
   * Control now playing template state
   * @param enable A Boolean value that indicates whether the system use now playing template.
   */
  public enableNowPlaying(enable = true) {
    return this.bridge.enableNowPlaying(enable);
  }
}

export const Automotive = new AutomotiveInterface();
