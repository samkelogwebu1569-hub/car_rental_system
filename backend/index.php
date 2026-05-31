<?php
/**
 * Front controller for the Car Rental System API.
 *
 * All requests are routed here (see .htaccess). Routes are matched on the
 * path after the application's base directory.
 */

// Emit the shortest accurate float representation in JSON (e.g. 4.9 not 4.90000001).
ini_set('serialize_precision', '-1');

require __DIR__ . '/config/database.php';
require __DIR__ . '/lib/helpers.php';
require __DIR__ . '/controllers/AuthController.php';
require __DIR__ . '/controllers/CarController.php';
require __DIR__ . '/controllers/BookingController.php';

send_cors_headers();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// Preflight requests need no body.
if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Resolve the route path relative to the directory this script lives in,
// so the API works whether it is served from a sub-folder or a vhost root.
$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/';
$base = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '')), '/');
if ($base !== '' && strpos($uri, $base) === 0) {
    $uri = substr($uri, strlen($base));
}
$path = '/' . trim($uri, '/');

try {
    switch (true) {
        case $path === '/' && $method === 'GET':
            json_response([
                'success' => true,
                'name'    => 'Car Rental System API',
                'version' => '1.0.0',
                'endpoints' => [
                    'GET  /api/health',
                    'POST /api/auth/register',
                    'POST /api/auth/login',
                    'POST /api/auth/verify-otp',
                    'POST /api/auth/request-reset',
                    'POST /api/auth/reset-password',
                    'GET  /api/cars',
                    'GET  /api/cars/{id}',
                    'POST /api/bookings',
                ],
            ]);
            break;

        case $path === '/api/health' && $method === 'GET':
            db()->query('SELECT 1');
            json_response(['success' => true, 'status' => 'ok', 'database' => 'connected']);
            break;

        case $path === '/api/auth/register' && $method === 'POST':
            AuthController::register();
            break;

        case $path === '/api/auth/login' && $method === 'POST':
            AuthController::login();
            break;

        case $path === '/api/auth/verify-otp' && $method === 'POST':
            AuthController::verifyOtp();
            break;

        case $path === '/api/auth/request-reset' && $method === 'POST':
            AuthController::requestReset();
            break;

        case $path === '/api/auth/reset-password' && $method === 'POST':
            AuthController::resetPassword();
            break;

        case $path === '/api/cars' && $method === 'GET':
            CarController::index();
            break;

        case preg_match('#^/api/cars/(\d+)$#', $path, $m) === 1 && $method === 'GET':
            CarController::show((int) $m[1]);
            break;

        case $path === '/api/bookings' && $method === 'POST':
            BookingController::create();
            break;

        default:
            json_error('Route not found: ' . $method . ' ' . $path, 404);
    }
} catch (PDOException $e) {
    json_error('Database error: ' . $e->getMessage(), 500);
} catch (Throwable $e) {
    json_error('Server error: ' . $e->getMessage(), 500);
}
