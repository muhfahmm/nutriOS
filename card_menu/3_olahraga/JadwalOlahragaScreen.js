import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Platform,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { AuthContext } from '../../auth/AuthContext';

export default function JadwalOlahragaScreen({ navigation }) {
  const { isDarkMode } = useContext(AuthContext);
  const [schedules, setSchedules] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());


  const [modalVisible, setModalVisible] = useState(false);
  const [exerciseName, setExerciseName] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    loadSchedules();
    setupNotificationChannel();
  }, []);

  const setupNotificationChannel = async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('workout-channel', {
        name: 'Jadwal Olahraga',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#3B82F6',
      });
    }
  };

  const loadSchedules = async () => {
    try {
      const stored = await AsyncStorage.getItem('workout_schedules');
      if (stored) {
        setSchedules(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Gagal memuat jadwal olahraga:', e);
    }
  };

  const saveSchedules = async (updatedSchedules) => {
    try {
      await AsyncStorage.setItem('workout_schedules', JSON.stringify(updatedSchedules));
      setSchedules(updatedSchedules);
    } catch (e) {
      console.warn('Gagal menyimpan jadwal olahraga:', e);
    }
  };

  const handleAddSchedule = async () => {
    if (!exerciseName.trim()) {
      Alert.alert('Peringatan', 'Nama latihan tidak boleh kosong!');
      return;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Izin Notifikasi',
        'Anda harus memberikan izin notifikasi di pengaturan agar pengingat jadwal berfungsi.'
      );
      return;
    }


    const scheduledDateTime = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      time.getHours(),
      time.getMinutes(),
      0
    );

    if (scheduledDateTime < new Date()) {
      Alert.alert('Peringatan', 'Harap pilih tanggal dan waktu di masa depan!');
      return;
    }

    const newId = Date.now().toString();

    const secondsDiff = Math.max(1, Math.round((scheduledDateTime.getTime() - Date.now()) / 1000));


    try {
      await Notifications.scheduleNotificationAsync({
        identifier: `workout-${newId}`,
        content: {
          title: 'Waktunya Olahraga! 🏋️‍♂️',
          body: `Ayo mulai latihan rutin Anda: ${exerciseName}! Tetap konsisten untuk hidup sehat.`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: secondsDiff,
          channelId: 'workout-channel'
        },
      });

      const newItem = {
        id: newId,
        exerciseName: exerciseName.trim(),
        dateTime: scheduledDateTime.toISOString(),
      };

      const updated = [...schedules, newItem];
      await saveSchedules(updated);

      setModalVisible(false);
      setExerciseName('');
      setDate(new Date());
      setTime(new Date());


      setSelectedDate(scheduledDateTime);
      setCurrentMonth(scheduledDateTime);

      Alert.alert('Sukses', 'Jadwal olahraga berhasil disimpan dan pengingat dijadwalkan!');
    } catch (error) {
      console.error('Error scheduling notification:', error);
      Alert.alert('Error', 'Gagal mengatur pengingat notifikasi.');
    }
  };

  const handleDeleteSchedule = async (id) => {
    Alert.alert(
      'Hapus Jadwal',
      'Apakah Anda yakin ingin menghapus jadwal latihan ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await Notifications.cancelScheduledNotificationAsync(`workout-${id}`);
              const updated = schedules.filter((item) => item.id !== id);
              await saveSchedules(updated);
            } catch (e) {
              console.warn(e);
            }
          },
        },
      ]
    );
  };

  const isSameDay = (d1, d2) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };


  const prevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };


  const getDaysInMonthGrid = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth();

    const firstDay = new Date(year, month, 1);
    let startDayOfWeek = firstDay.getDay();
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    const totalDays = new Date(year, month + 1, 0).getDate();

    const grid = [];


    for (let i = 0; i < startDayOfWeek; i++) {
      grid.push(null);
    }


    for (let day = 1; day <= totalDays; day++) {
      grid.push(new Date(year, month, day));
    }

    return grid;
  };

  const gridData = getDaysInMonthGrid(currentMonth);


  const displayedSchedules = schedules
    .filter((item) => isSameDay(new Date(item.dateTime), selectedDate))
    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

  const onDateChange = (event, selectedValue) => {
    setShowDatePicker(false);
    if (selectedValue) {
      setDate(selectedValue);
    }
  };

  const onTimeChange = (event, selectedValue) => {
    setShowTimePicker(false);
    if (selectedValue) {
      setTime(selectedValue);
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && { backgroundColor: '#0F172A' }]}>

      <View style={[styles.headerRow, isDarkMode && { borderBottomColor: '#1E293B' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#F8FAFC' : '#1F2937'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDarkMode && { color: '#F8FAFC' }]}>Jadwal Rutin Olahraga</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        <View style={[styles.calendarCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>

          <View style={styles.monthHeader}>
            <TouchableOpacity onPress={prevMonth} style={styles.monthNavBtn}>
              <Ionicons name="chevron-back" size={20} color={isDarkMode ? '#CBD5E1' : '#4B5563'} />
            </TouchableOpacity>
            <Text style={[styles.monthLabel, isDarkMode && { color: '#F8FAFC' }]}>
              {currentMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </Text>
            <TouchableOpacity onPress={nextMonth} style={styles.monthNavBtn}>
              <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#CBD5E1' : '#4B5563'} />
            </TouchableOpacity>
          </View>


          <View style={styles.weekLabelsRow}>
            {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((dayLabel) => (
              <Text key={dayLabel} style={[styles.weekLabelText, isDarkMode && { color: '#64748B' }]}>
                {dayLabel}
              </Text>
            ))}
          </View>


          <View style={styles.gridContainer}>
            {gridData.map((cellDate, idx) => {
              if (!cellDate) {
                return <View key={`empty-${idx}`} style={styles.gridCellEmpty} />;
              }

              const active = isSameDay(cellDate, selectedDate);
              const today = isSameDay(cellDate, new Date());
              const hasEvents = schedules.some((item) => isSameDay(new Date(item.dateTime), cellDate));

              return (
                <TouchableOpacity
                  key={`day-${cellDate.getDate()}-${idx}`}
                  style={[
                    styles.gridCell,
                    active && styles.gridCellActive,
                    today && !active && styles.gridCellToday,
                  ]}
                  onPress={() => setSelectedDate(cellDate)}
                >
                  <Text
                    style={[
                      styles.cellText,
                      active && styles.cellTextActive,
                      today && !active && styles.cellTextToday,
                      isDarkMode && !active && !today && { color: '#F8FAFC' },
                    ]}
                  >
                    {cellDate.getDate()}
                  </Text>
                  {hasEvents && (
                    <View style={[styles.eventIndicator, active && { backgroundColor: '#FFFFFF' }]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>


        <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
          <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }]}>
            Agenda - {selectedDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>

          {displayedSchedules.length === 0 ? (
            <View style={[styles.emptyContainer, { minHeight: 180 }]}>
              <Ionicons name="calendar-outline" size={54} color={isDarkMode ? '#334155' : '#E2E8F0'} style={{ marginBottom: 10 }} />
              <Text style={[styles.emptyText, isDarkMode && { color: '#64748B' }]}>Tidak ada jadwal olahraga pada hari ini.</Text>
              <Text style={[styles.emptySubtext, isDarkMode && { color: '#475569' }]}>Klik tombol tambah untuk merencanakan latihan Anda!</Text>
            </View>
          ) : (
            displayedSchedules.map((item) => {
              const itemDate = new Date(item.dateTime);
              const timeStr = itemDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
              return (
                <View key={item.id} style={[styles.scheduleCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
                  <View style={styles.cardLeft}>
                    <View style={styles.timeContainer}>
                      <Ionicons name="time-outline" size={16} color="#3B82F6" style={{ marginRight: 4 }} />
                      <Text style={[styles.timeText, isDarkMode && { color: '#F8FAFC' }]}>{timeStr}</Text>
                    </View>
                    <Text style={[styles.exerciseText, isDarkMode && { color: '#CBD5E1' }]}>{item.exerciseName}</Text>
                  </View>
                  <View style={styles.cardRight}>
                    <View style={styles.bellIconWrap}>
                      <Ionicons name="notifications" size={16} color="#10B981" />
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteSchedule(item.id)} style={styles.deleteBtn}>
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>


      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>


      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode && { backgroundColor: '#1E293B' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDarkMode && { color: '#F8FAFC' }]}>Tambah Pengingat Olahraga</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={isDarkMode ? '#94A3B8' : '#6B7280'} />
              </TouchableOpacity>
            </View>


            <Text style={[styles.inputLabel, isDarkMode && { color: '#CBD5E1' }]}>Nama Latihan</Text>
            <TextInput
              style={[styles.textInput, isDarkMode && { backgroundColor: '#334155', color: '#F8FAFC', borderColor: '#475569' }]}
              placeholder="Misal: Push Up, Berenang, Bersepeda..."
              placeholderTextColor={isDarkMode ? '#94A3B8' : '#9CA3AF'}
              value={exerciseName}
              onChangeText={setExerciseName}
            />


            <View style={styles.pickersRow}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={[styles.inputLabel, isDarkMode && { color: '#CBD5E1' }]}>Tanggal</Text>
                <TouchableOpacity
                  style={[styles.pickerToggle, isDarkMode && { backgroundColor: '#334155', borderColor: '#475569' }]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={[styles.pickerToggleText, isDarkMode && { color: '#F8FAFC' }]}>
                    {date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Text>
                  <Ionicons name="calendar-outline" size={16} color="#3B82F6" />
                </TouchableOpacity>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, isDarkMode && { color: '#CBD5E1' }]}>Jam</Text>
                <TouchableOpacity
                  style={[styles.pickerToggle, isDarkMode && { backgroundColor: '#334155', borderColor: '#475569' }]}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={[styles.pickerToggleText, isDarkMode && { color: '#F8FAFC' }]}>
                    {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  <Ionicons name="time-outline" size={16} color="#3B82F6" />
                </TouchableOpacity>
              </View>
            </View>


            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                minimumDate={new Date()}
                onChange={onDateChange}
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={time}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onTimeChange}
              />
            )}


            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.cancelBtn, isDarkMode && { borderColor: '#475569' }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.cancelText, isDarkMode && { color: '#94A3B8' }]}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddSchedule}>
                <Text style={styles.saveText}>Simpan Pengingat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FF',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: 'transparent',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 6,
  },
  monthNavBtn: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  weekLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  weekLabelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    width: 38,
    textAlign: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    rowGap: 8,
  },
  gridCell: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  gridCellEmpty: {
    width: 38,
    height: 38,
  },
  gridCellActive: {
    backgroundColor: '#3B82F6',
  },
  gridCellToday: {
    borderWidth: 1.5,
    borderColor: '#3B82F6',
  },
  cellText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  cellTextActive: {
    color: '#FFFFFF',
  },
  cellTextToday: {
    color: '#3B82F6',
  },
  eventIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3B82F6',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },
  scheduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
  },
  cardLeft: {
    flex: 1,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  exerciseText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bellIconWrap: {
    backgroundColor: '#E6F4EA',
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    padding: 6,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#3B82F6',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#3B82F6',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 16,
  },
  pickersRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  pickerToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  pickerToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  saveText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
