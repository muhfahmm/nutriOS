import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerSleepNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('sleep-channel', {
      name: 'Pengingat Jadwal Tidur',
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
    console.log('[SleepNotifications] Izin notifikasi tidak diberikan oleh user!');
    return false;
  }
  return true;
}

export function getTimeMinusMinutes(timeStr, minutesToSubtract = 30) {
  try {
    let [hour, minute] = timeStr.split('.').map(Number);
    if (isNaN(hour) || isNaN(minute)) {
      [hour, minute] = [22, 0];
    }

    let totalMinutes = hour * 60 + minute;
    totalMinutes -= minutesToSubtract;

    if (totalMinutes < 0) {
      totalMinutes += 24 * 60;
    }

    return {
      hour: Math.floor(totalMinutes / 60),
      minute: totalMinutes % 60,
    };
  } catch (e) {
    return { hour: 21, minute: 30 };
  }
}

export async function scheduleSleepReminder(sleepTime) {
  await cancelSleepReminder();

  const hasPermission = await registerSleepNotificationsAsync();
  if (!hasPermission) return null;

  let [sleepHour, sleepMinute] = sleepTime.split('.').map(Number);
  if (isNaN(sleepHour) || isNaN(sleepMinute)) {
    [sleepHour, sleepMinute] = [22, 0];
  }

  const { hour: prepHour, minute: prepMinute } = getTimeMinusMinutes(sleepTime, 30);
  const formattedPrepHour = prepHour.toString().padStart(2, '0');
  const formattedPrepMinute = prepMinute.toString().padStart(2, '0');

  console.log(`[SleepNotifications] Menjadwalkan pengingat tidur harian pada ${sleepHour}.${sleepMinute} dan persiapan pada ${formattedPrepHour}.${formattedPrepMinute}`);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Waktunya Tidur',
      body: `Sudah pukul ${sleepHour.toString().padStart(2, '0')}.${sleepMinute.toString().padStart(2, '0')}. Mari matikan gadget Anda dan tidur sekarang!`,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: sleepHour,
      minute: sleepMinute,
    },
  });

  return await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Persiapan Tidur',
      body: `Sudah pukul ${formattedPrepHour}.${formattedPrepMinute}. Mari bersiap untuk tidur 30 menit lagi (target tidur: ${sleepTime}). Matikan gadget Anda sekarang!`,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: prepHour,
      minute: prepMinute,
    },
  });
}

export async function cancelSleepReminder() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log('[SleepNotifications] Pengingat tidur berhasil dinonaktifkan.');
}

export function useSleepNotifications(sleepTime, notifEnabled) {
  const notificationListener = useRef();

  useEffect(() => {
    if (notifEnabled) {
      scheduleSleepReminder(sleepTime);
    } else {
      cancelSleepReminder();
    }
  }, [sleepTime, notifEnabled]);

  useEffect(() => {
    registerSleepNotificationsAsync();

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('[SleepNotifications] Notifikasi pengingat tidur diterima di foreground:', notification);
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
    };
  }, []);
}

export function getTimeUntilReminder(sleepTime) {
  let [sleepHour, sleepMinute] = sleepTime.split('.').map(Number);
  if (isNaN(sleepHour) || isNaN(sleepMinute)) {
    [sleepHour, sleepMinute] = [22, 0];
  }

  const { hour: reminderHour, minute: reminderMinute } = getTimeMinusMinutes(sleepTime, 30);

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const nowMinutes = currentHour * 60 + currentMinute;
  const sleepMinutes = sleepHour * 60 + sleepMinute;
  const reminderMinutes = reminderHour * 60 + reminderMinute;

  let diffReminder = reminderMinutes - nowMinutes;
  let diffSleep = sleepMinutes - nowMinutes;

  if (diffSleep > 0) {
    if (diffReminder > 0) {

      const diffHours = Math.floor(diffReminder / 60);
      const remainingMins = diffReminder % 60;
      if (diffHours > 0) {
        return `${diffHours} jam ${remainingMins} menit lagi`;
      }
      return `${remainingMins} menit lagi`;
    } else {

      return `${diffSleep} menit lagi (Waktunya tidur!)`;
    }
  } else {

    let diffReminderTomorrow = diffReminder + (24 * 60);
    const diffHours = Math.floor(diffReminderTomorrow / 60);
    const remainingMins = diffReminderTomorrow % 60;
    if (diffHours > 0) {
      return `${diffHours} jam ${remainingMins} menit lagi (Besok)`;
    }
    return `${remainingMins} menit lagi (Besok)`;
  }
}

export async function triggerTestNotification(sleepTime) {
  const hasPermission = await registerSleepNotificationsAsync();
  if (!hasPermission) {
    return false;
  }

  const { hour, minute } = getTimeMinusMinutes(sleepTime, 30);
  const formattedHour = hour.toString().padStart(2, '0');
  const formattedMinute = minute.toString().padStart(2, '0');

  console.log('[SleepNotifications] Mengirim test notifikasi...');
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Persiapan Tidur (Test) 🌙',
      body: `Pengingat sesungguhnya dijadwalkan pada ${formattedHour}.${formattedMinute} (30 menit sebelum jam tidur ${sleepTime}). Matikan gadget Anda sekarang!`,
      sound: true,
      vibrationPattern: [0, 250, 250, 250],
      priority: Notifications.AndroidNotificationPriority.MAX,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 3,
    },
  });
  return true;
}
