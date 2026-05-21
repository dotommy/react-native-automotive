/**
 * `react-reconciler` host config for the declarative API.
 *
 * Design overview:
 * - JSX elements like `<List>` / `<List.Item>` are host elements with
 *   string `type` ('list', 'list-item', ...). React calls our
 *   `createInstance(type, props)` for each; we return an `AutomotiveNode`.
 * - The reconciler maintains a shadow tree. On every commit it calls
 *   `appendChild` / `removeChild` / `commitUpdate` for the structural
 *   changes since the last commit.
 * - We translate the committed tree into imperative `Automotive.*` calls
 *   inside `resetAfterCommit`. That keeps the reconciler concerns
 *   (tree management) separate from the platform concerns (template
 *   instance lifecycle + rate-limited updates).
 *
 * This file ships the host-config skeleton + the public `render()` entry
 * point used by `<Automotive.Root>`. The per-template translation logic
 * (`commitTree`) lives in `commit.ts` — added as templates land in
 * chunks 2-4.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
import ReactReconciler from 'react-reconciler';
import { DefaultEventPriority } from 'react-reconciler/constants';
import { commitTree, onRemoveTopLevel } from './commit';
import type { AutomotiveContainer, AutomotiveNode, AutomotiveNodeType } from './types';

let nodeIdCounter = 0;
const nextId = (type: AutomotiveNodeType) => `${type}-${++nodeIdCounter}`;

/**
 * Reconciler instance. Created once at module load — the host config is
 * stateless, so a single reconciler can drive any number of containers.
 *
 * The host config is typed as `any` because the installed `react-reconciler@0.31`
 * (React 19 API) ships several methods that the bundled `@types/react-reconciler@0.28`
 * doesn't know about yet (HostTransitionContext, NotPendingTransition,
 * maySuspendCommit, resolveEventType, etc.). The runtime accepts them
 * fine — the cast just suppresses the TS noise. The rest of this module
 * stays type-safe via the AutomotiveContainer / AutomotiveNode types.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const reconciler = (ReactReconciler as any)({
  supportsMutation: true,
  supportsPersistence: false,
  supportsHydration: false,
  isPrimaryRenderer: true,

  // Timeout primitives — defer to host environment's setTimeout.
  scheduleTimeout: setTimeout,
  cancelTimeout: clearTimeout,
  noTimeout: -1,

  // Host context: we don't need any per-subtree context for now.
  getRootHostContext: () => ({}),
  getChildHostContext: () => ({}),

  // ─── Instance lifecycle ──────────────────────────────────────────

  createInstance(type: AutomotiveNodeType, props: Record<string, unknown>): AutomotiveNode {
    return {
      type,
      props,
      children: [],
      id: nextId(type),
    };
  },

  // We reject raw string children. The components expect typed props
  // (text="..." on <List.Item>, not <Text>{"..."}</Text> children).
  createTextInstance() {
    throw new Error(
      '[react-native-automotive] String children are not supported inside ' +
        '<Automotive.Root>. Pass text via `text=`, `title=`, `header=` props ' +
        'on the typed components instead.',
    );
  },

  appendInitialChild(parent: AutomotiveNode, child: AutomotiveNode) {
    parent.children.push(child);
  },

  finalizeInitialChildren: () => false,

  shouldSetTextContent: () => false,

  // ─── Mutation: container (root) ──────────────────────────────────

  appendChildToContainer(container: AutomotiveContainer, child: AutomotiveNode) {
    container.children.push(child);
  },

  removeChildFromContainer(container: AutomotiveContainer, child: AutomotiveNode) {
    const i = container.children.indexOf(child);
    if (i !== -1) container.children.splice(i, 1);
    onRemoveTopLevel(child);
  },

  insertInContainerBefore(
    container: AutomotiveContainer,
    child: AutomotiveNode,
    before: AutomotiveNode,
  ) {
    const i = container.children.indexOf(before);
    if (i === -1) container.children.push(child);
    else container.children.splice(i, 0, child);
  },

  // ─── Mutation: regular nodes ─────────────────────────────────────

  appendChild(parent: AutomotiveNode, child: AutomotiveNode) {
    parent.children.push(child);
  },

  removeChild(parent: AutomotiveNode, child: AutomotiveNode) {
    const i = parent.children.indexOf(child);
    if (i !== -1) parent.children.splice(i, 1);
  },

  insertBefore(parent: AutomotiveNode, child: AutomotiveNode, before: AutomotiveNode) {
    const i = parent.children.indexOf(before);
    if (i === -1) parent.children.push(child);
    else parent.children.splice(i, 0, child);
  },

  // ─── Updates ─────────────────────────────────────────────────────

  // For our case, we always re-translate the tree on commit, so we
  // don't need a sophisticated diff payload here. Just stash the new
  // props on the node; the post-commit walker reads them.
  commitUpdate(
    instance: AutomotiveNode,
    _type: AutomotiveNodeType,
    _oldProps: Record<string, unknown>,
    newProps: Record<string, unknown>,
  ) {
    instance.props = newProps;
  },

  // ─── Commit hooks ────────────────────────────────────────────────

  prepareForCommit: () => null,

  resetAfterCommit(container: AutomotiveContainer) {
    commitTree(container);
  },

  // ─── Refs ────────────────────────────────────────────────────────

  getPublicInstance: (instance: AutomotiveNode) => instance,

  // ─── Misc ────────────────────────────────────────────────────────

  preparePortalMount: () => {},

  detachDeletedInstance: () => {},

  getCurrentEventPriority: () => DefaultEventPriority,

  // Microtasks scheduling — use queueMicrotask if available, otherwise
  // a synchronous fallback. React 19 uses this for async transitions.
  supportsMicrotasks: typeof queueMicrotask === 'function',
  scheduleMicrotask:
    typeof queueMicrotask === 'function' ? queueMicrotask : (cb: () => void) => cb(),

  // Form / DOM-specific stubs — not applicable to our renderer.
  clearContainer: (container: AutomotiveContainer) => {
    container.children = [];
  },

  // React 19 additions
  maySuspendCommit: () => false,
  preloadInstance: () => true,
  startSuspendingCommit: () => {},
  suspendInstance: () => {},
  waitForCommitToBeReady: () => null,

  NotPendingTransition: null,
  HostTransitionContext: {
    $$typeof: Symbol.for('react.context'),
    Consumer: null,
    Provider: null,
    _currentValue: null,
    _currentValue2: null,
    _threadCount: 0,
    _defaultValue: null,
    _globalName: null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any,

  resetFormInstance: () => {},
  requestPostPaintCallback: () => {},
  shouldAttemptEagerTransition: () => false,
  trackSchedulerEvent: () => {},
  resolveEventType: () => null,
  resolveEventTimeStamp: () => -1.1,
});

// ─── Public API ────────────────────────────────────────────────────

/**
 * Create a new container suitable for `reconciler.createContainer`.
 * Each `<Automotive.Root>` instance gets its own container.
 */
export function createContainer(): AutomotiveContainer {
  return { children: [], isContainer: true };
}

/**
 * Mount or update a React tree into the given container. Called on
 * every render of `<Automotive.Root>`.
 */
export function render(element: React.ReactNode, container: AutomotiveContainer): void {
  let root = containerToRoot.get(container);
  if (!root) {
    root = reconciler.createContainer(
      container,
      /* tag */ 1, // ConcurrentRoot
      /* hydrationCallbacks */ null,
      /* isStrictMode */ false,
      /* concurrentUpdatesByDefaultOverride */ null,
      /* identifierPrefix */ '',
      /* onUncaughtError */ (err: unknown) => {
        // eslint-disable-next-line no-console
        console.error('[automotive] uncaught render error:', err);
      },
      /* onCaughtError */ () => {},
      /* onRecoverableError */ () => {},
      /* transitionCallbacks */ null,
    );
    containerToRoot.set(container, root);
  }
  reconciler.updateContainer(element, root, null, null);
}

/**
 * Unmount the tree mounted into a container. Called when `<Automotive.Root>`
 * unmounts.
 */
export function unmount(container: AutomotiveContainer): void {
  const root = containerToRoot.get(container);
  if (root) {
    reconciler.updateContainer(null, root, null, null);
    containerToRoot.delete(container);
  }
}

// One reconciler root per container instance.
const containerToRoot = new WeakMap<AutomotiveContainer, ReturnType<typeof reconciler.createContainer>>();
