import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { createContainer, render, unmount } from './reconciler';
import type { AutomotiveContainer } from './types';

/**
 * Entry point for the declarative API.
 *
 * `<Automotive.Root>` does not render anything on the phone — it returns
 * `null`. Its `children` are instead pushed into an internal
 * `react-reconciler` tree that translates `<List>` / `<Grid>` / `<Alert>`
 * etc. into imperative `Automotive.*` calls behind the scenes.
 *
 * Imperative and declarative APIs coexist: you can call
 * `Automotive.pushTemplate(...)` from a `useEffect` in the same project
 * that uses `<Automotive.Root>` for its main screens.
 *
 * @example
 * ```tsx
 * import { Automotive, List } from 'react-native-automotive';
 *
 * export default function App() {
 *   return (
 *     <Automotive.Root>
 *       <List title="Menu">
 *         <List.Section header="Pizze">
 *           <List.Item text="Margherita" onPress={() => console.log('hi')} />
 *         </List.Section>
 *       </List>
 *     </Automotive.Root>
 *   );
 * }
 * ```
 */
export function Root({ children }: { children: ReactNode }) {
  // Lazily create one container per Root instance. We use a ref so the
  // container survives strict-mode double-mounts without being recreated.
  const containerRef = useRef<AutomotiveContainer | null>(null);
  if (containerRef.current === null) {
    containerRef.current = createContainer();
  }

  // Re-render the React tree into the reconciler on every render of
  // this component. `useEffect` (not `useLayoutEffect`) is intentional:
  // the car-side commit is not paint-critical and useEffect avoids
  // React StrictMode noise during the synchronous render phase.
  useEffect(() => {
    render(children, containerRef.current!);
  });

  // Cleanup on unmount — tear down the reconciler tree so the native
  // template stack is reset to a clean state.
  useEffect(() => {
    const container = containerRef.current!;
    return () => unmount(container);
  }, []);

  return null;
}
