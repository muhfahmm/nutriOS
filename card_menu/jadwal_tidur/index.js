import { StyleSheet, Text, View } from 'react-native';

export default function JadwalTidurScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Jadwal Tidur</Text>
      <Text style={styles.subtitle}>
        Dalam pengembangan. Fitur utama akan meliputi jadwal tidur, kalkulator kebutuhan tidur,
        notifikasi cerdas, dan mode relaksasi sebelum tidur.
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