import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================
// 1. DATA GERAKAN — DIPERBANYAK (MIN 5, MAKS 10 PER TAB)
// ============================================================
const EXERCISE_DATA = {
  Dada: [
    {
      id: 'pushup',
      name: 'Push Up',
      icon: 'body-outline',
      target: 'Dada & Lengan',
      instruction: 'Posisikan tangan selebar bahu, turunkan badan lurus, lalu dorong kembali ke atas.',
    },
    {
      id: 'wide-pushup',
      name: 'Wide Push Up',
      icon: 'body-outline',
      target: 'Dada Luar',
      instruction: 'Letakkan tangan lebih lebar dari bahu, turunkan dada, lalu dorong kembali. Fokus ke dada bagian luar.',
    },
    {
      id: 'diamond-pushup',
      name: 'Diamond Push Up',
      icon: 'body-outline',
      target: 'Dada Dalam & Trisep',
      instruction: 'Rapatkan kedua tangan membentuk segitiga di bawah dada, dorong badan ke atas dengan siku rapat.',
    },
    {
      id: 'decline-pushup',
      name: 'Decline Push Up',
      icon: 'body-outline',
      target: 'Dada Atas',
      instruction: 'Letakkan kaki di kursi/meja, tangan di lantai. Turunkan dada perlahan, lalu dorong kembali ke atas.',
    },
    {
      id: 'incline-pushup',
      name: 'Incline Push Up',
      icon: 'body-outline',
      target: 'Dada Bawah',
      instruction: 'Letakkan tangan di kursi/meja, kaki di lantai. Turunkan dada ke arah kursi, lalu dorong kembali.',
    },
    {
      id: 'chest-fly',
      name: 'Chest Fly (Tanpa Beban)',
      icon: 'body-outline',
      target: 'Dada Tengah',
      instruction: 'Berdiri tegak, rentangkan lengan lurus ke samping. Pertemukan kedua tangan di depan dada seperti memeluk pohon.',
    },
    {
      id: 'scapular-pushup',
      name: 'Scapular Push Up',
      icon: 'body-outline',
      target: 'Otot Belikat & Dada',
      instruction: 'Posisi plank tangan lurus. Turunkan badan hanya dengan merapatkan tulang belikat, tanpa menekuk siku.',
    },
  ],
  Kaki: [
    {
      id: 'squat',
      name: 'Squat',
      icon: 'walk-outline',
      target: 'Paha & Bokong',
      instruction: 'Berdiri selebar bahu, tekuk lutut seperti duduk di kursi, lalu kembali berdiri.',
    },
    {
      id: 'lunge',
      name: 'Lunge Depan',
      icon: 'walk-outline',
      target: 'Paha & Keseimbangan',
      instruction: 'Melangkah ke depan, tekuk lutut depan 90 derajat, lutut belakang mendekati lantai. Kembali ke posisi awal.',
    },
    {
      id: 'glute-bridge',
      name: 'Glute Bridge',
      icon: 'walk-outline',
      target: 'Bokong & Hamstring',
      instruction: 'Berbaring telentang, tekuk lutut, angkat pinggul ke atas membentuk jembatan, tahan sesaat, lalu turunkan.',
    },
    {
      id: 'calf-raises',
      name: 'Calf Raises',
      icon: 'walk-outline',
      target: 'Betis',
      instruction: 'Berdiri tegak, angkat tumit setinggi mungkin, tahan, lalu turunkan perlahan.',
    },
    {
      id: 'side-lunge',
      name: 'Side Lunge',
      icon: 'walk-outline',
      target: 'Paha Dalam & Luar',
      instruction: 'Melangkah lebar ke samping, tekuk lutut kiri, pindahkan berat badan ke kiri, lalu kembali ke tengah.',
    },
    {
      id: 'wall-sit',
      name: 'Wall Sit',
      icon: 'walk-outline',
      target: 'Paha Depan',
      instruction: 'Punggung menempel dinding, turunkan badan seperti duduk di kursi dengan paha sejajar lantai. Tahan posisi ini.',
    },
    {
      id: 'jump-squat',
      name: 'Jump Squat',
      icon: 'flash-outline',
      target: 'Kardio & Kaki',
      instruction: 'Lakukan squat biasa, lalu saat berdiri melompat ke atas. Mendarat dengan lutut sedikit ditekuk.',
    },
  ],
  'Bahu & Punggung': [
    {
      id: 'shoulder-stretch',
      name: 'Peregangan Bahu',
      icon: 'body-outline',
      target: 'Bahu',
      instruction: 'Tarik satu lengan menyilang ke dada, tahan dengan lengan lainnya. Ganti sisi.',
    },
    {
      id: 'cat-cow',
      name: 'Cat-Cow Stretch',
      icon: 'body-outline',
      target: 'Punggung',
      instruction: 'Posisi merangkak, lengkungkan punggung ke atas (kucing), lalu lengkungkan ke bawah (sapi).',
    },
    {
      id: 'neck-stretch',
      name: 'Peregangan Leher',
      icon: 'body-outline',
      target: 'Leher & Traps',
      instruction: 'Miringkan kepala perlahan ke kanan dan kiri, tahan masing-masing sisi.',
    },
    {
      id: 'superman',
      name: 'Superman Stretch',
      icon: 'body-outline',
      target: 'Punggung Bawah',
      instruction: 'Tengkurap, angkat kedua tangan dan kaki secara bersamaan ke atas, tahan sebentar, lalu turunkan.',
    },
    {
      id: 'bird-dog',
      name: 'Bird Dog',
      icon: 'body-outline',
      target: 'Keseimbangan & Punggung',
      instruction: 'Merangkak, angkat tangan kanan ke depan dan kaki kiri ke belakang secara bersamaan. Tahan, lalu ganti sisi.',
    },
    {
      id: 'shoulder-press',
      name: 'Shoulder Press (Botol Air)',
      icon: 'body-outline',
      target: 'Bahu Atas',
      instruction: 'Berdiri, angkat beban (botol air) dari bahu ke atas kepala hingga lengan lurus, turunkan perlahan.',
    },
    {
      id: 'bent-over-row',
      name: 'Bent Over Row',
      icon: 'body-outline',
      target: 'Punggung Tengah',
      instruction: 'Membungkuk dengan punggung lurus, tarik beban ke arah dada, lalu turunkan perlahan.',
    },
    {
      id: 'child-pose',
      name: 'Child Pose',
      icon: 'body-outline',
      target: 'Relaksasi Punggung',
      instruction: 'Duduk di tumit, membungkuk ke depan, lengan diluruskan ke depan menyentuh lantai. Tahan selama 30 detik.',
    },
  ],
  'Otot perut': [
    {
      id: 'plank',
      name: 'Plank',
      icon: 'remove-outline',
      target: 'Otot Perut',
      instruction: 'Tahan posisi tubuh lurus bertumpu pada lengan dan ujung kaki, jangan turunkan pinggul.',
    },
    {
      id: 'situp',
      name: 'Sit Up',
      icon: 'triangle-outline',
      target: 'Otot Perut',
      instruction: 'Berbaring, tekuk lutut, angkat badan ke atas mendekati lutut, lalu turunkan kembali.',
    },
    {
      id: 'crunches',
      name: 'Crunches',
      icon: 'triangle-outline',
      target: 'Perut Atas',
      instruction: 'Berbaring tekuk lutut, angkat bahu dari lantai, tahan sebentar, lalu turunkan.',
    },
    {
      id: 'russian-twist',
      name: 'Russian Twist',
      icon: 'triangle-outline',
      target: 'Otot Samping Perut (Obliques)',
      instruction: 'Duduk dengan kaki diangkat, condongkan badan, putar badan ke kiri dan kanan secara bergantian.',
    },
    {
      id: 'leg-raises',
      name: 'Leg Raises',
      icon: 'triangle-outline',
      target: 'Perut Bawah',
      instruction: 'Berbaring telentang, angkat kedua kaki lurus ke atas hingga 90 derajat, lalu turunkan perlahan.',
    },
    {
      id: 'bicycle-crunch',
      name: 'Bicycle Crunch',
      icon: 'triangle-outline',
      target: 'Perut & Obliques',
      instruction: 'Berbaring, putar siku kanan mendekati lutut kiri, lalu siku kiri mendekati lutut kanan (gerakan mengayuh).',
    },
    {
      id: 'side-plank',
      name: 'Side Plank',
      icon: 'remove-outline',
      target: 'Otot Samping Perut',
      instruction: 'Bertumpu pada satu siku, angkat pinggul membentuk garis lurus dari kepala hingga kaki. Tahan posisi.',
    },
    {
      id: 'dead-bug',
      name: 'Dead Bug',
      icon: 'triangle-outline',
      target: 'Core & Keseimbangan',
      instruction: 'Berbaring telentang, angkat tangan dan kaki ke atas. Rentangkan tangan kiri & kaki kanan ke bawah, lalu kembali.',
    },
  ],
  Lengan: [
    {
      id: 'jumpingjack',
      name: 'Jumping Jack',
      icon: 'flash-outline',
      target: 'Kardio & Lengan',
      instruction: 'Lompat sambil membuka kaki dan mengangkat kedua tangan ke atas, lalu kembali ke posisi awal.',
    },
    {
      id: 'arm-circles',
      name: 'Arm Circles',
      icon: 'body-outline',
      target: 'Bahu & Lengan',
      instruction: 'Rentangkan lengan ke samping, putar lengan ke depan 10 kali, lalu putar ke belakang 10 kali.',
    },
    {
      id: 'tricep-dips',
      name: 'Tricep Dips (Kursi)',
      icon: 'body-outline',
      target: 'Trisep & Lengan Bawah',
      instruction: 'Letakkan tangan di kursi, tekuk siku, turunkan badan ke bawah, lalu dorong kembali ke atas.',
    },
    {
      id: 'bicep-curls',
      name: 'Bicep Curls (Botol Air)',
      icon: 'body-outline',
      target: 'Bisep',
      instruction: 'Pegang botol air, tekuk siku, angkat botol ke arah bahu, lalu turunkan perlahan.',
    },
    {
      id: 'tricep-extension',
      name: 'Tricep Extension',
      icon: 'body-outline',
      target: 'Trisep',
      instruction: 'Angkat lengan ke atas, tekuk siku ke belakang kepala, tahan sebentar, lalu kembali ke atas.',
    },
    {
      id: 'wrist-stretches',
      name: 'Wrist Stretches',
      icon: 'body-outline',
      target: 'Peregangan Pergelangan',
      instruction: 'Rentangkan lengan ke depan, tarik jari telunjuk ke arah badan dengan tangan lain. Lakukan pada kedua tangan.',
    },
    {
      id: 'punching',
      name: 'Punching',
      icon: 'flash-outline',
      target: 'Kardio & Lengan',
      instruction: 'Posisi kuda-kuda, lakukan pukulan bergantian ke depan (seperti tinju) dengan cepat selama 30 detik.',
    },
  ],
};

// TAB SESUAI GAMBAR
const CATEGORY_TABS = [
  { id: 'Dada', label: 'Dada', icon: 'body-outline' },
  { id: 'Kaki', label: 'Kaki', icon: 'walk-outline' },
  { id: 'Bahu & Punggung', label: 'Bahu & Punggung', icon: 'body-outline' },
  { id: 'Otot perut', label: 'Otot perut', icon: 'triangle-outline' },
  { id: 'Lengan', label: 'Lengan', icon: 'flash-outline' },
  { id: 'Wishlist', label: 'Favorit', icon: 'bookmark-outline' },
];

export default function OlahragaScreen() {
  // --- STATE UTAMA ---
  const [activeTab, setActiveTab] = useState('Dada');
  const [wishlist, setWishlist] = useState([]);

  const [activeExercise, setActiveExercise] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [activeMinutes, setActiveMinutes] = useState(0);
  const [streak, setStreak] = useState(0);
  
  // --- STATE SUARA (TTS) ---
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isVoiceLoaded, setIsVoiceLoaded] = useState(false);

  // --- STATE MODAL KONFIGURASI ---
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedExerciseForModal, setSelectedExerciseForModal] = useState(null);
  const [sets, setSets] = useState('1');
  const [durationSeconds, setDurationSeconds] = useState('30');

  // --- STATE COUNTDOWN SEBELUM MULAI ---
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdownNum, setCountdownNum] = useState(null);
  const countdownTimeoutRef = useRef([]);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);
  const spokenCountRef = useRef(new Set());

  // ============================================================
  // 2. MEMUAT SUARA & STREAK HARIAN
  // ============================================================
  useEffect(() => {
    const updateStreak = async () => {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const stored = await AsyncStorage.getItem('olahraga_streak');
        const data = stored ? JSON.parse(stored) : { count: 0, lastDate: null };

        if (data.lastDate === today) {
          setStreak(data.count);
        } else {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().slice(0, 10);

          const newCount = data.lastDate === yesterdayStr ? data.count + 1 : 1;
          const newData = { count: newCount, lastDate: today };
          await AsyncStorage.setItem('olahraga_streak', JSON.stringify(newData));
          setStreak(newCount);
        }
      } catch (e) {
        console.warn('Gagal membaca/menulis streak:', e);
      }
    };

    const loadVoices = async () => {
      try {
        const voices = await Speech.getAvailableVoicesAsync();
        const indoVoices = voices.filter(v => v.language.startsWith('id'));
        let googleLikeVoice = indoVoices.find(v =>
          v.name.toLowerCase().includes('google') ||
          v.name.toLowerCase().includes('samantha') ||
          v.name.toLowerCase().includes('amelia')
        );
        if (!googleLikeVoice && indoVoices.length > 0) googleLikeVoice = indoVoices[0];
        setSelectedVoice(googleLikeVoice ? googleLikeVoice.identifier : null);
      } catch (error) {
        console.log('Gagal memuat daftar suara TTS:', error);
      } finally {
        setIsVoiceLoaded(true);
      }
    };

    updateStreak();
    loadVoices();

    return () => {
      clearInterval(timerRef.current);
      Speech.stop();
    };
  }, []);

  // ============================================================
  // 3. FUNGSI UTAMA SUARA (Gaya Google)
  // ============================================================
  const speak = (text) => {
    try {
      Speech.speak(text, {
        language: 'id-ID',
        pitch: 1.0,
        rate: 0.9,
        voice: selectedVoice
      });
    } catch (error) {
      console.warn('Gagal memutar suara:', error);
    }
  };

  // ============================================================
  // 4. WISHLIST HANDLER
  // ============================================================
  const toggleWishlist = (id) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // ============================================================
  // 5. LOGIKA MEMBUKA MODAL & MEMULAI LATIHAN
  // ============================================================
  const openExerciseConfig = (exercise) => {
    setSets('1');
    setDurationSeconds('30');
    setSelectedExerciseForModal(exercise);
    setModalVisible(true);
  };

  const confirmStartExercise = () => {
    const numSets = parseInt(sets);
    const numDurationSeconds = parseInt(durationSeconds);

    if (isNaN(numSets) || numSets < 1 || isNaN(numDurationSeconds) || numDurationSeconds < 1) {
      Alert.alert('Input Tidak Valid', 'Harap masukkan angka minimal 1 untuk Set dan Detik.');
      return;
    }

    const calculatedTotalDuration = numSets * numDurationSeconds;
    
    setModalVisible(false);
    setSelectedExerciseForModal(null);

    startExercise(selectedExerciseForModal, calculatedTotalDuration);
  };

  const startExercise = (exercise, duration) => {
    // Bersihkan semua yang mungkin masih berjalan
    clearInterval(timerRef.current);
    countdownTimeoutRef.current.forEach(t => clearTimeout(t));
    countdownTimeoutRef.current = [];
    Speech.stop();
    spokenCountRef.current = new Set();

    // Tampilkan kartu sesi, timer BELUM jalan
    setActiveExercise(exercise);
    setIsPaused(false);
    setTimeRemaining(duration);
    setTotalDuration(duration);
    setIsCountingDown(false);
    setCountdownNum(null);
    progressAnim.setValue(0);

    // ── Fungsi yang dijalankan setelah countdown selesai ──
    const beginTimer = () => {
      setIsCountingDown(false);
      setCountdownNum(null);
      Speech.speak('Mulai!', {
        language: 'id-ID',
        rate: 1.0,
        onDone: () => {
          Animated.timing(progressAnim, {
            toValue: 1,
            duration: duration * 1000,
            easing: Easing.linear,
            useNativeDriver: false,
          }).start();

          timerRef.current = setInterval(() => {
            setTimeRemaining((prev) => {
              const next = prev - 1;
              if (next === Math.floor(duration / 2) && !spokenCountRef.current.has('half')) {
                spokenCountRef.current.add('half');
                speak('Setengah jalan, tetap semangat!');
              }
              if (next > 0 && next <= 5) speak(`${next}`);
              if (next <= 0) {
                clearInterval(timerRef.current);
                speak('Selesai! Kerja bagus.');
                const multiplier = duration / 30;
                setCaloriesBurned((c) => parseFloat((c + 1.5 * multiplier).toFixed(1)));
                setActiveMinutes((m) => m + Math.floor(duration / 60));
                return 0;
              }
              return next;
            });
          }, 1000);
        },
      });
    };

    // ── Countdown 1: angka "1" ──
    const sayOne = () => {
      Speech.speak('1', {
        language: 'id-ID',
        rate: 1.0,
        pitch: 1.2,
        onStart: () => setCountdownNum(1),   // Nomor muncul SAAT suara mulai
        onDone: beginTimer,
      });
    };

    // ── Countdown 2: angka "2" ──
    const sayTwo = () => {
      Speech.speak('2', {
        language: 'id-ID',
        rate: 1.0,
        pitch: 1.1,
        onStart: () => setCountdownNum(2),   // Nomor muncul SAAT suara mulai
        onDone: sayOne,
      });
    };

    // ── Countdown 3: angka "3" ──
    const sayThree = () => {
      setIsCountingDown(true);
      Speech.speak('3', {
        language: 'id-ID',
        rate: 1.0,
        pitch: 1.0,
        onStart: () => setCountdownNum(3),   // Nomor muncul SAAT suara mulai
        onDone: sayTwo,
      });
    };

    // ── Fase 1: Baca instruksi → setelah selesai langsung mulai countdown ──
    Speech.speak(`${exercise.name}. ${exercise.instruction}`, {
      language: 'id-ID',
      rate: 0.9,
      onDone: sayThree,   // Countdown mulai SETELAH instruksi selesai dibacakan
    });
  };




  const handlePause = () => {
    setIsPaused(true);
    clearInterval(timerRef.current);
    progressAnim.stopAnimation();
    Speech.stop();
  };

  const handleResume = () => {
    if (!activeExercise) return;
    setIsPaused(false);
    speak('Lanjutkan gerakan.');

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        const next = prev - 1;
        if (next > 0 && next <= 5) speak(`${next}`);
        if (next <= 0) {
          clearInterval(timerRef.current);
          speak('Selesai! Kerja bagus.');
          const baseDuration = 30;
          const multiplier = totalDuration / baseDuration;
          setCaloriesBurned((c) => parseFloat((c + 1.5 * multiplier).toFixed(1)));
          setActiveMinutes((m) => m + Math.floor(totalDuration / 60));
          return 0;
        }
        return next;
      });
    }, 1000);
  };

  const handleStop = () => {
    clearInterval(timerRef.current);
    countdownTimeoutRef.current.forEach(t => clearTimeout(t));
    countdownTimeoutRef.current = [];
    progressAnim.stopAnimation();
    Speech.stop();
    setIsCountingDown(false);
    setCountdownNum(null);
    setActiveExercise(null);
    setIsPaused(false);
    setTimeRemaining(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // ============================================================
  // 6. DATA YANG DITAMPILKAN SESUAI TAB AKTIF
  // ============================================================
  const getDisplayedExercises = () => {
    if (activeTab === 'Wishlist') {
      const all = Object.values(EXERCISE_DATA).flat();
      return all.filter((ex) => wishlist.includes(ex.id));
    }
    return EXERCISE_DATA[activeTab] || [];
  };

  const displayedExercises = getDisplayedExercises();

  // --- RENDER UTAMA ---
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Olahraga</Text>
          <Text style={styles.subtitle}>Aktivitas fisik ringan dengan panduan suara.</Text>
        </View>

        {/* TOMBOL CEK SUARA */}
        <TouchableOpacity 
          style={styles.testVoiceBtn}
          onPress={() => {
            if (!isVoiceLoaded) {
              Alert.alert("Memuat Suara", "Suara sedang dimuat, silakan tunggu sebentar...");
              return;
            }
            speak('Halo, ini adalah tes suara. Aplikasi Olahraga siap digunakan!');
          }}
        >
          <Ionicons name="volume-high" size={20} color="#2563EB" style={{ marginRight: 8 }} />
          <Text style={styles.testVoiceBtnText}>Cek Suara / Test Voice</Text>
        </TouchableOpacity>

        {/* TAB KATEGORI (Bergaya Seperti Gambar) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabRow}
        >
          {CATEGORY_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabChip, activeTab === tab.id && styles.tabChipActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons
                name={tab.icon}
                size={16}
                color={activeTab === tab.id ? '#2563EB' : '#6B7280'}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* SESI LATIHAN AKTIF */}
        {activeExercise && (
          <View style={styles.card}>
            <View style={styles.sessionHeader}>
              <Text style={styles.cardTitle}>{activeExercise.name}</Text>
              <View style={styles.voiceBadge}>
                <Ionicons name="mic" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.voiceBadgeText}>Voice Guide</Text>
              </View>
            </View>

            <View style={styles.timerContainer}>
              <Animated.View
                style={[
                  styles.timerCircle,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
              <View style={styles.timerTextWrap}>
                {isCountingDown ? (
                  // Tampilan countdown
                  <>
                    <Text style={styles.timerLabel}>Bersiap...</Text>
                    <Text style={[styles.timerValue, { color: '#2563EB', fontSize: 64 }]}>
                      {countdownNum ?? '...'}
                    </Text>
                    <Text style={styles.timerSubLabel}>Segera mulai</Text>
                  </>
                ) : (
                  // Tampilan timer normal
                  <>
                    <Text style={styles.timerLabel}>Sisa Waktu</Text>
                    <Text style={styles.timerValue}>{formatTime(timeRemaining)}</Text>
                    <Text style={styles.timerSubLabel}>{activeExercise.target}</Text>
                  </>
                )}
              </View>
            </View>

            <View style={styles.controlRow}>
              <TouchableOpacity
                style={[styles.controlBtn, isCountingDown && { opacity: 0.4 }]}
                onPress={isPaused ? handleResume : handlePause}
                disabled={isCountingDown}
              >
                <Ionicons name={isPaused ? 'play' : 'pause'} size={22} color="#2563EB" />
                <Text style={styles.controlBtnLabel}>{isPaused ? 'Lanjut' : 'Jeda'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.controlBtn, { borderColor: '#EF5350' }]}
                onPress={handleStop}
              >
                <Ionicons name="stop" size={22} color="#EF5350" />
                <Text style={[styles.controlBtnLabel, { color: '#EF5350' }]}>Stop</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* DAFTAR GERAKAN */}
        <View style={styles.listSection}>
          <Text style={styles.sectionLabel}>
            {activeTab === 'Wishlist' ? 'Gerakan Favorit Saya' : `Latihan ${activeTab}`}
          </Text>

          {displayedExercises.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="bookmark-outline" size={32} color="#9CA3AF" />
              <Text style={styles.emptyStateText}>
                {activeTab === 'Wishlist'
                  ? 'Belum ada gerakan favorit. Tekan ikon hati pada card untuk menambahkan.'
                  : 'Belum ada gerakan di kategori ini.'}
              </Text>
            </View>
          ) : (
            displayedExercises.map((ex) => {
              const isFavorite = wishlist.includes(ex.id);
              const isThisActive = activeExercise?.id === ex.id;
              return (
                <View key={ex.id} style={styles.exerciseCard}>
                  <TouchableOpacity
                    style={styles.wishlistBtn}
                    onPress={() => toggleWishlist(ex.id)}
                  >
                    <Ionicons
                      name={isFavorite ? 'heart' : 'heart-outline'}
                      size={20}
                      color={isFavorite ? '#EF5350' : '#9CA3AF'}
                    />
                  </TouchableOpacity>

                  <View style={styles.exerciseIconWrap}>
                    <Ionicons name={ex.icon} size={26} color="#2563EB" />
                  </View>

                  <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName}>{ex.name}</Text>
                    <Text style={styles.exerciseTarget}>{ex.target}</Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.startBtnSmall, isThisActive && styles.startBtnSmallActive]}
                    onPress={() => openExerciseConfig(ex)}
                  >
                    <Ionicons
                      name={isThisActive ? 'volume-high' : 'play'}
                      size={16}
                      color="#FFFFFF"
                    />
                    <Text style={styles.startBtnSmallText}>
                      {isThisActive ? 'Aktif' : 'Mulai'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>

        {/* METRIK PROGRES */}
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

      {/* ============================================================
          MODAL KONFIGURASI SET & DETIK
         ============================================================ */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Atur Latihan</Text>
            <Text style={styles.modalSubtitle}>
              {selectedExerciseForModal ? selectedExerciseForModal.name : ''}
            </Text>

            {/* Input Set */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Jumlah Set</Text>
              <View style={styles.counterRow}>
                <TouchableOpacity 
                  style={styles.counterBtn} 
                  onPress={() => setSets(prev => Math.max(1, parseInt(prev || 1) - 1).toString())}
                >
                  <Ionicons name="remove" size={20} color="#2563EB" />
                </TouchableOpacity>
                <TextInput
                  style={styles.counterInput}
                  value={sets}
                  onChangeText={setSets}
                  keyboardType="numeric"
                  textAlign="center"
                />
                <TouchableOpacity 
                  style={styles.counterBtn} 
                  onPress={() => setSets(prev => (parseInt(prev || 1) + 1).toString())}
                >
                  <Ionicons name="add" size={20} color="#2563EB" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Input Durasi per Set (Detik) */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Durasi per Set (Detik)</Text>
              <View style={styles.counterRow}>
                <TouchableOpacity 
                  style={styles.counterBtn} 
                  onPress={() => setDurationSeconds(prev => Math.max(5, (parseInt(prev || 30) - 5)).toString())}
                >
                  <Ionicons name="remove" size={20} color="#2563EB" />
                </TouchableOpacity>
                <TextInput
                  style={styles.counterInput}
                  value={durationSeconds}
                  onChangeText={setDurationSeconds}
                  keyboardType="numeric"
                  textAlign="center"
                />
                <TouchableOpacity 
                  style={styles.counterBtn} 
                  onPress={() => setDurationSeconds(prev => (parseInt(prev || 30) + 5).toString())}
                >
                  <Ionicons name="add" size={20} color="#2563EB" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={confirmStartExercise}>
                <Text style={styles.confirmBtnText}>Mulai Latihan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ============================================================
// 7. STYLES (Disesuaikan dengan Contoh Gambar)
// ============================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FF' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 },
  header: { marginBottom: 16, marginTop: 10 },
  title: { fontSize: 26, fontWeight: '800', color: '#111827', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#6B7280', lineHeight: 22 },

  // TOMBOL TES SUARA
  testVoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DBEAFE',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#93C5FD',
  },
  testVoiceBtnText: { fontWeight: '700', color: '#2563EB', fontSize: 14 },

  // TAB - GAYA BARU
  tabRow: { paddingBottom: 16, gap: 8 },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 6,
  },
  tabChipActive: {
    backgroundColor: '#F0F7FF',
    borderWidth: 1.5,
    borderColor: '#2563EB',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#2563EB',
  },

  // CARD UMUM
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
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },

  // SESI AKTIF
  sessionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  voiceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  voiceBadgeText: { color: '#FFFFFF', fontWeight: '600', fontSize: 10 },
  timerContainer: { height: 130, justifyContent: 'center', alignItems: 'center', marginBottom: 16, position: 'relative' },
  timerCircle: { position: 'absolute', bottom: 0, left: 0, height: 6, backgroundColor: '#2563EB', borderRadius: 6 },
  timerTextWrap: { alignItems: 'center' },
  timerLabel: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  timerValue: { fontSize: 38, fontWeight: '800', color: '#111827', marginVertical: 4 },
  timerSubLabel: { fontSize: 13, color: '#9CA3AF' },

  controlRow: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
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
  controlBtnLabel: { fontSize: 13, fontWeight: '600', color: '#374151' },

  // LIST GERAKAN
  listSection: { marginBottom: 16 },
  sectionLabel: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 10 },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
  },
  wishlistBtn: { paddingRight: 10 },
  exerciseIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EFF3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exerciseInfo: { flex: 1 },
  exerciseName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  exerciseTarget: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  startBtnSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  startBtnSmallActive: { backgroundColor: '#10B981' },
  startBtnSmallText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },

  // EMPTY STATE
  emptyState: { alignItems: 'center', paddingVertical: 30, paddingHorizontal: 20 },
  emptyStateText: { textAlign: 'center', color: '#9CA3AF', fontSize: 13, marginTop: 10, lineHeight: 20 },

  // METRIK
  metricRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 14 },
  metricItem: { flex: 1, alignItems: 'center', backgroundColor: '#F9FAFB', paddingVertical: 12, borderRadius: 14 },
  metricValue: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 6 },
  metricUnit: { fontSize: 13, fontWeight: '400', color: '#6B7280' },
  metricLabel: { fontSize: 11, color: '#6B7280', marginTop: 2 },

  // ===== STYLE MODAL =====
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 16,
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  counterBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterInput: {
    width: 60,
    height: 44,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  modalActions: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4B5563',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});