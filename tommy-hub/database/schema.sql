-- ============================================================
-- TOMMY HUB — Billing Terminal Database Schema (MySQL 8)
-- ============================================================
CREATE DATABASE IF NOT EXISTS tommy_hub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tommy_hub;

-- ---------- Staff (cashiers/admins) ----------
CREATE TABLE IF NOT EXISTS staff (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('cashier','admin') NOT NULL DEFAULT 'cashier',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------- Customers ----------
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  phone VARCHAR(10) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_phone (phone)
) ENGINE=InnoDB;

-- ---------- Products ----------
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category ENUM('Shirt','Pant','Footwear','Trouser','Track','T-Shirt','Accessories') NOT NULL,
  product_name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  stock_qty INT NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_category (category)
) ENGINE=InnoDB;

-- ---------- Atomic bill-number counter (per year) ----------
CREATE TABLE IF NOT EXISTS bill_counters (
  year INT PRIMARY KEY,
  last_seq INT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

-- ---------- Bills ----------
CREATE TABLE IF NOT EXISTS bills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bill_number VARCHAR(20) NOT NULL UNIQUE,
  customer_id INT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  grand_total DECIMAL(10,2) NOT NULL,
  payment_mode ENUM('Cash','UPI','Card') NOT NULL,
  status ENUM('draft','finalized','void') NOT NULL DEFAULT 'finalized',
  created_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
  FOREIGN KEY (created_by) REFERENCES staff(id) ON DELETE SET NULL,
  INDEX idx_bill_number (bill_number),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- ---------- Bill Items ----------
CREATE TABLE IF NOT EXISTS bill_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bill_id INT NOT NULL,
  product_name VARCHAR(100) NOT NULL,
  category VARCHAR(30) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  discount_percentage DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (discount_percentage BETWEEN 0 AND 100),
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  final_amount DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Seed the counter for the current year range so the app can increment safely
INSERT IGNORE INTO bill_counters (year, last_seq) VALUES (2026, 0);
