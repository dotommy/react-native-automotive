import { Action, HeaderAction } from '../../interfaces/Action';
import { Template, TemplateConfig } from '../Template';

/**
 * Sign-in via PIN code shown on the car display.
 * User reads the PIN and enters it on a companion app/web page.
 */
export interface PinSignInMethod {
  type: 'pin';
  /**
   * The PIN code (or other short string) displayed to the user.
   * Android Auto recommends 8 characters max.
   */
  pin: string;
}

/**
 * Sign-in via on-screen text input.
 * Restricted by Android Auto to parked state for safety.
 */
export interface InputSignInMethod {
  type: 'input';
  /** Placeholder hint shown in the empty input field. */
  hint?: string;
  /** Optional error message shown below the input. */
  errorMessage?: string;
  /** Pre-filled value. */
  defaultValue?: string;
  /** Whether to mask the input (e.g. for passwords). */
  inputType?: 'default' | 'password';
  /** Hint for the on-screen keyboard layout. */
  keyboardType?: 'default' | 'email' | 'phone' | 'number';
  /** Fired when the user submits the input. */
  onInputSubmitted?(value: string): void;
  /** Fired on every keystroke. */
  onInputTextChanged?(value: string): void;
}

/**
 * Sign-in via OAuth/SSO provider button (Google, Apple, Facebook, etc.).
 */
export interface ProviderSignInMethod {
  type: 'provider';
  /**
   * The provider button to display.
   * The action's title should identify the provider (e.g. "Continue with Google").
   */
  action: Action;
}

/**
 * Sign-in via QR code displayed on the car screen.
 * User scans the QR with their phone to complete authentication.
 */
export interface QRCodeSignInMethod {
  type: 'qrcode';
  /** The URL or payload encoded in the QR code. */
  url: string;
}

export type SignInMethod =
  | PinSignInMethod
  | InputSignInMethod
  | ProviderSignInMethod
  | QRCodeSignInMethod;

export interface SignInTemplateConfig extends TemplateConfig {
  /**
   * The sign-in method to display.
   * Required. Determines which UI is rendered.
   */
  signInMethod: SignInMethod;
  /** Template title (e.g. "Sign in to MyApp"). */
  title?: string;
  /** Instructional text shown above the sign-in method. */
  instructions?: string;
  /** Secondary text shown below the sign-in method (e.g. terms link). */
  additionalText?: string;
  /**
   * When true, hides the sign-in method and shows a loading indicator.
   * Useful while validating credentials.
   */
  loading?: boolean;
  /** Header action (app icon or back button). */
  headerAction?: HeaderAction;
  /** Up to 2 actions shown in the action strip. */
  actions?: Action[];
}

/**
 * Android Auto template for user authentication flows.
 *
 * Required for any account-based app on Android Auto (music streaming,
 * navigation with sync, EV charging, parking, etc.).
 *
 * CarPlay has no direct equivalent: on iOS, apps typically detect the
 * unauthenticated state and display an {@link AlertTemplate} directing
 * the user to authenticate on iPhone instead.
 *
 * @see https://developer.android.com/reference/androidx/car/app/model/signin/SignInTemplate
 * @namespace Android
 */
export class SignInTemplate extends Template<SignInTemplateConfig> {
  public get type(): string {
    return 'sign-in';
  }
}
