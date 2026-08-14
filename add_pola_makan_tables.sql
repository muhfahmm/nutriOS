-- Buat Tabel jadwal_makan untuk menyimpan pengingat makan
CREATE TABLE IF NOT EXISTS jadwal_makan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    meal_type ENUM('breakfast', 'lunch', 'dinner', 'custom') NOT NULL,
    meal_time VARCHAR(10) NOT NULL,
    notif_enabled TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
