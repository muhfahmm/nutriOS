import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import MapView, { Polyline, Marker } from 'react-native-maps';

const ACTIVITY_TYPES = [
  { id: 'jalan', label: 'Jalan Kaki', icon: 'walk', color: '#10B981', met: 3.5 },
  { id: 'lari', label: 'Lari', icon: 'fitness', color: '#EF4444', met: 9.0 },
  { id: 'sepeda', label: 'Bersepeda', icon: 'bicycle', color: '#3B82F6', met: 7.5 },
];

const haversineMeters = (coord1, coord2) => {
  const R = 6371000;
  const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.latitude * Math.PI) / 180) *
      Math.cos((coord2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

class KalmanFilter {
  constructor() {
    this.variance = -1;
    this.minAccuracy = 1;
  }

  process(lat, lng, accuracy, timestamp) {
    if (accuracy < this.minAccuracy) accuracy = this.minAccuracy;
    if (this.variance < 0) {

      this.timestamp = timestamp;
      this.lat = lat;
      this.lng = lng;
      this.variance = accuracy * accuracy;
    } else {
      const timeInc = (timestamp - this.timestamp) / 1000;
      if (timeInc > 0) {
        this.variance += timeInc * 3 * 3;
        this.timestamp = timestamp;
      }
      const k = this.variance / (this.variance + accuracy * accuracy);
      this.lat += k * (lat - this.lat);
      this.lng += k * (lng - this.lng);
      this.variance = (1 - k) * this.variance;
    }
    return { latitude: this.lat, longitude: this.lng };
  }
}

const MAX_ACCEPTABLE_ACCURACY = 25;
const MIN_DISTANCE_METERS = 1.0;
const MAX_SPEED_MS = 12;

const calcCalories = (met, durationSec, weightKg = 65) => {
  const hours = durationSec / 3600;
  return Math.round(met * weightKg * hours);
};

const formatDuration = (totalSeconds) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const formatPace = (km, seconds) => {
  if (km < 0.001) return '--:--';
  const paceSecPerKm = seconds / km;
  const m = Math.floor(paceSecPerKm / 60);
  const s = Math.round(paceSecPerKm % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
};

const formatDistance = (meters) => {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(2)} km`;
};

export default function GpsTrackerScreen() {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [trackingState, setTrackingState] = useState('idle');
  const [routeCoords, setRouteCoords] = useState([]);
  const [distanceMeters, setDistanceMeters] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [savedActivities, setSavedActivities] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [pointsAccepted, setPointsAccepted] = useState(0);
  const [pointsRejected, setPointsRejected] = useState(0);

  const locationSubscription = useRef(null);
  const timerRef = useRef(null);
  const mapRef = useRef(null);
  const lastCoordRef = useRef(null);
  const distanceRef = useRef(0);
  const kalmanRef = useRef(new KalmanFilter());

  useEffect(() => {
    loadSavedActivities();
    return () => {
      clearInterval(timerRef.current);
      stopLocationTracking();
    };
  }, []);

  const loadSavedActivities = async () => {
    try {
      const stored = await AsyncStorage.getItem('gps_activities');
      if (stored) setSavedActivities(JSON.parse(stored));
    } catch (e) {}
  };

  const saveActivity = async (activityData) => {
    try {
      const updated = [activityData, ...savedActivities].slice(0, 20);
      await AsyncStorage.setItem('gps_activities', JSON.stringify(updated));
      setSavedActivities(updated);
    } catch (e) {}
  };

  const requestPermissionAndStart = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Izin Lokasi Diperlukan',
        'Aktifkan izin lokasi di pengaturan HP untuk menggunakan GPS Tracker.',
        [{ text: 'Mengerti' }]
      );
      return;
    }
    startTracking();
  };

  const startTracking = () => {
    setRouteCoords([]);
    setDistanceMeters(0);
    setElapsedSec(0);
    setCurrentSpeed(0);
    setGpsAccuracy(null);
    setPointsAccepted(0);
    setPointsRejected(0);
    distanceRef.current = 0;
    lastCoordRef.current = null;
    kalmanRef.current = new KalmanFilter();
    setTrackingState('active');

    timerRef.current = setInterval(() => {
      setElapsedSec((prev) => prev + 1);
    }, 1000);

    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,
        distanceInterval: 0,
        mayShowUserSettingsDialog: true,
      },
      (loc) => {
        const { latitude, longitude, speed, accuracy, timestamp } = loc.coords;

        setGpsAccuracy(Math.round(accuracy));
        if (accuracy > MAX_ACCEPTABLE_ACCURACY) {
          setPointsRejected((p) => p + 1);
          return;
        }

        const smoothed = kalmanRef.current.process(
          latitude, longitude, accuracy, timestamp || Date.now()
        );

        const newCoord = { latitude: smoothed.latitude, longitude: smoothed.longitude };

        if (lastCoordRef.current && speed !== null) {
          if (speed > MAX_SPEED_MS) {
            setPointsRejected((p) => p + 1);
            return;
          }
        }

        let deltaMeters = 0;
        if (lastCoordRef.current) {
          deltaMeters = haversineMeters(lastCoordRef.current, newCoord);
          if (deltaMeters < MIN_DISTANCE_METERS) {

            setPointsRejected((p) => p + 1);

            setCurrentLocation(newCoord);
            setCurrentSpeed(speed > 0 ? speed : 0);
            return;
          }

          distanceRef.current += deltaMeters;
          setDistanceMeters(distanceRef.current);
        }

        lastCoordRef.current = newCoord;
        setCurrentLocation(newCoord);
        setCurrentSpeed(speed > 0 ? speed : 0);
        setPointsAccepted((p) => p + 1);
        setRouteCoords((prev) => [...prev, newCoord]);

        if (mapRef.current) {
          mapRef.current.animateToRegion(
            { latitude: newCoord.latitude, longitude: newCoord.longitude, latitudeDelta: 0.003, longitudeDelta: 0.003 },
            500
          );
        }
      }
    ).then((sub) => {
      locationSubscription.current = sub;
    });
  };

  const pauseTracking = () => {
    setTrackingState('paused');
    clearInterval(timerRef.current);
    stopLocationTracking();
  };

  const resumeTracking = () => {
    setTrackingState('active');
    timerRef.current = setInterval(() => {
      setElapsedSec((prev) => prev + 1);
    }, 1000);

    lastCoordRef.current = null;
    Location.watchPositionAsync(
      { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 1000, distanceInterval: 0 },
      (loc) => {
        const { latitude, longitude, speed, accuracy, timestamp } = loc.coords;
        setGpsAccuracy(Math.round(accuracy));
        if (accuracy > MAX_ACCEPTABLE_ACCURACY) return;

        const smoothed = kalmanRef.current.process(
          latitude, longitude, accuracy, timestamp || Date.now()
        );
        const newCoord = { latitude: smoothed.latitude, longitude: smoothed.longitude };

        if (speed !== null && speed > MAX_SPEED_MS) return;

        if (lastCoordRef.current) {
          const deltaMeters = haversineMeters(lastCoordRef.current, newCoord);
          if (deltaMeters < MIN_DISTANCE_METERS) {
            setCurrentLocation(newCoord);
            return;
          }
          distanceRef.current += deltaMeters;
          setDistanceMeters(distanceRef.current);
        }

        lastCoordRef.current = newCoord;
        setCurrentLocation(newCoord);
        setCurrentSpeed(speed > 0 ? speed : 0);
        setRouteCoords((prev) => [...prev, newCoord]);
        if (mapRef.current) {
          mapRef.current.animateToRegion(
            { latitude: newCoord.latitude, longitude: newCoord.longitude, latitudeDelta: 0.003, longitudeDelta: 0.003 }, 500
          );
        }
      }
    ).then((sub) => { locationSubscription.current = sub; });
  };

  const stopLocationTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
  };

  const finishTracking = () => {
    clearInterval(timerRef.current);
    stopLocationTracking();
    setTrackingState('finished');
  };

  const saveAndReset = () => {
    const act = selectedActivity;
    const distKm = distanceRef.current / 1000;
    const calories = calcCalories(act?.met || 3.5, elapsedSec);
    const record = {
      id: Date.now().toString(),
      type: act?.label || 'Aktivitas',
      typeId: act?.id,
      color: act?.color || '#10B981',
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      distanceKm: distKm.toFixed(2),
      distanceMeters: Math.round(distanceRef.current),
      durationSec: elapsedSec,
      calories,
      pace: formatPace(distKm, elapsedSec),
      avgSpeedKmh: distKm > 0 ? ((distKm / elapsedSec) * 3600).toFixed(1) : '0.0',
    };
    saveActivity(record);
    const distDisplay = distanceRef.current >= 1000
      ? `${distKm.toFixed(2)} km`
      : `${Math.round(distanceRef.current)} m`;
    Alert.alert('✅ Tersimpan!', `${act?.label} selesai.\nJarak: ${distDisplay} · Kalori: ${record.calories} kcal`, [{ text: 'Mantap!' }]);
    setTrackingState('idle');
    setRouteCoords([]);
    setDistanceMeters(0);
    setElapsedSec(0);
    distanceRef.current = 0;
    lastCoordRef.current = null;
    setSelectedActivity(null);
  };

  const discardActivity = () => {
    Alert.alert('Hapus Aktivitas?', 'Aktivitas ini tidak akan tersimpan.', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus', style: 'destructive', onPress: () => {
          setTrackingState('idle');
          setRouteCoords([]);
          setDistanceMeters(0);
          setElapsedSec(0);
          distanceRef.current = 0;
          lastCoordRef.current = null;
        },
      },
    ]);
  };

  const renderActivityPicker = () => (
    <View style={styles.pickerSection}>
      <Text style={styles.sectionTitle}>Pilih Aktivitas</Text>
      <Text style={styles.sectionSubtitle}>GPS akan merekam rute & statistikmu secara real-time</Text>
      <View style={styles.activityGrid}>
        {ACTIVITY_TYPES.map((act) => {
          const isSelected = selectedActivity?.id === act.id;
          return (
            <TouchableOpacity
              key={act.id}
              style={[styles.activityCard, isSelected && { borderColor: act.color, backgroundColor: act.color + '15' }]}
              onPress={() => setSelectedActivity(act)}
            >
              <View style={[styles.activityIconWrap, { backgroundColor: act.color + '20' }]}>
                <Ionicons name={act.icon} size={28} color={act.color} />
              </View>
              <Text style={[styles.activityLabel, isSelected && { color: act.color, fontWeight: '700' }]}>
                {act.label}
              </Text>
              {isSelected && (
                <View style={[styles.selectedBadge, { backgroundColor: act.color }]}>
                  <Ionicons name="checkmark" size={10} color="#FFF" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {selectedActivity && (
        <TouchableOpacity
          style={[styles.startGpsBtn, { backgroundColor: selectedActivity.color }]}
          onPress={requestPermissionAndStart}
        >
          <Ionicons name="navigate" size={22} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.startGpsBtnText}>Mulai Rekam GPS</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderActiveSession = () => {
    const act = selectedActivity || ACTIVITY_TYPES[0];
    const distKm = distanceMeters / 1000;
    const calories = calcCalories(act.met, elapsedSec);
    const speedKmh = currentSpeed > 0 ? (currentSpeed * 3.6).toFixed(1) : '0.0';

    const gpsSignalColor = !gpsAccuracy ? '#9CA3AF'
      : gpsAccuracy <= 5 ? '#10B981'
      : gpsAccuracy <= 10 ? '#84CC16'
      : gpsAccuracy <= 20 ? '#F59E0B'
      : '#EF4444';
    const gpsSignalLabel = !gpsAccuracy ? 'Mencari sinyal...'
      : gpsAccuracy <= 5 ? `GPS Excellent (±${gpsAccuracy}m)`
      : gpsAccuracy <= 10 ? `GPS Baik (±${gpsAccuracy}m)`
      : gpsAccuracy <= 20 ? `GPS Cukup (±${gpsAccuracy}m)`
      : `GPS Lemah (±${gpsAccuracy}m) — menunggu sinyal`;

    return (
      <View style={styles.sessionWrapper}>
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={
              currentLocation
                ? { ...currentLocation, latitudeDelta: 0.003, longitudeDelta: 0.003 }
                : { latitude: -6.2, longitude: 106.816, latitudeDelta: 0.05, longitudeDelta: 0.05 }
            }
            showsUserLocation={true}
            followsUserLocation={true}
          >
            {routeCoords.length > 1 && (
              <Polyline coordinates={routeCoords} strokeColor={act.color} strokeWidth={5} />
            )}
            {routeCoords.length > 0 && (
              <Marker coordinate={routeCoords[0]} title="Start">
                <View style={[styles.routeMarker, { backgroundColor: '#10B981' }]}>
                  <Ionicons name="flag" size={12} color="#FFF" />
                </View>
              </Marker>
            )}
          </MapView>
          <View style={[styles.trackingBadge, { backgroundColor: act.color }]}>
            <View style={trackingState === 'active' ? styles.pulseDot : styles.pausedDot} />
            <Text style={styles.trackingBadgeText}>
              {trackingState === 'active' ? 'Merekam...' : 'Dijeda'}
            </Text>
          </View>
        </View>

        {}
        <View style={[styles.gpsSignalBar, { borderLeftColor: gpsSignalColor }]}>
          <Ionicons name="navigate-circle" size={16} color={gpsSignalColor} />
          <Text style={[styles.gpsSignalText, { color: gpsSignalColor }]}>{gpsSignalLabel}</Text>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.bigTimer}>{formatDuration(elapsedSec)}</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {distanceMeters >= 1000
                  ? (distKm).toFixed(2)
                  : Math.round(distanceMeters)}
              </Text>
              <Text style={styles.statLabel}>
                {distanceMeters >= 1000 ? 'km' : 'm'}
              </Text>
            </View>
            <View style={[styles.statItem, { alignItems: 'center' }]}>
              <Text style={styles.statValue}>{formatPace(distKm, elapsedSec)}</Text>
              <Text style={styles.statLabel}>min/km</Text>
            </View>
            <View style={[styles.statItem, { alignItems: 'flex-end' }]}>
              <Text style={styles.statValue}>{speedKmh}</Text>
              <Text style={styles.statLabel}>km/h</Text>
            </View>
          </View>
          <View style={styles.calorieRow}>
            <Ionicons name="flame" size={16} color="#EF4444" />
            <Text style={styles.calorieText}>{calories} kcal terbakar</Text>
          </View>
          <View style={styles.controlRow}>
            {trackingState === 'active' ? (
              <>
                <TouchableOpacity style={[styles.controlBtn, { borderColor: '#F59E0B' }]} onPress={pauseTracking}>
                  <Ionicons name="pause" size={22} color="#F59E0B" />
                  <Text style={[styles.controlLabel, { color: '#F59E0B' }]}>Jeda</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.controlBtn, { borderColor: '#EF4444' }]} onPress={finishTracking}>
                  <Ionicons name="stop" size={22} color="#EF4444" />
                  <Text style={[styles.controlLabel, { color: '#EF4444' }]}>Selesai</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity style={[styles.controlBtn, { borderColor: '#10B981' }]} onPress={resumeTracking}>
                  <Ionicons name="play" size={22} color="#10B981" />
                  <Text style={[styles.controlLabel, { color: '#10B981' }]}>Lanjut</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.controlBtn, { borderColor: '#EF4444' }]} onPress={finishTracking}>
                  <Ionicons name="stop" size={22} color="#EF4444" />
                  <Text style={[styles.controlLabel, { color: '#EF4444' }]}>Selesai</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderFinished = () => {
    const act = selectedActivity || ACTIVITY_TYPES[0];
    const distKm = distanceMeters / 1000;
    const calories = calcCalories(act.met, elapsedSec);
    const distDisplay = distanceMeters >= 1000
      ? `${distKm.toFixed(2)} km`
      : `${Math.round(distanceMeters)} m`;
    return (
      <View style={styles.finishedCard}>
        <View style={[styles.finishedIconWrap, { backgroundColor: act.color + '20' }]}>
          <Ionicons name="checkmark-circle" size={60} color={act.color} />
        </View>
        <Text style={styles.finishedTitle}>Aktivitas Selesai! 🎉</Text>
        <Text style={styles.finishedSubtitle}>{act.label}</Text>
        <View style={styles.finishedGrid}>
          {[
            { label: 'Jarak', value: distDisplay, icon: 'map' },
            { label: 'Durasi', value: formatDuration(elapsedSec), icon: 'timer' },
            { label: 'Pace', value: `${formatPace(distKm, elapsedSec)} /km`, icon: 'speedometer' },
            { label: 'Kalori', value: `${calories} kcal`, icon: 'flame' },
          ].map((item) => (
            <View key={item.label} style={styles.finishedStatItem}>
              <Ionicons name={item.icon} size={20} color={act.color} style={{ marginBottom: 6 }} />
              <Text style={styles.finishedStatValue}>{item.value}</Text>
              <Text style={styles.finishedStatLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
        <View style={styles.finishedActions}>
          <TouchableOpacity style={styles.discardBtn} onPress={discardActivity}>
            <Ionicons name="trash-outline" size={18} color="#6B7280" />
            <Text style={styles.discardText}>Hapus</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: act.color }]} onPress={saveAndReset}>
            <Ionicons name="cloud-upload-outline" size={18} color="#FFF" />
            <Text style={styles.saveBtnText}>Simpan Aktivitas</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderHistory = () => (
    <View style={styles.historySection}>
      <View style={styles.historyHeader}>
        <Text style={styles.sectionTitle}>Riwayat Aktivitas</Text>
        <TouchableOpacity onPress={() => setShowHistory(false)}>
          <Text style={styles.hideHistoryText}>Sembunyikan</Text>
        </TouchableOpacity>
      </View>
      {savedActivities.length === 0 ? (
        <View style={styles.emptyHistory}>
          <Ionicons name="map-outline" size={42} color="#9CA3AF" />
          <Text style={styles.emptyHistoryText}>Belum ada aktivitas yang direkam.</Text>
        </View>
      ) : (
        savedActivities.map((item) => (
          <View key={item.id} style={styles.historyCard}>
            <View style={[styles.historyIconWrap, { backgroundColor: (item.color || '#10B981') + '20' }]}>
              <Ionicons
                name={ACTIVITY_TYPES.find((a) => a.id === item.typeId)?.icon || 'walk'}
                size={20}
                color={item.color || '#10B981'}
              />
            </View>
            <View style={styles.historyInfo}>
              <Text style={styles.historyType}>{item.type}</Text>
              <Text style={styles.historyDate}>{item.date} · {item.time}</Text>
            </View>
            <View style={styles.historyStats}>
              <Text style={styles.historyDist}>{item.distanceKm} km</Text>
              <Text style={styles.historyDuration}>{formatDuration(item.durationSec)}</Text>
              <Text style={styles.historyCalories}>🔥 {item.calories} kcal</Text>
            </View>
          </View>
        ))
      )}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {}
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>GPS Tracker</Text>
          <Text style={styles.pageSubtitle}>Rekam, Ukur, dan Analisis Aktivitasmu</Text>
        </View>
        {trackingState === 'idle' && (
          <TouchableOpacity style={styles.historyToggleBtn} onPress={() => setShowHistory(!showHistory)}>
            <Ionicons name="time-outline" size={20} color="#6B7280" />
            <Text style={styles.historyToggleText}>Riwayat</Text>
          </TouchableOpacity>
        )}
      </View>

      {trackingState === 'idle' && renderActivityPicker()}
      {(trackingState === 'active' || trackingState === 'paused') && renderActiveSession()}
      {trackingState === 'finished' && renderFinished()}
      {showHistory && trackingState === 'idle' && renderHistory()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 40 },

  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  pageTitle: { fontSize: 22, fontWeight: '800', color: '#111827' },
  pageSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  historyToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
  },
  historyToggleText: { fontSize: 13, color: '#6B7280', fontWeight: '600' },

  pickerSection: { paddingHorizontal: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, color: '#6B7280', marginBottom: 16 },
  activityGrid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  activityCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
    position: 'relative',
  },
  activityIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  activityLabel: { fontSize: 12, fontWeight: '600', color: '#374151', textAlign: 'center' },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startGpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 18,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
  },
  startGpsBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },

  sessionWrapper: {},
  mapContainer: {
    height: 280,
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  map: { flex: 1 },
  trackingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFFFFF' },
  pausedDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFFFFF', opacity: 0.5 },
  trackingBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  routeMarker: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

  gpsSignalBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 20,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  gpsSignalText: {
    fontSize: 12,
    fontWeight: '600',
  },

  statsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 5,
  },
  bigTimer: {
    fontSize: 52,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 16,
  },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  statItem: { flex: 1, alignItems: 'flex-start' },
  statValue: { fontSize: 22, fontWeight: '800', color: '#1F2937' },
  statLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '500', marginTop: 2 },
  calorieRow: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', marginBottom: 16 },
  calorieText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  controlRow: { flexDirection: 'row', gap: 12 },
  controlBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 2,
    gap: 6,
  },
  controlLabel: { fontSize: 14, fontWeight: '700' },

  finishedCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 5,
  },
  finishedIconWrap: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  finishedTitle: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 4 },
  finishedSubtitle: { fontSize: 14, color: '#6B7280', marginBottom: 24 },
  finishedGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, width: '100%', marginBottom: 24 },
  finishedStatItem: { flex: 1, minWidth: '45%', backgroundColor: '#F9FAFB', borderRadius: 16, padding: 14, alignItems: 'center' },
  finishedStatValue: { fontSize: 16, fontWeight: '800', color: '#111827' },
  finishedStatLabel: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  finishedActions: { flexDirection: 'row', gap: 12, width: '100%' },
  discardBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  discardText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    elevation: 4,
  },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },

  historySection: { paddingHorizontal: 20, marginTop: 24 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  hideHistoryText: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
  emptyHistory: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  emptyHistoryText: { fontSize: 13, color: '#9CA3AF', textAlign: 'center' },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
  },
  historyIconWrap: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  historyInfo: { flex: 1 },
  historyType: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
  historyDate: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  historyStats: { alignItems: 'flex-end' },
  historyDist: { fontSize: 14, fontWeight: '800', color: '#1F2937' },
  historyDuration: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  historyCalories: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
});
