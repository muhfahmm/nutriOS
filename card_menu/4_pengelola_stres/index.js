import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  TextInput,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../auth/AuthContext';
import GeminiConsultantModal from '../../components/GeminiConsultantModal';

const { width } = Dimensions.get('window');

export default function PengelolaStresScreen() {

  const { user } = useContext(AuthContext);
  const [isAiModalVisible, setIsAiModalVisible] = useState(false);
  const [mood, setMood] = useState(null);
  const [breathingMode, setBreathingMode] = useState('Tidur');
  const [isBreathing, setIsBreathing] = useState(false);
  const [journalText, setJournalText] = useState('');
  const [stressLevel, setStressLevel] = useState('Sedang');
  const [selectedTags, setSelectedTags] = useState([]);


  const [breathTextMsg, setBreathTextMsg] = useState('Siap');
  const [timeLeft, setTimeLeft] = useState(60);

  const isBreathingRef = useRef(false);
  const selectedModeRef = useRef('Tidur');
  const timerRef = useRef(null);
  const breathAnim = useRef(new Animated.Value(1)).current;


  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
    };
  }, []);

  const runBreathingCycle = () => {
    if (!isBreathingRef.current) return;
    const mode = selectedModeRef.current;

    if (mode === 'Tidur') {

      setBreathTextMsg('Tarik Napas...');
      Animated.timing(breathAnim, {
        toValue: 1.8,
        duration: 4000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished || !isBreathingRef.current) return;

        setBreathTextMsg('Tahan Napas...');
        Animated.timing(breathAnim, {
          toValue: 1.8,
          duration: 7000,
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (!finished || !isBreathingRef.current) return;

          setBreathTextMsg('Hembuskan Napas...');
          Animated.timing(breathAnim, {
            toValue: 0.6,
            duration: 8000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }).start(({ finished }) => {
            if (finished && isBreathingRef.current) {
              runBreathingCycle();
            }
          });
        });
      });
    } else {

      setBreathTextMsg('Tarik Napas...');
      Animated.timing(breathAnim, {
        toValue: 1.8,
        duration: 4000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished || !isBreathingRef.current) return;

        setBreathTextMsg('Hembuskan Napas...');
        Animated.timing(breathAnim, {
          toValue: 0.6,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (finished && isBreathingRef.current) {
            runBreathingCycle();
          }
        });
      });
    }
  };

  const startBreathing = (mode) => {
    isBreathingRef.current = true;
    setIsBreathing(true);
    selectedModeRef.current = mode;
    setBreathingMode(mode);

    if (mode === 'Cepat') {
      setTimeLeft(60);
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            stopBreathing();
            alert('Latihan Pemulihan Cepat selesai! Pikiran Anda kini lebih jernih.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    runBreathingCycle();
  };

  const stopBreathing = () => {
    isBreathingRef.current = false;
    setIsBreathing(false);
    clearInterval(timerRef.current);
    breathAnim.stopAnimation();
    breathAnim.setValue(1);
    setBreathTextMsg('Siap');
  };

  const toggleBreathing = (mode = breathingMode) => {
    if (isBreathing) {
      stopBreathing();
    } else {
      startBreathing(mode);
    }
  };

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSaveJournal = () => {
    if (!journalText.trim() && selectedTags.length === 0) {
      alert('Silakan tulis cerita Anda atau pilih minimal satu pemicu stres!');
      return;
    }
    alert(`Jurnal tersimpan! Pemicu teridentifikasi: ${selectedTags.join(', ') || 'Tanpa tag'}`);
    setJournalText('');
    setSelectedTags([]);
  };





  const insights = [
    "Dalam 7 hari terakhir, Anda stres tinggi pada hari Selasa & Kamis. Pola tidur Anda pada malam sebelumnya hanya 5 jam. Coba tidur lebih awal!",
    "Stres Anda menurun 20% pada hari-hari saat Anda makan teratur."
  ];

    return (
    <SafeAreaView style={[styles.container, isSOSActive && styles.sosContainerOverlay]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {}
        <View style={styles.headerRow}>
          <View style={styles.header}>
            <Text style={styles.title}>Pengelola Stres</Text>
            <Text style={styles.subtitle}>Kenali suasana hati dan temukan ketenangan.</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity style={styles.headerSparklesBtn} onPress={() => setIsAiModalVisible(true)}>
              <Ionicons name="sparkles" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {}

            {}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Mood Check-in</Text>
              <Text style={styles.subCardTitle}>Bagaimana perasaan Anda hari ini?</Text>
              <View style={styles.moodRow}>
                {[
                  { emoji: '😄', label: 'Sangat Bahagia' },
                  { emoji: '😐', label: 'Biasa Saja' },
                  { emoji: '😟', label: 'Cemas' },
                  { emoji: '😠', label: 'Marah' },
                  { emoji: '😫', label: 'Sangat Stres' },
                ].map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.moodBtn, mood === idx && styles.moodBtnActive]}
                    onPress={() => setMood(idx)}
                  >
                    <Text style={styles.moodEmoji}>{item.emoji}</Text>
                    <Text style={[styles.moodLabel, mood === idx && styles.moodLabelActive]}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={styles.saveBtn} onPress={() => alert('Data mood tersimpan untuk grafik mingguan!')}>
                <Text style={styles.saveBtnText}>Simpan Mood Hari Ini</Text>
              </TouchableOpacity>
            </View>

            {}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Latihan Pernapasan</Text>

              <View style={styles.modeSelector}>
                <TouchableOpacity
                  style={[styles.modeBtn, breathingMode === 'Tidur' && styles.modeBtnActive]}
                  onPress={() => {
                    if (isBreathing) stopBreathing();
                    setBreathingMode('Tidur');
                  }}
                >
                  <Text style={[styles.modeBtnText, breathingMode === 'Tidur' && styles.modeBtnTextActive]}>Tidur (4-7-8)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modeBtn, breathingMode === 'Cepat' && styles.modeBtnActive]}
                  onPress={() => {
                    if (isBreathing) stopBreathing();
                    setBreathingMode('Cepat');
                  }}
                >
                  <Text style={[styles.modeBtnText, breathingMode === 'Cepat' && styles.modeBtnTextActive]}>Cepat (1m)</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.breathingDisplay}>
                <Animated.View style={[styles.breathCircleSmall, { transform: [{ scale: breathAnim }] }]} />
                <Text style={styles.breathInstructionSmall}>
                  {isBreathing ? breathTextMsg : 'Siap'}
                </Text>
              </View>

              {breathingMode === 'Cepat' && isBreathing && (
                <Text style={styles.breathCountdownText}>Sisa Waktu: {timeLeft}s</Text>
              )}

              <TouchableOpacity style={styles.startBreathingBtn} onPress={() => toggleBreathing()}>
                <Ionicons name={isBreathing ? 'stop-circle' : 'play-circle'} size={24} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.startBreathingText}>
                  {isBreathing ? 'Hentikan Latihan' : 'Mulai Latihan'}
                </Text>
              </TouchableOpacity>
            </View>

            {}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Analisis & Korelasi</Text>
              <View style={styles.insightBox}>
                <Ionicons name="bulb-outline" size={24} color="#F59E0B" style={{ marginBottom: 8 }} />
                <Text style={styles.insightText}>{insights[0]}</Text>
                <View style={styles.insightTag}>
                  <Text style={styles.insightTagText}>Berdasarkan data tidur</Text>
                </View>
              </View>
              <View style={[styles.insightBox, { marginTop: 12 }]}>
                <Ionicons name="fast-food-outline" size={24} color="#10B981" style={{ marginBottom: 8 }} />
                <Text style={styles.insightText}>{insights[1]}</Text>
                <View style={[styles.insightTag, { backgroundColor: '#D1FAE5' }]}>
                  <Text style={[styles.insightTagText, { color: '#047857' }]}>Berdasarkan pola makan</Text>
                </View>
              </View>
            </View>

            {}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Jurnal Pemicu Stres</Text>
              <Text style={styles.subCardTitle}>Apa yang membuat Anda stres hari ini? (Pilih pemicu di bawah)</Text>

              {}
              <View style={styles.tagGrid}>
                {['💼 Pekerjaan', '👨‍👩‍👧 Keluarga', '🏥 Kesehatan', '🪙 Keuangan', '❤️ Hubungan'].map((tag) => {
                  const isActive = selectedTags.includes(tag);
                  return (
                    <TouchableOpacity
                      key={tag}
                      style={[styles.tagItem, isActive && styles.tagItemActive]}
                      onPress={() => toggleTag(tag)}
                    >
                      <Text style={[styles.tagItemText, isActive && styles.tagItemTextActive]}>
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TextInput
                style={styles.journalInput}
                multiline
                numberOfLines={4}
                placeholder="Ceritakan detail pemicu stres Anda di sini..."
                placeholderTextColor="#9CA3AF"
                value={journalText}
                onChangeText={setJournalText}
              />
              <TouchableOpacity style={styles.saveJournalBtn} onPress={handleSaveJournal}>
                <Text style={styles.saveJournalBtnText}>Simpan Jurnal</Text>
              </TouchableOpacity>
            </View>

            {}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Saran Cerdas</Text>
              <Text style={styles.subCardTitle}>Berdasarkan tingkat stres Anda (Tingkat Stres: {stressLevel})</Text>

              <TouchableOpacity style={styles.aiSuggestion} onPress={() => alert('Mengarahkan ke halaman Olahraga')}>
                <View style={styles.aiIconWrap}>
                  <Ionicons name="barbell-outline" size={20} color="#2563EB" />
                </View>
                <View style={styles.aiContent}>
                  <Text style={styles.aiTitle}>Butuh gerak?</Text>
                  <Text style={styles.aiDesc}>Coba olahraga ringan 10 menit untuk melepas endorfin!</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.aiSuggestion, { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 14, marginTop: 14 }]} onPress={() => alert('Mengarahkan ke Rekomendasi Makanan')}>
                <View style={[styles.aiIconWrap, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="nutrition-outline" size={20} color="#D97706" />
                </View>
                <View style={styles.aiContent}>
                  <Text style={styles.aiTitle}>Stres bikin lapar?</Text>
                  <Text style={styles.aiDesc}>Coba ngemil buah pisang atau yoghurt sebagai camilan sehat.</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

      </ScrollView>

      <GeminiConsultantModal
        visible={isAiModalVisible}
        onClose={() => setIsAiModalVisible(false)}
        context={{
          type: 'stress',
          user: user
        }}
        title="NutriOS AI: Pengelola Stres"
        systemPrompt="Bertindaklah sebagai asisten kesehatan mental cerdas. Berikan saran teknik relaksasi, meditasi, peregangan otot ringan, cara mengelola cemas/stres, atau kata-kata motivasi yang menenangkan."
      />
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    marginTop: 10,
  },
  header: {
    flex: 1,
    paddingRight: 12,
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
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF5350',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    shadowColor: '#EF5350',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  sosText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 4,
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


  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
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
    fontSize: 24,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 9,
    fontWeight: '500',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  moodLabelActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  saveBtn: {
    borderWidth: 1.5,
    borderColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  saveBtnText: {
    color: '#2563EB',
    fontWeight: '700',
    fontSize: 14,
  },


  modeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  modeBtnActive: {
    backgroundColor: '#2563EB',
  },
  modeBtnText: {
    fontWeight: '600',
    color: '#6B7280',
    fontSize: 13,
  },
  modeBtnTextActive: {
    color: '#FFFFFF',
  },
  breathingDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    marginBottom: 16,
  },
  breathCircleSmall: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    borderWidth: 2,
    borderColor: '#2563EB',
    position: 'absolute',
  },
  breathInstructionSmall: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    elevation: 2,
  },
  startBreathingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 12,
  },
  startBreathingText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },


  insightBox: {
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 14,
  },
  insightText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#374151',
    marginBottom: 8,
  },
  insightTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  insightTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2563EB',
  },


  journalInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    textAlignVertical: 'top',
    marginBottom: 14,
  },
  saveJournalBtn: {
    borderWidth: 1.5,
    borderColor: '#10B981',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  saveJournalBtnText: {
    color: '#10B981',
    fontWeight: '700',
    fontSize: 14,
  },


  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  tagItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tagItemActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  tagItemText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  tagItemTextActive: {
    color: '#10B981',
    fontWeight: '700',
  },


  breathCountdownText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '700',
    marginBottom: 12,
  },
  timeLeftText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
  },


  aiSuggestion: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  aiContent: {
    flex: 1,
  },
  aiTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  aiDesc: {
    fontSize: 13,
    color: '#6B7280',
  },


  sosContainerOverlay: {
    backgroundColor: '#1F2937',
  },
  sosFocusMode: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  exitSosBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  exitSosText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  breathingArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathingModeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 30,
  },
  breathCircleWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    width: 200,
  },
  breathCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(37, 99, 235, 0.3)',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    position: 'absolute',
  },
  breathInstruction: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  breathControls: {
    marginTop: 40,
  },
  breathToggleBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  breathToggleText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  headerSparklesBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
});