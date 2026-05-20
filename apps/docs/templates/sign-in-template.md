# SignInTemplate

**Android-only.** Authentication flow template — PIN entry, password, QR code, or provider button. CarPlay has no direct equivalent; on iOS, apps typically detect that they need auth and prompt on the phone instead.

```ts
import { SignInTemplate } from 'react-native-automotive';
```

## Example

```tsx
const signIn = new SignInTemplate({
  title: 'Sign in',
  instructions: 'Enter your PIN to continue',
  signInMethod: {
    type: 'pin',
    pin: '1234',
  },
  actions: [
    { id: 'help', title: 'Help' },
  ],
});

Automotive.setRootTemplate(signIn);
```

Supported `signInMethod.type` values: `'pin'`, `'qr_code'`, `'input'`, `'provider'`.

## Source

[`packages/core/src/templates/android/SignInTemplate.ts`](https://github.com/dotommy/react-native-automotive/blob/master/packages/core/src/templates/android/SignInTemplate.ts)
