/**
 * Experimental APIs outside the v1 BRIEF supported surface.
 *
 * Members here are NOT covered by SemVer guarantees — they may change shape,
 * be moved to a companion package, or be removed in a minor version.
 *
 * Two categories of content live here:
 *
 * 1. Templates inherited from `birkir/react-native-carplay` that are not in
 *    the v1 roster (PlaceListMap, PlaceListNavigation, RoutePreview).
 *    May be promoted to stable in a future major version based on community
 *    feedback.
 *
 * 2. iOS-only voice UI primitives (VoiceControlTemplate, VoiceControlState).
 *    Useful only when paired with a custom voice pipeline (Speech framework
 *    or SiriKit). Their natural home is a future companion package such as
 *    `react-native-automotive-sirikit`; until that package ships they live
 *    here as an opt-in entry point.
 *
 * Import via the sub-entry:
 *   import { PlaceListMapTemplate } from 'react-native-automotive/experimental'
 */
export * from './PlaceListMapTemplate';
export * from './PlaceListNavigationTemplate';
export * from './RoutePreviewNavigationTemplate';
export * from './VoiceControlTemplate';
export * from './VoiceControlState';
