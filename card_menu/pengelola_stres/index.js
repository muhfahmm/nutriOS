import { StyleSheet, Text, View } from 'react-native';

export default function PengelolaStresScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pengelola Stres</Text>
      <Text style={styles.subtitle}>
        Dalam pengembangan. Halaman ini akan menampilkan latihan pernapasan,
        mood check-in, dan grafik suasana hati.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F4F7FF',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
});