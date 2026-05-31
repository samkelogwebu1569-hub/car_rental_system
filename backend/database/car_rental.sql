-- =====================================================================
--  Car Rental System - full database dump (schema + seed data)
--  Target: MySQL / MariaDB (XAMPP)
--
--  HOW TO IMPORT (Windows XAMPP, via phpMyAdmin):
--    1. Start Apache + MySQL in the XAMPP Control Panel.
--    2. Open http://localhost/phpmyadmin
--    3. Click the "Import" tab (top menu) - you do NOT need to create the
--       database first; this file creates it for you.
--    4. Choose this file (car_rental.sql) and click "Import".
--    5. The "car_rental" database appears on the left with 4 tables and
--       10 seeded cars.
--
--  Or from the command line:
--    C:\xampp\mysql\bin\mysql.exe -u root < car_rental.sql
-- =====================================================================

CREATE DATABASE IF NOT EXISTS car_rental
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE car_rental;

SET FOREIGN_KEY_CHECKS = 0;

-- Drop in dependency order so the file can be re-imported cleanly.
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS otps;
DROP TABLE IF EXISTS cars;
DROP TABLE IF EXISTS users;

-- ---------------------------------------------------------------------
-- Table: users
-- ---------------------------------------------------------------------
CREATE TABLE users (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Table: otps  (one-time codes for account verification / password reset)
-- ---------------------------------------------------------------------
CREATE TABLE otps (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Table: cars
-- ---------------------------------------------------------------------
CREATE TABLE cars (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name          VARCHAR(120) NOT NULL,
  brand         VARCHAR(80)  NOT NULL,
  model         VARCHAR(80)  DEFAULT NULL,
  type          VARCHAR(40)  DEFAULT NULL,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Table: bookings
-- ---------------------------------------------------------------------
CREATE TABLE bookings (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Seed data: 10 sample cars
-- ---------------------------------------------------------------------
INSERT INTO cars
  (name, brand, model, type, transmission, fuel_type, seats, price_per_day, rating, image_url, location, description, available)
VALUES
  ('Tesla Model 3', 'Tesla', 'Model 3', 'Sedan', 'automatic', 'electric', 5, 95.00, 4.9, NULL, 'San Francisco', 'All-electric premium sedan with autopilot.', 1),
  ('BMW X5', 'BMW', 'X5', 'SUV', 'automatic', 'petrol', 5, 120.00, 4.7, NULL, 'Los Angeles', 'Spacious luxury SUV, great for road trips.', 1),
  ('Toyota Corolla', 'Toyota', 'Corolla', 'Sedan', 'automatic', 'petrol', 5, 45.00, 4.5, NULL, 'New York', 'Reliable and fuel-efficient daily driver.', 1),
  ('Ford Mustang GT', 'Ford', 'Mustang GT', 'Sports', 'manual', 'petrol', 4, 150.00, 4.8, NULL, 'Miami', 'Iconic American muscle car.', 1),
  ('Jeep Wrangler', 'Jeep', 'Wrangler', 'SUV', 'manual', 'petrol', 5, 110.00, 4.6, NULL, 'Denver', 'Off-road ready 4x4.', 1),
  ('Mercedes-Benz C-Class', 'Mercedes-Benz', 'C-Class', 'Sedan', 'automatic', 'petrol', 5, 130.00, 4.8, NULL, 'Chicago', 'Elegant executive sedan.', 1),
  ('Honda Civic', 'Honda', 'Civic', 'Sedan', 'automatic', 'petrol', 5, 50.00, 4.4, NULL, 'Seattle', 'Compact, economical and sporty.', 1),
  ('Audi Q7', 'Audi', 'Q7', 'SUV', 'automatic', 'diesel', 7, 140.00, 4.7, NULL, 'Boston', 'Seven-seat premium SUV.', 1),
  ('Porsche 911', 'Porsche', '911 Carrera', 'Sports', 'automatic', 'petrol', 2, 320.00, 5.0, NULL, 'Las Vegas', 'Legendary sports car experience.', 1),
  ('Volkswagen Golf', 'Volkswagen', 'Golf', 'Hatchback', 'manual', 'petrol', 5, 40.00, 4.3, NULL, 'Austin', 'Practical and fun hatchback.', 1);

SET FOREIGN_KEY_CHECKS = 1;
