import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CarPlay, ListTemplate } from 'react-native-automotive';

/**
 * Minimal demo: when CarPlay connects, set a ListTemplate as the root.
 *
 * This is the smallest possible end-to-end check that exercises:
 * - JS-side template constructor (Step 3 types)
 * - Bridge to iOS Swift / Android Kotlin builders (Step 6 / 7)
 * - CarPlay scene wiring via the Expo Config Plugin (Step 9)
 *
 * A fuller demo covering every template + the notifications module
 * lands post-v1; this file proves the chain is alive.
 */
export default function App() {
  useEffect(() => {
    const onConnect = () => {
      const template = new ListTemplate({
        title: 'react-native-automotive',
        sections: [
          {
            header: 'Demo',
            items: [
              { text: 'Hello CarPlay 👋' },
              {
                text: 'Tap me',
                detailText: 'A list item with detail text',
              },
            ],
          },
        ],
        onItemSelect: async ({ index }) => {
          console.log('Selected item index:', index);
        },
      });
      CarPlay.setRootTemplate(template);
    };

    CarPlay.registerOnConnect(onConnect);
    return () => CarPlay.unregisterOnConnect(onConnect);
  }, []);

  return (
    <View style={styles.root}>
      <Text style={styles.title}>react-native-automotive demo</Text>
      <Text style={styles.body}>
        Connect to CarPlay or Android Auto to see the demo on the car
        display.
      </Text>
    </View>
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
