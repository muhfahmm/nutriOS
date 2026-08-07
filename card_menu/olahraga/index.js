import { StyleSheet, Text, View } from 'react-native';

export default function OlahragaScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Olahraga</Text>
      <Text style={styles.subtitle}>
        Dalam pengembangan. Halaman ini akan menampilkan program latihan harian, timer olahraga,
        dan hasil durasi/kalori.
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