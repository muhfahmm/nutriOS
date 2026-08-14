const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

function getXamppMysqlPort() {
  const defaultPort = 3306;
  const myIniPath = 'C:\\xampp\\mysql\\bin\\my.ini';
  try {
    if (fs.existsSync(myIniPath)) {
      const content = fs.readFileSync(myIniPath, 'utf8');
      const lines = content.split('\n');
      let inMysqld = false;
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('[mysqld]')) {
          inMysqld = true;
          continue;
        } else if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
          inMysqld = false;
        }
        if (inMysqld) {
          const match = trimmed.match(/^port\s*=\s*(\d+)/i);
          if (match) {
            return parseInt(match[1], 10);
          }
        }
      }
      const generalMatch = content.match(/^\s*port\s*=\s*(\d+)/m);
      if (generalMatch) {
        return parseInt(generalMatch[1], 10);
      }
    }
  } catch (err) {
    console.warn('⚠️ Gagal membaca port MySQL dari XAMPP my.ini:', err.message);
  }
  return defaultPort;
}

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'db_nutrios',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : getXamppMysqlPort(),
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

    const connection = await pool.getConnection();
    console.log('✅ Koneksi ke database MySQL berhasil.');

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

    try {
      await connection.execute('TRUNCATE TABLE jadwal_makan;');
      console.log('🔄 Tabel jadwal_makan berhasil di-reset (di-truncate) pada startup server.');
    } catch (resetError) {
      console.warn('⚠️ Gagal melakukan reset tabel jadwal_makan:', resetError.message);
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

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username dan password wajib diisi.' });
    }

    if (!pool) {
      return res.status(500).json({ message: 'Database tidak terkoneksi.' });
    }

    const [rows] = await pool.execute('SELECT id, nama_lengkap, username, email, password, foto_profil, tinggi_badan, berat_badan, DATE_FORMAT(tanggal_lahir, "%Y-%m-%d") as tanggal_lahir, jenis_kelamin, last_username_change, last_name_change FROM users WHERE username = ?', [username]);
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
      tinggi_badan: user.tinggi_badan,
      berat_badan: user.berat_badan,
      tanggal_lahir: user.tanggal_lahir,
      jenis_kelamin: user.jenis_kelamin,
      last_username_change: user.last_username_change,
      last_name_change: user.last_name_change,
    };

    return res.json({ message: 'Login berhasil.', user: safeUser });
  } catch (error) {
    console.error('Error Login:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server saat login.' });
  }
});

app.post('/api/login-google', async (req, res) => {
  try {
    const { uid, email, displayName, photoURL } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email dari akun Google tidak valid.' });
    }

    if (!pool) {
      return res.status(500).json({ message: 'Database tidak terkoneksi.' });
    }

    let [rows] = await pool.execute(
      'SELECT id, nama_lengkap, username, email, foto_profil, tinggi_badan, berat_badan, DATE_FORMAT(tanggal_lahir, "%Y-%m-%d") as tanggal_lahir, jenis_kelamin, last_username_change, last_name_change FROM users WHERE email = ?',
      [email]
    );

    let user;
    if (rows.length === 0) {

      const prefix = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').slice(0, 15);
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const username = `${prefix}${randomSuffix}`;

      const randomPassword = Math.random().toString(36).substring(2, 15);
      const passwordHash = bcrypt.hashSync(randomPassword, 12);

      const [result] = await pool.execute(
        'INSERT INTO users (nama_lengkap, username, email, password, foto_profil) VALUES (?, ?, ?, ?, ?)',
        [displayName || 'User Google', username, email, passwordHash, photoURL || null]
      );

      const [newRows] = await pool.execute(
        'SELECT id, nama_lengkap, username, email, foto_profil, tinggi_badan, berat_badan, DATE_FORMAT(tanggal_lahir, "%Y-%m-%d") as tanggal_lahir, jenis_kelamin, last_username_change, last_name_change FROM users WHERE id = ?',
        [result.insertId]
      );
      user = newRows[0];
    } else {
      user = rows[0];

      if (user.foto_profil !== null) {
        await pool.execute('UPDATE users SET foto_profil = NULL WHERE id = ?', [user.id]);
        user.foto_profil = null;
      }
    }

    const safeUser = {
      id: user.id,
      nama_lengkap: user.nama_lengkap,
      username: user.username,
      email: user.email,
      foto_profil: user.foto_profil,
      tinggi_badan: user.tinggi_badan,
      berat_badan: user.berat_badan,
      tanggal_lahir: user.tanggal_lahir,
      jenis_kelamin: user.jenis_kelamin,
      last_username_change: user.last_username_change,
      last_name_change: user.last_name_change,
    };

    return res.json({ message: 'Login Google berhasil.', user: safeUser });
  } catch (error) {
    console.error('Error Google Login backend:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server saat autentikasi Google.' });
  }
});

app.post('/api/jadwal-tidur', async (req, res) => {
  try {
    console.log('[API] POST /api/jadwal-tidur - Request body:', JSON.stringify(req.body));

    const { userId, sleepTime, wakeTime, ageGroup, notifBedtime, notifScreenFree } = req.body;

    if (!sleepTime || !wakeTime) {
      console.log('[API] Validation error: sleepTime atau wakeTime missing');
      return res.status(400).json({ message: 'Data tidak lengkap (sleepTime dan wakeTime diperlukan).' });
    }

    if (!pool) {
      console.error('[API] Database pool tidak tersedia');
      return res.status(500).json({ message: 'Database tidak terkoneksi.' });
    }

    console.log('[API] Processing jadwal tidur untuk userId:', userId || 'guest');

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

app.get('/api/ganti-password', async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.query;

    if (!userId || !oldPassword || !newPassword) {
      return res.status(400).json({ message: 'User ID, password lama, dan password baru wajib diisi.' });
    }

    if (!pool) return res.status(500).json({ message: 'Database tidak terkoneksi.' });

    const [rows] = await pool.execute('SELECT password FROM users WHERE id = ?', [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }

    const userDb = rows[0];
    const passwordIsValid = bcrypt.compareSync(oldPassword, userDb.password);
    if (!passwordIsValid) {
      return res.status(401).json({ message: 'Password lama salah.' });
    }

    const newPasswordHash = bcrypt.hashSync(newPassword, 12);
    await pool.execute('UPDATE users SET password = ? WHERE id = ?', [newPasswordHash, userId]);

    return res.json({ message: 'Password berhasil diperbarui.' });
  } catch (error) {
    console.error('Error changing password:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server saat memperbarui password.' });
  }
});

app.post('/api/users/update', async (req, res) => {
  try {
    console.log('[API] POST /api/users/update - Request userId:', req.body.userId);
    const { userId, tinggi_badan, berat_badan, tanggal_lahir, nama_lengkap, username, foto_profil, jenis_kelamin } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'User ID wajib disertakan.' });
    }
    if (!pool) return res.status(500).json({ message: 'Database tidak terkoneksi.' });

    const [userRows] = await pool.execute(
      'SELECT username, nama_lengkap, last_username_change, last_name_change FROM users WHERE id = ?',
      [userId]
    );
    if (userRows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }
    const currentUser = userRows[0];
    console.log('[API] Current User in DB:', currentUser);
    console.log('[API] Payload Nama:', nama_lengkap, 'Payload Username:', username);

    const updates = [];
    const params = [];

    updates.push('tinggi_badan = ?', 'berat_badan = ?', 'tanggal_lahir = ?', 'jenis_kelamin = ?');
    params.push(
      (tinggi_badan && tinggi_badan !== '') ? tinggi_badan : null,
      (berat_badan && berat_badan !== '') ? berat_badan : null,
      (tanggal_lahir && tanggal_lahir !== '') ? tanggal_lahir : null,
      (jenis_kelamin && jenis_kelamin !== '') ? jenis_kelamin : null
    );

    if (foto_profil !== undefined) {
      updates.push('foto_profil = ?');
      params.push(foto_profil || null);
    }

    if (nama_lengkap && nama_lengkap !== currentUser.nama_lengkap) {
      if (currentUser.last_name_change) {
        const lastChange = new Date(currentUser.last_name_change);
        const nextAllowed = new Date(lastChange.getTime() + 7 * 24 * 60 * 60 * 1000);
        if (new Date() < nextAllowed) {
          const diffDays = Math.ceil((nextAllowed.getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000));
          return res.status(400).json({
            message: `Gagal mengubah nama lengkap. Anda baru saja menggantinya. Tunggu ${diffDays} hari lagi.`
          });
        }
      }
      updates.push('nama_lengkap = ?', 'last_name_change = NOW()');
      params.push(nama_lengkap);
    }

    if (username && username !== currentUser.username) {

      const [takenRows] = await pool.execute('SELECT id FROM users WHERE username = ? AND id != ?', [username, userId]);
      if (takenRows.length > 0) {
        return res.status(400).json({ message: 'Username sudah digunakan oleh akun lain.' });
      }

      if (currentUser.last_username_change) {
        const lastChange = new Date(currentUser.last_username_change);
        const nextAllowed = new Date(lastChange.getTime() + 14 * 24 * 60 * 60 * 1000);
        if (new Date() < nextAllowed) {
          const diffDays = Math.ceil((nextAllowed.getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000));
          return res.status(400).json({
            message: `Gagal mengubah username. Anda baru saja menggantinya. Tunggu ${diffDays} hari lagi.`
          });
        }
      }
      updates.push('username = ?', 'last_username_change = NOW()');
      params.push(username);
    }

    if (updates.length > 0) {
      params.push(userId);
      const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
      await pool.execute(query, params);
    }

    const [rows] = await pool.execute(
      'SELECT id, nama_lengkap, username, email, foto_profil, tinggi_badan, berat_badan, DATE_FORMAT(tanggal_lahir, "%Y-%m-%d") as tanggal_lahir, jenis_kelamin, last_username_change, last_name_change FROM users WHERE id = ?',
      [userId]
    );

    return res.json({ message: 'Profil berhasil diperbarui.', user: rows[0] });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server saat memperbarui profil.' });
  }
});

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

app.get('/api/riwayat-olahraga/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!pool) return res.status(500).json({ message: 'Database tidak terkoneksi.' });

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

    await pool.execute('UPDATE anak SET status_z_score = ? WHERE id = ?', [status_gizi || 'Normal', anakId]);

    return res.status(201).json({ message: 'Riwayat timbangan anak berhasil disimpan.' });
  } catch (error) {
    console.error('Error adding child growth record:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server saat menyimpan riwayat anak.' });
  }
});

app.get('/api/pola-makan/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const queryUserId = (userId === 'null' || userId === 'guest' || !userId) ? null : parseInt(userId, 10);

    if (!pool) return res.status(500).json({ message: 'Database tidak terkoneksi.' });

    let schedulesQuery;
    let schedulesParams;
    if (queryUserId) {
      schedulesQuery = 'SELECT meal_type, meal_time, notif_enabled FROM jadwal_makan WHERE user_id = ?';
      schedulesParams = [queryUserId];
    } else {
      schedulesQuery = 'SELECT meal_type, meal_time, notif_enabled FROM jadwal_makan WHERE user_id IS NULL';
      schedulesParams = [];
    }
    const [schedules] = await pool.execute(schedulesQuery, schedulesParams);

    return res.json({ schedules });
  } catch (error) {
    console.error('Error fetching pola makan:', error);
    return res.status(500).json({ message: 'Gagal mengambil data pola makan.' });
  }
});

app.post('/api/jadwal-makan', async (req, res) => {
  try {
    const { userId, mealType, mealTime, notifEnabled } = req.body;
    const queryUserId = (userId === 'null' || userId === 'guest' || !userId) ? null : parseInt(userId, 10);

    if (!pool) return res.status(500).json({ message: 'Database tidak terkoneksi.' });

    let existingQuery;
    let existingParams;
    if (queryUserId) {
      existingQuery = 'SELECT id FROM jadwal_makan WHERE user_id = ? AND meal_type = ?';
      existingParams = [queryUserId, mealType];
    } else {
      existingQuery = 'SELECT id FROM jadwal_makan WHERE user_id IS NULL AND meal_type = ?';
      existingParams = [mealType];
    }
    const [existing] = await pool.execute(existingQuery, existingParams);

    if (existing.length > 0) {
      let updateQuery;
      let updateParams;
      if (queryUserId) {
        updateQuery = 'UPDATE jadwal_makan SET meal_time = ?, notif_enabled = ? WHERE user_id = ? AND meal_type = ?';
        updateParams = [mealTime, notifEnabled ? 1 : 0, queryUserId, mealType];
      } else {
        updateQuery = 'UPDATE jadwal_makan SET meal_time = ?, notif_enabled = ? WHERE user_id IS NULL AND meal_type = ?';
        updateParams = [mealTime, notifEnabled ? 1 : 0, mealType];
      }
      await pool.execute(updateQuery, updateParams);
    } else {
      await pool.execute(
        'INSERT INTO jadwal_makan (user_id, meal_type, meal_time, notif_enabled) VALUES (?, ?, ?, ?)',
        [queryUserId, mealType, mealTime, notifEnabled ? 1 : 0]
      );
    }

    return res.json({ message: 'Jadwal makan berhasil disimpan.' });
  } catch (error) {
    console.error('Error saving jadwal makan:', error);
    return res.status(500).json({ message: 'Gagal menyimpan jadwal makan.' });
  }
});

app.post('/api/log-makanan', async (req, res) => {
  try {
    const { userId, mealType, foodName } = req.body;
    const queryUserId = (userId === 'null' || userId === 'guest' || !userId) ? null : parseInt(userId, 10);

    if (!pool) return res.status(500).json({ message: 'Database tidak terkoneksi.' });

    const [result] = await pool.execute(
      'INSERT INTO log_makanan (user_id, meal_type, food_name) VALUES (?, ?, ?)',
      [queryUserId, mealType, foodName]
    );

    return res.status(201).json({ message: 'Menu makanan berhasil dicatat.', logId: result.insertId });
  } catch (error) {
    console.error('Error saving log makanan:', error);
    return res.status(500).json({ message: 'Gagal mencatat makanan.' });
  }
});

app.delete('/api/log-makanan/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!pool) return res.status(500).json({ message: 'Database tidak terkoneksi.' });

    await pool.execute('DELETE FROM log_makanan WHERE id = ?', [id]);
    return res.json({ message: 'Menu makanan berhasil dihapus.' });
  } catch (error) {
    console.error('Error deleting log makanan:', error);
    return res.status(500).json({ message: 'Gagal menghapus makanan.' });
  }
});

app.post('/api/ask-ai', async (req, res) => {
  try {
    const { prompt, context } = req.body;
    if (!prompt) {
      return res.status(400).json({ message: 'Prompt tidak boleh kosong.' });
    }

    if (!genAI) {
      return res.status(500).json({ message: 'Kunci API Gemini belum diatur di server.' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' });

    const systemInstruction =
      "Anda adalah NutriOS AI, asisten gizi & tumbuh kembang. " +
      "Berikan jawaban dalam Bahasa Indonesia yang RAMAH, SANGAT RINGKAS, dan LANGSUNG PADA INTI JAWABAN. " +
      "JANGAN menulis kalimat pembuka/penutup yang panjang. Batasi total jawaban maksimal 150 kata saja agar respon cepat.";

    const formattedPrompt = `${systemInstruction}\n\nKonteks Pengguna: ${JSON.stringify(context || {})}\n\nPertanyaan: ${prompt}`;

    const result = await model.generateContent(formattedPrompt);
    const responseText = result.response.text();

    return res.json({ reply: responseText });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return res.status(500).json({ message: 'Gagal mendapatkan respon dari AI.', error: error.message });
  }
});

app.post('/api/ai-suggestions', async (req, res) => {
  try {
    const { type, context } = req.body;
    if (!genAI) {
      return res.status(500).json({ error: 'Kunci API Gemini belum diatur' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' });

    const prompt =
      `Anda adalah API generator pertanyaan gizi & kebugaran. ` +
      `Buatlah EXACTLY 3 pertanyaan/konsultasi singkat, acak, dinamis, dan sangat menarik dalam Bahasa Indonesia ` +
      `untuk pengguna di kategori menu: "${type || 'umum'}". ` +
      `Konteks data saat ini: ${JSON.stringify(context || {})}. ` +
      `Format output WAJIB berupa raw JSON array of strings tanpa markdown code block, seperti: ["pertanyaan1", "pertanyaan2", "pertanyaan3"]`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();

    if (text.startsWith('```')) {
      text = text.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    }

    const suggestions = JSON.parse(text);
    return res.json({ suggestions });
  } catch (error) {
    console.error('Error generating suggestions:', error);
    const fallbacks = {
      calculator: ['Bagaimana menaikkan BB anak?', 'Apakah IMT saya normal?', 'Tips gizi seimbang'],
      pola_makan: ['Mengapa jadwal makan penting?', 'Tips batasi gula harian', 'Menu sarapan sehat'],
      rekomendasi_makanan: ['Ide resep tinggi protein', 'Camilan malam sehat', 'Resep sayur anak'],
      stress: ['Teknik pernapasan 4-7-8', 'Cara tenangkan cemas', 'Tips relaksasi otot'],
      general: ['Menu makan sehat hari ini', 'Cara atasi kurang tidur', 'Pentingnya protein hewani']
    };
    const key = req.body.type || 'general';
    return res.json({ suggestions: fallbacks[key] || fallbacks.general });
  }
});

const port = process.env.APP_PORT || 3000;
const server = app.listen(port, '0.0.0.0', () => {
  console.log('');
  console.log('╔════════════════════════════════════════╗');
  console.log('║         Auth Server Sudah Berjalan     ║');
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
