import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export async function registerMealNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('meal-channel', {
      name: 'Pengingat Pola Makan',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF3B82F6',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('[MealNotifications] Izin notifikasi tidak diberikan!');
    return false;
  }
  return true;
}

export async function scheduleMealReminders(schedule, notifEnabled) {

  await cancelMealReminders();

  if (!notifEnabled) return;

  const hasPermission = await registerMealNotificationsAsync();
  if (!hasPermission) return;

  try {
    const [bHour, bMin] = schedule.breakfast.split('.').map(Number);
    if (!isNaN(bHour) && !isNaN(bMin)) {
      await Notifications.scheduleNotificationAsync({
        identifier: 'meal-breakfast',
        content: {
          title: 'Waktunya Sarapan!',
          body: 'Sudah memasuki jam sarapan pagi Anda. Yuk, isi energi terlebih dahulu!',
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: bHour,
          minute: bMin,
        },
      });
      console.log(`[MealNotifications] Dijadwalkan sarapan pada ${bHour}:${bMin}`);
    }
  } catch (e) {
    console.log('Error scheduling breakfast:', e);
  }

  try {
    const [lHour, lMin] = schedule.lunch.split('.').map(Number);
    if (!isNaN(lHour) && !isNaN(lMin)) {
      await Notifications.scheduleNotificationAsync({
        identifier: 'meal-lunch',
        content: {
          title: 'Waktunya Makan Siang!',
          body: 'Sudah jam makan siang. Istirahat sejenak dan nikmati makan siang sehat Anda!',
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: lHour,
          minute: lMin,
        },
      });
      console.log(`[MealNotifications] Dijadwalkan makan siang pada ${lHour}:${lMin}`);
    }
  } catch (e) {
    console.log('Error scheduling lunch:', e);
  }

  try {
    const [dHour, dMin] = schedule.dinner.split('.').map(Number);
    if (!isNaN(dHour) && !isNaN(dMin)) {
      await Notifications.scheduleNotificationAsync({
        identifier: 'meal-dinner',
        content: {
          title: 'Waktunya Makan Malam!',
          body: 'Sudah memasuki jam makan malam. Pilih menu ringan agar tidur lebih berkualitas!',
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: dHour,
          minute: dMin,
        },
      });
      console.log(`[MealNotifications] Dijadwalkan makan malam pada ${dHour}:${dMin}`);
    }
  } catch (e) {
    console.log('Error scheduling dinner:', e);
  }
}

export async function cancelMealReminders() {
  try {
    await Notifications.cancelScheduledNotificationAsync('meal-breakfast');
    await Notifications.cancelScheduledNotificationAsync('meal-lunch');
    await Notifications.cancelScheduledNotificationAsync('meal-dinner');
    console.log('[MealNotifications] Semua pengingat makan dibatalkan.');
  } catch (e) {
    console.log('Error cancelling meal reminders:', e);
  }
}
