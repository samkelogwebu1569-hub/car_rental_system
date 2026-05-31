# Car Rental System — Backend API (PHP + MySQL / XAMPP)

A small PHP REST API that backs the Car Rental React Native app. It runs on the
PHP + MySQL stack bundled with [XAMPP](https://www.apachefriends.org/).

## Requirements

- XAMPP (Apache + MySQL/MariaDB + PHP 8.x)

## Setup

1. **Start XAMPP** (Apache + MySQL).
   - Linux: `sudo /opt/lampp/lampp start`
   - Windows/macOS: start Apache and MySQL from the XAMPP control panel.

2. **Create the database and tables**, then load the sample cars:

   ```bash
   # Linux (XAMPP MySQL client)
   /opt/lampp/bin/mysql -u root < database/schema.sql
   /opt/lampp/bin/mysql -u root car_rental < database/seed.sql
   ```

   On Windows/macOS use the bundled `mysql` client or import the two `.sql`
   files from phpMyAdmin (http://localhost/phpmyadmin).

3. **Expose the API through Apache.** Copy or symlink this `backend` folder into
   the XAMPP web root as `car_rental_api`:

   ```bash
   # Linux example
   sudo ln -sfn "$(pwd)" /opt/lampp/htdocs/car_rental_api
   ```

   (On Windows/macOS, copy the folder into `xampp/htdocs/car_rental_api`.)

4. **Verify** it works:

   ```bash
   curl http://localhost/car_rental_api/api/health
   # {"success":true,"status":"ok","database":"connected"}
   ```

## Configuration

Connection settings default to a stock XAMPP install (`root` user, no password,
database `car_rental`). Override with environment variables if needed:

| Variable          | Default       |
| ----------------- | ------------- |
| `DB_HOST`         | `127.0.0.1`   |
| `DB_PORT`         | `3306`        |
| `DB_NAME`         | `car_rental`  |
| `DB_USER`         | `root`        |
| `DB_PASS`         | _(empty)_     |
| `OTP_TTL_MINUTES` | `10`          |

## Endpoints

| Method | Path                        | Description                              |
| ------ | --------------------------- | ---------------------------------------- |
| GET    | `/api/health`               | Health + DB connectivity check           |
| POST   | `/api/auth/register`        | Create an account (returns an OTP)       |
| POST   | `/api/auth/login`           | Log in with email/phone + password       |
| POST   | `/api/auth/verify-otp`      | Verify an account with its code          |
| POST   | `/api/auth/request-reset`   | Request a password-reset code            |
| POST   | `/api/auth/reset-password`  | Set a new password using the code        |
| GET    | `/api/cars`                 | List/search cars (`q,type,transmission,min_price,max_price`) |
| GET    | `/api/cars/{id}`            | Get a single car                         |
| POST   | `/api/bookings`             | Create a booking                         |

> **Note:** For local development the registration and reset endpoints return
> the generated `otp` in the JSON response because no SMS/email gateway is
> configured. Remove this in production and deliver codes out-of-band.

## App connection

The React Native app reads the API base URL from `app/config/env.ts`. Android
emulators use `http://10.0.2.2/car_rental_api`; the iOS simulator uses
`http://localhost/car_rental_api`. For a physical device, set the host to your
machine's LAN IP.
