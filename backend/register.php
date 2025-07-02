<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Configuración de la base de datos Railway
$host = 'caboose.proxy.rlwy.net';
$port = 46666;
$dbname = 'railway';
$username = 'root';
$password = 'ZcVJNaDrDEeLSQUNtTYAcKsLzpVgmNEe';

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    $nombre = $input['nombre'];
    $email = $input['email'];
    $password_hash = password_hash($input['password'], PASSWORD_DEFAULT);
    $rol = $input['rol'];
    
    $sql = "INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$nombre, $email, $password_hash, $rol]);
    
    echo json_encode(['message' => 'Usuario registrado exitosamente']);
    
} catch(PDOException $e) {
    echo json_encode(['message' => 'Error: ' . $e->getMessage()]);
}
?>