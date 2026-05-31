<?php
/**
 * Shared HTTP helpers: CORS, JSON input/output and validation.
 */

function send_cors_headers(): void
{
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
}

function json_response($data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function json_error(string $message, int $status = 400, array $extra = []): void
{
    json_response(array_merge(['success' => false, 'message' => $message], $extra), $status);
}

/**
 * Reads and decodes the JSON request body. Falls back to form-encoded params.
 */
function read_input(): array
{
    $raw = file_get_contents('php://input');
    if ($raw !== false && $raw !== '') {
        $decoded = json_decode($raw, true);
        if (is_array($decoded)) {
            return $decoded;
        }
    }
    return $_POST ?? [];
}

/**
 * Ensures the given keys exist and are non-empty in $data.
 * Sends a 422 error response and stops if any are missing.
 */
function require_fields(array $data, array $fields): void
{
    $missing = [];
    foreach ($fields as $field) {
        if (!isset($data[$field]) || trim((string) $data[$field]) === '') {
            $missing[] = $field;
        }
    }
    if (!empty($missing)) {
        json_error('Missing required fields: ' . implode(', ', $missing), 422, [
            'missing' => $missing,
        ]);
    }
}

function is_valid_email(string $email): bool
{
    return (bool) filter_var($email, FILTER_VALIDATE_EMAIL);
}

/** Generates a numeric one-time code of the given length. */
function generate_otp(int $length = 4): string
{
    $code = '';
    for ($i = 0; $i < $length; $i++) {
        $code .= (string) random_int(0, 9);
    }
    return $code;
}
