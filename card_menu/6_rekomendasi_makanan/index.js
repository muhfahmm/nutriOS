import React, { useState, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  Switch,
  TextInput,
  Platform,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GeminiConsultantModal from '../../components/GeminiConsultantModal';
import { AuthContext } from '../../auth/AuthContext';
import { API_BASE_URL } from '../../auth/api';

const RecipeModal = ({ visible, foodName, onClose }) => {
  const { isDarkMode } = useContext(AuthContext);
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  React.useEffect(() => {
    if (visible && foodName) {
      const fetchRecipe = async () => {
        setLoading(true);
        setErrorMsg('');
        setRecipe(null);
        try {
          const response = await fetch(`${API_BASE_URL}/api/generate-recipe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ foodName })
          });
          const contentType = response.headers.get('content-type');
          if (response.ok && contentType && contentType.includes('application/json')) {
            const data = await response.json();
            if (data.recipe) {
              setRecipe(data.recipe);
            } else {
              setErrorMsg(data.message || 'Gagal memuat resep.');
            }
          } else {
            setErrorMsg(`Server Error (${response.status}). Harap restart server backend Anda.`);
          }
        } catch (e) {
          setErrorMsg('Koneksi terputus ke server backend.');
          console.warn(e);
        } finally {
          setLoading(false);
        }
      };
      fetchRecipe();
    }
  }, [visible, foodName]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, isDarkMode && { backgroundColor: '#1E293B' }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, isDarkMode && { color: '#F8FAFC' }]}>Resep {foodName}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={isDarkMode ? '#94A3B8' : '#6B7280'} />
            </TouchableOpacity>
          </View>
          
          {loading && (
            <View style={{ marginVertical: 30, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={{ fontSize: 13, color: isDarkMode ? '#CBD5E1' : '#4B5563', marginTop: 10 }}>
                Menyusun resep pintar dengan AI...
              </Text>
            </View>
          )}

          {!loading && errorMsg !== '' && (
            <View style={{ marginVertical: 20, alignItems: 'center' }}>
              <Ionicons name="alert-circle-outline" size={40} color="#EF4444" style={{ marginBottom: 12 }} />
              <Text style={{ fontSize: 13, color: '#EF4444', textAlign: 'center' }}>{errorMsg}</Text>
            </View>
          )}

          {!loading && !errorMsg && recipe && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalSubtitle, isDarkMode && { color: '#94A3B8' }]}>⏱️ Estimasi: {recipe.time}</Text>
              <Text style={[styles.modalSectionTitle, isDarkMode && { color: '#F8FAFC' }]}>Bahan-bahan:</Text>
              {recipe.ingredients.map((item, idx) => (
                <Text key={idx} style={[styles.modalItem, isDarkMode && { color: '#CBD5E1' }]}>• {item}</Text>
              ))}
              <Text style={[styles.modalSectionTitle, isDarkMode && { color: '#F8FAFC' }]}>Langkah:</Text>
              {recipe.steps.map((step, idx) => (
                <Text key={idx} style={[styles.modalItem, isDarkMode && { color: '#CBD5E1' }]}>{idx+1}. {step}</Text>
              ))}
            </ScrollView>
          )}

          {!loading && !errorMsg && !recipe && (
            <Text style={{ textAlign: 'center', marginVertical: 20, color: isDarkMode ? '#CBD5E1' : '#4B5563' }}>
              Pilih makanan untuk melihat resep.
            </Text>
          )}

          <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose}>
            <Text style={styles.modalCloseText}>Tutup</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default function RekomendasiMakananScreen() {
  const { isDarkMode } = useContext(AuthContext);
  const [isAiModalVisible, setIsAiModalVisible] = useState(false);
  const [alergies, setAlergies] = useState({ seafood: false, kacang: false, susu: false, kedelai: false });
  const [budget, setBudget] = useState('Sedang');
  const [isVegetarian, setIsVegetarian] = useState(false);

  const [selectedRecipe, setSelectedRecipe] = useState(null);
  
  const [currentMenu, setCurrentMenu] = useState({
    breakfast: [],
    morningSnack: [],
    lunch: [],
    afternoonSnack: [],
    dinner: []
  });

  // CRUD States
  const [crudModalVisible, setCrudModalVisible] = useState(false);
  const [crudMode, setCrudMode] = useState('add'); // 'add' or 'edit'
  const [activeMealKey, setActiveMealKey] = useState('breakfast');
  const [activeItemIndex, setActiveItemIndex] = useState(-1);
  const [inputValue, setInputValue] = useState('');

  const openAddModal = (mealKey) => {
    setCrudMode('add');
    setActiveMealKey(mealKey);
    setInputValue('');
    setCrudModalVisible(true);
  };

  const openEditModal = (mealKey, index, currentValue) => {
    setCrudMode('edit');
    setActiveMealKey(mealKey);
    setActiveItemIndex(index);
    setInputValue(currentValue);
    setCrudModalVisible(true);
  };

  const handleSaveCrud = () => {
    if (!inputValue.trim()) return;
    
    setCurrentMenu(prev => {
      const updatedMeal = [...prev[activeMealKey]];
      if (crudMode === 'add') {
        updatedMeal.push(inputValue.trim());
      } else {
        updatedMeal[activeItemIndex] = inputValue.trim();
      }
      return {
        ...prev,
        [activeMealKey]: updatedMeal
      };
    });
    setCrudModalVisible(false);
  };

  const handleDeleteItem = (mealKey, index) => {
    setCurrentMenu(prev => {
      const updatedMeal = prev[mealKey].filter((_, idx) => idx !== index);
      return {
        ...prev,
        [mealKey]: updatedMeal
      };
    });
  };

  const handleApplyAiMenu = (aiMenu) => {
    if (!aiMenu) return;
    
    setCurrentMenu(prev => {
      const updated = { ...prev };
      
      if (aiMenu.breakfast && (Array.isArray(aiMenu.breakfast) ? aiMenu.breakfast.length > 0 : aiMenu.breakfast)) {
        updated.breakfast = Array.isArray(aiMenu.breakfast) ? aiMenu.breakfast : [aiMenu.breakfast].filter(Boolean);
      }
      if (aiMenu.morningSnack && (Array.isArray(aiMenu.morningSnack) ? aiMenu.morningSnack.length > 0 : aiMenu.morningSnack)) {
        updated.morningSnack = Array.isArray(aiMenu.morningSnack) ? aiMenu.morningSnack : [aiMenu.morningSnack].filter(Boolean);
      }
      if (aiMenu.lunch && (Array.isArray(aiMenu.lunch) ? aiMenu.lunch.length > 0 : aiMenu.lunch)) {
        updated.lunch = Array.isArray(aiMenu.lunch) ? aiMenu.lunch : [aiMenu.lunch].filter(Boolean);
      }
      if (aiMenu.afternoonSnack && (Array.isArray(aiMenu.afternoonSnack) ? aiMenu.afternoonSnack.length > 0 : aiMenu.afternoonSnack)) {
        updated.afternoonSnack = Array.isArray(aiMenu.afternoonSnack) ? aiMenu.afternoonSnack : [aiMenu.afternoonSnack].filter(Boolean);
      }
      if (aiMenu.dinner && (Array.isArray(aiMenu.dinner) ? aiMenu.dinner.length > 0 : aiMenu.dinner)) {
        updated.dinner = Array.isArray(aiMenu.dinner) ? aiMenu.dinner : [aiMenu.dinner].filter(Boolean);
      }
      
      return updated;
    });
  };

  const handleSwap = async (mealKey, index, currentFood) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/swap-food`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentFood,
          alergies,
          budget,
          isVegetarian
        })
      });
      const contentType = response.headers.get('content-type');
      if (response.ok && contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.alternative) {
          setCurrentMenu(prev => {
            const updatedMeal = [...prev[mealKey]];
            updatedMeal[index] = data.alternative;
            return {
              ...prev,
              [mealKey]: updatedMeal
            };
          });
        } else {
          alert(data.message || 'Gagal mencari alternatif makanan.');
        }
      } else {
        const textResponse = await response.text();
        alert(`Server Error (${response.status}): ${textResponse || 'Gagal memproses permintaan.'}`);
      }
    } catch (e) {
      alert('Koneksi terputus ke server backend.');
      console.warn(e);
    }
  };

  const renderMealSection = (mealTitle, mealKey, emoji) => {
    const list = currentMenu[mealKey] || [];
    return (
      <View style={[styles.mealSection, isDarkMode && { borderColor: '#334155' }]}>
        <View style={styles.mealSectionHeader}>
          <Text style={[styles.mealTitle, isDarkMode && { color: '#60A5FA' }]}>{emoji} {mealTitle}</Text>
          <TouchableOpacity 
            style={[styles.addBtn, isDarkMode && { backgroundColor: '#334155' }]} 
            onPress={() => openAddModal(mealKey)}
          >
            <Ionicons name="add" size={16} color="#3B82F6" />
            <Text style={styles.addBtnText}>Tambah</Text>
          </TouchableOpacity>
        </View>

        {list.length === 0 ? (
          <Text style={[styles.emptyMealText, isDarkMode && { color: '#64748B' }]}>Belum ada menu makan.</Text>
        ) : (
          list.map((food, idx) => (
            <View key={`${food}-${idx}`} style={[styles.foodItemRow, isDarkMode && { borderBottomColor: '#334155' }]}>
              <View style={styles.foodItemLeft}>
                <Text style={[styles.foodItemName, isDarkMode && { color: '#F8FAFC' }]}>{food}</Text>
              </View>
              <View style={styles.foodItemActions}>
                <TouchableOpacity 
                  style={[styles.actionBtn, isDarkMode && { borderColor: '#475569' }]} 
                  onPress={() => setSelectedRecipe(food)}
                >
                  <Ionicons name="book-outline" size={14} color="#3B82F6" />
                  <Text style={styles.actionBtnText}>Resep</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionBtn, { borderColor: '#E2E8F0' }, isDarkMode && { borderColor: '#475569' }]} 
                  onPress={() => openEditModal(mealKey, idx, food)}
                >
                  <Ionicons name="create-outline" size={14} color="#6B7280" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionBtn, { borderColor: '#FEE2E2' }, isDarkMode && { borderColor: '#475569' }]} 
                  onPress={() => handleSwap(mealKey, idx, food)}
                >
                  <Ionicons name="swap-horizontal-outline" size={14} color="#F59E0B" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionBtn, { borderColor: '#FEE2E2' }, isDarkMode && { borderColor: '#475569' }]} 
                  onPress={() => handleDeleteItem(mealKey, idx)}
                >
                  <Ionicons name="trash-outline" size={14} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    );
  };

  const systemPrompt = 
    "Berikan ide resep makanan lokal Indonesia sehat dan bergizi seimbang berdasarkan kebutuhan nutrisi. " +
    "PENTING: HANYA jika Anda memberikan atau menyarankan rekomendasi menu makanan kepada pengguna, sertakan data menu tersebut di akhir respon Anda dalam format JSON mentah diapit tag <MENU_JSON>...</MENU_JSON>. " +
    "PENTING LAINNYA: Jika Anda HANYA merekomendasikan salah satu waktu makan saja (misal: hanya sarapan), maka di dalam JSON Anda CUKUP sertakan key waktu makan tersebut saja (misal: hanya key \"breakfast\") dan jangan sertakan key lainnya yang tidak Anda rekomendasikan, agar tidak menimpa data makan siang atau makan malam pengguna saat ini yang sudah ada.\n\n" +
    "Jika pengguna hanya bertanya secara umum, menanyakan definisi (misal: 'apa itu makan'), atau mengobrol biasa tanpa meminta/memberikan rekomendasi menu makanan baru, CUKUP jelaskan secara detail dan JANGAN sertakan tag <MENU_JSON> maupun data JSON apapun.\n\n" +
    "Format struktur JSON jika direkomendasikan (bisa dikurangi/hanya mencantumkan key yang relevan):\n" +
    "{\n" +
    "  \"breakfast\": [\"menu utama\", \"lauk\", \"minuman\"],\n" +
    "  \"morningSnack\": [\"camilan\"],\n" +
    "  \"lunch\": [\"karbohidrat\", \"lauk\", \"sayur\"],\n" +
    "  \"afternoonSnack\": [\"camilan\"],\n" +
    "  \"dinner\": [\"menu utama\", \"sayur\"]\n" +
    "}\n" +
    "Jangan masukkan markdown codeblock (seperti ```json) di dalam tag <MENU_JSON> tersebut.";

  return (
    <SafeAreaView style={[styles.container, isDarkMode && { backgroundColor: '#0F172A' }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.header}>
            <Text style={[styles.title, isDarkMode && { color: '#F8FAFC' }]}>Rekomendasi Makanan</Text>
            <Text style={[styles.subtitle, isDarkMode && { color: '#94A3B8' }]}>Menu harian cerdas, sesuai gizi dan preferensi keluarga.</Text>
          </View>
          <TouchableOpacity style={styles.headerSparklesBtn} onPress={() => setIsAiModalVisible(true)}>
            <Ionicons name="sparkles" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Filter Card */}
        <View style={[styles.card, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
          <Text style={[styles.cardTitle, isDarkMode && { color: '#F8FAFC' }]}>Filter & Preferensi</Text>
          
          <View style={styles.filterSection}>
            <Text style={[styles.filterLabel, isDarkMode && { color: '#CBD5E1' }]}>Alergi & Pantangan:</Text>
            <View style={styles.alergyRow}>
              {Object.keys(alergies).map(key => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.alergyBtn, 
                    alergies[key] && styles.alergyBtnActive,
                    isDarkMode && !alergies[key] && { backgroundColor: '#334155' }
                  ]}
                  onPress={() => setAlergies(prev => ({ ...prev, [key]: !prev[key] }))}
                >
                  <Text style={[
                    styles.alergyText, 
                    alergies[key] && styles.alergyTextActive,
                    isDarkMode && !alergies[key] && { color: '#94A3B8' }
                  ]}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={[styles.filterSection, { borderTopWidth: 1, borderTopColor: isDarkMode ? '#334155' : '#F3F4F6', paddingTop: 14, marginTop: 14 }]}>
            <View style={styles.budgetRow}>
              <Text style={[styles.filterLabel, isDarkMode && { color: '#CBD5E1' }]}>Budget Harian:</Text>
              <View style={styles.budgetChips}>
                {['Murah', 'Sedang', 'Mahal'].map(b => (
                  <TouchableOpacity
                    key={b}
                    style={[
                      styles.budgetChip, 
                      budget === b && styles.budgetChipActive,
                      isDarkMode && budget !== b && { backgroundColor: '#334155' }
                    ]}
                    onPress={() => setBudget(b)}
                  >
                    <Text style={[
                      styles.budgetChipText, 
                      budget === b && styles.budgetChipTextActive,
                      isDarkMode && budget !== b && { color: '#94A3B8' }
                    ]}>
                      {b === 'Murah' ? 'Rp 20k' : b === 'Sedang' ? 'Rp 50k' : 'Rp 100k+'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.veganRow}>
              <Text style={[styles.filterLabel, isDarkMode && { color: '#CBD5E1' }]}>Preferensi Diet:</Text>
              <View style={styles.switchRow}>
                <Text style={[styles.switchLabel, isDarkMode && { color: '#94A3B8' }]}>Vegetarian</Text>
                <Switch 
                  value={isVegetarian} 
                  onValueChange={setIsVegetarian} 
                  trackColor={{ false: '#E5E7EB', true: '#3B82F6' }} 
                />
              </View>
            </View>
          </View>
        </View>

        {/* AI Action Card */}
        <View style={[styles.card, { backgroundColor: isDarkMode ? '#1E3A8A' : '#EFF6FF', borderColor: isDarkMode ? '#3B82F6' : '#BFDBFE', borderWidth: 1 }]}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="sparkles" size={22} color={isDarkMode ? '#60A5FA' : '#3B82F6'} style={{ marginRight: 8 }} />
            <Text style={[styles.cardTitle, { color: isDarkMode ? '#F8FAFC' : '#1E3A8A', marginBottom: 0 }]}>Rekomendasi Resep AI (Gemini)</Text>
          </View>
          <Text style={{ fontSize: 13, color: isDarkMode ? '#93C5FD' : '#1E40AF', lineHeight: 18, marginBottom: 12 }}>
            Ingin membuat resep khusus untuk anak atau menanyakan ide masak berbasis bahan-bahan yang ada di kulkas Anda? Hubungkan menu harian Anda dengan Gemini AI secara instan!
          </Text>
          <TouchableOpacity
            style={styles.aiRecipeBtn}
            onPress={() => setIsAiModalVisible(true)}
          >
            <Ionicons name="chatbox-ellipses" size={18} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.aiRecipeBtnText}>Konsultasi Menu Cerdas AI</Text>
          </TouchableOpacity>
        </View>

        {/* Daily Menu Section */}
        <View style={[styles.card, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
          <Text style={[styles.cardTitle, isDarkMode && { color: '#F8FAFC' }]}>🍽️ Paket Menu Harian</Text>

          {renderMealSection('Sarapan', 'breakfast', '🍳')}
          {renderMealSection('Snack Pagi', 'morningSnack', '🥗')}
          {renderMealSection('Makan Siang', 'lunch', '🍱')}
          {renderMealSection('Snack Sore', 'afternoonSnack', '🥤')}
          {renderMealSection('Makan Malam', 'dinner', '🍲')}
        </View>

        {/* Modals */}
        <RecipeModal
          visible={selectedRecipe !== null}
          foodName={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />

        {/* CRUD Add/Edit Modal */}
        <Modal visible={crudModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { width: '85%' }, isDarkMode && { backgroundColor: '#1E293B' }]}>
              <Text style={[styles.modalTitle, { marginBottom: 16 }, isDarkMode && { color: '#F8FAFC' }]}>
                {crudMode === 'add' ? 'Tambah Makanan' : 'Ubah Makanan'}
              </Text>
              
              <TextInput
                style={[
                  styles.crudInput,
                  isDarkMode ? { backgroundColor: '#334155', color: '#F8FAFC', borderColor: '#475569' } : { backgroundColor: '#F9FAFB' }
                ]}
                placeholder="Nama makanan/minuman..."
                placeholderTextColor={isDarkMode ? '#94A3B8' : '#9CA3AF'}
                value={inputValue}
                onChangeText={setInputValue}
                autoFocus
              />

              <View style={styles.crudModalButtons}>
                <TouchableOpacity 
                  style={[styles.crudCancelBtn, isDarkMode && { borderColor: '#475569' }]} 
                  onPress={() => setCrudModalVisible(false)}
                >
                  <Text style={[styles.crudCancelText, isDarkMode && { color: '#94A3B8' }]}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.crudSaveBtn} 
                  onPress={handleSaveCrud}
                >
                  <Text style={styles.crudSaveText}>Simpan</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <GeminiConsultantModal
          visible={isAiModalVisible}
          onClose={() => setIsAiModalVisible(false)}
          context={{
            type: 'rekomendasi_makanan',
            currentMenu: currentMenu
          }}
          title="NutriOS AI: Rekomendasi Resep"
          systemPrompt={systemPrompt}
          onApplyMenu={handleApplyAiMenu}
        />

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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiRecipeBtn: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#3B82F6',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
  },
  aiRecipeBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  filterSection: {
    marginBottom: 10,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  alergyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  alergyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  alergyBtnActive: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  alergyText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4B5563',
  },
  alergyTextActive: {
    color: '#EF4444',
    fontWeight: '600',
  },
  budgetRow: {
    marginBottom: 12,
  },
  budgetChips: {
    flexDirection: 'row',
    gap: 8,
  },
  budgetChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  budgetChipActive: {
    backgroundColor: '#3B82F6',
  },
  budgetChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  budgetChipTextActive: {
    color: '#FFFFFF',
  },
  veganRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchLabel: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
  },
  mealSection: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
  },
  mealSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  mealTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3B82F6',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  addBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3B82F6',
    marginLeft: 2,
  },
  emptyMealText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    paddingLeft: 4,
    paddingVertical: 6,
  },
  foodItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  foodItemLeft: {
    flex: 1,
  },
  foodItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  foodItemActions: {
    flexDirection: 'row',
    gap: 6,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 2,
  },
  actionBtnText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#3B82F6',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginTop: 12,
    marginBottom: 6,
  },
  modalItem: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 4,
    lineHeight: 20,
  },
  modalCloseBtn: {
    marginTop: 20,
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  crudInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 20,
  },
  crudModalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  crudCancelBtn: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  crudCancelText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  crudSaveBtn: {
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  crudSaveText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});