import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PolaMakanScreen() {
  // --- STATE MOCK (INTERAKTIF) ---
  // 1. Scheduler State
  const [schedule, setSchedule] = useState({
    breakfast: '07.00',
    lunch: '12.30',
    dinner: '18.30',
    snack1: '09.30',
    snack2: '15.00'
  });

  // 2. Notifikasi Cerdas State
  const [snoozeActive, setSnoozeActive] = useState(false);

  // 3. Food Logging State
  const [foodSearch, setFoodSearch] = useState('');
  const [portion, setPortion] = useState('1 Porsi');
  const [isHealthy, setIsHealthy] = useState(null); // null = belum pilih, true = Ya, false = Tidak

  // 4. Dashboard Mock Data
  const nutrition = {
    calories: { current: 1200, target: 2100, color: '#3B82F6' },
    protein: { current: 55, target: 75, color: '#10B981' }, // Hijau Emerald
    carbs: { current: 160, target: 250, color: '#10B981' },
    fat: { current: 45, target: 70, color: '#F59E0B' }, // Kuning Amber
  };

  // --- FUNGSI INTERAKSI ---
  const updateSchedule = (meal) => {
    // Simulasi drag-and-drop/ketuk: memutar waktu (06.00 - 22.00 dengan step 30 menit)
    let currentTime = parseInt(schedule[meal].replace(':', ''));
    let newTime = currentTime + 30;
    if (newTime >= 2200) newTime = 600; // Putar balik ke 06.00
    const formattedTime = (newTime < 1000 ? '0' : '') + String(newTime).slice(0, 2) + '.' + String(newTime).slice(2);
    setSchedule({ ...schedule, [meal]: formattedTime });
  };

  const handleSnooze = () => {
    setSnoozeActive(true);
    setTimeout(() => setSnoozeActive(false), 5000); // Mock notifikasi kembali setelah 5 detik
  };

  const handleLogFood = () => {
    if (!foodSearch) {
      alert('Silakan ketik nama makanan terlebih dahulu!');
      return;
    }
    alert(`✅ Berhasil log: ${foodSearch} (${portion}) - Sehat: ${isHealthy === true ? 'Ya' : isHealthy === false ? 'Tidak' : 'Tidak dinilai'}`);
    setFoodSearch('');
    setPortion('1 Porsi');
    setIsHealthy(null);
  };

  // --- HELPER FORMAT ---
  const renderProgressBar = (label, value, max, color, unit) => {
    const percentage = Math.min((value / max) * 100, 100);
    return (
      <View style={styles.progressWrapper}>
        <View style={styles.progressLabelRow}>
          <Text style={styles.progressLabel}>{label}</Text>
          <Text style={styles.progressValue}>{value}/{max} {unit}</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: color }]} />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Pola Makan</Text>
          <Text style={styles.subtitle}>Atur jadwal, catat asupan, dan pantau nutrisi harian.</Text>
        </View>

        {/* 1. SCHEDULER PENGINGAT MAKAN */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⏰ Scheduler Makan</Text>
          <Text style={styles.subCardTitle}>Ketuk jam untuk menggeser waktu pengingat</Text>
          
          <View style={styles.scheduleGrid}>
            {Object.entries(schedule).map(([key, time]) => {
              const icons = { breakfast: 'cafe-outline', lunch: 'restaurant-outline', dinner: 'moon-outline', snack1: 'nutrition-outline', snack2: 'ice-cream-outline' };
              const labels = { breakfast: 'Sarapan', lunch: 'Makan Siang', dinner: 'Makan Malam', snack1: 'Snack 1', snack2: 'Snack 2' };
              return (
                <TouchableOpacity key={key} style={styles.scheduleItem} onPress={() => updateSchedule(key)}>
                  <View style={styles.scheduleIconWrap}>
                    <Ionicons name={icons[key]} size={20} color="#2563EB" />
                  </View>
                  <Text style={styles.scheduleLabel}>{labels[key]}</Text>
                  <View style={styles.scheduleTimeBox}>
                    <Text style={styles.scheduleTime}>{time}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 2. NOTIFIKASI CERDAS (FITUR KUNCI) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔔 Notifikasi Cerdas</Text>
          <View style={styles.notifBox}>
            <Ionicons name="notifications" size={20} color="#2563EB" style={{ marginRight: 10 }} />
            <View style={styles.notifContent}>
              <Text style={styles.notifTitle}>Sudah waktunya makan siang!</Text>
              <Text style={styles.notifBody}>Bagaimana kalau seporsi nasi merah + ayam bakar + sayur bayam hari ini?</Text>
            </View>
          </View>
          
          <View style={[styles.notifBox, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
            <Ionicons name="warning" size={20} color="#D97706" style={{ marginRight: 10 }} />
            <View style={styles.notifContent}>
              <Text style={[styles.notifTitle, { color: '#92400E' }]}>Sepertinya Anda belum makan siang!</Text>
              <Text style={[styles.notifBody, { color: '#78350F' }]}>Perut pasti sudah keroncongan, yuk segera isi energi!</Text>
            </View>
          </View>

          <View style={styles.snoozeRow}>
            <TouchableOpacity style={[styles.snoozeBtn, snoozeActive && styles.snoozeBtnActive]} onPress={handleSnooze} disabled={snoozeActive}>
              <Text style={styles.snoozeText}>{snoozeActive ? 'Snooze (15m) Aktif' : 'Tunda 15 Menit'}</Text>
            </TouchableOpacity>
            <Text style={styles.snoozeNote}>*Jika terlalu sering ditunda, sistem mencatat sebagai "Melewatkan Makan"</Text>
          </View>
        </View>

        {/* 3. LOG MAKANAN HARIAN */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📝 Log Makanan Harian</Text>
          <Text style={styles.subCardTitle}>Cari makanan dan pilih porsi</Text>
          
          <TextInput
            style={styles.foodInput}
            placeholder="Ketik nama makanan (misal: Nasi goreng)"
            placeholderTextColor="#9CA3AF"
            value={foodSearch}
            onChangeText={setFoodSearch}
          />

          <Text style={styles.smallLabel}>Porsi:</Text>
          <View style={styles.portionRow}>
            {['½ Porsi', '1 Porsi', '1.5 Porsi'].map((p) => (
              <TouchableOpacity 
                key={p} 
                style={[styles.portionBtn, portion === p && styles.portionBtnActive]}
                onPress={() => setPortion(p)}
              >
                <Text style={[styles.portionText, portion === p && styles.portionTextActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.smallLabel}>Apakah ini makanan sehat?</Text>
          <View style={styles.healthyRow}>
            <TouchableOpacity style={[styles.healthyBtn, isHealthy === true && styles.healthyBtnActive]} onPress={() => setIsHealthy(true)}>
              <Ionicons name={isHealthy === true ? "checkmark-circle" : "checkmark-circle-outline"} size={20} color={isHealthy === true ? "#FFFFFF" : "#6B7280"} />
              <Text style={[styles.healthyText, isHealthy === true && styles.healthyTextActive]}>Ya</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.healthyBtn, isHealthy === false && styles.healthyBtnActiveDanger]} onPress={() => setIsHealthy(false)}>
              <Ionicons name={isHealthy === false ? "close-circle" : "close-circle-outline"} size={20} color={isHealthy === false ? "#FFFFFF" : "#6B7280"} />
              <Text style={[styles.healthyText, isHealthy === false && styles.healthyTextActive]}>Tidak</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.logBtn} onPress={handleLogFood}>
            <Text style={styles.logBtnText}>Simpan Log Makanan</Text>
          </TouchableOpacity>
        </View>

        {/* 4. DASHBOARD RINGKASAN NUTRISI */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Ringkasan Nutrisi Harian</Text>
          
          <View style={styles.caloriesTargetRow}>
            <Text style={styles.caloriesTitle}>Total Kalori</Text>
            <Text style={styles.caloriesValue}>{nutrition.calories.current} / {nutrition.calories.target} kcal</Text>
          </View>
          <View style={[styles.progressTrack, { height: 12, marginBottom: 16 }]}>
            <View style={[styles.progressFill, { width: `${(nutrition.calories.current/nutrition.calories.target)*100}%`, backgroundColor: nutrition.calories.color }]} />
          </View>

          <View style={styles.macroContainer}>
            {renderProgressBar('Protein', nutrition.protein.current, nutrition.protein.target, nutrition.protein.color, 'gr')}
            {renderProgressBar('Karbohidrat', nutrition.carbs.current, nutrition.carbs.target, nutrition.carbs.color, 'gr')}
            {renderProgressBar('Lemak', nutrition.fat.current, nutrition.fat.target, nutrition.fat.color, 'gr')}
          </View>

          <View style={styles.insightSuggestion}>
            <Ionicons name="bulb-outline" size={18} color="#2563EB" style={{ marginRight: 8 }} />
            <Text style={styles.suggestionText}>
              Konsumsi protein Anda masih kurang 20gr hari ini. Coba tambahkan 1 butir telur rebus pada snack sore!
            </Text>
          </View>
        </View>

        {/* 5. SKIPPED MEAL TRACKER & ANALISIS RISIKO */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚠️ Analisis Makan Terlewat</Text>
          <View style={styles.skipStatsRow}>
            <View style={styles.skipStatItem}>
              <Text style={styles.skipStatValue}>3x</Text>
              <Text style={styles.skipStatLabel}>Minggu ini</Text>
            </View>
            <View style={styles.skipStatItem}>
              <Text style={styles.skipStatValue}>Makan Siang</Text>
              <Text style={styles.skipStatLabel}>Paling sering terlewat</Text>
            </View>
          </View>
          
          <View style={styles.stressCorrelation}>
            <Ionicons name="heart-dislike-outline" size={22} color="#EF5350" style={{ marginRight: 10 }} />
            <Text style={styles.stressCorrelationText}>
              "Anda melewatkan makan siang 3 kali minggu ini. Tahukah Anda? Perut kosong bisa memicu produksi hormon stres (kortisol) meningkat!"
            </Text>
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
    paddingBottom: 40,
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
  smallLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },

  // --- 1. SCHEDULER ---
  scheduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  scheduleItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 8,
  },
  scheduleIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  scheduleLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  scheduleTimeBox: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scheduleTime: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },

  // --- 2. NOTIFIKASI ---
  notifBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 12,
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E3A8A',
    marginBottom: 2,
  },
  notifBody: {
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
  },
  snoozeRow: {
    marginTop: 4,
    alignItems: 'center',
  },
  snoozeBtn: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginBottom: 8,
  },
  snoozeBtnActive: {
    backgroundColor: '#3B82F6',
  },
  snoozeText: {
    fontWeight: '700',
    color: '#374151',
  },
  snoozeNote: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },

  // --- 3. FOOD LOGGING ---
  foodInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    marginBottom: 12,
  },
  portionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  portionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  portionBtnActive: {
    backgroundColor: '#2563EB',
  },
  portionText: {
    fontWeight: '600',
    color: '#6B7280',
  },
  portionTextActive: {
    color: '#FFFFFF',
  },
  healthyRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  healthyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    gap: 6,
  },
  healthyBtnActive: {
    backgroundColor: '#10B981',
  },
  healthyBtnActiveDanger: {
    backgroundColor: '#EF5350',
  },
  healthyText: {
    fontWeight: '600',
    color: '#6B7280',
  },
  healthyTextActive: {
    color: '#FFFFFF',
  },
  logBtn: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  logBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },

  // --- 4. DASHBOARD NUTRISI ---
  caloriesTargetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  caloriesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  caloriesValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  macroContainer: {
    marginTop: 12,
    gap: 14,
  },
  progressWrapper: {
    gap: 6,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4B5563',
  },
  progressValue: {
    fontSize: 13,
    color: '#6B7280',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 8,
  },
  insightSuggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 14,
    marginTop: 16,
  },
  suggestionText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
  },

  // --- 5. SKIPPED MEAL ---
  skipStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  skipStatItem: {
    alignItems: 'center',
  },
  skipStatValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  skipStatLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  stressCorrelation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 14,
  },
  stressCorrelationText: {
    flex: 1,
    fontSize: 13,
    color: '#991B1B',
    lineHeight: 20,
  },
});