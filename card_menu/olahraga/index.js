import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  Animated,
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function OlahragaScreen() {
  // --- STATE MOCK (Untuk Demo Interaktif) ---
  const [selectedCategory, setSelectedCategory] = useState('Quick');
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60); // Mock detik
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [activeMinutes, setActiveMinutes] = useState(12);
  const [streak, setStreak] = useState(5);
  const [isVoiceGuideActive, setIsVoiceGuideActive] = useState(false);

  // Animated Progress value
  const progressAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);

  // --- SUMBER DAYA MOCK ---
  const categories = [
    { id: 'Family', label: 'Bersama Anak', icon: 'people-outline' },
    { id: 'Postpartum', label: 'Pasca Melahirkan', icon: 'heart-outline' },
    { id: 'Quick', label: 'Quick 7-15 Min', icon: 'flash-outline' },
    { id: 'Stretch', label: 'Stretching', icon: 'body-outline' },
  ];

  // --- LOGIKA TIMER & ANIMASI ---
  const handleStartWorkout = () => {
    if (isWorkoutActive && isPaused) {
      setIsPaused(false);
      startTimerLoop();
      return;
    }
    // Reset jika baru memulai
    setIsWorkoutActive(true);
    setIsPaused(false);
    setTimeRemaining(60);
    setCaloriesBurned(0);
    setIsVoiceGuideActive(true);
    startTimerLoop();
  };

  const startTimerLoop = () => {
    // Reset animasi
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 60000, // 1 menit
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsWorkoutActive(false);
          setIsVoiceGuideActive(false);
          return 0;
        }
        return prev - 1;
      });
      // Simulasi pembakaran kalori per detik
      setCaloriesBurned((prev) => parseFloat((prev + 0.12).toFixed(2)));
    }, 1000);
  };

  const handlePauseWorkout = () => {
    setIsPaused(true);
    clearInterval(timerRef.current);
    progressAnim.stopAnimation();
  };

  const handleStopWorkout = () => {
    clearInterval(timerRef.current);
    progressAnim.stopAnimation();
    setIsWorkoutActive(false);
    setIsPaused(false);
    setTimeRemaining(60);
    setIsVoiceGuideActive(false);
  };

  // --- SIMULASI EXPO-SPEECH ---
  useEffect(() => {
    if (isWorkoutActive && !isPaused) {
      // Di sini nanti Anda akan memanggil `Speech.speak('Mulai gerakan squat!')`
      console.log('🎙️ Voice Guide: Memasuki gerakan berikutnya...');
    }
  }, [isWorkoutActive, isPaused]);

  // --- FORMAT WAKTU ---
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // --- RENDER ---
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Olahraga</Text>
          <Text style={styles.subtitle}>Aktivitas fisik ringan untuk keluarga dan pemulihan.</Text>
        </View>

        {/* 1. FILTER & KATEGORISASI PROGRAM */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Kategori Program</Text>
          <View style={styles.categoryRow}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat.id && styles.categoryChipActive
                ]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Ionicons
                  name={cat.icon}
                  size={16}
                  color={selectedCategory === cat.id ? '#FFFFFF' : '#6B7280'}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === cat.id && styles.categoryTextActive
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 2. LAYAR SESI LATIHAN INTERAKTIF (WORKOUT SESSION) */}
        <View style={styles.card}>
          <View style={styles.sessionHeader}>
            <Text style={styles.cardTitle}>Sesi Latihan</Text>
            {isVoiceGuideActive && (
              <View style={styles.voiceBadge}>
                <Ionicons name="mic" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.voiceBadgeText}>Voice Active</Text>
              </View>
            )}
          </View>

          {/* Visual Panduan Gerakan (Mock Lottie/Animasi) */}
          <View style={styles.visualBox}>
            <Ionicons name="barbell-outline" size={48} color="#2563EB" />
            <Text style={styles.visualLabel}>
              {selectedCategory === 'Stretch' ? 'Peregangan Bahu & Leher' : 
               selectedCategory === 'Postpartum' ? 'Senam Kegel Dasar' : 
               selectedCategory === 'Family' ? 'Aktivitas Orang Tua & Anak' : 
               'Jumping Jacks & Squat'}
            </Text>
          </View>

          {/* Smart Interval Timer (Progress Circular) */}
          <View style={styles.timerContainer}>
            <Animated.View 
              style={[
                styles.timerCircle,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                }
              ]}
            />
            <View style={styles.timerTextWrap}>
              <Text style={styles.timerLabel}>
                {isWorkoutActive ? 'Sisa Waktu' : 'Tekan Mulai'}
              </Text>
              <Text style={styles.timerValue}>
                {isWorkoutActive ? formatTime(timeRemaining) : '01:00'}
              </Text>
              <Text style={styles.timerSubLabel}>
                {isWorkoutActive ? 'Istirahat 30 detik' : 'Durasi Mock 1 Menit'}
              </Text>
            </View>
          </View>

          {/* Kontrol Sesi (Pause, Skip, Stop) */}
          <View style={styles.controlRow}>
            {!isWorkoutActive ? (
              <TouchableOpacity style={styles.startButton} onPress={handleStartWorkout}>
                <Ionicons name="play" size={24} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.startButtonText}>Mulai Latihan</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity style={styles.controlBtn} onPress={isPaused ? handleStartWorkout : handlePauseWorkout}>
                  <Ionicons name={isPaused ? "play" : "pause"} size={24} color="#2563EB" />
                  <Text style={styles.controlBtnLabel}>{isPaused ? 'Lanjut' : 'Jeda'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.controlBtn} onPress={() => {}}>
                  <Ionicons name="play-skip-forward" size={24} color="#6B7280" />
                  <Text style={styles.controlBtnLabel}>Skip</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.controlBtn, { borderColor: '#EF5350' }]} onPress={handleStopWorkout}>
                  <Ionicons name="stop" size={24} color="#EF5350" />
                  <Text style={[styles.controlBtnLabel, { color: '#EF5350' }]}>Stop</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* 3. PELACAK PROGRES & METRIC KESEHATAN */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Progres & Metrik</Text>
          
          <View style={styles.metricRow}>
            <View style={styles.metricItem}>
              <Ionicons name="flame-outline" size={24} color="#EF5350" />
              <Text style={styles.metricValue}>{caloriesBurned} <Text style={styles.metricUnit}>kcal</Text></Text>
              <Text style={styles.metricLabel}>Terbakar</Text>
            </View>
            <View style={styles.metricItem}>
              <Ionicons name="time-outline" size={24} color="#2563EB" />
              <Text style={styles.metricValue}>{activeMinutes} <Text style={styles.metricUnit}>min</Text></Text>
              <Text style={styles.metricLabel}>Aktif Hari Ini</Text>
            </View>
            <View style={styles.metricItem}>
              <Ionicons name="stats-chart" size={24} color="#F59E0B" />
              <Text style={styles.metricValue}>{streak} <Text style={styles.metricUnit}>hari</Text></Text>
              <Text style={styles.metricLabel}>Streak 🔥</Text>
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
  // --- 1. KATEGORI ---
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },

  // --- 2. SESI LATIHAN ---
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voiceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  voiceBadgeText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 10,
  },
  visualBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  visualLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  timerContainer: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  timerCircle: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 6,
    backgroundColor: '#2563EB',
    borderRadius: 6,
  },
  timerTextWrap: {
    alignItems: 'center',
  },
  timerLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  timerValue: {
    fontSize: 38,
    fontWeight: '800',
    color: '#111827',
    marginVertical: 4,
  },
  timerSubLabel: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  startButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 14,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  controlBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 4,
  },
  controlBtnLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },

  // --- 3. PROGRES ---
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    borderRadius: 14,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 6,
  },
  metricUnit: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6B7280',
  },
  metricLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
});