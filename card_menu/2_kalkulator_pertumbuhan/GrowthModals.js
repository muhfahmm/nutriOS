import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function LoginPromptModal({ visible, onClose, onLogin }) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.promptContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed" size={36} color="#2563EB" />
          </View>
          <Text style={styles.promptTitle}>Masuk Akun Diperlukan</Text>
          <Text style={styles.promptDesc}>
            Untuk mengelola profil anak dan mencatat riwayat pertumbuhannya secara permanen di cloud, Anda harus masuk ke akun terlebih dahulu.
          </Text>

          <View style={styles.buttonColumn}>
            <TouchableOpacity style={styles.loginBtn} onPress={onLogin}>
              <Text style={styles.loginBtnText}>Masuk Sekarang</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Nanti Saja</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function AddChildModal({
  visible,
  onClose,
  childName,
  setChildName,
  childBirthDate,
  setChildBirthDate,
  childGender,
  setChildGender,
  onSave,
  isSaving
}) {
  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.sheetContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Tambah Profil Anak</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#0F172A" />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <Text style={styles.smallLabel}>Nama Lengkap Anak</Text>
            <TextInput
              style={styles.inputField}
              placeholder="Contoh: Budi Santoso"
              placeholderTextColor="#94A3B8"
              value={childName}
              onChangeText={setChildName}
            />

            <Text style={styles.smallLabel}>Tanggal Lahir (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.inputField}
              placeholder="Contoh: 2024-08-15"
              placeholderTextColor="#94A3B8"
              value={childBirthDate}
              onChangeText={setChildBirthDate}
            />

            <Text style={styles.smallLabel}>Jenis Kelamin</Text>
            <View style={styles.inlineButtonRow}>
              {['Laki-laki', 'Perempuan'].map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.inlineBtn, childGender === item && styles.inlineBtnActive]}
                  onPress={() => setChildGender(item)}
                >
                  <Text style={[styles.inlineBtnText, childGender === item && styles.inlineBtnTextActive]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, { marginTop: 12 }]}
              onPress={onSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.primaryButtonText}>Simpan Profil Anak</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },

  promptContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '90%',
    marginBottom: 'auto',
    marginTop: 'auto',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  promptTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
    fontFamily: 'Roboto',
  },
  promptDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    fontFamily: 'Roboto',
  },
  buttonColumn: {
    width: '100%',
    gap: 10,
  },
  loginBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
    fontFamily: 'Roboto',
  },
  cancelBtn: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: '#64748B',
    fontWeight: '700',
    fontSize: 14,
    fontFamily: 'Roboto',
  },

  sheetContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: '100%',
    paddingBottom: Platform.OS === 'ios' ? 44 : 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Roboto',
  },
  closeButton: {
    padding: 4,
  },
  body: {
    padding: 20,
  },
  smallLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
    fontFamily: 'Roboto',
  },
  inputField: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 14,
    fontFamily: 'Roboto',
  },
  inlineButtonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  inlineBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineBtnActive: {
    backgroundColor: '#2563EB',
  },
  inlineBtnText: {
    fontWeight: '700',
    color: '#64748B',
    fontSize: 14,
    fontFamily: 'Roboto',
  },
  inlineBtnTextActive: {
    color: '#FFFFFF',
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
    fontFamily: 'Roboto',
  },
});
