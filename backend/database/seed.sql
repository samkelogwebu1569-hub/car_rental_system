-- Sample data for the Car Rental System.
-- Run after schema.sql: mysql -u root car_rental < seed.sql

USE car_rental;

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
