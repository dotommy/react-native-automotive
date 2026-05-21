import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Automotive, List, Alert } from 'react-native-automotive';

/**
 * Minimal demo using the v1.2 declarative API:
 * - `<Automotive.Root>` is the entry point
 * - `<List>` + `<List.Section>` + `<List.Item>` render the menu
 * - `<Alert>` is conditionally mounted to demo modal lifecycle
 *
 * Exercises end-to-end:
 * - The react-reconciler host config (chunk 1)
 * - List template translation + onPress routing (chunk 2)
 * - Modal mount/unmount lifecycle (chunk 4)
 *
 * Imperative API (Automotive.setRootTemplate / pushTemplate) still
 * works for templates not yet wrapped declaratively — see the docs
 * for the hybrid pattern.
 */
export default function App() {
  const [confirming, setConfirming] = useState<string | null>(null);

  return (
    <>
      <Automotive.Root>
        <List title="react-native-automotive">
          <List.Section header="Demo">
            <List.Item
              text="Hello, car 👋"
              onPress={() => setConfirming('greet')}
            />
            <List.Item
              text="Tap me"
              detailText="A list item with detail text"
              onPress={() => setConfirming('tap')}
            />
          </List.Section>
        </List>

        {confirming && (
          <Alert title={confirming === 'greet' ? 'Hi from JS!' : 'You tapped me'}>
            <Alert.Action
              title="OK"
              onPress={() => setConfirming(null)}
            />
          </Alert>
        )}
      </Automotive.Root>

      <View style={styles.root}>
        <Text style={styles.title}>react-native-automotive demo</Text>
        <Text style={styles.body}>
          Connect to CarPlay or Android Auto to see the demo on the car
          display.
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  body: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
