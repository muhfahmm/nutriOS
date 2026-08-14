import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../auth/AuthContext';
import { API_BASE_URL } from '../../auth/api';
import { LoginPromptModal, AddChildModal } from './GrowthModals';
import { getAISuggestions, classifyUserIMT } from './suggestion_AI';
import GeminiConsultantModal from '../../components/GeminiConsultantModal';

const { width: screenWidth } = Dimensions.get('window');

export default function KalkulatorPertumbuhanScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const userId = user?.id || null;

  const [userWeight, setUserWeight] = useState('');
  const [userHeight, setUserHeight] = useState('');
  const [userAge, setUserAge] = useState('');
  const [userGender, setUserGender] = useState('Laki-laki');
  const [userImtResult, setUserImtResult] = useState(null);
  const [isUserCalculated, setIsUserCalculated] = useState(false);
  const [userHistory, setUserHistory] = useState([]);
  const [isLoadingUserHistory, setIsLoadingUserHistory] = useState(false);
  const [isAiModalVisible, setIsAiModalVisible] = useState(false);
  const [aiContext, setAiContext] = useState(null);

  const [children, setChildren] = useState([]);
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);
  const [isAddChildVisible, setIsAddChildVisible] = useState(false);
  const [isLoginPromptVisible, setIsLoginPromptVisible] = useState(false);

  const [childName, setChildName] = useState('');
  const [childBirthDate, setChildBirthDate] = useState('');
  const [childGender, setChildGender] = useState('Laki-laki');
  const [isSavingChild, setIsSavingChild] = useState(false);

  const [selectedAnak, setSelectedAnak] = useState(null);
  const [isAnakDetailVisible, setIsAnakDetailVisible] = useState(false);
  const [anakHistory, setAnakHistory] = useState([]);
  const [isLoadingAnakHistory, setIsLoadingAnakHistory] = useState(false);

  const [newAnakWeight, setNewAnakWeight] = useState('');
  const [newAnakHeight, setNewAnakHeight] = useState('');
  const [isSavingAnakRecord, setIsSavingAnakRecord] = useState(false);

  useEffect(() => {
    fetchUserHistory();
    fetchChildren();
  }, [userId]);

  const fetchUserHistory = async () => {
    if (!userId) return;
    setIsLoadingUserHistory(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/pertumbuhan-user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserHistory(data);
      }
    } catch (e) {
      console.log('Error fetchUserHistory:', e);
    } finally {
      setIsLoadingUserHistory(false);
    }
  };

  const handleCalculateUserImt = async () => {
    const weightNum = parseFloat(userWeight);
    const heightNum = parseFloat(userHeight);
    const ageNum = parseInt(userAge);

    if (!weightNum || !heightNum || !ageNum) {
      Alert.alert('Gagal', 'Harap masukkan Berat Badan, Tinggi Badan, dan Usia Anda!');
      return;
    }

    const newResult = classifyUserIMT(weightNum, heightNum, ageNum, userGender);

    setUserImtResult(newResult);
    setIsUserCalculated(true);

    if (userId) {
      try {
        await fetch(`${API_BASE_URL}/api/pertumbuhan-user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            berat_badan: weightNum,
            tinggi_badan: heightNum,
            umur_tahun: ageNum,
            imt: newResult.imt,
            status_imt: newResult.status
          })
        });
        fetchUserHistory();
      } catch (err) {
        console.log('Error save user growth:', err);
      }
    }
  };

  const fetchChildren = async () => {
    if (!userId) return;
    setIsLoadingChildren(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/anak/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setChildren(data);
      }
    } catch (e) {
      console.log('Error fetchChildren:', e);
    } finally {
      setIsLoadingChildren(false);
    }
  };

  const handleAddChild = async () => {
    if (!childName) {
      Alert.alert('Gagal', 'Nama anak wajib diisi!');
      return;
    }

    if (!userId) {
      Alert.alert('Perhatian', 'Silakan login terlebih dahulu untuk menyimpan data anak ke cloud.');
      return;
    }

    setIsSavingChild(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/anak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          nama_anak: childName,
          tanggal_lahir: childBirthDate || null,
          jenis_kelamin: childGender,
          status_z_score: 'Normal'
        })
      });

      if (response.ok) {
        Alert.alert('Sukses', 'Profil anak berhasil ditambahkan!');
        setChildName('');
        setChildBirthDate('');
        setIsAddChildVisible(false);
        fetchChildren();
      } else {
        Alert.alert('Gagal', 'Gagal menambahkan profil anak.');
      }
    } catch (err) {
      Alert.alert('Error', 'Koneksi API gagal.');
    } finally {
      setIsSavingChild(false);
    }
  };

  const handleDeleteChild = (id, name) => {
    Alert.alert(
      'Hapus Profil',
      `Apakah Anda yakin ingin menghapus profil anak "${name}" beserta seluruh riwayat pertumbuhannya?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/api/anak/${id}`, { method: 'DELETE' });
              if (response.ok) {
                Alert.alert('Sukses', 'Profil anak berhasil dihapus.');
                setIsAnakDetailVisible(false);
                setSelectedAnak(null);
                fetchChildren();
              }
            } catch (e) {
              Alert.alert('Error', 'Gagal menghapus data anak.');
            }
          }
        }
      ]
    );
  };

  const handleOpenAnakDetail = async (anak) => {
    setSelectedAnak(anak);
    setIsAnakDetailVisible(true);
    setIsLoadingAnakHistory(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/pertumbuhan-anak/${anak.id}`);
      if (response.ok) {
        const data = await response.json();
        setAnakHistory(data);
      }
    } catch (e) {
      console.log('Error fetchAnakHistory:', e);
    } finally {
      setIsLoadingAnakHistory(false);
    }
  };

  const calculateAgeInMonths = (birthDateStr) => {
    if (!birthDateStr) return 0;
    const birth = new Date(birthDateStr);
    const now = new Date();
    return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  };

  const handleAddAnakRecord = async () => {
    const weightNum = parseFloat(newAnakWeight);
    const heightNum = parseFloat(newAnakHeight);

    if (!weightNum || !heightNum) {
      Alert.alert('Gagal', 'Harap masukkan Berat Badan dan Tinggi Badan anak!');
      return;
    }

    setIsSavingAnakRecord(true);
    try {
      const ageMonths = calculateAgeInMonths(selectedAnak.tanggal_lahir);

      let statusGizi = 'Normal';

      if (weightNum < (ageMonths * 0.3 + 3.0)) {
        statusGizi = 'Gizi Kurang ⚠️';
      } else if (weightNum > (ageMonths * 0.6 + 6.0)) {
        statusGizi = 'Gizi Lebih ⚠️';
      }

      const response = await fetch(`${API_BASE_URL}/api/pertumbuhan-anak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anakId: selectedAnak.id,
          berat_badan: weightNum,
          tinggi_badan: heightNum,
          umur_bulan: ageMonths,
          status_gizi: statusGizi
        })
      });

      if (response.ok) {
        Alert.alert('Sukses', 'Riwayat pertumbuhan anak berhasil disimpan.');
        setNewAnakWeight('');
        setNewAnakHeight('');

        const refreshedAnak = { ...selectedAnak, status_z_score: statusGizi };
        setSelectedAnak(refreshedAnak);
        handleOpenAnakDetail(refreshedAnak);
        fetchChildren();
      } else {
        Alert.alert('Gagal', 'Gagal menyimpan riwayat pertumbuhan anak.');
      }
    } catch (err) {
      Alert.alert('Error', 'Gagal menyimpan data.');
    } finally {
      setIsSavingAnakRecord(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {}
        <View style={styles.headerRow}>
          <View style={styles.header}>
            <Text style={styles.title}>Kalkulator Gizi & IMT</Text>
            <Text style={styles.subtitle}>Ukur Indeks Massa Tubuh (IMT) Anda dan kelola catatan tumbuh kembang buah hati.</Text>
          </View>
          <TouchableOpacity style={styles.headerSparklesBtn} onPress={() => {
            setAiContext({ type: 'calculator', user });
            setIsAiModalVisible(true);
          }}>
            <Ionicons name="sparkles" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>

        {}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Kalkulator IMT Orang Tua</Text>

          {}
          <Text style={styles.smallLabel}>Jenis Kelamin</Text>
          <View style={styles.inlineButtonRow}>
            {['Laki-laki', 'Perempuan'].map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.inlineBtn, userGender === item && styles.inlineBtnActive]}
                onPress={() => setUserGender(item)}
              >
                <Text style={[styles.inlineBtnText, userGender === item && styles.inlineBtnTextActive]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {}
          <View style={styles.rowInputGroup}>
            <View style={styles.inputWrapper}>
              <Text style={styles.smallLabel}>BB (kg)</Text>
              <TextInput
                style={styles.inputNumeric}
                keyboardType="numeric"
                value={userWeight}
                onChangeText={setUserWeight}
                placeholder="60.5"
                placeholderTextColor="#94A3B8"
              />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.smallLabel}>TB (cm)</Text>
              <TextInput
                style={styles.inputNumeric}
                keyboardType="numeric"
                value={userHeight}
                onChangeText={setUserHeight}
                placeholder="165"
                placeholderTextColor="#94A3B8"
              />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.smallLabel}>Usia (Thn)</Text>
              <TextInput
                style={styles.inputNumeric}
                keyboardType="numeric"
                value={userAge}
                onChangeText={setUserAge}
                placeholder="25"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          {}
          <TouchableOpacity style={styles.primaryButton} onPress={handleCalculateUserImt}>
            <Ionicons name="calculator-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.primaryButtonText}>Hitung IMT Saya</Text>
          </TouchableOpacity>
        </View>

        {}
        {isUserCalculated && userImtResult && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Hasil Indeks Massa Tubuh</Text>

            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>Nilai IMT Anda</Text>
              <Text style={[styles.scoreValue, { color: userImtResult.color }]}>{userImtResult.imt}</Text>

              <View style={[styles.statusBadge, { backgroundColor: userImtResult.color + '20', alignSelf: 'center', marginTop: 10 }]}>
                <View style={[styles.statusDot, { backgroundColor: userImtResult.color }]} />
                <Text style={[styles.statusText, { color: userImtResult.color }]}>
                  {userImtResult.status}
                </Text>
              </View>

              <Text style={styles.scoreNote}>{userImtResult.desc}</Text>
            </View>

            {}
            <View style={styles.imtBarContainer}>
              <View style={styles.imtScale}>
                <View style={[styles.scaleSegment, { flex: 18.5, backgroundColor: '#F59E0B' }]} />
                <View style={[styles.scaleSegment, { flex: 6.4, backgroundColor: '#10B981' }]} />
                <View style={[styles.scaleSegment, { flex: 5.0, backgroundColor: '#F97316' }]} />
                <View style={[styles.scaleSegment, { flex: 10.0, backgroundColor: '#EF4444' }]} />
              </View>
              <View style={styles.scaleLabels}>
                <Text style={styles.scaleLabelText}>Kurus</Text>
                <Text style={styles.scaleLabelText}>Normal</Text>
                <Text style={styles.scaleLabelText}>Gemuk</Text>
                <Text style={styles.scaleLabelText}>Obesitas</Text>
              </View>
            </View>
          </View>
        )}

        {}
        {isUserCalculated && userImtResult && (
          <View style={styles.card}>
            <View style={styles.aiHeaderRow}>
              <Ionicons name="sparkles" size={20} color="#2563EB" />
              <Text style={[styles.cardTitle, { marginBottom: 0, marginLeft: 8 }]}>Saran Kesehatan AI (Untuk Anda)</Text>
            </View>
            <Text style={styles.aiSubtitle}>Rekomendasi gaya hidup disesuaikan dengan profil gizi Anda</Text>

            {}
            {(() => {
              const suggestions = getAISuggestions({
                type: 'adult',
                gender: userGender,
                weight: userWeight,
                height: userHeight,
                status: userImtResult.status,
                age: userAge
              });

              return (
                <View style={styles.aiContainer}>
                  {}
                  <View style={styles.aiItem}>
                    <View style={[styles.aiIconBox, { backgroundColor: '#EFF6FF' }]}>
                      <Ionicons name="restaurant" size={20} color="#2563EB" />
                    </View>
                    <View style={styles.aiTextContainer}>
                      <Text style={styles.aiItemTitle}>{suggestions.polaMakan.title}</Text>
                      <Text style={styles.aiItemDesc}>{suggestions.polaMakan.desc}</Text>
                    </View>
                  </View>

                  {}
                  <View style={styles.aiItem}>
                    <View style={[styles.aiIconBox, { backgroundColor: '#F5F3FF' }]}>
                      <Ionicons name="moon" size={20} color="#8B5CF6" />
                    </View>
                    <View style={styles.aiTextContainer}>
                      <Text style={styles.aiItemTitle}>{suggestions.polaTidur.title}</Text>
                      <Text style={styles.aiItemDesc}>{suggestions.polaTidur.desc}</Text>
                    </View>
                  </View>

                  {}
                  <View style={styles.aiItem}>
                    <View style={[styles.aiIconBox, { backgroundColor: '#ECFDF5' }]}>
                      <Ionicons name="barbell" size={20} color="#10B981" />
                    </View>
                    <View style={styles.aiTextContainer}>
                      <Text style={styles.aiItemTitle}>{suggestions.olahraga.title}</Text>
                      <Text style={styles.aiItemDesc}>{suggestions.olahraga.desc}</Text>
                    </View>
                  </View>

                  {}
                  <View style={styles.aiItem}>
                    <View style={[styles.aiIconBox, { backgroundColor: '#FFF7ED' }]}>
                      <Ionicons name="medical" size={20} color="#F97316" />
                    </View>
                    <View style={styles.aiTextContainer}>
                      <Text style={styles.aiItemTitle}>{suggestions.tambahan.title}</Text>
                      <Text style={styles.aiItemDesc}>{suggestions.tambahan.desc}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.aiConsultBtn}
                    onPress={() => {
                      setAiContext({
                        type: 'adult',
                        weight: userWeight,
                        height: userHeight,
                        age: userAge,
                        gender: userGender,
                        status: userImtResult.status,
                      });
                      setIsAiModalVisible(true);
                    }}
                  >
                    <Ionicons name="sparkles" size={16} color="#FFF" style={{ marginRight: 6 }} />
                    <Text style={styles.aiConsultBtnText}>Tanya Gemini AI (Konsultasi Instan)</Text>
                  </TouchableOpacity>
                </View>
              );
            })()}
          </View>
        )}

        {}
        {userId && userHistory.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Riwayat IMT Anda</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 1.8 }]}>Waktu</Text>
              <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Tinggi/BB</Text>
              <Text style={[styles.tableHeaderText, { flex: 0.8, textAlign: 'center' }]}>Usia</Text>
              <Text style={[styles.tableHeaderText, { flex: 0.8, textAlign: 'center' }]}>IMT</Text>
            </View>
            {userHistory.slice(0, 5).map((item, index) => (
              <View key={item.id || index} style={styles.tableRow}>
                <Text style={[styles.tableRowText, { flex: 1.8 }]}>{item.date}</Text>
                <Text style={[styles.tableRowText, { flex: 1, textAlign: 'center' }]}>{item.tinggi_badan}c / {item.berat_badan}k</Text>
                <Text style={[styles.tableRowText, { flex: 0.8, textAlign: 'center' }]}>{item.umur_tahun} thn</Text>
                <Text style={[styles.tableRowText, { flex: 0.8, textAlign: 'center', fontWeight: 'bold' }]}>{item.imt}</Text>
              </View>
            ))}
          </View>
        )}

        {}
        {userId && (
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.cardTitle}>Data Tumbuh Kembang Anak</Text>
              <TouchableOpacity
                style={styles.addChildButton}
                onPress={() => {
                  setIsAddChildVisible(true);
                }}
              >
                <Ionicons name="add" size={16} color="#FFFFFF" />
                <Text style={styles.addChildButtonText}>Tambah Anak</Text>
              </TouchableOpacity>
            </View>

            {isLoadingChildren ? (
              <ActivityIndicator size="small" color="#2563EB" style={{ marginVertical: 20 }} />
            ) : children.length === 0 ? (
              <View style={styles.emptyChildrenBox}>
                <Ionicons name="people-outline" size={32} color="#94A3B8" />
                <Text style={styles.emptyChildrenText}>Belum ada profil anak terdaftar. Klik "+ Tambah Anak" untuk membuat profil anak Anda.</Text>
              </View>
            ) : (
              children.map((anak) => (
                <TouchableOpacity
                  key={anak.id}
                  style={styles.childItemRow}
                  onPress={() => handleOpenAnakDetail(anak)}
                  activeOpacity={0.7}
                >
                  <View style={styles.childInfoLeft}>
                    <View style={styles.childAvatarContainer}>
                      <Ionicons
                        name={anak.jenis_kelamin === 'Laki-laki' ? 'boy' : 'girl'}
                        size={24}
                        color={anak.jenis_kelamin === 'Laki-laki' ? '#2563EB' : '#EC4899'}
                      />
                    </View>
                    <View>
                      <Text style={styles.childNameText}>{anak.nama_anak}</Text>
                      <Text style={styles.childAgeText}>
                        Lahir: {anak.tanggal_lahir ? new Date(anak.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'} ({calculateAgeInMonths(anak.tanggal_lahir)} Bulan)
                      </Text>
                    </View>
                  </View>

                  <View style={styles.childInfoRight}>
                    <View style={styles.miniStatusBadge}>
                      <Text style={styles.miniStatusBadgeText}>{anak.status_z_score}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#64748B" />
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

      </ScrollView>

      {}
      <LoginPromptModal
        visible={isLoginPromptVisible}
        onClose={() => setIsLoginPromptVisible(false)}
        onLogin={() => {
          setIsLoginPromptVisible(false);
          navigation.navigate('Login');
        }}
      />

      {}
      <AddChildModal
        visible={isAddChildVisible}
        onClose={() => setIsAddChildVisible(false)}
        childName={childName}
        setChildName={setChildName}
        childBirthDate={childBirthDate}
        setChildBirthDate={setChildBirthDate}
        childGender={childGender}
        setChildGender={setChildGender}
        onSave={handleAddChild}
        isSaving={isSavingChild}
      />

      {}
      <Modal visible={isAnakDetailVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{selectedAnak?.nama_anak}</Text>
                <Text style={styles.modalSubtitle}>Riwayat Catatan Pertumbuhan & Gizi</Text>
              </View>
              <TouchableOpacity onPress={() => setIsAnakDetailVisible(false)}>
                <Ionicons name="close" size={24} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>

              {}
              <View style={styles.modalSectionCard}>
                <Text style={styles.sectionTitle}>Input Timbangan Baru</Text>

                <View style={styles.rowInputGroup}>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.smallLabel}>Berat Badan (kg)</Text>
                    <TextInput
                      style={styles.inputNumeric}
                      keyboardType="numeric"
                      value={newAnakWeight}
                      onChangeText={setNewAnakWeight}
                      placeholder="10.5"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.smallLabel}>Tinggi Badan (cm)</Text>
                    <TextInput
                      style={styles.inputNumeric}
                      keyboardType="numeric"
                      value={newAnakHeight}
                      onChangeText={setNewAnakHeight}
                      placeholder="80.2"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleAddAnakRecord}
                  disabled={isSavingAnakRecord}
                >
                  {isSavingAnakRecord ? (
                    <ActivityIndicator size="small" color="#2563EB" />
                  ) : (
                    <>
                      <Ionicons name="add-circle-outline" size={20} color="#2563EB" style={{ marginRight: 6 }} />
                      <Text style={styles.secondaryButtonText}>Simpan Catatan Timbangan</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {}
              <View style={styles.modalSectionCard}>
                <Text style={styles.sectionTitle}>Daftar Riwayat Timbangan</Text>

                {isLoadingAnakHistory ? (
                  <ActivityIndicator size="small" color="#2563EB" style={{ marginVertical: 20 }} />
                ) : anakHistory.length === 0 ? (
                  <Text style={styles.emptyHistoryText}>Belum ada riwayat timbangan tercatat.</Text>
                ) : (
                  <View>
                    <View style={styles.tableHeader}>
                      <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Tanggal</Text>
                      <Text style={[styles.tableHeaderText, { flex: 0.8, textAlign: 'center' }]}>Umur</Text>
                      <Text style={[styles.tableHeaderText, { flex: 1.2, textAlign: 'center' }]}>BB / TB</Text>
                      <Text style={[styles.tableHeaderText, { flex: 1.5, textAlign: 'right' }]}>Status Gizi</Text>
                    </View>
                    {anakHistory.map((item, index) => (
                      <View key={item.id || index} style={styles.tableRow}>
                        <Text style={[styles.tableRowText, { flex: 1.5 }]}>{item.date}</Text>
                        <Text style={[styles.tableRowText, { flex: 0.8, textAlign: 'center' }]}>{item.umur_bulan} bln</Text>
                        <Text style={[styles.tableRowText, { flex: 1.2, textAlign: 'center' }]}>{item.berat_badan}k / {item.tinggi_badan}c</Text>
                        <Text style={[styles.tableRowText, { flex: 1.5, textAlign: 'right', fontWeight: 'bold', color: '#1E40AF' }]}>
                          {item.status_gizi}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {}
              {selectedAnak && (
                <View style={styles.modalSectionCard}>
                  <View style={styles.aiHeaderRow}>
                    <Ionicons name="sparkles" size={18} color="#2563EB" />
                    <Text style={[styles.sectionTitle, { marginBottom: 0, marginLeft: 6 }]}>Saran Tumbuh Kembang AI</Text>
                  </View>

                  {(() => {
                    const suggestions = getAISuggestions({
                      type: 'child',
                      gender: selectedAnak.jenis_kelamin,
                      weight: 10,
                      height: 80,
                      status: selectedAnak.status_z_score,
                      age: calculateAgeInMonths(selectedAnak.tanggal_lahir)
                    });

                    return (
                      <View style={[styles.aiContainer, { marginTop: 12 }]}>
                        {}
                        <View style={styles.aiItem}>
                          <View style={[styles.aiIconBox, { backgroundColor: '#EFF6FF' }]}>
                            <Ionicons name="restaurant" size={18} color="#2563EB" />
                          </View>
                          <View style={styles.aiTextContainer}>
                            <Text style={styles.aiItemTitle}>{suggestions.polaMakan.title}</Text>
                            <Text style={styles.aiItemDesc}>{suggestions.polaMakan.desc}</Text>
                          </View>
                        </View>

                        {}
                        <View style={styles.aiItem}>
                          <View style={[styles.aiIconBox, { backgroundColor: '#F5F3FF' }]}>
                            <Ionicons name="moon" size={18} color="#8B5CF6" />
                          </View>
                          <View style={styles.aiTextContainer}>
                            <Text style={styles.aiItemTitle}>{suggestions.polaTidur.title}</Text>
                            <Text style={styles.aiItemDesc}>{suggestions.polaTidur.desc}</Text>
                          </View>
                        </View>

                        {}
                        <View style={styles.aiItem}>
                          <View style={[styles.aiIconBox, { backgroundColor: '#ECFDF5' }]}>
                            <Ionicons name="barbell" size={18} color="#10B981" />
                          </View>
                          <View style={styles.aiTextContainer}>
                            <Text style={styles.aiItemTitle}>{suggestions.olahraga.title}</Text>
                            <Text style={styles.aiItemDesc}>{suggestions.olahraga.desc}</Text>
                          </View>
                        </View>

                        {}
                        <View style={styles.aiItem}>
                          <View style={[styles.aiIconBox, { backgroundColor: '#FFF7ED' }]}>
                            <Ionicons name="medical" size={18} color="#F97316" />
                          </View>
                          <View style={styles.aiTextContainer}>
                            <Text style={styles.aiItemTitle}>{suggestions.tambahan.title}</Text>
                            <Text style={styles.aiItemDesc}>{suggestions.tambahan.desc}</Text>
                          </View>
                        </View>

                        <TouchableOpacity
                          style={styles.aiConsultBtn}
                          onPress={() => {
                            setAiContext({
                              type: 'child',
                              name: selectedAnak.nama_anak,
                              gender: selectedAnak.jenis_kelamin,
                              status: selectedAnak.status_z_score,
                              age: calculateAgeInMonths(selectedAnak.tanggal_lahir),
                            });
                            setIsAiModalVisible(true);
                          }}
                        >
                          <Ionicons name="sparkles" size={16} color="#FFF" style={{ marginRight: 6 }} />
                          <Text style={styles.aiConsultBtnText}>Konsultasikan Gizi Anak via Gemini</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })()}
                </View>
              )}

              {}
              <TouchableOpacity
                style={styles.deleteAnakButton}
                onPress={() => handleDeleteChild(selectedAnak?.id, selectedAnak?.nama_anak)}
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" style={{ marginRight: 6 }} />
                <Text style={styles.deleteAnakButtonText}>Hapus Profil Anak Ini</Text>
              </TouchableOpacity>

            </ScrollView>
          </View>
        </View>
      </Modal>

      <GeminiConsultantModal
        visible={isAiModalVisible}
        onClose={() => setIsAiModalVisible(false)}
        context={aiContext}
        title={aiContext?.type === 'child' ? `NutriOS AI: Tumbuh Kembang ${aiContext.name}` : "NutriOS AI: Konsultan Gizi Anda"}
        systemPrompt="Berikan konsultasi gizi terperinci berdasarkan hasil IMT / pertumbuhan."
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
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  header: {
    flex: 1,
    paddingRight: 10,
  },
  headerSparklesBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
    fontFamily: 'Roboto',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
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
    marginBottom: 14,
    fontFamily: 'Roboto',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  smallLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
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
  rowInputGroup: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  inputWrapper: {
    flex: 1,
  },
  inputNumeric: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
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
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
    fontFamily: 'Roboto',
  },
  secondaryButton: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#2563EB',
    fontWeight: '800',
    fontSize: 14,
    fontFamily: 'Roboto',
  },

  scoreBox: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    fontFamily: 'Roboto',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '950',
    fontFamily: 'Roboto',
  },
  scoreNote: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 18,
    fontFamily: 'Roboto',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'Roboto',
  },

  imtBarContainer: {
    marginTop: 10,
  },
  imtScale: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
  },
  scaleSegment: {
    height: '100%',
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  scaleLabelText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    fontFamily: 'Roboto',
  },

  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableHeaderText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    fontFamily: 'Roboto',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
  },
  tableRowText: {
    fontSize: 13,
    color: '#334155',
    fontFamily: 'Roboto',
  },

  addChildButton: {
    flexDirection: 'row',
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 4,
  },
  addChildButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  guestWarningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  guestWarningText: {
    flex: 1,
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    fontWeight: '600',
  },
  emptyChildrenBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyChildrenText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  childItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  childInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  childAvatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  childNameText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  childAgeText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  childInfoRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniStatusBadge: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 20,
  },
  miniStatusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: '100%',
    paddingBottom: Platform.OS === 'ios' ? 44 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  modalBody: {
    padding: 20,
  },
  modalSectionCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 12,
  },
  emptyHistoryText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    paddingVertical: 14,
  },
  deleteAnakButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  deleteAnakButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '800',
  },

  aiHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 16,
    fontWeight: '500',
    fontFamily: 'Roboto',
  },
  aiContainer: {
    gap: 16,
  },
  aiItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  aiIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTextContainer: {
    flex: 1,
  },
  aiItemTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
    fontFamily: 'Roboto',
  },
  aiItemDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginTop: 2,
    fontFamily: 'Roboto',
  },
  aiConsultBtn: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 16,
    shadowColor: '#2563EB',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
  },
  aiConsultBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});