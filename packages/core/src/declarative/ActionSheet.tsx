/**
 * Declarative API: `<ActionSheet>` + `<ActionSheet.Action>`.
 *
 * Modal action sheet for choosing among several actions. Same lifecycle
 * as `<Alert>` — mount = `presentTemplate`, unmount = `dismissTemplate`.
 *
 * @example
 * ```tsx
 * const [showShare, setShowShare] = useState(false);
 *
 * <Automotive.Root>
 *   <List title="...">...</List>
 *   {showShare && (
 *     <ActionSheet title="Share location" message="Choose where">
 *       <ActionSheet.Action title="SMS"    onPress={shareSMS} />
 *       <ActionSheet.Action title="Email"  onPress={shareEmail} />
 *       <ActionSheet.Action title="Cancel" style="cancel" onPress={() => setShowShare(false)} />
 *     </ActionSheet>
 *   )}
 * </Automotive.Root>
 * ```
 *
 * Falls back to alert-style presentation on Android Auto (the platform
 * doesn't have a separate action-sheet primitive).
 */

import { createElement } from 'react';
import type { ReactNode } from 'react';

// ─── <ActionSheet> ─────────────────────────────────────────────────

interface ActionSheetProps {
  /** Sheet title. */
  title: string;
  /** Optional secondary message. */
  message?: string;
  /** Must contain `<ActionSheet.Action>` children. */
  children: ReactNode;
}

function ActionSheetImpl(props: ActionSheetProps): React.ReactElement {
  const { children, ...rest } = props;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createElement('action-sheet' as any, rest, children);
}

// ─── <ActionSheet.Action> ──────────────────────────────────────────

interface ActionSheetActionProps {
  /** Button label. */
  title: string;
  /** Visual style. */
  style?: 'default' | 'cancel' | 'destructive';
  /** Fired when the action is tapped. */
  onPress?: () => void;
}

function ActionSheetAction(props: ActionSheetActionProps): React.ReactElement {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createElement('action-sheet-action' as any, props);
}

// ─── Namespace export ──────────────────────────────────────────────

/**
 * Declarative ActionSheetTemplate. Place inside `<Automotive.Root>`
 * conditionally — mount presents the sheet, unmount dismisses it.
 */
export const ActionSheet = Object.assign(ActionSheetImpl, {
  Action: ActionSheetAction,
});
