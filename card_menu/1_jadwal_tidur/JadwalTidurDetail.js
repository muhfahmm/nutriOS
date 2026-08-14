import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../auth/AuthContext';
import { API_BASE_URL } from '../../auth/api';
import SuccessModal from './SuccessModal';
import { scheduleSleepReminder, getTimeUntilReminder, triggerTestNotification } from '../../components/SleepNotificationManager';

const { width } = Dimensions.get('window');

export default function JadwalTidurDetail({ route, navigation }) {
  const { user } = useContext(AuthContext);

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

  const initialSleepTime = route?.params?.sleepTime || defaultSleep;
  const initialWakeTime = route?.params?.wakeTime || defaultWake;
  const initialAgeGroup = route?.params?.ageGroup || 'Dewasa';

  const [sleepTime, setSleepTime] = useState(initialSleepTime);
  const [wakeTime, setWakeTime] = useState(initialWakeTime);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [isSuccessVisible, setIsSuccessVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [timeUntilReminder, setTimeUntilReminder] = useState('');

  useEffect(() => {
    const updateTime = () => {
      setTimeUntilReminder(getTimeUntilReminder(sleepTime));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, [sleepTime]);

  const handleTestNotif = async () => {
    const success = await triggerTestNotification(sleepTime);
    if (success) {
      Alert.alert('Sukses', 'Notifikasi percobaan berhasil dikirim! Mohon tunggu 3 detik.');
    } else {
      Alert.alert('Gagal', 'Izin notifikasi tidak aktif. Silakan aktifkan di pengaturan HP Anda.');
    }
  };

  const calculateSleepDuration = (sTime, wTime) => {
    try {
      const [sHour, sMin] = sTime.split('.').map(Number);
      const [wHour, wMin] = wTime.split('.').map(Number);

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

  const duration = calculateSleepDuration(sleepTime, wakeTime);

  const calculateSleepCycles = (hoursStr) => {
    const hours = parseFloat(hoursStr);
    if (isNaN(hours)) return { count: 0, text: 'N/A' };
    const cycles = (hours / 1.5).toFixed(1);

    let note = '';
    if (hours < 6) note = 'Kurang optimal (Disarankan minimal 4-5 siklus)';
    else if (hours >= 6 && hours <= 9) note = 'Sangat Baik (Ideal untuk pemulihan fisik & otak)';
    else note = 'Berlebih (Bisa memicu rasa lesu)';

    return { count: cycles, note };
  };

  const cycleData = calculateSleepCycles(duration);

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

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const payload = {
        userId: user?.id || null,
        sleepTime,
        wakeTime,
        ageGroup: initialAgeGroup,
        notifBedtime: true,
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

      const result = await response.json();

      if (response.ok) {

        await scheduleSleepReminder(sleepTime);

        setSuccessMessage('Target tidur harian berhasil diperbarui!');
        setIsSuccessVisible(true);
        setIsEditing(false);
      } else {
        Alert.alert('Gagal', result.message || 'Gagal menyimpan perubahan');
      }
    } catch (error) {
      console.error('[Jadwal Tidur Detail] Error saving changes:', error.message);
      Alert.alert('Error', 'Gagal terhubung ke database. Cek koneksi server Anda.');
    } finally {
      setIsSaving(false);
    }
  };

  const bedtimeTips = [
    { icon: 'phone-portrait-outline', title: 'Bebas Layar (Screen-Free)', desc: 'Matikan HP, tablet, dan TV 30-60 menit sebelum tidur untuk memicu hormon melatonin.' },
    { icon: 'bulb-outline', title: 'Pencahayaan Redup', desc: 'Gunakan lampu tidur yang redup atau matikan lampu sepenuhnya agar tidur lebih nyenyak.' },
    { icon: 'cafe-outline', title: 'Batasi Kafein', desc: 'Hindari kopi, teh kental, atau cokelat setidaknya 6 jam sebelum jadwal tidur Anda.' },
    { icon: 'thermometer-outline', title: 'Suhu Kamar Sejuk', desc: 'Atur suhu ruangan agar sejuk dan nyaman (sekitar 20-22°C jika menggunakan AC).' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rencana Tidur Anda</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.summaryTitleContainer}>
              <Ionicons name="sparkles" size={20} color="#3B82F6" />
              <Text style={styles.summaryTitle}>Target Tidur Harian</Text>
            </View>
            {!isEditing ? (
              <TouchableOpacity style={styles.editBadgeButton} onPress={() => setIsEditing(true)}>
                <Ionicons name="create-outline" size={14} color="#3B82F6" />
                <Text style={styles.editBadgeText}>Ubah</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.cancelBadgeButton} onPress={() => {
                setSleepTime(initialSleepTime);
                setWakeTime(initialWakeTime);
                setIsEditing(false);
              }}>
                <Text style={styles.cancelBadgeText}>Batal</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.timeRow}>
            {}
            <View style={styles.timeBlock}>
              <Text style={styles.timeLabel}>Tidur</Text>
              {isEditing && (
                <TouchableOpacity style={styles.adjustButtonMini} onPress={() => adjustTime('sleep', 'hour_up')}>
                  <Ionicons name="chevron-up" size={20} color="#3B82F6" />
                </TouchableOpacity>
              )}
              <Text style={styles.timeValue}>{sleepTime}</Text>
              {isEditing && (
                <TouchableOpacity style={styles.adjustButtonMini} onPress={() => adjustTime('sleep', 'hour_down')}>
                  <Ionicons name="chevron-down" size={20} color="#3B82F6" />
                </TouchableOpacity>
              )}
              <Text style={styles.timeUnit}>WIB</Text>
            </View>

            <View style={styles.arrowConnector}>
              <Ionicons name="arrow-forward" size={24} color="#94A3B8" />
            </View>

            {}
            <View style={styles.timeBlock}>
              <Text style={styles.timeLabel}>Bangun</Text>
              {isEditing && (
                <TouchableOpacity style={styles.adjustButtonMini} onPress={() => adjustTime('wake', 'hour_up')}>
                  <Ionicons name="chevron-up" size={20} color="#F59E0B" />
                </TouchableOpacity>
              )}
              <Text style={styles.timeValue}>{wakeTime}</Text>
              {isEditing && (
                <TouchableOpacity style={styles.adjustButtonMini} onPress={() => adjustTime('wake', 'hour_down')}>
                  <Ionicons name="chevron-down" size={20} color="#F59E0B" />
                </TouchableOpacity>
              )}
              <Text style={styles.timeUnit}>WIB</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.metaRow}>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>Total Durasi</Text>
              <Text style={styles.metaValue}>{duration} Jam</Text>
            </View>
          </View>

          {}
          <View style={styles.notificationTimeBox}>
            <Ionicons name="notifications-outline" size={16} color="#2563EB" style={{ marginRight: 6 }} />
            <Text style={styles.notificationTimeText}>
              Pengingat berbunyi: <Text style={styles.timeHighlight}>{timeUntilReminder}</Text>
            </Text>
          </View>

          {}
          <TouchableOpacity
            style={styles.testNotifButton}
            onPress={handleTestNotif}
            activeOpacity={0.8}
          >
            <Ionicons name="notifications-circle-outline" size={20} color="#2563EB" style={{ marginRight: 6 }} />
            <Text style={styles.testNotifText}>Coba Test Notifikasi (3 Detik)</Text>
          </TouchableOpacity>

          {}
          {isEditing && (
            <TouchableOpacity
              style={styles.saveChangesButton}
              onPress={handleSaveChanges}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.saveChangesText}>Simpan Target Baru</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="repeat" size={22} color="#10B981" />
            <Text style={styles.cardTitle}>Analisis Siklus Tidur (90m)</Text>
          </View>
          <Text style={styles.cardDescription}>
            Tidur manusia terdiri dari beberapa siklus berdurasi sekitar 90 menit. Bangun di akhir siklus membuat tubuh terasa segar bugar.
          </Text>

          <View style={styles.cycleBadgeBox}>
            <Text style={styles.cycleValue}>{cycleData.count}</Text>
            <Text style={styles.cycleLabel}>Siklus Terpenuhi</Text>
          </View>

          <View style={styles.statusBox}>
            <Ionicons name="information-circle" size={18} color="#059669" style={{ marginRight: 8 }} />
            <Text style={styles.statusText}>{cycleData.note}</Text>
          </View>
        </View>

        {}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="moon-outline" size={22} color="#8B5CF6" />
            <Text style={styles.cardTitle}>Rutinitas Sebelum Tidur</Text>
          </View>

          {bedtimeTips.map((tip, idx) => (
            <View key={idx} style={styles.tipItem}>
              <View style={styles.tipIconContainer}>
                <Ionicons name={tip.icon} size={22} color="#8B5CF6" />
              </View>
              <View style={styles.tipTextContent}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipDesc}>{tip.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {}
      <SuccessModal
        visible={isSuccessVisible}
        onClose={() => setIsSuccessVisible(false)}
        message={successMessage}
        sleepTime={sleepTime}
        wakeTime={wakeTime}
        duration={duration}
        ageGroup={initialAgeGroup}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Roboto',
  },
  headerRightPlaceholder: {
    width: 40,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'Roboto',
  },
  editBadgeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 4,
  },
  editBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3B82F6',
    fontFamily: 'Roboto',
  },
  cancelBadgeButton: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  cancelBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    fontFamily: 'Roboto',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
  },
  timeBlock: {
    alignItems: 'center',
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  timeValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Roboto',
    marginVertical: 4,
  },
  timeUnit: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2,
  },
  adjustButtonMini: {
    padding: 2,
  },
  arrowConnector: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  metaCol: {
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  saveChangesButton: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    flexDirection: 'row',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  saveChangesText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Roboto',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginLeft: 8,
    fontFamily: 'Roboto',
  },
  cardDescription: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 20,
    fontFamily: 'Roboto',
  },
  cycleBadgeBox: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    borderRadius: 80,
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  cycleValue: {
    fontSize: 36,
    fontWeight: '900',
    color: '#059669',
  },
  cycleLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#047857',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  statusText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
    fontFamily: 'Roboto',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  tipIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F5F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  tipTextContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
    fontFamily: 'Roboto',
  },
  tipDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    fontFamily: 'Roboto',
  },

  notificationTimeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  notificationTimeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E40AF',
    fontFamily: 'Roboto',
  },
  timeHighlight: {
    color: '#2563EB',
    fontWeight: '800',
  },
  testNotifButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  testNotifText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
    fontFamily: 'Roboto',
  },
});
