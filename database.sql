-- 1. Buat Database
CREATE DATABASE IF NOT EXISTS db_nutrios;
USE db_nutrios;

-- 2. Buat Tabel Users (Untuk Login/Register Orang Tua)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_lengkap VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, 
    nomor_telepon VARCHAR(20),
    foto_profil VARCHAR(255) DEFAULT NULL, -- Menyimpan URL foto (opsional)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. (Opsional) Buat Tabel Anak untuk menampung data anak - user
-- Ini akan dihubungkan nanti saat user sudah login
CREATE TABLE IF NOT EXISTS anak (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    nama_anak VARCHAR(255) NOT NULL,
    tanggal_lahir DATE,
    jenis_kelamin ENUM('Laki-laki', 'Perempuan'),
    status_z_score VARCHAR(50) DEFAULT 'Normal', -- Untuk filter 'Normal' atau 'Waspada'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;