import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function TambahJadwalScreen({ navigation }) {
  const [mealName, setMealName] = useState('');
  const [hour, setHour] = useState('15');
  const [minute, setMinute] = useState('00');

  const handleSave = () => {
    if (!mealName.trim()) {
      Alert.alert('Gagal', 'Nama pengingat makan wajib diisi!');
      return;
    }
    const h = parseInt(hour, 10);
    const m = parseInt(minute, 10);
    if (isNaN(h) || h < 0 || h > 23 || isNaN(m) || m < 0 || m > 59) {
      Alert.alert('Gagal', 'Format waktu tidak valid!');
      return;
    }

    const formattedHour = h < 10 ? `0${h}` : `${h}`;
    const formattedMinute = m < 10 ? `0${m}` : `${m}`;
    const finalTime = `${formattedHour}.${formattedMinute}`;

    Alert.alert(
      'Berhasil',
      `Jadwal makan baru "${mealName}" berhasil ditambahkan pada pukul ${finalTime}`,
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tambah Jadwal Makan</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={22} color="#2563EB" style={{ marginRight: 8 }} />
          <Text style={styles.infoText}>Buat pengingat kustom untuk asupan kalori atau cemilan tambahan Anda.</Text>
        </View>

        {}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Nama Pengingat Makan</Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: Snack Sore, Pre-Workout Meal"
            placeholderTextColor="#9CA3AF"
            value={mealName}
            onChangeText={setMealName}
          />
        </View>

        {}
        <Text style={styles.label}>Pilih Waktu Pengingat</Text>
        <View style={styles.timePickerContainer}>
          <View style={styles.timeInputColumn}>
            <Text style={styles.timeLabel}>Jam</Text>
            <TextInput
              style={styles.timeInput}
              keyboardType="number-pad"
              maxLength={2}
              value={hour}
              onChangeText={setHour}
            />
          </View>
          <Text style={styles.timeSeparator}>:</Text>
          <View style={styles.timeInputColumn}>
            <Text style={styles.timeLabel}>Menit</Text>
            <TextInput
              style={styles.timeInput}
              keyboardType="number-pad"
              maxLength={2}
              value={minute}
              onChangeText={setMinute}
            />
          </View>
        </View>

        {}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Ionicons name="checkmark" size={22} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.saveButtonText}>Simpan Jadwal Baru</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  scrollContent: {
    padding: 20,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 14,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 32,
  },
  timeInputColumn: {
    alignItems: 'center',
    width: 80,
  },
  timeLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  timeInput: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2563EB',
    textAlign: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    width: '100%',
    paddingVertical: 8,
  },
  timeSeparator: {
    fontSize: 28,
    fontWeight: '800',
    color: '#9CA3AF',
    marginHorizontal: 12,
  },
  saveButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  }
});
