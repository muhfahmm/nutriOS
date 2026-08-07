1. Database Bahan Makanan Lokal (The Backbone)
Sistem tidak akan bisa merekomendasikan jika tidak punya data. Kita akan membuat database makanan lokal Indonesia (bisa dalam bentuk JSON atau PostgreSQL) dengan detail:

Nama Makanan: Misal, "Nasi Putih", "Tempe Goreng", "Ikan Kembung", "Bayam", "Tahu".

Kandungan Gizi per 100gr / per porsi: Kalori, Protein, Karbohidrat, Lemak, Serat, Zat Besi, Kalsium.

Kategori: Karbohidrat, Protein Hewani, Protein Nabati, Sayur, Buah, Lemak.

Harga Estimasi: (Murah, Sedang, Mahal) – sangat penting untuk disesuaikan dengan kantong keluarga Indonesia.

Tag Alergi: Mengandung gluten, susu, kacang, seafood, dll.

2. Sistem Filter & Preferensi Pribadi (Smart Filter)
Sebelum AI memberikan rekomendasi, pengguna bisa mengatur preferensi di halaman ini:

Alergi & Pantangan: (Checkbox) "Tidak boleh kacang", "Tidak boleh seafood", "Tidak boleh susu sapi".

Preferensi Diet: (Checkbox) "Vegan", "Vegetarian", "Tinggi Protein", "Rendah Gula".

Budget Harian: (Slider) "Rp 20.000", "Rp 50.000", "Rp 100.000+" - rekomendasi akan menyesuaikan harga bahan.

3. Mesin Rekomendasi Cerdas (Personalized Engine)
Sistem akan memadukan data profil pengguna dengan data riwayat makanan untuk menghasilkan menu yang pas. Logikanya:

Input: Data dari Kalkulator Pertumbuhan (apakah anak stunting, obesitas, atau normal?).

Cek Kebutuhan: Misal, anak stunting butuh protein +10gr/hari, atau anak obesitas butuh mengurangi karbohidrat olahan.

Cek Log Makan Hari Ini: "Hari ini dia sudah makan ayam dan nasi, tapi belum makan sayur dan protein nabati."

Output Rekomendasi: Sistem akan memilih makanan yang menutupi kekurangan gizi hari itu, bukan sekadar memberikan menu acak.

4. Hasil Output: Paket Menu Harian (Meal Plan)
Sistem tidak hanya memberi 1 makanan, tapi Paket Menu untuk 1 Hari Penuh:

🍳 Sarapan: 1 menu utama + 1 minuman (Susu/Jus).

🥗 Snack Pagi: 1 pilihan camilan sehat (Buah pisang, atau kolak tanpa gula).

🍱 Makan Siang: Nasi/Lauk/Sayur (lengkap).

🥤 Snack Sore: 1 pilihan camilan sehat (Kacang rebus, atau puding susu).

🍲 Makan Malam: Porsi lebih ringan (misal: Sup ayam sayur).

5. Fitur "Ganti Bahan" (Smart Swap)
Fitur ini sangat disukai ibu-ibu! Jika ada bahan yang tidak ada di dapur atau anaknya tidak suka, pengguna bisa menekan tombol "Ganti" di sebelah item.

Contoh: Rekomendasi lauk "Ayam Goreng". Pengguna klik "Ganti" → Sistem otomatis menawarkan opsi lain dengan nilai gizi setara: "Tahu Bacem" atau "Telur Dadar".

6. Tampilan Resep Sederhana (Easy Cooking Guide)
Setiap makanan yang direkomendasikan akan memiliki tombol "Lihat Resep" yang membuka modal berisi:

Bahan-bahan yang dibutuhkan (lengkap dengan ukuran porsi).

Langkah memasak singkat (maksimal 5 langkah agar mudah diikuti).

Waktu memasak (estimasi: 15 menit, 30 menit).