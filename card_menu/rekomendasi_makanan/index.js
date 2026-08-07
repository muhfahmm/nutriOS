import { StyleSheet, Text, View } from 'react-native';

export default function RekomendasiMakananScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rekomendasi Makanan</Text>
      <Text style={styles.subtitle}>
        Dalam pengembangan. Halaman ini akan menampilkan menu harian,
        filter diet, dan rekomendasi resep bergizi.
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