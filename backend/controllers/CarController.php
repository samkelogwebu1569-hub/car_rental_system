<?php
/**
 * Car listing and search endpoints.
 */
class CarController
{
    public static function index(): void
    {
        $where = [];
        $params = [];

        // Free-text search across name / brand / model.
        if (!empty($_GET['q'])) {
            $like = '%' . trim($_GET['q']) . '%';
            $where[] = '(name LIKE :q_name OR brand LIKE :q_brand OR model LIKE :q_model)';
            $params[':q_name'] = $like;
            $params[':q_brand'] = $like;
            $params[':q_model'] = $like;
        }
        if (!empty($_GET['type'])) {
            $where[] = 'type = :type';
            $params[':type'] = trim($_GET['type']);
        }
        if (!empty($_GET['transmission'])) {
            $where[] = 'transmission = :transmission';
            $params[':transmission'] = trim($_GET['transmission']);
        }
        if (isset($_GET['min_price']) && $_GET['min_price'] !== '') {
            $where[] = 'price_per_day >= :min_price';
            $params[':min_price'] = (float) $_GET['min_price'];
        }
        if (isset($_GET['max_price']) && $_GET['max_price'] !== '') {
            $where[] = 'price_per_day <= :max_price';
            $params[':max_price'] = (float) $_GET['max_price'];
        }
        if (isset($_GET['available'])) {
            $where[] = 'available = :available';
            $params[':available'] = (int) ((bool) $_GET['available']);
        }

        $sql = 'SELECT * FROM cars';
        if (!empty($where)) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }
        $sql .= ' ORDER BY rating DESC, price_per_day ASC';

        $stmt = db()->prepare($sql);
        $stmt->execute($params);
        $cars = array_map([self::class, 'castCar'], $stmt->fetchAll());

        json_response([
            'success' => true,
            'count'   => count($cars),
            'data'    => $cars,
        ]);
    }

    public static function show(int $id): void
    {
        $stmt = db()->prepare('SELECT * FROM cars WHERE id = ?');
        $stmt->execute([$id]);
        $car = $stmt->fetch();
        if (!$car) {
            json_error('Car not found.', 404);
        }
        json_response(['success' => true, 'data' => self::castCar($car)]);
    }

    private static function castCar(array $car): array
    {
        $car['id'] = (int) $car['id'];
        $car['seats'] = (int) $car['seats'];
        $car['price_per_day'] = round((float) $car['price_per_day'], 2);
        $car['rating'] = round((float) $car['rating'], 1);
        $car['available'] = (bool) $car['available'];
        return $car;
    }
}
