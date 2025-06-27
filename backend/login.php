<?php
include "conexion.php";

$data = json_decode(file_get_contents("php://input"));
$email = $conn->real_escape_string($data->email);
$password = $data->password;

$query = "SELECT * FROM usuarios WHERE email = '$email'";
$result = $conn->query($query);

if ($result->num_rows === 1) {
  $user = $result->fetch_assoc();
  if (password_verify($password, $user["password"])) {
    echo json_encode([
      "success" => true,
      "message" => "Login exitoso",
      "user" => [
        "id" => $user["id"],
        "nombre" => $user["nombre"],
        "email" => $user["email"],
        "rol" => $user["rol"]
      ]
    ]);
  } else {
    echo json_encode(["success" => false, "message" => "Contraseña incorrecta"]);
  }
} else {
  echo json_encode(["success" => false, "message" => "Usuario no encontrado"]);
}
?>
