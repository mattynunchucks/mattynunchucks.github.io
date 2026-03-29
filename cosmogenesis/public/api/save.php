<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/db.php';

function validToken($t) {
    return is_string($t) && preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i', $t);
}

$method = $_SERVER['REQUEST_METHOD'];

// ── GET: load save ────────────────────────────────────────────────────────────
if ($method === 'GET') {
    header('Cache-Control: no-store, no-cache, must-revalidate');
    header('Pragma: no-cache');
    $token = $_GET['token'] ?? '';
    if (!validToken($token)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid token']);
        exit;
    }
    $stmt = $pdo->prepare('SELECT save_data, updated_at FROM saves WHERE token = ?');
    $stmt->execute([$token]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
        http_response_code(404);
        echo json_encode(['error' => 'Not found']);
        exit;
    }
    echo json_encode(['save_data' => $row['save_data'], 'updated_at' => $row['updated_at']]);
    exit;
}

// ── POST: save ────────────────────────────────────────────────────────────────
if ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    $token     = $body['token']     ?? '';
    $save_data = $body['save_data'] ?? '';

    if (!validToken($token)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid token']);
        exit;
    }
    if (!is_string($save_data) || strlen($save_data) > 524288) { // 512 KB cap
        http_response_code(413);
        echo json_encode(['error' => 'Payload too large']);
        exit;
    }

    $score = isset($body['score']) ? intval($body['score']) : 0;

    $stmt = $pdo->prepare('
        INSERT INTO saves (token, save_data, score)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
            save_data = IF(VALUES(score) >= score, VALUES(save_data), save_data),
            score     = IF(VALUES(score) >= score, VALUES(score),     score)
    ');
    $stmt->execute([$token, $save_data, $score]);
    echo json_encode(['ok' => true, 'stored' => true]);
    exit;
}

// ── DELETE: erase save ────────────────────────────────────────────────────────
if ($method === 'DELETE') {
    $body  = json_decode(file_get_contents('php://input'), true);
    $token = $body['token'] ?? '';
    if (!validToken($token)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid token']);
        exit;
    }
    $stmt = $pdo->prepare('DELETE FROM saves WHERE token = ?');
    $stmt->execute([$token]);
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
