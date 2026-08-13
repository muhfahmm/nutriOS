import React, { useContext } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../auth/AuthContext';
import { logoutUser } from '../../auth/logout';
import { LogoutConfirmModal, LogoutSuccessModal, MenuModal, ChangePasswordModal } from '../../auth/AuthModals';
import { useState } from 'react';
import { API_BASE_URL } from '../../auth/api';

export default function ProfileScreen({ navigation }) {
  const { user, setUser } = useContext(AuthContext);
  const [isLogoutConfirmVisible, setIsLogoutConfirmVisible] = useState(false);
  const [isLogoutSuccessVisible, setIsLogoutSuccessVisible] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isChangePasswordVisible, setIsChangePasswordVisible] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const handleLogout = () => {
    setIsLogoutConfirmVisible(true);
  };

  const handleConfirmLogout = () => {
    logoutUser(setUser);
    setIsLogoutConfirmVisible(false);
    setIsLogoutSuccessVisible(true);
  };

  const handleSavePassword = async (oldPassword, newPassword, onSuccess, onError) => {
    if (!user) return;
    setIsSavingPassword(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/ganti-password?userId=${user.id}&oldPassword=${encodeURIComponent(oldPassword)}&newPassword=${encodeURIComponent(newPassword)}`
      );
      const result = await response.json();
      if (response.ok) {
        Alert.alert('Sukses', 'Kata sandi berhasil diperbarui!');
        onSuccess();
      } else {
        onError(result.message || 'Gagal mengubah kata sandi.');
      }
    } catch (e) {
      onError('Koneksi internet gagal.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Menu list options
  const profileMenus = user ? [
    { label: 'Informasi Akun', icon: 'information-circle-outline', onPress: () => {} },
    { label: 'Ganti Kata Sandi', icon: 'key-outline', onPress: () => setIsChangePasswordVisible(true) },
    { label: 'Bantuan & FAQ', icon: 'help-circle-outline', onPress: () => {} },
    { label: 'Keluar Akun', icon: 'log-out-outline', style: 'destructive', onPress: handleLogout }
  ] : [
    { label: 'Masuk Akun', icon: 'log-in-outline', onPress: () => navigation.navigate('Login') },
    { label: 'Daftar Baru', icon: 'person-add-outline', onPress: () => navigation.navigate('Register') },
    { label: 'Bantuan & FAQ', icon: 'help-circle-outline', onPress: () => {} }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={[styles.profileAvatar, user && styles.profileAvatarActive]}>
          <Ionicons name={user ? "person" : "person-outline"} size={44} color="#FFFFFF" />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>
            {user ? user.nama_lengkap : 'Profil Pengguna'}
          </Text>
          <Text style={styles.profileEmail}>
            {user ? `@${user.username}` : 'Kelola preferensi dan lihat ringkasan aktivitas.'}
          </Text>
        </View>
        <TouchableOpacity style={{ padding: 6 }} onPress={() => setIsMenuVisible(true)}>
          <Ionicons name="settings-outline" size={22} color="#64748B" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* JIKA USER SUDAH LOGIN */}
        {user ? (
          <View>
            {/* Info Detail Akun */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Detail Akun Anda</Text>
              
              <View style={styles.rowItem}>
                <Ionicons name="card-outline" size={20} color="#4F46E5" style={styles.rowIcon} />
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Nama Lengkap</Text>
                  <Text style={styles.infoValue}>{user.nama_lengkap}</Text>
                </View>
              </View>

              <View style={[styles.rowItem, styles.rowSeparator]}>
                <Ionicons name="at-outline" size={20} color="#4F46E5" style={styles.rowIcon} />
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Username</Text>
                  <Text style={styles.infoValue}>{user.username}</Text>
                </View>
              </View>

              <View style={[styles.rowItem, styles.rowSeparator]}>
                <Ionicons name="key-outline" size={20} color="#4F46E5" style={styles.rowIcon} />
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Status Keanggotaan</Text>
                  <Text style={[styles.infoValue, { color: '#10B981', fontWeight: 'bold' }]}>Anggota Aktif Cloud Sync</Text>
                </View>
              </View>
            </View>

            {/* Tombol Logout */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.logoutButtonText}>Keluar dari Akun</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* JIKA USER ADALAH GUEST */
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Silakan masuk</Text>
              <Text style={styles.cardText}>Masuk untuk menyimpan progres pertumbuhan, mengelola jadwal tidur, dan menyinkronkan data KMS anak Anda ke server.</Text>
              
              <View style={styles.authButtonRow}>
                <TouchableOpacity style={styles.buttonPrimary} onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonSecondary} onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.buttonTextSecondary}>Register</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.googleButton} onPress={() => {}}>
              <Ionicons name="logo-google" size={20} color="#FFFFFF" style={styles.googleIcon} />
              <Text style={styles.googleButtonText}>Login dengan Google</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tentang Aplikasi */}
        <View style={[styles.card, { marginTop: user ? 0 : 20 }]}>
          <Text style={styles.cardTitle}>Tentang Aplikasi</Text>
          <Text style={styles.cardText}>Versi aplikasi: 1.0.0</Text>
          <Text style={styles.cardText}>Fitur inti: Jadwal Tidur (Smart Alarm), Kalkulator Gizi & IMT, Pola Olahraga, Pengelola Stres, dan KMS Digital Terintegrasi MySQL.</Text>
        </View>

      </ScrollView>

      {/* MODAL KONFIRMASI LOGOUT */}
      <LogoutConfirmModal
        visible={isLogoutConfirmVisible}
        onClose={() => setIsLogoutConfirmVisible(false)}
        onConfirm={handleConfirmLogout}
      />

      {/* MODAL SUCCESS LOGOUT */}
      <LogoutSuccessModal
        visible={isLogoutSuccessVisible}
        onClose={() => setIsLogoutSuccessVisible(false)}
      />

      {/* BOTTOM SHEET MENU MODAL */}
      <MenuModal
        visible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
        title="Pengaturan & Menu"
        menus={profileMenus}
      />

      {/* MODAL GANTI PASSWORD */}
      <ChangePasswordModal
        visible={isChangePasswordVisible}
        onClose={() => setIsChangePasswordVisible(false)}
        onSave={handleSavePassword}
        isSaving={isSavingPassword}
      />
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
    paddingBottom: 100,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 4,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#94A3B8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileAvatarActive: {
    backgroundColor: '#2563EB',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
    fontFamily: 'Roboto',
  },
  profileEmail: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    fontFamily: 'Roboto',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
    fontFamily: 'Roboto',
  },
  cardText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 8,
    fontFamily: 'Roboto',
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  rowIcon: {
    marginRight: 16,
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginTop: 2,
  },
  rowSeparator: {
    borderTopWidth: 1.5,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
    marginTop: 4,
  },
  authButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 18,
  },
  buttonPrimary: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonSecondary: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
    fontFamily: 'Roboto',
  },
  buttonTextSecondary: {
    color: '#2563EB',
    fontWeight: '800',
    fontSize: 14,
    fontFamily: 'Roboto',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DB4437',
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#DB4437',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 4,
  },
  googleIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
    fontFamily: 'Roboto',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 20,
    shadowColor: '#EF4444',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 4,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
    fontFamily: 'Roboto',
  },
});
