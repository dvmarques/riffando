import { Pressable, StyleSheet, Text } from 'react-native';

type Props = { label: string; onPress: () => void };
export function Action({ label, onPress }: Props) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  button: { minHeight: 52, paddingVertical: 16, paddingHorizontal: 20, backgroundColor: '#5EE0B5', borderRadius: 12, justifyContent: 'center' },
  pressed: { opacity: 0.8 },
  label: { color: '#101820', fontSize: 18, fontWeight: '700', textAlign: 'center', flexShrink: 1 },
});
