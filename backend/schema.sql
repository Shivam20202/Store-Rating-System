-- Store Rating Application - MySQL Schema
-- Run this in your MySQL server to create the database and tables.

CREATE DATABASE IF NOT EXISTS store_rating_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE store_rating_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(60)  NOT NULL,
  email      VARCHAR(255) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  address    VARCHAR(400) DEFAULT NULL,
  role       ENUM('admin','user','store_owner') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Stores table
CREATE TABLE IF NOT EXISTS stores (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(60)  NOT NULL,
  email      VARCHAR(255) DEFAULT NULL,
  address    VARCHAR(400) DEFAULT NULL,
  owner_id   INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_store_owner
    FOREIGN KEY (owner_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- Ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  store_id   INT NOT NULL,
  rating     TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_user_store (user_id, store_id),
  CONSTRAINT fk_rating_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_rating_store
    FOREIGN KEY (store_id) REFERENCES stores(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- Indexes for common queries
CREATE INDEX idx_users_name  ON users(name);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role  ON users(role);
CREATE INDEX idx_stores_name  ON stores(name);
CREATE INDEX idx_stores_email ON stores(email);
CREATE INDEX idx_ratings_store ON ratings(store_id);
CREATE INDEX idx_ratings_user  ON ratings(user_id);

-- Default admin account (password: Admin@123)
INSERT INTO users (name, email, password, address, role)
VALUES (
  'System Administrator',
  'admin@store.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMy.MQDqoZ6YpK9p7XfQp3xKZJZxKZJZxK',
  '123 Admin Street',
  'admin'
);
