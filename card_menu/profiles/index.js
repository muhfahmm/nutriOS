import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AuthenticatedProfile from './AuthenticatedProfile';

export default function ProfileScreen({ navigation }) {
  // --- STATE MOCK (UNTUK UJI COBA) ---
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Ubah ke 'true' untuk lihat mode Login
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLargeText, setIsLargeText] = useState(false);
  
  // Mock State Notifikasi
  const [notifImunisasi, setNotifImunisasi] = useState(true);
  const [notifMakan, setNotifMakan] = useState(false);
  const [notifTidur, setNotifTidur] = useState(true);

  const toggleLogin = () => setIsLoggedIn(!isLoggedIn);

  // --- RENDER GUEST MODE (BELUM LOGIN) ---
  const renderGuestMode = () => (
    <View style={styles.contentContainer}>
      {/* 1. Kartu Ajak Bertindak (CTA Banner) */}
      <View style={styles.ctaBanner}>
        <Ionicons name="shield-checkmark" size={40} color="#ffffff" style={{ marginBottom: 12 }} />
        <Text style={styles.ctaTitle}>Simpan riwayat tumbuh kembang anak!</Text>
        <Text style={styles.ctaSubtitle}>
          Dapatkan pengingat jadwal imunisasi, pantau Z-Score, dan rekomendasi nutrisi secara otomatis.
        </Text>
        <View style={styles.ctaButtonRow}>
          <TouchableOpacity style={styles.ctaButtonPrimary} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.ctaButtonTextPrimary}>Masuk</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ctaButtonSecondary} onPress={() => navigation.navigate('Register')}>
            <Text style={styles.ctaButtonTextSecondary}>Daftar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Pengaturan Tampilan & Aksesibilitas */}
      <Text style={styles.sectionTitle}>Pengaturan Tampilan</Text>
      <View style={styles.card}>
        <View style={styles.rowItem}>
          <View style={styles.rowIconText}>
            <Ionicons name={isDarkMode ? "moon" : "sunny-outline"} size={22} color="#4B5563" style={{ marginRight: 12 }} />
            <Text style={styles.rowLabel}>Mode Gelap / Terang</Text>
          </View>
          <Switch value={isDarkMode} onValueChange={setIsDarkMode} trackColor={{ false: '#E5E7EB', true: '#3B82F6' }} />
        </View>
        <View style={[styles.rowItem, { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 14, marginTop: 14 }]}>
          <View style={styles.rowIconText}>
            <Ionicons name="text-outline" size={22} color="#4B5563" style={{ marginRight: 12 }} />
            <Text style={styles.rowLabel}>Ukuran Teks Besar</Text>
          </View>
          <Switch value={isLargeText} onValueChange={setIsLargeText} trackColor={{ false: '#E5E7EB', true: '#3B82F6' }} />
        </View>
      </View>

      {/* 3. Pusat Bantuan & Edukasi */}
      <Text style={styles.sectionTitle}>Pusat Bantuan</Text>
      <View style={styles.card}>
        <TouchableOpacity style={styles.rowItem}>
          <View style={styles.rowIconText}>
            <Ionicons name="help-circle-outline" size={22} color="#4B5563" style={{ marginRight: 12 }} />
            <Text style={styles.rowLabel}>FAQ & Cara Pakai</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.rowItem, { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 14, marginTop: 14 }]}>
          <View style={styles.rowIconText}>
            <Ionicons name="document-text-outline" size={22} color="#4B5563" style={{ marginRight: 12 }} />
            <Text style={styles.rowLabel}>Panduan Z-Score WHO</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
        <View style={[styles.rowItem, { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 14, marginTop: 14, alignItems: 'flex-start' }]}>
          <View style={styles.rowIconText}>
            <Ionicons name="warning-outline" size={22} color="#EF5350" style={{ marginRight: 12 }} />
            <Text style={[styles.rowLabel, { color: '#EF5350', flex: 1 }]}>
              *Disclaimer Medis: Aplikasi ini adalah alat bantu dan tidak menggantikan diagnosis dokter.
            </Text>
          </View>
        </View>
      </View>

      {/* 4. Informasi Aplikasi */}
      <Text style={styles.sectionTitle}>Tentang Aplikasi</Text>
      <View style={styles.card}>
        <Text style={styles.appInfoText}>Versi: v1.0.0 - Web & Mobile</Text>
        <Text style={styles.appInfoText}>Lisensi: Data Pertumbuhan WHO</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-social-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.shareButtonText}>Bagikan Aplikasi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // --- RENDER AUTHENTICATED MODE (SUDAH LOGIN) ---
  const renderAuthenticatedMode = () => (
    <View style={styles.contentContainer}>
      
      {/* 1. Header Profil Orang Tua */}
      <View style={styles.profileHeader}>
        <View style={styles.profileAvatar}>
          <Ionicons name="person" size={50} color="#FFFFFF" />
        </View>
        <View style={styles.profileInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={styles.profileName}>Andri Wahyudi</Text>
            <View style={styles.badgeStatus}>
              <Text style={styles.badgeStatusText}>Orang Tua Siaga</Text>
            </View>
          </View>
          <Text style={styles.profileEmail}>andri.wahyudi@email.com</Text>
          <TouchableOpacity style={styles.editProfileBtn}>
            <Text style={styles.editProfileText}>Ubah Profil</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Manajemen Data Anak (Multi-Child Switcher) */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Data Anak</Text>
        <View style={styles.childList}>
          <View style={styles.childItem}>
            <View style={styles.childInfo}>
              <Ionicons name="happy-outline" size={20} color="#3B82F6" />
              <Text style={styles.childName}>Budi (24 Bulan)</Text>
              <View style={[styles.childStatus, { backgroundColor: '#D1FAE5' }]}>
                <Text style={[styles.childStatusText, { color: '#059669' }]}>Normal</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </View>
          <View style={[styles.childItem, { borderTopWidth: 1, borderTopColor: '#F3F4F6', marginTop: 12, paddingTop: 12 }]}>
            <View style={styles.childInfo}>
              <Ionicons name="happy-outline" size={20} color="#F59E0B" />
              <Text style={styles.childName}>Siti (6 Bulan)</Text>
              <View style={[styles.childStatus, { backgroundColor: '#FEF3C7' }]}>
                <Text style={[styles.childStatusText, { color: '#D97706' }]}>Waspada</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </View>
        </View>
        <TouchableOpacity style={styles.addChildBtn}>
          <Ionicons name="add-circle-outline" size={18} color="#3B82F6" style={{ marginRight: 6 }} />
          <Text style={styles.addChildText}>+ Tambah Data Anak</Text>
        </TouchableOpacity>
      </View>

      {/* 3. Akses Cepat & Riwayat */}
      <Text style={styles.sectionTitle}>Akses Cepat</Text>
      <View style={styles.quickAccessRow}>
        <TouchableOpacity style={styles.quickAccessBtn}>
          <Ionicons name="download-outline" size={24} color="#3B82F6" />
          <Text style={styles.quickAccessLabel}>Ekspor PDF</Text>
          <Text style={styles.quickAccessSub}>Rekam KMS</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAccessBtn}>
          <Ionicons name="heart-outline" size={24} color="#EF5350" />
          <Text style={styles.quickAccessLabel}>Resep Favorit</Text>
          <Text style={styles.quickAccessSub}>Meal Planner</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAccessBtn}>
          <Ionicons name="analytics-outline" size={24} color="#8B5CF6" />
          <Text style={styles.quickAccessLabel}>Jurnal Stres</Text>
          <Text style={styles.quickAccessSub}>Mingguan</Text>
        </TouchableOpacity>
      </View>

      {/* 4. Pusat Pengaturan Notifikasi */}
      <Text style={styles.sectionTitle}>Pengaturan Notifikasi</Text>
      <View style={styles.card}>
        <View style={styles.rowItem}>
          <View style={styles.rowIconText}>
            <Ionicons name="medkit-outline" size={22} color="#4B5563" style={{ marginRight: 12 }} />
            <Text style={styles.rowLabel}>Imunisasi & Posyandu</Text>
          </View>
          <Switch value={notifImunisasi} onValueChange={setNotifImunisasi} trackColor={{ false: '#E5E7EB', true: '#3B82F6' }} />
        </View>
        <View style={[styles.rowItem, { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 14, marginTop: 14 }]}>
          <View style={styles.rowIconText}>
            <Ionicons name="restaurant-outline" size={22} color="#4B5563" style={{ marginRight: 12 }} />
            <Text style={styles.rowLabel}>Jam Makan Anak</Text>
          </View>
          <Switch value={notifMakan} onValueChange={setNotifMakan} trackColor={{ false: '#E5E7EB', true: '#3B82F6' }} />
        </View>
        <View style={[styles.rowItem, { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 14, marginTop: 14 }]}>
          <View style={styles.rowIconText}>
            <Ionicons name="moon-outline" size={22} color="#4B5563" style={{ marginRight: 12 }} />
            <Text style={styles.rowLabel}>Jadwal Tidur & Minum Air</Text>
          </View>
          <Switch value={notifTidur} onValueChange={setNotifTidur} trackColor={{ false: '#E5E7EB', true: '#3B82F6' }} />
        </View>
      </View>

      {/* 5. Keamanan & Privasi Akun */}
      <Text style={styles.sectionTitle}>Keamanan & Privasi</Text>
      <View style={styles.card}>
        <TouchableOpacity style={styles.rowItem}>
          <View style={styles.rowIconText}>
            <Ionicons name="key-outline" size={22} color="#4B5563" style={{ marginRight: 12 }} />
            <Text style={styles.rowLabel}>Ubah Kata Sandi</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.rowItem, { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 14, marginTop: 14 }]}>
          <View style={styles.rowIconText}>
            <Ionicons name="cloud-upload-outline" size={22} color="#4B5563" style={{ marginRight: 12 }} />
            <Text style={styles.rowLabel}>Status Sinkronisasi Cloud</Text>
            <View style={[styles.childStatus, { backgroundColor: '#D1FAE5', marginLeft: 10 }]}>
              <Text style={[styles.childStatusText, { color: '#059669', fontSize: 10 }]}>Tersinkron</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Tombol Bahaya */}
      <TouchableOpacity style={styles.logoutBtn} onPress={toggleLogin}>
        <Ionicons name="log-out-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
        <Text style={styles.logoutText}>Keluar</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.deleteAccountBtn}>
        <Ionicons name="trash-outline" size={18} color="#EF5350" style={{ marginRight: 8 }} />
        <Text style={styles.deleteAccountText}>Hapus Akun</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F4F7FF' }}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Toggle Mock Login (Hanya untuk demo) */}
        <TouchableOpacity onPress={toggleLogin} style={styles.demoToggle}>
          <Text style={styles.demoToggleText}>
            {isLoggedIn ? '🔴 Mode: Sudah Login (Tekan untuk Guest)' : '🟢 Mode: Guest (Tekan untuk Login)'}
          </Text>
        </TouchableOpacity>

        {isLoggedIn ? <AuthenticatedProfile onLogout={toggleLogin} /> : renderGuestMode()}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  // --- STYLE DEMO ---
  demoToggle: {
    backgroundColor: '#E5E7EB',
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  demoToggleText: {
    fontWeight: '600',
    color: '#374151',
  },

  // --- STYLE GUEST MODE ---
  contentContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 24,
    marginBottom: 12,
  },
  ctaBanner: {
    backgroundColor: '#3B82F6',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 14,
    color: '#E3F2FD',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  ctaButtonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  ctaButtonPrimary: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  ctaButtonTextPrimary: {
    color: '#3B82F6',
    fontWeight: '700',
    fontSize: 16,
  },
  ctaButtonSecondary: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  ctaButtonTextSecondary: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 4,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowIconText: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  appInfoText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  shareButton: {
    marginTop: 14,
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },

  // --- STYLE AUTHENTICATED MODE ---
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  profileEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginVertical: 4,
  },
  badgeStatus: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 20,
    marginLeft: 8,
  },
  badgeStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  editProfileBtn: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  childList: {
    marginBottom: 12,
  },
  childItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  childInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  childName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  childStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  childStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  addChildBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 4,
  },
  addChildText: {
    color: '#3B82F6',
    fontWeight: '600',
    fontSize: 14,
  },
  quickAccessRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickAccessBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  quickAccessLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginTop: 6,
  },
  quickAccessSub: {
    fontSize: 11,
    color: '#6B7280',
  },
  logoutBtn: {
    backgroundColor: '#EF5350',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 24,
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  deleteAccountBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 8,
  },
  deleteAccountText: {
    color: '#EF5350',
    fontWeight: '600',
    fontSize: 14,
  },
});