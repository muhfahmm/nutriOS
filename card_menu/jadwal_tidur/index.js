import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Switch 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function JadwalTidurScreen() {
  // --- STATE MOCK (Untuk Demo Interaktif) ---
  const [sleepTime, setSleepTime] = useState('22.00');
  const [wakeTime, setWakeTime] = useState('06.00');
  const [ageGroup, setAgeGroup] = useState('Dewasa'); // Bayi, Anak, Dewasa
  const [isPlaying, setIsPlaying] = useState(false);
  const [mood, setMood] = useState(null);
  
  // Notifikasi Toggle
  const [notifBedtime, setNotifBedtime] = useState(true);
  const [notifScreenFree, setNotifScreenFree] = useState(false);

  // Checklist Relaksasi
  const [checklist, setChecklist] = useState({
    minum: false,
    cuci: false,
    lampu: false,
  });

  const toggleChecklist = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Simulasi usia untuk Kalkulator Tidur
  const getSleepRecommendation = (age) => {
    if (age === 'Bayi') return '12 - 16 Jam';
    if (age === 'Anak') return '10 - 13 Jam';
    return '7 - 9 Jam';
  };

  // Simulasi Siklus 90 Menit
  const cycles = ['06.00', '07.30', '09.00'];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Jadwal Tidur</Text>
          <Text style={styles.subtitle}>Pantau dan tingkatkan kualitas istirahat Anda & si kecil</Text>
        </View>

        {/* 1. WIDGET TARGET & PROGRESS BAR */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Target Tidur Harian</Text>
          <View style={styles.timePickerRow}>
            <View style={styles.timeBox}>
              <Text style={styles.timeLabel}>Tidur</Text>
              <TouchableOpacity style={styles.timeButton}>
                <Ionicons name="moon" size={16} color="#2563EB" />
                <Text style={styles.timeText}>{sleepTime}</Text>
              </TouchableOpacity>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#9CA3AF" />
            <View style={styles.timeBox}>
              <Text style={styles.timeLabel}>Bangun</Text>
              <TouchableOpacity style={styles.timeButton}>
                <Ionicons name="sunny" size={16} color="#F59E0B" />
                <Text style={styles.timeText}>{wakeTime}</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '75%' }]} />
            </View>
            <Text style={styles.progressLabel}>7.5 dari 8 jam terpenuhi</Text>
          </View>
        </View>

        {/* 2. KALKULATOR SIKLUS & KEBUTUHAN TIDUR */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Kalkulator Kebutuhan Tidur</Text>
          <View style={styles.ageSelector}>
            {['Bayi', 'Anak', 'Dewasa'].map((age) => (
              <TouchableOpacity 
                key={age} 
                style={[styles.ageBtn, ageGroup === age && styles.ageBtnActive]}
                onPress={() => setAgeGroup(age)}
              >
                <Text style={[styles.ageBtnText, ageGroup === age && styles.ageBtnTextActive]}>{age}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.recommendationText}>
            Rekomendasi Durasi: <Text style={{ fontWeight: '800', color: '#111827' }}>{getSleepRecommendation(ageGroup)}</Text>
          </Text>
          
          <View style={styles.cycleContainer}>
            <Text style={styles.cycleLabel}>Siklus Tidur 90 Menit (Bangun Paling Segar):</Text>
            <View style={styles.cycleRow}>
              {cycles.map((time, idx) => (
                <View key={idx} style={styles.cycleChip}>
                  <Text style={styles.cycleChipText}>{time}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* 3. PENGINGAT CERDAS (EXPO NOTIFICATIONS) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pengingat Cerdas</Text>
          <View style={styles.toggleRow}>
            <View style={styles.toggleTextWrap}>
              <Ionicons name="notifications-outline" size={20} color="#4B5563" style={{ marginRight: 10 }} />
              <Text style={styles.toggleLabel}>Pengingat Persiapan Tidur (30 menit sebelumnya)</Text>
            </View>
            <Switch value={notifBedtime} onValueChange={setNotifBedtime} trackColor={{ false: '#E5E7EB', true: '#2563EB' }} />
          </View>
          <View style={[styles.toggleRow, { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 14, marginTop: 10 }]}>
            <View style={styles.toggleTextWrap}>
              <Ionicons name="phone-portrait-outline" size={20} color="#4B5563" style={{ marginRight: 10 }} />
              <Text style={styles.toggleLabel}>Mode Bebas Layar 1 jam sebelum tidur</Text>
            </View>
            <Switch value={notifScreenFree} onValueChange={setNotifScreenFree} trackColor={{ false: '#E5E7EB', true: '#2563EB' }} />
          </View>
        </View>

        {/* 4. MODE RELAKSASI (WIND-DOWN ROUTINE) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Rutinitas Malam (Wind-Down)</Text>
          {Object.entries(checklist).map(([key, value]) => {
            const labels = { minum: 'Minum Air Putih', cuci: 'Cuci Muka & Kaki', lampu: 'Matikan Lampu Utama' };
            const icons = { minum: 'water-outline', cuci: 'water-outline', lampu: 'bulb-outline' };
            return (
              <TouchableOpacity key={key} style={styles.checklistItem} onPress={() => toggleChecklist(key)}>
                <View style={styles.checkIconWrap}>
                  {value ? (
                    <Ionicons name="checkmark-circle" size={24} color="#2563EB" />
                  ) : (
                    <Ionicons name="ellipse-outline" size={24} color="#D1D5DB" />
                  )}
                </View>
                <Text style={[styles.checklistLabel, value && styles.checklistLabelDone]}>{labels[key]}</Text>
              </TouchableOpacity>
            );
          })}

          <View style={styles.audioSection}>
            <Text style={styles.audioLabel}>Audio Relaksasi (White Noise)</Text>
            <View style={styles.audioControls}>
              <TouchableOpacity style={styles.playBtn} onPress={() => setIsPlaying(!isPlaying)}>
                <Ionicons name={isPlaying ? 'pause' : 'play'} size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.audioStatus}>{isPlaying ? 'Suara Hujan sedang diputar...' : 'Tekan play untuk mulai'}</Text>
            </View>
          </View>
        </View>

        {/* 5. JURNAL & GRAFIK KUALITAS TIDUR */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Jurnal Kualitas Tidur</Text>
          <Text style={styles.subCardTitle}>Bagaimana perasaan Anda saat bangun pagi ini?</Text>
          <View style={styles.moodRow}>
            {['😄', '😌', '😫', '🥱'].map((emoji, idx) => {
              const labels = ['Segar', 'Nyenyak', 'Sering Terbangun', 'Lelah'];
              return (
                <TouchableOpacity 
                  key={idx} 
                  style={[styles.moodBtn, mood === idx && styles.moodBtnActive]}
                  onPress={() => setMood(idx)}
                >
                  <Text style={styles.moodEmoji}>{emoji}</Text>
                  <Text style={[styles.moodLabel, mood === idx && styles.moodLabelActive]}>{labels[idx]}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Mock Bar Chart 7 Hari */}
          <View style={styles.chartSection}>
            <Text style={styles.subCardTitle}>Konsistensi Tidur Mingguan</Text>
            <View style={styles.chartRow}>
              {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day, idx) => {
                const height = [60, 80, 40, 90, 70, 50, 100][idx]; // Mock tinggi bar
                return (
                  <View key={idx} style={styles.barContainer}>
                    <View style={[styles.barFill, { height: height }]} />
                    <Text style={styles.barLabel}>{day}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 20,
    marginTop: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 14,
  },
  subCardTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },

  // --- 1. TARGET & PROGRESS ---
  timePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeBox: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 6,
  },
  timeText: {
    fontWeight: '700',
    fontSize: 16,
    color: '#111827',
  },
  progressContainer: {
    marginTop: 4,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 6,
  },
  progressLabel: {
    marginTop: 6,
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'right',
  },

  // --- 2. KALKULATOR ---
  ageSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  ageBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  ageBtnActive: {
    backgroundColor: '#2563EB',
  },
  ageBtnText: {
    fontWeight: '600',
    color: '#6B7280',
  },
  ageBtnTextActive: {
    color: '#FFFFFF',
  },
  recommendationText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 12,
  },
  cycleContainer: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
  },
  cycleLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  cycleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cycleChip: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  cycleChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },

  // --- 3. NOTIFIKASI ---
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleTextWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleLabel: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },

  // --- 4. RELAKSASI ---
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkIconWrap: {
    marginRight: 12,
  },
  checklistLabel: {
    fontSize: 15,
    color: '#4B5563',
  },
  checklistLabelDone: {
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  audioSection: {
    marginTop: 8,
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 14,
  },
  audioLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  playBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  audioStatus: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },

  // --- 5. JURNAL & GRAFIK ---
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  moodBtn: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
    width: 60,
  },
  moodBtnActive: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  moodEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  moodLabelActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  chartSection: {
    marginTop: 4,
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barFill: {
    width: 12,
    backgroundColor: '#2563EB',
    borderRadius: 6,
    opacity: 0.8,
  },
  barLabel: {
    marginTop: 6,
    fontSize: 12,
    color: '#6B7280',
  },
});