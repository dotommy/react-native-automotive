/**
 * Declarative API: `<List>`, `<List.Section>`, `<List.Item>`.
 *
 * These are thin React component wrappers around the reconciler's host
 * element types. Each component renders a single host element with a
 * known string `type` ('list', 'list-section', 'list-item') that the
 * reconciler's `createInstance` picks up.
 *
 * The components themselves don't do anything — the work happens in
 * `commit.ts` when the reconciler walks the committed tree.
 *
 * @example
 * ```tsx
 * <Automotive.Root>
 *   <List title="Menu">
 *     <List.Section header="Pizzas">
 *       <List.Item text="Margherita" onPress={() => order('margherita')} />
 *       <List.Item text="Diavola" detailText="spicy" onPress={...} />
 *     </List.Section>
 *   </List>
 * </Automotive.Root>
 * ```
 */

import { createElement } from 'react';
import type { ReactNode } from 'react';
import type { ListItem as ListItemType } from '../interfaces/ListItem';
import type { Action } from '../interfaces/Action';

// ─── <List> ────────────────────────────────────────────────────────

interface ListProps {
  /** Title displayed in the navigation bar. */
  title?: string;
  /** Show a loading spinner instead of the list content. @namespace Android */
  loading?: boolean;
  /** Header action (back / appIcon). @namespace Android */
  headerAction?: Action<'appIcon' | 'back'>;
  /** Empty-state titles, ordered most-to-least preferred. @namespace iOS */
  emptyViewTitleVariants?: string[];
  /** Empty-state subtitles, ordered most-to-least preferred. @namespace iOS */
  emptyViewSubtitleVariants?: string[];
  /** Hide the back button. */
  backButtonHidden?: boolean;
  /** Fired when the back button is pressed. */
  onBackButtonPressed?: () => void;
  /** Must contain `<List.Section>` children. */
  children: ReactNode;
}

function ListImpl(props: ListProps): React.ReactElement {
  const { children, ...rest } = props;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createElement('list' as any, rest, children);
}

// ─── <List.Section> ────────────────────────────────────────────────

interface ListSectionProps {
  /** Section header text (shown above the items). */
  header: string;
  /** Must contain `<List.Item>` children. */
  children: ReactNode;
}

function ListSection(props: ListSectionProps): React.ReactElement {
  const { children, ...rest } = props;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createElement('list-section' as any, rest, children);
}

// ─── <List.Item> ───────────────────────────────────────────────────

/**
 * Mirrors {@link ListItemType} from the imperative API, plus an
 * `onPress` handler that fires when the item is tapped. (The imperative
 * API uses a single `onItemSelect({index})` on the template — declarative
 * users get per-item handlers, the reconciler routes the index back.)
 */
interface ListItemProps extends Omit<ListItemType, 'id'> {
  /** Fired when the item is tapped on the car display. */
  onPress?: () => void;
}

function ListItem(props: ListItemProps): React.ReactElement {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createElement('list-item' as any, props);
}

// ─── Namespace export ──────────────────────────────────────────────

/**
 * Declarative ListTemplate. Used as a top-level child of
 * `<Automotive.Root>`. Renders the car-side list and routes per-item
 * `onPress` handlers back to JS.
 */
export const List = Object.assign(ListImpl, {
  Section: ListSection,
  Item: ListItem,
});
