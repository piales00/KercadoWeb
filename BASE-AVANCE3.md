# Base del Avance 3: el contrato con PHP y MySQL

En el Avance 2 dijimos que las páginas no sabían dónde se guardaban los datos,
que se los pedían a `almacen.js`, y que en el Avance 3 solo iba a cambiar esa
capa. Este avance cumple esa promesa: `almacen.js` pasa a ser
**`app/almacen.php`**, con **las mismas funciones y los mismos nombres**, pero
leyendo y escribiendo en MySQL. Las páginas `.html` pasan a `.php`, el header y
el footer salen de un solo archivo con `include`, y la sesión vive en el
servidor con `$_SESSION`.

Este archivo es el contrato. Los nombres de tablas, columnas, funciones,
archivos y campos de formulario que aparecen aquí se usan tal cual. Si algo
tiene que cambiar, se cambia aquí primero.

---

## 1. Restricciones que no se negocian

1. **HTML5, CSS3, JavaScript nativo y PHP 8 sin frameworks.** Nada de
   Composer, Laravel, Bootstrap, jQuery ni CDN. MySQL/MariaDB con **PDO**.
2. **Funciona igual en XAMPP y en InfinityFree.** Por eso:
   - todos los `.php` públicos están **en la raíz** y los enlaces son
     relativos (`catalogo.php`, nunca `/catalogo.php`), así el sitio funciona
     en `localhost/kercado/` y en la raíz del hosting sin tocar nada;
   - el único archivo que cambia entre los dos es `app/config.php`;
   - el `.sql` **no** lleva `CREATE DATABASE` ni `USE` (en InfinityFree la
     base se crea desde el panel).
3. **Solo `app/almacen.php` habla con la base de datos.** Ninguna página
   escribe SQL. Si una página necesita un dato que no existe, se agrega una
   función a `almacen.php`.
4. **Toda consulta con parámetros usa sentencias preparadas** (`prepare` +
   `execute`). Nunca se concatena `$_GET`, `$_POST` ni nada que venga del
   usuario dentro de un SQL.
5. **Todo dato que se imprime en el HTML pasa por `e()`** (que es
   `htmlspecialchars`). En JavaScript sigue la regla de `textContent`.
6. **Todo formulario `POST` lleva `<?= campoCsrf() ?>`** y la página llama a
   `comprobarCsrf()` antes de procesarlo.
7. **Patrón PRG** en todo `POST`: se procesa arriba de la página, se deja un
   aviso con `avisar()` y se termina con `redirigir()`. Así recargar la página
   no repite la acción. La excepción son los formularios con errores de
   validación, que se vuelven a pintar con los errores debajo de cada campo y
   lo que el vecino ya había escrito.
8. Un solo `css/estilo.css`. Cero `style=""`, cero `<style>`, cero colores en
   hexadecimal fuera de `:root`. Solo Piero (el agente del núcleo) lo edita.
9. Nada de `alert()`, `confirm()` ni `prompt()`, ni en JS ni en `onsubmit`.
   Las acciones destructivas usan el `<dialog>` de confirmación (sección 8).
10. **Validación en los dos lados.** El JS de cada página valida antes de
    enviar (mismo estilo del Avance 2: `marcarError`, `limpiarCampo`,
    `mostrarResumen`) y el PHP vuelve a validar todo, porque el JS se puede
    saltar.
11. Ningún botón que no haga nada. Kercado **no cobra ni hace entregas**:
    nunca "pagar ahora", "seguimiento del envío" ni nada parecido.
12. Comentarios según `GUIA-DE-COMENTARIOS.md`, también en PHP y SQL. Cada
    archivo empieza con un comentario que dice quién lo hizo y qué hace.
    En PHP se usan `//` y `/* */`, en minúscula, sin carteles.

---

## 2. Mapa de archivos

```
KercadoWeb/
├── index.php          Edgar     inicio
├── catalogo.php       Francys   catálogo con filtros por GET
├── producto.php       Francys   ficha, agrega al carrito por POST
├── registro.php       Luis      ingresar y registrarse (dos formularios)
├── salir.php          Piero     cierra la sesión (solo POST)
├── carrito.php        Luis      carrito en $_SESSION y confirmar pedido
├── publicar.php       Edgar     publicar producto con foto (multipart)
├── panel.php          Piero     mis compras, mis ventas, mis publicaciones
├── admin.php          Piero     vista de administración del condominio
│
├── app/               Piero     nada de aquí se abre desde el navegador
│   ├── .htaccess                Require all denied
│   ├── config.php               datos de conexión (XAMPP por defecto)
│   ├── conexion.php             conexion(): PDO
│   ├── funciones.php            sesión, e(), csrf, avisos, formatos, seguridad
│   ├── almacen.php              capa de datos, única que hace SQL
│   └── plantilla.php            abrirPagina() y cerrarPagina()
│
├── sql/
│   ├── .htaccess                Require all denied
│   └── kercado.sql              tablas + datos de ejemplo
│
├── uploads/                     fotos que suben los vecinos
│   ├── .htaccess                no deja ejecutar php aquí dentro
│   └── .gitkeep
│
├── css/estilo.css     Piero
├── js/base.js         Piero     solo interfaz: avisos, diálogo, menú, chat, errores
├── js/inicio.js       Edgar
├── js/publicar.js     Edgar
├── js/catalogo.js     Francys
├── js/producto.js     Francys
├── js/registro.js     Luis
├── js/carrito.js      Luis
├── js/panel.js        Piero
├── js/admin.js        Piero
└── assets/                      imágenes del sitio y de los datos de ejemplo
```

Desaparecen `js/datos.js`, `js/almacen.js` y las páginas `.html` (cada
`X.html` se reemplaza por su `X.php`, que parte de su `<main>` actual).
`plantilla.html` pasa a `app/plantilla.php`. `componentes.html` se queda como
guía visual interna. La versión del Avance 2 sigue intacta en la rama
`entrega`.

### Forma de cada página

```php
<?php
/*
  hecho por francys. ...qué muestra esta página y por qué...
*/
require_once __DIR__ . "/app/plantilla.php";

// si llegó un formulario lo procesamos antes de pintar nada, porque
// redirigir() solo funciona si todavía no salió html
if (seEnvioFormulario()) {
    comprobarCsrf();
    // ... validar, llamar a almacen.php, avisar() y redirigir()
}

$publicaciones = listarPublicaciones($filtro);

abrirPagina("Catálogo", "descripción para buscadores", "catalogo");
?>
  <section class="seccion"> ... </section>
<?php
cerrarPagina("js/catalogo.js");
```

`abrirPagina()` imprime desde el `<!DOCTYPE>` hasta `<main id="contenido">`
inclusive, y `cerrarPagina()` desde `</main>` hasta `</html>`, con el footer,
el diálogo, los avisos, el chat y los scripts. **Nadie escribe header ni
footer en su página.**

---

## 3. Base de datos

Los nombres siguen el diagrama de clases del Avance 1, igual que en el Avance
2: tablas en minúscula y singular, columnas en camelCase como los campos que
ya usábamos en JS. Motor InnoDB, `utf8mb4`.

```sql
categoria (
  idCategoria  VARCHAR(30)  PK            -- 'postres', viaja en la URL
  nombre       VARCHAR(60)  NOT NULL
  descripcion  VARCHAR(200) NOT NULL DEFAULT ''
)

residente (
  idResidente        INT AUTO_INCREMENT PK
  nombres            VARCHAR(60)  NOT NULL
  apellidos          VARCHAR(60)  NOT NULL
  correo             VARCHAR(120) NOT NULL UNIQUE
  claveHash          VARCHAR(255) NOT NULL         -- password_hash()
  telefono           VARCHAR(9)   NOT NULL
  torre              CHAR(1)      NOT NULL         -- 'A' a 'D'
  numeroDepartamento VARCHAR(4)   NOT NULL
  rol                ENUM('residente','admin') NOT NULL DEFAULT 'residente'
  estado             ENUM('Activo','Pendiente','Inactivo') NOT NULL DEFAULT 'Pendiente'
  fechaRegistro      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
)

publicacion (
  idPublicacion    INT AUTO_INCREMENT PK
  titulo           VARCHAR(80)  NOT NULL
  descripcion      VARCHAR(500) NOT NULL
  precio           DECIMAL(8,2) NOT NULL
  stock            INT NOT NULL
  horario          VARCHAR(40)  NOT NULL DEFAULT ''
  idCategoria      VARCHAR(30)  NULL  FK categoria  ON DELETE SET NULL ON UPDATE CASCADE
  idResidente      INT NOT NULL      FK residente  ON DELETE CASCADE
  estado           ENUM('Activa','Baja','Observada') NOT NULL DEFAULT 'Activa'
  fechaPublicacion DATE NOT NULL
)

imagen_publicacion (                     -- 1 publicación, N imágenes
  idImagen      INT AUTO_INCREMENT PK
  idPublicacion INT NOT NULL FK publicacion ON DELETE CASCADE
  ruta          VARCHAR(255) NOT NULL    -- 'assets/img/catalogos/x.jpg' o 'uploads/x.jpg'
  orden         TINYINT NOT NULL DEFAULT 0   -- 0 es la principal
)

pedido (
  idPedido          INT AUTO_INCREMENT PK
  codigo            VARCHAR(10) NOT NULL UNIQUE   -- 'KC-0135'
  fechaHora         DATETIME NOT NULL
  idComprador       INT NOT NULL FK residente ON DELETE RESTRICT
  idVendedor        INT NOT NULL FK residente ON DELETE RESTRICT
  total             DECIMAL(10,2) NOT NULL
  estado            ENUM('Pendiente','Aceptado','En preparación','Entregado','Cancelado') NOT NULL DEFAULT 'Pendiente'
  motivoCancelacion VARCHAR(200) NOT NULL DEFAULT ''
)

detalle_pedido (
  idDetalle      INT AUTO_INCREMENT PK
  idPedido       INT NOT NULL FK pedido ON DELETE CASCADE
  idPublicacion  INT NULL     FK publicacion ON DELETE SET NULL
  titulo         VARCHAR(80)  NOT NULL      -- copiado al comprar
  cantidad       INT NOT NULL
  precioUnitario DECIMAL(8,2) NOT NULL      -- copiado al comprar
  subtotal       DECIMAL(10,2) NOT NULL
)

pago (                                   -- 1 pedido, 1 pago
  idPago   INT AUTO_INCREMENT PK
  idPedido INT NOT NULL UNIQUE FK pedido ON DELETE CASCADE
  metodo   ENUM('Efectivo contra entrega','Yape','Plin') NOT NULL
  monto    DECIMAL(10,2) NOT NULL
  estado   ENUM('Por pagar','Pagado','Anulado') NOT NULL DEFAULT 'Por pagar'
)
```

Por qué está normalizada, para el documento: las imágenes salen a su propia
tabla porque una publicación tiene varias (en JS eran un arreglo dentro del
objeto), el pago sale a su tabla porque es otra entidad del diagrama, y el
detalle copia `titulo` y `precioUnitario` a propósito, porque el pedido tiene
que conservar el precio pactado aunque el vendedor lo cambie después.

`codigo` del pedido se arma con el id: `"KC-" . str_pad($id, 4, "0", STR_PAD_LEFT)`.
La siembra conserva los códigos del Avance 2 y el `AUTO_INCREMENT` de `pedido`
arranca después del mayor.

### Datos de ejemplo (`sql/kercado.sql`)

Los mismos de `js/datos.js`: 5 categorías, 16 residentes (`R-001` del Avance 2
es `idResidente = 1`, y así en orden), 14 publicaciones con sus imágenes, y
los 11 pedidos con su detalle y su pago. Más un residente administrador
(`idResidente = 17`). Las publicaciones PB-0001 a PB-0009 son los ids 1 a 9,
y las de Carmen (PB-0021, 0022, 0025, 0027 y 0030) son los ids 10 a 14:

| Cuenta | Clave | Rol |
|---|---|---|
| `carmen.rojas@kercado.pe` | `Kercado2026` | residente, compra y vende |
| `maria.torres@kercado.pe` | `Kercado2026` | residente, vende la torta de chocolate |
| `sofia.mendoza@kercado.pe` | `Kercado2026` | residente **Pendiente**, no puede entrar |
| `administracion@kercado.pe` | `Kercado2026` | **admin**, la administración del condominio |

Las claves van como hash (`password_hash`) ya calculado dentro del `.sql`.

El archivo empieza con `SET NAMES utf8mb4;` y `SET FOREIGN_KEY_CHECKS = 0;`,
hace `DROP TABLE IF EXISTS` de las siete tablas (así se puede volver a
importar para dejar todo como al inicio, es el `reiniciarDatos()` del Avance
3) y termina con `SET FOREIGN_KEY_CHECKS = 1;`.

---

## 4. `app/config.php` y `app/conexion.php`

```php
define("BD_SERVIDOR", "localhost");   // en InfinityFree es sqlXXX.infinityfree.com
define("BD_NOMBRE",   "kercado");     // en InfinityFree es if0_XXXXXXXX_kercado
define("BD_USUARIO",  "root");
define("BD_CLAVE",    "");
define("MODO_DESARROLLO", true);      // false en el hosting, oculta los errores técnicos
```

`conexion(): PDO` abre una sola conexión por petición (variable `static`),
con `ERRMODE_EXCEPTION`, `FETCH_ASSOC`, `EMULATE_PREPARES = false` y charset
`utf8mb4`. Si falla, responde 503 con un mensaje entendible (y el detalle
técnico solo si `MODO_DESARROLLO`).

---

## 5. `app/funciones.php`: lo común del servidor

Al cargarse inicia la sesión con cookie `httponly`, `samesite=Lax` y `secure`
si hay HTTPS, y `use_strict_mode`. Incluye `config.php` y `conexion.php`.
Ninguna función de aquí hace SQL salvo las que llaman a `almacen.php`.

| Función | Qué hace |
|---|---|
| `e($texto): string` | `htmlspecialchars` con `ENT_QUOTES` y UTF-8 |
| `formatearPrecio($numero): string` | `"S/ 24.00"` |
| `formatearFecha($fecha): string` | `"13/10/2026"` desde `"2026-10-13"` o un DATETIME |
| `nombreCompleto(?array $residente): string` | `"María Torres"`, o `"Vecino del condominio"` si es `null` |
| `textoUnidad(?array $residente): string` | `"Torre B, Dpto. 402"` |
| `claseEstado(string $estado): string` | `"estado estado--aceptado"`, igual que en `base.js` del Avance 2 |
| `seEnvioFormulario(): bool` | `$_SERVER["REQUEST_METHOD"] === "POST"` |
| `textoPost(string $campo): string` | `trim` del `$_POST`, `""` si no vino |
| `enteroPost(string $campo): int` y `enteroGet(string $campo): int` | `(int)`, 0 si no vino |
| `textoGet(string $campo): string` | `trim` del `$_GET` |
| `campoCsrf(): string` | el `<input type="hidden" name="csrf">` con el token de la sesión |
| `comprobarCsrf(): void` | si el token no coincide, responde 400 y termina |
| `avisar(string $texto, string $tipo = "ok"): void` | guarda un aviso en `$_SESSION["avisos"]` para la siguiente página; `$tipo` es `"ok"` o `"error"` |
| `redirigir(string $pagina): never` | `header("Location: ...")` y `exit` |
| `exigirSesion(): array` | devuelve el residente conectado; si no hay, avisa y manda a `registro.php?volver=<página actual>` |
| `exigirAdmin(): array` | como `exigirSesion()` y además rol admin; si no, responde 403 con una página entendible |
| `paginaSegura(string $volver): string` | devuelve `$volver` solo si es una página nuestra (`^[a-z]+\.php(\?[^:]*)?$`), si no `"index.php"`. Evita redirecciones a otros sitios |
| `recibirImagen(string $campo): ?string` | valida la foto subida (JPG, PNG o WEBP por contenido con `getimagesize`, hasta 2 MB), la guarda en `uploads/` con nombre aleatorio y devuelve `"uploads/abc123.jpg"`; `null` si no se subió nada; lanza `RuntimeException` con mensaje para el vecino si no sirve |
| `pintarErrorCampo(array $errores, string $campo): void` | imprime el texto del error de ese campo (escapado) o nada |

---

## 6. `app/almacen.php`: la API de datos

Es `almacen.js` en PHP. **Mismos nombres.** Todas usan `conexion()` y
sentencias preparadas. Las filas se devuelven como arreglos asociativos con
las columnas de la sección 3. Las que pueden fallar devuelven
`["ok" => bool, "mensaje" => string]` (más datos donde se indica), con
mensajes en minúscula y como se habla, listos para `avisar()`.

### Categorías
| Función | Devuelve |
|---|---|
| `listarCategorias(): array` | todas, por nombre |
| `obtenerCategoria(string $idCategoria): ?array` | |
| `guardarCategoria(string $idCategoria, string $nombre, string $descripcion, bool $esNueva): array` | `{ok, mensaje}`; solo admin |
| `eliminarCategoria(string $idCategoria): array` | `{ok, mensaje}`; las publicaciones quedan sin categoría |

### Publicaciones
Cada publicación devuelta trae además `imagenes` (arreglo de rutas por
`orden`, nunca vacío: si no tiene, `["assets/img/kercado.png"]`),
`nombreCategoria` y `vendedor` (el residente, sin `claveHash`).

| Función | Devuelve |
|---|---|
| `listarPublicaciones(array $filtro = []): array` | solo `Activa` y de vendedores `Activo`, más recientes primero. `$filtro`: `texto` (busca en título, descripción y categoría con `LIKE`), `idCategoria`, `precioMin`, `precioMax`, `orden` (`"recientes"`, `"precio-asc"`, `"precio-desc"`) |
| `obtenerPublicacion(int $id): ?array` | en cualquier estado |
| `publicacionesDelVendedor(int $idResidente): array` | todas las suyas |
| `crearPublicacion(array $datos): array` | `{ok, mensaje, idPublicacion}`. `$datos`: `titulo, descripcion, precio, stock, horario, idCategoria, imagenes` (rutas). El vendedor es el de la sesión |
| `darDeBajaPublicacion(int $id): array` | `{ok, mensaje}`; solo su dueño |
| `listarTodasLasPublicaciones(): array` | admin, todas en cualquier estado |
| `cambiarEstadoPublicacion(int $id, string $estado): array` | admin, `Activa` / `Observada` / `Baja` |

### Residentes y sesión
`sesionActual()` vuelve a leer al residente de la base en cada petición, así
si la administración lo desactiva, pierde el acceso al momento. Nunca se
devuelve `claveHash` fuera de `almacen.php`.

| Función | Devuelve |
|---|---|
| `obtenerResidente(int $id): ?array` | |
| `buscarPorCorreo(string $correo): ?array` | |
| `registrarSolicitud(array $datos): array` | `{ok, mensaje}`. `$datos`: `nombres, apellidos, correo, clave, telefono, torre, numeroDepartamento`. Rechaza correo repetido, guarda `password_hash`, estado `Pendiente` |
| `iniciarSesion(string $correo, string $clave): array` | `{ok, mensaje, residente}`. Usa `password_verify`; mensajes distintos para datos incorrectos, cuenta pendiente y cuenta inactiva. Si entra, `session_regenerate_id(true)` y guarda `$_SESSION["idResidente"]` |
| `cerrarSesion(): void` | vacía `$_SESSION`, borra la cookie de sesión y `session_destroy()` |
| `sesionActual(): ?array` | el residente conectado y `Activo`, o `null` |
| `esAdmin(?array $residente): bool` | |
| `listarResidentes(string $estado = ""): array` | admin; filtra por estado si viene |
| `cambiarEstadoResidente(int $id, string $estado): array` | admin; no puede desactivarse a sí mismo |

### Carrito
Vive en `$_SESSION["carrito"]` como `[idPublicacion => cantidad]`. Los precios
y el stock **siempre** se leen de la base, nunca del formulario.

| Función | Devuelve |
|---|---|
| `obtenerCarrito(): array` | `[["idPublicacion", "cantidad", "publicacion", "subtotal"], ...]`; quita solas las líneas de productos que ya no están activos |
| `carritoPorVendedor(): array` | el mismo carrito agrupado: `[["vendedor" => array, "lineas" => array, "total" => float], ...]` |
| `agregarAlCarrito(int $id, int $cantidad): array` | `{ok, mensaje}`. Rechaza sin sesión, sin stock, producto propio o inactivo |
| `cambiarCantidad(int $id, int $cantidad): array` | `{ok, mensaje}`; 0 quita la línea |
| `quitarDelCarrito(int $id): void` | |
| `vaciarCarrito(): void` | `unset($_SESSION["carrito"])`, nunca `session_unset()` |
| `totalCarrito(): float` | |
| `cantidadEnCarrito(): int` | unidades, para el contador de la cabecera |

### Pedidos
| Función | Devuelve |
|---|---|
| `registrarPedidos(string $metodoPago): array` | `{ok, mensaje, codigos}`. **Dentro de una transacción**: agrupa por vendedor, bloquea cada publicación con `SELECT ... FOR UPDATE`, comprueba stock, crea un pedido con su detalle y su pago (`Por pagar`) por vendedor, descuenta stock, hace `commit` y vacía el carrito. Si algo falla, `rollBack` y nada cambia |
| `pedidosDelComprador(int $idResidente): array` | más recientes primero; cada uno con `detalles`, `pago` y `vendedor` |
| `pedidosDelVendedor(int $idResidente): array` | igual, con `comprador` |
| `listarTodosLosPedidos(): array` | admin, con comprador y vendedor |
| `estadosSiguientes(string $estado): array` | según la tabla de transiciones de abajo |
| `cambiarEstadoPedido(int $idPedido, string $nuevoEstado, string $motivo = ""): array` | `{ok, mensaje}`. Solo el vendedor de ese pedido; valida la transición; `Cancelado` exige motivo y devuelve el stock; `Entregado` pone el pago en `Pagado`, `Cancelado` lo pone en `Anulado`. En transacción |

```
Pendiente ──► Aceptado ──► En preparación ──► Entregado
    │             │
    └─────────────┴──► Cancelado (con motivo)
```

Constantes en `almacen.php`: `METODOS_DE_PAGO`, `TRANSICIONES`,
`IMAGEN_POR_DEFECTO = "assets/img/kercado.png"`.

---

## 7. `app/plantilla.php`

| Función | Qué hace |
|---|---|
| `abrirPagina(string $titulo, string $descripcion, string $paginaActual): void` | `<head>` completo, enlace "Saltar al contenido", el header y `<main id="contenido">` |
| `cerrarPagina(string $scriptDePagina = ""): void` | cierra el `main`, imprime el footer, el `<dialog id="confirmacion">`, la caja `#avisos` con los avisos guardados por `avisar()`, el chat de ayuda, y los scripts `js/base.js` y el de la página |

El header es el del Avance 2, pero ahora lo arma PHP:

- **Menú:** Inicio, Catálogo, Mi panel, Carrito, y "Registro" si no hay sesión.
  Si el conectado es admin, aparece además "Administración". `$paginaActual`
  (`"inicio"`, `"catalogo"`, `"panel"`, `"carrito"`, `"registro"`, `"admin"`)
  pone `menu__enlace--activo` y `aria-current="page"` en su enlace;
  `producto` cuenta como catálogo y `publicar` como panel.
- **Cuenta:** sin sesión, el botón "Ingresar" a `registro.php`; con sesión,
  "Hola, Carmen" y un formulario `POST` a `salir.php` con su botón "Salir" y
  el csrf.
- **Contador del carrito:** lo imprime PHP con `cantidadEnCarrito()`,
  oculto con `hidden` si es 0.
- **Buscador:** `action="catalogo.php"`, deja escrito lo que se buscó.

El footer es el del Avance 2 más los **íconos de redes sociales** (Facebook,
Instagram, WhatsApp y TikTok, SVG en línea con `aria-label`, `target="_blank"`
y `rel="noopener"`).

El **chat de ayuda** es un botón flotante que abre un panel con preguntas
frecuentes (cómo comprar, cómo vender, métodos de pago, entregas, validar mi
cuenta) y un campo para escribir: `base.js` busca palabras clave y responde.
Sin servicios externos.

---

## 8. `js/base.js`: solo interfaz

Ya no lee datos. Conserva `formatearPrecio`, `mostrarAviso`,
`pedirConfirmacion`, `leerParametro`, `marcarError`, `limpiarCampo`,
`mostrarResumen`, `escribirAnio`, el menú hamburguesa y la conexión del
diálogo. Se agregan:

- **Confirmación de formularios:** todo `<form>` con
  `data-confirmar="texto de la pregunta"` (y opcional `data-titulo`) se
  intercepta en el `submit`, se abre `pedirConfirmacion()` y solo si el
  vecino acepta se envía con `form.submit()`. Así ninguna página escribe JS
  para confirmar.
- **Avisos del servidor:** los `.aviso-flotante` que imprimió PHP al cargar se
  quitan solos a los pocos segundos, igual que los de `mostrarAviso()`.
- **El chat de ayuda.**

---

## 9. Formularios y campos

Cada formulario `POST` lleva un `<input type="hidden" name="accion">` cuando
la página tiene más de uno. Errores del servidor debajo de cada campo con el
mismo marcado del Avance 2 (`<small class="campo__error" id="e-...">`), y el
campo con `aria-invalid="true"`.

| Página | Formulario | `accion` | Campos |
|---|---|---|---|
| `registro.php` | ingresar | `ingresar` | `correo`, `clave`, `recordar` (checkbox), `volver` (hidden) |
| `registro.php` | registrarse | `registrar` | `nombres`, `apellidos`, `correo`, `telefono`, `torre`, `numeroDepartamento`, `clave`, `confirmar`, `terminos` |
| `producto.php` | agregar | `agregar` | `idPublicacion`, `cantidad` |
| `carrito.php` | cambiar | `cambiar` | `idPublicacion`, `cantidad` |
| `carrito.php` | quitar | `quitar` | `idPublicacion` |
| `carrito.php` | vaciar | `vaciar` | |
| `carrito.php` | confirmar | `confirmar` | `metodoPago` |
| `publicar.php` | publicar | | `titulo`, `descripcion`, `precio`, `stock`, `horario`, `idCategoria`, `imagen` (file, `enctype="multipart/form-data"`) |
| `panel.php` | estado del pedido | `estado-pedido` | `idPedido`, `estado`, `motivo` |
| `panel.php` | baja | `baja` | `idPublicacion` |
| `salir.php` | salir | | |
| `admin.php` | residente | `estado-residente` | `idResidente`, `estado` |
| `admin.php` | publicación | `estado-publicacion` | `idPublicacion`, `estado` |
| `admin.php` | categoría | `guardar-categoria` / `eliminar-categoria` | `idCategoria`, `nombre`, `descripcion`, `esNueva` |

Filtros por `GET` (se comparten por URL y funcionan sin JS):
`catalogo.php?q=&categoria=&min=&max=&orden=`, `producto.php?id=`,
`registro.php?volver=`, `panel.php?pestana=compras|ventas|publicaciones`,
`admin.php?pestana=residentes|publicaciones|pedidos|categorias`.

**Cookie "recordar mi correo":** si en el ingreso se marca `recordar`,
`registro.php` guarda el correo con
`setcookie("kercado_correo", $correo, time() + 86400 * 30, ...)` (httponly,
samesite Lax) y lo deja escrito la próxima vez. Si se desmarca, la borra con
una fecha pasada. Nunca se guarda la clave en una cookie.

---

## 10. Sesiones: inicio, mantenimiento y cierre

- **Inicio:** `registro.php` valida, llama a `iniciarSesion()`, que verifica
  con `password_verify`, regenera el id de sesión y guarda
  `$_SESSION["idResidente"]`. Vuelve a `paginaSegura($volver)`.
- **Mantenimiento:** cada página privada empieza con `exigirSesion()`
  (`panel.php`, `publicar.php`, `carrito.php`) o `exigirAdmin()`
  (`admin.php`). `sesionActual()` revisa en la base que la cuenta siga
  activa. El carrito vive en `$_SESSION["carrito"]`.
- **Cierre:** `salir.php` solo acepta `POST` con csrf, llama a
  `cerrarSesion()`, avisa "cerraste tu sesión" en una sesión nueva y manda al
  inicio.

---

## 11. Cómo se prueba

1. XAMPP encendido (Apache y MySQL), el proyecto en
   `htdocs/kercado`, la base `kercado` creada en phpMyAdmin e importado
   `sql/kercado.sql`.
2. Abrir `http://localhost/kercado/`. Consola del navegador sin errores y
   ninguna advertencia de PHP en la página.
3. Recorrer: catálogo con filtros, ficha, agregar al carrito, confirmar con
   Carmen, entrar como María y cambiar el estado del pedido, entrar como
   administración y validar a Sofía, salir.
4. Probar a 1366, 768 y 375 px sin scroll horizontal, y solo con el teclado.
5. `php -l` en cada archivo antes de subir.
6. Para volver todo al inicio, importar otra vez `sql/kercado.sql`.
