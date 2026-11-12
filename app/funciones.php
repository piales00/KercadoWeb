<?php
/*
  hecho por piero. aquí están las funciones que usan todas las páginas del
  lado del servidor, arranca la sesión de forma segura, escapa lo que se
  imprime, protege los formularios con un token, guarda los avisos para la
  siguiente página y revisa las fotos que suben los vecinos
*/

require_once __DIR__ . "/config.php";
require_once __DIR__ . "/conexion.php";

// la cookie de la sesión no la puede leer javascript, no viaja cuando otro
// sitio nos manda un formulario, y si hay https solo viaja cifrada, el path
// vacío hace que valga para la carpeta donde esté el sitio, así funciona
// igual en localhost/kercado/ que en la raíz del hosting
if (session_status() === PHP_SESSION_NONE) {
    $hayHttps = !empty($_SERVER["HTTPS"]) && $_SERVER["HTTPS"] !== "off";

    ini_set("session.use_strict_mode", "1");
    session_set_cookie_params([
        "lifetime" => 0,
        "path" => "",
        "secure" => $hayHttps,
        "httponly" => true,
        "samesite" => "Lax",
    ]);
    session_start();
}


// formatos que se ven en todo el sitio

// todo lo que se imprime en el html pasa por aquí, así un nombre con
// etiquetas se ve como texto y no se ejecuta
function e($texto): string
{
    return htmlspecialchars((string) $texto, ENT_QUOTES, "UTF-8");
}

// el precio siempre igual, con S/ y dos decimales, 8 sale S/ 8.00
function formatearPrecio($numero): string
{
    return "S/ " . number_format((float) $numero, 2, ".", "");
}

// pasa 2026-10-13 o 2026-10-13 18:42:00 a 13/10/2026, cortamos el texto
// igual que en javascript para no depender de la zona horaria
function formatearFecha($fecha): string
{
    $partes = explode("-", substr((string) $fecha, 0, 10));

    if (count($partes) !== 3) {
        return "";
    }

    return $partes[2] . "/" . $partes[1] . "/" . $partes[0];
}

// el nombre y el apellido juntos, o un texto genérico si no hay residente
function nombreCompleto(?array $residente): string
{
    if ($residente === null) {
        return "Vecino del condominio";
    }

    return $residente["nombres"] . " " . $residente["apellidos"];
}

// la torre y el departamento como salen en todo el sitio
function textoUnidad(?array $residente): string
{
    if ($residente === null) {
        return "";
    }

    return "Torre " . $residente["torre"] . ", Dpto. " . $residente["numeroDepartamento"];
}

// la clase de color de cada estado, sirve para pedidos y publicaciones, es
// la misma lógica que tenía base.js en el avance 2
function claseEstado(string $estado): string
{
    if ($estado === "Aceptado") {
        return "estado estado--aceptado";
    }
    if ($estado === "En preparación") {
        return "estado estado--preparacion";
    }
    if ($estado === "Entregado" || $estado === "Activa") {
        return "estado estado--entregado";
    }
    if ($estado === "Cancelado" || $estado === "Baja") {
        return "estado estado--cancelado";
    }
    return "estado estado--pendiente";
}


// lo que llega de los formularios y de la dirección

function seEnvioFormulario(): bool
{
    return $_SERVER["REQUEST_METHOD"] === "POST";
}

// si el campo no vino o vino como arreglo devolvemos texto vacío, así la
// página nunca recibe algo raro
function textoPost(string $campo): string
{
    if (!isset($_POST[$campo]) || !is_string($_POST[$campo])) {
        return "";
    }

    return trim($_POST[$campo]);
}

function textoGet(string $campo): string
{
    if (!isset($_GET[$campo]) || !is_string($_GET[$campo])) {
        return "";
    }

    return trim($_GET[$campo]);
}

function enteroPost(string $campo): int
{
    return (int) textoPost($campo);
}

function enteroGet(string $campo): int
{
    return (int) textoGet($campo);
}


// protección de los formularios

// cada sesión tiene un token secreto que va escondido en cada formulario,
// otro sitio no lo conoce, así no puede mandar formularios a nombre del vecino
function campoCsrf(): string
{
    if (empty($_SESSION["csrf"])) {
        $_SESSION["csrf"] = bin2hex(random_bytes(32));
    }

    return '<input type="hidden" name="csrf" value="' . e($_SESSION["csrf"]) . '">';
}

// compara el token del formulario con el de la sesión, hash_equals tarda lo
// mismo aunque fallen los primeros caracteres, así no se puede adivinar
function comprobarCsrf(): void
{
    $enviado = textoPost("csrf");

    if (empty($_SESSION["csrf"]) || !hash_equals($_SESSION["csrf"], $enviado)) {
        http_response_code(400);
        header("Content-Type: text/html; charset=utf-8");
        echo "<!DOCTYPE html><html lang=\"es\"><head><meta charset=\"UTF-8\">";
        echo "<title>No pudimos procesar el formulario</title></head><body>";
        echo "<h1>No pudimos procesar el formulario</h1>";
        echo "<p>Puede que la página haya estado abierta mucho tiempo, vuelve atrás, recarga la página y envíalo otra vez.</p>";
        echo "<p><a href=\"index.php\">Volver al inicio</a></p>";
        echo "</body></html>";
        exit;
    }
}


// avisos y redirecciones

// guarda el aviso en la sesión porque después de un formulario siempre
// redirigimos, y la plantilla lo muestra en la página siguiente
function avisar(string $texto, string $tipo = "ok"): void
{
    if ($tipo !== "error") {
        $tipo = "ok";
    }

    $_SESSION["avisos"][] = ["texto" => $texto, "tipo" => $tipo];
}

function redirigir(string $pagina): never
{
    header("Location: " . $pagina);
    exit;
}

// solo deja volver a páginas nuestras, como panel.php o producto.php?id=3,
// si alguien pone la dirección de otro sitio mandamos al inicio
function paginaSegura(string $volver): string
{
    if (preg_match('/^[a-z]+\.php(\?[^:]*)?$/', $volver) === 1) {
        return $volver;
    }

    return "index.php";
}

// la página donde está el vecino con su query, por ejemplo
// producto.php?id=3, para que después de ingresar vuelva ahí mismo
function paginaActual(): string
{
    $pagina = basename(parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH) ?? "");
    $query = $_SERVER["QUERY_STRING"] ?? "";

    if ($pagina === "") {
        $pagina = "index.php";
    }
    if ($query !== "") {
        $pagina = $pagina . "?" . $query;
    }

    return $pagina;
}

// las páginas privadas la llaman al empezar, sesionActual() está en
// almacen.php y revisa en la base que la cuenta siga activa
function exigirSesion(): array
{
    $residente = sesionActual();

    if ($residente === null) {
        avisar("primero ingresa con tu cuenta", "error");
        redirigir("registro.php?volver=" . urlencode(paginaActual()));
    }

    return $residente;
}

// como exigirSesion pero además tiene que ser de la administración, si no
// lo es le mostramos una página que explica por qué no puede entrar
function exigirAdmin(): array
{
    $residente = exigirSesion();

    if (!esAdmin($residente)) {
        http_response_code(403);
        abrirPagina("Sin permiso", "Esta parte es solo para la administración del condominio.", "");
        echo '<section class="seccion"><div class="contenedor">';
        echo '<h1 class="titulo-seccion">Esta parte es solo para la administración</h1>';
        echo '<p>Tu cuenta es de vecino, por eso no puedes ver la administración del condominio.</p>';
        echo '<p><a class="boton" href="panel.php">Ir a mi panel</a></p>';
        echo '</div></section>';
        cerrarPagina();
        exit;
    }

    return $residente;
}


// las fotos que suben los vecinos

// revisa la foto por su contenido y no por el nombre, porque el nombre se
// puede cambiar, y la guarda con un nombre al azar para que no se pise con
// otra ni se pueda adivinar
function recibirImagen(string $campo): ?string
{
    $tipos = [
        IMAGETYPE_JPEG => "jpg",
        IMAGETYPE_PNG => "png",
        IMAGETYPE_WEBP => "webp",
    ];

    if (!isset($_FILES[$campo])) {
        return null;
    }

    $archivo = $_FILES[$campo];

    if (is_array($archivo["error"])) {
        throw new RuntimeException("sube una sola foto");
    }
    if ($archivo["error"] === UPLOAD_ERR_NO_FILE) {
        return null;
    }
    if ($archivo["error"] === UPLOAD_ERR_INI_SIZE || $archivo["error"] === UPLOAD_ERR_FORM_SIZE) {
        throw new RuntimeException("la foto pesa más de 2 MB, prueba con una más liviana");
    }
    if ($archivo["error"] !== UPLOAD_ERR_OK) {
        throw new RuntimeException("no pudimos recibir la foto, vuelve a intentarlo");
    }
    if ($archivo["size"] > 2 * 1024 * 1024) {
        throw new RuntimeException("la foto pesa más de 2 MB, prueba con una más liviana");
    }

    $info = @getimagesize($archivo["tmp_name"]);
    if ($info === false || !isset($tipos[$info[2]])) {
        throw new RuntimeException("la foto tiene que ser jpg, png o webp");
    }

    $nombre = bin2hex(random_bytes(12)) . "." . $tipos[$info[2]];

    if (!move_uploaded_file($archivo["tmp_name"], __DIR__ . "/../uploads/" . $nombre)) {
        throw new RuntimeException("no pudimos guardar la foto, vuelve a intentarlo");
    }

    return "uploads/" . $nombre;
}

// imprime el error de un campo debajo de él, o nada si ese campo está bien
function pintarErrorCampo(array $errores, string $campo): void
{
    if (isset($errores[$campo])) {
        echo e($errores[$campo]);
    }
}
