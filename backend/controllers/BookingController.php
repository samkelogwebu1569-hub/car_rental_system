<?php
/**
 * Booking endpoint. Creates a rental booking for a user and car and computes
 * the total price from the rental duration.
 */
class BookingController
{
    public static function create(): void
    {
        $data = read_input();
        require_fields($data, ['user_id', 'car_id', 'start_date', 'end_date']);

        $start = DateTime::createFromFormat('Y-m-d', $data['start_date']);
        $end = DateTime::createFromFormat('Y-m-d', $data['end_date']);
        if (!$start || !$end || $end < $start) {
            json_error('Invalid start_date/end_date (expected YYYY-MM-DD, end >= start).', 422);
        }

        $pdo = db();

        $carStmt = $pdo->prepare('SELECT * FROM cars WHERE id = ?');
        $carStmt->execute([(int) $data['car_id']]);
        $car = $carStmt->fetch();
        if (!$car) {
            json_error('Car not found.', 404);
        }
        if (!$car['available']) {
            json_error('Car is not available for booking.', 409);
        }

        $userStmt = $pdo->prepare('SELECT id FROM users WHERE id = ?');
        $userStmt->execute([(int) $data['user_id']]);
        if (!$userStmt->fetch()) {
            json_error('User not found.', 404);
        }

        // Inclusive day count, minimum of one day.
        $days = (int) $start->diff($end)->days + 1;
        $total = $days * (float) $car['price_per_day'];

        $stmt = $pdo->prepare(
            'INSERT INTO bookings (user_id, car_id, start_date, end_date, total_price, status)
             VALUES (?, ?, ?, ?, ?, "confirmed")'
        );
        $stmt->execute([
            (int) $data['user_id'],
            (int) $data['car_id'],
            $start->format('Y-m-d'),
            $end->format('Y-m-d'),
            $total,
        ]);

        json_response([
            'success' => true,
            'message' => 'Booking confirmed.',
            'booking' => [
                'id'          => (int) $pdo->lastInsertId(),
                'user_id'     => (int) $data['user_id'],
                'car_id'      => (int) $data['car_id'],
                'start_date'  => $start->format('Y-m-d'),
                'end_date'    => $end->format('Y-m-d'),
                'days'        => $days,
                'total_price' => $total,
                'status'      => 'confirmed',
            ],
        ], 201);
    }
}
