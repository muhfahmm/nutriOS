import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Modal,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// --- 1. DATABASE BAHAN MAKANAN LOKAL (MOCK JSON) ---
const foodDB = {
  // Kategori Karbohidrat
  "Nasi Putih": { id: 1, calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, iron: 0.8, calcium: 10, category: "Karbohidrat", price: "Murah", alergi: [] },
  "Nasi Merah": { id: 2, calories: 110, protein: 2.6, carbs: 23, fat: 0.9, fiber: 1.8, iron: 1.2, calcium: 12, category: "Karbohidrat", price: "Murah", alergi: [] },
  
  // Protein Hewani
  "Ayam Goreng": { id: 3, calories: 240, protein: 20, carbs: 5, fat: 14, fiber: 0, iron: 1.5, calcium: 10, category: "Protein Hewani", price: "Sedang", alergi: [] },
  "Ikan Kembung": { id: 4, calories: 200, protein: 22, carbs: 0, fat: 12, fiber: 0, iron: 2.5, calcium: 30, category: "Protein Hewani", price: "Sedang", alergi: ["seafood"] },
  "Telur Dadar": { id: 5, calories: 140, protein: 10, carbs: 1, fat: 10, fiber: 0, iron: 1.2, calcium: 40, category: "Protein Hewani", price: "Murah", alergi: [] },
  "Tahu Bacem": { id: 6, calories: 120, protein: 12, carbs: 8, fat: 6, fiber: 1.2, iron: 2.0, calcium: 120, category: "Protein Nabati", price: "Murah", alergi: ["kedelai"] },
  "Tempe Goreng": { id: 7, calories: 150, protein: 14, carbs: 10, fat: 8, fiber: 2.5, iron: 3.0, calcium: 80, category: "Protein Nabati", price: "Murah", alergi: ["kedelai"] },
  
  // Sayur
  "Bayam": { id: 8, calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, iron: 3.5, calcium: 100, category: "Sayur", price: "Murah", alergi: [] },
  "Kangkung": { id: 9, calories: 20, protein: 2.5, carbs: 3.0, fat: 0.3, fiber: 2.0, iron: 2.8, calcium: 80, category: "Sayur", price: "Murah", alergi: [] },
  "Brokoli": { id: 10, calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, iron: 0.8, calcium: 47, category: "Sayur", price: "Sedang", alergi: [] },
  
  // Buah & Snack
  "Pisang": { id: 11, calories: 90, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, iron: 0.3, calcium: 6, category: "Buah", price: "Murah", alergi: [] },
  "Alpukat": { id: 12, calories: 160, protein: 2, carbs: 9, fat: 15, fiber: 6.7, iron: 0.6, calcium: 12, category: "Buah", price: "Sedang", alergi: [] },
  "Kacang Rebus": { id: 13, calories: 120, protein: 7, carbs: 10, fat: 6, fiber: 4, iron: 1.5, calcium: 30, category: "Lemak", price: "Murah", alergi: ["kacang"] },
  
  // Minuman
  "Susu Sapi": { id: 14, calories: 70, protein: 3.4, carbs: 4.8, fat: 4, fiber: 0, iron: 0.1, calcium: 120, category: "Minuman", price: "Sedang", alergi: ["susu"] },
  "Jus Jeruk": { id: 15, calories: 45, protein: 0.8, carbs: 10, fat: 0.2, fiber: 0.5, iron: 0.1, calcium: 20, category: "Minuman", price: "Sedang", alergi: [] },
};

// --- 2. RESEP MOCK ---
const recipes = {
  "Ayam Goreng": {
    ingredients: ["1/2 ekor ayam potong", "1 sdt garam", "1/2 sdt kunyit", "2 siung bawang putih", "Minyak goreng"],
    steps: ["Haluskan bumbu (bawang, kunyit, garam).", "Lumuri ayam dengan bumbu, diamkan 15 menit.", "Goreng ayam dalam minyak panas hingga matang kecokelatan.", "Angkat dan tiriskan."],
    time: "25 menit"
  },
  "Tahu Bacem": {
    ingredients: ["4 buah tahu putih", "3 sdm kecap manis", "2 lembar daun salam", "1 ruas lengkuas", "200 ml air"],
    steps: ["Rebus air, kecap, daun salam, lengkuas hingga mendidih.", "Masukkan tahu, kecilkan api, ungkep hingga air menyusut.", "Angkat dan goreng sebentar (opsional)."],
    time: "30 menit"
  },
  "Bayam": {
    ingredients: ["1 ikat bayam", "2 siung bawang putih", "1 buah tomat", "Garam secukupnya"],
    steps: ["Tumis bawang putih hingga harum.", "Masukkan bayam dan tomat, aduk rata.", "Tambahkan garam, masak hingga layu (3 menit)."],
    time: "10 menit"
  }
};

// --- 3. KOMPONEN MODAL RESEP ---
const RecipeModal = ({ visible, foodName, onClose }) => {
  const recipe = recipes[foodName];
  if (!recipe) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Resep {foodName}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <Text style={styles.modalSubtitle}>⏱️ Estimasi: {recipe.time}</Text>
          <Text style={styles.modalSectionTitle}>Bahan-bahan:</Text>
          {recipe.ingredients.map((item, idx) => (
            <Text key={idx} style={styles.modalItem}>• {item}</Text>
          ))}
          <Text style={styles.modalSectionTitle}>Langkah:</Text>
          {recipe.steps.map((step, idx) => (
            <Text key={idx} style={styles.modalItem}>{idx+1}. {step}</Text>
          ))}
          <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose}>
            <Text style={styles.modalCloseText}>Tutup</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// --- 4. MAIN SCREEN ---
export default function RekomendasiMakananScreen() {
  // Filter State
  const [alergies, setAlergies] = useState({ seafood: false, kacang: false, susu: false, kedelai: false });
  const [budget, setBudget] = useState('Sedang'); // Murah, Sedang, Mahal
  const [isVegetarian, setIsVegetarian] = useState(false);

  // Menu State
  const [selectedRecipe, setSelectedRecipe] = useState(null); // Nama makanan yang resepnya dilihat
  const [currentMenu, setCurrentMenu] = useState({
    breakfast: { main: "Nasi Putih", side: "Telur Dadar", drink: "Susu Sapi" },
    morningSnack: "Pisang",
    lunch: { main: "Nasi Merah", side: "Ayam Goreng", veggie: "Bayam" },
    afternoonSnack: "Kacang Rebus",
    dinner: { main: "Tahu Bacem", veggie: "Kangkung" }
  });

  // --- LOGIKA SMART SWAP ---
  const handleSwap = (mealType, currentFood) => {
    // Cari alternatif berdasarkan kategori, budget, alergi, dan vegetarian
    const foodData = foodDB[currentFood];
    if (!foodData) return;

    let candidates = Object.keys(foodDB).filter(name => {
      const data = foodDB[name];
      // Kategori sama
      if (data.category !== foodData.category) return false;
      // Budget minimal sama atau lebih murah (kecuali jika budget sedang, boleh mahal sedikit)
      if (budget === 'Murah' && data.price === 'Mahal') return false;
      if (budget === 'Sedang' && data.price === 'Mahal') return false; // opsional
      // Alergi
      if (alergies.seafood && data.alergi.includes('seafood')) return false;
      if (alergies.kacang && data.alergi.includes('kacang')) return false;
      if (alergies.susu && data.alergi.includes('susu')) return false;
      if (alergies.kedelai && data.alergi.includes('kedelai')) return false;
      // Vegetarian: jika vegetarian, jangan rekomendasikan protein hewani (kecuali telur?)
      if (isVegetarian && (data.category === 'Protein Hewani' && name !== 'Telur Dadar')) return false;
      return true;
    });

    // Filter agar tidak memilih makanan yang sama
    candidates = candidates.filter(name => name !== currentFood);

    if (candidates.length === 0) {
      alert('Tidak ada alternatif pengganti dengan preferensi saat ini.');
      return;
    }

    // Pilih alternatif acak
    const newFood = candidates[Math.floor(Math.random() * candidates.length)];
    
    // Update menu
    setCurrentMenu(prev => {
      const newMenu = { ...prev };
      // Cari posisi makanan di dalam menu (struktur bisa nested)
      // Cara sederhana: kita akan ganti berdasarkan string value, tapi kita harus tahu posisinya.
      // Karena menu berbentuk nested, kita akan lakukan pencarian manual dan update
      // Untuk demo, kita akan ganti di tempat yang sama berdasarkan jenis makanan.
      // Kita bisa menggunakan pendekatan: kita tahu bahwa food item ada di menu.
      // Mari kita cari dan ganti.
      // Kita akan lakukan iterative search dan ganti
      const replaceInObject = (obj) => {
        for (let key in obj) {
          if (typeof obj[key] === 'object') {
            replaceInObject(obj[key]);
          } else if (obj[key] === currentFood) {
            obj[key] = newFood;
          }
        }
      };
      replaceInObject(newMenu);
      return newMenu;
    });
  };

  // Render item makanan dengan tombol ganti dan resep
  const renderFoodItem = (label, foodName, mealType) => {
    if (!foodName) return null;
    return (
      <View style={styles.foodItemRow}>
        <View style={styles.foodItemLeft}>
          <Text style={styles.foodItemLabel}>{label}</Text>
          <Text style={styles.foodItemName}>{foodName}</Text>
        </View>
        <View style={styles.foodItemActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setSelectedRecipe(foodName)}>
            <Ionicons name="book-outline" size={18} color="#2563EB" />
            <Text style={styles.actionBtnText}>Resep</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { borderColor: '#F59E0B' }]} onPress={() => handleSwap(mealType, foodName)}>
            <Ionicons name="swap-horizontal-outline" size={18} color="#F59E0B" />
            <Text style={[styles.actionBtnText, { color: '#F59E0B' }]}>Ganti</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Rekomendasi Makanan</Text>
          <Text style={styles.subtitle}>Menu harian cerdas, sesuai gizi dan preferensi keluarga.</Text>
        </View>

        {/* 2. SISTEM FILTER & PREFERENSI */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Filter & Preferensi</Text>
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Alergi & Pantangan:</Text>
            <View style={styles.alergyRow}>
              {Object.keys(alergies).map(key => (
                <TouchableOpacity 
                  key={key} 
                  style={[styles.alergyBtn, alergies[key] && styles.alergyBtnActive]}
                  onPress={() => setAlergies(prev => ({ ...prev, [key]: !prev[key] }))}
                >
                  <Text style={[styles.alergyText, alergies[key] && styles.alergyTextActive]}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={[styles.filterSection, { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 14, marginTop: 14 }]}>
            <View style={styles.budgetRow}>
              <Text style={styles.filterLabel}>Budget Harian:</Text>
              <View style={styles.budgetChips}>
                {['Murah', 'Sedang', 'Mahal'].map(b => (
                  <TouchableOpacity 
                    key={b} 
                    style={[styles.budgetChip, budget === b && styles.budgetChipActive]}
                    onPress={() => setBudget(b)}
                  >
                    <Text style={[styles.budgetChipText, budget === b && styles.budgetChipTextActive]}>{b === 'Murah' ? 'Rp 20k' : b === 'Sedang' ? 'Rp 50k' : 'Rp 100k+'}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.veganRow}>
              <Text style={styles.filterLabel}>Preferensi Diet:</Text>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Vegetarian</Text>
                <Switch value={isVegetarian} onValueChange={setIsVegetarian} trackColor={{ false: '#E5E7EB', true: '#2563EB' }} />
              </View>
            </View>
          </View>
        </View>

        {/* 4. HASIL OUTPUT: PAKET MENU HARIAN */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🍽️ Paket Menu Harian</Text>
          
          <View style={styles.mealSection}>
            <Text style={styles.mealTitle}>🍳 Sarapan</Text>
            {renderFoodItem('Menu Utama', currentMenu.breakfast.main, 'breakfast')}
            {renderFoodItem('Lauk', currentMenu.breakfast.side, 'breakfast')}
            {renderFoodItem('Minuman', currentMenu.breakfast.drink, 'breakfast')}
          </View>

          <View style={[styles.mealSection, { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 14 }]}>
            <Text style={styles.mealTitle}>🥗 Snack Pagi</Text>
            {renderFoodItem('Camilan', currentMenu.morningSnack, 'morningSnack')}
          </View>

          <View style={[styles.mealSection, { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 14 }]}>
            <Text style={styles.mealTitle}>🍱 Makan Siang</Text>
            {renderFoodItem('Karbohidrat', currentMenu.lunch.main, 'lunch')}
            {renderFoodItem('Lauk', currentMenu.lunch.side, 'lunch')}
            {renderFoodItem('Sayur', currentMenu.lunch.veggie, 'lunch')}
          </View>

          <View style={[styles.mealSection, { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 14 }]}>
            <Text style={styles.mealTitle}>🥤 Snack Sore</Text>
            {renderFoodItem('Camilan', currentMenu.afternoonSnack, 'afternoonSnack')}
          </View>

          <View style={[styles.mealSection, { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 14 }]}>
            <Text style={styles.mealTitle}>🍲 Makan Malam</Text>
            {renderFoodItem('Menu Utama', currentMenu.dinner.main, 'dinner')}
            {renderFoodItem('Sayur', currentMenu.dinner.veggie, 'dinner')}
          </View>
        </View>

        {/* 6. TAMPILAN RESEP SEDERHANA (MODAL) */}
        <RecipeModal 
          visible={selectedRecipe !== null} 
          foodName={selectedRecipe} 
          onClose={() => setSelectedRecipe(null)} 
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

  // --- 2. FILTER ---
  filterSection: {
    marginBottom: 10,
  },
  filterLabel: {
    fontSize: 14,
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
    borderColor: '#EF5350',
  },
  alergyText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  alergyTextActive: {
    color: '#EF5350',
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
    backgroundColor: '#2563EB',
  },
  budgetChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  budgetChipTextActive: {
    color: '#FFFFFF',
  },
  veganRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchLabel: {
    fontSize: 14,
    color: '#374151',
  },

  // --- 4. PAKET MENU ---
  mealSection: {
    marginBottom: 8,
  },
  mealTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 10,
  },
  foodItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  foodItemLeft: {
    flex: 1,
  },
  foodItemLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  foodItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  foodItemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },

  // --- 6. MODAL RESEP ---
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
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  modalSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
    marginBottom: 6,
  },
  modalItem: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
    lineHeight: 22,
  },
  modalCloseBtn: {
    marginTop: 20,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});