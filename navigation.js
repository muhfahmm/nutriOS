import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useState, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from './auth/AuthContext';

if (Text && !Text.defaultProps) {
  Text.defaultProps = {};
}
if (Text && Text.defaultProps) {
  Text.defaultProps.style = [Text.defaultProps.style, { fontFamily: 'Roboto' }];
}
// Pastikan import safe area di bawah ini
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import JadwalTidurScreen from './card_menu/jadwal_tidur';
import KalkulatorPertumbuhanScreen from './card_menu/kalkulator_pertumbuhan';
import OlahragaScreen from './card_menu/olahraga';
import PengelolaStresScreen from './card_menu/pengelola_stres';
import PolaMakanScreen from './card_menu/pola_makan';
import ProfilesScreen from './card_menu/profiles';
import RekomendasiMakananScreen from './card_menu/rekomendasi_makanan';
import LoginScreen from './auth/login';
import RegisterScreen from './auth/register';

// --- KOMPONEN BANTUAN UNTUK GRID MENU ---
export const GridItem = ({ color, iconName, label, badge }) => {
  return (
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
  );
};

// --- SCREEN BERANDA ---
export function HomeScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const greetingName = user?.nama_lengkap ? `Hai, ${user.nama_lengkap}` : 'Hai, user';

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

        <View style={styles.gridContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('JadwalTidur')} style={styles.gridTouch}>
            <GridItem color="#5C6BC0" iconName="moon" label="Jadwal Tidur" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('KalkulatorPertumbuhan')} style={styles.gridTouch}>
            <GridItem color="#FFA726" iconName="analytics" label="Kalkulator Pertumbuhan" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('OlahragaMenu')} style={styles.gridTouch}>
            <GridItem color="#EF5350" iconName="barbell" label="Olahraga" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('PengelolaStres')} style={styles.gridTouch}>
            <GridItem color="#26A69A" iconName="leaf" label="Pengelola Stres" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('PolaMakan')} style={styles.gridTouch}>
            <GridItem color="#FDD835" iconName="nutrition" label="Pola Makan" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('RekomendasiMakanan')} style={styles.gridTouch}>
            <GridItem color="#AB47BC" iconName="fast-food" label="Rekomendasi Makanan" />
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Informasi Kesehatan</Text>
          <View style={styles.infoPlaceholder} />
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
      <HomeStackNavigator.Screen name="KalkulatorPertumbuhan" component={KalkulatorPertumbuhanScreen} />
      <HomeStackNavigator.Screen name="OlahragaMenu" component={OlahragaScreen} />
      <HomeStackNavigator.Screen name="PengelolaStres" component={PengelolaStresScreen} />
      <HomeStackNavigator.Screen name="PolaMakan" component={PolaMakanScreen} />
      <HomeStackNavigator.Screen name="RekomendasiMakanan" component={RekomendasiMakananScreen} />
    </HomeStackNavigator.Navigator>
  );
}

// --- KOMPONEN TAB BAR UTAMA (DIPISAHKAN AGAR BISA PAKAI useSafeAreaInsets) ---
function MainTabs() {
  // AMBIL SAFE AREA DI SINI (Setelah SafeAreaProvider di luar menyala)
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Beranda') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Olahraga') iconName = focused ? 'barbell' : 'barbell-outline';
          else if (route.name === 'Nutrisi') iconName = focused ? 'nutrition' : 'nutrition-outline';
          else if (route.name === 'Kesehatan') iconName = focused ? 'heart' : 'heart-outline';
          else if (route.name === 'Profil') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: -4 },
          // Gunakan inset di sini agar tidak tertutup tombol device
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
      <Tab.Screen name="Nutrisi" component={PolaMakanScreen} options={{ title: 'Nutrisi' }} />
      <Tab.Screen name="Kesehatan" component={PengelolaStresScreen} options={{ title: 'Kesehatan' }} />
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
  infoSection: {
    marginTop: 4,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  infoPlaceholder: {
    backgroundColor: '#E5E7EB',
    width: '100%',
    height: 160,
    borderRadius: 16,
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
});