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
    pool = mysql.createPool({
      ...dbConfig,
      connectionLimit: 10,
    });
    // Test the connection
    const connection = await pool.getConnection();
    console.log('Koneksi ke database MySQL berhasil.');
    connection.release();
  } catch (error) {
    console.error('Koneksi ke database MySQL GAGAL. Harap periksa apakah MySQL sudah berjalan dan kredensial di .env sudah benar.');
    console.error(error.message);
  }
}

initializeDatabase();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: pool ? 'connected' : 'disconnected' });
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

const port = process.env.APP_PORT || 3000;
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Auth server berjalan di http://0.0.0.0:${port}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} sudah dipakai. Jalankan ulang dengan port lain:`);
    console.error('  $env:APP_PORT="3001"; npm start');
    console.error('atau hentikan proses yang menggunakan port 3000.');
  } else {
    console.error('Terjadi error server:', error);
  }
  process.exit(1);
});
