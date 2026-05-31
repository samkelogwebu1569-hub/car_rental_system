<?php
/**
 * Authentication endpoints: registration, login, OTP verification and
 * password reset. Passwords are hashed with PHP's password_hash().
 */
class AuthController
{
    public static function register(): void
    {
        $data = read_input();
        require_fields($data, ['full_name', 'email', 'password']);

        $email = strtolower(trim($data['email']));
        if (!is_valid_email($email)) {
            json_error('Invalid email address.', 422);
        }
        if (strlen($data['password']) < 6) {
            json_error('Password must be at least 6 characters.', 422);
        }

        $pdo = db();
        $exists = $pdo->prepare('SELECT id FROM users WHERE email = ?');
        $exists->execute([$email]);
        if ($exists->fetch()) {
            json_error('An account with this email already exists.', 409);
        }

        $stmt = $pdo->prepare(
            'INSERT INTO users (full_name, email, phone, country, password_hash)
             VALUES (?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            trim($data['full_name']),
            $email,
            isset($data['phone']) ? trim($data['phone']) : null,
            isset($data['country']) ? trim($data['country']) : null,
            password_hash($data['password'], PASSWORD_DEFAULT),
        ]);
        $userId = (int) $pdo->lastInsertId();

        $code = self::issueOtp($userId, 'verify');

        json_response([
            'success' => true,
            'message' => 'Account created. Use the verification code to confirm your account.',
            'user'    => self::publicUser($userId),
            // Returned for development convenience (no SMS/email gateway configured).
            'otp'     => $code,
        ], 201);
    }

    public static function login(): void
    {
        $data = read_input();
        require_fields($data, ['email', 'password']);

        $identifier = strtolower(trim($data['email']));
        $pdo = db();
        $stmt = $pdo->prepare('SELECT * FROM users WHERE email = ? OR phone = ?');
        $stmt->execute([$identifier, trim($data['email'])]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($data['password'], $user['password_hash'])) {
            json_error('Invalid credentials.', 401);
        }

        json_response([
            'success' => true,
            'message' => 'Logged in successfully.',
            'user'    => self::publicUser((int) $user['id']),
        ]);
    }

    public static function verifyOtp(): void
    {
        $data = read_input();
        require_fields($data, ['email', 'code']);

        $user = self::findByEmail(strtolower(trim($data['email'])));
        if (!$user) {
            json_error('Account not found.', 404);
        }

        if (!self::consumeOtp((int) $user['id'], trim($data['code']), 'verify')) {
            json_error('Invalid or expired verification code.', 400);
        }

        db()->prepare('UPDATE users SET is_verified = 1 WHERE id = ?')
            ->execute([$user['id']]);

        json_response([
            'success' => true,
            'message' => 'Account verified successfully.',
            'user'    => self::publicUser((int) $user['id']),
        ]);
    }

    public static function requestReset(): void
    {
        $data = read_input();
        require_fields($data, ['email']);

        $user = self::findByEmail(strtolower(trim($data['email'])));
        // Always respond success to avoid leaking which emails exist.
        $code = $user ? self::issueOtp((int) $user['id'], 'reset') : null;

        json_response([
            'success' => true,
            'message' => 'If the account exists, a reset code has been sent.',
            'otp'     => $code, // development convenience only
        ]);
    }

    public static function resetPassword(): void
    {
        $data = read_input();
        require_fields($data, ['email', 'code', 'password']);

        if (strlen($data['password']) < 6) {
            json_error('Password must be at least 6 characters.', 422);
        }

        $user = self::findByEmail(strtolower(trim($data['email'])));
        if (!$user) {
            json_error('Account not found.', 404);
        }

        if (!self::consumeOtp((int) $user['id'], trim($data['code']), 'reset')) {
            json_error('Invalid or expired reset code.', 400);
        }

        db()->prepare('UPDATE users SET password_hash = ? WHERE id = ?')
            ->execute([password_hash($data['password'], PASSWORD_DEFAULT), $user['id']]);

        json_response(['success' => true, 'message' => 'Password updated successfully.']);
    }

    // --- helpers -----------------------------------------------------------

    private static function issueOtp(int $userId, string $purpose): string
    {
        $code = generate_otp(4);
        $expires = (new DateTime('+' . app_config()['otp_ttl_minutes'] . ' minutes'))
            ->format('Y-m-d H:i:s');

        db()->prepare(
            'INSERT INTO otps (user_id, code, purpose, expires_at) VALUES (?, ?, ?, ?)'
        )->execute([$userId, $code, $purpose, $expires]);

        return $code;
    }

    private static function consumeOtp(int $userId, string $code, string $purpose): bool
    {
        $pdo = db();
        $stmt = $pdo->prepare(
            'SELECT id FROM otps
             WHERE user_id = ? AND code = ? AND purpose = ? AND used = 0 AND expires_at >= NOW()
             ORDER BY id DESC LIMIT 1'
        );
        $stmt->execute([$userId, $code, $purpose]);
        $row = $stmt->fetch();
        if (!$row) {
            return false;
        }
        $pdo->prepare('UPDATE otps SET used = 1 WHERE id = ?')->execute([$row['id']]);
        return true;
    }

    private static function findByEmail(string $email): ?array
    {
        $stmt = db()->prepare('SELECT * FROM users WHERE email = ?');
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        return $user ?: null;
    }

    private static function publicUser(int $id): array
    {
        $stmt = db()->prepare(
            'SELECT id, full_name, email, phone, country, is_verified, created_at
             FROM users WHERE id = ?'
        );
        $stmt->execute([$id]);
        $user = $stmt->fetch();
        $user['is_verified'] = (bool) $user['is_verified'];
        return $user;
    }
}
