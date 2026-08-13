import React, { useState, useContext } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../AuthContext';
import { API_BASE_URL } from '../api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const { setUser } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage('Email dan password wajib diisi.');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      if (response.ok && result.user) {
        setUser(result.user);
        setMessage('Login berhasil.');
        setTimeout(() => {
          if (navigation) {
            navigation.replace('MainTabs');
          }
        }, 500);
      } else {
        setMessage(result.message || 'Email atau password salah.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage('Tidak dapat terhubung ke server autentikasi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.headerSection}>
          <View style={styles.iconWrapper}>
            <Ionicons name="shield-checkmark" size={48} color="#3B82F6" />
          </View>
          <Text style={styles.title}>Masuk</Text>
          <Text style={styles.subtitle}>Selamat datang kembali! Silakan masuk ke akun Anda.</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                placeholder="email@contoh.com"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
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

          {message ? <Text style={styles.message}>{message}</Text> : null}

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
        </View>

        <TouchableOpacity 
          style={styles.footer} 
          onPress={() => navigation && navigation.navigate('Register')}
        >
          <Text style={styles.footerText}>
            Belum punya akun? <Text style={styles.footerHighlight}>Daftar</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.footer, { marginTop: 12 }]} 
          onPress={() => {
            setUser(null); // Pastikan state diatur sebagai guest
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
    padding: 10,
    borderRadius: 8,
  },
});
