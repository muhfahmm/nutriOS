# ✅ XAMPP Database Setup - FIXED

## 🎯 Problem yang Ditemukan & Solusi

### ❌ **Error: Access denied for user 'root'@'localhost'**

**Root Cause:** Password di `.env` salah. XAMPP default MySQL tidak memiliki password untuk user `root`.

**Solusi:** 
```env
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=
DB_NAME=db_nutrios
APP_PORT=3000
```

**Password field harus KOSONG** (tidak ada password)

---

## ✅ Verification Results

Semua test sudah PASSED:

```
✅ Database Connection: OK
   • Host: 127.0.0.1
   • Port: 3306
   • User: root
   • Database: db_nutrios
   • Tables: 3 (anak, jadwal_tidur, users)

✅ Tabel jadwal_tidur Structure:
   • id (int) - Primary Key
   • user_id (int) - Foreign Key to users table
   • sleep_time (varchar)
   • wake_time (varchar)
   • age_group (varchar)
   • notif_bedtime (tinyint)
   • notif_screen_free (tinyint)
   • created_at (timestamp)
   • updated_at (timestamp)

✅ Server Backend: OK
   • Running on: http://localhost:3000
   • Health Check: ✅ Connected

✅ API Configuration: OK
   • API_BASE_URL: http://127.0.0.1:3000
   • Configured in: app.json (extra.API_HOST, extra.API_PORT)
```

---

## 🚀 How to Run

### 1. Start XAMPP MySQL
- Buka XAMPP Control Panel
- Klik **Start** pada MySQL module
- Pastikan status adalah **Running** (warna hijau)

### 2. Start Backend Server
```powershell
cd c:\utama\project\lomba\nutriOSandro
npm start
```

Expected output:
```
╔════════════════════════════════════════╗
║   🚀 Auth Server Sudah Berjalan 🚀    ║
╠════════════════════════════════════════╣
║  URL: http://localhost:3000            ║
║  Health: http://localhost:3000/api/... ║
╚════════════════════════════════════════╝

✅ Koneksi ke database MySQL berhasil.
✅ Tabel jadwal_tidur ditemukan.
```

### 3. Run Mobile App
```powershell
# Di terminal Expo atau mobile device
# Buka app dan test menyimpan jadwal tidur
```

---

## 🧪 Testing Database Connection

Run test script anytime:
```powershell
node test-connection.js
```

This will verify:
- MySQL connection
- Database tables
- Server backend connectivity
- All configurations

---

## 📝 API Endpoints

### Save Sleep Schedule
```
POST /api/jadwal-tidur

Request:
{
  "userId": 1,                    // Optional, null untuk guest
  "sleepTime": "22.00",           // Format HH.MM
  "wakeTime": "06.00",            // Format HH.MM
  "ageGroup": "Dewasa",           // Bayi, Anak, Dewasa
  "notifBedtime": true,           // Boolean
  "notifScreenFree": false        // Boolean
}

Response (Success):
{
  "message": "Jadwal tidur berhasil disimpan."
}
```

### Get Sleep Schedule
```
GET /api/jadwal-tidur/:userId

Response (Success):
{
  "sleepTime": "22.00",
  "wakeTime": "06.00",
  "ageGroup": "Dewasa",
  "notifBedtime": true,
  "notifScreenFree": false
}
```

### Health Check
```
GET /api/health

Response:
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2025-08-13T10:00:00.000Z",
  "api_base_url": "http://localhost:3000"
}
```

---

## 🐛 Troubleshooting

### Error: "Tidak dapat terhubung ke server database"
**Solution:**
1. Cek apakah MySQL sudah berjalan di XAMPP
2. Cek `.env` file - pastikan password kosong
3. Run test script: `node test-connection.js`

### Error: "Port 3000 sudah dipakai"
**Solution:**
```powershell
$env:APP_PORT="3001"
npm start
```

### Error: "Database tidak terkoneksi"
**Solution:**
1. Pastikan XAMPP MySQL sudah running
2. Verify `.env` configuration
3. Check MySQL credentials di XAMPP

---

## 📚 Files Changed

- `.env` - Fixed DB_PASSWORD to empty
- `app.json` - Added API configuration in extra
- `auth/server.js` - Enhanced logging dan error messages
- `test-connection.js` - Created new test script
- `DEBUGGING_JADWAL_TIDUR.md` - Troubleshooting guide

---

## ✅ Next Steps

1. ✅ Database setup: DONE
2. ✅ Server backend: RUNNING
3. ✅ API configuration: OK
4. 🔄 Test app dalam emulator/device
5. 🔄 Verify data tersimpan di database

**Status: READY TO TEST** 🚀
