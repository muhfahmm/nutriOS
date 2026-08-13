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
    const { nama_lengkap, username, email, password } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email wajib diisi.' });
    }
    if (!nama_lengkap || !username || !email || !password) {
      return res.status(400).json({ message: 'Nama lengkap, username, dan password wajib diisi.' });
    }

    if (!pool) {
      return res.status(500).json({ message: 'Database tidak terkoneksi.' });
    }

    const [existingUser] = await pool.execute('SELECT id FROM users WHERE username = ?', [username]);
    if (existingUser.length > 0) {
      return res.status(409).json({ message: 'Username sudah terdaftar.' });
    }

    const passwordHash = bcrypt.hashSync(password, 12);
    const [result] = await pool.execute(
      'INSERT INTO users (nama_lengkap, username, email, password) VALUES (?, ?, ?, ?)',
      [nama_lengkap, username, email, passwordHash]
    );

    return res.status(201).json({ message: 'Registrasi berhasil.', userId: result.insertId });
  } catch (error) {
    console.error('Error Register:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server saat registrasi.' });
  }
});

// Cek ketersediaan username
app.get('/api/check-username', async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ message: 'Username wajib disertakan.' });
    }
    if (!pool) return res.status(500).json({ message: 'Database tidak terkoneksi.' });

    const [rows] = await pool.execute('SELECT id FROM users WHERE username = ?', [username]);
    return res.json({ taken: rows.length > 0 });
  } catch (error) {
    console.error('Error checking username:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan saat memeriksa username.' });
  }
});


// Login User
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username dan password wajib diisi.' });
    }

    if (!pool) {
      return res.status(500).json({ message: 'Database tidak terkoneksi.' });
    }

    const [rows] = await pool.execute('SELECT id, nama_lengkap, username, email, password, foto_profil FROM users WHERE username = ?', [username]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Username atau password salah.' });
    }

    const user = rows[0];
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Username atau password salah.' });
    }

    const safeUser = {
      id: user.id,
      nama_lengkap: user.nama_lengkap,
      username: user.username,
      email: user.email,
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
          ` jadwal_tidur (user_id, sleep_time, wake_time, age_group, notif_bedtime, notif_screen_free) 
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


// Ganti Password User (Menggunakan GET sesuai request user)
app.get('/api/ganti-password', async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.query;

    if (!userId || !oldPassword || !newPassword) {
      return res.status(400).json({ message: 'User ID, password lama, dan password baru wajib diisi.' });
    }

    if (!pool) return res.status(500).json({ message: 'Database tidak terkoneksi.' });

    // 1. Ambil user dari database
    const [rows] = await pool.execute('SELECT password FROM users WHERE id = ?', [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }

    // 2. Bandingkan password lama
    const userDb = rows[0];
    const passwordIsValid = bcrypt.compareSync(oldPassword, userDb.password);
    if (!passwordIsValid) {
      return res.status(401).json({ message: 'Password lama salah.' });
    }

    // 3. Hash password baru & simpan ke DB
    const newPasswordHash = bcrypt.hashSync(newPassword, 12);
    await pool.execute('UPDATE users SET password = ? WHERE id = ?', [newPasswordHash, userId]);

    return res.json({ message: 'Password berhasil diperbarui.' });
  } catch (error) {
    console.error('Error changing password:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server saat memperbarui password.' });
  }
});


// === ENDPOINT ANAK (CRUD) ===

// Mendapatkan daftar anak berdasarkan userId
app.get('/api/anak/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!pool) return res.status(500).json({ message: 'Database tidak terkoneksi.' });

    const [rows] = await pool.execute(
      'SELECT id, nama_anak, DATE_FORMAT(tanggal_lahir, "%Y-%m-%d") as tanggal_lahir, jenis_kelamin, status_z_score FROM anak WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return res.json(rows);
  } catch (error) {
    console.error('Error getting children:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server saat mengambil data anak.' });
  }
});

// Menambahkan data anak baru
app.post('/api/anak', async (req, res) => {
  try {
    const { userId, nama_anak, tanggal_lahir, jenis_kelamin, status_z_score } = req.body;
    if (!userId || !nama_anak) {
      return res.status(400).json({ message: 'User ID dan nama anak wajib diisi.' });
    }
    if (!pool) return res.status(500).json({ message: 'Database tidak terkoneksi.' });

    const [result] = await pool.execute(
      'INSERT INTO anak (user_id, nama_anak, tanggal_lahir, jenis_kelamin, status_z_score) VALUES (?, ?, ?, ?, ?)',
      [userId, nama_anak, tanggal_lahir || null, jenis_kelamin || null, status_z_score || 'Normal']
    );

    return res.status(201).json({
      message: 'Profil anak berhasil ditambahkan.',
      anakId: result.insertId
    });
  } catch (error) {
    console.error('Error adding child:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server saat menambah data anak.' });
  }
});

// Menghapus data anak
app.delete('/api/anak/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!pool) return res.status(500).json({ message: 'Database tidak terkoneksi.' });

    await pool.execute('DELETE FROM anak WHERE id = ?', [id]);
    return res.json({ message: 'Profil anak berhasil dihapus.' });
  } catch (error) {
    console.error('Error deleting child:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server saat menghapus data anak.' });
  }
});



// === ENDPOINT RIWAYAT OLAHRAGA (EXERCISE) ===

app.get('/api/riwayat-olahraga/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!pool) return res.status(500).json({ message: 'Database tidak terkoneksi.' });

    // Cek jika userId adalah guest atau 'null' string
    const queryUserId = (userId === 'null' || !userId) ? null : userId;
    
    let rows;
    if (queryUserId) {
      [rows] = await pool.execute(
        'SELECT id, exercise_id, name, target, sets, duration, date FROM riwayat_olahraga WHERE user_id = ? ORDER BY id DESC',
        [queryUserId]
      );
    } else {
      [rows] = await pool.execute(
        'SELECT id, exercise_id, name, target, sets, duration, date FROM riwayat_olahraga WHERE user_id IS NULL ORDER BY id DESC'
      );
    }
    return res.json(rows);
  } catch (error) {
    console.error('Error getting exercise history:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server saat mengambil riwayat olahraga.' });
  }
});

app.post('/api/riwayat-olahraga', async (req, res) => {
  try {
    const { userId, exerciseId, name, target, sets, duration, date } = req.body;
    if (!exerciseId || !name || !target || sets === undefined || duration === undefined) {
      return res.status(400).json({ message: 'Data riwayat olahraga tidak lengkap.' });
    }
    if (!pool) return res.status(500).json({ message: 'Database tidak terkoneksi.' });

    const queryUserId = (userId === 'null' || !userId) ? null : userId;

    await pool.execute(
      'INSERT INTO riwayat_olahraga (user_id, exercise_id, name, target, sets, duration, date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [queryUserId, exerciseId, name, target, sets, duration, date || new Date().toISOString()]
    );
    return res.status(201).json({ message: 'Riwayat olahraga berhasil disimpan.' });
  } catch (error) {
    console.error('Error saving exercise record:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server saat menyimpan riwayat olahraga.' });
  }
});


// === ENDPOINT RIWAYAT PERTUMBUHAN USER (IMT) ===

app.get('/api/pertumbuhan-user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!pool) return res.status(500).json({ message: 'Database tidak terkoneksi.' });

    const [rows] = await pool.execute(
      'SELECT id, berat_badan, tinggi_badan, umur_tahun, imt, status_imt, DATE_FORMAT(created_at, "%d %b %Y %H:%i") as date FROM riwayat_pertumbuhan_user WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return res.json(rows);
  } catch (error) {
    console.error('Error getting user growth history:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server saat mengambil riwayat IMT.' });
  }
});

app.post('/api/pertumbuhan-user', async (req, res) => {
  try {
    const { userId, berat_badan, tinggi_badan, umur_tahun, imt, status_imt } = req.body;
    if (!userId || !berat_badan || !tinggi_badan || !umur_tahun || !imt || !status_imt) {
      return res.status(400).json({ message: 'Data pengukuran user tidak lengkap.' });
    }
    if (!pool) return res.status(500).json({ message: 'Database tidak terkoneksi.' });

    await pool.execute(
      'INSERT INTO riwayat_pertumbuhan_user (user_id, berat_badan, tinggi_badan, umur_tahun, imt, status_imt) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, berat_badan, tinggi_badan, umur_tahun, imt, status_imt]
    );
    return res.status(201).json({ message: 'Riwayat IMT berhasil disimpan.' });
  } catch (error) {
    console.error('Error adding user growth record:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server saat menyimpan riwayat IMT.' });
  }
});


// === ENDPOINT RIWAYAT PERTUMBUHAN ANAK ===

app.get('/api/pertumbuhan-anak/:anakId', async (req, res) => {
  try {
    const { anakId } = req.params;
    if (!pool) return res.status(500).json({ message: 'Database tidak terkoneksi.' });

    const [rows] = await pool.execute(
      'SELECT id, berat_badan, tinggi_badan, umur_bulan, status_gizi, DATE_FORMAT(created_at, "%d %b %Y") as date FROM riwayat_pertumbuhan_anak WHERE anak_id = ? ORDER BY created_at DESC',
      [anakId]
    );
    return res.json(rows);
  } catch (error) {
    console.error('Error getting child growth history:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server saat mengambil riwayat anak.' });
  }
});

app.post('/api/pertumbuhan-anak', async (req, res) => {
  try {
    const { anakId, berat_badan, tinggi_badan, umur_bulan, status_gizi } = req.body;
    if (!anakId || !berat_badan || !tinggi_badan || !umur_bulan) {
      return res.status(400).json({ message: 'Data pengukuran anak tidak lengkap.' });
    }
    if (!pool) return res.status(500).json({ message: 'Database tidak terkoneksi.' });

    await pool.execute(
      'INSERT INTO riwayat_pertumbuhan_anak (anak_id, berat_badan, tinggi_badan, umur_bulan, status_gizi) VALUES (?, ?, ?, ?, ?)',
      [anakId, berat_badan, tinggi_badan, umur_bulan, status_gizi || 'Normal']
    );

    // Update status Z-Score terakhir di profil anak
    await pool.execute('UPDATE anak SET status_z_score = ? WHERE id = ?', [status_gizi || 'Normal', anakId]);

    return res.status(201).json({ message: 'Riwayat timbangan anak berhasil disimpan.' });
  } catch (error) {
    console.error('Error adding child growth record:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server saat menyimpan riwayat anak.' });
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
