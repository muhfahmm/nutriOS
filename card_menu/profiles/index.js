import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, TextInput, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../auth/AuthContext';
import { logoutUser } from '../../auth/logout';
import { LogoutConfirmModal, LogoutSuccessModal, MenuModal, ChangePasswordModal } from '../../auth/AuthModals';
import { API_BASE_URL } from '../../auth/api';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen({ navigation }) {
  const { user, setUser } = useContext(AuthContext);
  const [isLogoutConfirmVisible, setIsLogoutConfirmVisible] = useState(false);
  const [isLogoutSuccessVisible, setIsLogoutSuccessVisible] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isChangePasswordVisible, setIsChangePasswordVisible] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // State untuk form detail tubuh & data akun
  const [namaLengkapInput, setNamaLengkapInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [fotoProfilUri, setFotoProfilUri] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState('');

  const [tinggiInput, setTinggiInput] = useState('');
  const [beratInput, setBeratInput] = useState('');
  const [tglLahirInput, setTglLahirInput] = useState('');
  const [dateValue, setDateValue] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Sinkronkan state input saat data user dimuat
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

  // Fungsi mengambil/mengunggah foto profil dari galeri HP
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
      base64: true, // Ubah ke base64 agar dapat ditransfer lewat query string
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
        Alert.alert('Gagal', result.message || 'Gagal memperbarui profil.');
      }
    } catch (e) {
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
                  <TextInput
                    style={styles.profileInputInline}
                    placeholder="Masukkan nama lengkap"
                    value={namaLengkapInput}
                    onChangeText={setNamaLengkapInput}
                  />
                </View>
              </View>

              <View style={[styles.rowItem, styles.rowSeparator]}>
                <Ionicons name="at-outline" size={20} color="#4F46E5" style={styles.rowIcon} />
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Username</Text>
                  <TextInput
                    style={styles.profileInputInline}
                    placeholder="Masukkan username"
                    autoCapitalize="none"
                    value={usernameInput}
                    onChangeText={setUsernameInput}
                  />
                </View>
              </View>

              <View style={[styles.rowItem, styles.rowSeparator]}>
                <Ionicons name="resize-outline" size={20} color="#4F46E5" style={styles.rowIcon} />
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Tinggi Badan (cm)</Text>
                  <TextInput
                    style={styles.profileInputInline}
                    placeholder="Contoh: 170 (Opsional)"
                    keyboardType="numeric"
                    value={tinggiInput}
                    onChangeText={setTinggiInput}
                  />
                </View>
              </View>

              <View style={[styles.rowItem, styles.rowSeparator]}>
                <Ionicons name="fitness-outline" size={20} color="#4F46E5" style={styles.rowIcon} />
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Berat Badan (kg)</Text>
                  <TextInput
                    style={styles.profileInputInline}
                    placeholder="Contoh: 60 (Opsional)"
                    keyboardType="numeric"
                    value={beratInput}
                    onChangeText={setBeratInput}
                  />
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
                    <Text style={styles.datePickerToggleBtnText}>
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

              {/* Pemilih Jenis Kelamin (Gender) */}
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

              {/* Tombol Simpan Perubahan Profil */}
              <TouchableOpacity style={styles.saveProfileBtn} onPress={handleUpdateProfile}>
                <Ionicons name="save-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.saveProfileBtnText}>Simpan Detail Akun</Text>
              </TouchableOpacity>
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

        {/* --- USIA & SARAN GIZI PINTAR --- */}
        {user && (() => {
          // Hitung Usia Dinamis
          if (!tglLahirInput) return null;
          const birthDate = new Date(tglLahirInput);
          const today = new Date();
          let ageYears = today.getFullYear() - birthDate.getFullYear();
          let ageMonths = today.getMonth() - birthDate.getMonth();
          if (ageMonths < 0 || (ageMonths === 0 && today.getDate() < birthDate.getDate())) {
            ageYears--;
            ageMonths = 12 + ageMonths;
          }
          
          const ageStr = `${ageYears} Tahun ${ageMonths} Bulan`;
          const h = parseFloat(tinggiInput) / 100; // in meter
          const w = parseFloat(beratInput);

          let analysisTitle = "Analisis Berat & Tinggi Badan";
          let analysisColor = "#6B7280";
          let suggestionText = "Masukkan Tinggi Badan (TB), Berat Badan (BB), dan Jenis Kelamin Anda untuk mendapatkan saran gizi personal.";

          if (h > 0 && w > 0 && jenisKelamin) {
            const imt = w / (h * h);
            let status = "";
            
            // Evaluasi dengan memperhitungkan gender secara biologis
            if (jenisKelamin === 'Pria') {
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
            } else { // Wanita
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
          }

          return (
            <View style={[styles.card, { borderLeftWidth: 5, borderLeftColor: analysisColor }]}>
              <Text style={[styles.cardTitle, { color: '#0F172A' }]}>Saran Gizi Pintar</Text>
              <Text style={styles.suggestionAgeLabel}>Usia Anda saat ini: <Text style={{ fontWeight: '800', color: '#4F46E5' }}>{ageStr}</Text></Text>
              {jenisKelamin ? <Text style={styles.suggestionAgeLabel}>Jenis Kelamin: <Text style={{ fontWeight: '800', color: '#10B981' }}>{jenisKelamin}</Text></Text> : null}
              <Text style={[styles.suggestionStatusLabel, { color: analysisColor }]}>{analysisTitle}</Text>
              <Text style={styles.suggestionDescText}>{suggestionText}</Text>
            </View>
          );
        })()}

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
