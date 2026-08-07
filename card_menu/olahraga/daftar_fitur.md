1. Mode Olahraga (Child Mode vs Adult Mode)
Sistem akan membaca usia dari profil pengguna dan menyesuaikan tipe olahraga yang ditawarkan:

Mode Anak (Usia 5-12 tahun): Gerakan seperti Jumping Jack, Squat, Push-up Lutut, Tendangan Kaki, dan Peregangan Kucing. Durasi pendek (5-10 menit) dengan visual animasi/kartun yang lucu agar tidak bosan.

Mode Remaja/Dewasa (13+ tahun): Gerakan seperti Burpee, High Knees, Plank, Mountain Climbers, dan Sit-up. Ada pilihan durasi (7 Menit HIIT, 15 Menit Kardio, 30 Menit Full Body).

2. Timer Interaktif & Workout of the Day (WOD)
Fitur utama di halaman ini adalah Timer Latihan Otomatis:

Pengguna memilih durasi (misal: 7 Menit) dan jumlah gerakan (misal: 3 gerakan).

Sistem akan membuat siklus: "Lakukan Jumping Jack selama 45 detik, Istirahat 15 detik. Lakukan Squat 45 detik, Istirahat 15 detik..."

Tampilan UI: Sebuah Progress Bar melingkar yang berputar (seperti jam) di bagian atas layar, dengan instruksi gerakan yang muncul di tengahnya secara real-time. Ada suara "Beep" di setiap pergantian gerakan.

3. Katalog Gerakan dengan Visual (Workout Library)
Bukan hanya teks, setiap gerakan memiliki tombol "Lihat Gerakan":

Visual: Menggunakan ilustrasi SVG dinamis atau GIF sederhana untuk memperlihatkan cara melakukan gerakan yang benar (agar anak-anak atau orang tua tidak cedera).

Instruksi Cepat: Misal, untuk Squat: "Berdiri tegak, dorong pinggul ke belakang, turunkan tubuh seperti hendak duduk, lalu kembali berdiri. Jangan lutut melebihi jari kaki!"

4. Kalori Terbakar & Integrasi Nutrisi (Calorie Burn Tracker)
Sistem menghitung estimasi kalori yang terbakar menggunakan rumus MET (Metabolic Equivalent of Task) berdasarkan berat badan pengguna yang sudah ada di profil.

Output: Setelah selesai berolahraga, muncul notifikasi: "Hebat! Anda membakar 105 kalori dalam 7 menit. Itu setara dengan 1 buah pisang! 🍌"

Integrasi Langsung: Di akhir sesi, sistem menawarkan tombol: "Tambahkan ke Log Olahraga", sehingga data ini masuk ke dashboard utama dan mempengaruhi rekomendasi makanan (jika kalori terbakar banyak, sistem akan menyarankan asupan protein yang lebih tinggi).

5. Heatmap Konsistensi & "Streak" (Motivator Anak)
Untuk memenuhi kriteria Efektivitas Informasi, kita tampilkan visual Heatmap Olahraga (seperti kontribusi GitHub):

Kotak-kotak kecil yang mewakili hari dalam sebulan. Warna hijau (#10B981) jika berolahraga, warna abu-abu jika tidak.

Fitur Streak (Rantai): "Anda telah berolahraga 5 hari berturut-turut! 🔥 Jangan putuskan rantainya!" – Ini sangat memotivasi anak-anak untuk terus bergerak.

6. Pengingat "Duduk Terlalu Lama" & Gerakan Ringan (Smart Alerts)
Tidak semua olahraga harus keringat. Fitur ini membaca data dari Clock sistem:

Jika aplikasi mendeteksi (atau pengguna melaporkan) bahwa mereka telah duduk/menonton gadget > 60 menit, notifikasi akan muncul: "Yuk, bangun sebentar! Lakukan peregangan leher dan bahu 2 menit agar badan tetap segar." (Langsung redirect ke halaman Olahraga > Mode Peregangan).