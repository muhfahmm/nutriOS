const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'db_nutrios',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
};

let pool;
async function initializeDatabase() {
  try {
    console.log('');
    console.log('🔍 Attempting to connect to MySQL...');
    console.log(`   Host: ${dbConfig.host}`);
    console.log(`   User: ${dbConfig.user}`);
    console.log(`   Database: ${dbConfig.database}`);
    console.log(`   Port: ${dbConfig.port}`);
    
    pool = mysql.createPool({
      ...dbConfig,
      connectionLimit: 10,
    });
    
    // Test the connection
    const connection = await pool.getConnection();
    console.log('✅ Koneksi ke database MySQL berhasil.');
    
    // Try to query the jadwal_tidur table to verify it exists
    try {
      const [tables] = await connection.execute('SHOW TABLES LIKE "jadwal_tidur"');
      if (tables.length === 0) {
        console.warn('⚠️  WARNING: Tabel jadwal_tidur tidak ditemukan!');
        console.warn('    Pastikan database.sql sudah dijalankan atau tabel sudah dibuat.');
      } else {
        console.log('✅ Tabel jadwal_tidur ditemukan.');
      }
    } catch (tableError) {
      console.warn('⚠️  Tidak bisa memverifikasi tabel jadwal_tidur:', tableError.message);
    }
    
    connection.release();
  } catch (error) {
    console.error('');
    console.error('❌ KONEKSI DATABASE GAGAL!');
    console.error('');
    console.error('Detail Error:');
    console.error(`   Code: ${error.code}`);
    console.error(`   Message: ${error.message}`);
    console.error('');
    console.error('Kemungkinan penyebab:');
    
    if (error.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('   1. MySQL service tidak berjalan');
      console.error('   2. Host/Port tidak benar');
      console.error('   3. Firewall memblokir koneksi');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('   1. Username atau password salah di .env');
      console.error('   2. User tidak memiliki privilege');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('   1. Database belum dibuat');
      console.error('   2. Nama database di .env tidak benar');
    }
    
    console.error('');
    console.error('Solusi:');
    console.error('   1. Pastikan XAMPP MySQL sudah running');
    console.error('   2. Verifikasi .env file untuk DB_HOST, DB_USER, DB_PASSWORD, DB_NAME');
    console.error('   3. Cek MySQL di XAMPP Control Panel');
    console.error('');
  }
}

initializeDatabase();

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    database: pool ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    api_base_url: `${req.protocol}://${req.get('host')}`,
  });
});

// Registrasi User baru ke database
app.post('/api/register', async (req, res) => {
  try {
    const { nama_lengkap, email, password, nomor_telepon } = req.body;
    if (!nama_lengkap || !email || !password) {
      return res.status(400).json({ message: 'Nama lengkap, email, dan password wajib diisi.' });
    }

    if (!pool) {
      return res.status(500).json({ message: 'Database tidak terkoneksi.' });
    }

    const [existingUser] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(409).json({ message: 'Email sudah terdaftar.' });
    }

    const passwordHash = bcrypt.hashSync(password, 12);
    const [result] = await pool.execute(
      'INSERT INTO users (nama_lengkap, email, password, nomor_telepon) VALUES (?, ?, ?, ?)',
      [nama_lengkap, email, passwordHash, nomor_telepon || null]
    );

    return res.status(201).json({ message: 'Registrasi berhasil.', userId: result.insertId });
  } catch (error) {
    console.error('Error Register:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server saat registrasi.' });
  }
});

// Login User
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password wajib diisi.' });
    }

    if (!pool) {
      return res.status(500).json({ message: 'Database tidak terkoneksi.' });
    }

    const [rows] = await pool.execute('SELECT id, nama_lengkap, email, password, nomor_telepon, foto_profil FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Email atau password salah.' });
    }

    const user = rows[0];
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email atau password salah.' });
    }

    const safeUser = {
      id: user.id,
      nama_lengkap: user.nama_lengkap,
      email: user.email,
      nomor_telepon: user.nomor_telepon,
      foto_profil: user.foto_profil,
    };

    return res.json({ message: 'Login berhasil.', user: safeUser });
  } catch (error) {
    console.error('Error Login:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server saat login.' });
  }
});

// Menyimpan atau memperbarui jadwal tidur harian user
app.post('/api/jadwal-tidur', async (req, res) => {
  try {
    console.log('[API] POST /api/jadwal-tidur - Request body:', JSON.stringify(req.body));
    
    const { userId, sleepTime, wakeTime, ageGroup, notifBedtime, notifScreenFree } = req.body;
    
    // Validasi input
    if (!sleepTime || !wakeTime) {
      console.log('[API] Validation error: sleepTime atau wakeTime missing');
      return res.status(400).json({ message: 'Data tidak lengkap (sleepTime dan wakeTime diperlukan).' });
    }

    // Cek database connection
    if (!pool) {
      console.error('[API] Database pool tidak tersedia');
      return res.status(500).json({ message: 'Database tidak terkoneksi.' });
    }

    console.log('[API] Processing jadwal tidur untuk userId:', userId || 'guest');

    // Jika userId ada, gunakan update/insert ter-asosiasi
    if (userId) {
      console.log('[API] User login - mencari record untuk user_id:', userId);
      const [existing] = await pool.execute('SELECT id FROM jadwal_tidur WHERE user_id = ?', [userId]);
      
      if (existing.length > 0) {
        console.log('[API] Record sudah ada, UPDATE...');
        await pool.execute(
          `UPDATE jadwal_tidur 
           SET sleep_time = ?, wake_time = ?, age_group = ?, notif_bedtime = ?, notif_screen_free = ? 
           WHERE user_id = ?`,
          [sleepTime, wakeTime, ageGroup || 'Dewasa', notifBedtime ? 1 : 0, notifScreenFree ? 1 : 0, userId]
        );
        console.log('[API] UPDATE berhasil');
        return res.json({ message: 'Jadwal tidur berhasil diperbarui.' });
      } else {
        console.log('[API] Record belum ada, INSERT...');
        await pool.execute(
          `INSERT INTO jadwal_tidur (user_id, sleep_time, wake_time, age_group, notif_bedtime, notif_screen_free) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [userId, sleepTime, wakeTime, ageGroup || 'Dewasa', notifBedtime ? 1 : 0, notifScreenFree ? 1 : 0]
        );
        console.log('[API] INSERT berhasil');
        return res.status(201).json({ message: 'Jadwal tidur berhasil disimpan.' });
      }
    } else {
      // User tidak login: simpan sebagai data guest baru atau perbarui record guest terakhir (user_id IS NULL)
      console.log('[API] User guest - mencari record dengan user_id IS NULL');
      const [existingGuest] = await pool.execute('SELECT id FROM jadwal_tidur WHERE user_id IS NULL ORDER BY id DESC LIMIT 1');
      
      if (existingGuest.length > 0) {
        console.log('[API] Guest record sudah ada, UPDATE...');
        await pool.execute(
          `UPDATE jadwal_tidur 
           SET sleep_time = ?, wake_time = ?, age_group = ?, notif_bedtime = ?, notif_screen_free = ? 
           WHERE user_id IS NULL`,
          [sleepTime, wakeTime, ageGroup || 'Dewasa', notifBedtime ? 1 : 0, notifScreenFree ? 1 : 0]
        );
        console.log('[API] Guest UPDATE berhasil');
        return res.json({ message: 'Jadwal tidur tamu berhasil diperbarui.' });
      } else {
        console.log('[API] Guest record belum ada, INSERT...');
        await pool.execute(
          `INSERT INTO jadwal_tidur (user_id, sleep_time, wake_time, age_group, notif_bedtime, notif_screen_free) 
           VALUES (NULL, ?, ?, ?, ?, ?)`,
          [sleepTime, wakeTime, ageGroup || 'Dewasa', notifBedtime ? 1 : 0, notifScreenFree ? 1 : 0]
        );
        console.log('[API] Guest INSERT berhasil');
        return res.status(201).json({ message: 'Jadwal tidur tamu berhasil disimpan.' });
      }
    }
  } catch (error) {
    console.error('[API] Error saving sleep schedule:', error.message);
    console.error('[API] Full error stack:', error);
    return res.status(500).json({ 
      message: 'Terjadi kesalahan server saat menyimpan jadwal tidur.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Mendapatkan jadwal tidur harian user
app.get('/api/jadwal-tidur/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!pool) {
      return res.status(500).json({ message: 'Database tidak terkoneksi.' });
    }

    const [rows] = await pool.execute('SELECT sleep_time, wake_time, age_group, notif_bedtime, notif_screen_free FROM jadwal_tidur WHERE user_id = ?', [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Jadwal tidur belum diatur.' });
    }

    const data = rows[0];
    return res.json({
      sleepTime: data.sleep_time,
      wakeTime: data.wake_time,
      ageGroup: data.age_group,
      notifBedtime: data.notif_bedtime === 1,
      notifScreenFree: data.notif_screen_free === 1,
    });
  } catch (error) {
    console.error('Error getting sleep schedule:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server saat mengambil jadwal tidur.' });
  }
});


const port = process.env.APP_PORT || 3000;
const server = app.listen(port, '0.0.0.0', () => {
  console.log('');
  console.log('╔════════════════════════════════════════╗');
  console.log('║   🚀 Auth Server Sudah Berjalan 🚀    ║');
  console.log('╠════════════════════════════════════════╣');
  console.log(`║  URL: http://localhost:${port.toString().padEnd(28)}║`);
  console.log(`║  Health: http://localhost:${port}/api/health${' '.repeat(15)}║`);
  console.log(`║  Port: ${port.toString().padEnd(32)}║`);
  console.log('╚════════════════════════════════════════╝');
  console.log('');
  console.log('📝 Available endpoints:');
  console.log('   - POST /api/register - Registrasi user');
  console.log('   - POST /api/login - Login user');
  console.log('   - POST /api/jadwal-tidur - Simpan jadwal tidur');
  console.log('   - GET /api/jadwal-tidur/:userId - Ambil jadwal tidur');
  console.log('');
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error('');
    console.error('❌ ERROR: Port', port, 'sudah dipakai oleh aplikasi lain.');
    console.error('Solusi:');
    console.error('  1. Jalankan dengan port lain:');
    console.error('     $env:APP_PORT="3001"; npm start');
    console.error('  2. Atau hentikan proses yang menggunakan port', port);
    console.error('');
  } else {
    console.error('❌ Terjadi error server:', error);
  }
  process.exit(1);
});
