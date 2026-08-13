# 🔧 Panduan Troubleshooting: Error Menyimpan Jadwal Tidur

## Error yang Sering Terjadi

### 1. ❌ "Tidak dapat terhubung ke server database"
**Penyebab:** Aplikasi frontend tidak bisa reach backend server pada port 3000

#### Solusi:
**Step 1: Pastikan server backend sudah berjalan**
```powershell
# Di terminal workspace, jalankan:
npm start
```

Cek apakah ada output:
```
╔════════════════════════════════════════╗
║   🚀 Auth Server Sudah Berjalan 🚀    ║
╠════════════════════════════════════════╣
║  URL: http://localhost:3000            ║
║  Health: http://localhost:3000/api/health
╚════════════════════════════════════════╝
```

**Step 2: Test endpoint health check**
```powershell
# Buka PowerShell baru, jalankan:
curl http://localhost:3000/api/health
```

Response yang benar:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2025-08-13T10:00:00.000Z",
  "api_base_url": "http://localhost:3000"
}
```

**Step 3: Jika response "disconnected", pastikan MySQL berjalan**
```powershell
# Cek MySQL service status:
Get-Service MySQL80

# Jika tidak running, start service:
Start-Service MySQL80
```

---

### 2. ❌ Port 3000 sudah dipakai
**Error message:** `Port 3000 sudah dipakai. Jalankan ulang dengan port lain:`

#### Solusi:
```powershell
# Jalankan server dengan port berbeda:
$env:APP_PORT="3001"
npm start

# Atau jika ingin kill process yang menggunakan port 3000:
# Find dan stop process di Task Manager
```

---

### 3. ❌ "Database tidak terkoneksi"
**Penyebab:** Kredensial database di `.env` salah atau MySQL tidak berjalan

#### Solusi:
**Step 1: Verifikasi MySQL credentials**
```powershell
# Buka .env file dan pastikan:
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=Hiim_110407
DB_NAME=db_nutrios
APP_PORT=3000
```

**Step 2: Test koneksi MySQL manual**
```powershell
# Gunakan MySQL CLI:
mysql -u root -p
# Password: Hiim_110407

# Atau dengan PowerShell (jika mysql tidak di PATH):
# Install MySQL Client (jika belum ada)
```

**Step 3: Verifikasi tabel `jadwal_tidur` ada**
```sql
-- Di MySQL Console:
USE db_nutrios;
SHOW TABLES;
-- Pastikan ada tabel: jadwal_tidur
```

Jika tabel tidak ada, jalankan script:
```sql
-- Copy-paste isi database.sql ke MySQL Workbench atau CLI
```

---

### 4. ❌ Request Timeout (5-10 detik)
**Error message:** Network request failed setelah menunggu

#### Solusi:
**Penyebab:** Server lambat merespons atau network connectivity issue

**Step 1: Check network connectivity**
```powershell
# Test koneksi ke backend:
ping localhost

# Atau gunakan curl untuk test endpoint:
curl http://localhost:3000/api/health
```

**Step 2: Cek firewall settings**
- Pastikan firewall tidak memblokir port 3000
- Buka Windows Defender Firewall > Allow app through firewall
- Pastikan aplikasi Node.js diizinkan

**Step 3: Restart server**
```powershell
# Stop server (Ctrl+C di terminal)
# Jalankan ulang:
npm start
```

---

### 5. ❌ "Jadwal tidur tidak disimpan" (Silent failure)
**Penyebab:** Request berhasil tapi database error tidak ditampilkan

#### Solusi:
**Step 1: Buka console log**
- Buka Expo Dev Client
- Tekan `i` (iOS) atau `a` (Android) untuk membuka emulator
- Tekan `Ctrl+M` (Android) atau `Cmd+D` (iOS)
- Pilih "View all logs" atau "Open debugger"

**Step 2: Cek console untuk error message:**
```
[Jadwal Tidur] Attempting to save data to: http://localhost:3000/api/jadwal-tidur
[Jadwal Tidur] Payload: {...}
[Jadwal Tidur] Response status: 500
[Jadwal Tidur] Response body: {...}
```

**Step 3: Cek backend console log:**
```
[API] POST /api/jadwal-tidur - Request body: {...}
[API] Processing jadwal tidur untuk userId: ...
[API] Record sudah ada, UPDATE...
```

---

## ✅ Checklist Testing

Pastikan semua ini sudah done sebelum melanjutkan:

- [ ] MySQL service sudah berjalan (`Start-Service MySQL80`)
- [ ] Tabel `jadwal_tidur` sudah dibuat di database `db_nutrios`
- [ ] File `.env` memiliki kredensial database yang benar
- [ ] Server backend berjalan (`npm start`)
- [ ] Endpoint health check merespond dengan status "connected" (`curl http://localhost:3000/api/health`)
- [ ] Aplikasi Expo sudah connected ke backend
- [ ] Mencoba menyimpan jadwal tidur dan cek console log

---

## 📱 Testing Jadwal Tidur Step-by-Step

### 1. Login atau Gunakan Guest Mode
```
- Pilih mode: Login atau Guest
- Jika login: gunakan kredensial yang sudah terdaftar
- Jika guest: langsung masuk ke halaman utama
```

### 2. Atur Jadwal Tidur
```
- Tab "Tidur": set waktu tidur (misal: 22.00)
- Tab "Bangun": set waktu bangun (misal: 06.00)
- Lihat durasi terhitung di progress bar
```

### 3. Simpan ke Database
```
- Klik tombol hijau "Simpan Target ke Database"
- Tunggu tombol loading spinner menghilang
- Cek apakah ada alert "Sukses" atau "Error"
```

### 4. Monitoring Console
```
Frontend Console:
  - [Jadwal Tidur] Attempting to save data to: http://localhost:3000/api/jadwal-tidur
  - [Jadwal Tidur] Response status: 201 (jika sukses INSERT)
  - [Jadwal Tidur] Response status: 200 (jika sukses UPDATE)

Backend Console:
  - [API] POST /api/jadwal-tidur - Request body: {...}
  - [API] User login/guest - mencari record...
  - [API] Record sudah ada/belum ada, UPDATE/INSERT...
```

### 5. Verifikasi di Database
```powershell
mysql -u root -p
# Password: Hiim_110407

USE db_nutrios;
SELECT * FROM jadwal_tidur;
```

---

## 🐛 Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| "Network request failed" | Backend tidak running | `npm start` di terminal baru |
| "Database tidak terkoneksi" | MySQL belum start | `Start-Service MySQL80` |
| "Port 3000 sudah dipakai" | Port digunakan app lain | `$env:APP_PORT="3001"; npm start` |
| "Data tidak disimpan" | Validasi input gagal | Cek format: `sleepTime` & `wakeTime` harus format "HH.MM" |
| Blank error message | Response parse gagal | Cek server console untuk error details |

---

## 📞 Support Info

**Jika masih error:**
1. Copy full console log dari frontend dan backend
2. Jalankan health check: `curl http://localhost:3000/api/health`
3. Cek MySQL connection: `mysql -u root -p`
4. Verifikasi tabel dan data: `SELECT * FROM jadwal_tidur;`
5. Restart semua services dan coba lagi

**Files to check:**
- `.env` - Database credentials
- `auth/server.js` - Backend endpoint
- `card_menu/1_jadwal_tidur/index.js` - Frontend client
- `auth/api.js` - API_BASE_URL configuration
