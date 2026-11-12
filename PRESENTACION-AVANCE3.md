# Presentación del Avance 3: guion de la exposición

Guion para armar el PPT y ensayar. Duración objetivo: **11 minutos** de
exposición, más las preguntas del docente. Cada diapositiva dice qué va,
quién la expone y qué criterio de la rúbrica cubre.

> Los fragmentos de `app/almacen.php` (sección 4) siguen el contrato de
> `BASE-AVANCE3.md`. Antes de pegarlos en el PPT, copiarlos del archivo final
> para que coincidan línea por línea con lo que el profesor pueda abrir.

---

## 1. Diapositivas (14)

### D1. Portada (Piero, 20 s)
- **Kercado**: el mercado de tu condominio
- Avance 3: PHP, MySQL y sesiones
- Taller de Programación Web, UTP. Docente: José Antonio Espinal Teves
- Piero, Edgar, Francys, Luis
- **Imagen:** logo `assets/img/kercado.png` sobre fondo verde, captura del inicio difuminada a la derecha
- **Criterio:** presentación general

### D2. El problema y los objetivos (Edgar, 45 s)
- Vecinos venden comida, postres y abarrotes por WhatsApp: mensajes perdidos, sin stock, sin historial
- Piloto: condominio Las Palmas 357, Chorrillos
- Objetivo: un marketplace hiperlocal donde **cada residente compra y vende con una sola cuenta**
- Kercado registra oferta, pedido y método acordado (efectivo, Yape, Plin): **no cobra ni entrega**
- Objetivo del Avance 3: pasar de `localStorage` a un servidor real con PHP + MySQL
- **Imagen:** ícono de chat de WhatsApp desordenado frente a la tarjeta de un producto de Kercado
- **Criterio:** descripción del problema y objetivos

### D3. Evolución por avances (Edgar, 30 s)
- Avance 1: 5 páginas HTML5 + CSS3 + validaciones JS
- Avance 2: catálogo con filtros, carrito, panel con pestañas, datos en `localStorage`
- Avance 3: PHP 8 + MySQL (PDO) + sesiones, vista de administración, chat de ayuda, hosting
- **Imagen:** línea de tiempo horizontal con tres hitos y una captura chica por avance
- **Criterio:** presentación general, análisis y diseño

### D4. Del diagrama de clases al modelo relacional (Piero, 60 s)
- Clases del Avance 1: Residente, Categoria, Publicacion, Pedido, DetallePedido, Pago
- 7 tablas InnoDB `utf8mb4`: `categoria`, `residente`, `publicacion`, `imagen_publicacion`, `pedido`, `detalle_pedido`, `pago`
- 1FN: las imágenes (antes un arreglo en JS) salen a `imagen_publicacion`
- Pago es otra entidad, tabla propia 1 a 1 con `pedido` (`idPedido UNIQUE`)
- `detalle_pedido` copia `titulo` y `precioUnitario` a propósito: el pedido conserva el precio pactado
- Claves foráneas con `ON DELETE CASCADE / SET NULL / RESTRICT` según el caso
- **Imagen:** a la izquierda el diagrama de clases del Avance 1, a la derecha el diagrama ER (exportado del diseñador de phpMyAdmin)
- **Criterio:** análisis y diseño, MySQL (estructura normalizada)

### D5. Arquitectura de tres capas (Piero, 50 s)
- Presentación: `index.php`, `catalogo.php`... + `css/estilo.css` + `js/*.js`
- Negocio: `app/funciones.php` (sesión, `e()`, CSRF, avisos) y la lógica arriba de cada página
- Persistencia: `app/almacen.php`, **la única que escribe SQL**
- La promesa del Avance 2 se cumplió: `almacen.js` pasó a `almacen.php` **con los mismos nombres** (`listarPublicaciones`, `agregarAlCarrito`, `registrarPedidos`...)
- `app/` y `sql/` bloqueados con `.htaccess` (`Require all denied`)
- **Imagen:** diagrama de tres cajas apiladas, con la flecha navegador → página .php → almacen.php → MySQL; al lado, tabla de dos columnas `almacen.js` | `almacen.php` con 4 funciones iguales
- **Criterio:** análisis y diseño, conexión con PHP (modular)

### D6. Tecnologías (Luis, 30 s)
- HTML5, CSS3 (grid, flexbox, transiciones), JavaScript nativo
- PHP 8 procedural, sin frameworks ni Composer
- MySQL / MariaDB con PDO
- XAMPP en local, InfinityFree en el hosting; solo cambia `app/config.php`
- Git y GitHub, trabajo en `main`
- **Imagen:** fila de logos (HTML5, CSS3, JS, PHP, MySQL, XAMPP, GitHub)
- **Criterio:** presentación general

### D7. Demo en vivo (los cuatro, 4 min)
- Diapositiva con solo el título "Demo en vivo", la URL del hosting y un QR
- El guion está en la sección 3 de este archivo
- **Criterio:** presentación general, formularios, JS, sesiones, MySQL

### D8. PHP modular (Francys, 50 s)
- Cada página: procesa el POST arriba, consulta `almacen.php`, luego pinta
- `abrirPagina()` / `cerrarPagina()` en `app/plantilla.php`: header y footer en **un solo archivo**
- Patrón PRG: `avisar()` + `redirigir()`, recargar no repite el pedido
- Filtros del catálogo por GET: `catalogo.php?q=torta&categoria=postres&orden=precio-asc`, se comparten por URL y funcionan sin JS
- **Imagen:** código de la forma de una página (fragmento 4.7) y captura del catálogo filtrado con la URL visible
- **Criterio:** conexión con PHP, formularios

### D9. MySQL seguro (Piero, 50 s)
- PDO con `ERRMODE_EXCEPTION` y `EMULATE_PREPARES = false`
- **Toda** consulta con datos del usuario es sentencia preparada
- `registrarPedidos()` en una **transacción** con `SELECT ... FOR UPDATE`: dos vecinos no compran la última torta a la vez
- Si la base no responde: 503 con mensaje entendible
- **Imagen:** fragmentos 4.1 y 4.2
- **Criterio:** MySQL (conexión, consultas seguras)

### D10. Sesiones: inicio, mantenimiento y cierre (Luis, 60 s)
- Inicio: `password_verify` + `session_regenerate_id(true)` + `$_SESSION["idResidente"]`
- Mantenimiento: `exigirSesion()` en panel, publicar y carrito; `sesionActual()` revisa en la base que la cuenta siga **Activa**
- Carrito en `$_SESSION["carrito"]`, los precios siempre se leen de la base
- Cierre: `salir.php` solo por POST con CSRF, `cerrarSesion()` borra datos, cookie y sesión
- Cookie "recordar mi correo" (30 días, httponly); la clave nunca va en una cookie
- **Imagen:** diagrama de ciclo (Ingresar → navegar → Salir) y fragmento 4.3
- **Criterio:** configuración de sesiones

### D11. Vista residente vs administración (Piero, 45 s)
- Mismo residente compra y vende: `panel.php` con pestañas Mis compras, Mis ventas, Mis publicaciones
- El vendedor avanza el pedido: Pendiente → Aceptado → En preparación → Entregado (o Cancelado con motivo, devuelve stock)
- `admin.php`: validar residentes pendientes, observar publicaciones, ver todos los pedidos, gestionar categorías
- Un residente que abre `admin.php` recibe **403** con una página explicada
- **Imagen:** dos capturas lado a lado, panel de Carmen y admin con Sofía pendiente
- **Criterio:** vistas de usuario y administrador, sesiones

### D12. Seguridad (Francys, 45 s)
- Inyección SQL: sentencias preparadas
- XSS: todo lo impreso pasa por `e()`, en JS `textContent`
- CSRF: `campoCsrf()` en cada formulario POST, `hash_equals` al comprobar
- Claves con `password_hash` (bcrypt), nunca en texto plano
- Fotos validadas por contenido (`getimagesize`, máx. 2 MB, nombre aleatorio); `uploads/` no ejecuta PHP
- Redirecciones solo a páginas nuestras (`paginaSegura()`)
- **Imagen:** tabla de 3 columnas: ataque | cómo lo evitamos | función
- **Criterio:** MySQL (consultas seguras), PHP (manejo correcto de datos)

### D13. Formularios, interactividad, responsive y accesibilidad (Edgar, 60 s)
- Validación en los dos lados: JS (`marcarError`, `mostrarResumen`) y PHP vuelve a validar
- Publicar con foto (`multipart/form-data`), vista previa antes de enviar
- `<dialog>` de confirmación con `data-confirmar`, avisos con `aria-live`, chat de ayuda por palabras clave
- Grid y flexbox, probado en 1366, 768 y 375 px sin scroll horizontal
- Saltar al contenido, `aria-current`, foco visible, todo con teclado, `prefers-reduced-motion`
- Redes sociales en el footer (SVG con `aria-label`)
- **Imagen:** misma página en laptop, tablet y celular (mockup triple) y captura del error de un campo
- **Criterio:** CSS responsive, JS, formularios, HTML accesibilidad, HTML estructura (validación W3C sin errores)

### D14. Conclusiones (Luis, 40 s)
- Cumplimos lo prometido: las páginas no cambiaron de idea, cambió la capa de datos
- Aprendimos: sesiones seguras, transacciones, normalización, defensa en dos lados
- Siguiente paso: notificaciones al vendedor y reseñas entre vecinos
- Gracias, preguntas
- **Imagen:** logo y QR al sitio publicado
- **Criterio:** presentación general, visualización del código (mencionar comentarios y `GUIA-DE-COMENTARIOS.md`)

---

## 2. Reparto y tiempos

| Integrante | Diapositivas | En la demo | Tiempo |
|---|---|---|---|
| Piero | D1, D4, D5, D9, D11 | phpMyAdmin, panel de María, admin, 403 | 2 min 45 s + 1 min demo = **3:45** |
| Edgar | D2, D3, D13 | inicio y publicar un producto | 2 min 15 s + 50 s demo = **3:05** |
| Francys | D8, D12 | catálogo con filtros y ficha | 1 min 35 s + 1 min demo = **2:35** |
| Luis | D6, D10, D14 | registro, ingreso, carrito, confirmar, salir | 2 min 10 s + 1 min 10 s demo = **3:20** |

Total: **unos 12 minutos**. Si el tiempo aprieta, D3 y D6 se dicen en 15 s cada una.
Quien maneja el teclado en la demo es quien habla; Piero deja abierta la
pestaña de phpMyAdmin.

---

## 3. Guion de la demo en vivo (4 min)

**Antes de empezar (5 min antes de clase):** reimportar `sql/kercado.sql`,
abrir tres pestañas: el sitio, phpMyAdmin en la tabla `publicacion` y
`pedido`, y una ventana de incógnito. Zoom del navegador al 125 %.

1. **Piero, phpMyAdmin "antes":** mostrar `publicacion` filtrada por la torta de chocolate de María, anotar el `stock` (ej. 5). Mostrar el último `codigo` de `pedido`.
2. **Edgar, inicio:** destacados y categorías salen de la base. Pasar el menú con Tab para lucir el foco y "Saltar al contenido".
3. **Francys, catálogo:** buscar "torta", filtrar Postres y precio máximo, ordenar. Señalar que la URL cambia (`?q=torta&categoria=postres`). Abrir la ficha.
4. **Luis, agregar sin sesión:** pulsar "Agregar": manda a `registro.php?volver=...` con el aviso "primero ingresa con tu cuenta".
5. **Luis, validación:** enviar el ingreso vacío para mostrar los errores en cada campo (JS). Probar con clave mala: mensaje del servidor.
6. **Luis, cuenta pendiente:** `sofia.mendoza@kercado.pe` / `Kercado2026`: "tu cuenta está pendiente de validación".
7. **Luis, ingresar:** `carmen.rojas@kercado.pe` / `Kercado2026`, marcar "recordar mi correo". Vuelve a la ficha sola. Agregar 2 tortas, ir al carrito, cambiar cantidad, elegir Yape, confirmar (diálogo). Aviso con el código `KC-0xxx`.
8. **Piero, phpMyAdmin "después":** recargar: el `stock` bajó en 2, hay un `pedido` nuevo con su `detalle_pedido` y su `pago` en "Por pagar".
9. **Edgar, publicar:** con Carmen, publicar un producto con foto. Mostrar un error (precio negativo) y luego el éxito. Aparece en el catálogo.
10. **Luis, salir:** botón "Salir". Intentar entrar a `panel.php` escribiendo la URL: vuelve a registro. El correo ya aparece escrito (cookie).
11. **Piero, vendedor:** ingresar como `maria.torres@kercado.pe`, Mis ventas: el pedido de Carmen está Pendiente, pasarlo a Aceptado y luego a En preparación.
12. **Piero, 403:** con María, escribir `admin.php` en la barra: página "Esta parte es solo para la administración" (F12 > Red muestra 403).
13. **Piero, admin:** salir, ingresar como `administracion@kercado.pe`, pestaña Residentes, validar a Sofía. Mostrar el menú con "Administración".
14. **Cierre:** abrir el chat de ayuda y preguntar "cómo pago". Achicar la ventana a 375 px para mostrar el menú hamburguesa.

### Plan B
- **Sin internet o el hosting caído:** la demo corre igual en XAMPP de la laptop de Piero (`http://localhost/kercado/`), con la base ya importada. Probarla la noche anterior.
- **Sin XAMPP:** segunda laptop (Luis) con la misma copia y la base importada.
- **Todo falla:** video de la demo de 3 min grabado el día anterior (OBS) y las capturas de la sección 6 en diapositivas ocultas al final del PPT.
- **Pedido ya confirmado por error o datos sucios:** reimportar `sql/kercado.sql` (30 s).

---

## 4. Fragmentos de código para las diapositivas

Cortos, con fuente monoespaciada de 16 pt mínimo y el nombre del archivo
arriba.

### 4.1 Sentencia preparada (`app/almacen.php`, `buscarPorCorreo`)
```php
$sentencia = conexion()->prepare("SELECT * FROM residente WHERE correo = ?");
$sentencia->execute([$correo]);
$fila = $sentencia->fetch();
```

### 4.2 Transacción de `registrarPedidos()` (`app/almacen.php`)
```php
$bd = conexion();
$bd->beginTransaction();
try {
    $consulta = $bd->prepare("SELECT stock FROM publicacion
                              WHERE idPublicacion = ? FOR UPDATE");
    // ... comprueba stock, inserta pedido, detalle_pedido y pago,
    // y descuenta el stock de cada publicación
    $bd->commit();
} catch (Exception $error) {
    $bd->rollBack();
    return ["ok" => false, "mensaje" => "no pudimos registrar tu pedido"];
}
```

### 4.3 `exigirSesion()` y `exigirAdmin()` (`app/funciones.php`)
```php
function exigirSesion(): array
{
    $residente = sesionActual();
    if ($residente === null) {
        avisar("primero ingresa con tu cuenta", "error");
        redirigir("registro.php?volver=" . urlencode(paginaActual()));
    }
    return $residente;
}

function exigirAdmin(): array
{
    $residente = exigirSesion();
    if (!esAdmin($residente)) {
        http_response_code(403);
        // ... página "esta parte es solo para la administración"
        exit;
    }
    return $residente;
}
```

### 4.4 `password_hash` y `password_verify` (`app/almacen.php`)
```php
// registrarSolicitud()
$claveHash = password_hash($datos["clave"], PASSWORD_DEFAULT);

// iniciarSesion()
if ($fila === null || !password_verify($clave, $fila["claveHash"])) {
    return ["ok" => false, "mensaje" => "el correo o la clave no coinciden"];
}
session_regenerate_id(true);
$_SESSION["idResidente"] = $fila["idResidente"];
```

### 4.5 `e()` (`app/funciones.php`)
```php
function e($texto): string
{
    return htmlspecialchars((string) $texto, ENT_QUOTES, "UTF-8");
}
```
Uso: `<h1><?= e($publicacion["titulo"]) ?></h1>`

### 4.6 `campoCsrf()` y `comprobarCsrf()` (`app/funciones.php`)
```php
function campoCsrf(): string
{
    if (empty($_SESSION["csrf"])) {
        $_SESSION["csrf"] = bin2hex(random_bytes(32));
    }
    return '<input type="hidden" name="csrf" value="' . e($_SESSION["csrf"]) . '">';
}
// comprobarCsrf(): si !hash_equals($_SESSION["csrf"], $enviado) responde 400
```

### 4.7 Forma de una página (`catalogo.php`)
```php
require_once __DIR__ . "/app/plantilla.php";
$publicaciones = listarPublicaciones($filtro);
abrirPagina("Catálogo", "...", "catalogo");
// ... el <main> con las tarjetas
cerrarPagina("js/catalogo.js");
```

### 4.8 Conexión PDO (`app/conexion.php`)
```php
$opciones = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];
$pdo = new PDO($dsn, BD_USUARIO, BD_CLAVE, $opciones);
```

---

## 5. Preguntas probables del profesor

| # | Pregunta | Respuesta corta | Quién | Sesión |
|---|---|---|---|---|
| 1 | ¿Por qué PDO y no mysqli? | Sirve para varios motores, sentencias preparadas con `?` simples y excepciones. Con mysqli también se puede, elegimos uno y lo usamos en todo. | Piero | S13 |
| 2 | ¿Qué es la inyección SQL? | Meter SQL en un campo (`' OR 1=1 --`) para cambiar la consulta. Con sentencias preparadas el dato viaja aparte del SQL y nunca se ejecuta como código. | Piero | S13 |
| 3 | ¿Para qué `EMULATE_PREPARES = false`? | Para que MySQL prepare de verdad la consulta y no PHP pegando textos. | Piero | S13 |
| 4 | ¿Diferencia entre sesión y cookie? | La cookie vive en el navegador y el usuario la puede ver o cambiar; la sesión vive en el servidor y el navegador solo guarda su id. Por eso el carrito y el usuario van en sesión y solo el correo recordado en cookie. | Luis | S14 |
| 5 | ¿Por qué regeneran el id de sesión al ingresar? | Para evitar la fijación de sesión: si alguien conocía el id anterior, deja de servir. | Luis | S14 |
| 6 | ¿Por qué el carrito va en sesión y no en la base? | Es temporal y de una sola visita; se vuelve pedido (base) al confirmar. Los precios igual se leen de la base, nunca del formulario. | Luis | S14 |
| 7 | ¿Cómo cierran la sesión? | `salir.php` por POST con CSRF: vacía `$_SESSION`, borra la cookie y `session_destroy()`. | Luis | S14 |
| 8 | ¿Está normalizada la base? | Sí, 3FN: imágenes y pago en tablas propias, sin datos repetidos. El detalle copia precio y título a propósito, porque es un dato histórico. | Piero | S13 |
| 9 | ¿Por qué una transacción en el pedido? | Pedido, detalle, pago y stock se guardan todos o ninguno; `FOR UPDATE` evita vender más de lo que hay si dos compran a la vez. | Piero | S15 |
| 10 | ¿`include` o `require`? | `require` detiene la página si falta el archivo; `include` solo avisa. Usamos `require_once` porque sin `app/` la página no puede funcionar, y `_once` evita cargarlo dos veces. | Francys | S11 |
| 11 | ¿GET o POST? | GET para leer y compartir (filtros del catálogo, id del producto); POST para todo lo que cambia datos (carrito, pedido, salir). | Francys | S11–S12 |
| 12 | ¿Qué es el patrón PRG? | Post, Redirect, Get: tras procesar redirigimos, así F5 no repite el pedido. | Francys | S12 |
| 13 | ¿Para qué validan en PHP si ya validan en JS? | El JS se puede desactivar o saltar con F12; el servidor es el que manda. JS da respuesta rápida, PHP da seguridad. | Edgar | S12 |
| 14 | ¿Cómo guardan las claves? | `password_hash` (bcrypt con sal), se comprueba con `password_verify`; ni nosotros podemos leerlas. | Luis | S14 |
| 15 | ¿Qué es XSS y cómo lo evitan? | Inyectar `<script>` en un dato que luego se muestra. Todo pasa por `e()` (`htmlspecialchars`) y en JS por `textContent`. | Francys | S12 |
| 16 | ¿Qué es el token CSRF? | Un secreto por sesión escondido en cada formulario; otro sitio no lo conoce, así no puede enviar formularios a nombre del vecino. | Francys | S14 |
| 17 | ¿Cómo validan la foto subida? | Por contenido con `getimagesize`, solo JPG/PNG/WEBP hasta 2 MB, nombre aleatorio; `uploads/` no ejecuta PHP. | Edgar | S12 |
| 18 | ¿Qué cambia entre XAMPP y el hosting? | Solo `app/config.php` (servidor, base, usuario, clave y `MODO_DESARROLLO`). Enlaces relativos para que funcione en cualquier carpeta. | Piero | S15 |

(Hay 18 para tener margen; las 15 primeras son las más probables.)

---

## 6. Capturas y diagramas a preparar

1. Diagrama de clases del Avance 1 (ya existe en el documento).
2. Diagrama ER de las 7 tablas (phpMyAdmin > base `kercado` > Diseñador, exportar PNG).
3. Diagrama de tres capas con la tabla `almacen.js` → `almacen.php`.
4. Línea de tiempo de los tres avances.
5. Inicio (`index.php`) a 1366 px.
6. Catálogo filtrado con la URL visible.
7. Ficha de producto.
8. Registro con errores de validación en los campos.
9. Mensaje de cuenta pendiente (Sofía).
10. Carrito agrupado por vendedor y el `<dialog>` de confirmación.
11. Aviso con el código del pedido.
12. phpMyAdmin: `publicacion` antes y después (stock) y `pedido` con la fila nueva.
13. Panel de María, pestaña Mis ventas con el selector de estado.
14. `admin.php` con Sofía pendiente.
15. Página 403 al entrar como residente (con F12 > Red visible).
16. Publicar con vista previa de la foto.
17. Chat de ayuda abierto y footer con redes sociales.
18. Mockup triple: 1366, 768 y 375 px.
19. Validador W3C sin errores y Lighthouse de accesibilidad.
20. Ciclo de la sesión (diagrama: ingresar, navegar, salir).
21. Video de respaldo de la demo (plan B).

---

## 7. Diseño visual del PPT

- **Colores** (de `:root` en `css/estilo.css`):
  - fondo de diapositivas: crema `#F5EFE0`
  - títulos, barra superior y portada: verde `#14603C`; verde oscuro `#0C3F27` para la portada y el cierre
  - acentos, números grandes y botones: naranja `#B8460F`; sobre fondo verde usar naranja claro `#FFA36E`
  - fondos de tablas y cajas de código: verde claro `#E4EFE7` y blanco cálido `#FFFDF8`
  - texto: `#1E2A24`, texto de apoyo `#5C6A63`, bordes arena `#B7A29C`
  - los estados del pedido con sus colores del sitio (pendiente `#8A6508`, aceptado `#1F5F8B`, en preparación `#6B4A9B`, entregado `#14603C`, cancelado `#A63A2A`) en la diapositiva del panel
- **Tipografía:** títulos en Trebuchet MS (la del sitio), texto en Segoe UI; código en Consolas 16 pt sobre fondo verde claro.
- **Logo:** `assets/img/kercado.png` en la portada grande y chico en la esquina inferior derecha del resto.
- **Plantilla:** barra verde arriba con el título en crema, contenido sobre crema, máximo 6 viñetas, una imagen por diapositiva.
- Las capturas con borde arena de 1 px y esquinas redondeadas, como las tarjetas del sitio.
- Contraste: nada de naranja claro sobre crema (no se lee); el texto blanco solo sobre verde o naranja oscuro.
- Animaciones mínimas (aparecer), igual que el sitio respeta `prefers-reduced-motion`.
