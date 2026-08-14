import React, { useState, useContext, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../AuthContext';
import { API_BASE_URL, fetchWithTimeout } from '../api';

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

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('error');
  const [loading, setLoading] = useState(false);

  const { setUser, isDarkMode } = useContext(AuthContext);

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

  const handleLogin = async () => {
    if (!username || !password) {
      setMessageType('error');
      setMessage('Username dan password wajib diisi.');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();
      if (response.ok && result.user) {
        setMessageType('success');
        setUser(result.user);
        setMessage('Login berhasil.');
        setTimeout(() => {
          if (navigation) {
            navigation.replace('MainTabs');
          }
        }, 500);
      } else {
        setMessageType('error');
        setMessage(result.message || 'Username atau password salah.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessageType('error');
      setMessage('Tidak dapat terhubung ke server autentikasi.');
    } finally {
      setLoading(false);
    }
  };

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
              setLoading(true);
              setMessage(null);
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
                  setMessageType('success');
                  setUser(result.user);
                  setMessage('Login Google Simulasi Berhasil.');
                  setTimeout(() => {
                    if (navigation) navigation.replace('MainTabs');
                  }, 500);
                } else {
                  setMessageType('error');
                  setMessage(result.message || 'Gagal sinkronisasi akun Google.');
                }
              } catch (error) {
                console.error('Google mock login error:', error);
                setMessageType('error');
                setMessage('Koneksi database/server gagal.');
              } finally {
                setLoading(false);
              }
            }
          }
        ]
      );
      return;
    }

    setLoading(true);
    setMessage(null);

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
        setMessageType('success');
        setUser(result.user);
        setMessage('Login Google Berhasil.');
        setTimeout(() => {
          if (navigation) navigation.replace('MainTabs');
        }, 500);
      } else {
        setMessageType('error');
        setMessage(result.message || 'Gagal sinkronisasi akun Google dengan server NutriOS.');
      }
    } catch (error) {
      console.error('Google login error:', error);
      setMessageType('error');
      setMessage('Gagal masuk dengan Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && { backgroundColor: '#0F172A' }]}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.headerSection}>
          <View style={styles.iconWrapper}>
            <Ionicons name="shield-checkmark" size={48} color="#3B82F6" />
          </View>
          <Text style={[styles.title, isDarkMode && { color: '#F8FAFC' }]}>Masuk</Text>
          <Text style={[styles.subtitle, isDarkMode && { color: '#94A3B8' }]}>Selamat datang kembali! Silakan masuk ke akun Anda.</Text>
        </View>

        <View style={[styles.form, isDarkMode && { backgroundColor: '#1E293B', shadowColor: '#000' }]}>
          <View style={styles.inputWrapper}>
            <Text style={[styles.label, isDarkMode && { color: '#CBD5E1' }]}>Username</Text>
            <View style={[styles.inputContainer, isDarkMode && { backgroundColor: '#334155', borderColor: '#475569' }]}>
              <Ionicons name="at-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, isDarkMode && { color: '#F8FAFC' }]}
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
                placeholder="Masukkan username"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={[styles.label, isDarkMode && { color: '#CBD5E1' }]}>Password</Text>
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
          </View>

          {message ? (
            <Text style={[styles.message, messageType === 'success' && styles.messageSuccess]}>
              {message}
            </Text>
          ) : null}

          <TouchableOpacity
            style={[styles.buttonPrimary, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Masuk</Text>
            )}
          </TouchableOpacity>

          {}
          <View style={styles.separatorContainer}>
            <View style={styles.separatorLine} />
          <Text style={[styles.separatorText, isDarkMode && { color: '#64748B' }]}>atau masuk dengan</Text>
            <View style={styles.separatorLine} />
          </View>

          <TouchableOpacity
            style={[styles.googleBtn, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#475569' }]}
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            <Ionicons name="logo-google" size={20} color="#EA4335" style={{ marginRight: 10 }} />
            <Text style={[styles.googleBtnText, isDarkMode && { color: '#F8FAFC' }]}>Google</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.footer}
          onPress={() => navigation && navigation.navigate('Register')}
        >
          <Text style={[styles.footerText, isDarkMode && { color: '#94A3B8' }]}>
            Belum punya akun? <Text style={styles.footerHighlight}>Daftar</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.footer, { marginTop: 12 }]}
          onPress={() => {
            setUser(null);
            if (navigation) navigation.replace('MainTabs');
          }}
        >
          <Text style={[styles.footerHighlight, { color: '#10B981', fontWeight: '700' }]}>
            Masuk sebagai Tamu (Guest)
          </Text>
        </TouchableOpacity>
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
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 30,
    justifyContent: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 30,
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
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    height: 52,
    borderRadius: 12,
    marginTop: 14,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 2,
  },
  googleBtnText: {
    color: '#1F2937',
    fontWeight: '700',
    fontSize: 15,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  separatorText: {
    marginHorizontal: 12,
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '600',
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
});
