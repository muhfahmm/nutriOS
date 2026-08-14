import React, { useState } from 'react';
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

export function LogoutConfirmModal({ visible, onClose, onConfirm }) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={[styles.iconContainer, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="log-out" size={32} color="#EF4444" />
          </View>
          <Text style={styles.modalTitle}>Keluar dari Akun?</Text>
          <Text style={styles.modalDesc}>
            Anda harus masuk kembali nanti untuk mensinkronkan data KMS dan jadwal tidur Anda.
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmRedBtn} onPress={onConfirm}>
              <Text style={styles.confirmBtnText}>Ya, Keluar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function LogoutSuccessModal({ visible, onClose }) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={[styles.iconContainer, { backgroundColor: '#ECFDF5' }]}>
            <Ionicons name="checkmark-circle" size={36} color="#10B981" />
          </View>
          <Text style={styles.modalTitle}>Berhasil Keluar</Text>
          <Text style={styles.modalDesc}>
            Sesi Anda telah berakhir. Anda sekarang menggunakan aplikasi dalam mode Tamu (Guest).
          </Text>

          <TouchableOpacity style={styles.primaryBtn} onPress={onClose}>
            <Text style={styles.primaryBtnText}>Selesai</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

import { TouchableWithoutFeedback } from 'react-native';

export function MenuModal({ visible, onClose, title, menus }) {
  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.bottomOverlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.sheetContent}>
              {}
              <View style={styles.dragIndicatorWrapper}>
                <View style={styles.dragIndicator} />
              </View>

              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>{title || 'Menu Opsi'}</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Ionicons name="close" size={24} color="#0F172A" />
                </TouchableOpacity>
              </View>

              <View style={styles.sheetBody}>
                {menus && menus.map((menu, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.menuItem,
                      index > 0 && styles.menuItemSeparator,
                      menu.style === 'destructive' && styles.menuItemDestructive
                    ]}
                    onPress={() => {
                      onClose();
                      if (menu.onPress) menu.onPress();
                    }}
                  >
                    <Ionicons
                      name={menu.icon || 'ellipse'}
                      size={20}
                      color={menu.style === 'destructive' ? '#EF4444' : '#4F46E5'}
                      style={{ marginRight: 12 }}
                    />
                    <Text style={[
                      styles.menuText,
                      menu.style === 'destructive' && styles.menuTextDestructive
                    ]}>
                      {menu.label}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

export function ChangePasswordModal({ visible, onClose, onSave, isSaving }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPass, setShowPass] = useState(false);

  const getPasswordStrength = (pass) => {
    if (!pass) return { text: '', color: '#94A3B8', width: '0%' };
    let score = 0;
    if (pass.length >= 4) score += 1;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;

    if (score <= 1) {
      return { text: 'Lemah ⚠️', color: '#EF4444', width: '33%' };
    } else if (score === 2) {
      return { text: 'Sedang ⚡', color: '#F59E0B', width: '66%' };
    } else {
      return { text: 'Sangat Kuat 💪', color: '#10B981', width: '100%' };
    }
  };

  const strength = getPasswordStrength(newPassword);

  const handleSubmit = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setErrorMsg('Harap isi semua kolom wajib.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Kata sandi baru tidak cocok.');
      return;
    }
    setErrorMsg('');
    onSave(oldPassword, newPassword, () => {

      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    }, (err) => {

      setErrorMsg(err || 'Gagal mengganti password.');
    });
  };

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.bottomOverlay}>
        <View style={styles.sheetContent}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Ganti Kata Sandi</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#0F172A" />
            </TouchableOpacity>
          </View>

          <View style={[styles.sheetBody, { paddingBottom: 20 }]}>
            {errorMsg ? (
              <View style={styles.errorAlert}>
                <Ionicons name="alert-circle-outline" size={18} color="#EF4444" style={{ marginRight: 6 }} />
                <Text style={styles.errorAlertText}>{errorMsg}</Text>
              </View>
            ) : null}

            <Text style={styles.inputLabel}>Kata Sandi Lama</Text>
            <TextInput
              style={styles.modalInput}
              secureTextEntry={!showPass}
              placeholder="Masukkan kata sandi saat ini"
              placeholderTextColor="#94A3B8"
              value={oldPassword}
              onChangeText={setOldPassword}
            />

            <Text style={styles.inputLabel}>Kata Sandi Baru</Text>
            <TextInput
              style={styles.modalInput}
              secureTextEntry={!showPass}
              placeholder="Masukkan kata sandi baru"
              placeholderTextColor="#94A3B8"
              value={newPassword}
              onChangeText={setNewPassword}
            />

            {}
            {newPassword.length > 0 && (
              <View style={styles.strengthWrap}>
                <Text style={styles.strengthLabel}>
                  Kekuatan Sandi: <Text style={{ color: strength.color, fontWeight: 'bold' }}>{strength.text}</Text>
                </Text>
                <View style={styles.strengthBarBg}>
                  <View style={[styles.strengthBar, { width: strength.width, backgroundColor: strength.color }]} />
                </View>
              </View>
            )}

            <Text style={styles.inputLabel}>Konfirmasi Kata Sandi Baru</Text>
            <TextInput
              style={styles.modalInput}
              secureTextEntry={!showPass}
              placeholder="Ulangi kata sandi baru"
              placeholderTextColor="#94A3B8"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <TouchableOpacity
              style={[styles.primaryBtn, { marginTop: 12 }]}
              onPress={handleSubmit}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryBtnText}>Perbarui Kata Sandi</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '850',
    color: '#0F172A',
    marginBottom: 8,
    fontFamily: 'Roboto',
  },
  modalDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    fontFamily: 'Roboto',
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#64748B',
    fontWeight: '700',
    fontSize: 14,
  },
  confirmRedBtn: {
    flex: 1,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  primaryBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: 'center',
    width: '100%',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },

  sheetContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: '100%',
    paddingBottom: Platform.OS === 'ios' ? 44 : 24,
  },
  dragIndicatorWrapper: {
    alignItems: 'center',
    paddingVertical: 10,
    width: '100%',
  },
  dragIndicator: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1.5,
    borderColor: '#F1F5F9',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Roboto',
  },
  closeBtn: {
    padding: 4,
  },
  sheetBody: {
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  menuItemSeparator: {
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
  },
  menuItemDestructive: {
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    flex: 1,
    fontFamily: 'Roboto',
  },
  menuTextDestructive: {
    color: '#EF4444',
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorAlertText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Roboto',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
    marginTop: 10,
    fontFamily: 'Roboto',
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 14,
    color: '#0F172A',
    fontFamily: 'Roboto',
  },
  strengthWrap: {
    marginTop: 6,
  },
  strengthLabel: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 4,
  },
  strengthBarBg: {
    height: 3,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthBar: {
    height: '100%',
    borderRadius: 2,
  },
});
