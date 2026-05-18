# Template builders

One Swift class per CarPlay template, following the **builder pattern**:

```swift
@objc(RNAutomotive<Name>TemplateBuilder)
@objcMembers
public final class <Name>TemplateBuilder: NSObject {
    @objc public static func build(
        config: NSDictionary,
        templateId: String,
        emitter: RCTEventEmitter?
    ) -> CP<Name>Template { ... }
}
```

## Naming

- Swift class name: `<Name>TemplateBuilder` (e.g. `AlertTemplateBuilder`)
- Obj-C exposed name: `RNAutomotive<Name>TemplateBuilder` (prefixed for collision
  safety in consumer apps)
- File name matches the Obj-C exposed name: `RNAutomotiveAlertTemplateBuilder.swift`

## Migration order (Step 6 of the BRIEF roadmap)

Migrating from the monolithic `RNCarPlay.m` `createTemplate:` dispatch one
template at a time. As each builder lands, the corresponding `else if`
branch in `RNCarPlay.m` calls the Swift builder instead of inline Obj-C.

When all branches are migrated, `RNCarPlay.m` is reduced to event emitter
plumbing + delegate forwarding and is replaced in Step 6.5 / Step 11.

## Shared helpers

Helpers extracted on-demand by the first template that needs them. Live in
`packages/core/ios/helpers/` (sibling of `templates/`):

- Image conversion / asset resolution
- Bar button parsing
- Action sheet / alert action parsing
