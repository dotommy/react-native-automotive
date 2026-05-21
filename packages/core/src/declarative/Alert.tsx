/**
 * Declarative API: `<Alert>` + `<Alert.Action>`.
 *
 * Modal alert presented over the current template. React lifecycle maps
 * to platform modal lifecycle:
 *
 * - Mount (`{condition && <Alert>...}` flipping to true) → `presentTemplate`
 * - Unmount (flipping to false) → `dismissTemplate`
 *
 * @example
 * ```tsx
 * const [showConfirm, setShowConfirm] = useState(false);
 *
 * <Automotive.Root>
 *   <List title="...">...</List>
 *   {showConfirm && (
 *     <Alert title="Cancel trip?">
 *       <Alert.Action title="No" style="cancel" onPress={() => setShowConfirm(false)} />
 *       <Alert.Action title="Yes" style="destructive" onPress={() => {
 *         cancelTrip();
 *         setShowConfirm(false);
 *       }} />
 *     </Alert>
 *   )}
 * </Automotive.Root>
 * ```
 *
 * No need to call `Automotive.dismissTemplate()` manually — React unmount
 * does it for you.
 */

import { createElement } from 'react';
import type { ReactNode } from 'react';

// ─── <Alert> ───────────────────────────────────────────────────────

interface AlertProps {
  /**
   * Alert title. Convenience shorthand for `titleVariants: [title]`.
   */
  title?: string;
  /**
   * Localized title variants, ordered most to least preferred. The
   * system picks the variant that fits the available width.
   */
  titleVariants?: string[];
  /** Must contain `<Alert.Action>` children. */
  children: ReactNode;
}

function AlertImpl(props: AlertProps): React.ReactElement {
  const { children, ...rest } = props;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createElement('alert' as any, rest, children);
}

// ─── <Alert.Action> ────────────────────────────────────────────────

interface AlertActionProps {
  /** Button label. */
  title: string;
  /**
   * Visual style.
   * - `'default'` standard tappable button
   * - `'cancel'` highlighted as the "back out" choice
   * - `'destructive'` red / warning treatment
   */
  style?: 'default' | 'cancel' | 'destructive';
  /** Fired when the action is tapped. Typically calls `setState` to dismiss the alert. */
  onPress?: () => void;
}

function AlertAction(props: AlertActionProps): React.ReactElement {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createElement('alert-action' as any, props);
}

// ─── Namespace export ──────────────────────────────────────────────

/**
 * Declarative AlertTemplate. Place inside `<Automotive.Root>` conditionally —
 * mount presents the alert, unmount dismisses it.
 */
export const Alert = Object.assign(AlertImpl, {
  Action: AlertAction,
});
