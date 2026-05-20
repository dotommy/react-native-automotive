# Template navigation stack

The car display shows **one template at a time** (modulo modal overlays like alerts). The stack tracks history so you can pop back.

## Anatomy

```
TOP OF STACK (what user sees)
+------------------------+
|   DetailListTemplate   |  ← pushed
+------------------------+
|     RootListTemplate   |  ← root
+------------------------+
BOTTOM OF STACK
```

## Operations

### `setRootTemplate(t)`

Replaces the **entire stack** with `t` as the new root.

```ts
Automotive.setRootTemplate(new ListTemplate({ ... }));
```

Use cases:
- App boot: set the initial UI
- Major mode switch: leaving navigation mode → showing now-playing
- Reset after deep navigation: instead of popping 5 times, set the root again

⚠️ This destroys the back history. Users can't navigate back to whatever was there before.

### `pushTemplate(t)`

Pushes `t` onto the stack. User can navigate back with the platform back button.

```ts
const list = new ListTemplate({
  ...,
  onItemSelect: async ({ index }) => {
    const detail = new InformationTemplate({ ... });
    Automotive.pushTemplate(detail);
  },
});
```

⚠️ **Same template can't be pushed twice.** Both CarPlay and Android Auto reject this. If you want a "fresh" version of the same screen, instantiate a new template (new `id`).

### `popTemplate()`

Pops the top entry. If you're already at the root, this is a no-op.

```ts
Automotive.popTemplate();
```

You usually don't need to call this — the platform back button does it automatically. Use it programmatically for cases like "transaction successful → pop back to list".

### `popToTemplate(t)`

Pops until `t` is on top. `t` must already be in the stack — pass the same JS instance you pushed earlier.

```ts
const root = new ListTemplate({ ... });
Automotive.setRootTemplate(root);
// ... user navigates deep into the app ...
Automotive.popToTemplate(root); // back to the list, regardless of depth
```

### `popToRootTemplate()`

Shortcut: pop everything until the root is on top.

```ts
Automotive.popToRootTemplate();
```

## Modal: `presentTemplate` / `dismissTemplate`

Only `AlertTemplate` and `ActionSheetTemplate` (and the experimental `VoiceControlTemplate`) can be presented modally. They appear *over* the current template, don't push onto the stack, and you dismiss them explicitly (or the user taps a button).

```ts
const alert = new AlertTemplate({
  titleVariants: ['Are you sure?'],
  actions: [
    { id: 'cancel', title: 'Cancel', style: 'cancel' },
    { id: 'ok', title: 'OK', style: 'default' },
  ],
  onActionButtonPressed: ({ id }) => {
    if (id === 'ok') doTheThing();
    Automotive.dismissTemplate();
  },
});
Automotive.presentTemplate(alert);
```

Trying to `present` a non-presentable template throws.

## Template IDs

Every template has an `id` string. You can pass one yourself (`new ListTemplate({ id: 'menu', ... })`) or let the library auto-generate one. IDs are how the native side identifies the template in subsequent calls (`updateSections`, `popToTemplate`).

When you have multiple templates of the same type, IDs help debugging: name them.

## Animation

All methods accept an `animated?: boolean` second argument, defaulting to `true`. Set `false` for instant transitions (rare; use for app boot to avoid the slide-in animation).

## Root-only templates

Some templates can **only** be root, not pushed:

- `TabBarTemplate` (cross-platform)
- `TabTemplate` (Android-only)

This is enforced by the type system — `pushTemplate(tabBar)` won't compile.

## What about deep linking?

Not supported in v1. If the OS launches your app via a notification or `geo:` intent, your `onConnect` callback fires as normal and it's up to you to interpret the intent state and decide what to render.

## Next

→ [CarPlay vs Android Auto](/guide/platforms) — which template you use when each platform offers different primitives.
