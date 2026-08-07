import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AuthenticatedProfile({ onLogout }) {
  const [notifImunisasi, setNotifImunisasi] = useState(true);
  const [notifMakan, setNotifMakan] = useState(false);
  const [notifTidur, setNotifTidur] = useState(true);
  const [reminderSleep, setReminderSleep] = useState(true);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.headerBox}>
        <Text style={styles.headerTitle}>Profil</Text>
        <Text style={styles.headerSubtitle}>Akun terhubung. Semua pengaturan disimpan secara aman.</Text>
      </View>

      <View style={styles.cardRounded}>
        <Text style={styles.cardTitle}>Akun Aktif</Text>
        <Text style={styles.cardText}>Data akun tersimpan tanpa menampilkan nama langsung.</Text>
      </View>

      <Text style={styles.sectionTitle}>Pengaturan Notifikasi</Text>
      <View style={styles.cardRounded}>
        <View style={styles.itemRow}>
          <View style={styles.itemLabelRow}>
            <Ionicons name="notifications-outline" size={20} color="#1E3A8A" style={{ marginRight: 10 }} />
            <Text style={styles.itemLabel}>Pengingat Imunisasi</Text>
          </View>
          <Switch value={notifImunisasi} onValueChange={setNotifImunisasi} trackColor={{ false: '#E5E7EB', true: '#2563EB' }} />
        </View>
        <View style={[styles.itemRow, styles.itemDivider]}>
          <View style={styles.itemLabelRow}>
            <Ionicons name="restaurant-outline" size={20} color="#15803D" style={{ marginRight: 10 }} />
            <Text style={styles.itemLabel}>Pengingat Jam Makan</Text>
          </View>
          <Switch value={notifMakan} onValueChange={setNotifMakan} trackColor={{ false: '#E5E7EB', true: '#16A34A' }} />
        </View>
        <View style={[styles.itemRow, styles.itemDivider]}>
          <View style={styles.itemLabelRow}>
            <Ionicons name="moon-outline" size={20} color="#7C3AED" style={{ marginRight: 10 }} />
            <Text style={styles.itemLabel}>Pengingat Tidur</Text>
          </View>
          <Switch value={notifTidur} onValueChange={setNotifTidur} trackColor={{ false: '#E5E7EB', true: '#8B5CF6' }} />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Fitur Aktif</Text>
      <View style={styles.cardRounded}>        
        <View style={styles.featureRow}>
          <Ionicons name="calendar-outline" size={20} color="#0EA5E9" />
          <Text style={styles.featureLabel}>Riwayat Aktivitas</Text>
        </View>
        <View style={styles.featureRow}>
          <Ionicons name="clipboard-outline" size={20} color="#10B981" />
          <Text style={styles.featureLabel}>Catatan Kesehatan</Text>
        </View>
        <View style={styles.featureRow}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#6366F1" />
          <Text style={styles.featureLabel}>Keamanan Data</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Ionicons name="log-out-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
        <Text style={styles.logoutText}>Keluar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  headerBox: {
    backgroundColor: '#E0F2FE',
    padding: 20,
    borderRadius: 18,
    marginBottom: 18,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
    marginTop: 20,
  },
  cardRounded: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  cardText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  itemDivider: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  itemLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  featureLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
