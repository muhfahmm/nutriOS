// REKOMENDASI FONT FAMILY NUTRIOS (GOOGLE FONTS / TAILWIND / REACT NATIVE)

export const FONT_CONFIG = {
  // 1. Plus Jakarta Sans (SANGAT DIREKOMENDASIKAN)
  // Vibe: Modern, bersih, sangat responsif di layar HP & Web. Sangat cocok untuk produk digital kesehatan modern.
  primary: {
    heading: "'Plus Jakarta Sans', sans-serif",
    body: "'Plus Jakarta Sans', sans-serif",
    googleFontUrl: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
    tailwindClass: "font-sans"
  },

  // 2. Poppins (ALTERNATIF POPULER)
  // Vibe: Geometris, ramah, hangat untuk tema keluarga, ibu & anak, serta mudah dibaca di ukuran besar.
  friendly: {
    heading: "'Poppins', sans-serif",
    body: "'Poppins', sans-serif",
    googleFontUrl: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap",
    tailwindClass: "font-poppins"
  },

  // 3. Inter (KLINIK & DATA Z-SCORE)
  // Vibe: Sangat presisi, kontras tinggi, terbaik untuk grafik Z-score WHO, tabel nutrisi, dan data angka.
  clinical: {
    heading: "'Inter', sans-serif",
    body: "'Inter', sans-serif",
    googleFontUrl: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
    tailwindClass: "font-inter"
  },

  // 4. Kombinasi Hybrid (REKOMENDASI UI/UX JUARA)
  // Heading menggunakan font bernuansa hangat (Outfit/Poppins), Body menggunakan Inter/Plus Jakarta Sans untuk data.
  hybrid: {
    heading: "'Outfit', sans-serif",       // Untuk Title, Card Header, Stat Number
    body: "'Plus Jakarta Sans', sans-serif",// Untuk Paragraf, Label Form, Navigasi
    googleFontUrl: "https://fonts.googleapis.com/css2?family=Outfit:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap"
  }
};

// PANDUAN PENGGUNAAN HIARARKI TIPOGRAFI
export const TYPOGRAPHY_SCALE = {
  heroTitle: "text-3xl md:text-5xl font-extrabold tracking-tight",
  sectionTitle: "text-2xl md:text-3xl font-bold tracking-tight",
  cardTitle: "text-lg md:text-xl font-semibold",
  bodyText: "text-sm md:text-base font-normal leading-relaxed",
  captionText: "text-xs md:text-sm font-medium text-gray-500"
};