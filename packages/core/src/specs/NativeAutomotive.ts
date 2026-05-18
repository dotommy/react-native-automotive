import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

/**
 * Turbo Module spec for react-native-automotive.
 *
 * Codegen generates C++/Objective-C++/Java glue from this file at app build
 * time. Implementations live in Swift (iOS, Step 4) and Kotlin (Android, Step 5).
 *
 * Type constraints:
 * - Primitives: boolean, string, number
 * - Promise<T> for async returns
 * - Object for complex configs (translated to NSDictionary / ReadableMap)
 * - No `unknown`, `any`, generic types, optional params, or union types
 *
 * Naming and routing:
 * - Module name registered as "Automotive"
 * - JS consumers obtain the module via this default export
 *
 * Coexistence note (transitional):
 * - The legacy InternalCarPlay interface in CarPlay.ts remains during the
 *   Old/New Architecture transition. Step 4/5 will swap consumers to this spec.
 */
export interface Spec extends TurboModule {
  // ─── Connection lifecycle ────────────────────────────────────────────────
  checkForConnection(): void;

  // ─── Template lifecycle ──────────────────────────────────────────────────
  createTemplate(id: string, config: Object): Promise<void>;
  updateTemplate(id: string, config: Object): void;
  invalidate(id: string): void;

  // ─── Navigation stack ────────────────────────────────────────────────────
  setRootTemplate(templateId: string, animated: boolean): void;
  pushTemplate(templateId: string, animated: boolean): void;
  popTemplate(animated: boolean): void;
  popToTemplate(templateId: string, animated: boolean): void;
  popToRootTemplate(animated: boolean): void;
  presentTemplate(templateId: string, animated: boolean): void;
  dismissTemplate(animated: boolean): void;

  // ─── List template ───────────────────────────────────────────────────────
  updateListTemplateSections(id: string, sections: Object): void;
  updateListTemplateItem(id: string, item: Object): void;
  reactToSelectedResult(status: boolean): void;
  getMaximumListSectionCount(id: string): Promise<number>;
  getMaximumListItemCount(id: string): Promise<number>;
  getMaximumListItemImageSize(id: string): Promise<Object>;
  getMaximumNumberOfGridImages(id: string): Promise<number>;
  getMaximumListImageRowItemImageSize(id: string): Promise<Object>;

  // ─── Tab template (CarPlay tab bar + Android tabs) ───────────────────────
  updateTabBarTemplates(id: string, templates: Object): void;

  // ─── Information template (iOS) ──────────────────────────────────────────
  updateInformationTemplateItems(id: string, items: Object): void;
  updateInformationTemplateActions(id: string, actions: Object): void;

  // ─── Map template ────────────────────────────────────────────────────────
  updateMapTemplateConfig(id: string, config: Object): void;
  updateMapTemplateMapButtons(id: string, buttons: Object): void;
  showTripPreviews(id: string, previews: string[], config: Object): void;
  hideTripPreviews(id: string): void;
  showRouteChoicesPreviewForTrip(id: string, tripId: string, config: Object): void;
  presentNavigationAlert(id: string, config: Object, animated: boolean): void;
  dismissNavigationAlert(id: string, animated: boolean): void;
  showPanningInterface(id: string, animated: boolean): void;
  dismissPanningInterface(id: string, animated: boolean): void;

  // ─── Navigation session / trip (iOS) ─────────────────────────────────────
  createTrip(id: string, config: Object): void;
  startNavigationSession(id: string, tripId: string): Promise<Object>;
  updateManeuversNavigationSession(id: string, maneuvers: Object): void;
  updateTravelEstimatesNavigationSession(
    id: string,
    index: number,
    estimates: Object,
  ): void;
  updateTravelEstimatesForTrip(
    id: string,
    tripId: string,
    estimates: Object,
    timeRemainingColor: number,
  ): void;
  cancelNavigationSession(id: string): void;
  finishNavigationSession(id: string): void;
  pauseNavigationSession(id: string, reason: number, description: string): void;

  // ─── Search template ─────────────────────────────────────────────────────
  reactToUpdatedSearchText(id: string, items: Object): void;

  // ─── Now Playing template (iOS) ──────────────────────────────────────────
  enableNowPlaying(enabled: boolean): void;

  // ─── Voice Control template (iOS) ────────────────────────────────────────
  activateVoiceControlState(id: string, identifier: string): void;

  // ─── Android utilities ───────────────────────────────────────────────────
  reload(): void;
  toast(message: string, duration: number): void;
  alert(config: Object): void;

  // ─── Event emitter (required by codegen) ─────────────────────────────────
  addListener(eventType: string): void;
  removeListeners(count: number): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('Automotive');
