/**
 * AI Suggestion Engine (Rule-based Expert System) untuk Kalkulator Pertumbuhan
 * Memberikan saran Pola Makan, Pola Tidur, Olahraga, dan Saran Tambahan
 * berdasarkan IMT (Dewasa) maupun Z-Score/Status Gizi (Anak)
 */

export function getAISuggestions({ type, gender, weight, height, status, age }) {
  if (type === 'adult') {
    return getAdultSuggestions(status, age, gender);
  } else {
    return getChildSuggestions(status, age); // age di sini dalam bulan
  }
}

// 1. Logika Saran untuk User Dewasa/Orang Tua
function getAdultSuggestions(status, age, gender) {
  const normalizedStatus = status ? status.toLowerCase() : 'normal';

  if (normalizedStatus.includes('pendek')) {
    return {
      polaMakan: {
        title: 'Nutrisi Pendongkrak Tinggi Badan',
        desc: 'Prioritaskan konsumsi kalsium (susu, keju, yoghurt), Vitamin D (kuning telur, salmon, berjemur), dan zinc. Pastikan asupan protein hewani tinggi (daging, ikan) tercukupi setiap hari.'
      },
      polaTidur: {
        title: 'Tidur Nyenyak di Puncak HGH',
        desc: 'Tidur teratur sebelum jam 10 malam selama 8-10 jam. Hormon Pertumbuhan (HGH) dilepaskan secara maksimal antara pukul 22.00 dan 02.00 dini hari saat fase Deep Sleep.'
      },
      olahraga: {
        title: 'Latihan Peregangan & Vertikal',
        desc: 'Fokus pada olahraga penstimulasi lempeng pertumbuhan tulang (epiphyseal plate) secara vertikal: lompat tali (skipping), berenang, basket, badminton, atau menggantung (hanging).'
      },
      tambahan: {
        title: 'Pemeriksaan Lempeng Tulang',
        desc: 'Disarankan berkonsultasi ke dokter ortopedi atau spesialis anak untuk mengecek lempeng epifisis tulang guna memastikan apakah ruang tumbuh tinggi badan Anda masih terbuka.'
      }
    };
  }

  if (normalizedStatus.includes('kurus')) {
    return {
      polaMakan: {
        title: 'Surplus Kalori & Protein Tinggi',
        desc: 'Tingkatkan frekuensi makan menjadi 5-6 kali sehari dengan porsi kecil tapi padat gizi. Konsumsi makanan kaya protein (daging ayam, telur, tempe, ikan) dan lemak sehat (alpukat, kacang-kacangan).'
      },
      polaTidur: {
        title: 'Istirahat Cukup & Hindari Begadang',
        desc: 'Tidur nyenyak 7-8 jam per hari sangat penting untuk regenerasi sel dan pembentukan otot baru. Begadang dapat mengacaukan metabolisme dan mempersulit peningkatan berat badan.'
      },
      olahraga: {
        title: 'Latihan Beban (Strength Training)',
        desc: 'Lakukan latihan angkat beban ringan hingga sedang 3-4 kali seminggu untuk membentuk massa otot (bukan lemak). Batasi olahraga kardio berat seperti lari jarak jauh.'
      },
      tambahan: {
        title: 'Hidrasi & Suplemen',
        desc: 'Minum minimal 2.5 liter air sehari. Jika diperlukan, tambahkan multivitamin atau susu penambah berat badan setelah berkonsultasi dengan ahli gizi.'
      }
    };
  } else if (normalizedStatus.includes('normal')) {
    return {
      polaMakan: {
        title: 'Nutrisi Seimbang & Kontrol Gula',
        desc: 'Terapkan metode piring sehat (setengah sayur/buah, seperempat protein, seperempat karbohidrat kompleks). Batasi konsumsi gula, garam, dan minyak berlebih.'
      },
      polaTidur: {
        title: 'Pertahankan Pola Tidur Konsisten',
        desc: 'Tidur teratur selama 7-8 jam setiap malam. Usahakan tidur dan bangun di jam yang sama setiap hari untuk menjaga ritme sirkadian tubuh tetap ideal.'
      },
      olahraga: {
        title: 'Kombinasi Kardio & Latihan Beban',
        desc: 'Lakukan olahraga minimal 150 menit per minggu (misal: jalan cepat, bersepeda, atau berenang) dikombinasikan dengan latihan kekuatan otot 2 kali seminggu.'
      },
      tambahan: {
        title: 'Gaya Hidup Aktif & Bebas Stres',
        desc: 'Kurangi kebiasaan terlalu lama duduk (sedentary lifestyle). Kelola stres Anda melalui meditasi atau aktivitas menyenangkan karena stres memicu fluktuasi berat badan.'
      }
    };
  } else if (normalizedStatus.includes('gemuk') || normalizedStatus.includes('kelebihan')) {
    return {
      polaMakan: {
        title: 'Defisit Kalori Ringan & Serat Tinggi',
        desc: 'Kurangi porsi makan harian sekitar 300-500 kalori dari kebutuhan harian. Ganti karbohidrat sederhana dengan karbohidrat kompleks (nasi merah, oats) dan perbanyak makan sayur.'
      },
      polaTidur: {
        title: 'Tidur Cukup untuk Pembakaran Lemak',
        desc: 'Kurang tidur (kurang dari 6 jam) dapat memicu hormon ghrelin yang meningkatkan nafsu makan. Pastikan tidur nyenyak 7-8 jam untuk membantu pembakaran kalori malam.'
      },
      olahraga: {
        title: 'Kardio Sedang & Pembakaran Lemak',
        desc: 'Lakukan latihan kardio intensitas sedang seperti jalan cepat, jogging ringan, atau aerobik selama 45 menit, 4-5 kali seminggu untuk memaksimalkan pembakaran lemak.'
      },
      tambahan: {
        title: 'Kurangi Minuman Manis & Pantau Berat',
        desc: 'Hindari minuman kemasan, teh manis, dan kopi kekinian yang tinggi gula. Timbang berat badan Anda secara konsisten seminggu sekali di pagi hari setelah bangun tidur.'
      }
    };
  } else {
    // Obesitas
    return {
      polaMakan: {
        title: 'Diet Rendah Kalori & Karbohidrat Sederhana',
        desc: 'Pangkas porsi makan, hindari gorengan, tepung-tepungan, dan gula pasir. Utamakan protein tanpa lemak (dada ayam, putih telur, ikan) dan perbanyak porsi sayuran hijau.'
      },
      polaTidur: {
        title: 'Hindari Makan Sebelum Tidur',
        desc: 'Jangan mengonsumsi makanan berat dalam kurun waktu 3 jam sebelum tidur. Tidur 7-8 jam berkualitas sangat vital untuk menjaga hormon leptin (penahan nafsu makan) tetap bekerja baik.'
      },
      olahraga: {
        title: 'Olahraga Low-Impact (Aman Sendi)',
        desc: 'Pilih olahraga yang aman untuk sendi lutut seperti jalan kaki santai, bersepeda statis, atau berenang selama 30-45 menit sehari. Hindari lompat-lompat atau lari berat.'
      },
      tambahan: {
        title: 'Konsultasi Medis & Kurangi Duduk',
        desc: 'Disarankan berkonsultasi dengan dokter atau ahli gizi untuk program penurunan berat badan yang aman. Gunakan tangga dibanding lift dan biasakan berjalan kaki ringan.'
      }
    };
  }
}

// 2. Logika Saran untuk Tumbuh Kembang Anak (Balita/Anak-anak)
function getChildSuggestions(status, ageMonths) {
  const normalizedStatus = status ? status.toLowerCase() : 'normal';

  if (normalizedStatus.includes('pendek') || normalizedStatus.includes('stunting')) {
    return {
      polaMakan: {
        title: 'Nutrisi Cegah Stunting (Tinggi Kalsium)',
        desc: 'Fokus pada protein hewani berkualitas tinggi (susu formula, yogurt, telur, hati ayam, dan daging merah). Pastikan asupan kalsium dan vitamin D terpenuhi untuk mendukung mineralisasi tulang anak.'
      },
      polaTidur: {
        title: 'Tidur Berkualitas Untuk Pelepasan HGH',
        desc: 'Balita memerlukan tidur teratur 11-13 jam sehari. Hormon pertumbuhan (HGH) dilepaskan hingga 75% saat anak tidur lelap. Pastikan anak tidur sebelum jam 9 malam.'
      },
      olahraga: {
        title: 'Aktivitas Fisik Vertikal & Peregangan',
        desc: 'Bantu anak melakukan aktivitas fisik aktif yang menstimulasi tulang vertikal, seperti bermain kejar-kejaran, bermain tali lompat, menggantung di tiang panjat ramah anak, atau berenang.'
      },
      tambahan: {
        title: 'Konsultasi Spesialis Anak',
        desc: 'Bawa anak ke klinik tumbuh kembang atau dokter spesialis anak (pediatri) untuk mendapatkan diagnosis menyeluruh terkait potensi gangguan hormonal atau nutrisi.'
      }
    };
  }

  if (normalizedStatus.includes('kurang') || normalizedStatus.includes('buruk') || normalizedStatus.includes('waspada')) {
    return {
      polaMakan: {
        title: 'Tinggi Kalori & Protein Hewani (TKPH)',
        desc: 'Prioritaskan protein hewani (telur, daging ayam, daging sapi, ikan) pada setiap porsi makan anak. Tambahkan lemak sehat (mentega, minyak zaitun) ke dalam MPASI anak untuk mendongkrak kalori.'
      },
      polaTidur: {
        title: 'Tidur Siang & Malam yang Cukup',
        desc: `Anak seusia ini memerlukan tidur total sekitar ${ageMonths < 12 ? '12-16' : '11-14'} jam sehari. Hormon pertumbuhan (HGH) diproduksi secara maksimal saat anak sedang tidur nyenyak.`
      },
      olahraga: {
        title: 'Aktivitas Fisik & Stimulasi Ringan',
        desc: 'Berikan stimulasi fisik yang aman sesuai usianya (merangkak, belajar berjalan, bermain pasir). Jangan biarkan anak kelelahan karena energinya diperlukan untuk tumbuh kembang.'
      },
      tambahan: {
        title: 'Pantau Posyandu & Imunisasi',
        desc: 'Wajib melakukan kontrol bulanan di Posyandu/Puskesmas. Konsultasikan dengan dokter spesialis anak jika berat badan tidak naik selama 2 bulan berturut-turut.'
      }
    };
  } else if (normalizedStatus.includes('normal')) {
    return {
      polaMakan: {
        title: 'Pertahankan MPASI/Makanan Seimbang',
        desc: 'Berikan variasi makanan seimbang setiap hari. Pastikan anak makan 3 kali makanan utama dan 2 kali makanan selingan (buah, puding susu) dengan porsi sesuai usianya.'
      },
      polaTidur: {
        title: 'Rutinitas Tidur Konsisten',
        desc: 'Jaga jadwal tidur siang dan tidur malam tetap teratur. Buat suasana tenang di kamar tidur (redupkan lampu, matikan gadget/TV) minimal 30 menit sebelum tidur.'
      },
      olahraga: {
        title: 'Stimulasi Motorik Aktif',
        desc: 'Fasilitasi anak untuk aktif bergerak. Biarkan anak bebas bermain di area yang aman untuk merangsang kekuatan otot, keseimbangan, serta perkembangan kognitifnya.'
      },
      tambahan: {
        title: 'Lanjutkan Pemantauan KMS',
        desc: 'Lanjutkan penimbangan rutin setiap bulan dan pastikan grafik pada KMS Digital tetap mengikuti garis hijau standar pertumbuhan WHO.'
      }
    };
  } else {
    // Gizi Lebih / Obesitas Anak
    return {
      polaMakan: {
        title: 'Batasi Cemilan Manis & Fast Food',
        desc: 'Kurangi jajanan tinggi gula (permen, es krim, biskuit manis) dan fast food. Ganti cemilan dengan buah segar potong. Hindari menyuapi anak sambil bermain gadget.'
      },
      polaTidur: {
        title: 'Tidur Teratur & Cukup',
        desc: 'Kurang tidur pada anak berhubungan erat dengan risiko obesitas di kemudian hari. Pastikan anak tidur malam tepat waktu dan tidak tidur terlalu larut.'
      },
      olahraga: {
        title: 'Perbanyak Permainan Aktif di Luar',
        desc: 'Ajak anak bermain aktif di luar ruangan seperti kejar-kejaran, bermain bola, atau bersepeda ringan minimal 1 jam sehari. Batasi waktu menonton TV/HP (maksimal 1 jam).'
      },
      tambahan: {
        title: 'Kontrol Berat Badan Tanpa Diet Ketat',
        desc: 'Jangan membatasi porsi makan secara ekstrem tanpa saran dokter anak. Fokuslah menjaga berat badan tetap stabil seiring bertambahnya tinggi badan anak.'
      }
    };
  }
}

// 3. Klasifikasi IMT Dinamis Berdasarkan Usia (Remaja vs Dewasa) & Jenis Kelamin (Pria vs Wanita)
export function classifyUserIMT(weight, height, age, gender) {
  const heightMeters = height / 100;
  const imt = weight / (heightMeters * heightMeters);
  const imtRounded = Math.round(imt * 100) / 100;

  let status = 'Normal';
  let color = '#10B981';
  let desc = 'Status gizi Anda dalam batas normal. Pertahankan pola hidup sehat!';
  
  // Deteksi Pendek / Stunting (TB tidak cocok untuk seusianya)
  let isPendek = false;
  if (age < 20) {
    // Estimasi TB minimal persentil 3 WHO/CDC anak/remaja
    const minHeightAllowed = 78 + (age * 4.6) + (gender === 'Laki-laki' ? 1.0 : 0);
    if (height < minHeightAllowed) {
      isPendek = true;
    }
  } else {
    // Dewasa
    const minAdultHeight = gender === 'Laki-laki' ? 152 : 142;
    if (height < minAdultHeight) {
      isPendek = true;
    }
  }

  if (age < 20) {
    // Kategori Anak & Remaja (2 - 19 Tahun) - Menggunakan estimasi Persentil BMI WHO/CDC
    const isMale = gender === 'Laki-laki';
    
    // Formula regresi linier sederhana untuk memetakan kurva BMI anak/remaja (2-19 tahun)
    const base5th = 12.5 + (age * 0.28) + (isMale ? 0.1 : 0);
    const base85th = 15.0 + (age * 0.55) + (isMale ? 0.3 : 0);
    const base95th = 16.5 + (age * 0.68) + (isMale ? 0.4 : 0);

    if (imtRounded < base5th) {
      status = 'Kurus (Remaja)';
      color = '#F59E0B';
      desc = `IMT anak/remaja (${imtRounded}) di bawah standar ideal persentil 5 standar usia ${age} tahun. Disarankan menambah porsi makan bergizi.`;
    } else if (imtRounded >= base5th && imtRounded < base85th) {
      status = 'Normal (Remaja)';
      color = '#10B981';
      desc = `IMT anak/remaja (${imtRounded}) berada di rentang ideal untuk kategori usia ${age} tahun. Jaga aktivitas fisik hariannya.`;
    } else if (imtRounded >= base85th && imtRounded < base95th) {
      status = 'Kelebihan Berat Badan (Remaja)';
      color = '#F97316';
      desc = `IMT anak/remaja (${imtRounded}) di atas persentil 85 standar usia ${age} tahun. Kurangi konsumsi jajanan manis.`;
    } else {
      status = 'Obesitas (Remaja)';
      color = '#EF4444';
      desc = `IMT anak/remaja (${imtRounded}) melampaui persentil 95 standar usia ${age} tahun. Disarankan konsultasi medis.`;
    }
  } else {
    // Kategori Dewasa (>= 20 Tahun) - Menggunakan Standar Kemenkes RI yang disesuaikan gender
    const isMale = gender === 'Laki-laki';
    
    // Batas normal wanita indonesia sedikit lebih ketat dibanding pria untuk menghindari overweight terselubung
    const underweightLimit = 18.5;
    const normalLimit = isMale ? 25.0 : 24.2;
    const overweightLimit = 27.0;

    if (imtRounded < underweightLimit) {
      status = 'Kurus';
      color = '#F59E0B';
      desc = `IMT Anda ${imtRounded} (Kategori Kurus). Disarankan untuk meningkatkan asupan kalori & protein hewani secara konsisten.`;
    } else if (imtRounded >= underweightLimit && imtRounded < normalLimit) {
      status = 'Normal (Ideal)';
      color = '#10B981';
      desc = `IMT Anda ${imtRounded} (Kategori Normal/Ideal). Kondisi fisik Anda sangat baik, pertahankan kebiasaan makan teratur.`;
    } else if (imtRounded >= normalLimit && imtRounded < overweightLimit) {
      status = 'Kelebihan Berat Badan';
      color = '#F97316';
      desc = `IMT Anda ${imtRounded} (Kategori Gemuk/Overweight). Disarankan untuk mulai defisit kalori ringan dan menambah durasi olahraga.`;
    } else {
      status = 'Obesitas';
      color = '#EF4444';
      desc = `IMT Anda ${imtRounded} (Kategori Obesitas). Diperlukan konsultasi medis dan pengaturan pola diet ketat untuk kesehatan jantung Anda.`;
    }
  }

  if (isPendek) {
    status = status + ' & Pendek (Stunting)';
    color = '#EF4444';
    desc = desc + ` Peringatan: Tinggi Badan Anda (${height} cm) tergolong rendah untuk kategori seusia Anda (Pendek/Stunting).`;
  }

  return {
    imt: imtRounded,
    status,
    color,
    desc
  };
}
