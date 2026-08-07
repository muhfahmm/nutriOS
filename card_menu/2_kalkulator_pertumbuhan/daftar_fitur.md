1. Input Data Pengukuran (Data Entry)
Sebelum menghitung, pengguna harus memasukkan data terbaru anak:

Usia: Tanggal lahir (sistem otomatis menghitung usia dalam tahun, bulan, dan hari).

Jenis Kelamin: Laki-laki / Perempuan (sangat krusial, karena kurva WHO berbeda antara laki-laki dan perempuan).

Tinggi Badan (cm).

Berat Badan (kg).

Opsional (Untuk Balita < 2 tahun): Lingkar Kepala (cm).

Catatan: Aplikasi menyimpan riwayat pengukuran, jadi orang tua tinggal input data baru tanpa mengulangi tanggal lahir.

2. Standar Perhitungan (Z-Score WHO)
Mesin kalkulator di backend akan menggunakan standar kurva pertumbuhan WHO untuk menghitung 3 metrik utama (dengan output berupa Z-Score dan Persentil):

Berat Badan menurut Usia (WAZ): Menilai apakah anak kekurangan berat badan (underweight).

Tinggi Badan menurut Usia (HAZ): Menilai apakah anak mengalami stunting (pengerdilan) atau tinggi normal/tinggi.

Berat Badan menurut Tinggi (WHZ) atau BMI menurut Usia: Menilai apakah anak mengalami wasting (kurus akut) atau obesitas.

3. Visualisasi Grafik Pertumbuhan (Growth Chart)
Fitur: Menampilkan grafik garis interaktif yang memplot data anak (titik merah/biru) di atas kurva standar WHO (garis kelabu dengan garis persentil 3%, 15%, 50%, 85%, 97%).

Interaksi: Orang tua bisa menggeser mouse ke titik data untuk melihat detail tanggal pengukuran, nilai Z-Score, dan status gizi saat itu.

Insight Visual: Jika data anak berada di bawah garis merah (di bawah persentil 3%), itu artinya ada tanda bahaya yang perlu segera diperhatikan. Jika berada di atas rata-rata (persentil 85+), artinya anak memiliki pertumbuhan yang sangat baik.

4. Interpretasi & Status Gizi (Output Cerdas)
Setelah dihitung, aplikasi akan memberikan "Kartu Kesimpulan" yang mudah dipahami, bukan sekadar angka.

Contoh Output 1 (Normal): "Tinggi anak Anda berada di persentil 65 (Normal). Pertumbuhannya sangat baik!"

Contoh Output 2 (Stunting): "Z-Score Tinggi: -2.2. Anak Anda terindikasi Stunting (Tinggi kurang dari standar usianya). Disarankan untuk meningkatkan asupan protein hewani dan kalsium."

Contoh Output 3 (Obesitas): "IMT Anak Anda berada di persentil 96 (Obesitas). Kurangi konsumsi gula dan gorengan, serta tingkatkan aktivitas fisik."

5. Analisis Tren Pertumbuhan (Growth Trend)
Fitur: Karena data disimpan secara historis, sistem akan menganalisis kecepatan pertumbuhan (dalam cm/bulan).

Contoh Insight:

"Tinggi badan anak Anda bertambah 6 cm dalam 6 bulan terakhir (rata-rata 1 cm/bulan). Pertumbuhan ini sangat baik dan sesuai dengan standar WHO."

"Pertumbuhan berat badan terlihat melambat dalam 3 bulan terakhir. Perhatikan asupan kalori anak."

6. Rekomendasi Tindakan & Integrasi ke Fitur Lain
Fitur kalkulator ini tidak berdiri sendiri. Jika hasil Z-Score menunjukkan masalah, akan muncul tombol aksi cepat:

Jika Stunting / Kurang Gizi → Tombol: "Cari Rekomendasi Makanan Bergizi" (Redirect ke halaman Rekomendasi Makanan).

Jika Obesitas → Tombol: "Lihat Program Olahraga Anak" (Redirect ke halaman Olahraga).