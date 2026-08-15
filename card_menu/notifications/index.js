import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../auth/AuthContext';

export default function NotificationScreen({ navigation }) {
  const { isDarkMode } = useContext(AuthContext);

  const [sleepEnabled, setSleepEnabled] = useState(false);
  const [sleepTime, setSleepTime] = useState('22:00');

  const [mealSchedule, setMealSchedule] = useState({ breakfast: '-', lunch: '-', dinner: '-' });
  const [mealNotifs, setMealNotifs] = useState({ breakfast: false, lunch: false, dinner: false });

  const [workoutSchedules, setWorkoutSchedules] = useState([]);
  const [realLogs, setRealLogs] = useState([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadAllSettings();
    });
    return unsubscribe;
  }, [navigation]);

  const loadAllSettings = async () => {
    try {
      const storedSleepEnabled = await AsyncStorage.getItem('sleep_reminder_enabled');
      const storedSleepTime = await AsyncStorage.getItem('sleep_reminder_time');
      setSleepEnabled(storedSleepEnabled === 'true');
      if (storedSleepTime) setSleepTime(storedSleepTime);

      const storedMealSchedule = await AsyncStorage.getItem('meal_schedule');
      if (storedMealSchedule) setMealSchedule(JSON.parse(storedMealSchedule));

      const storedMealNotifs = await AsyncStorage.getItem('meal_notif_states');
      if (storedMealNotifs) setMealNotifs(JSON.parse(storedMealNotifs));

      const storedWorkout = await AsyncStorage.getItem('workout_schedules');
      if (storedWorkout) {
        const list = JSON.parse(storedWorkout);
        const upcoming = list.filter(item => new Date(item.dateTime) > new Date())
                             .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
        setWorkoutSchedules(upcoming);
      }

      const storedLogs = await AsyncStorage.getItem('notification_history');
      if (storedLogs) {
        setRealLogs(JSON.parse(storedLogs));
      } else {
        setRealLogs([]);
      }
    } catch (e) {
      console.warn('Gagal memuat data notifikasi di Notification Center:', e);
    }
  };

  const getSimulatedLogs = () => {
    const logs = [];

    if (sleepEnabled) {
      logs.push({
        id: 'sleep-log',
        category: 'Jadwal Tidur',
        title: 'Pengingat Waktu Tidur',
        desc: `Persiapan tidur dianjurkan 30 menit sebelum jam ${sleepTime}.`,
        time: 'Tadi Malam',
        icon: 'moon',
        color: '#818CF8'
      });
    }

    if (mealNotifs.breakfast) {
      logs.push({
        id: 'meal-b-log',
        category: 'Pola Makan',
        title: 'Saatnya Sarapan Pagi ☕',
        desc: `Waktunya sarapan sehat sesuai jadwal Anda pada pukul ${mealSchedule.breakfast}.`,
        time: 'Pagi Ini',
        icon: 'cafe',
        color: '#34D399'
      });
    }

    if (mealNotifs.lunch) {
      logs.push({
        id: 'meal-l-log',
        category: 'Pola Makan',
        title: 'Saatnya Makan Siang 🍽️',
        desc: `Jangan lewatkan asupan nutrisi makan siang Anda pada jam ${mealSchedule.lunch}.`,
        time: 'Siang Ini',
        icon: 'restaurant',
        color: '#FB7185'
      });
    }

    if (workoutSchedules.length > 0) {
      workoutSchedules.forEach((item, index) => {
        const dateObj = new Date(item.dateTime);
        const formatted = dateObj.toLocaleDateString('id-ID', {
          weekday: 'long', hour: '2-digit', minute: '2-digit'
        });
        logs.push({
          id: `workout-log-${index}`,
          category: 'Olahraga',
          title: `Latihan Rutin: ${item.exerciseName}`,
          desc: `Jadwal latihan rutin Anda diatur pada hari ${formatted}. Tetap konsisten!`,
          time: 'Mendatang',
          icon: 'barbell',
          color: '#3B82F6'
        });
      });
    }

    return logs;
  };

  const logs = realLogs.length > 0 ? realLogs : getSimulatedLogs();

  return (
    <SafeAreaView style={[styles.container, isDarkMode && { backgroundColor: '#0F172A' }]}>
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={[styles.backButton, isDarkMode && { backgroundColor: '#1E293B' }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={isDarkMode ? '#60A5FA' : '#2563EB'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDarkMode && { color: '#F8FAFC' }]}>Pusat Notifikasi</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
          <Text style={[styles.cardTitle, isDarkMode && { color: '#F8FAFC' }]}>🔔 Status Pengingat Harian</Text>

          <View style={[styles.notifRow, isDarkMode && { borderBottomColor: '#334155' }]}>
            <View style={styles.notifInfo}>
              <View style={[styles.iconBox, { backgroundColor: '#EEF2FF' }, isDarkMode && { backgroundColor: '#312E81' }]}>
                <Ionicons name="moon" size={18} color="#6366F1" />
              </View>
              <View style={styles.textBox}>
                <Text style={[styles.itemTitle, isDarkMode && { color: '#F8FAFC' }]}>Jam Tidur</Text>
                <Text style={[styles.itemSub, isDarkMode && { color: '#94A3B8' }]}>
                  {sleepEnabled ? `Aktif • Setiap hari jam ${sleepTime}` : 'Nonaktif'}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('MainTabs', { screen: 'Beranda', params: { screen: 'JadwalTidur' } })}>
              <Text style={styles.actionBtnText}>Ubah</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.notifRow, isDarkMode && { borderBottomColor: '#334155' }]}>
            <View style={styles.notifInfo}>
              <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }, isDarkMode && { backgroundColor: '#064E3B' }]}>
                <Ionicons name="cafe" size={18} color="#10B981" />
              </View>
              <View style={styles.textBox}>
                <Text style={[styles.itemTitle, isDarkMode && { color: '#F8FAFC' }]}>Pengingat Sarapan</Text>
                <Text style={[styles.itemSub, isDarkMode && { color: '#94A3B8' }]}>
                  {mealNotifs.breakfast ? `Aktif • Jam ${mealSchedule.breakfast}` : 'Nonaktif'}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('MainTabs', { screen: 'Beranda', params: { screen: 'PolaMakan' } })}>
              <Text style={styles.actionBtnText}>Ubah</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.notifRow, isDarkMode && { borderBottomColor: '#334155' }]}>
            <View style={styles.notifInfo}>
              <View style={[styles.iconBox, { backgroundColor: '#FFFBEB' }, isDarkMode && { backgroundColor: '#78350F' }]}>
                <Ionicons name="restaurant" size={18} color="#F59E0B" />
              </View>
              <View style={styles.textBox}>
                <Text style={[styles.itemTitle, isDarkMode && { color: '#F8FAFC' }]}>Makan Siang</Text>
                <Text style={[styles.itemSub, isDarkMode && { color: '#94A3B8' }]}>
                  {mealNotifs.lunch ? `Aktif • Jam ${mealSchedule.lunch}` : 'Nonaktif'}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('MainTabs', { screen: 'Beranda', params: { screen: 'PolaMakan' } })}>
              <Text style={styles.actionBtnText}>Ubah</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.notifRow}>
            <View style={styles.notifInfo}>
              <View style={[styles.iconBox, { backgroundColor: '#FEF2F2' }, isDarkMode && { backgroundColor: '#7F1D1D' }]}>
                <Ionicons name="alarm" size={18} color="#EF4444" />
              </View>
              <View style={styles.textBox}>
                <Text style={[styles.itemTitle, isDarkMode && { color: '#F8FAFC' }]}>Makan Malam</Text>
                <Text style={[styles.itemSub, isDarkMode && { color: '#94A3B8' }]}>
                  {mealNotifs.dinner ? `Aktif • Jam ${mealSchedule.dinner}` : 'Nonaktif'}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('MainTabs', { screen: 'Beranda', params: { screen: 'PolaMakan' } })}>
              <Text style={styles.actionBtnText}>Ubah</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.card, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
          <Text style={[styles.cardTitle, isDarkMode && { color: '#F8FAFC' }]}>📅 Jadwal Olahraga Mendatang</Text>
          {workoutSchedules.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={32} color="#9CA3AF" />
              <Text style={[styles.emptyText, isDarkMode && { color: '#94A3B8' }]}>Tidak ada jadwal olahraga mendatang.</Text>
              <TouchableOpacity style={styles.createBtn} onPress={() => navigation.navigate('JadwalOlahraga')}>
                <Text style={styles.createBtnText}>Buat Jadwal Baru</Text>
              </TouchableOpacity>
            </View>
          ) : (
            workoutSchedules.map((item) => {
              const dateObj = new Date(item.dateTime);
              const formattedDate = dateObj.toLocaleDateString('id-ID', {
                weekday: 'long', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
              });
              return (
                <View key={item.id} style={[styles.workoutRow, isDarkMode && { borderBottomColor: '#334155' }]}>
                  <View style={styles.workoutInfo}>
                    <Ionicons name="barbell-outline" size={20} color="#2563EB" style={{ marginRight: 10 }} />
                    <View>
                      <Text style={[styles.itemTitle, isDarkMode && { color: '#F8FAFC' }]}>{item.exerciseName}</Text>
                      <Text style={[styles.itemSub, isDarkMode && { color: '#94A3B8' }]}>{formattedDate}</Text>
                    </View>
                  </View>
                  <Ionicons name="notifications-circle" size={22} color="#10B981" />
                </View>
              );
            })
          )}
        </View>

        <View style={[styles.card, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
          <Text style={[styles.cardTitle, isDarkMode && { color: '#F8FAFC' }]}>📋 Riwayat Notifikasi</Text>
          {logs.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off-outline" size={32} color="#9CA3AF" />
              <Text style={[styles.emptyText, isDarkMode && { color: '#94A3B8' }]}>Belum ada riwayat notifikasi hari ini.</Text>
            </View>
          ) : (
            logs.map((log) => (
              <View key={log.id} style={[styles.logItem, isDarkMode && { borderBottomColor: '#334155' }]}>
                <View style={[styles.logIconBox, { backgroundColor: log.color + '20' }]}>
                  <Ionicons name={log.icon} size={18} color={log.color} />
                </View>
                <View style={styles.logContent}>
                  <View style={styles.logHeader}>
                    <Text style={styles.logCategory}>{log.category}</Text>
                    <Text style={styles.logTime}>{log.time}</Text>
                  </View>
                  <Text style={[styles.logTitle, isDarkMode && { color: '#F8FAFC' }]}>{log.title}</Text>
                  <Text style={[styles.logDesc, isDarkMode && { color: '#CBD5E1' }]}>{log.desc}</Text>
                </View>
              </View>
            ))
          )}
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
  headerBar: {
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  notifRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  notifInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textBox: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  itemSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  createBtn: {
    marginTop: 12,
    backgroundColor: '#2563EB',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  workoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  workoutInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logItem: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  logIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  logContent: {
    flex: 1,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  logCategory: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  logTime: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  logTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 2,
  },
  logDesc: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
});
