-- 1. Buat Database
CREATE DATABASE IF NOT EXISTS db_nutrios;
USE db_nutrios;

-- 2. Buat Tabel Users (Untuk Login/Register Orang Tua)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_lengkap VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) DEFAULT NULL,
    password VARCHAR(255) NOT NULL, 
    foto_profil VARCHAR(255) DEFAULT NULL, -- Menyimpan URL foto (opsional)
    tinggi_badan DECIMAL(5,2) DEFAULT NULL,
    berat_badan DECIMAL(5,2) DEFAULT NULL,
    tanggal_lahir DATE DEFAULT NULL,
    jenis_kelamin ENUM('Pria', 'Wanita') DEFAULT NULL,
    last_username_change TIMESTAMP NULL DEFAULT NULL,
    last_name_change TIMESTAMP NULL DEFAULT NULL,
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

-- 4. Buat Tabel jadwal_tidur untuk menampung target tidur harian user (user_id NULL jika tidak login)
CREATE TABLE IF NOT EXISTS jadwal_tidur (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    sleep_time VARCHAR(10) NOT NULL,
    wake_time VARCHAR(10) NOT NULL,
    age_group VARCHAR(50) NOT NULL,
    notif_bedtime TINYINT(1) DEFAULT 1,
    notif_screen_free TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Buat Tabel riwayat_pertumbuhan_user untuk mencatat riwayat IMT orang tua
CREATE TABLE IF NOT EXISTS riwayat_pertumbuhan_user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    berat_badan DECIMAL(5,2) NOT NULL,
    tinggi_badan DECIMAL(5,2) NOT NULL,
    umur_tahun INT NOT NULL DEFAULT 20,
    imt DECIMAL(4,2) NOT NULL,
    status_imt VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Buat Tabel riwayat_pertumbuhan_anak untuk mencatat perkembangan fisik anak
CREATE TABLE IF NOT EXISTS riwayat_pertumbuhan_anak (
    id INT AUTO_INCREMENT PRIMARY KEY,
    anak_id INT NOT NULL,
    berat_badan DECIMAL(5,2) NOT NULL,
    tinggi_badan DECIMAL(5,2) NOT NULL,
    umur_bulan INT NOT NULL,
    status_gizi VARCHAR(50) DEFAULT 'Normal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (anak_id) REFERENCES anak(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Buat Tabel riwayat_olahraga untuk mencatat histori latihan user
CREATE TABLE IF NOT EXISTS riwayat_olahraga (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    exercise_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    target VARCHAR(100) NOT NULL,
    sets INT NOT NULL,
    duration INT NOT NULL,
    date VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
