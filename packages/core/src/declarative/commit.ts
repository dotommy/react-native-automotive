/**
 * Translates the reconciler's shadow tree (AutomotiveNode) into imperative
 * `Automotive.*` calls.
 *
 * Called from `reconciler.resetAfterCommit` on every committed React
 * render. The function walks the container's top-level children and:
 *
 * - First commit for a node: instantiates the native template + handler
 *   bookkeeping, mounts via `setRootTemplate` (root) or `presentTemplate`
 *   (modals — chunk 4).
 * - Subsequent commits: surgically updates the existing template instance
 *   (e.g. `listTemplate.updateSections(...)`) and re-binds handlers.
 * - Removed nodes: dispose handlers (template instances on the native
 *   side are kept alive by the navigation stack until `popTemplate`).
 *
 * Circular-import note: this module is consumed by `reconciler.ts` which
 * is in turn consumed by `Automotive.ts` (via `declarative/index.ts`).
 * To avoid an init-order cycle we lazy-require the `Automotive` singleton
 * the first time we need it — by the time `commit` runs all modules are
 * fully loaded.
 */

import type { ListSection } from '../interfaces/ListSection';
import type { ListItem } from '../interfaces/ListItem';
import type { GridButton } from '../interfaces/GridButton';
import type { AlertAction } from '../interfaces/AlertAction';
import { ListTemplate } from '../templates/ListTemplate';
import { GridTemplate } from '../templates/GridTemplate';
import { AlertTemplate } from '../templates/AlertTemplate';
import { ActionSheetTemplate } from '../templates/ActionSheetTemplate';
import type { AutomotiveContainer, AutomotiveNode } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedAutomotive: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getAutomotive(): any {
  if (!cachedAutomotive) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cachedAutomotive = require('../Automotive').Automotive;
  }
  return cachedAutomotive;
}

/**
 * Per-template handler bookkeeping. Each list/grid/alert template
 * instance keeps a flat array of click handlers indexed by item order
 * (sections walked in JSX order, items inside each section likewise).
 * The native side gives us `{ index }` on item-select events — we use
 * it to look up the handler.
 *
 * Maps `templateInstance.id` → array of handlers (or undefined slots
 * for items without `onPress`).
 */
const handlerRegistry = new Map<string, Array<(() => void) | undefined>>();

export function commitTree(container: AutomotiveContainer): void {
  for (const node of container.children) {
    switch (node.type) {
      case 'list':
        commitList(node);
        break;
      case 'grid':
        commitGrid(node);
        break;
      case 'alert':
        commitModal(node, 'alert');
        break;
      case 'action-sheet':
        commitModal(node, 'action-sheet');
        break;
      default:
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.warn(
            `[react-native-automotive] Unhandled declarative node type '${node.type}' at root of <Automotive.Root>. Supported v1.2 root types: list, grid, alert, action-sheet.`,
          );
        }
    }
  }
}

/**
 * Called by the reconciler from `removeChildFromContainer` when a
 * top-level node is being unmounted. Modal nodes (alert / action-sheet)
 * trigger `dismissTemplate`. List/Grid nodes are no-op here — the user
 * is expected to mount a replacement root or to call popTemplate
 * imperatively for different navigation behavior.
 */
export function onRemoveTopLevel(node: AutomotiveNode): void {
  if (node.type === 'alert' || node.type === 'action-sheet') {
    if (node.templateInstance) {
      handlerRegistry.delete(node.templateInstance.id);
      getAutomotive().dismissTemplate();
    }
  }
}

// ─── List ──────────────────────────────────────────────────────────

function commitList(node: AutomotiveNode): void {
  const { sections, handlers } = buildListSections(node);

  if (!node.templateInstance) {
    // First commit — create the native template and mount as root.
    const template = new ListTemplate({
      title: node.props.title as string | undefined,
      headerAction: node.props.headerAction as never,
      loading: node.props.loading as boolean | undefined,
      sections,
      onItemSelect: async ({ index }) => {
        const list = handlerRegistry.get(template.id);
        list?.[index]?.();
      },
    });
    node.templateInstance = template;
    handlerRegistry.set(template.id, handlers);
    getAutomotive().setRootTemplate(template);
  } else {
    // Subsequent commits — refresh content + rebind handlers in place.
    const template: ListTemplate = node.templateInstance;
    handlerRegistry.set(template.id, handlers);
    template.updateSections(sections);
  }
}

function buildListSections(listNode: AutomotiveNode): {
  sections: ListSection[];
  handlers: Array<(() => void) | undefined>;
} {
  const sections: ListSection[] = [];
  const handlers: Array<(() => void) | undefined> = [];

  for (const sectionNode of listNode.children) {
    if (sectionNode.type !== 'list-section') {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn(
          `[react-native-automotive] <List> only accepts <List.Section> children; got '${sectionNode.type}'.`,
        );
      }
      continue;
    }

    const items: ListItem[] = [];
    for (const itemNode of sectionNode.children) {
      if (itemNode.type !== 'list-item') {
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.warn(
            `[react-native-automotive] <List.Section> only accepts <List.Item> children; got '${itemNode.type}'.`,
          );
        }
        continue;
      }

      const { onPress, ...itemProps } = itemNode.props;
      items.push(itemProps as ListItem);
      handlers.push(onPress as (() => void) | undefined);
    }

    sections.push({
      header: sectionNode.props.header as string,
      items,
    });
  }

  return { sections, handlers };
}

// ─── Grid ──────────────────────────────────────────────────────────

function commitGrid(node: AutomotiveNode): void {
  const { buttons, handlers } = buildGridButtons(node);

  if (!node.templateInstance) {
    const template = new GridTemplate({
      title: node.props.title as string | undefined,
      buttons,
      onButtonPressed: ({ index }) => {
        const list = handlerRegistry.get(template.id);
        list?.[index]?.();
      },
    });
    node.templateInstance = template;
    handlerRegistry.set(template.id, handlers);
    getAutomotive().setRootTemplate(template);
  } else {
    // GridTemplate doesn't expose an in-place buttons update method in
    // v1, so subsequent commits rebuild the template. Acceptable for
    // grids because they're typically static and small (max 6-8 buttons).
    // Refinement target: add an `updateButtons` method to GridTemplate
    // in v1.3 and switch to in-place updates here.
    const template = new GridTemplate({
      title: node.props.title as string | undefined,
      buttons,
      onButtonPressed: ({ index }) => {
        const list = handlerRegistry.get(template.id);
        list?.[index]?.();
      },
    });
    handlerRegistry.delete(node.templateInstance.id);
    node.templateInstance = template;
    handlerRegistry.set(template.id, handlers);
    getAutomotive().setRootTemplate(template);
  }
}

// ─── Modals (Alert + ActionSheet) ──────────────────────────────────

function commitModal(node: AutomotiveNode, kind: 'alert' | 'action-sheet'): void {
  if (node.templateInstance) {
    // Modals don't currently expose in-place update — the platform
    // re-presents on prop changes. For v1.2 we rebuild and re-present,
    // dismissing the previous instance first. Modals are short-lived so
    // the overhead is negligible.
    handlerRegistry.delete(node.templateInstance.id);
    getAutomotive().dismissTemplate(false);
    node.templateInstance = undefined;
  }

  const { actions, handlers } = buildModalActions(node, kind);
  const automotive = getAutomotive();

  let template: AlertTemplate | ActionSheetTemplate;
  if (kind === 'alert') {
    const titleVariants =
      (node.props.titleVariants as string[] | undefined) ??
      (node.props.title ? [node.props.title as string] : ['']);
    template = new AlertTemplate({
      titleVariants,
      actions,
      onActionButtonPressed: ({ id }) => {
        const list = handlerRegistry.get(template.id);
        list?.[indexOfActionId(actions, id)]?.();
      },
    });
  } else {
    template = new ActionSheetTemplate({
      title: node.props.title as string,
      message: node.props.message as string | undefined,
      actions,
      onActionButtonPressed: ({ id }) => {
        const list = handlerRegistry.get(template.id);
        list?.[indexOfActionId(actions, id)]?.();
      },
    });
  }

  node.templateInstance = template;
  handlerRegistry.set(template.id, handlers);
  automotive.presentTemplate(template);
}

function buildModalActions(
  node: AutomotiveNode,
  kind: 'alert' | 'action-sheet',
): {
  actions: AlertAction[];
  handlers: Array<(() => void) | undefined>;
} {
  const expectedChild = kind === 'alert' ? 'alert-action' : 'action-sheet-action';
  const actions: AlertAction[] = [];
  const handlers: Array<(() => void) | undefined> = [];

  let autoId = 0;
  for (const actionNode of node.children) {
    if (actionNode.type !== expectedChild) {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn(
          `[react-native-automotive] <${kind === 'alert' ? 'Alert' : 'ActionSheet'}> only accepts <${kind === 'alert' ? 'Alert.Action' : 'ActionSheet.Action'}> children; got '${actionNode.type}'.`,
        );
      }
      continue;
    }
    actions.push({
      id: (actionNode.props.id as string | undefined) ?? `auto-action-${autoId++}`,
      title: actionNode.props.title as string,
      style: actionNode.props.style as AlertAction['style'],
    });
    handlers.push(actionNode.props.onPress as (() => void) | undefined);
  }

  return { actions, handlers };
}

function indexOfActionId(actions: AlertAction[], id: string): number {
  return actions.findIndex((a) => a.id === id);
}

function buildGridButtons(gridNode: AutomotiveNode): {
  buttons: GridButton[];
  handlers: Array<(() => void) | undefined>;
} {
  const buttons: GridButton[] = [];
  const handlers: Array<(() => void) | undefined> = [];

  let autoId = 0;
  for (const buttonNode of gridNode.children) {
    if (buttonNode.type !== 'grid-button') {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn(
          `[react-native-automotive] <Grid> only accepts <Grid.Button> children; got '${buttonNode.type}'.`,
        );
      }
      continue;
    }

    const { onPress, title, titleVariants, image, disabled, id } = buttonNode.props;
    const variants =
      (titleVariants as string[] | undefined) ?? (title ? [title as string] : ['']);

    buttons.push({
      id: (id as string | undefined) ?? `auto-button-${autoId++}`,
      titleVariants: variants,
      image: image as GridButton['image'],
      disabled: disabled as boolean | undefined,
    });
    handlers.push(onPress as (() => void) | undefined);
  }

  return { buttons, handlers };
}
