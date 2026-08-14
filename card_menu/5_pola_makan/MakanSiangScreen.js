import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { AuthContext } from '../../auth/AuthContext';
import { API_BASE_URL } from '../../auth/api';
import { registerMealNotificationsAsync } from '../../components/MealNotificationManager';

export default function MakanSiangScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const userId = user?.id || 'guest';

  const now = new Date();
  const currentHour = now.getHours().toString().padStart(2, '0');
  const currentMinute = now.getMinutes().toString().padStart(2, '0');

  const [hour, setHour] = useState(currentHour);
  const [minute, setMinute] = useState(currentMinute);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchMealData();
  }, [userId]);

  const fetchMealData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/pola-makan/${userId}`);
      if (response.ok) {
        const { schedules } = await response.json();

        const lunchSched = schedules.find(s => s.meal_type === 'lunch');
        if (lunchSched && lunchSched.meal_time !== '-') {
          const [h, m] = lunchSched.meal_time.split('.');
          setHour(h);
          setMinute(m);
          setNotifEnabled(lunchSched.notif_enabled === 1);
        }
      }
    } catch (e) {
      console.log('Error fetching meal data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTime = async () => {
    const h = parseInt(hour, 10);
    const m = parseInt(minute, 10);
    if (isNaN(h) || h < 0 || h > 23 || isNaN(m) || m < 0 || m > 59) {
      Alert.alert('Gagal', 'Format waktu tidak valid!');
      return;
    }
    const formattedHour = h < 10 ? `0${h}` : `${h}`;
    const formattedMinute = m < 10 ? `0${m}` : `${m}`;
    const finalTime = `${formattedHour}.${formattedMinute}`;

    try {
      const saveResponse = await fetch(`${API_BASE_URL}/api/jadwal-makan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          mealType: 'lunch',
          mealTime: finalTime,
          notifEnabled: notifEnabled ? 1 : 0
        })
      });

      if (!saveResponse.ok) {
        Alert.alert('Gagal', 'Gagal menyimpan ke database.');
        return;
      }

      if (notifEnabled) {
        const hasPermission = await registerMealNotificationsAsync();
        if (!hasPermission) {
          Alert.alert('Izin Ditolak', 'Harap aktifkan izin notifikasi di pengaturan HP Anda.');
          return;
        }

        await Notifications.cancelScheduledNotificationAsync('meal-lunch');
        await Notifications.scheduleNotificationAsync({
          identifier: 'meal-lunch',
          content: {
            title: 'Waktunya Makan Siang! 🍽️',
            body: 'Sudah jam makan siang. Istirahat sejenak dan nikmati makan siang sehat Anda!',
            sound: true,
            android: {
              channelId: 'meal-channel',
              importance: Notifications.AndroidImportance.MAX,
            }
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: h,
            minute: m,
          },
        });

        const nowTime = new Date();
        if (h === nowTime.getHours() && m === nowTime.getMinutes()) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Waktunya Makan Siang! 🍽️',
              body: 'Sudah jam makan siang. Istirahat sejenak dan nikmati makan siang sehat Anda!',
              sound: true,
              android: {
                channelId: 'meal-channel',
                importance: Notifications.AndroidImportance.MAX,
              }
            },
            trigger: {
              seconds: 1,
            },
          });
        }

        navigation.navigate('PolaMakan', {
          updatedMeal: 'lunch',
          updatedTime: finalTime
        });

        Alert.alert('Berhasil', `Waktu pengingat makan siang diubah ke ${formattedHour}.${formattedMinute} dan Notifikasi Diaktifkan!`);
      } else {
        await Notifications.cancelScheduledNotificationAsync('meal-lunch');

        navigation.navigate('PolaMakan', {
          updatedMeal: 'lunch',
          updatedTime: finalTime
        });

        Alert.alert('Berhasil', `Waktu pengingat makan siang diubah ke ${formattedHour}.${formattedMinute} (Notifikasi Nonaktif)`);
      }
    } catch (e) {
      console.log(e);
      Alert.alert('Error', 'Terjadi kesalahan saat mengatur notifikasi.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Menu Makan Siang</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Ionicons name="alarm-outline" size={22} color="#2563EB" style={{ marginRight: 8 }} />
              <Text style={styles.sectionTitle}>Atur Waktu Pengingat Makan Siang</Text>
            </View>

            {}
            <View style={styles.notifToggleRow}>
              <View style={styles.notifToggleTextCol}>
                <Text style={styles.notifToggleLabel}>Aktifkan Notifikasi Makan Siang</Text>
                <Text style={styles.notifToggleDesc}>Dapatkan push notification pada jam makan siang</Text>
              </View>
              <Switch
                value={notifEnabled}
                onValueChange={setNotifEnabled}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
              />
            </View>

            <View style={styles.timePickerContainer}>
              <View style={styles.timeInputColumn}>
                <Text style={styles.timeLabel}>Jam</Text>
                <TextInput
                  style={styles.timeInput}
                  keyboardType="number-pad"
                  maxLength={2}
                  value={hour}
                  onChangeText={setHour}
                />
              </View>
              <Text style={styles.timeSeparator}>:</Text>
              <View style={styles.timeInputColumn}>
                <Text style={styles.timeLabel}>Menit</Text>
                <TextInput
                  style={styles.timeInput}
                  keyboardType="number-pad"
                  maxLength={2}
                  value={minute}
                  onChangeText={setMinute}
                />
              </View>
            </View>
            <TouchableOpacity style={styles.primaryButton} onPress={handleSaveTime}>
              <Text style={styles.buttonText}>Simpan Waktu</Text>
            </TouchableOpacity>
          </View>

          {}
          <View style={styles.statusCard}>
            <View style={styles.cardHeaderRow}>
              <Ionicons name="information-circle-outline" size={20} color="#2563EB" style={{ marginRight: 6 }} />
              <Text style={styles.statusTitle}>Detail Pengingat Saat Ini</Text>
            </View>
            <View style={styles.statusInfoRow}>
              <Text style={styles.statusInfoLabel}>Jam Pengingat:</Text>
              <Text style={styles.statusInfoValue}>{hour}.{minute}</Text>
            </View>
            <View style={styles.statusInfoRow}>
              <Text style={styles.statusInfoLabel}>Status Notifikasi:</Text>
              <Text style={[styles.statusInfoValue, { color: notifEnabled ? '#10B981' : '#EF4444' }]}>
                {notifEnabled ? 'Aktif' : 'Nonaktif'}
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  scrollContent: {
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
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
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 14,
  },
  timeInputColumn: {
    alignItems: 'center',
    width: 60,
  },
  timeLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },
  timeInput: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2563EB',
    textAlign: 'center',
    width: '100%',
  },
  timeSeparator: {
    fontSize: 22,
    fontWeight: '800',
    color: '#9CA3AF',
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginTop: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  statusInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  statusInfoLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  statusInfoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  }
});
