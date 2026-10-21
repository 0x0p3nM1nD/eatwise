CREATE DATABASE IF NOT EXISTS eatwise_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE eatwise_db;
CREATE TABLE IF NOT EXISTS businesses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    city VARCHAR(80) NOT NULL,
    address VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Таблица за офертите
CREATE TABLE IF NOT EXISTS offers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    original_price DECIMAL(10, 2) NOT NULL,
    discount_price DECIMAL(10, 2) NOT NULL,
    pickup_start TIME NOT NULL,
    pickup_end TIME NOT NULL,
    quantity INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);