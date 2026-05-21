/**
 * Declarative API: `<Grid>` + `<Grid.Button>`.
 *
 * Wraps {@link GridTemplate} from the imperative API.
 *
 * @example
 * ```tsx
 * <Automotive.Root>
 *   <Grid title="Audio sources">
 *     <Grid.Button title="Spotify" image={spotifyIcon} onPress={() => switchTo('spotify')} />
 *     <Grid.Button title="Radio" image={radioIcon} onPress={() => switchTo('radio')} />
 *   </Grid>
 * </Automotive.Root>
 * ```
 *
 * Platform caps: CarPlay shows up to 8 buttons, Android Auto up to 6.
 * Excess buttons are silently dropped by the platform.
 */

import { createElement } from 'react';
import type { ReactNode } from 'react';
import type { ImageSourcePropType } from 'react-native';

// ─── <Grid> ────────────────────────────────────────────────────────

interface GridProps {
  /** Title displayed in the navigation bar. */
  title?: string;
  /** Hide the back button. */
  backButtonHidden?: boolean;
  /** Fired when the back button is pressed. */
  onBackButtonPressed?: () => void;
  /** Must contain `<Grid.Button>` children. */
  children: ReactNode;
}

function GridImpl(props: GridProps): React.ReactElement {
  const { children, ...rest } = props;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createElement('grid' as any, rest, children);
}

// ─── <Grid.Button> ─────────────────────────────────────────────────

interface GridButtonProps {
  /**
   * Button title. Convenience shorthand for `titleVariants: [title]`.
   * Use `titleVariants` if you want the system to pick between multiple
   * localized variants based on available space.
   */
  title?: string;
  /**
   * Localized title variants, ordered from most to least preferred. The
   * system picks the variant that best fits the available space.
   */
  titleVariants?: string[];
  /**
   * Button icon. `require('./asset.png')` or `{ uri: '...' }`.
   */
  image: ImageSourcePropType;
  /** Whether the button is greyed-out and non-tappable. */
  disabled?: boolean;
  /** Fired when the button is tapped on the car display. */
  onPress?: () => void;
}

function GridButton(props: GridButtonProps): React.ReactElement {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createElement('grid-button' as any, props);
}

// ─── Namespace export ──────────────────────────────────────────────

/**
 * Declarative GridTemplate. Top-level child of `<Automotive.Root>`.
 * Routes per-button `onPress` handlers via the reconciler's commit step.
 */
export const Grid = Object.assign(GridImpl, {
  Button: GridButton,
});
