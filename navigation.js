import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Animated, Easing } from 'react-native';
import { useState, useContext, useRef, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from './auth/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './auth/api';

if (Text && !Text.defaultProps) {
  Text.defaultProps = {};
}
if (Text && Text.defaultProps) {
  Text.defaultProps.style = [Text.defaultProps.style, { fontFamily: 'Roboto' }];
}
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import JadwalTidurScreen from './card_menu/1_jadwal_tidur';
import JadwalTidurDetail from './card_menu/1_jadwal_tidur/JadwalTidurDetail';
import KalkulatorPertumbuhanScreen from './card_menu/2_kalkulator_pertumbuhan';
import OlahragaScreen from './card_menu/3_olahraga';
import PengelolaStresScreen from './card_menu/4_pengelola_stres';
import PolaMakanScreen from './card_menu/5_pola_makan';
import ProfilesScreen from './card_menu/profiles';
import RekomendasiMakananScreen from './card_menu/6_rekomendasi_makanan';
import LoginScreen from './auth/login';
import RegisterScreen from './auth/register';

// --- KOMPONEN LIQUID GLASS UNTUK GRID MENU ---
const LiquidGlassTouchable = ({ onPress, onLongPress, style, children }) => {
  const shineAnim = useRef(new Animated.Value(0)).current;

  const handleLongPress = () => {
    shineAnim.setValue(0);
    Animated.timing(shineAnim, {
      toValue: 1,
      duration: 700,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
    if (onLongPress) onLongPress();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={handleLongPress}
      activeOpacity={0.8}
      style={[style, { overflow: 'hidden', position: 'relative' }]}
    >
      {children}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: 80,
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          transform: [
            {
              translateX: shineAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-100, 250],
              }),
            },
            { rotate: '30deg' },
          ],
          opacity: shineAnim.interpolate({
            inputRange: [0, 0.4, 1],
            outputRange: [0, 1, 0],
          }),
        }}
      />
    </TouchableOpacity>
  );
};

// --- KOMPONEN LIQUID GLASS KHUSUS UNTUK TAB BAR BAWAH ---
const LiquidGlassTabButton = ({ children, onPress, onLongPress, ...props }) => {
  const shineAnim = useRef(new Animated.Value(0)).current;

  const handleLongPress = () => {
    shineAnim.setValue(0);
    Animated.timing(shineAnim, {
      toValue: 1,
      duration: 700,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
    if (onLongPress) onLongPress();
  };

  return (
    <TouchableOpacity
      {...props}
      onPress={onPress}
      onLongPress={handleLongPress}
      activeOpacity={0.8}
      style={[props.style, { 
        position: 'relative', 
        overflow: 'hidden',
      }]}
    >
      {children}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: 50,
          backgroundColor: 'rgba(255, 255, 255, 0.4)',
          transform: [
            {
              translateX: shineAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-80, 150],
              }),
            },
            { rotate: '25deg' },
          ],
          opacity: shineAnim.interpolate({
            inputRange: [0, 0.4, 1],
            outputRange: [0, 1, 0],
          }),
        }}
      />
    </TouchableOpacity>
  );
};

// --- KOMPONEN BANTUAN UNTUK GRID MENU ---
export const GridItem = ({ color, iconName, label, badge, onPress, onLongPress }) => {
  return (
    <LiquidGlassTouchable onPress={onPress} onLongPress={onLongPress} style={styles.gridTouch}>
      <View style={styles.gridItem}>
        <View style={[styles.gridIconBox, { backgroundColor: color }]}>
          {badge && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
          <Ionicons name={iconName} size={24} color="#fff" />
        </View>
        <Text style={styles.gridLabel} numberOfLines={2}>{label}</Text>
      </View>
    </LiquidGlassTouchable>
  );
};

// --- SCREEN BERANDA ---
export function HomeScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const greetingName = user?.nama_lengkap ? `Hai, ${user.nama_lengkap}` : 'Hai, user';

  // --- Streak & Total Latihan ---
  const [streakCount, setStreakCount] = useState(0);
  const [totalWorkoutMinutes, setTotalWorkoutMinutes] = useState(0);
  const [workoutHistory, setWorkoutHistory] = useState([]);

  useEffect(() => {
    const updateStreak = async () => {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const stored = await AsyncStorage.getItem('olahraga_streak');
        const data = stored ? JSON.parse(stored) : { count: 0, lastDate: null };

        if (data.lastDate === today) {
          setStreakCount(data.count);
        } else {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().slice(0, 10);

          const newCount =
            data.lastDate === yesterdayStr ? data.count + 1 : 1;

          const newData = { count: newCount, lastDate: today };
          await AsyncStorage.setItem('olahraga_streak', JSON.stringify(newData));
          setStreakCount(newCount);
        }
      } catch (e) {
        console.warn('Gagal membaca streak di homepage:', e);
      }
    };

    const loadWorkoutHistory = async () => {
      try {
        // Fallback local
        const stored = await AsyncStorage.getItem('olahraga_history');
        let rawHistory = [];
        if (stored) {
          rawHistory = JSON.parse(stored);
          setWorkoutHistory(rawHistory.slice(0, 3));
        }

        // Ambil DB
        const userIdVal = user ? user.id : 'null';
        const response = await fetch(`${API_BASE_URL}/api/riwayat-olahraga/${userIdVal}`);
        if (response.ok) {
          const data = await response.json();
          rawHistory = data;
          setWorkoutHistory(data.slice(0, 3));
        }

        // Hitung akumulasi total menit olahraga harian/mingguan dari seluruh riwayat
        const totalSec = rawHistory.reduce((sum, item) => sum + (parseInt(item.sets || 1) * parseInt(item.duration || 0)), 0);
        setTotalWorkoutMinutes(Math.ceil(totalSec / 60));
      } catch (err) {
        console.warn('Gagal memuat histori olahraga di homepage:', err);
      }
    };

    updateStreak();
    loadWorkoutHistory();
  }, [user]);

  const streakStats = [
    { icon: 'flame', label: 'Hari Aktif', value: `${streakCount} Hari`, note: 'berturut-turut', color: '#F97316' },
    { icon: 'time', label: 'Total Olahraga', value: `${totalWorkoutMinutes} Menit`, note: 'keseluruhan', color: '#3B82F6' },
    { icon: 'restaurant', label: 'Makan Tercatat', value: '95%', note: 'minggu ini', color: '#10B981' },
  ];

  const tipsData = [
    'Penting! Cegah Stunting dengan Protein Hewani',
    'Pola Tidur Bayi 0-12 Bulan yang Benar',
    'Resep MPASI 6 Bulan: Pure Labu & Ayam',
  ];

  const handleLongPressMenu = (menuName) => {
    console.log(`Anda menekan lama menu: ${menuName}`);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F4F7FF' }}>
      <ScrollView contentContainerStyle={styles.screenContent}>
        <View style={styles.headerContainer}>
          <View style={styles.profileSection}>
            <Ionicons name="person-circle" size={40} color="#6B7280" style={{ marginRight: 10 }} />
            <Text style={styles.greetingText}>{greetingName}</Text>
          </View>
          <Ionicons name="notifications-outline" size={26} color="#111827" />
        </View>

        <View style={styles.bannerContainer}>
          <View style={styles.bannerTextContent}>
            <Text style={styles.bannerTitle}>Masuk ke ruang publik?</Text>
            <Text style={styles.bannerSubtitle}>Selalu terapkan protokol kesehatan</Text>
            <TouchableOpacity style={styles.checkinButton}>
              <Ionicons name="scan-outline" size={18} color="#2196F3" />
              <Text style={styles.checkinText}>Check-in</Text>
            </TouchableOpacity>
          </View>
          <Ionicons name="phone-portrait-outline" size={70} color="#ffffff" style={styles.bannerImage} />
        </View>

        <TouchableOpacity style={styles.miniCheckinRow}>
          <Ionicons name="chevron-down" size={18} color="#4B5563" />
          <Text style={styles.miniCheckinText}>Pengaturan Check-in</Text>
        </TouchableOpacity>

        {/* --- GRID MENU --- */}
        <View style={styles.gridContainer}>
          <GridItem 
            color="#5C6BC0" iconName="moon" label="Jadwal Tidur" 
            onPress={() => navigation.navigate('JadwalTidur')} 
            onLongPress={() => handleLongPressMenu('Jadwal Tidur')} 
          />
          <GridItem 
            color="#FFA726" iconName="analytics" label="Kalkulator Pertumbuhan" 
            onPress={() => navigation.navigate('KalkulatorPertumbuhan')} 
            onLongPress={() => handleLongPressMenu('Kalkulator Pertumbuhan')}
          />
          <GridItem 
            color="#EF5350" iconName="barbell" label="Olahraga" 
            onPress={() => navigation.navigate('OlahragaMenu')} 
            onLongPress={() => handleLongPressMenu('Olahraga')}
          />
          <GridItem 
            color="#26A69A" iconName="leaf" label="Pengelola Stres" 
            onPress={() => navigation.navigate('PengelolaStres')} 
            onLongPress={() => handleLongPressMenu('Pengelola Stres')}
          />
          <GridItem 
            color="#FDD835" iconName="nutrition" label="Pola Makan" 
            onPress={() => navigation.navigate('PolaMakan')} 
            onLongPress={() => handleLongPressMenu('Pola Makan')}
          />
          <GridItem 
            color="#AB47BC" iconName="fast-food" label="Rekomendasi Makanan" 
            onPress={() => navigation.navigate('RekomendasiMakanan')} 
            onLongPress={() => handleLongPressMenu('Rekomendasi Makanan')}
          />
        </View>

        <View style={styles.streakSection}>
          <Text style={styles.infoTitle}>Statistik Aktivitas Harian</Text>
          <View style={styles.streakGrid}>
            {streakStats.map((item) => (
              <View key={item.label} style={styles.streakCard}>
                <Ionicons name={item.icon} size={20} color={item.color} style={styles.streakIcon} />
                <Text style={styles.streakValue}>{item.value}</Text>
                <Text style={styles.streakLabel}>{item.label}</Text>
                <Text style={styles.streakNote}>{item.note}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* --- HISTORI OLAHRAGA TERAKHIR --- */}
        <View style={styles.historySection}>
          <Text style={styles.infoTitle}>Histori Olahraga Terakhir</Text>
          {workoutHistory.length === 0 ? (
            <View style={styles.emptyHistoryCard}>
              <Ionicons name="barbell-outline" size={24} color="#9CA3AF" />
              <Text style={styles.emptyHistoryText}>Belum ada histori latihan olahraga.</Text>
            </View>
          ) : (
            workoutHistory.map((item) => (
              <View key={item.id} style={styles.homeHistoryCard}>
                <View style={styles.homeHistoryIconWrap}>
                  <Ionicons name={item.icon || 'barbell'} size={20} color="#2563EB" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.homeHistoryName}>{item.name}</Text>
                  <Text style={styles.homeHistoryDate}>{item.date}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.homeHistorySets}>{item.sets} Set</Text>
                  <Text style={styles.homeHistoryDuration}>{item.duration}s / Set</Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Tips & Edukasi Kesehatan Harian</Text>
          <View style={styles.carouselContainer}>
            {tipsData.map((tip, index) => (
              <View key={index} style={styles.tipCard}>
                <Text style={tipBadge => styles.tipBadge}>Tip #{index + 1}</Text>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.fab}>
          <Ionicons name="help-circle" size={30} color="#fff" />
        </TouchableOpacity>

        <StatusBar style="auto" />
      </ScrollView>
    </SafeAreaView>
  );
}

export function WorkoutScreen() {
  return (
    <ScrollView style={styles.screenBackground} contentContainerStyle={styles.screenContentGeneric}>
      <Text style={styles.sectionTitle}>Olahraga</Text>
      <Text style={styles.sectionSubtitle}>Pusat latihan fisik dan program harian.</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Program Harian</Text>
        <Text style={styles.cardText}>Rangkaian latihan kekuatan dan kardio selama 20 menit.</Text>
      </View>
    </ScrollView>
  );
}

export function NutritionScreen() {
  return (
    <ScrollView style={styles.screenBackground} contentContainerStyle={styles.screenContentGeneric}>
      <Text style={styles.sectionTitle}>Nutrisi</Text>
      <Text style={styles.sectionSubtitle}>Pengaturan pola makan dan pemantauan gizi.</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Pengingat Jam Makan</Text>
        <Text style={styles.cardText}>Sarapan 07.00 | Makan siang 12.30 | Makan malam 18.30</Text>
      </View>
    </ScrollView>
  );
}

export function WellnessScreen() {
  return (
    <ScrollView style={styles.screenBackground} contentContainerStyle={styles.screenContentGeneric}>
      <Text style={styles.sectionTitle}>Kesehatan</Text>
      <Text style={styles.sectionSubtitle}>Manajemen gaya hidup dan mental.</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Relaksasi</Text>
        <Text style={styles.cardText}>Sesi meditasi 10 menit untuk menurunkan stres.</Text>
      </View>
    </ScrollView>
  );
}

export function ProfileScreen() {
  return (
    <ScrollView style={styles.screenBackground} contentContainerStyle={styles.screenContentGeneric}>
      <Text style={styles.sectionTitle}>Profil</Text>
      <Text style={styles.sectionSubtitle}>Kelola akun dan lihat progres kesehatan.</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Data Tubuh</Text>
        <Text style={styles.cardText}>Tinggi: 170 cm | Berat: 65 kg</Text>
      </View>
    </ScrollView>
  );
}

const Tab = createBottomTabNavigator();
const HomeStackNavigator = createStackNavigator();
const RootStackNavigator = createStackNavigator();

// --- STACK NAVIGATOR UNTUK HALAMAN BERANDA ---
function HomeStack() {
  return (
    <HomeStackNavigator.Navigator screenOptions={{ headerShown: false }}>
      <HomeStackNavigator.Screen name="HomeMain" component={HomeScreen} />
      <HomeStackNavigator.Screen name="JadwalTidur" component={JadwalTidurScreen} />
      <HomeStackNavigator.Screen name="JadwalTidurDetail" component={JadwalTidurDetail} />
      <HomeStackNavigator.Screen name="KalkulatorPertumbuhan" component={KalkulatorPertumbuhanScreen} />
      <HomeStackNavigator.Screen name="OlahragaMenu" component={OlahragaScreen} />
      <HomeStackNavigator.Screen name="PengelolaStres" component={PengelolaStresScreen} />
      <HomeStackNavigator.Screen name="PolaMakan" component={PolaMakanScreen} />
      <HomeStackNavigator.Screen name="RekomendasiMakanan" component={RekomendasiMakananScreen} />
    </HomeStackNavigator.Navigator>
  );
}

// --- KOMPONEN TAB BAR UTAMA ---
function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Beranda') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Olahraga') iconName = focused ? 'barbell' : 'barbell-outline';
          else if (route.name === 'Pola Makan') iconName = focused ? 'nutrition' : 'nutrition-outline';
          else if (route.name === 'Pengelola Stres') iconName = focused ? 'heart' : 'heart-outline';
          else if (route.name === 'Profil') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#9CA3AF',
        
        // --- BAGIAN PENTING: GANTI TOMBOL TAB DENGAN LIQUID GLASS ---
        tabBarButton: (props) => <LiquidGlassTabButton {...props} />,
        
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: -4 },
          height: 70 + insets.bottom,
          paddingBottom: 10 + insets.bottom,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Beranda" component={HomeStack} />
      <Tab.Screen name="Olahraga" component={OlahragaScreen} options={{ title: 'Olahraga' }} />
      <Tab.Screen name="Pola Makan" component={PolaMakanScreen} options={{ title: 'Pola Makan' }} />
      <Tab.Screen name="Pengelola Stres" component={PengelolaStresScreen} options={{ title: 'Pengelola Stres' }} />
      <Tab.Screen name="Profil" component={ProfilesScreen} options={{ title: 'Profil' }} />
    </Tab.Navigator>
  );
}

// --- ROOT UTAMA ---
export default function Navigation() {
  const [user, setUser] = useState(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <RootStackNavigator.Navigator screenOptions={{ headerShown: false }}>
            <RootStackNavigator.Screen name="MainTabs" component={MainTabs} />
            <RootStackNavigator.Screen name="Login" component={LoginScreen} />
            <RootStackNavigator.Screen name="Register" component={RegisterScreen} />
          </RootStackNavigator.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </AuthContext.Provider>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 100,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  bannerContainer: {
    backgroundColor: '#2196F3',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bannerTextContent: {
    flex: 1,
    paddingRight: 10,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: '#E3F2FD',
    marginBottom: 12,
  },
  checkinButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  checkinText: {
    color: '#2196F3',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 6,
  },
  bannerImage: {
    opacity: 0.8,
  },
  miniCheckinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 4,
  },
  miniCheckinText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    marginLeft: 6,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 20,
  },
  gridTouch: {
    width: '30%', 
    marginBottom: 18,
  },
  gridItem: {
    width: '100%',
    alignItems: 'center',
  },
  gridIconBox: {
    width: 62,
    height: 62,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  badgeContainer: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#EF5350',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    zIndex: 1,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  gridLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 18,
    width: '100%',
  },
  streakSection: {
    marginTop: 4,
    marginBottom: 20,
  },
  streakGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  streakCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 3,
  },
  streakIcon: {
    marginBottom: 6,
  },
  streakValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '700',
    textAlign: 'center',
  },
  streakNote: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'center',
  },
  infoSection: {
    marginTop: 4,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  carouselContainer: {
    backgroundColor: '#E5E7EB',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
  },
  tipCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    minHeight: 120,
    justifyContent: 'center',
  },
  tipBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '700',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#2196F3',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#2196F3',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  screenBackground: {
    flex: 1,
    backgroundColor: '#F4F7FF',
  },
  screenContentGeneric: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 80,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: '#6B7280',
    marginBottom: 18,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#4B5563',
    lineHeight: 20,
  },
  
  // --- HOME WORKOUT HISTORY STYLES ---
  historySection: {
    marginTop: 4,
    marginBottom: 20,
  },
  emptyHistoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyHistoryText: {
    color: '#9CA3AF',
    fontSize: 13,
    marginTop: 8,
  },
  homeHistoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
  },
  homeHistoryIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EFF3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  homeHistoryName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  homeHistoryDate: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  homeHistorySets: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  homeHistoryDuration: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
});