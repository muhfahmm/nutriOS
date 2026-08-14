import React, { useState, useEffect, useContext } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Switch,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { scheduleMealReminders } from '../../components/MealNotificationManager';
import { AuthContext } from '../../auth/AuthContext';
import { API_BASE_URL } from '../../auth/api';

export default function PolaMakanScreen({ navigation, route }) {
  const { user } = useContext(AuthContext);
  const userId = user?.id || 'guest';

  // --- STATE MOCK (INTERAKTIF) ---
  // 1. Scheduler State
  const [schedule, setSchedule] = useState({
    breakfast: '-',
    lunch: '-',
    dinner: '-',
  });

  const [notifStates, setNotifStates] = useState({
    breakfast: false,
    lunch: false,
    dinner: false,
  });

  const fetchPolaMakan = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pola-makan/${userId}`);
      if (response.ok) {
        const { schedules } = await response.json();
        const mappedSchedule = {
          breakfast: '-',
          lunch: '-',
          dinner: '-',
        };
        const mappedNotif = {
          breakfast: false,
          lunch: false,
          dinner: false,
        };
        schedules.forEach(item => {
          if (item.meal_type === 'breakfast') {
            mappedSchedule.breakfast = item.meal_time;
            mappedNotif.breakfast = item.notif_enabled === 1;
          }
          else if (item.meal_type === 'lunch') {
            mappedSchedule.lunch = item.meal_time;
            mappedNotif.lunch = item.notif_enabled === 1;
          }
          else if (item.meal_type === 'dinner') {
            mappedSchedule.dinner = item.meal_time;
            mappedNotif.dinner = item.notif_enabled === 1;
          }
        });
        setSchedule(mappedSchedule);
        setNotifStates(mappedNotif);
      }
    } catch (error) {
      console.log('Error fetching pola makan:', error);
    }
  };

  useEffect(() => {
    fetchPolaMakan();
  }, [userId]);

  useEffect(() => {
    if (route.params?.updatedMeal && route.params?.updatedTime) {
      fetchPolaMakan();
      navigation.setParams({ updatedMeal: undefined, updatedTime: undefined });
    }
  }, [route.params]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Pola Makan</Text>
          <Text style={styles.subtitle}>Atur jadwal dan pantau pengingat nutrisi harian.</Text>
        </View>
 
        {/* 1. SCHEDULER PENGINGAT MAKAN */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="time" size={22} color="#2563EB" style={{ marginRight: 8 }} />
            <Text style={styles.cardTitle}>Scheduler Makan</Text>
          </View>
          <Text style={styles.subCardTitle}>Ketuk kategori makan untuk mengatur jam pengingat</Text>
          
          <View style={styles.scheduleGrid}>
            {Object.entries(schedule).map(([key, time]) => {
              const icons = { breakfast: 'cafe-outline', lunch: 'restaurant-outline', dinner: 'moon-outline' };
              const labels = { breakfast: 'Sarapan', lunch: 'Makan Siang', dinner: 'Makan Malam' };
              const screenNames = { breakfast: 'Sarapan', lunch: 'MakanSiang', dinner: 'MakanMalam' };
              return (
                <TouchableOpacity 
                  key={key} 
                  style={styles.scheduleItem} 
                  onPress={() => navigation.navigate(screenNames[key])}
                >
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

            {/* Tombol Tambah Jadwal (+ Icon) */}
            <TouchableOpacity 
              style={styles.scheduleItem} 
              onPress={() => navigation.navigate('TambahJadwal')}
            >
              <View style={[styles.scheduleIconWrap, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="add" size={24} color="#0284C7" />
              </View>
              <Text style={styles.scheduleLabel}>Tambah</Text>
              <View style={[styles.scheduleTimeBox, { backgroundColor: '#F0F9FF' }]}>
                <Text style={[styles.scheduleTime, { color: '#0284C7' }]}>Kustom</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* DETAIL PENGINGAT MAKAN TABLE */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="notifications-outline" size={22} color="#2563EB" style={{ marginRight: 8 }} />
            <Text style={styles.cardTitle}>Daftar Pengingat Aktif</Text>
          </View>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Kategori</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1.5, textAlign: 'center' }]}>Waktu</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1.5, textAlign: 'right' }]}>Notifikasi</Text>
          </View>
          
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 2, fontWeight: '700' }]}>☕ Sarapan</Text>
            <Text style={[styles.tableCell, { flex: 1.5, textAlign: 'center', color: '#2563EB', fontWeight: '700' }]}>
              {schedule.breakfast}
            </Text>
            <Text style={[styles.tableCell, { flex: 1.5, textAlign: 'right', fontWeight: '700', color: notifStates.breakfast ? '#10B981' : '#EF4444' }]}>
              {notifStates.breakfast ? 'Aktif' : 'Nonaktif'}
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 2, fontWeight: '700' }]}>🍽️ Makan Siang</Text>
            <Text style={[styles.tableCell, { flex: 1.5, textAlign: 'center', color: '#2563EB', fontWeight: '700' }]}>
              {schedule.lunch}
            </Text>
            <Text style={[styles.tableCell, { flex: 1.5, textAlign: 'right', fontWeight: '700', color: notifStates.lunch ? '#10B981' : '#EF4444' }]}>
              {notifStates.lunch ? 'Aktif' : 'Nonaktif'}
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 2, fontWeight: '700' }]}>🌙 Makan Malam</Text>
            <Text style={[styles.tableCell, { flex: 1.5, textAlign: 'center', color: '#2563EB', fontWeight: '700' }]}>
              {schedule.dinner}
            </Text>
            <Text style={[styles.tableCell, { flex: 1.5, textAlign: 'right', fontWeight: '700', color: notifStates.dinner ? '#10B981' : '#EF4444' }]}>
              {notifStates.dinner ? 'Aktif' : 'Nonaktif'}
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
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 0,
  },
  notifToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 14,
  },
  notifToggleTextCol: {
    flex: 1,
    marginRight: 10,
  },
  notifToggleLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 2,
  },
  notifToggleDesc: {
    fontSize: 11,
    color: '#6B7280',
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
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 10,
    marginBottom: 8,
  },
  tableHeaderCell: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4B5563',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingVertical: 12,
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 14,
    color: '#1F2937',
  },
});