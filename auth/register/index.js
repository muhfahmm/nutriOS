import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../AuthContext';
import { API_BASE_URL, fetchWithTimeout } from '../api';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('error');
  const [isUsernameTaken, setIsUsernameTaken] = useState(false);
  const [isUsernameChecked, setIsUsernameChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const { isDarkMode } = useContext(AuthContext);

  useEffect(() => {
    if (!username) {
      setIsUsernameTaken(false);
      setIsUsernameChecked(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/api/check-username?username=${encodeURIComponent(username)}`, { timeout: 3000 });
        if (response.ok) {
          const data = await response.json();
          setIsUsernameTaken(data.taken);
          setIsUsernameChecked(true);
        }
      } catch (err) {
        console.log('Error checking username availability:', err);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [username]);

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, text: '', color: '#94A3B8', width: '0%', icon: null };
    let score = 0;
    if (pass.length >= 4) score += 1;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;

    if (score <= 1) {
      return { score, text: 'Lemah', color: '#EF4444', width: '33%', icon: 'alert-circle-outline' };
    } else if (score === 2) {
      return { score, text: 'Sedang', color: '#F59E0B', width: '66%', icon: 'flash-outline' };
    } else {
      return { score, text: 'Sangat Kuat', color: '#10B981', width: '100%', icon: 'checkmark-circle-outline' };
    }
  };

  const strength = getPasswordStrength(password);

  const handleRegister = async () => {

    if (!name || !email || !username || !password || !confirmPassword) {
      setMessageType('error');
      setMessage('Harap isi semua kolom wajib.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessageType('error');
      setMessage('Format email tidak valid.');
      return;
    }

    if (isUsernameTaken) {
      setMessageType('error');
      setMessage('Username sudah digunakan oleh user lain.');
      return;
    }

    if (password !== confirmPassword) {
      setMessageType('error');
      setMessage('Password dan konfirmasi tidak cocok.');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nama_lengkap: name,
          email,
          username,
          password,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setMessageType('success');
        setMessage('Registrasi berhasil! Silakan masuk.');

        setTimeout(() => {
          if (navigation) {
            navigation.navigate('Login');
          }
        }, 1500);
      } else {
        setMessageType('error');
        setMessage(result.message || 'Registrasi gagal.');
      }
    } catch (error) {
      setMessageType('error');
      setMessage('Tidak dapat terhubung ke server autentikasi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && { backgroundColor: '#0F172A' }]}>
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={[styles.backButton, isDarkMode && { backgroundColor: '#1E293B' }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={isDarkMode ? '#60A5FA' : '#2563EB'} />
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.headerSection}>
            <View style={styles.iconWrapper}>
              <Ionicons name="person-add" size={44} color="#3B82F6" />
            </View>
            <Text style={[styles.title, isDarkMode && { color: '#F8FAFC' }]}>Daftar Akun</Text>
            <Text style={[styles.subtitle, isDarkMode && { color: '#94A3B8' }]}>Buat akun baru untuk mulai menggunakan aplikasi.</Text>
          </View>

          <View style={[styles.form, isDarkMode && { backgroundColor: '#1E293B' }]}>
            {}
            <View style={styles.inputWrapper}>
              <Text style={[styles.label, isDarkMode && { color: '#CBD5E1' }]}>Nama Lengkap *</Text>
              <View style={[styles.inputContainer, isDarkMode && { backgroundColor: '#334155', borderColor: '#475569' }]}>
                <Ionicons name="person-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, isDarkMode && { color: '#F8FAFC' }]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Nama Lengkap"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {}
            <View style={styles.inputWrapper}>
              <Text style={[styles.label, isDarkMode && { color: '#CBD5E1' }]}>Email *</Text>
              <View style={[styles.inputContainer, isDarkMode && { backgroundColor: '#334155', borderColor: '#475569' }]}>
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, isDarkMode && { color: '#F8FAFC' }]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="example@email.com"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {}
            <View style={styles.inputWrapper}>
              <Text style={[styles.label, isDarkMode && { color: '#CBD5E1' }]}>Username *</Text>
              <View style={[
                styles.inputContainer,
                isDarkMode && { backgroundColor: '#334155', borderColor: '#475569' },
                isUsernameChecked && (isUsernameTaken ? styles.inputContainerError : styles.inputContainerSuccess)
              ]}>
                <Ionicons
                  name="at-outline"
                  size={20}
                  color={isUsernameChecked ? (isUsernameTaken ? '#EF4444' : '#10B981') : '#9CA3AF'}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, isDarkMode && { color: '#F8FAFC' }]}
                  autoCapitalize="none"
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Username kustom"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              {isUsernameChecked && (
                isUsernameTaken ? (
                  <View style={styles.feedbackRow}>
                    <Ionicons name="close-circle" size={16} color="#EF4444" />
                    <Text style={styles.takenWarningText}>Username telah digunakan</Text>
                  </View>
                ) : (
                  <View style={styles.feedbackRow}>
                    <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                    <Text style={styles.availableSuccessText}>Username tersedia</Text>
                  </View>
                )
              )}
            </View>

            {}
            <View style={styles.inputWrapper}>
              <Text style={[styles.label, isDarkMode && { color: '#CBD5E1' }]}>Password *</Text>
              <View style={[styles.inputContainer, isDarkMode && { backgroundColor: '#334155', borderColor: '#475569' }]}>
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, isDarkMode && { color: '#F8FAFC' }]}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Masukkan password"
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#9CA3AF"
                    style={{ padding: 4 }}
                  />
                </TouchableOpacity>
              </View>

              {password.length > 0 && (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthHeader}>
                    <Ionicons name={strength.icon} size={16} color={strength.color} style={{ marginRight: 4 }} />
                    <Text style={styles.strengthText}>Kekuatan Sandi: <Text style={{ fontWeight: 'bold', color: strength.color }}>{strength.text}</Text></Text>
                  </View>
                  <View style={styles.strengthBarBg}>
                    <View style={[styles.strengthBar, { width: strength.width, backgroundColor: strength.color }]} />
                  </View>
                </View>
              )}
            </View>

            {}
            <View style={styles.inputWrapper}>
              <Text style={[styles.label, isDarkMode && { color: '#CBD5E1' }]}>Konfirmasi Password *</Text>
              <View style={[styles.inputContainer, isDarkMode && { backgroundColor: '#334155', borderColor: '#475569' }]}>
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, isDarkMode && { color: '#F8FAFC' }]}
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Ulangi password"
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons
                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#9CA3AF"
                    style={{ padding: 4 }}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {}
            {message ? (
              <Text style={[styles.message, messageType === 'success' && styles.messageSuccess]}>
                {message}
              </Text>
            ) : null}

            {}
            <TouchableOpacity
              style={[styles.buttonPrimary, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Daftar</Text>
              )}
            </TouchableOpacity>
          </View>

          {}
          <TouchableOpacity
            style={styles.footer}
            onPress={() => navigation && navigation.navigate('Login')}
          >
            <Text style={[styles.footerText, isDarkMode && { color: '#94A3B8' }]}>
              Sudah punya akun? <Text style={styles.footerHighlight}>Masuk</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FF',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 40,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 4,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    height: '100%',
  },
  buttonPrimary: {
    backgroundColor: '#2563EB',
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#2563EB',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  footerHighlight: {
    color: '#2563EB',
    fontWeight: '700',
  },
  message: {
    color: '#DC2626',
    marginBottom: 14,
    fontSize: 13,
    textAlign: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
    borderWidth: 1.5,
    padding: 10,
    borderRadius: 8,
  },
  messageSuccess: {
    color: '#16A34A',
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  strengthContainer: {
    marginTop: 8,
    paddingHorizontal: 2,
  },
  strengthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  strengthText: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
  },
  strengthBarBg: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthBar: {
    height: '100%',
    borderRadius: 2,
  },
  inputContainerError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  inputContainerSuccess: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
    borderWidth: 2,
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginLeft: 2,
    gap: 4,
  },
  takenWarningText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Roboto',
  },
  availableSuccessText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Roboto',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  headerBar: {
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
});