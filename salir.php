<?php
/*
  hecho por piero. cierra la sesión del vecino, solo acepta el formulario
  del botón salir con su token, así nadie puede sacarlo de su cuenta con un
  enlace o una imagen puesta en otra página
*/
require_once __DIR__ . "/app/funciones.php";
require_once __DIR__ . "/app/almacen.php";

// si alguien abre salir.php escribiendo la dirección no cerramos nada,
// 405 es el código de método no permitido
if (!seEnvioFormulario()) {
    http_response_code(405);
    header("Allow: POST");
    header("Content-Type: text/html; charset=utf-8");
    echo "<!DOCTYPE html><html lang=\"es\"><head><meta charset=\"UTF-8\">";
    echo "<title>Salir de Kercado</title></head><body>";
    echo "<h1>Para salir usa el botón Salir de la cabecera</h1>";
    echo "<p><a href=\"index.php\">Volver al inicio</a></p>";
    echo "</body></html>";
    exit;
}

comprobarCsrf();
cerrarSesion();

// cerrarSesion() destruyó la sesión, abrimos una nueva vacía solo para
// dejarle el aviso al inicio
session_start();
avisar("cerraste tu sesión");
redirigir("index.php");
