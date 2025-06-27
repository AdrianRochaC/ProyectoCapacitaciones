<?php
include "conexion.php";

$data = json_decode(file_get_contents("php://input"));
$nombre = $conn->real_escape_string($data->nombre);
$email = $conn->real_escape_string($data->email);
$password = password_hash($data->password, PASSWORD_DEFAULT);
$rol = $conn->real_escape_string($data->rol);

$query = "INSERT INTO usuarios (nombre, email, password, rol)
          VALUES ('$nombre', '$email', '$password', '$rol')";

if ($conn->query($query)) {
  echo json_encode(["success" => true, "message" => "Usuario registrado correctamente"]);
} else {
  echo json_encode(["success" => false, "message" => "Error al registrar: " . $conn->error]);
}
?>
