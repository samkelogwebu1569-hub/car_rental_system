<?php
/**
 * Application configuration.
 *
 * Values can be overridden with environment variables so the same code runs
 * against a local XAMPP MySQL instance or any other MySQL server.
 *
 * This file is safe to include multiple times.
 */

if (!function_exists('env')) {
    function env(string $key, ?string $default = null): ?string
    {
        $value = getenv($key);
        return ($value === false || $value === '') ? $default : $value;
    }
}

if (!function_exists('app_config')) {
    function app_config(): array
    {
        static $config = null;
        if ($config !== null) {
            return $config;
        }
        $config = [
            'db' => [
                'host'    => env('DB_HOST', '127.0.0.1'),
                'port'    => env('DB_PORT', '3306'),
                'name'    => env('DB_NAME', 'car_rental'),
                'user'    => env('DB_USER', 'root'),
                'pass'    => env('DB_PASS', ''),
                'charset' => 'utf8mb4',
            ],
            // Minutes a one-time code (OTP) stays valid.
            'otp_ttl_minutes' => (int) env('OTP_TTL_MINUTES', '10'),
        ];
        return $config;
    }
}
