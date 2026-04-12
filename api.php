<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

$host = 'localhost';
$db   = 'u869576174_bistro';
$user = 'u869576174_centrala';
$pass = 'BRoda2026!';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(Exception $e) {
    echo json_encode(['error' => 'DB connection failed: ' . $e->getMessage()]);
    exit;
}

// Utwórz tabelę jeśli nie istnieje
$pdo->exec("CREATE TABLE IF NOT EXISTS recipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    data LONGTEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)");

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'GET' && $action === 'list') {
    $stmt = $pdo->query("SELECT id, name, created_at, updated_at FROM recipes ORDER BY updated_at DESC");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}
elseif ($method === 'GET' && $action === 'get') {
    $id = intval($_GET['id']);
    $stmt = $pdo->prepare("SELECT * FROM recipes WHERE id = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode($row ?: ['error' => 'Not found']);
}
elseif ($method === 'POST' && $action === 'save') {
    $body = json_decode(file_get_contents('php://input'), true);
    $name = $body['name'] ?? '';
    $data = json_encode($body);
    if (!$name) { echo json_encode(['error' => 'No name']); exit; }
    $id = $body['id'] ?? null;
    if ($id) {
        $stmt = $pdo->prepare("UPDATE recipes SET name=?, data=? WHERE id=?");
        $stmt->execute([$name, $data, $id]);
        echo json_encode(['ok' => true, 'id' => $id]);
    } else {
        $stmt = $pdo->prepare("INSERT INTO recipes (name, data) VALUES (?, ?)");
        $stmt->execute([$name, $data]);
        echo json_encode(['ok' => true, 'id' => $pdo->lastInsertId()]);
    }
}
elseif ($method === 'DELETE' && $action === 'delete') {
    $id = intval($_GET['id']);
    $stmt = $pdo->prepare("DELETE FROM recipes WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['ok' => true]);
}
else {
    echo json_encode(['error' => 'Unknown action']);
}
