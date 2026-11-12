<?php
/*
  hecho por piero. abre la conexión con mysql usando pdo, la guardamos en
  una variable static para que en una misma petición se abra una sola vez
  aunque almacen.php llame a conexion() muchas veces
*/

require_once __DIR__ . "/config.php";

function conexion(): PDO
{
    static $pdo = null;

    if ($pdo !== null) {
        return $pdo;
    }

    $dsn = "mysql:host=" . BD_SERVIDOR . ";dbname=" . BD_NOMBRE . ";charset=utf8mb4";

    // con excepciones nos enteramos de cualquier error, las filas llegan
    // como arreglos con el nombre de la columna, y sin emular las
    // sentencias preparadas mysql recibe los datos aparte del sql
    $opciones = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];

    try {
        $pdo = new PDO($dsn, BD_USUARIO, BD_CLAVE, $opciones);
    } catch (PDOException $error) {
        // si la base no responde no tiene sentido seguir, avisamos con un
        // 503 que es el código de servicio no disponible
        http_response_code(503);
        header("Content-Type: text/html; charset=utf-8");
        echo "<!DOCTYPE html><html lang=\"es\"><head><meta charset=\"UTF-8\">";
        echo "<title>Kercado no está disponible</title></head><body>";
        echo "<h1>Kercado no está disponible en este momento</h1>";
        echo "<p>No pudimos conectarnos con la base de datos, vuelve a intentarlo en unos minutos.</p>";
        if (MODO_DESARROLLO) {
            echo "<p>" . htmlspecialchars($error->getMessage(), ENT_QUOTES, "UTF-8") . "</p>";
        }
        echo "</body></html>";
        exit;
    }

    return $pdo;
}
