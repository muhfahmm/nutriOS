import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../auth/AuthContext';
import { API_BASE_URL } from '../../auth/api';
import SuccessModal from './SuccessModal';
import { useSleepNotifications } from '../../components/SleepNotificationManager';

export default function JadwalTidurScreen({ navigation }) {
  const { user, isDarkMode } = useContext(AuthContext);

  const getCurrentFormattedTime = (offsetHours = 0) => {
    const now = new Date();
    if (offsetHours > 0) {
      now.setHours(now.getHours() + offsetHours);
    }
    const hh = now.getHours().toString().padStart(2, '0');
    const mm = now.getMinutes().toString().padStart(2, '0');
    return `${hh}.${mm}`;
  };

  const defaultSleep = getCurrentFormattedTime(1);
  const defaultWake = getCurrentFormattedTime(9);

  const [sleepTime, setSleepTime] = useState(defaultSleep);
  const [wakeTime, setWakeTime] = useState(defaultWake);
  const [ageGroup, setAgeGroup] = useState('Dewasa');

  const [notifBedtime, setNotifBedtime] = useState(true);

  useSleepNotifications(sleepTime, notifBedtime);

  const [activePickerTab, setActivePickerTab] = useState('sleep');

  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const [isSuccessVisible, setIsSuccessVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [lastSavedData, setLastSavedData] = useState(null);

  const getDuration = (sTime, wTime) => {
    try {
      const [sHour, sMin] = sTime.split('.').map(Number);
      const [wHour, wMin] = wTime.split('.').map(Number);
      let start = new Date();
      start.setHours(sHour, sMin, 0, 0);
      let end = new Date();
      end.setHours(wHour, wMin, 0, 0);
      if (end <= start) end.setDate(end.getDate() + 1);
      return ((end - start) / (1000 * 60 * 60)).toFixed(1);
    } catch (e) {
      return '8.0';
    }
  };

  const [realTime, setRealTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setRealTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchJadwalTidur = async () => {
      const queryId = user?.id || 'guest';

      setIsLoadingData(true);
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${API_BASE_URL}/api/jadwal-tidur/${queryId}`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          const s = data.sleepTime || sleepTime;
          const w = data.wakeTime || wakeTime;
          const a = data.ageGroup || ageGroup;
          if (data.sleepTime) setSleepTime(data.sleepTime);
          if (data.wakeTime) setWakeTime(data.wakeTime);
          if (data.ageGroup) setAgeGroup(data.ageGroup);
          if (data.notifBedtime !== undefined) setNotifBedtime(data.notifBedtime);

          setLastSavedData({
            sleepTime: s,
            wakeTime: w,
            ageGroup: a,
            duration: getDuration(s, w),
          });
          console.log('Data jadwal tidur berhasil dimuat dari database');
        } else {
          console.log('Server jadwal tidur error, menggunakan data lokal default');
        }
      } catch (error) {
        console.log('Gagal mengambil jadwal tidur (Menggunakan data lokal default):', error.message);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchJadwalTidur();

    const unsubscribe = navigation.addListener('focus', () => {
      fetchJadwalTidur();
    });

    return unsubscribe;
  }, [user, navigation]);

  const getSleepRecommendation = (age) => {
    if (age === 'Bayi') return '12 - 16 Jam';
    if (age === 'Anak') return '10 - 13 Jam';
    return '7 - 9 Jam';
  };

  const calculateSleepDuration = () => {
    try {
      const [sHour, sMin] = sleepTime.split('.').map(Number);
      const [wHour, wMin] = wakeTime.split('.').map(Number);

      let start = new Date();
      start.setHours(sHour, sMin, 0, 0);

      let end = new Date();
      end.setHours(wHour, wMin, 0, 0);

      if (end <= start) {
        end.setDate(end.getDate() + 1);
      }

      const diffMs = end - start;
      const diffHours = diffMs / (1000 * 60 * 60);
      return diffHours.toFixed(1);
    } catch (e) {
      return '8.0';
    }
  };

  const handleSaveToDatabase = async () => {
    let [sH, sM] = sleepTime.split('.').map(Number);
    let [wH, wM] = wakeTime.split('.').map(Number);

    if (isNaN(sH) || isNaN(sM) || isNaN(wH) || isNaN(wM) ||
        sH < 0 || sH > 23 || sM < 0 || sM > 59 ||
        wH < 0 || wH > 23 || wM < 0 || wM > 59) {
      Alert.alert('Format Salah', 'Jam harus di antara 00-23 dan menit di antara 00-59');
      return;
    }

    const normSleep = `${sH.toString().padStart(2, '0')}.${sM.toString().padStart(2, '0')}`;
    const normWake = `${wH.toString().padStart(2, '0')}.${wM.toString().padStart(2, '0')}`;

    setSleepTime(normSleep);
    setWakeTime(normWake);

    setIsSaving(true);
    try {
      console.log('[Jadwal Tidur] Attempting to save data to:', `${API_BASE_URL}/api/jadwal-tidur`);
      console.log('[Jadwal Tidur] Payload:', {
        userId: user?.id || null,
        sleepTime: normSleep,
        wakeTime: normWake,
        ageGroup,
        notifBedtime,
        notifScreenFree: false,
      });

      const payload = {
        userId: user?.id || null,
        sleepTime: normSleep,
        wakeTime: normWake,
        ageGroup,
        notifBedtime,
        notifScreenFree: false,
      };

      const response = await fetch(`${API_BASE_URL}/api/jadwal-tidur`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
        timeout: 10000,
      });

      console.log('[Jadwal Tidur] Response status:', response.status);

      const result = await response.json();
      console.log('[Jadwal Tidur] Response body:', result);

      if (response.ok) {
        setLastSavedData({
          sleepTime,
          wakeTime,
          ageGroup,
          duration: durasiTerpenuhi,
        });
        setSuccessMessage(result.message || 'Target tidur harian berhasil disimpan!');
        setIsSuccessVisible(true);
      } else {
        Alert.alert(
          'Gagal',
          result.message || `Error: ${response.status}`
        );
      }
    } catch (error) {
      console.error('[Jadwal Tidur] Error saving schedule:', error.message);
      console.error('[Jadwal Tidur] Full error:', error);

      let errorMessage = 'Tidak dapat terhubung ke server database.';
      if (error.message.includes('Network')) {
        errorMessage = 'Network error: Periksa koneksi internet dan pastikan server backend sudah berjalan di port 3000';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timeout: Server backend tidak merespons dalam waktu yang ditentukan';
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const adjustTime = (type, action) => {
    const timeStr = type === 'sleep' ? sleepTime : wakeTime;
    const setTimeStr = type === 'sleep' ? setSleepTime : setWakeTime;
    let [hour, minute] = timeStr.split('.').map(Number);

    if (action === 'hour_up') {
      hour = (hour + 1) % 24;
    } else if (action === 'hour_down') {
      hour = (hour - 1 + 24) % 24;
    } else if (action === 'minute_up') {
      minute = (minute + 5) % 60;
    } else if (action === 'minute_down') {
      minute = (minute - 5 + 60) % 60;
    }

    const newStr = `${hour.toString().padStart(2, '0')}.${minute.toString().padStart(2, '0')}`;
    setTimeStr(newStr);
  };

  const durasiTerpenuhi = calculateSleepDuration();
  const rekomendasi = getSleepRecommendation(ageGroup);
  const percentProgress = Math.min(100, Math.round((parseFloat(durasiTerpenuhi) / 8.0) * 100));

  const cycles = ['06.00', '07.30', '09.00'];

  return (
    <SafeAreaView style={[styles.container, isDarkMode && { backgroundColor: '#0F172A' }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>


        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, isDarkMode && { color: '#F8FAFC' }]}>Jadwal Tidur</Text>
            <View style={[styles.realTimeContainer, isDarkMode && { backgroundColor: '#1E293B' }]}>
              <Ionicons name="time-outline" size={16} color="#2563EB" style={{ marginRight: 6 }} />
              <Text style={[styles.realTimeText, isDarkMode && { color: '#3B82F6' }]}>
                {realTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })}
              </Text>
            </View>
          </View>
          <Text style={[styles.subtitle, isDarkMode && { color: '#94A3B8' }]}>Pantau dan tingkatkan kualitas istirahat Anda & si kecil</Text>
        </View>


        {lastSavedData && (
          <TouchableOpacity
            style={[styles.savedDataCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}
            onPress={() => navigation.navigate('JadwalTidurDetail', lastSavedData)}
            activeOpacity={0.8}
          >
            <View style={styles.savedDataHeader}>
              <View style={styles.savedTitleContainer}>
                <Ionicons name="cloud-done" size={20} color="#10B981" />
                <Text style={[styles.savedDataTitle, isDarkMode && { color: '#F8FAFC' }]}>Target Tidur Aktif (Terdaftar)</Text>
              </View>
              <View style={styles.openDetailBadge}>
                <Text style={styles.openDetailText}>Buka Detail</Text>
                <Ionicons name="chevron-forward" size={14} color="#3B82F6" />
              </View>
            </View>

            <View style={styles.savedTable}>
              <View style={styles.savedTableRow}>
                <View style={styles.savedTableCell}>
                  <Ionicons name="moon" size={14} color="#64748B" />
                  <Text style={[styles.savedCellText, isDarkMode && { color: '#CBD5E1' }]}> Tidur: {lastSavedData.sleepTime}</Text>
                </View>
                <View style={[styles.savedTableCell, { borderLeftWidth: 1, borderColor: isDarkMode ? '#334155' : '#E2E8F0', paddingLeft: 12 }]}>
                  <Ionicons name="sunny" size={14} color="#64748B" />
                  <Text style={[styles.savedCellText, isDarkMode && { color: '#CBD5E1' }]}> Bangun: {lastSavedData.wakeTime}</Text>
                </View>
                <View style={[styles.savedTableCell, { borderLeftWidth: 1, borderColor: isDarkMode ? '#334155' : '#E2E8F0', paddingLeft: 12 }]}>
                  <Ionicons name="time" size={14} color="#64748B" />
                  <Text style={[styles.savedCellText, isDarkMode && { color: '#CBD5E1' }]}> Durasi: {lastSavedData.duration} Jam</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {isLoadingData && (
          <View style={[styles.loadingContainer, isDarkMode && { backgroundColor: '#1E293B' }]}>
            <ActivityIndicator size="small" color="#2563EB" />
            <Text style={[styles.loadingText, isDarkMode && { color: '#3B82F6' }]}>Memuat jadwal tidur...</Text>
          </View>
        )}


        <View style={[styles.card, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155', borderWidth: 1 }]}>
          <Text style={[styles.cardTitle, isDarkMode && { color: '#F8FAFC' }]}>Target Tidur Harian</Text>


          <View style={[styles.tabContainer, isDarkMode && { backgroundColor: '#0F172A' }]}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activePickerTab === 'sleep' && styles.tabButtonActive,
                activePickerTab === 'sleep' && isDarkMode && { backgroundColor: '#2563EB' }
              ]}
              onPress={() => setActivePickerTab('sleep')}
            >
              <Ionicons name="moon" size={18} color={activePickerTab === 'sleep' ? '#FFFFFF' : '#2563EB'} />
              <Text style={[
                styles.tabButtonText,
                activePickerTab === 'sleep' && styles.tabButtonTextActive,
                isDarkMode && activePickerTab !== 'sleep' && { color: '#94A3B8' }
              ]}>
                Tidur ({sleepTime})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                activePickerTab === 'wake' && styles.tabButtonActive,
                activePickerTab === 'wake' && isDarkMode && { backgroundColor: '#F59E0B' }
              ]}
              onPress={() => setActivePickerTab('wake')}
            >
              <Ionicons name="sunny" size={18} color={activePickerTab === 'wake' ? '#FFFFFF' : '#F59E0B'} />
              <Text style={[
                styles.tabButtonText,
                activePickerTab === 'wake' && styles.tabButtonTextActive,
                isDarkMode && activePickerTab !== 'wake' && { color: '#94A3B8' }
              ]}>
                Bangun ({wakeTime})
              </Text>
            </TouchableOpacity>
          </View>


          <View style={[styles.pickerSection, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
            <Text style={[styles.pickerTitle, isDarkMode && { color: '#CBD5E1' }]}>
              Atur Jam {activePickerTab === 'sleep' ? 'Tidur' : 'Bangun'}
            </Text>

            <View style={styles.timeControlsRow}>
              <View style={styles.controlColumn}>
                <TextInput
                  style={[styles.numberInput, isDarkMode && { color: '#60A5FA', backgroundColor: '#1E293B', borderColor: '#475569' }]}
                  value={(activePickerTab === 'sleep' ? sleepTime : wakeTime).split('.')[0]}
                  onChangeText={(val) => {
                    let clean = val.replace(/[^0-9]/g, '');
                    if (clean.length > 2) clean = clean.slice(0, 2);
                    const currentParts = (activePickerTab === 'sleep' ? sleepTime : wakeTime).split('.');
                    const mPart = currentParts[1] || '00';
                    if (activePickerTab === 'sleep') {
                      setSleepTime(`${clean}.${mPart}`);
                    } else {
                      setWakeTime(`${clean}.${mPart}`);
                    }
                  }}
                  keyboardType="numeric"
                  maxLength={2}
                  placeholder="22"
                />
                <Text style={[styles.controlUnitLabel, isDarkMode && { color: '#94A3B8' }]}>Jam</Text>
              </View>

              <Text style={[styles.timeColon, isDarkMode && { color: '#F8FAFC' }]}>:</Text>

              <View style={styles.controlColumn}>
                <TextInput
                  style={[styles.numberInput, isDarkMode && { color: '#60A5FA', backgroundColor: '#1E293B', borderColor: '#475569' }]}
                  value={(activePickerTab === 'sleep' ? sleepTime : wakeTime).split('.')[1]}
                  onChangeText={(val) => {
                    let clean = val.replace(/[^0-9]/g, '');
                    if (clean.length > 2) clean = clean.slice(0, 2);
                    const currentParts = (activePickerTab === 'sleep' ? sleepTime : wakeTime).split('.');
                    const hPart = currentParts[0] || '00';
                    if (activePickerTab === 'sleep') {
                      setSleepTime(`${hPart}.${clean}`);
                    } else {
                      setWakeTime(`${hPart}.${clean}`);
                    }
                  }}
                  keyboardType="numeric"
                  maxLength={2}
                  placeholder="00"
                />
                <Text style={[styles.controlUnitLabel, isDarkMode && { color: '#94A3B8' }]}>Menit</Text>
              </View>
            </View>
          </View>


          <View style={styles.progressContainer}>
            <View style={[styles.progressBarBg, isDarkMode && { backgroundColor: '#334155' }]}>
              <View style={[styles.progressBarFill, { width: `${percentProgress}%` }]} />
            </View>
            <View style={styles.progressTextRow}>
              <Text style={[styles.progressLabelLeft, isDarkMode && { color: '#94A3B8' }]}>{durasiTerpenuhi} Jam terhitung</Text>
              <Text style={[styles.progressLabelRight, isDarkMode && { color: '#CBD5E1' }]}>Target: 8 Jam</Text>
            </View>
          </View>


          <TouchableOpacity
            style={[styles.saveDatabaseButton, isSaving && styles.saveDatabaseButtonDisabled]}
            onPress={handleSaveToDatabase}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={20} color="#FFFFFF" />
                <Text style={styles.saveDatabaseButtonText}>Simpan</Text>
              </>
            )}
          </TouchableOpacity>
        </View>


        <View style={[styles.card, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155', borderWidth: 1 }]}>
          <Text style={[styles.cardTitle, isDarkMode && { color: '#F8FAFC' }]}>Kalkulator Kebutuhan Tidur</Text>
          <View style={styles.ageSelector}>
            {['Bayi', 'Anak', 'Dewasa'].map((age) => (
              <TouchableOpacity
                key={age}
                style={[
                  styles.ageBtn,
                  ageGroup === age && styles.ageBtnActive,
                  isDarkMode && ageGroup !== age && { backgroundColor: '#334155', borderColor: '#475569' }
                ]}
                onPress={() => setAgeGroup(age)}
              >
                <Text style={[
                  styles.ageBtnText,
                  ageGroup === age && styles.ageBtnTextActive,
                  isDarkMode && ageGroup !== age && { color: '#94A3B8' }
                ]}>{age}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.recommendationText, isDarkMode && { color: '#CBD5E1' }]}>
            Rekomendasi Durasi: <Text style={[{ fontWeight: '800', color: '#111827' }, isDarkMode && { color: '#F8FAFC' }]}>{rekomendasi}</Text>
          </Text>

          <View style={[styles.cycleContainer, isDarkMode && { backgroundColor: '#0F172A', borderTopColor: '#334155' }]}>
            <Text style={[styles.cycleLabel, isDarkMode && { color: '#94A3B8' }]}>Siklus Tidur 90 Menit (Bangun Paling Segar):</Text>
            <View style={styles.cycleRow}>
              {cycles.map((time, idx) => (
                <View key={idx} style={[styles.cycleChip, isDarkMode && { backgroundColor: '#334155' }]}>
                  <Text style={[styles.cycleChipText, isDarkMode && { color: '#F8FAFC' }]}>{time}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>


        <View style={[styles.card, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155', borderWidth: 1 }]}>
          <Text style={[styles.cardTitle, isDarkMode && { color: '#F8FAFC' }]}>Pengingat Cerdas</Text>
          <View style={styles.toggleRow}>
            <View style={styles.toggleTextWrap}>
              <Ionicons name="notifications-outline" size={20} color={isDarkMode ? '#94A3B8' : '#4B5563'} style={{ marginRight: 10 }} />
              <Text style={[styles.toggleLabel, isDarkMode && { color: '#E2E8F0' }]}>Pengingat Persiapan Tidur (30 menit sebelumnya)</Text>
            </View>
            <Switch value={notifBedtime} onValueChange={setNotifBedtime} trackColor={{ false: '#E5E7EB', true: '#2563EB' }} />
          </View>
        </View>

        {}
        <SuccessModal
          visible={isSuccessVisible}
          onClose={() => setIsSuccessVisible(false)}
          message={successMessage}
          sleepTime={lastSavedData?.sleepTime || sleepTime}
          wakeTime={lastSavedData?.wakeTime || wakeTime}
          duration={lastSavedData?.duration || durasiTerpenuhi}
          ageGroup={lastSavedData?.ageGroup || ageGroup}
        />

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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
  },
  realTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  realTimeText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2563EB',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  loadingText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '600',
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

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B5563',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },

  pickerSection: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pickerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 12,
  },
  timeControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlColumn: {
    alignItems: 'center',
    width: 60,
  },
  adjustArrow: {
    padding: 8,
  },
  controlTimeValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
    marginVertical: 4,
  },
  numberInput: {
    fontSize: 26,
    fontWeight: '800',
    color: '#2563EB',
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    textAlign: 'center',
    width: 65,
    marginVertical: 4,
  },
  controlUnitLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  timeColon: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
    marginHorizontal: 12,
    paddingBottom: 28,
  },

  progressContainer: {
    marginTop: 4,
    marginBottom: 16,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 6,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressLabelLeft: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  progressLabelRight: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },

  saveDatabaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#10B981',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  saveDatabaseButtonDisabled: {
    opacity: 0.7,
  },
  saveDatabaseButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },

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

  savedDataCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  savedDataHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  savedTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  savedDataTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: 'Roboto',
  },
  openDetailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  openDetailText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3B82F6',
    marginRight: 2,
    fontFamily: 'Roboto',
  },
  savedTable: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  savedTableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  savedTableCell: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  savedCellText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    fontFamily: 'Roboto',
  },
});