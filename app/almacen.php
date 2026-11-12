<?php
/*
  hecho por piero. esta es la misma capa de datos del avance 2, la que antes
  era almacen.js, pero ahora lee y escribe en mysql con pdo en vez de
  localStorage, las funciones se llaman igual y devuelven lo mismo, así las
  páginas no cambian su forma de pedir datos, es el único archivo del sitio
  que escribe sql y todas las consultas van con sentencias preparadas
*/
require_once __DIR__ . "/funciones.php";

// la imagen que lleva una publicación cuando no le subieron ninguna
const IMAGEN_POR_DEFECTO = "assets/img/kercado.png";

// los tres métodos de pago que kercado registra, el sitio no cobra
const METODOS_DE_PAGO = ["Efectivo contra entrega", "Yape", "Plin"];

// desde cada estado de un pedido, a cuáles se puede pasar, entregado y
// cancelado no tienen ninguno porque ahí el pedido ya terminó
const TRANSICIONES = [
    "Pendiente" => ["Aceptado", "Cancelado"],
    "Aceptado" => ["En preparación", "Cancelado"],
    "En preparación" => ["Entregado"],
    "Entregado" => [],
    "Cancelado" => []
];

// las columnas del residente que sí pueden salir de este archivo, la
// claveHash nunca se pide en las consultas que devuelven residentes
const COLUMNAS_RESIDENTE = "idResidente, nombres, apellidos, correo, telefono, torre, numeroDepartamento, rol, estado, fechaRegistro";


// ayudas que usan varias funciones de más abajo

// arma "?, ?, ?" con tantos signos como valores, para usar en un IN() sin
// meter los valores dentro del sql
function marcadores(int $cantidad): string
{
    $signos = [];
    for ($i = 0; $i < $cantidad; $i++) {
        $signos[] = "?";
    }
    return implode(", ", $signos);
}

// ejecuta una consulta preparada y devuelve todas las filas
function consultar(string $sql, array $parametros = []): array
{
    $sentencia = conexion()->prepare($sql);
    $sentencia->execute($parametros);
    return $sentencia->fetchAll();
}

// ejecuta una consulta preparada y devuelve la primera fila o null
function consultarUna(string $sql, array $parametros = []): ?array
{
    $sentencia = conexion()->prepare($sql);
    $sentencia->execute($parametros);
    $fila = $sentencia->fetch();
    if ($fila === false) {
        return null;
    }
    return $fila;
}

// ejecuta un insert, update o delete y devuelve cuántas filas tocó
function ejecutar(string $sql, array $parametros = []): int
{
    $sentencia = conexion()->prepare($sql);
    $sentencia->execute($parametros);
    return $sentencia->rowCount();
}

// deja un monto con dos decimales, mysql devuelve los decimal como texto y
// al sumarlos así evitamos cosas como 22.499999
function redondear($numero): float
{
    return round((float) $numero, 2);
}

// trae varios residentes de una sola vez, ordenados por su id, así no
// hacemos una consulta por cada publicación o pedido
function residentesPorId(array $ids): array
{
    $resultado = [];
    $ids = array_values(array_unique($ids));
    if (count($ids) === 0) {
        return $resultado;
    }
    $filas = consultar("SELECT " . COLUMNAS_RESIDENTE . " FROM residente WHERE idResidente IN (" . marcadores(count($ids)) . ")", $ids);
    foreach ($filas as $fila) {
        $fila["idResidente"] = (int) $fila["idResidente"];
        $resultado[$fila["idResidente"]] = $fila;
    }
    return $resultado;
}

// arma el mensaje de cuando no alcanza el stock
function mensajeSinStock(array $publicacion): string
{
    if ($publicacion["stock"] === 0) {
        return "ya no queda stock de " . $publicacion["titulo"];
    }
    if ($publicacion["stock"] === 1) {
        return "solo queda 1 unidad de " . $publicacion["titulo"];
    }
    return "solo quedan " . $publicacion["stock"] . " unidades de " . $publicacion["titulo"];
}


// categorías

// todas las categorías ordenadas por nombre, para los filtros y formularios
function listarCategorias(): array
{
    return consultar("SELECT idCategoria, nombre, descripcion FROM categoria ORDER BY nombre");
}

function obtenerCategoria(string $idCategoria): ?array
{
    return consultarUna("SELECT idCategoria, nombre, descripcion FROM categoria WHERE idCategoria = ?", [$idCategoria]);
}

// crea o edita una categoría, solo la administración puede, el id viaja en
// la url por eso lo dejamos en minúsculas, números y guiones
function guardarCategoria(string $idCategoria, string $nombre, string $descripcion, bool $esNueva): array
{
    $idCategoria = trim($idCategoria);
    $nombre = trim($nombre);
    $descripcion = trim($descripcion);

    if (!esAdmin(sesionActual())) {
        return ["ok" => false, "mensaje" => "solo la administración puede cambiar las categorías"];
    }
    if (!preg_match('/^[a-z0-9-]{1,30}$/', $idCategoria)) {
        return ["ok" => false, "mensaje" => "el código de la categoría solo lleva minúsculas, números y guiones"];
    }
    if ($nombre === "" || mb_strlen($nombre) > 60 || mb_strlen($descripcion) > 200) {
        return ["ok" => false, "mensaje" => "escribe un nombre de hasta 60 letras y una descripción de hasta 200"];
    }

    $existe = obtenerCategoria($idCategoria) !== null;

    if ($esNueva) {
        if ($existe) {
            return ["ok" => false, "mensaje" => "ya hay una categoría con ese código"];
        }
        ejecutar("INSERT INTO categoria (idCategoria, nombre, descripcion) VALUES (?, ?, ?)", [$idCategoria, $nombre, $descripcion]);
        return ["ok" => true, "mensaje" => "creaste la categoría " . $nombre];
    }

    if (!$existe) {
        return ["ok" => false, "mensaje" => "no encontramos esa categoría"];
    }
    ejecutar("UPDATE categoria SET nombre = ?, descripcion = ? WHERE idCategoria = ?", [$nombre, $descripcion, $idCategoria]);
    return ["ok" => true, "mensaje" => "guardaste los cambios de " . $nombre];
}

// borra una categoría, la llave foránea deja sus publicaciones sin categoría
// en vez de borrarlas
function eliminarCategoria(string $idCategoria): array
{
    if (!esAdmin(sesionActual())) {
        return ["ok" => false, "mensaje" => "solo la administración puede cambiar las categorías"];
    }
    $categoria = obtenerCategoria($idCategoria);
    if ($categoria === null) {
        return ["ok" => false, "mensaje" => "no encontramos esa categoría"];
    }
    ejecutar("DELETE FROM categoria WHERE idCategoria = ?", [$idCategoria]);
    return ["ok" => true, "mensaje" => "eliminaste la categoría " . $categoria["nombre"] . ", sus publicaciones quedaron sin categoría"];
}


// publicaciones

// la parte común de las consultas de publicaciones, ya trae el nombre de
// la categoría con un left join porque puede haber quedado sin categoría
const SELECT_PUBLICACION = "SELECT p.idPublicacion, p.titulo, p.descripcion, p.precio, p.stock, p.horario, p.idCategoria, p.idResidente, p.estado, p.fechaPublicacion, c.nombre AS nombreCategoria FROM publicacion p LEFT JOIN categoria c ON c.idCategoria = p.idCategoria";

// a cada publicación le agrega sus imágenes y su vendedor, se piden todas
// las imágenes y todos los vendedores en dos consultas y no una por fila
function completarPublicaciones(array $filas): array
{
    $ids = [];
    $idsVendedor = [];
    $imagenes = [];

    foreach ($filas as $fila) {
        $ids[] = (int) $fila["idPublicacion"];
        $idsVendedor[] = (int) $fila["idResidente"];
    }

    if (count($ids) > 0) {
        $rutas = consultar("SELECT idPublicacion, ruta FROM imagen_publicacion WHERE idPublicacion IN (" . marcadores(count($ids)) . ") ORDER BY orden, idImagen", $ids);
        foreach ($rutas as $ruta) {
            $imagenes[(int) $ruta["idPublicacion"]][] = $ruta["ruta"];
        }
    }

    $vendedores = residentesPorId($idsVendedor);

    $resultado = [];
    foreach ($filas as $fila) {
        $fila["idPublicacion"] = (int) $fila["idPublicacion"];
        $fila["idResidente"] = (int) $fila["idResidente"];
        $fila["precio"] = redondear($fila["precio"]);
        $fila["stock"] = (int) $fila["stock"];
        if ($fila["nombreCategoria"] === null) {
            $fila["nombreCategoria"] = "Sin categoría";
        }
        $fila["imagenes"] = $imagenes[$fila["idPublicacion"]] ?? [IMAGEN_POR_DEFECTO];
        $fila["vendedor"] = $vendedores[$fila["idResidente"]] ?? null;
        $resultado[] = $fila;
    }
    return $resultado;
}

// las publicaciones activas de vecinos activos que ve el catálogo, cada
// parte del filtro es opcional, el texto se parte en palabras y cada una
// tiene que aparecer en el título, la descripción o la categoría
function listarPublicaciones(array $filtro = []): array
{
    $sql = SELECT_PUBLICACION . " JOIN residente r ON r.idResidente = p.idResidente WHERE p.estado = 'Activa' AND r.estado = 'Activo'";
    $parametros = [];

    if (!empty($filtro["idCategoria"])) {
        $sql .= " AND p.idCategoria = ?";
        $parametros[] = $filtro["idCategoria"];
    }
    if (isset($filtro["precioMin"]) && is_numeric($filtro["precioMin"])) {
        $sql .= " AND p.precio >= ?";
        $parametros[] = $filtro["precioMin"];
    }
    if (isset($filtro["precioMax"]) && is_numeric($filtro["precioMax"])) {
        $sql .= " AND p.precio <= ?";
        $parametros[] = $filtro["precioMax"];
    }

    // los % y _ que escriba el vecino se escapan para que like los tome
    // como letras normales y no como comodines
    $palabras = explode(" ", trim($filtro["texto"] ?? ""));
    foreach ($palabras as $palabra) {
        if ($palabra === "") {
            continue;
        }
        $patron = "%" . addcslashes($palabra, "%_\\") . "%";
        $sql .= " AND (p.titulo LIKE ? OR p.descripcion LIKE ? OR c.nombre LIKE ?)";
        $parametros[] = $patron;
        $parametros[] = $patron;
        $parametros[] = $patron;
    }

    // el orden sale de una lista fija, nunca de lo que mandó el usuario
    $orden = $filtro["orden"] ?? "recientes";
    if ($orden === "precio-asc") {
        $sql .= " ORDER BY p.precio ASC, p.idPublicacion DESC";
    } elseif ($orden === "precio-desc") {
        $sql .= " ORDER BY p.precio DESC, p.idPublicacion DESC";
    } else {
        $sql .= " ORDER BY p.fechaPublicacion DESC, p.idPublicacion DESC";
    }

    return completarPublicaciones(consultar($sql, $parametros));
}

// una publicación en cualquier estado, la ficha decide qué mostrar
function obtenerPublicacion(int $idPublicacion): ?array
{
    $fila = consultarUna(SELECT_PUBLICACION . " WHERE p.idPublicacion = ?", [$idPublicacion]);
    if ($fila === null) {
        return null;
    }
    return completarPublicaciones([$fila])[0];
}

// todas las publicaciones de un vecino para su panel, también las de baja
function publicacionesDelVendedor(int $idResidente): array
{
    $filas = consultar(SELECT_PUBLICACION . " WHERE p.idResidente = ? ORDER BY p.fechaPublicacion DESC, p.idPublicacion DESC", [$idResidente]);
    return completarPublicaciones($filas);
}

// crea una publicación del vecino que tiene la sesión abierta, la página ya
// valida el formulario pero aquí lo revisamos otra vez para que nunca se
// guarde una publicación a medias, la publicación y sus imágenes entran
// juntas en una transacción
function crearPublicacion(array $datos): array
{
    $residente = sesionActual();
    $titulo = trim((string) ($datos["titulo"] ?? ""));
    $descripcion = trim((string) ($datos["descripcion"] ?? ""));
    $horario = trim((string) ($datos["horario"] ?? ""));
    $idCategoria = (string) ($datos["idCategoria"] ?? "");
    $precio = $datos["precio"] ?? "";
    $stock = $datos["stock"] ?? "";
    $imagenes = $datos["imagenes"] ?? [];

    if ($residente === null) {
        return ["ok" => false, "mensaje" => "inicia sesión para publicar un producto", "idPublicacion" => 0];
    }
    if ($titulo === "" || mb_strlen($titulo) > 80 || $descripcion === "" || mb_strlen($descripcion) > 500 || mb_strlen($horario) > 40) {
        return ["ok" => false, "mensaje" => "revisa el título y la descripción del producto", "idPublicacion" => 0];
    }
    if (!is_numeric($precio) || $precio <= 0 || $precio > 999999) {
        return ["ok" => false, "mensaje" => "el precio tiene que ser mayor que cero", "idPublicacion" => 0];
    }
    if (filter_var($stock, FILTER_VALIDATE_INT) === false || (int) $stock < 0) {
        return ["ok" => false, "mensaje" => "el stock tiene que ser un número entero, 0 o más", "idPublicacion" => 0];
    }
    if (obtenerCategoria($idCategoria) === null) {
        return ["ok" => false, "mensaje" => "elige una categoría de la lista", "idPublicacion" => 0];
    }
    if (!is_array($imagenes)) {
        $imagenes = [];
    }

    $bd = conexion();
    $bd->beginTransaction();
    try {
        ejecutar(
            "INSERT INTO publicacion (titulo, descripcion, precio, stock, horario, idCategoria, idResidente, estado, fechaPublicacion) VALUES (?, ?, ?, ?, ?, ?, ?, 'Activa', CURDATE())",
            [$titulo, $descripcion, redondear($precio), (int) $stock, $horario, $idCategoria, $residente["idResidente"]]
        );
        $idPublicacion = (int) $bd->lastInsertId();

        $orden = 0;
        foreach ($imagenes as $ruta) {
            ejecutar("INSERT INTO imagen_publicacion (idPublicacion, ruta, orden) VALUES (?, ?, ?)", [$idPublicacion, $ruta, $orden]);
            $orden++;
        }
        $bd->commit();
    } catch (Throwable $error) {
        $bd->rollBack();
        throw $error;
    }

    return ["ok" => true, "mensaje" => "publicaste " . $titulo . ", ya aparece en el catálogo", "idPublicacion" => $idPublicacion];
}

// da de baja una publicación, deja de salir en el catálogo pero no se
// borra porque los pedidos antiguos la siguen nombrando, solo su dueño puede
function darDeBajaPublicacion(int $idPublicacion): array
{
    $residente = sesionActual();
    $publicacion = consultarUna("SELECT idResidente, titulo FROM publicacion WHERE idPublicacion = ?", [$idPublicacion]);

    if ($residente === null) {
        return ["ok" => false, "mensaje" => "inicia sesión para dar de baja tus publicaciones"];
    }
    if ($publicacion === null) {
        return ["ok" => false, "mensaje" => "no encontramos esa publicación"];
    }
    if ((int) $publicacion["idResidente"] !== $residente["idResidente"]) {
        return ["ok" => false, "mensaje" => "solo puedes dar de baja tus propias publicaciones"];
    }

    ejecutar("UPDATE publicacion SET estado = 'Baja' WHERE idPublicacion = ?", [$idPublicacion]);
    return ["ok" => true, "mensaje" => "diste de baja " . $publicacion["titulo"] . ", ya no sale en el catálogo"];
}

// todas las publicaciones en cualquier estado, para la administración
function listarTodasLasPublicaciones(): array
{
    if (!esAdmin(sesionActual())) {
        return [];
    }
    return completarPublicaciones(consultar(SELECT_PUBLICACION . " ORDER BY p.fechaPublicacion DESC, p.idPublicacion DESC"));
}

// la administración puede observar una publicación que no corresponde,
// darla de baja o volver a activarla
function cambiarEstadoPublicacion(int $idPublicacion, string $estado): array
{
    if (!esAdmin(sesionActual())) {
        return ["ok" => false, "mensaje" => "solo la administración puede cambiar el estado de una publicación"];
    }
    if (!in_array($estado, ["Activa", "Observada", "Baja"], true)) {
        return ["ok" => false, "mensaje" => "ese estado no existe para una publicación"];
    }
    $publicacion = consultarUna("SELECT titulo FROM publicacion WHERE idPublicacion = ?", [$idPublicacion]);
    if ($publicacion === null) {
        return ["ok" => false, "mensaje" => "no encontramos esa publicación"];
    }

    ejecutar("UPDATE publicacion SET estado = ? WHERE idPublicacion = ?", [$estado, $idPublicacion]);
    return ["ok" => true, "mensaje" => $publicacion["titulo"] . " pasó a " . mb_strtolower($estado)];
}


// residentes y sesión

function obtenerResidente(int $idResidente): ?array
{
    $residentes = residentesPorId([$idResidente]);
    return $residentes[$idResidente] ?? null;
}

// busca a un residente por su correo, sin importar las mayúsculas
function buscarPorCorreo(string $correo): ?array
{
    $fila = consultarUna("SELECT " . COLUMNAS_RESIDENTE . " FROM residente WHERE LOWER(correo) = ?", [mb_strtolower(trim($correo))]);
    if ($fila !== null) {
        $fila["idResidente"] = (int) $fila["idResidente"];
    }
    return $fila;
}

// guarda la solicitud de registro con la clave como hash, la cuenta queda
// pendiente hasta que la administración confirme que la persona vive en el
// condominio
function registrarSolicitud(array $datos): array
{
    $correo = mb_strtolower(trim((string) ($datos["correo"] ?? "")));
    $nombres = trim((string) ($datos["nombres"] ?? ""));
    $apellidos = trim((string) ($datos["apellidos"] ?? ""));
    $clave = (string) ($datos["clave"] ?? "");
    $telefono = trim((string) ($datos["telefono"] ?? ""));
    $torre = trim((string) ($datos["torre"] ?? ""));
    $numeroDepartamento = trim((string) ($datos["numeroDepartamento"] ?? ""));

    if ($correo === "" || $nombres === "" || $apellidos === "" || $clave === "" || $torre === "") {
        return ["ok" => false, "mensaje" => "faltan datos para registrar la solicitud"];
    }
    if (!filter_var($correo, FILTER_VALIDATE_EMAIL) || !in_array($torre, ["A", "B", "C", "D"], true)
        || !preg_match('/^9[0-9]{8}$/', $telefono) || !preg_match('/^[0-9]{1,4}$/', $numeroDepartamento)) {
        return ["ok" => false, "mensaje" => "revisa el correo, el teléfono, la torre y el departamento"];
    }
    if (buscarPorCorreo($correo) !== null) {
        return ["ok" => false, "mensaje" => "ya hay una cuenta registrada con ese correo"];
    }

    ejecutar(
        "INSERT INTO residente (nombres, apellidos, correo, claveHash, telefono, torre, numeroDepartamento, rol, estado) VALUES (?, ?, ?, ?, ?, ?, ?, 'residente', 'Pendiente')",
        [$nombres, $apellidos, $correo, password_hash($clave, PASSWORD_DEFAULT), $telefono, $torre, $numeroDepartamento]
    );

    return [
        "ok" => true,
        "mensaje" => "recibimos tu solicitud, tu cuenta queda pendiente hasta que la administración confirme que vives en el condominio"
    ];
}

// revisa el correo y la clave, y si la cuenta está activa guarda quién
// entró, el mensaje cambia según qué falló para que el vecino sepa qué
// hacer, el id de sesión se cambia al entrar para que nadie pueda usar uno
// que haya conseguido antes
function iniciarSesion(string $correo, string $clave): array
{
    // aquí sí pedimos la claveHash, pero solo para compararla y no sale
    // de esta función
    $fila = consultarUna("SELECT idResidente, claveHash, estado FROM residente WHERE LOWER(correo) = ?", [mb_strtolower(trim($correo))]);

    if ($fila === null || !password_verify($clave, $fila["claveHash"])) {
        return ["ok" => false, "mensaje" => "el correo o la contraseña no coinciden", "residente" => null];
    }
    if ($fila["estado"] === "Pendiente") {
        return ["ok" => false, "mensaje" => "tu cuenta todavía está pendiente, la administración tiene que validarla", "residente" => null];
    }
    if ($fila["estado"] !== "Activo") {
        return ["ok" => false, "mensaje" => "tu cuenta está inactiva, consulta con la administración", "residente" => null];
    }

    session_regenerate_id(true);
    $_SESSION["idResidente"] = (int) $fila["idResidente"];
    $residente = obtenerResidente((int) $fila["idResidente"]);

    return ["ok" => true, "mensaje" => "hola " . $residente["nombres"] . ", ya entraste a tu cuenta", "residente" => $residente];
}

// borra todo lo de la sesión, también la cookie del navegador, para que
// no quede nada del vecino que salió
function cerrarSesion(): void
{
    $_SESSION = [];
    if (ini_get("session.use_cookies")) {
        $cookie = session_get_cookie_params();
        setcookie(session_name(), "", [
            "expires" => time() - 42000,
            "path" => $cookie["path"],
            "domain" => $cookie["domain"],
            "secure" => $cookie["secure"],
            "httponly" => $cookie["httponly"],
            "samesite" => $cookie["samesite"]
        ]);
    }
    session_destroy();
}

// el residente que tiene la sesión abierta, se vuelve a leer de la base en
// cada petición para que si la administración lo desactiva pierda el
// acceso al momento
function sesionActual(): ?array
{
    if (empty($_SESSION["idResidente"])) {
        return null;
    }
    $residente = obtenerResidente((int) $_SESSION["idResidente"]);
    if ($residente === null || $residente["estado"] !== "Activo") {
        return null;
    }
    return $residente;
}

function esAdmin(?array $residente): bool
{
    return $residente !== null && $residente["rol"] === "admin";
}

// los residentes para la administración, si viene un estado solo esos
function listarResidentes(string $estado = ""): array
{
    if (!esAdmin(sesionActual())) {
        return [];
    }
    if ($estado === "") {
        $filas = consultar("SELECT " . COLUMNAS_RESIDENTE . " FROM residente ORDER BY fechaRegistro DESC, idResidente DESC");
    } else {
        $filas = consultar("SELECT " . COLUMNAS_RESIDENTE . " FROM residente WHERE estado = ? ORDER BY fechaRegistro DESC, idResidente DESC", [$estado]);
    }
    foreach ($filas as $i => $fila) {
        $filas[$i]["idResidente"] = (int) $fila["idResidente"];
    }
    return $filas;
}

// la administración valida, activa o desactiva cuentas, pero no la suya,
// para que no se quede afuera sin querer
function cambiarEstadoResidente(int $idResidente, string $estado): array
{
    $admin = sesionActual();
    if (!esAdmin($admin)) {
        return ["ok" => false, "mensaje" => "solo la administración puede cambiar el estado de una cuenta"];
    }
    if (!in_array($estado, ["Activo", "Pendiente", "Inactivo"], true)) {
        return ["ok" => false, "mensaje" => "ese estado no existe para una cuenta"];
    }
    if ($idResidente === $admin["idResidente"]) {
        return ["ok" => false, "mensaje" => "no puedes cambiar el estado de tu propia cuenta"];
    }
    $residente = obtenerResidente($idResidente);
    if ($residente === null) {
        return ["ok" => false, "mensaje" => "no encontramos a ese residente"];
    }

    ejecutar("UPDATE residente SET estado = ? WHERE idResidente = ?", [$estado, $idResidente]);
    return ["ok" => true, "mensaje" => "la cuenta de " . $residente["nombres"] . " " . $residente["apellidos"] . " pasó a " . mb_strtolower($estado)];
}


// carrito

// el carrito vive en la sesión como idPublicacion y cantidad, el precio y
// el stock siempre se leen de la base y nunca del formulario

// el carrito listo para pintar, cada línea trae la publicación completa y
// su subtotal, si un producto ya no está activo se quita solo
function obtenerCarrito(): array
{
    if (sesionActual() === null || empty($_SESSION["carrito"])) {
        return [];
    }

    $resultado = [];
    foreach ($_SESSION["carrito"] as $idPublicacion => $cantidad) {
        $publicacion = obtenerPublicacion((int) $idPublicacion);
        if ($publicacion === null || $publicacion["estado"] !== "Activa") {
            unset($_SESSION["carrito"][$idPublicacion]);
            continue;
        }
        $resultado[] = [
            "idPublicacion" => (int) $idPublicacion,
            "cantidad" => (int) $cantidad,
            "publicacion" => $publicacion,
            "subtotal" => redondear($publicacion["precio"] * $cantidad)
        ];
    }
    return $resultado;
}

// junta las líneas del carrito por vendedor, porque cada vecino recibe su
// propio pedido con su propio código
function carritoPorVendedor(): array
{
    $grupos = [];
    foreach (obtenerCarrito() as $linea) {
        $idVendedor = $linea["publicacion"]["idResidente"];
        if (!isset($grupos[$idVendedor])) {
            $grupos[$idVendedor] = ["vendedor" => $linea["publicacion"]["vendedor"], "lineas" => [], "total" => 0.0];
        }
        $grupos[$idVendedor]["lineas"][] = $linea;
        $grupos[$idVendedor]["total"] = redondear($grupos[$idVendedor]["total"] + $linea["subtotal"]);
    }
    return array_values($grupos);
}

// agrega unidades al carrito revisando que haya sesión, que el producto
// esté activo, que no sea del mismo vecino y que alcance el stock
function agregarAlCarrito(int $idPublicacion, int $cantidad): array
{
    $residente = sesionActual();
    $publicacion = obtenerPublicacion($idPublicacion);

    if ($residente === null) {
        return ["ok" => false, "mensaje" => "inicia sesión para agregar productos a tu carrito"];
    }
    if ($publicacion === null || $publicacion["estado"] !== "Activa") {
        return ["ok" => false, "mensaje" => "ese producto ya no está disponible"];
    }
    if ($publicacion["idResidente"] === $residente["idResidente"]) {
        return ["ok" => false, "mensaje" => "esta publicación es tuya, no la puedes agregar a tu carrito"];
    }
    if ($cantidad < 1) {
        return ["ok" => false, "mensaje" => "la cantidad tiene que ser 1 o más"];
    }

    $yaTiene = (int) ($_SESSION["carrito"][$idPublicacion] ?? 0);
    if ($yaTiene + $cantidad > $publicacion["stock"]) {
        if ($yaTiene > 0) {
            return ["ok" => false, "mensaje" => mensajeSinStock($publicacion) . " y ya tienes " . $yaTiene . " en tu carrito"];
        }
        return ["ok" => false, "mensaje" => mensajeSinStock($publicacion)];
    }

    $_SESSION["carrito"][$idPublicacion] = $yaTiene + $cantidad;

    if ($cantidad === 1) {
        return ["ok" => true, "mensaje" => "agregaste 1 unidad de " . $publicacion["titulo"] . " a tu carrito"];
    }
    return ["ok" => true, "mensaje" => "agregaste " . $cantidad . " unidades de " . $publicacion["titulo"] . " a tu carrito"];
}

// cambia la cantidad de un producto que ya está en el carrito, con 0 se
// quita la línea
function cambiarCantidad(int $idPublicacion, int $cantidad): array
{
    if (!isset($_SESSION["carrito"][$idPublicacion])) {
        return ["ok" => false, "mensaje" => "ese producto no está en tu carrito"];
    }
    if ($cantidad < 0) {
        return ["ok" => false, "mensaje" => "la cantidad no puede ser negativa"];
    }
    if ($cantidad === 0) {
        quitarDelCarrito($idPublicacion);
        return ["ok" => true, "mensaje" => "quitaste el producto de tu carrito"];
    }

    $publicacion = obtenerPublicacion($idPublicacion);
    if ($publicacion === null || $publicacion["estado"] !== "Activa") {
        return ["ok" => false, "mensaje" => "ese producto ya no está disponible"];
    }
    if ($cantidad > $publicacion["stock"]) {
        return ["ok" => false, "mensaje" => mensajeSinStock($publicacion)];
    }

    $_SESSION["carrito"][$idPublicacion] = $cantidad;
    return ["ok" => true, "mensaje" => "actualizamos la cantidad de " . $publicacion["titulo"]];
}

function quitarDelCarrito(int $idPublicacion): void
{
    unset($_SESSION["carrito"][$idPublicacion]);
}

// solo borramos el carrito y no toda la sesión, así el vecino sigue adentro
function vaciarCarrito(): void
{
    unset($_SESSION["carrito"]);
}

function totalCarrito(): float
{
    $total = 0.0;
    foreach (obtenerCarrito() as $linea) {
        $total = $total + $linea["subtotal"];
    }
    return redondear($total);
}

// el total de unidades, es el número que sale en la cabecera
function cantidadEnCarrito(): int
{
    $cantidad = 0;
    foreach (obtenerCarrito() as $linea) {
        $cantidad = $cantidad + $linea["cantidad"];
    }
    return $cantidad;
}


// pedidos

// a cada pedido le agrega sus detalles, su pago, su comprador y su
// vendedor, pidiendo cada cosa una sola vez para todos los pedidos
function completarPedidos(array $filas): array
{
    $ids = [];
    $idsResidente = [];
    $detalles = [];
    $pagos = [];

    foreach ($filas as $fila) {
        $ids[] = (int) $fila["idPedido"];
        $idsResidente[] = (int) $fila["idComprador"];
        $idsResidente[] = (int) $fila["idVendedor"];
    }

    if (count($ids) > 0) {
        $lista = marcadores(count($ids));
        foreach (consultar("SELECT idDetalle, idPedido, idPublicacion, titulo, cantidad, precioUnitario, subtotal FROM detalle_pedido WHERE idPedido IN (" . $lista . ") ORDER BY idDetalle", $ids) as $detalle) {
            $detalle["cantidad"] = (int) $detalle["cantidad"];
            $detalle["precioUnitario"] = redondear($detalle["precioUnitario"]);
            $detalle["subtotal"] = redondear($detalle["subtotal"]);
            if ($detalle["idPublicacion"] !== null) {
                $detalle["idPublicacion"] = (int) $detalle["idPublicacion"];
            }
            $detalles[(int) $detalle["idPedido"]][] = $detalle;
        }
        foreach (consultar("SELECT idPago, idPedido, metodo, monto, estado FROM pago WHERE idPedido IN (" . $lista . ")", $ids) as $pago) {
            $pago["monto"] = redondear($pago["monto"]);
            $pagos[(int) $pago["idPedido"]] = $pago;
        }
    }

    $residentes = residentesPorId($idsResidente);

    $resultado = [];
    foreach ($filas as $fila) {
        $fila["idPedido"] = (int) $fila["idPedido"];
        $fila["idComprador"] = (int) $fila["idComprador"];
        $fila["idVendedor"] = (int) $fila["idVendedor"];
        $fila["total"] = redondear($fila["total"]);
        $fila["detalles"] = $detalles[$fila["idPedido"]] ?? [];
        $fila["pago"] = $pagos[$fila["idPedido"]] ?? null;
        $fila["comprador"] = $residentes[$fila["idComprador"]] ?? null;
        $fila["vendedor"] = $residentes[$fila["idVendedor"]] ?? null;
        $resultado[] = $fila;
    }
    return $resultado;
}

// convierte el carrito en pedidos, uno por cada vendedor porque cada vecino
// entrega lo suyo, todo va en una transacción y cada publicación se bloquea
// con for update, así si dos vecinos compran lo último al mismo tiempo uno
// espera al otro y nadie compra stock que ya no existe
function registrarPedidos(string $metodoPago): array
{
    $residente = sesionActual();

    if ($residente === null) {
        return ["ok" => false, "mensaje" => "inicia sesión para registrar tu pedido", "codigos" => []];
    }
    if (!in_array($metodoPago, METODOS_DE_PAGO, true)) {
        return ["ok" => false, "mensaje" => "elige cómo vas a pagar, efectivo contra entrega, Yape o Plin", "codigos" => []];
    }
    if (obtenerCarrito() === []) {
        return ["ok" => false, "mensaje" => "tu carrito está vacío", "codigos" => []];
    }

    // las bloqueamos ordenadas por id para que dos compras a la vez no se
    // queden esperando una a la otra
    $carrito = $_SESSION["carrito"];
    ksort($carrito);

    $bd = conexion();
    $bd->beginTransaction();
    try {
        $grupos = [];
        foreach ($carrito as $idPublicacion => $cantidad) {
            $publicacion = consultarUna("SELECT idPublicacion, titulo, precio, stock, idResidente, estado FROM publicacion WHERE idPublicacion = ? FOR UPDATE", [(int) $idPublicacion]);
            if ($publicacion === null || $publicacion["estado"] !== "Activa") {
                $bd->rollBack();
                return ["ok" => false, "mensaje" => "un producto de tu carrito ya no está disponible, revisa tu carrito", "codigos" => []];
            }
            $publicacion["stock"] = (int) $publicacion["stock"];
            $idVendedor = (int) $publicacion["idResidente"];

            if ($idVendedor === $residente["idResidente"]) {
                $bd->rollBack();
                return ["ok" => false, "mensaje" => "esta publicación es tuya, no la puedes agregar a tu carrito", "codigos" => []];
            }
            // otro vecino pudo comprar mientras este armaba su carrito
            if ((int) $cantidad > $publicacion["stock"]) {
                $bd->rollBack();
                return ["ok" => false, "mensaje" => mensajeSinStock($publicacion), "codigos" => []];
            }

            $grupos[$idVendedor][] = [
                "publicacion" => $publicacion,
                "cantidad" => (int) $cantidad,
                "subtotal" => redondear($publicacion["precio"] * $cantidad)
            ];
        }

        $codigos = [];
        foreach ($grupos as $idVendedor => $lineas) {
            $total = 0.0;
            foreach ($lineas as $linea) {
                $total = redondear($total + $linea["subtotal"]);
            }

            // el código sale del id, que recién existe después del insert,
            // por eso entra con un código provisional al azar y luego se
            // cambia, al azar para que no choque con otra compra a la vez
            $provisional = "T" . bin2hex(random_bytes(4));
            ejecutar(
                "INSERT INTO pedido (codigo, fechaHora, idComprador, idVendedor, total, estado, motivoCancelacion) VALUES (?, NOW(), ?, ?, ?, 'Pendiente', '')",
                [$provisional, $residente["idResidente"], $idVendedor, $total]
            );
            $idPedido = (int) $bd->lastInsertId();
            $codigo = "KC-" . str_pad((string) $idPedido, 4, "0", STR_PAD_LEFT);
            ejecutar("UPDATE pedido SET codigo = ? WHERE idPedido = ?", [$codigo, $idPedido]);

            foreach ($lineas as $linea) {
                $publicacion = $linea["publicacion"];
                ejecutar(
                    "INSERT INTO detalle_pedido (idPedido, idPublicacion, titulo, cantidad, precioUnitario, subtotal) VALUES (?, ?, ?, ?, ?, ?)",
                    [$idPedido, $publicacion["idPublicacion"], $publicacion["titulo"], $linea["cantidad"], $publicacion["precio"], $linea["subtotal"]]
                );
                ejecutar("UPDATE publicacion SET stock = stock - ? WHERE idPublicacion = ?", [$linea["cantidad"], $publicacion["idPublicacion"]]);
            }

            ejecutar("INSERT INTO pago (idPedido, metodo, monto, estado) VALUES (?, ?, ?, 'Por pagar')", [$idPedido, $metodoPago, $total]);
            $codigos[] = $codigo;
        }

        $bd->commit();
    } catch (Throwable $error) {
        $bd->rollBack();
        throw $error;
    }

    vaciarCarrito();

    if (count($codigos) === 1) {
        return ["ok" => true, "mensaje" => "registramos tu pedido " . $codigos[0], "codigos" => $codigos];
    }
    return ["ok" => true, "mensaje" => "registramos tus " . count($codigos) . " pedidos, uno por cada vendedor", "codigos" => $codigos];
}

// las compras de un vecino, la más nueva arriba
function pedidosDelComprador(int $idResidente): array
{
    return completarPedidos(consultar("SELECT * FROM pedido WHERE idComprador = ? ORDER BY fechaHora DESC, idPedido DESC", [$idResidente]));
}

// las ventas de un vecino, la más nueva arriba
function pedidosDelVendedor(int $idResidente): array
{
    return completarPedidos(consultar("SELECT * FROM pedido WHERE idVendedor = ? ORDER BY fechaHora DESC, idPedido DESC", [$idResidente]));
}

// todos los pedidos del condominio, para la administración
function listarTodosLosPedidos(): array
{
    if (!esAdmin(sesionActual())) {
        return [];
    }
    return completarPedidos(consultar("SELECT * FROM pedido ORDER BY fechaHora DESC, idPedido DESC"));
}

// a qué estados puede pasar un pedido desde el estado en que está, el
// panel la usa para ofrecer solo esas opciones
function estadosSiguientes(string $estado): array
{
    return TRANSICIONES[$estado] ?? [];
}

// cambia el estado de un pedido, solo lo puede hacer el vecino que lo
// vende y solo hacia un estado permitido, si se cancela hay que decir el
// motivo y el stock vuelve a las publicaciones, va en transacción para que
// el pedido, el pago y el stock cambien juntos o no cambie nada
function cambiarEstadoPedido(int $idPedido, string $nuevoEstado, string $motivo = ""): array
{
    $residente = sesionActual();
    $motivo = trim($motivo);

    if ($residente === null) {
        return ["ok" => false, "mensaje" => "inicia sesión para cambiar el estado del pedido"];
    }
    if ($nuevoEstado === "Cancelado" && ($motivo === "" || mb_strlen($motivo) > 200)) {
        return ["ok" => false, "mensaje" => "cuéntale al comprador por qué cancelas el pedido"];
    }

    $bd = conexion();
    $bd->beginTransaction();
    try {
        $pedido = consultarUna("SELECT idPedido, codigo, idVendedor, estado FROM pedido WHERE idPedido = ? FOR UPDATE", [$idPedido]);

        if ($pedido === null) {
            $bd->rollBack();
            return ["ok" => false, "mensaje" => "no encontramos ese pedido"];
        }
        if ((int) $pedido["idVendedor"] !== $residente["idResidente"]) {
            $bd->rollBack();
            return ["ok" => false, "mensaje" => "solo el vecino que vende puede cambiar el estado del pedido"];
        }
        if (!in_array($nuevoEstado, estadosSiguientes($pedido["estado"]), true)) {
            $bd->rollBack();
            return ["ok" => false, "mensaje" => "un pedido " . mb_strtolower($pedido["estado"]) . " no puede pasar a " . mb_strtolower($nuevoEstado)];
        }

        if ($nuevoEstado === "Cancelado") {
            ejecutar("UPDATE pedido SET estado = 'Cancelado', motivoCancelacion = ? WHERE idPedido = ?", [$motivo, $idPedido]);
            ejecutar("UPDATE pago SET estado = 'Anulado' WHERE idPedido = ?", [$idPedido]);

            // devolvemos a cada publicación las unidades que se habían
            // apartado, si alguna ya se borró su detalle quedó sin id
            $detalles = consultar("SELECT idPublicacion, cantidad FROM detalle_pedido WHERE idPedido = ? AND idPublicacion IS NOT NULL ORDER BY idPublicacion", [$idPedido]);
            foreach ($detalles as $detalle) {
                consultarUna("SELECT idPublicacion FROM publicacion WHERE idPublicacion = ? FOR UPDATE", [$detalle["idPublicacion"]]);
                ejecutar("UPDATE publicacion SET stock = stock + ? WHERE idPublicacion = ?", [$detalle["cantidad"], $detalle["idPublicacion"]]);
            }
        } else {
            ejecutar("UPDATE pedido SET estado = ? WHERE idPedido = ?", [$nuevoEstado, $idPedido]);
        }

        // cuando el vendedor entrega también recibe el pago, kercado solo
        // lo deja anotado
        if ($nuevoEstado === "Entregado") {
            ejecutar("UPDATE pago SET estado = 'Pagado' WHERE idPedido = ?", [$idPedido]);
        }

        $bd->commit();
    } catch (Throwable $error) {
        $bd->rollBack();
        throw $error;
    }

    return ["ok" => true, "mensaje" => "el pedido " . $pedido["codigo"] . " pasó a " . mb_strtolower($nuevoEstado)];
}
