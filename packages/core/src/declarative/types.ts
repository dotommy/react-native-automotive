/**
 * Internal node types for the declarative reconciler.
 *
 * Each `<List>`, `<List.Section>`, etc. JSX element creates one node in
 * the shadow tree maintained by `react-reconciler`. On every commit the
 * tree is walked and translated into imperative `Automotive.*` calls.
 *
 * These types are NOT part of the public API — consumers interact with
 * the React components in `List.tsx`, `Grid.tsx`, etc. only.
 */

/**
 * Discriminated union of every host element type the reconciler knows
 * about. The string literals are also the `type` arg passed to the host
 * config's `createInstance(type, props, ...)`.
 */
export type AutomotiveNodeType =
  | 'list'
  | 'list-section'
  | 'list-item'
  | 'grid'
  | 'grid-button'
  | 'alert'
  | 'alert-action'
  | 'action-sheet'
  | 'action-sheet-action';

/**
 * Mutable node held by the reconciler. Each node carries:
 * - its `type` (discriminator)
 * - its current `props` (latest committed)
 * - its `children` (ordered)
 * - a stable `id` used to correlate with the native template instance
 *   once the tree is translated into imperative calls
 *
 * The reconciler maintains this tree via host-config methods
 * (`appendChild`, `removeChild`, `commitUpdate`, etc.).
 */
export interface AutomotiveNode {
  type: AutomotiveNodeType;
  // Props are deliberately loose at the reconciler level — each component
  // file (List.tsx, Grid.tsx, etc.) narrows its own prop shape via React
  // type inference at the JSX call site.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: Record<string, any>;
  children: AutomotiveNode[];
  /** Stable id; auto-generated on createInstance. */
  id: string;
  /**
   * Set after the node has been translated into an imperative template
   * instance (so subsequent commits can update vs recreate). Only set
   * for top-level template nodes (list / grid / alert / action-sheet).
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  templateInstance?: any;
}

/**
 * The root container handed to `reconciler.createContainer`. Holds the
 * top-level children — one per template the user mounts via JSX.
 */
export interface AutomotiveContainer {
  children: AutomotiveNode[];
  /**
   * Marker so the reconciler can distinguish the container from a
   * regular node in `appendChildToContainer` etc.
   */
  isContainer: true;
}
