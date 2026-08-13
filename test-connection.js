#!/usr/bin/env node

/**
 * Test script untuk verifikasi koneksi database dan server
 * Jalankan dengan: node test-connection.js
 */

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const http = require('http');

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'db_nutrios',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
};

console.log('');
console.log('╔════════════════════════════════════════════════════════╗');
console.log('║         🧪 DATABASE CONNECTION TEST SCRIPT 🧪          ║');
console.log('╚════════════════════════════════════════════════════════╝');
console.log('');

// Test 1: Cek konfigurasi
console.log('📋 Step 1: Verifikasi Konfigurasi');
console.log('─'.repeat(56));
console.log(`  Host:     ${dbConfig.host}`);
console.log(`  Port:     ${dbConfig.port}`);
console.log(`  User:     ${dbConfig.user}`);
console.log(`  Password: ${'*'.repeat(dbConfig.password.length)}`);
console.log(`  Database: ${dbConfig.database}`);
console.log('');

// Test 2: Test MySQL connection
console.log('🔌 Step 2: Test Koneksi MySQL');
console.log('─'.repeat(56));

async function testDatabaseConnection() {
  try {
    console.log('  ⏳ Mencoba connect ke MySQL...');
    
    const pool = mysql.createPool({
      ...dbConfig,
      connectionLimit: 5,
    });

    const connection = await pool.getConnection();
    console.log('  ✅ Berhasil connect ke MySQL!');

    // Test query
    console.log('  ⏳ Testing query...');
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('  ✅ Query berhasil dieksekusi!');

    // Check tables
    console.log('  ⏳ Mengecek tabel...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`  ✅ Database memiliki ${tables.length} tabel:`);
    tables.forEach(t => {
      const tableName = Object.values(t)[0];
      console.log(`     • ${tableName}`);
    });

    // Check jadwal_tidur table specifically
    console.log('  ⏳ Mengecek tabel jadwal_tidur...');
    const [jadwalTable] = await connection.execute(
      'SHOW TABLES LIKE "jadwal_tidur"'
    );
    if (jadwalTable.length > 0) {
      console.log('  ✅ Tabel jadwal_tidur ditemukan!');
      
      // Check table structure
      const [columns] = await connection.execute(
        'SHOW COLUMNS FROM jadwal_tidur'
      );
      console.log('     Columns:');
      columns.forEach(col => {
        console.log(`     • ${col.Field} (${col.Type})`);
      });

      // Check data
      const [data] = await connection.execute(
        'SELECT COUNT(*) as count FROM jadwal_tidur'
      );
      console.log(`     Data: ${data[0].count} record(s)`);
    } else {
      console.log('  ❌ Tabel jadwal_tidur TIDAK ditemukan!');
      console.log('     Solusi: Jalankan database.sql untuk membuat tabel');
    }

    connection.release();
    await pool.end();

    return true;
  } catch (error) {
    console.log('  ❌ Koneksi MySQL GAGAL!');
    console.log(`  Error: ${error.message}`);
    console.log(`  Code: ${error.code}`);
    
    if (error.code === 'PROTOCOL_CONNECTION_LOST') {
      console.log('  💡 Kemungkinan: MySQL service tidak berjalan atau host tidak benar');
      console.log('  Solusi: ');
      console.log('    1. Buka XAMPP Control Panel');
      console.log('    2. Pastikan MySQL module sudah "Start"');
      console.log('    3. Cek DB_HOST di .env (gunakan 127.0.0.1 untuk XAMPP lokal)');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('  💡 Kemungkinan: Username atau password salah');
      console.log('  Solusi: Verifikasi DB_USER dan DB_PASSWORD di .env');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('  💡 Kemungkinan: Database belum dibuat');
      console.log('  Solusi: Buat database db_nutrios di XAMPP MySQL');
    }
    
    return false;
  }
}

// Test 3: Test server connectivity
async function testServerConnection() {
  console.log('');
  console.log('🌐 Step 3: Test Server Backend');
  console.log('─'.repeat(56));

  const port = process.env.APP_PORT || 3000;
  
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/api/health`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`  ✅ Server berjalan di port ${port}!`);
          console.log(`  Response:`, JSON.stringify(json, null, 2));
          resolve(true);
        } catch (e) {
          console.log(`  ❌ Server merespons tapi bukan JSON:`, data);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.log(`  ❌ Tidak bisa terhubung ke server di localhost:${port}`);
      console.log(`  Error: ${err.message}`);
      console.log('  Solusi: Jalankan server dengan: npm start');
      resolve(false);
    });

    req.setTimeout(3000, () => {
      req.destroy();
      console.log(`  ❌ Timeout: Server tidak merespons dalam 3 detik`);
      console.log('  Solusi: Pastikan server sudah di-start dengan: npm start');
      resolve(false);
    });
  });
}

// Run all tests
(async () => {
  const dbOk = await testDatabaseConnection();
  const serverOk = await testServerConnection();

  console.log('');
  console.log('📊 HASIL TEST');
  console.log('─'.repeat(56));
  console.log(`  Database: ${dbOk ? '✅ OK' : '❌ GAGAL'}`);
  console.log(`  Server:   ${serverOk ? '✅ OK' : '❌ GAGAL'}`);
  console.log('');

  if (dbOk && serverOk) {
    console.log('✅ Semua test PASSED! Sekarang coba simpan jadwal tidur di app.');
  } else if (dbOk && !serverOk) {
    console.log('⚠️  Database OK tapi server tidak berjalan.');
    console.log('   Jalankan: npm start');
  } else if (!dbOk && serverOk) {
    console.log('⚠️  Server OK tapi database tidak terkoneksi.');
    console.log('   Periksa XAMPP MySQL dan .env configuration.');
  } else {
    console.log('❌ Kedua test FAILED. Periksa error di atas untuk solusi.');
  }

  console.log('');
  process.exit(dbOk && serverOk ? 0 : 1);
})();
