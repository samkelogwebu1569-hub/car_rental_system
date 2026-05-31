-- Car Rental System database schema (MySQL / MariaDB, e.g. XAMPP)
-- Run with: mysql -u root < schema.sql

CREATE DATABASE IF NOT EXISTS car_rental
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE car_rental;

CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name     VARCHAR(120) NOT NULL,
  email         VARCHAR(190) NOT NULL,
  phone         VARCHAR(40)  DEFAULT NULL,
  country       VARCHAR(80)  DEFAULT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_verified   TINYINT(1)   NOT NULL DEFAULT 0,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_users_email (email)
) ENGINE=InnoDB;

-- One-time codes for account verification and password reset.
CREATE TABLE IF NOT EXISTS otps (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    INT UNSIGNED NOT NULL,
  code       VARCHAR(10)  NOT NULL,
  purpose    ENUM('verify','reset') NOT NULL DEFAULT 'verify',
  expires_at DATETIME     NOT NULL,
  used       TINYINT(1)   NOT NULL DEFAULT 0,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_otps_user (user_id),
  CONSTRAINT fk_otps_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cars (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name          VARCHAR(120) NOT NULL,
  brand         VARCHAR(80)  NOT NULL,
  model         VARCHAR(80)  DEFAULT NULL,
  type          VARCHAR(40)  DEFAULT NULL,   -- e.g. SUV, Sedan, Sports
  transmission  ENUM('automatic','manual') NOT NULL DEFAULT 'automatic',
  fuel_type     VARCHAR(30)  DEFAULT 'petrol',
  seats         TINYINT UNSIGNED NOT NULL DEFAULT 4,
  price_per_day DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  rating        DECIMAL(2,1)  NOT NULL DEFAULT 0.0,
  image_url     VARCHAR(255) DEFAULT NULL,
  location      VARCHAR(120) DEFAULT NULL,
  description   TEXT         DEFAULT NULL,
  available     TINYINT(1)   NOT NULL DEFAULT 1,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_cars_type (type),
  KEY idx_cars_brand (brand)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS bookings (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id     INT UNSIGNED NOT NULL,
  car_id      INT UNSIGNED NOT NULL,
  start_date  DATE         NOT NULL,
  end_date    DATE         NOT NULL,
  total_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status      ENUM('pending','confirmed','cancelled','completed') NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_bookings_user (user_id),
  KEY idx_bookings_car (car_id),
  CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_bookings_car  FOREIGN KEY (car_id)  REFERENCES cars (id)  ON DELETE CASCADE
) ENGINE=InnoDB;
