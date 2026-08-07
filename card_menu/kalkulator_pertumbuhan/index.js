import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function KalkulatorPertumbuhanScreen() {
  // --- STATE MOCK (Untuk Demo Interaktif) ---
  const [selectedChild, setSelectedChild] = useState('Budi (24 Bulan)');
  const [gender, setGender] = useState('Laki-laki');
  const [position, setPosition] = useState('Berdiri');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [isCalculated, setIsCalculated] = useState(false);

  // Mock Data Riwayat Anak
  const [history, setHistory] = useState([
    { date: '10 Mei 2026', weight: '10.2 kg', height: '82.5 cm' },
    { date: '10 Apr 2026', weight: '9.8 kg', height: '81.0 cm' },
    { date: '10 Mar 2026', weight: '9.5 kg', height: '79.5 cm' },
  ]);

  // --- SIMULASI LOGIKA PERHITUNGAN Z-SCORE (MOCK) ---
  // Saat tombol ditekan, kita simulasi hasil perhitungan muncul
  const mockResult = {
    stunting: { status: 'Normal', color: '#10B981', text: '🟢 Normal' },
    gizi: { status: 'Gizi Baik', color: '#10B981' },
    zScore: '-0.8 SD',
  };

  const handleCalculate = () => {
    if (!weight || !height) {
      alert('Harap masukkan Berat Badan dan Tinggi Badan terlebih dahulu!');
      return;
    }
    setIsCalculated(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Kalkulator Pertumbuhan</Text>
          <Text style={styles.subtitle}>Pantau Z-Score anak, deteksi stunting, dan cetak KMS Digital.</Text>
        </View>

        {/* 1. FORM INPUT DATA FISIK ANAK */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Data Fisik Anak</Text>
          
          {/* Profil Anak */}
          <TouchableOpacity style={styles.rowSelector}>
            <View style={styles.rowIconText}>
              <Ionicons name="people-outline" size={20} color="#4B5563" style={{ marginRight: 10 }} />
              <Text style={styles.inputLabel}>Anak Terpilih</Text>
            </View>
            <View style={styles.rowValue}>
              <Text style={styles.rowValueText}>{selectedChild}</Text>
              <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
            </View>
          </TouchableOpacity>

          {/* Usia Otomatis */}
          <View style={styles.rowSelector}>
            <View style={styles.rowIconText}>
              <Ionicons name="calendar-outline" size={20} color="#4B5563" style={{ marginRight: 10 }} />
              <Text style={styles.inputLabel}>Usia saat ini</Text>
            </View>
            <View style={styles.rowValue}>
              <Text style={styles.rowValueText}>24 Bulan (Lahir: 15 Jan 2024)</Text>
            </View>
          </View>

          {/* Jenis Kelamin */}
          <Text style={styles.smallLabel}>Jenis Kelamin</Text>
          <View style={styles.inlineButtonRow}>
            {['Laki-laki', 'Perempuan'].map((item) => (
              <TouchableOpacity 
                key={item} 
                style={[styles.inlineBtn, gender === item && styles.inlineBtnActive]}
                onPress={() => setGender(item)}
              >
                <Text style={[styles.inlineBtnText, gender === item && styles.inlineBtnTextActive]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Berat & Tinggi Badan */}
          <View style={styles.rowInputGroup}>
            <View style={styles.inputWrapper}>
              <Text style={styles.smallLabel}>Berat Badan (kg)</Text>
              <TextInput
                style={styles.inputNumeric}
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
                placeholder="10.5"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.smallLabel}>Tinggi Badan (cm)</Text>
              <TextInput
                style={styles.inputNumeric}
                keyboardType="numeric"
                value={height}
                onChangeText={setHeight}
                placeholder="75.0"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Posisi Pengukuran */}
          <Text style={[styles.smallLabel, { marginTop: 4 }]}>Posisi Pengukuran</Text>
          <View style={styles.inlineButtonRow}>
            {['Telentang (< 2 thn)', 'Berdiri (≥ 2 thn)'].map((item) => (
              <TouchableOpacity 
                key={item} 
                style={[styles.inlineBtn, position === item && styles.inlineBtnActive, { flex: 1 }]}
                onPress={() => setPosition(item)}
              >
                <Text style={[styles.inlineBtnText, position === item && styles.inlineBtnTextActive, { fontSize: 12 }]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tombol Hitung */}
          <TouchableOpacity style={styles.primaryButton} onPress={handleCalculate}>
            <Text style={styles.primaryButtonText}>Hitung Z-Score & Analisis</Text>
          </TouchableOpacity>
        </View>

        {/* 2. CARD HASIL KALKULASI & INDIKATOR VISUAL */}
        {isCalculated && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Hasil Z-Score WHO</Text>
            
            {/* TB/U (Stunting) */}
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Tinggi Menurut Umur (TB/U):</Text>
              <View style={styles.resultStatusRow}>
                <View style={[styles.statusBadge, { backgroundColor: mockResult.stunting.color + '20' }]}>
                  <View style={[styles.statusDot, { backgroundColor: mockResult.stunting.color }]} />
                  <Text style={[styles.statusText, { color: mockResult.stunting.color, fontWeight: '700' }]}>
                    {mockResult.stunting.text}
                  </Text>
                </View>
              </View>
            </View>

            {/* BB/TB (Gizi) */}
            <View style={[styles.resultItem, { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 14 }]}>
              <Text style={styles.resultLabel}>Berat Menurut Tinggi (BB/TB):</Text>
              <View style={styles.resultStatusRow}>
                <View style={[styles.statusBadge, { backgroundColor: mockResult.gizi.color + '20' }]}>
                  <View style={[styles.statusDot, { backgroundColor: mockResult.gizi.color }]} />
                  <Text style={[styles.statusText, { color: mockResult.gizi.color, fontWeight: '700' }]}>
                    {mockResult.gizi.status}
                  </Text>
                </View>
              </View>
            </View>

            {/* Ringkasan Skor */}
            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>Nilai Z-Score Spesifik</Text>
              <Text style={styles.scoreValue}>{mockResult.zScore}</Text>
              <Text style={styles.scoreNote}>Normal mendekati batas bawah. Pertahankan asupan gizi.</Text>
            </View>
          </View>
        )}

        {/* 3. GRAFIK PERTUMBUHAN INTERAKTIF (WHO GROWTH CHART) */}
        {isCalculated && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Grafik Pertumbuhan</Text>
            <Text style={styles.subCardTitle}>Kurva Standar WHO (TB/U - 24 Bulan)</Text>

            {/* Pita Warna -3 SD ke +3 SD */}
            <View style={styles.chartContainer}>
              <View style={styles.chartBand}>
                <View style={[styles.bandSegment, { flex: 1, backgroundColor: '#FCA5A5' }]} />
                <View style={[styles.bandSegment, { flex: 1.5, backgroundColor: '#FDE047' }]} />
                <View style={[styles.bandSegment, { flex: 3, backgroundColor: '#86EFAC' }]} />
                <View style={[styles.bandSegment, { flex: 1.5, backgroundColor: '#FDE047' }]} />
                <View style={[styles.bandSegment, { flex: 1, backgroundColor: '#93C5FD' }]} />
              </View>
              <View style={styles.chartLabels}>
                <Text style={styles.chartLabelText}>-3 SD</Text>
                <Text style={styles.chartLabelText}>-2 SD</Text>
                <Text style={styles.chartLabelText}>Median</Text>
                <Text style={styles.chartLabelText}>+2 SD</Text>
                <Text style={styles.chartLabelText}>+3 SD</Text>
              </View>
              
              {/* Plot Titik Anak (Mock posisi di antara -1 SD dan Median) */}
              <View style={styles.plotPointWrapper}>
                <View style={[styles.plotPoint, { left: '60%' }]}>
                  <Text style={styles.plotEmoji}>👶</Text>
                </View>
              </View>
            </View>

            {/* Catatan Trend */}
            <Text style={styles.chartTrendNote}>📈 Tren 3 bulan terakhir: Naik stabil (Normal).</Text>
          </View>
        )}

        {/* 4. REKOMENDASI & TINDAKAN OTOMATIS */}
        {isCalculated && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Rekomendasi & Tindakan</Text>
            
            <TouchableOpacity style={styles.actionRow}>
              <View style={styles.actionIconWrap}>
                <Ionicons name="restaurant-outline" size={22} color="#2563EB" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Saran Nutrisi Lokal</Text>
                <Text style={styles.actionDesc}>Lihat rekomendasi makanan tinggi protein hewani & sayur murah.</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={[styles.actionRow, { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 14, marginTop: 14 }]}>
              <View style={styles.actionIconWrap}>
                <Ionicons name="medical-outline" size={22} color="#EF5350" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Rujukan Kesehatan</Text>
                <Text style={styles.actionDesc}>Konsultasi ke Posyandu jika grafik turun 2 bulan berturut-turut.</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
          </View>
        )}

        {/* 5. RIWAYAT CATATAN & CETAK KARTU MENUJU SEHAT (KMS DIGITAL) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Riwayat Bulanan & KMS</Text>
          <Text style={styles.subCardTitle}>Data pengukuran 3 bulan terakhir</Text>
          
          {/* Tabel Riwayat */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Tanggal</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Berat</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Tinggi</Text>
          </View>
          {history.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableRowText, { flex: 1.5 }]}>{item.date}</Text>
              <Text style={[styles.tableRowText, { flex: 1, textAlign: 'center' }]}>{item.weight}</Text>
              <Text style={[styles.tableRowText, { flex: 1, textAlign: 'center' }]}>{item.height}</Text>
            </View>
          ))}

          {/* Tombol Cetak KMS */}
          <TouchableOpacity style={styles.pdfButton}>
            <Ionicons name="download-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.pdfButtonText}>Unduh KMS (PDF) - Siap Cetak</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
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
    paddingTop: 10, // Memberikan batas atas yang aman
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
    marginTop: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 14,
  },
  subCardTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },

  // --- 1. FORM INPUT ---
  rowSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  rowIconText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  rowValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowValueText: {
    fontSize: 14,
    color: '#111827',
    marginRight: 6,
  },
  smallLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inlineButtonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  inlineBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineBtnActive: {
    backgroundColor: '#2563EB',
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  inlineBtnText: {
    fontWeight: '600',
    color: '#6B7280',
    fontSize: 14,
  },
  inlineBtnTextActive: {
    color: '#FFFFFF',
  },
  rowInputGroup: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  inputWrapper: {
    flex: 1,
  },
  inputNumeric: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#2563EB',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },

  // --- 2. HASIL KALKULASI ---
  resultItem: {
    marginBottom: 8,
  },
  resultLabel: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 6,
  },
  resultStatusRow: {
    flexDirection: 'row',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
  },
  scoreBox: {
    backgroundColor: '#EFF6FF',
    padding: 14,
    borderRadius: 14,
    marginTop: 4,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2563EB',
  },
  scoreNote: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 4,
    textAlign: 'center',
  },

  // --- 3. GRAFIK ---
  chartContainer: {
    marginTop: 4,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  chartBand: {
    flexDirection: 'row',
    height: 32,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 4,
  },
  bandSegment: {
    height: '100%',
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  chartLabelText: {
    fontSize: 10,
    color: '#6B7280',
  },
  plotPointWrapper: {
    position: 'relative',
    height: 0,
  },
  plotPoint: {
    position: 'absolute',
    top: -16, // Dinaikkan dari garis batas
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  plotEmoji: {
    fontSize: 20,
  },
  chartTrendNote: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 10,
  },

  // --- 4. REKOMENDASI ---
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  actionDesc: {
    fontSize: 13,
    color: '#6B7280',
  },

  // --- 5. RIWAYAT & KMS ---
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 6,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tableRowText: {
    fontSize: 14,
    color: '#374151',
  },
  pdfButton: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
  },
  pdfButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});