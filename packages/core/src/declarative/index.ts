/**
 * Public exports of the declarative API.
 *
 * Components ship as named exports on this module. The `<Automotive.Root>`
 * namespace form is wired in `Automotive.ts` so the imperative singleton
 * and the declarative entry point coexist:
 *
 * ```tsx
 * import { Automotive, List } from 'react-native-automotive';
 *
 * <Automotive.Root>
 *   <List title="...">...</List>
 * </Automotive.Root>
 * ```
 *
 * As components land per the v1.2 roadmap (List, Grid, Alert, ActionSheet)
 * they're re-exported here.
 */
export { Root } from './Root';
export { List } from './List';
export { Grid } from './Grid';
export { Alert } from './Alert';
export { ActionSheet } from './ActionSheet';
