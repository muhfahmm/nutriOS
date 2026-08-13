import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Set notification handler untuk menetapkan behavior ketika app di foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Minta izin notifikasi & buat channel khusus untuk Android
 */
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

/**
 * Mengubah string waktu "HH.MM" menjadi objek hour dan minute yang dikurangi X menit
 * Contoh: "22.00" dikurangi 30 menit menjadi { hour: 21, minute: 30 }
 */
export function getTimeMinusMinutes(timeStr, minutesToSubtract = 30) {
  try {
    let [hour, minute] = timeStr.split('.').map(Number);
    if (isNaN(hour) || isNaN(minute)) {
      [hour, minute] = [22, 0];
    }
    
    let totalMinutes = hour * 60 + minute;
    totalMinutes -= minutesToSubtract;
    
    if (totalMinutes < 0) {
      totalMinutes += 24 * 60; // Putar balik ke hari sebelumnya jika kurang dari 0
    }
    
    return {
      hour: Math.floor(totalMinutes / 60),
      minute: totalMinutes % 60,
    };
  } catch (e) {
    return { hour: 21, minute: 30 };
  }
}

/**
 * Menjadwalkan pengingat tidur harian (30 menit sebelum tidur)
 * @param {string} sleepTime Waktu tidur dalam format "HH.MM" (contoh: "22.00")
 */
export async function scheduleSleepReminder(sleepTime) {
  // Batalkan pengingat tidur sebelumnya agar tidak menumpuk
  await cancelSleepReminder();

  const hasPermission = await registerSleepNotificationsAsync();
  if (!hasPermission) return null;

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  let [sleepHour, sleepMinute] = sleepTime.split('.').map(Number);
  if (isNaN(sleepHour) || isNaN(sleepMinute)) {
    [sleepHour, sleepMinute] = [22, 0];
  }

  const nowMinutes = currentHour * 60 + currentMinute;
  const sleepMinutes = sleepHour * 60 + sleepMinute;

  // Hitung waktu pengingat (30 menit sebelum jam tidur)
  const { hour, minute } = getTimeMinusMinutes(sleepTime, 30);
  const reminderMinutes = hour * 60 + minute;

  let diffReminder = reminderMinutes - nowMinutes;
  let diffSleep = sleepMinutes - nowMinutes;

  if (diffSleep > 0 && diffReminder <= 0) {
    // Kasus khusus: Jam tidur hari ini belum lewat, tapi waktu pengingat (30m sebelum) sudah terlewat.
    // Kirim notifikasi peringatan terlambat sekarang juga (delay 2 detik)
    console.log(`[SleepNotifications] Pengingat sudah terlewat, memicu notifikasi peringatan terlambat sekarang.`);
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Waktunya Tidur 🌙',
        body: `Target tidur Anda adalah pukul ${sleepTime}. Waktu bersiap sudah terlewat, silakan matikan gadget dan bersiap tidur sekarang!`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2,
      },
    });
  }

  const formattedHour = hour.toString().padStart(2, '0');
  const formattedMinute = minute.toString().padStart(2, '0');

  console.log(`[SleepNotifications] Menjadwalkan pengingat tidur harian pada ${formattedHour}.${formattedMinute} (30 menit sebelum tidur jam ${sleepTime})`);

  return await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Persiapan Tidur 🌙',
      body: `Sudah pukul ${formattedHour}.${formattedMinute}. Mari bersiap untuk tidur 30 menit lagi (target tidur: ${sleepTime}). Matikan gadget Anda sekarang!`,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

/**
 * Membatalkan pengingat tidur harian
 */
export async function cancelSleepReminder() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log('[SleepNotifications] Pengingat tidur berhasil dinonaktifkan.');
}

/**
 * Custom React Hook untuk listener di komponen Jadwal Tidur
 */
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
  
  // Kasus 1: Waktu tidur hari ini masih di masa depan
  if (diffSleep > 0) {
    if (diffReminder > 0) {
      // Pengingat 30 menit belum lewat
      const diffHours = Math.floor(diffReminder / 60);
      const remainingMins = diffReminder % 60;
      if (diffHours > 0) {
        return `${diffHours} jam ${remainingMins} menit lagi`;
      }
      return `${remainingMins} menit lagi`;
    } else {
      // Pengingat 30 menit sudah lewat, tapi jam tidur belum lewat (misal sisa 18 menit lagi tidur)
      return `${diffSleep} menit lagi (Waktunya tidur!)`;
    }
  } else {
    // Kasus 2: Jam tidur hari ini sudah lewat, jadi dijadwalkan besok
    let diffReminderTomorrow = diffReminder + (24 * 60);
    const diffHours = Math.floor(diffReminderTomorrow / 60);
    const remainingMins = diffReminderTomorrow % 60;
    if (diffHours > 0) {
      return `${diffHours} jam ${remainingMins} menit lagi (Besok)`;
    }
    return `${remainingMins} menit lagi (Besok)`;
  }
}

/**
 * Memicu notifikasi lokal percobaan dalam 3 detik untuk pengetesan langsung di HP user
 */
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
      seconds: 3, // Muncul dalam 3 detik
    },
  });
  return true;
}
