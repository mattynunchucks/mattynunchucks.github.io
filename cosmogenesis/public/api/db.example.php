<?php
// Copy this file to db.php and fill in your DreamHost MySQL credentials.
// db.php is gitignored — never commit your actual credentials.
//
// Find these values in the DreamHost panel under:
//   Databases > MySQL Databases > your database row

$DB_HOST = 'mysql.example.dreamhostps.com';  // your DreamHost MySQL hostname
$DB_NAME = 'your_database_name';
$DB_USER = 'your_db_username';
$DB_PASS = 'your_db_password';

try {
    $pdo = new PDO(
        "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4",
        $DB_USER,
        $DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

// Run this once in phpMyAdmin or via SSH to create the table:
//
// CREATE TABLE IF NOT EXISTS saves (
//   token      VARCHAR(36)  NOT NULL PRIMARY KEY,
//   save_data  LONGTEXT     NOT NULL,
//   updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
