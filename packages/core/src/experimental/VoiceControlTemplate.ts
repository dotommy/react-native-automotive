import { CarPlay } from '../CarPlay';
import { VoiceControlState } from './VoiceControlState';
import { Template } from '../templates/Template';

export interface VoiceControlTemplateConfig {
  /**
   * The array of voice control states that can be used by your voice control template.
   */
  voiceControlStates: VoiceControlState[];
}

/**
 * Displays a voice control indicator on the CarPlay screen.
 *
 * CarPlay navigation apps must show the voice control template during audio input.
 *
 * @experimental Not part of the BRIEF v1 supported template roster. The API may
 * change without a major version bump until promoted to stable. Inherited from
 * `birkir/react-native-carplay`; retained because Apple effectively requires it
 * for navigation apps with voice prompts.
 *
 * @namespace iOS
 */
export class VoiceControlTemplate extends Template<VoiceControlTemplateConfig> {
  public get type(): string {
    return 'voicecontrol';
  }

  public activateVoiceControlState(identifier: string) {
    CarPlay.bridge.activateVoiceControlState(this.id, identifier);
  }
}
