import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigation } from '@react-navigation/native';
import GpsTrackerScreen from './GpsTrackerScreen';
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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../auth/AuthContext';
import { API_BASE_URL } from '../../auth/api';

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

const CATEGORY_TABS = [
  { id: 'Grup', label: 'Latihan', icon: 'grid-outline' },
  { id: 'GPS', label: 'Running', icon: 'navigate-outline' },
  { id: 'Wishlist', label: 'Favorit', icon: 'bookmark-outline' },
  { id: 'History', label: 'Histori', icon: 'time-outline' },
  { id: 'AI', label: 'AI Olahraga', icon: 'sparkles-outline' },
];

export default function OlahragaScreen() {
  const navigation = useNavigation();
  const { user, isDarkMode } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('Grup');
  const [activeSubTab, setActiveSubTab] = useState('Dada');
  const [wishlist, setWishlist] = useState([]);

  const [activeExercise, setActiveExercise] = useState(null);
  const activeExerciseRef = useRef(null);

  const updateActiveExercise = (exercise) => {
    setActiveExercise(exercise);
    activeExerciseRef.current = exercise;
  };
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [activeMinutes, setActiveMinutes] = useState(0);
  const [streak, setStreak] = useState(0);
  const [history, setHistory] = useState([]);
  const [isSessionFinished, setIsSessionFinished] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    { id: 'greet', sender: 'ai', text: 'Halo! Saya **NutriOS AI Olahraga**. Tanyakan rekomendasi program latihan, cara melakukan gerakan tertentu dengan benar, atau cara melatih konsistensi olahraga Anda!' }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const handleSendAi = async (textToSend) => {
    const text = textToSend || aiInput;
    if (!text.trim()) return;

    setAiInput('');
    const userMsgId = Date.now().toString();
    setAiMessages(prev => [...prev, { id: userMsgId, sender: 'user', text }]);
    setAiLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/ask-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          context: {
            type: 'exercise',
            caloriesBurned,
            activeMinutes,
            streak,
            history
          }
        })
      });

      const data = await response.json();
      const aiMsgId = (Date.now() + 1).toString();

      if (response.ok && data.reply) {
        setAiMessages(prev => [...prev, { id: aiMsgId, sender: 'ai', text: data.reply.trim() }]);
      } else {
        setAiMessages(prev => [...prev, { id: aiMsgId, sender: 'ai', text: `⚠️ Gagal mendapatkan saran AI: ${data.message || 'Error server'}` }]);
      }
    } catch (e) {
      setAiMessages(prev => [...prev, { id: Date.now().toString(), sender: 'ai', text: `❌ Gagal terhubung ke server. Pastikan server dev Anda aktif.` }]);
    } finally {
      setAiLoading(false);
    }
  };

  const renderAiMessageText = (text, isUser) => {
    if (!text) return null;

    let cleanText = text;
    let menuText = "";

    const jsonRegex = /<MENU_JSON>([\s\S]*?)<\/MENU_JSON>/;
    const match = text.match(jsonRegex);
    if (match) {
      cleanText = text.replace(jsonRegex, '').trim();
      try {
        const jsonData = JSON.parse(match[1].trim());
        const menuObj = jsonData.menu_hari_ini || jsonData;
        if (menuObj) {
          menuText = "\n\n📋 **Rekomendasi Menu Makanan Hari Ini:**\n" +
            (menuObj.sarapan ? `• **Sarapan**: ${menuObj.sarapan}\n` : "") +
            (menuObj.makan_siang ? `• **Makan Siang**: ${menuObj.makan_siang}\n` : "") +
            (menuObj.makan_malam ? `• **Makan Malam**: ${menuObj.makan_malam}\n` : "") +
            (menuObj.cemilan ? `• **Cemilan**: ${menuObj.cemilan}\n` : "");
        }
      } catch (e) {
        console.warn('Gagal memproses JSON Rekomendasi Menu:', e);
      }
    }

    const combinedText = cleanText + menuText;
    const parts = combinedText.split(/(\*\*.*?\*\*)/g);

    return (
      <Text style={[isUser ? styles.aiUserText : styles.aiAiText, isDarkMode && !isUser && { color: '#F8FAFC' }]}>
        {parts.map((part, index) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <Text key={index} style={{ fontWeight: 'bold' }}>
                {part.slice(2, -2)}
              </Text>
            );
          }
          return part;
        })}
      </Text>
    );
  };

  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isVoiceLoaded, setIsVoiceLoaded] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedExerciseForModal, setSelectedExerciseForModal] = useState(null);
  const [sets, setSets] = useState('1');
  const [durationSeconds, setDurationSeconds] = useState('30');

  const [finishMode, setFinishMode] = useState('stop');
  const finishModeRef = useRef('stop');

  const updateFinishMode = (mode) => {
    setFinishMode(mode);
    finishModeRef.current = mode;
  };

  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdownNum, setCountdownNum] = useState(null);
  const countdownTimeoutRef = useRef([]);

  const [autoPlay, setAutoPlay] = useState(false);
  const autoPlayRef = useRef(false);
  const autoPlayTimeoutRef = useRef(null);

  const updateAutoPlayState = (val) => {
    setAutoPlay(val);
    autoPlayRef.current = val;
  };

  const progressAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);
  const spokenCountRef = useRef(new Set());

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

    const loadHistory = async () => {
      try {
        const stored = await AsyncStorage.getItem('olahraga_history');
        if (stored) setHistory(JSON.parse(stored));
        const userIdVal = user ? user.id : 'null';
        const response = await fetch(`${API_BASE_URL}/api/riwayat-olahraga/${userIdVal}`);
        if (response.ok) {
          const data = await response.json();
          setHistory(data);
        }
      } catch (e) {
        console.warn('Gagal memuat histori:', e);
      }
    };

    updateStreak();
    loadVoices();
    loadHistory();

    return () => {
      clearInterval(timerRef.current);
      Speech.stop();
    };
  }, [user]);

  const saveToHistory = async (exercise, setsCount, durationSec) => {
    const formattedDate = new Date().toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    const newEntry = {
      id: Date.now().toString(),
      exerciseId: exercise.id,
      name: exercise.name,
      target: exercise.target,
      icon: exercise.icon,
      sets: setsCount,
      duration: durationSec,
      date: formattedDate
    };
    try {
      const updatedHistory = [newEntry, ...history];
      setHistory(updatedHistory);
      await AsyncStorage.setItem('olahraga_history', JSON.stringify(updatedHistory));
    } catch (e) { console.warn('Gagal menyimpan local history:', e); }
    try {
      const userIdVal = user ? user.id : null;
      await fetch(`${API_BASE_URL}/api/riwayat-olahraga`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userIdVal, exerciseId: exercise.id, name: exercise.name, target: exercise.target,
          sets: setsCount, duration: durationSec, date: formattedDate
        })
      });
    } catch (e) { console.warn('Gagal menyimpan ke DB:', e); }
  };

  const speak = (text) => {
    try {
      Speech.speak(text, {
        language: 'id-ID', pitch: 1.0, rate: 0.9, voice: selectedVoice
      });
    } catch (error) { console.warn('Gagal memutar suara:', error); }
  };

  const toggleWishlist = (id) => {
    setWishlist((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
  };

  const openExerciseConfig = (exercise) => {
    setSets('1');
    setDurationSeconds('30');
    setSelectedExerciseForModal(exercise);
    updateFinishMode(autoPlayRef.current ? 'auto' : 'stop');
    setModalVisible(true);
  };

  const confirmStartExercise = () => {
    const numSets = parseInt(sets) || 1;
    const numDurationSeconds = parseInt(durationSeconds) || 30;
    const calculatedTotalDuration = numSets * numDurationSeconds;

    const exercise = selectedExerciseForModal;

    setModalVisible(false);
    setSelectedExerciseForModal(null);

    if (finishModeRef.current === 'auto') {
      updateAutoPlayState(true);
    } else {
      updateAutoPlayState(false);
    }

    if (exercise) {
      saveToHistory(exercise, numSets, numDurationSeconds);
      startExercise(exercise, calculatedTotalDuration);
    }
  };

  const startExercise = (exercise, duration) => {
    clearInterval(timerRef.current);
    countdownTimeoutRef.current.forEach(t => clearTimeout(t));
    countdownTimeoutRef.current = [];
    Speech.stop();
    spokenCountRef.current = new Set();

    updateActiveExercise(exercise);
    setIsPaused(false);
    setTimeRemaining(duration);
    setTotalDuration(duration);
    setIsCountingDown(false);
    setCountdownNum(null);
    progressAnim.setValue(0);
    setIsSessionFinished(false);

    const beginTimer = () => {
      setIsCountingDown(false);
      setCountdownNum(null);

      let timerStarted = false;
      const startRunningTimer = () => {
        if (timerStarted) return;
        timerStarted = true;
        Animated.timing(progressAnim, {
          toValue: 1, duration: duration * 1000, easing: Easing.linear, useNativeDriver: false,
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
              setIsSessionFinished(true);

              const playFinishedSpeechAndTransition = () => {
                const multiplier = duration / 30;
                setCaloriesBurned((c) => parseFloat((c + 1.5 * multiplier).toFixed(1)));
                setActiveMinutes((m) => m + Math.floor(duration / 60));

                let speechFinishedCalled = false;
                const onFinishedSpeechDone = () => {
                  if (speechFinishedCalled) return;
                  speechFinishedCalled = true;

                  if (finishModeRef.current === 'auto') {
                    if (autoPlayTimeoutRef.current) clearTimeout(autoPlayTimeoutRef.current);
                    autoPlayTimeoutRef.current = setTimeout(() => {
                      handleNextExercise();
                    }, 2500);
                  }
                };

                const safetySpeech = setTimeout(onFinishedSpeechDone, 3000);

                try {
                  Speech.speak('Selesai! Kerja bagus.', {
                    language: 'id-ID', rate: 1.0,
                    onStart: () => {
                      clearTimeout(safetySpeech);
                    },
                    onDone: () => {
                      onFinishedSpeechDone();
                    },
                    onError: () => {
                      onFinishedSpeechDone();
                    }
                  });
                } catch (e) {
                  console.warn('Speech.speak finish failed:', e);
                  clearTimeout(safetySpeech);
                  onFinishedSpeechDone();
                }
              };

              playFinishedSpeechAndTransition();
              return 0;
            }
            return next;
          });
        }, 1000);
      };

      const safetyMulai = setTimeout(startRunningTimer, 2000);

      try {
        Speech.speak('Mulai!', {
          language: 'id-ID', rate: 1.0,
          onStart: () => {
            clearTimeout(safetyMulai);
          },
          onDone: () => {
            startRunningTimer();
          },
          onError: () => {
            startRunningTimer();
          }
        });
      } catch (e) {
        console.warn('Speech.speak "Mulai!" failed:', e);
        clearTimeout(safetyMulai);
        startRunningTimer();
      }
    };

    const startCountdown = () => {
      setIsCountingDown(true);
      setCountdownNum(3);
      speak('3');

      let currentCount = 3;
      const countdownInterval = setInterval(() => {
        currentCount -= 1;
        if (currentCount === 2) {
          setCountdownNum(2);
          speak('2');
        } else if (currentCount === 1) {
          setCountdownNum(1);
          speak('1');
        } else if (currentCount === 0) {
          clearInterval(countdownInterval);
          beginTimer();
        }
      }, 1000);
    };

    let introCalled = false;
    const goIntro = () => {
      if (introCalled) return;
      introCalled = true;
      startCountdown();
    };
    const safetyIntro = setTimeout(goIntro, 8000);

    try {
      Speech.speak(`${exercise.name}. ${exercise.instruction}`, {
        language: 'id-ID', rate: 0.9,
        onStart: () => {
          clearTimeout(safetyIntro);
        },
        onDone: () => { goIntro(); },
        onError: () => { goIntro(); }
      });
    } catch (e) {
      console.warn('Speech.speak intro failed:', e);
      clearTimeout(safetyIntro);
      goIntro();
    }
  };

  const handlePause = () => {
    setIsPaused(true);
    clearInterval(timerRef.current);
    progressAnim.stopAnimation();
    Speech.stop();
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current);
      autoPlayTimeoutRef.current = null;
    }
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
          setIsSessionFinished(true);

          const playFinishedSpeechAndTransition = () => {
            const baseDuration = 30;
            const multiplier = totalDuration / baseDuration;
            setCaloriesBurned((c) => parseFloat((c + 1.5 * multiplier).toFixed(1)));
            setActiveMinutes((m) => m + Math.floor(totalDuration / 60));

            let speechFinishedCalled = false;
            const onFinishedSpeechDone = () => {
              if (speechFinishedCalled) return;
              speechFinishedCalled = true;

              if (finishModeRef.current === 'auto') {
                if (autoPlayTimeoutRef.current) clearTimeout(autoPlayTimeoutRef.current);
                autoPlayTimeoutRef.current = setTimeout(() => {
                  handleNextExercise();
                }, 2500);
              }
            };

            const safetySpeech = setTimeout(onFinishedSpeechDone, 3000);

            try {
              Speech.speak('Selesai! Kerja bagus.', {
                language: 'id-ID', rate: 1.0,
                onStart: () => {
                  clearTimeout(safetySpeech);
                },
                onDone: () => {
                  onFinishedSpeechDone();
                },
                onError: () => {
                  onFinishedSpeechDone();
                }
              });
            } catch (e) {
              console.warn('Speech.speak finish failed:', e);
              clearTimeout(safetySpeech);
              onFinishedSpeechDone();
            }
          };

          playFinishedSpeechAndTransition();
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
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current);
      autoPlayTimeoutRef.current = null;
    }
    progressAnim.stopAnimation();
    Speech.stop();
    setIsCountingDown(false);
    setCountdownNum(null);
    updateActiveExercise(null);
    setIsPaused(false);
    setTimeRemaining(0);
    setIsSessionFinished(false);
    updateAutoPlayState(false);
    updateFinishMode('stop');
  };

  const handleNextExercise = () => {
    const currentEx = activeExerciseRef.current;
    if (!currentEx) {
      if (autoPlayRef.current) updateAutoPlayState(false);
      return;
    }

    let fullList = [];
    if (activeTab === 'Grup') {
      const allGroups = ['Dada', 'Kaki', 'Bahu & Punggung', 'Otot perut', 'Lengan'];
      fullList = allGroups.flatMap(group => EXERCISE_DATA[group] || []);
    } else if (activeTab === 'Wishlist') {
      const all = Object.values(EXERCISE_DATA).flat();
      fullList = all.filter((ex) => wishlist.includes(ex.id));
    } else {
      fullList = EXERCISE_DATA[activeTab] || [];
    }

    if (fullList.length === 0) { handleStop(); return; }

    const currentIndex = fullList.findIndex(ex => ex.id === currentEx.id);
    let nextIndex = currentIndex + 1;

    if (nextIndex >= fullList.length) {
      nextIndex = 0;
      if (autoPlayRef.current) updateAutoPlayState(false);
    }

    const nextExercise = fullList[nextIndex];
    Speech.stop();

    let nextSpeechDone = false;
    const triggerNext = () => {
      if (nextSpeechDone) return;
      nextSpeechDone = true;
      const numSets = parseInt(sets) || 1;
      const numDurationSeconds = parseInt(durationSeconds) || 30;
      saveToHistory(nextExercise, numSets, numDurationSeconds);
      startExercise(nextExercise, numSets * numDurationSeconds);
    };
    const safetyNext = setTimeout(triggerNext, 2500);

    try {
      Speech.speak('Latihan selanjutnya...', {
        language: 'id-ID', rate: 0.9, pitch: 0.85,
        onStart: () => {
          clearTimeout(safetyNext);
        },
        onDone: () => {
          triggerNext();
        },
        onError: () => {
          triggerNext();
        }
      });
    } catch (e) {
      console.warn('Speech.speak next failed:', e);
      clearTimeout(safetyNext);
      triggerNext();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getDisplayedExercises = () => {
    if (activeTab === 'Wishlist') {
      const all = Object.values(EXERCISE_DATA).flat();
      return all.filter((ex) => wishlist.includes(ex.id));
    }
    if (activeTab === 'History') return [];
    if (activeTab === 'Grup') {
      const allGroups = ['Dada', 'Kaki', 'Bahu & Punggung', 'Otot perut', 'Lengan'];
      return allGroups.flatMap(group => EXERCISE_DATA[group] || []);
    }
    return EXERCISE_DATA[activeTab] || [];
  };

  const displayedExercises = getDisplayedExercises();

  return (
    <SafeAreaView style={[styles.container, isDarkMode && { backgroundColor: '#0F172A' }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <View style={styles.header}>
            <Text style={[styles.title, isDarkMode && { color: '#F8FAFC' }]}>Olahraga</Text>
            <Text style={[styles.subtitle, isDarkMode && { color: '#94A3B8' }]}>Aktivitas fisik ringan dengan panduan suara.</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={[styles.headerSparklesBtn, { marginRight: 8 }]} onPress={() => navigation.navigate('JadwalOlahraga')}>
              <Ionicons name="calendar-outline" size={18} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerSparklesBtn} onPress={() => setActiveTab('AI')}>
              <Ionicons name="sparkles" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
          {CATEGORY_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabChip,
                activeTab === tab.id && styles.tabChipActive,
                isDarkMode && activeTab === tab.id && { backgroundColor: '#1E3A8A', borderColor: '#3B82F6' },
                isDarkMode && activeTab !== tab.id && { backgroundColor: '#1E293B', borderColor: '#334155' }
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons
                name={tab.icon}
                size={16}
                color={activeTab === tab.id ? (isDarkMode ? '#60A5FA' : '#2563EB') : (isDarkMode ? '#94A3B8' : '#6B7280')}
                style={{ marginRight: 6 }}
              />
              <Text style={[
                styles.tabText,
                activeTab === tab.id && styles.tabTextActive,
                isDarkMode && activeTab === tab.id && { color: '#60A5FA' },
                isDarkMode && activeTab !== tab.id && { color: '#CBD5E1' }
              ]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {activeExercise && (
          <View style={[styles.card, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <View style={styles.sessionHeader}>
              <Text style={[styles.cardTitle, isDarkMode && { color: '#F8FAFC' }]}>{activeExercise.name}</Text>
              <View style={styles.voiceBadge}>
                <Ionicons name="mic" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.voiceBadgeText}>Voice Guide</Text>
              </View>
            </View>

            <View style={styles.timerContainer}>
              <Animated.View style={[styles.timerCircle, { width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
              <View style={styles.timerTextWrap}>
                {isCountingDown ? (
                  <>
                    <Text style={styles.timerLabel}>Bersiap...</Text>
                    <Text style={[styles.timerValue, { color: '#2563EB', fontSize: 64 }]}>{countdownNum ?? '...'}</Text>
                    <Text style={styles.timerSubLabel}>Segera mulai</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.timerLabel}>Sisa Waktu</Text>
                    <Text style={styles.timerValue}>{formatTime(timeRemaining)}</Text>
                    <Text style={styles.timerSubLabel}>{activeExercise.target}</Text>
                  </>
                )}
              </View>
            </View>

            <View style={styles.controlRow}>
              {isSessionFinished ? (
                <>
                  <TouchableOpacity
                    style={[styles.controlBtn, { borderColor: '#10B981', flex: 1 }]}
                    onPress={() => {
                      if (autoPlayTimeoutRef.current) { clearTimeout(autoPlayTimeoutRef.current); autoPlayTimeoutRef.current = null; }
                      handleNextExercise();
                    }}
                  >
                    <Ionicons name="play-skip-forward" size={22} color="#10B981" />
                    <Text style={[styles.controlBtnLabel, { color: '#10B981' }]}>Latihan Selanjutnya</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.controlBtn, { borderColor: autoPlay ? '#F59E0B' : '#D1D5DB', flex: 1, backgroundColor: autoPlay ? '#FFFBEB' : 'transparent' }]}
                    onPress={() => {
                      const newVal = !autoPlay;
                      updateAutoPlayState(newVal);
                      updateFinishMode(newVal ? 'auto' : 'stop');
                      if (autoPlayTimeoutRef.current) {
                        clearTimeout(autoPlayTimeoutRef.current);
                        autoPlayTimeoutRef.current = null;
                      } else if (newVal) {
                        autoPlayTimeoutRef.current = setTimeout(() => {
                          handleNextExercise();
                        }, 3000);
                      }
                    }}
                  >
                    <Ionicons name={autoPlay ? 'play-forward' : 'play-forward-outline'} size={22} color={autoPlay ? '#F59E0B' : '#9CA3AF'} />
                    <Text style={[styles.controlBtnLabel, { color: autoPlay ? '#F59E0B' : '#9CA3AF' }]}>{autoPlay ? 'Auto: Nyala' : 'Auto Play'}</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity style={[styles.controlBtn, isCountingDown && { opacity: 0.4 }]} onPress={isPaused ? handleResume : handlePause} disabled={isCountingDown}>
                    <Ionicons name={isPaused ? 'play' : 'pause'} size={22} color="#2563EB" />
                    <Text style={styles.controlBtnLabel}>{isPaused ? 'Lanjut' : 'Jeda'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.controlBtn, { borderColor: '#EF5350' }]} onPress={handleStop}>
                    <Ionicons name="stop" size={22} color="#EF5350" />
                    <Text style={[styles.controlBtnLabel, { color: '#EF5350' }]}>Stop</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        )}

        {activeTab === 'GPS' && (
          <GpsTrackerScreen />
        )}

        {activeTab !== 'GPS' && activeTab !== 'AI' && (
          <>
            <View style={styles.listSection}>
              <Text style={[styles.sectionLabel, isDarkMode && { color: '#F8FAFC' }]}>
                {activeTab === 'Wishlist' ? 'Gerakan Favorit Saya' : activeTab === 'History' ? 'Histori Latihan' : 'Semua Latihan'}
              </Text>

              {activeTab === 'Grup' && (
                <View style={styles.subTabContainer}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subTabRow}>
                    {['Dada', 'Kaki', 'Bahu & Punggung', 'Otot perut', 'Lengan'].map((groupKey) => (
                      <TouchableOpacity
                        key={groupKey}
                        style={[
                          styles.subTabChip,
                          activeSubTab === groupKey && styles.subTabChipActive,
                          isDarkMode && activeSubTab === groupKey && { backgroundColor: '#1E3A8A', borderColor: '#2563EB' },
                          isDarkMode && activeSubTab !== groupKey && { backgroundColor: '#1E293B', borderColor: '#334155' }
                        ]}
                        onPress={() => setActiveSubTab(groupKey)}
                      >
                        <Text style={[
                          styles.subTabText,
                          activeSubTab === groupKey && styles.subTabTextActive,
                          isDarkMode && activeSubTab === groupKey && { color: '#60A5FA' },
                          isDarkMode && activeSubTab !== groupKey && { color: '#CBD5E1' }
                        ]}>
                          {groupKey}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {activeTab === 'Grup' ? (
                (() => {
                  const exercises = EXERCISE_DATA[activeSubTab] || [];
                  if (exercises.length === 0) return null;
                  return exercises.map((ex) => {
                    const isFavorite = wishlist.includes(ex.id);
                    const isThisActive = activeExercise?.id === ex.id;
                    return (
                      <View key={ex.id} style={[styles.exerciseCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
                        <TouchableOpacity style={styles.wishlistBtn} onPress={() => toggleWishlist(ex.id)}>
                          <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={20} color={isFavorite ? '#EF5350' : '#9CA3AF'} />
                        </TouchableOpacity>
                        <View style={[styles.exerciseIconWrap, isDarkMode && { backgroundColor: '#334155' }]}>
                          <Ionicons name={ex.icon} size={26} color={isDarkMode ? '#60A5FA' : '#2563EB'} />
                        </View>
                        <View style={styles.exerciseInfo}>
                          <Text style={[styles.exerciseName, isDarkMode && { color: '#F8FAFC' }]}>{ex.name}</Text>
                          <Text style={[styles.exerciseTarget, isDarkMode && { color: '#94A3B8' }]}>{ex.target}</Text>
                        </View>
                        <TouchableOpacity style={[styles.startBtnSmall, isThisActive && styles.startBtnSmallActive]} onPress={() => openExerciseConfig(ex)}>
                          <Ionicons name={isThisActive ? 'volume-high' : 'play'} size={16} color="#FFFFFF" />
                          <Text style={styles.startBtnSmallText}>{isThisActive ? 'Aktif' : 'Mulai'}</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  });
                })()
              ) : (
                activeTab === 'History' ? (
                  history.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Ionicons name="time-outline" size={40} color="#9CA3AF" />
                      <Text style={styles.emptyStateText}>Belum ada histori latihan.</Text>
                    </View>
                  ) : (
                    history.map((item) => (
                      <View key={item.id} style={[styles.historyCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
                        <View style={[styles.exerciseIconWrap, isDarkMode && { backgroundColor: '#334155' }]}>
                          <Ionicons name={item.icon} size={24} color={isDarkMode ? '#60A5FA' : '#2563EB'} />
                        </View>
                        <View style={styles.exerciseInfo}>
                          <Text style={[styles.exerciseName, isDarkMode && { color: '#F8FAFC' }]}>{item.name}</Text>
                          <Text style={[styles.exerciseTarget, isDarkMode && { color: '#94A3B8' }]}>{item.target}</Text>
                          <Text style={[styles.historyDate, isDarkMode && { color: '#94A3B8' }]}>{item.date}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={[styles.historySets, isDarkMode && { color: '#F8FAFC' }]}>{item.sets} Set</Text>
                          <Text style={[styles.historyDuration, isDarkMode && { color: '#94A3B8' }]}>{item.duration}s / Set</Text>
                        </View>
                      </View>
                    ))
                  )
                ) : (
                  displayedExercises.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Ionicons name="heart-outline" size={40} color="#9CA3AF" />
                      <Text style={styles.emptyStateText}>Belum ada gerakan favorit. Tekan ikon hati pada card untuk menambahkan.</Text>
                    </View>
                  ) : (
                    displayedExercises.map((ex) => {
                      const isFavorite = wishlist.includes(ex.id);
                      const isThisActive = activeExercise?.id === ex.id;
                      return (
                        <View key={ex.id} style={[styles.exerciseCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
                          <TouchableOpacity style={styles.wishlistBtn} onPress={() => toggleWishlist(ex.id)}>
                            <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={20} color={isFavorite ? '#EF5350' : '#9CA3AF'} />
                          </TouchableOpacity>
                          <View style={[styles.exerciseIconWrap, isDarkMode && { backgroundColor: '#334155' }]}>
                            <Ionicons name={ex.icon} size={26} color={isDarkMode ? '#60A5FA' : '#2563EB'} />
                          </View>
                          <View style={styles.exerciseInfo}>
                            <Text style={[styles.exerciseName, isDarkMode && { color: '#F8FAFC' }]}>{ex.name}</Text>
                            <Text style={[styles.exerciseTarget, isDarkMode && { color: '#94A3B8' }]}>{ex.target}</Text>
                          </View>
                          <TouchableOpacity style={[styles.startBtnSmall, isThisActive && styles.startBtnSmallActive]} onPress={() => openExerciseConfig(ex)}>
                            <Ionicons name={isThisActive ? 'volume-high' : 'play'} size={16} color="#FFFFFF" />
                            <Text style={styles.startBtnSmallText}>{isThisActive ? 'Aktif' : 'Mulai'}</Text>
                          </TouchableOpacity>
                        </View>
                      );
                    })
                  )
                )
              )}
            </View>

            <View style={[styles.card, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
              <Text style={[styles.cardTitle, isDarkMode && { color: '#F8FAFC' }]}>Progres & Metrik</Text>
              <View style={styles.metricRow}>
                <View style={[styles.metricItem, isDarkMode && { backgroundColor: '#334155', borderColor: '#475569', borderWidth: 1 }]}>
                  <Ionicons name="flame-outline" size={24} color="#EF5350" />
                  <Text style={[styles.metricValue, isDarkMode && { color: '#F8FAFC' }]}>{caloriesBurned} <Text style={[styles.metricUnit, isDarkMode && { color: '#94A3B8' }]}>kcal</Text></Text>
                  <Text style={[styles.metricLabel, isDarkMode && { color: '#94A3B8' }]}>Terbakar</Text>
                </View>
                <View style={[styles.metricItem, isDarkMode && { backgroundColor: '#334155', borderColor: '#475569', borderWidth: 1 }]}>
                  <Ionicons name="time-outline" size={24} color="#2563EB" />
                  <Text style={[styles.metricValue, isDarkMode && { color: '#F8FAFC' }]}>{activeMinutes} <Text style={[styles.metricUnit, isDarkMode && { color: '#94A3B8' }]}>min</Text></Text>
                  <Text style={[styles.metricLabel, isDarkMode && { color: '#94A3B8' }]}>Aktif Hari Ini</Text>
                </View>
                <View style={[styles.metricItem, isDarkMode && { backgroundColor: '#334155', borderColor: '#475569', borderWidth: 1 }]}>
                  <Ionicons name="stats-chart" size={24} color="#F59E0B" />
                  <Text style={[styles.metricValue, isDarkMode && { color: '#F8FAFC' }]}>{streak} <Text style={[styles.metricUnit, isDarkMode && { color: '#94A3B8' }]}>hari</Text></Text>
                  <Text style={[styles.metricLabel, isDarkMode && { color: '#94A3B8' }]}>Streak 🔥</Text>
                </View>
              </View>
            </View>
          </>
        )}

        {activeTab === 'AI' && (
          <View style={[styles.aiTabCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <View style={styles.aiTabHeader}>
              <Ionicons name="sparkles" size={20} color="#2563EB" style={{ marginRight: 8 }} />
              <Text style={[styles.aiTabTitle, isDarkMode && { color: '#F8FAFC' }]}>Asisten AI Olahraga</Text>
            </View>
            <Text style={[styles.aiTabSubtitle, isDarkMode && { color: '#94A3B8' }]}>Analisis riwayat latihan, rancang jadwal kebugaran mingguan, atau diskusikan teknik gerakan langsung dengan Gemini.</Text>

            <View style={[styles.chatArea, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
              {aiMessages.map((msg) => (
                <View key={msg.id} style={[styles.bubbleWrap, msg.sender === 'user' ? styles.userBubbleWrap : styles.aiBubbleWrap]}>
                  {msg.sender === 'ai' && (
                    <View style={[styles.miniAvatar, isDarkMode && { backgroundColor: '#334155', borderColor: '#475569' }]}>
                      <Ionicons name="sparkles-outline" size={12} color={isDarkMode ? '#60A5FA' : '#2563EB'} />
                    </View>
                  )}
                  <View style={[
                    styles.chatBubble,
                    msg.sender === 'user' ? styles.userChatBubble : styles.aiChatBubble,
                    isDarkMode && msg.sender === 'ai' && { backgroundColor: '#334155', borderColor: '#475569' }
                  ]}>
                    {renderAiMessageText(msg.text, msg.sender === 'user')}
                  </View>
                </View>
              ))}
              {aiLoading && (
                <View style={[styles.bubbleWrap, styles.aiBubbleWrap]}>
                  <View style={[styles.miniAvatar, isDarkMode && { backgroundColor: '#334155', borderColor: '#475569' }]}>
                    <Ionicons name="sparkles-outline" size={12} color={isDarkMode ? '#60A5FA' : '#2563EB'} />
                  </View>
                  <View style={[
                    styles.chatBubble,
                    styles.aiChatBubble,
                    isDarkMode && { backgroundColor: '#334155', borderColor: '#475569' },
                    { flexDirection: 'row', alignItems: 'center', gap: 6 }
                  ]}>
                    <ActivityIndicator size="small" color={isDarkMode ? '#60A5FA' : '#2563EB'} />
                    <Text style={[{ fontSize: 13, color: '#374151' }, isDarkMode && { color: '#F8FAFC' }]}>Memproses saran kebugaran...</Text>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.quickAskRow}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                {[
                  'Bantu buat jadwal latihan 15 menit/hari',
                  'Bagaimana melakukan push up yang benar?',
                  'Rekomendasi olahraga kardio ringan di rumah',
                ].map((q, idx) => (
                  <TouchableOpacity key={idx} style={[styles.quickAskBtn, isDarkMode && { backgroundColor: '#334155' }]} onPress={() => handleSendAi(q)}>
                    <Text style={[styles.quickAskText, isDarkMode && { color: '#CBD5E1' }]}>{q}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.aiInputRow}>
              <TextInput
                style={[styles.aiInputField, isDarkMode && { backgroundColor: '#334155', borderColor: '#475569', color: '#F8FAFC' }]}
                value={aiInput}
                onChangeText={setAiInput}
                placeholder="Tanyakan program latihan Anda..."
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity onPress={() => handleSendAi()} style={styles.aiSendBtn} disabled={!aiInput.trim()}>
                <Ionicons name="send" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Atur Latihan</Text>
            <Text style={styles.modalSubtitle}>{selectedExerciseForModal ? selectedExerciseForModal.name : ''}</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Jumlah Set</Text>
              <View style={styles.counterRow}>
                <TouchableOpacity style={styles.counterBtn} onPress={() => setSets(prev => Math.max(1, parseInt(prev || 1) - 1).toString())}>
                  <Ionicons name="remove" size={20} color="#2563EB" />
                </TouchableOpacity>
                <TextInput style={styles.counterInput} value={sets} onChangeText={setSets} keyboardType="numeric" textAlign="center" />
                <TouchableOpacity style={styles.counterBtn} onPress={() => setSets(prev => (parseInt(prev || 1) + 1).toString())}>
                  <Ionicons name="add" size={20} color="#2563EB" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Durasi per Set (Detik)</Text>
              <View style={styles.counterRow}>
                <TouchableOpacity style={styles.counterBtn} onPress={() => setDurationSeconds(prev => Math.max(5, (parseInt(prev || 30) - 5)).toString())}>
                  <Ionicons name="remove" size={20} color="#2563EB" />
                </TouchableOpacity>
                <TextInput style={styles.counterInput} value={durationSeconds} onChangeText={setDurationSeconds} keyboardType="numeric" textAlign="center" />
                <TouchableOpacity style={styles.counterBtn} onPress={() => setDurationSeconds(prev => (parseInt(prev || 30) + 5).toString())}>
                  <Ionicons name="add" size={20} color="#2563EB" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modeSelectGroup}>
              <Text style={styles.inputLabel}>Setelah latihan ini selesai:</Text>
              <View style={styles.modeSelectRow}>
                <TouchableOpacity
                  style={[styles.modeBtn, finishMode === 'next' && styles.modeBtnActiveNext]}
                  onPress={() => updateFinishMode('next')}
                >
                  <Ionicons name="play-skip-forward-outline" size={18} color={finishMode === 'next' ? '#2563EB' : '#6B7280'} />
                  <Text style={[styles.modeBtnText, finishMode === 'next' && styles.modeBtnTextActiveNext]}>Lanjut Manual</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modeBtn, finishMode === 'auto' && styles.modeBtnActiveAuto]}
                  onPress={() => updateFinishMode('auto')}
                >
                  <Ionicons name="play-forward" size={18} color={finishMode === 'auto' ? '#10B981' : '#6B7280'} />
                  <Text style={[styles.modeBtnText, finishMode === 'auto' && styles.modeBtnTextActiveAuto]}>Auto Play</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FF' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 10,
  },
  header: {
    flex: 1,
    paddingRight: 10,
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: { fontSize: 26, fontWeight: '800', color: '#111827', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#6B7280', lineHeight: 22 },

  tabRow: { paddingBottom: 16, gap: 8 },
  tabChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', marginRight: 6 },
  tabChipActive: { backgroundColor: '#F0F7FF', borderWidth: 1.5, borderColor: '#2563EB' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  tabTextActive: { color: '#2563EB' },

  groupHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2563EB',
    marginTop: 16,
    marginBottom: 8,
    paddingLeft: 4,
  },

  historyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 14, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  historyDate: { fontSize: 11, color: '#9CA3AF', marginTop: 4 },
  historySets: { fontSize: 13, fontWeight: '700', color: '#111827' },
  historyDuration: { fontSize: 12, color: '#6B7280', marginTop: 2 },

  card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 8 }, shadowRadius: 16, elevation: 4 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },

  sessionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  voiceBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#10B981', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  voiceBadgeText: { color: '#FFFFFF', fontWeight: '600', fontSize: 10 },
  timerContainer: { height: 130, justifyContent: 'center', alignItems: 'center', marginBottom: 16, position: 'relative' },
  timerCircle: { position: 'absolute', bottom: 0, left: 0, height: 6, backgroundColor: '#2563EB', borderRadius: 6 },
  timerTextWrap: { alignItems: 'center' },
  timerLabel: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  timerValue: { fontSize: 38, fontWeight: '800', color: '#111827', marginVertical: 4 },
  timerSubLabel: { fontSize: 13, color: '#9CA3AF' },

  controlRow: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
  controlBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#D1D5DB', paddingVertical: 12, borderRadius: 14, gap: 4 },
  controlBtnLabel: { fontSize: 13, fontWeight: '600', color: '#374151' },

  listSection: { marginBottom: 16 },
  sectionLabel: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 10 },
  exerciseCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.03, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 2 },
  wishlistBtn: { paddingRight: 10 },
  exerciseIconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#EFF3FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  exerciseInfo: { flex: 1 },
  exerciseName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  exerciseTarget: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  startBtnSmall: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2563EB', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, gap: 4 },
  startBtnSmallActive: { backgroundColor: '#10B981' },
  startBtnSmallText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },

  emptyState: { alignItems: 'center', paddingVertical: 30, paddingHorizontal: 20 },
  emptyStateText: { textAlign: 'center', color: '#9CA3AF', fontSize: 13, marginTop: 10, lineHeight: 20 },

  metricRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 14 },
  metricItem: { flex: 1, alignItems: 'center', backgroundColor: '#F9FAFB', paddingVertical: 12, borderRadius: 14 },
  metricValue: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 6 },
  metricUnit: { fontSize: 13, fontWeight: '400', color: '#6B7280' },
  metricLabel: { fontSize: 11, color: '#6B7280', marginTop: 2 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', maxWidth: 380, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 24, elevation: 10 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 4 },
  modalSubtitle: { fontSize: 14, color: '#6B7280', marginBottom: 20 },
  inputGroup: { width: '100%', marginBottom: 16, alignItems: 'center' },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  counterRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  counterBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  counterInput: { width: 60, height: 44, backgroundColor: '#F9FAFB', borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', fontSize: 18, fontWeight: '700', color: '#111827' },
  modalActions: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: '#F3F4F6', alignItems: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: '#4B5563' },
  confirmBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: '#2563EB', alignItems: 'center' },
  confirmBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },

  modeSelectGroup: { width: '100%', marginBottom: 16, alignItems: 'center' },
  modeSelectRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, flexWrap: 'wrap' },
  modeBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1.5, borderColor: 'transparent', gap: 4 },
  modeBtnText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },

  modeBtnActiveStop: { backgroundColor: '#FEF2F2', borderColor: '#EF4444' },
  modeBtnTextActiveStop: { color: '#EF4444' },

  modeBtnActiveNext: { backgroundColor: '#EFF6FF', borderColor: '#2563EB' },
  modeBtnTextActiveNext: { color: '#2563EB' },

  modeBtnActiveAuto: { backgroundColor: '#ECFDF5', borderColor: '#10B981' },
  modeBtnTextActiveAuto: { color: '#10B981' },

  aiTabCard: {
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
  aiTabHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  aiTabTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  aiTabSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 16,
  },
  chatArea: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 12,
    minHeight: 250,
    gap: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  bubbleWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '85%',
  },
  aiBubbleWrap: {
    alignSelf: 'flex-start',
    gap: 6,
  },
  userBubbleWrap: {
    alignSelf: 'flex-end',
  },
  miniAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  chatBubble: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
  },
  aiChatBubble: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  userChatBubble: {
    backgroundColor: '#2563EB',
    borderBottomRightRadius: 3,
  },
  aiAiText: {
    fontSize: 13,
    color: '#1F2937',
    lineHeight: 18,
  },
  aiUserText: {
    fontSize: 13,
    color: '#FFFFFF',
    lineHeight: 18,
  },
  quickAskRow: {
    marginBottom: 12,
  },
  quickAskBtn: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  quickAskText: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '600',
  },
  aiInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiInputField: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 14,
    fontSize: 13,
    color: '#1F2937',
  },
  aiSendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subTabContainer: {
    marginBottom: 16,
    marginTop: 8,
  },
  subTabRow: {
    flexDirection: 'row',
    gap: 8,
  },
  subTabChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  subTabChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  subTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  subTabTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
});