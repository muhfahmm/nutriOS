import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function SuccessModal({ visible, onClose, message, sleepTime, wakeTime, duration, ageGroup }) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Success Icon Badge */}
          <View style={styles.iconContainer}>
            <Ionicons name="checkmark-circle" size={80} color="#10B981" />
          </View>

          <Text style={styles.modalTitle}>Berhasil Disimpan!</Text>
          <Text style={styles.modalMessage}>{message || 'Target tidur harian Anda telah sukses disimpan ke database.'}</Text>

          {/* Details Table */}
          <View style={styles.tableContainer}>
            <View style={styles.tableRow}>
              <View style={styles.tableCell}>
                <Ionicons name="moon-outline" size={16} color="#3B82F6" />
                <Text style={styles.cellLabel}> Jam Tidur</Text>
              </View>
              <Text style={styles.cellValue}>{sleepTime} WIB</Text>
            </View>

            <View style={styles.tableRow}>
              <View style={styles.tableCell}>
                <Ionicons name="sunny-outline" size={16} color="#F59E0B" />
                <Text style={styles.cellLabel}> Jam Bangun</Text>
              </View>
              <Text style={styles.cellValue}>{wakeTime} WIB</Text>
            </View>

            <View style={styles.tableRow}>
              <View style={styles.tableCell}>
                <Ionicons name="time-outline" size={16} color="#10B981" />
                <Text style={styles.cellLabel}> Durasi</Text>
              </View>
              <Text style={styles.cellValue}>{duration} Jam</Text>
            </View>

            <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
              <View style={styles.tableCell}>
                <Ionicons name="people-outline" size={16} color="#8B5CF6" />
                <Text style={styles.cellLabel}> Kelompok Usia</Text>
              </View>
              <Text style={styles.cellValue}>{ageGroup}</Text>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity style={styles.button} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Oke, Mengerti</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)', // Glassmorphism-like dim dark backdrop
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: width > 400 ? 360 : '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'Roboto',
  },
  modalMessage: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
    fontFamily: 'Roboto',
  },
  tableContainer: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tableCell: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cellLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
    fontFamily: 'Roboto',
  },
  cellValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: 'Roboto',
  },
  button: {
    width: '100%',
    backgroundColor: '#10B981',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Roboto',
  },
});
