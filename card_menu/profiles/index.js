import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, TextInput, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../auth/AuthContext';
import { logoutUser } from '../../auth/logout';
import { LogoutConfirmModal, LogoutSuccessModal, MenuModal, ChangePasswordModal } from '../../auth/AuthModals';
import { API_BASE_URL, fetchWithTimeout } from '../../auth/api';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';

let GoogleSignin = null;
let auth = null;
try {
  const gModule = require('@react-native-google-signin/google-signin');
  GoogleSignin = gModule.GoogleSignin;
  const fModule = require('@react-native-firebase/auth');
  auth = fModule.default;
} catch (e) {
  console.warn("Firebase/Google Sign-In modules not available in this environment.");
}

export default function ProfileScreen({ navigation }) {
  const { user, setUser, isDarkMode, toggleTheme } = useContext(AuthContext);
  const [isLogoutConfirmVisible, setIsLogoutConfirmVisible] = useState(false);
  const [isLogoutSuccessVisible, setIsLogoutSuccessVisible] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isChangePasswordVisible, setIsChangePasswordVisible] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const [namaLengkapInput, setNamaLengkapInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [fotoProfilUri, setFotoProfilUri] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState('');

  const [tinggiInput, setTinggiInput] = useState('');
  const [beratInput, setBeratInput] = useState('');
  const [tglLahirInput, setTglLahirInput] = useState('');
  const [dateValue, setDateValue] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (user) {
      setNamaLengkapInput(user.nama_lengkap || '');
      setUsernameInput(user.username || '');
      setFotoProfilUri(user.foto_profil || '');
      setJenisKelamin(user.jenis_kelamin || '');
      setTinggiInput(user.tinggi_badan ? user.tinggi_badan.toString() : '');
      setBeratInput(user.berat_badan ? user.berat_badan.toString() : '');
      setTglLahirInput(user.tanggal_lahir || '');
      if (user.tanggal_lahir) {
        setDateValue(new Date(user.tanggal_lahir));
      }
    }
  }, [user]);

  useEffect(() => {
    if (GoogleSignin) {
      try {
        GoogleSignin.configure({
          webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 'your_web_client_id_here.apps.googleusercontent.com',
          offlineAccess: true,
        });
      } catch (err) {
        console.error('Google Sign-In configuration failed:', err);
      }
    }
  }, []);

  const handleGoogleLogin = async () => {
    if (!GoogleSignin || !auth) {
      Alert.alert(
        'Simulasi Google Sign-In',
        'Google Sign-in native membutuhkan build custom (.apk). Apakah Anda ingin login dengan Akun Simulasi Google untuk menguji integrasi database?',
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Masuk (Simulasi)',
            onPress: async () => {
              try {
                const backendResponse = await fetchWithTimeout(`${API_BASE_URL}/api/login-google`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    uid: 'google-mock-uid-123',
                    email: 'tester.google@gmail.com',
                    displayName: 'user',
                    photoURL: null,
                  }),
                });

                const result = await backendResponse.json();

                if (backendResponse.ok && result.user) {
                  setUser(result.user);
                  Alert.alert('Sukses', 'Login Google Simulasi Berhasil.');
                } else {
                  Alert.alert('Error', result.message || 'Gagal sinkronisasi akun Google.');
                }
              } catch (error) {
                console.error('Google mock login error:', error);
                Alert.alert('Error', 'Koneksi database/server gagal.');
              }
            }
          }
        ]
      );
      return;
    }

    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const { idToken, user: googleUser } = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const firebaseResult = await auth().signInWithCredential(googleCredential);
      const firebaseUser = firebaseResult.user;

      const backendResponse = await fetchWithTimeout(`${API_BASE_URL}/api/login-google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || googleUser.name,
          photoURL: null,
        }),
      });

      const result = await backendResponse.json();

      if (backendResponse.ok && result.user) {
        setUser(result.user);
        Alert.alert('Sukses', 'Login Google Berhasil.');
      } else {
        Alert.alert('Error', result.message || 'Gagal sinkronisasi akun Google dengan server NutriOS.');
      }
    } catch (error) {
      console.error('Google login error:', error);
      Alert.alert('Error', 'Gagal masuk dengan Google.');
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Perizinan Ditolak', 'Aplikasi membutuhkan akses galeri untuk mengganti foto profil.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const selected = result.assets[0];
      const base64Data = `data:image/jpeg;base64,${selected.base64}`;
      setFotoProfilUri(base64Data);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          tinggi_badan: tinggiInput || null,
          berat_badan: beratInput || null,
          tanggal_lahir: tglLahirInput || null,
          jenis_kelamin: jenisKelamin || null,
          nama_lengkap: namaLengkapInput,
          username: usernameInput,
          foto_profil: fotoProfilUri || null,
        })
      });
      const result = await response.json();
      if (response.ok && result.user) {
        setUser(result.user);
        Alert.alert('Sukses', 'Detail akun Anda berhasil diperbarui!');
      } else {
        setNamaLengkapInput(user.nama_lengkap || '');
        setUsernameInput(user.username || '');
        Alert.alert('Gagal', result.message || 'Gagal memperbarui profil.');
      }
    } catch (e) {
      setNamaLengkapInput(user.nama_lengkap || '');
      setUsernameInput(user.username || '');
      console.warn('Error updating profile:', e);
      Alert.alert('Error', 'Gagal menghubungi server.');
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDateValue(selectedDate);
      const yyyy = selectedDate.getFullYear();
      const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const dd = String(selectedDate.getDate()).padStart(2, '0');
      setTglLahirInput(`${yyyy}-${mm}-${dd}`);
    }
  };

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

  const profileMenus = user ? [
    { label: 'Informasi Akun', icon: 'information-circle-outline', onPress: () => {} },
    { label: isDarkMode ? 'Mode Terang (Light Mode)' : 'Mode Gelap (Dark Mode)', icon: isDarkMode ? 'sunny-outline' : 'moon-outline', onPress: toggleTheme },
    { label: 'Ganti Kata Sandi', icon: 'key-outline', onPress: () => setIsChangePasswordVisible(true) },
    { label: 'Bantuan & FAQ', icon: 'help-circle-outline', onPress: () => {} },
    { label: 'Keluar Akun', icon: 'log-out-outline', style: 'destructive', onPress: handleLogout }
  ] : [
    { label: 'Masuk Akun', icon: 'log-in-outline', onPress: () => navigation.navigate('Login') },
    { label: 'Daftar Baru', icon: 'person-add-outline', onPress: () => navigation.navigate('Register') },
    { label: isDarkMode ? 'Mode Terang (Light Mode)' : 'Mode Gelap (Dark Mode)', icon: isDarkMode ? 'sunny-outline' : 'moon-outline', onPress: toggleTheme },
    { label: 'Bantuan & FAQ', icon: 'help-circle-outline', onPress: () => {} }
  ];

  return (
    <SafeAreaView style={[styles.container, isDarkMode && { backgroundColor: '#0F172A' }]}>
      <View style={[styles.profileHeader, isDarkMode && { borderBottomColor: '#1E293B', backgroundColor: '#0F172A' }]}>
        <TouchableOpacity onPress={user ? handlePickImage : null} activeOpacity={0.8} style={[styles.profileAvatar, user && styles.profileAvatarActive]}>
          {fotoProfilUri ? (
            <Image source={{ uri: fotoProfilUri }} style={styles.avatarImage} />
          ) : (
            <Ionicons name={user ? "person" : "person-outline"} size={44} color="#FFFFFF" />
          )}
          {user && (
            <View style={styles.cameraIconBadge}>
              <Ionicons name="camera" size={14} color="#FFFFFF" />
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, isDarkMode && { color: '#F8FAFC' }]}>
            {user ? user.nama_lengkap : 'Profil Pengguna'}
          </Text>
          <Text style={[styles.profileEmail, isDarkMode && { color: '#94A3B8' }]}>
            {user ? `@${user.username}` : 'Kelola preferensi dan lihat ringkasan aktivitas.'}
          </Text>
        </View>
        <TouchableOpacity style={{ padding: 6 }} onPress={() => setIsMenuVisible(true)}>
          <Ionicons name="settings-outline" size={22} color={isDarkMode ? '#F8FAFC' : '#64748B'} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>


        {user ? (
          <View>
            <View style={[styles.card, isDarkMode && { backgroundColor: '#1E293B' }]}>
              <Text style={[styles.cardTitle, isDarkMode && { color: '#F8FAFC' }]}>Detail Akun Anda</Text>

              <View style={styles.flexRow}>
                <View style={styles.flexCol}>
                  {(() => {
                    let nameCooldownActive = false;
                    let nameRemainingDays = 0;
                    let nameUnlockDateStr = "";

                    if (user && user.last_name_change) {
                      const lastChange = new Date(user.last_name_change);
                      const nextAllowed = new Date(lastChange.getTime() + 7 * 24 * 60 * 60 * 1000);
                      if (new Date() < nextAllowed) {
                        nameCooldownActive = true;
                        nameRemainingDays = Math.ceil((nextAllowed.getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000));
                        nameUnlockDateStr = nextAllowed.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                      }
                    }

                    return (
                      <View style={styles.rowItem}>
                        <Ionicons name="card-outline" size={20} color="#4F46E5" style={styles.rowIcon} />
                        <View style={styles.infoCol}>
                          <Text style={styles.infoLabel}>Nama Lengkap</Text>
                          <TextInput
                            style={[styles.profileInputInline, nameCooldownActive && styles.profileInputDisabled, isDarkMode && { color: '#F8FAFC', borderBottomColor: '#334155' }]}
                            placeholder="Masukkan nama lengkap"
                            placeholderTextColor={isDarkMode ? '#64748B' : '#9CA3AF'}
                            value={namaLengkapInput}
                            onChangeText={setNamaLengkapInput}
                            editable={!nameCooldownActive}
                          />
                          {nameCooldownActive && (
                            <Text style={styles.cooldownWarningText}>
                              Terkunci: ganti lagi dalam {nameRemainingDays} hari ({nameUnlockDateStr})
                            </Text>
                          )}
                        </View>
                      </View>
                    );
                  })()}
                </View>

                <View style={styles.flexCol}>
                  {(() => {
                    let userCooldownActive = false;
                    let userRemainingDays = 0;
                    let userUnlockDateStr = "";

                    if (user && user.last_username_change) {
                      const lastChange = new Date(user.last_username_change);
                      const nextAllowed = new Date(lastChange.getTime() + 14 * 24 * 60 * 60 * 1000);
                      if (new Date() < nextAllowed) {
                        userCooldownActive = true;
                        userRemainingDays = Math.ceil((nextAllowed.getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000));
                        userUnlockDateStr = nextAllowed.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                      }
                    }

                    return (
                      <View style={[styles.rowItem, styles.rowSeparatorFlex]}>
                        <Ionicons name="at-outline" size={20} color="#4F46E5" style={styles.rowIcon} />
                        <View style={styles.infoCol}>
                          <Text style={styles.infoLabel}>Username</Text>
                          <TextInput
                            style={[styles.profileInputInline, userCooldownActive && styles.profileInputDisabled, isDarkMode && { color: '#F8FAFC', borderBottomColor: '#334155' }]}
                            placeholder="Masukkan username"
                            placeholderTextColor={isDarkMode ? '#64748B' : '#9CA3AF'}
                            autoCapitalize="none"
                            value={usernameInput}
                            onChangeText={setUsernameInput}
                            editable={!userCooldownActive}
                          />
                          {userCooldownActive && (
                            <Text style={styles.cooldownWarningText}>
                              Terkunci: ganti lagi dalam {userRemainingDays} hari ({userUnlockDateStr})
                            </Text>
                          )}
                        </View>
                      </View>
                    );
                  })()}
                </View>
              </View>

              <View style={[styles.flexRow, { marginTop: 4 }]}>
                <View style={styles.flexCol}>
                  <View style={[styles.rowItem, styles.rowSeparatorFlex]}>
                    <Ionicons name="resize-outline" size={20} color="#4F46E5" style={styles.rowIcon} />
                    <View style={styles.infoCol}>
                      <Text style={styles.infoLabel}>Tinggi Badan (cm)</Text>
                      <TextInput
                        style={[styles.profileInputInline, isDarkMode && { color: '#F8FAFC', borderBottomColor: '#334155' }]}
                        placeholder="Contoh: 170 (Opsional)"
                        placeholderTextColor={isDarkMode ? '#64748B' : '#9CA3AF'}
                        keyboardType="numeric"
                        value={tinggiInput}
                        onChangeText={setTinggiInput}
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.flexCol}>
                  <View style={[styles.rowItem, styles.rowSeparatorFlex]}>
                    <Ionicons name="fitness-outline" size={20} color="#4F46E5" style={styles.rowIcon} />
                    <View style={styles.infoCol}>
                      <Text style={styles.infoLabel}>Berat Badan (kg)</Text>
                      <TextInput
                        style={[styles.profileInputInline, isDarkMode && { color: '#F8FAFC', borderBottomColor: '#334155' }]}
                        placeholder="Contoh: 60 (Opsional)"
                        placeholderTextColor={isDarkMode ? '#64748B' : '#9CA3AF'}
                        keyboardType="numeric"
                        value={beratInput}
                        onChangeText={setBeratInput}
                      />
                    </View>
                  </View>
                </View>
              </View>

              <View style={[styles.rowItem, styles.rowSeparator]}>
                <Ionicons name="calendar-outline" size={20} color="#4F46E5" style={styles.rowIcon} />
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Tanggal Lahir</Text>
                  <TouchableOpacity
                    style={styles.datePickerToggleBtn}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={[styles.datePickerToggleBtnText, isDarkMode && { color: '#F8FAFC' }]}>
                      {tglLahirInput ? tglLahirInput : 'Pilih Tanggal Lahir (Opsional)'}
                    </Text>
                    <Ionicons name="calendar" size={16} color="#4F46E5" />
                  </TouchableOpacity>

                  {showDatePicker && (
                    <DateTimePicker
                      value={dateValue}
                      mode="date"
                      display="default"
                      maximumDate={new Date()}
                      onChange={onDateChange}
                    />
                  )}
                </View>
              </View>

              <View style={[styles.rowItem, styles.rowSeparator]}>
                <Ionicons name="people-outline" size={20} color="#4F46E5" style={styles.rowIcon} />
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Jenis Kelamin</Text>
                  <View style={styles.genderRow}>
                    <TouchableOpacity
                      style={[styles.genderOptionBtn, jenisKelamin === 'Pria' && styles.genderOptionBtnActive]}
                      onPress={() => setJenisKelamin('Pria')}
                    >
                      <Ionicons name="male" size={14} color={jenisKelamin === 'Pria' ? '#FFFFFF' : '#475569'} style={{ marginRight: 4 }} />
                      <Text style={[styles.genderOptionText, jenisKelamin === 'Pria' && styles.genderOptionTextActive]}>Pria</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.genderOptionBtn, jenisKelamin === 'Wanita' && styles.genderOptionBtnActive]}
                      onPress={() => setJenisKelamin('Wanita')}
                    >
                      <Ionicons name="female" size={14} color={jenisKelamin === 'Wanita' ? '#FFFFFF' : '#475569'} style={{ marginRight: 4 }} />
                      <Text style={[styles.genderOptionText, jenisKelamin === 'Wanita' && styles.genderOptionTextActive]}>Wanita</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <TouchableOpacity style={styles.saveProfileBtn} onPress={handleUpdateProfile}>
                <Ionicons name="save-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.saveProfileBtnText}>Simpan Detail Akun</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.logoutButtonText}>Keluar dari Akun</Text>
            </TouchableOpacity>
          </View>
        ) : (

          <View>
            <View style={[styles.card, isDarkMode && { backgroundColor: '#1E293B' }]}>
              <Text style={[styles.cardTitle, isDarkMode && { color: '#F8FAFC' }]}>Silakan masuk</Text>
              <Text style={[styles.cardText, isDarkMode && { color: '#94A3B8' }]}>
                Masuk untuk menyimpan progres pertumbuhan, mengelola jadwal tidur, dan menyinkronkan data KMS anak Anda ke server.
              </Text>

              <View style={styles.authButtonRow}>
                <TouchableOpacity style={styles.buttonPrimary} onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.buttonSecondary, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#475569' }]} onPress={() => navigation.navigate('Register')}>
                  <Text style={[styles.buttonTextSecondary, isDarkMode && { color: '#60A5FA' }]}>Register</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
              <Ionicons name="logo-google" size={20} color="#FFFFFF" style={styles.googleIcon} />
              <Text style={styles.googleButtonText}>Login dengan Google</Text>
            </TouchableOpacity>
          </View>
        )}


        {user && (() => {

          if (!user.tanggal_lahir || !user.tinggi_badan || !user.berat_badan || !user.jenis_kelamin) {
            return (
              <View style={[styles.card, isDarkMode && { backgroundColor: '#1E293B' }, { borderLeftWidth: 5, borderLeftColor: '#6B7280', marginBottom: 40 }]}>
                <Text style={[styles.cardTitle, { color: '#0F172A' }, isDarkMode && { color: '#F8FAFC' }]}>Saran Gizi Pintar</Text>
                <Text style={[styles.suggestionDescText, isDarkMode && { color: '#94A3B8' }]}>
                  Silakan lengkapi dan simpan detail akun Anda (Tinggi Badan, Berat Badan, Tanggal Lahir, dan Jenis Kelamin) terlebih dahulu untuk memunculkan Saran Gizi Pintar dari AI.
                </Text>
              </View>
            );
          }

          const birthDate = new Date(user.tanggal_lahir);
          const today = new Date();
          let ageYears = today.getFullYear() - birthDate.getFullYear();
          let ageMonths = today.getMonth() - birthDate.getMonth();
          if (ageMonths < 0 || (ageMonths === 0 && today.getDate() < birthDate.getDate())) {
            ageYears--;
            ageMonths = 12 + ageMonths;
          }

          const ageStr = `${ageYears} Tahun ${ageMonths} Bulan`;
          const h = parseFloat(user.tinggi_badan) / 100;
          const w = parseFloat(user.berat_badan);

          let analysisTitle = "Analisis Berat & Tinggi Badan";
          let analysisColor = "#6B7280";
          let suggestionText = "";

          const imt = w / (h * h);
          let status = "";

          if (user.jenis_kelamin === 'Pria') {
            if (imt < 18.5) {
              status = "Kurus (Kurang Berat Badan Pria)";
              analysisColor = "#EF4444";
              suggestionText = `Di usia Anda (${ageStr}) sebagai Pria, IMT Anda (${imt.toFixed(1)}) tergolong Kurus. Pria disarankan menambah massa otot melalui asupan kalori surplus sehat (+300-500 kkal) dan latihan beban ringan.`;
            } else if (imt >= 18.5 && imt < 25) {
              status = "Normal (Berat Badan Pria Ideal)";
              analysisColor = "#10B981";
              suggestionText = `Luar biasa! Di usia Anda (${ageStr}) sebagai Pria, IMT Anda (${imt.toFixed(1)}) tergolong Normal/Ideal. Anda memiliki keseimbangan metabolisme yang optimal, pertahankan dengan asupan makro seimbang.`;
            } else if (imt >= 25 && imt < 30) {
              status = "Kelebihan Berat Badan (Overweight Pria)";
              analysisColor = "#F59E0B";
              suggestionText = `Di usia Anda (${ageStr}) sebagai Pria, IMT Anda (${imt.toFixed(1)}) masuk kategori Overweight. Kurangi penumpukan lemak visceral dengan membatasi junk food serta tingkatkan kardio mingguan.`;
            } else {
              status = "Obesitas Pria";
              analysisColor = "#EF4444";
              suggestionText = `Peringatan! Sebagai Pria di usia ${ageStr}, IMT Anda (${imt.toFixed(1)}) tergolong Obesitas. Disarankan untuk membatasi porsi karbohidrat olahan dan lakukan konsultasi berkala dengan ahli gizi.`;
            }
          } else {
            if (imt < 18) {
              status = "Kurus (Kurang Berat Badan Wanita)";
              analysisColor = "#EF4444";
              suggestionText = `Di usia Anda (${ageStr}) sebagai Wanita, IMT Anda (${imt.toFixed(1)}) tergolong Kurus. Wanita membutuhkan asupan lemak sehat (seperti alpukat, kacang-kacangan) demi menjaga keseimbangan hormon tubuh.`;
            } else if (imt >= 18 && imt < 24) {
              status = "Normal (Berat Badan Wanita Ideal)";
              analysisColor = "#10B981";
              suggestionText = `Luar biasa! Di usia Anda (${ageStr}) sebagai Wanita, IMT Anda (${imt.toFixed(1)}) tergolong Normal/Ideal. Persentase lemak tubuh Anda seimbang. Pertahankan dengan konsumsi serat dan kalsium yang cukup.`;
            } else if (imt >= 24 && imt < 29) {
              status = "Kelebihan Berat Badan (Overweight Wanita)";
              analysisColor = "#F59E0B";
              suggestionText = `Di usia Anda (${ageStr}) sebagai Wanita, IMT Anda (${imt.toFixed(1)}) masuk kategori Overweight. Disarankan untuk melakukan defisit kalori ringan (-200 kkal) dan rutin berjalan kaki/senam aerobik.`;
            } else {
              status = "Obesitas Wanita";
              analysisColor = "#EF4444";
              suggestionText = `Peringatan! Sebagai Wanita di usia ${ageStr}, IMT Anda (${imt.toFixed(1)}) tergolong Obesitas. Fokus pada pola makan rendah glikemik untuk kestabilan energi dan metabolisme tubuh.`;
            }
          }
          analysisTitle = `Status IMT: ${status}`;

          return (
            <View style={[styles.card, isDarkMode && { backgroundColor: '#1E293B' }, { borderLeftWidth: 5, borderLeftColor: analysisColor, marginBottom: 40 }]}>
              <Text style={[styles.cardTitle, { color: '#0F172A' }, isDarkMode && { color: '#F8FAFC' }]}>Saran Gizi Pintar</Text>
              <Text style={[styles.suggestionAgeLabel, isDarkMode && { color: '#94A3B8' }]}>Usia Anda saat ini: <Text style={{ fontWeight: '800', color: '#4F46E5' }}>{ageStr}</Text></Text>
              {jenisKelamin ? <Text style={[styles.suggestionAgeLabel, isDarkMode && { color: '#94A3B8' }]}>Jenis Kelamin: <Text style={{ fontWeight: '800', color: '#10B981' }}>{jenisKelamin}</Text></Text> : null}
              <Text style={[styles.suggestionStatusLabel, { color: analysisColor }]}>{analysisTitle}</Text>
              <Text style={[styles.suggestionDescText, isDarkMode && { color: '#94A3B8' }]}>{suggestionText}</Text>
            </View>
          );
        })()}

      </ScrollView>

      <LogoutConfirmModal
        visible={isLogoutConfirmVisible}
        onClose={() => setIsLogoutConfirmVisible(false)}
        onConfirm={handleConfirmLogout}
      />

      <LogoutSuccessModal
        visible={isLogoutSuccessVisible}
        onClose={() => setIsLogoutSuccessVisible(false)}
      />

      <MenuModal
        visible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
        title="Pengaturan & Menu"
        menus={profileMenus}
      />

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
    paddingBottom: 180,
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

  flexRow: {
    flexDirection: 'row',
    gap: 12,
  },
  flexCol: {
    flex: 1,
  },

  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  rowIcon: {
    marginRight: 14,
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
    paddingTop: 10,
    marginTop: 4,
  },

  rowSeparatorFlex: {
    borderTopWidth: 1.5,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
    marginTop: 0,
  },
  profileInputInline: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginTop: 2,
    padding: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 2,
  },
  profileInputDisabled: {
    opacity: 0.5,
    color: '#94A3B8',
    borderBottomColor: 'transparent',
  },
  cooldownWarningText: {
    fontSize: 10,
    color: '#EF4444',
    fontWeight: '700',
    marginTop: 4,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  suggestionAgeLabel: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 4,
    fontWeight: '500',
  },
  suggestionStatusLabel: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
  },
  suggestionDescText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  genderOptionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
  },
  genderOptionBtnActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  genderOptionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  genderOptionTextActive: {
    color: '#FFFFFF',
  },
  datePickerToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 6,
    marginTop: 2,
  },
  datePickerToggleBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  saveProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 16,
    shadowColor: '#4F46E5',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 4,
  },
  saveProfileBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
    fontFamily: 'Roboto',
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