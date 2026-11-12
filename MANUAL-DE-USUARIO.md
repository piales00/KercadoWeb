# Manual de usuario

## Kercado: marketplace del condominio

**Curso:** Taller de Programación Web, Universidad Tecnológica del Perú (UTP), Lima
**Docente:** José Antonio Espinal Teves
**Entrega:** Avance 3

**Integrantes:**

- Piero Alessandro Pérez Izquierdo
- Edgar Paolo Pérez Román
- Francys Diego Yareta Cortez
- Luis Alberto Huánuco Jiménez

**Dirección del sitio publicado:** por definir en InfinityFree

| Ficha | Descripción |
|---|---|
| Sistema | Kercado: catálogo, carrito y registro de pedidos entre vecinos de un condominio |
| Piloto | Condominio Las Palmas 357, Chorrillos, Lima |
| Tecnologías | PHP 8, MySQL/MariaDB (PDO), HTML5, CSS3, JavaScript nativo y sesiones de PHP |
| Usuarios | Visitante, residente (comprador y vendedor con una sola cuenta) y administración del condominio |
| Entorno local | XAMPP en Windows (`http://localhost/kercado/`) |
| Entorno de despliegue | InfinityFree (dirección por definir) |
| Base de datos | `kercado`, siete tablas, script `sql/kercado.sql` |
| Alcance | Registra ofertas, pedidos y el método de pago acordado. **No cobra dinero ni realiza entregas.** |

> **Nota:** Kercado no es una pasarela de pagos ni un servicio de reparto. El sistema solo deja constancia de lo que se ofrece, de lo que se pide y de cómo acordaron pagar comprador y vendedor (efectivo contra entrega, Yape o Plin). El cobro y la entrega los coordinan directamente los vecinos dentro del condominio.

---

## 1. Resumen

Kercado es un marketplace hiperlocal para los residentes de un condominio. Cualquier visitante puede explorar el catálogo de productos que ofrecen los vecinos (comida preparada, postres, panadería, bebidas y abarrotes). Para comprar o vender es necesario registrarse con los datos de la unidad (torre y departamento) y esperar a que la administración del condominio valide la cuenta.

La idea central del sistema es que **un residente es comprador y vendedor a la vez, con una sola cuenta**. En el panel del residente, "Mis compras", "Mis ventas" y "Mis publicaciones" son secciones del mismo espacio, no tipos de usuario distintos. Cuando un residente confirma su carrito, el sistema crea un pedido por cada vendedor, con su propio código (por ejemplo `KC-0135`), y cada vendedor actualiza el estado de su pedido hasta entregarlo.

La administración del condominio valida a los nuevos residentes, modera las publicaciones, supervisa los pedidos y mantiene las categorías.

## 2. Objetivos

Al terminar la lectura de este manual, el usuario podrá instalar Kercado en un entorno PHP y MySQL local o en InfinityFree, distinguir los permisos de visitante, residente y administración, comprar y vender productos dentro del condominio, gestionar el estado de los pedidos y comprobar la integridad de los datos mediante pruebas funcionales.

### Resultados esperados

- Configurar la conexión a MySQL en `app/config.php` y reconocer las siete tablas del modelo.
- Registrar un residente nuevo y validarlo desde la administración.
- Realizar una compra de demostración con productos de dos vendedores distintos y comprobar que se generan dos pedidos.
- Publicar un producto con fotografía y darlo de baja.
- Cambiar el estado de un pedido como vendedor y observar el efecto en el pago y en el stock.
- Identificar los controles de seguridad del sistema y sus limitaciones.

## 3. Arquitectura del sistema

### 3.1 Roles y permisos

| Funcionalidad | Visitante | Residente | Administración |
|---|---|---|---|
| Ver inicio, catálogo y buscar | Sí | Sí | Sí |
| Filtrar el catálogo por categoría, precio y orden | Sí | Sí | Sí |
| Ver la ficha de un producto | Sí | Sí | Sí |
| Solicitar una cuenta (registro) | Sí | No aplica | No aplica |
| Agregar al carrito | No, se le pide ingresar | Sí (excepto sus propios productos) | Sí |
| Confirmar pedido y elegir método de pago | No | Sí | Sí |
| Consultar "Mis compras" | No | Sí | Sí |
| Publicar un producto con foto | No | Sí | Sí |
| Consultar "Mis ventas" y cambiar el estado de sus pedidos | No | Sí, solo de los pedidos donde es vendedor | Sí, solo de sus propias ventas |
| Dar de baja sus publicaciones | No | Sí | Sí |
| Validar, activar o desactivar residentes | No | No | Sí |
| Moderar publicaciones (Activa, Observada, Baja) | No | No | Sí |
| Ver todos los pedidos del condominio | No | No | Sí |
| Crear, editar y eliminar categorías | No | No | Sí |

El acceso a las páginas privadas se controla en el servidor: `panel.php`, `publicar.php` y `carrito.php` empiezan con `exigirSesion()`, y `admin.php` con `exigirAdmin()`. Una cuenta en estado `Pendiente` o `Inactivo` no puede iniciar sesión, y si la administración desactiva a un residente conectado, este pierde el acceso en su siguiente clic, porque `sesionActual()` vuelve a leer su estado de la base en cada petición.

### 3.2 Estructura principal de archivos

| Ruta | Función |
|---|---|
| `index.php` | Inicio: productos recientes y categorías |
| `catalogo.php` | Catálogo con buscador y filtros por URL (`?q=&categoria=&min=&max=&orden=`) |
| `producto.php` | Ficha del producto (`?id=`) y formulario para agregar al carrito |
| `registro.php` | Ingresar y registrarse (dos formularios en la misma página) |
| `salir.php` | Cierra la sesión (solo acepta POST) |
| `carrito.php` | Carrito agrupado por vendedor y confirmación del pedido |
| `publicar.php` | Formulario para publicar un producto con fotografía |
| `panel.php` | Mi panel: pestañas Mis compras, Mis ventas y Mis publicaciones |
| `admin.php` | Administración: pestañas Residentes, Publicaciones, Pedidos y Categorías |
| `app/config.php` | Datos de conexión (único archivo que cambia entre XAMPP e InfinityFree) |
| `app/conexion.php` | Función `conexion()` que abre la conexión PDO |
| `app/funciones.php` | Sesión, escape de HTML, token CSRF, avisos, formatos y subida de imágenes |
| `app/almacen.php` | Capa de datos: la única que contiene SQL |
| `app/plantilla.php` | Cabecera, menú, pie de página, diálogo de confirmación y chat de ayuda |
| `app/.htaccess` | Bloquea el acceso directo a la carpeta `app/` desde el navegador |
| `sql/kercado.sql` | Estructura de las siete tablas y datos de ejemplo |
| `uploads/` | Fotografías que suben los residentes (con `.htaccess` que impide ejecutar PHP) |
| `css/estilo.css` | Hoja de estilos única del sitio |
| `js/base.js` y `js/<página>.js` | Interfaz: avisos, confirmaciones, menú, chat y validación previa de formularios |
| `assets/` | Logotipo e imágenes de los productos de ejemplo |

### 3.3 Modelo de datos

| Tabla | Propósito | Relación |
|---|---|---|
| `categoria` | Rubros del catálogo (postres, bebidas, etc.) | `categoria` 1 → N `publicacion` |
| `residente` | Cuenta del vecino: datos personales, unidad, hash de la clave, rol y estado | `residente` 1 → N `publicacion`; 1 → N `pedido` como comprador y como vendedor |
| `publicacion` | Producto ofrecido: título, descripción, precio, stock, horario y estado | `publicacion` N → 1 `residente` (vendedor); N → 1 `categoria` |
| `imagen_publicacion` | Fotografías de cada publicación, con su orden | `publicacion` 1 → N `imagen_publicacion` |
| `pedido` | Cabecera del pedido: código, fecha, comprador, vendedor, total y estado | `pedido` 1 → N `detalle_pedido`; 1 → 1 `pago` |
| `detalle_pedido` | Líneas del pedido con título y precio copiados al comprar | N → 1 `pedido`; N → 1 `publicacion` (opcional) |
| `pago` | Método de pago acordado, monto y estado del pago | 1 → 1 `pedido` |

Decisiones de diseño:

- Las imágenes tienen su propia tabla porque una publicación puede tener varias.
- El pago es una entidad separada del pedido, tal como en el diagrama de clases del Avance 1.
- `detalle_pedido` copia `titulo` y `precioUnitario` a propósito: el pedido conserva el precio pactado aunque el vendedor cambie el precio o dé de baja el producto después.
- Si se elimina una categoría, sus publicaciones quedan sin categoría (`ON DELETE SET NULL`). Un residente con pedidos no se puede borrar (`ON DELETE RESTRICT`); para retirarlo se le cambia el estado a `Inactivo`.

### 3.4 Capas de la aplicación

| Capa | Archivos | Responsabilidad |
|---|---|---|
| Presentación | Páginas `.php` de la raíz, `app/plantilla.php`, `css/estilo.css`, `js/*.js` | Mostrar la información, validar formularios antes de enviarlos y dar avisos al usuario |
| Negocio | La parte superior de cada página `.php` y `app/funciones.php` | Procesar formularios (patrón POST, aviso y redirección), validar de nuevo en el servidor, controlar sesiones y permisos |
| Persistencia | `app/almacen.php`, `app/conexion.php`, MySQL | Leer y escribir en la base con sentencias preparadas y transacciones |

Ninguna página escribe SQL: todas llaman a funciones de `app/almacen.php` como `listarPublicaciones()`, `registrarPedidos()` o `cambiarEstadoPedido()`.

## 4. Instalación

### 4.1 Instalación local con XAMPP en Windows

1. Descargar XAMPP para Windows con PHP 8 desde el sitio oficial de Apache Friends e instalarlo en la ruta por defecto `C:\xampp`, dejando marcados los componentes Apache, MySQL, PHP y phpMyAdmin.
   `[CAPTURA: asistente de instalación de XAMPP con los componentes Apache, MySQL, PHP y phpMyAdmin marcados]`
2. Abrir el **XAMPP Control Panel** y pulsar **Start** en Apache y en MySQL. Ambos módulos deben quedar resaltados en verde y mostrar sus puertos (80 y 443 para Apache, 3306 para MySQL).
   `[CAPTURA: XAMPP Control Panel con Apache y MySQL en verde y sus puertos visibles]`
3. Copiar la carpeta completa del proyecto a `C:\xampp\htdocs\kercado`. Dentro deben quedar directamente `index.php`, `app\`, `sql\`, `uploads\`, `css\`, `js\` y `assets\`.
   `[CAPTURA: Explorador de Windows en C:\xampp\htdocs\kercado mostrando index.php y las carpetas app, sql, uploads, css, js y assets]`
4. Abrir `http://localhost/phpmyadmin/`, pulsar **Nueva** en el panel izquierdo, escribir `kercado` como nombre de la base, elegir el cotejamiento `utf8mb4_unicode_ci` y pulsar **Crear**.
   `[CAPTURA: phpMyAdmin, pantalla "Crear base de datos" con el nombre kercado y el cotejamiento utf8mb4_unicode_ci seleccionado]`
5. Con la base `kercado` seleccionada, abrir la pestaña **Importar**, elegir el archivo `C:\xampp\htdocs\kercado\sql\kercado.sql` y pulsar **Importar**. Al terminar deben aparecer las siete tablas: `categoria`, `detalle_pedido`, `imagen_publicacion`, `pago`, `pedido`, `publicacion` y `residente`.
   `[CAPTURA: phpMyAdmin con el mensaje de importación exitosa y las siete tablas listadas en el panel izquierdo]`
6. Comprobar que `app/config.php` tiene los valores de XAMPP (vienen así por defecto):

   ```php
   define("BD_SERVIDOR", "localhost");
   define("BD_NOMBRE",   "kercado");
   define("BD_USUARIO",  "root");
   define("BD_CLAVE",    "");
   define("MODO_DESARROLLO", true);
   ```

7. Abrir `http://localhost/kercado/` en el navegador. Debe verse la página de inicio con el logotipo de Kercado, el menú y los productos recientes del condominio.
   `[CAPTURA: navegador en http://localhost/kercado/ con la página de inicio, el menú y los productos recientes]`

> Para devolver todos los datos a su estado inicial basta con importar de nuevo `sql/kercado.sql`: el script elimina y vuelve a crear las siete tablas.

### 4.2 Despliegue en InfinityFree

| Configuración | Valor |
|---|---|
| `BD_SERVIDOR` | `sqlXXX.infinityfree.com` (el que indique el panel; no es la IP del sitio) |
| `BD_NOMBRE` | `if0_XXXXXXXX_kercado` |
| `BD_USUARIO` | `if0_XXXXXXXX` |
| `BD_CLAVE` | Contraseña MySQL de la cuenta (no se escribe en este manual) |
| `MODO_DESARROLLO` | `false` |

1. Crear una cuenta gratuita en InfinityFree y, desde el panel de cliente, crear un sitio nuevo eligiendo un subdominio gratuito (por ejemplo, `kercado.infinityfreeapp.com`, dirección definitiva por definir).
   `[CAPTURA: panel de cliente de InfinityFree con el sitio nuevo creado y su subdominio visible]`
2. Abrir el **Control Panel** del sitio, entrar a **MySQL Databases**, escribir `kercado` como nombre y pulsar **Create Database**. Anotar el nombre completo (`if0_XXXXXXXX_kercado`), el usuario (`if0_XXXXXXXX`) y el **MySQL Hostname** (`sqlXXX.infinityfree.com`).
   `[CAPTURA: sección MySQL Databases del panel con la base if0_..._kercado creada y el hostname sqlXXX visible, con la contraseña oculta]`
3. Pulsar **phpMyAdmin** junto a la base creada, abrir la pestaña **Importar**, elegir `sql/kercado.sql` y ejecutar. Deben aparecer las siete tablas.
   `[CAPTURA: phpMyAdmin de InfinityFree con las siete tablas de kercado importadas]`
4. Editar `app/config.php` en la copia local que se va a subir:

   ```php
   define("BD_SERVIDOR", "sqlXXX.infinityfree.com");
   define("BD_NOMBRE",   "if0_XXXXXXXX_kercado");
   define("BD_USUARIO",  "if0_XXXXXXXX");
   define("BD_CLAVE",    "LA_CONTRASENA_MYSQL_DEL_PANEL");
   define("MODO_DESARROLLO", false);
   ```

   Con `MODO_DESARROLLO` en `false`, si la conexión falla el visitante ve un mensaje entendible y no el detalle técnico del error.
5. Subir los archivos a la carpeta `htdocs` del sitio, de una de estas dos formas:
   - **FileZilla:** conectar con el host FTP, usuario y contraseña que muestra la sección **FTP Details** del panel (puerto 21), abrir `htdocs` en el lado remoto y arrastrar ahí el contenido de la carpeta del proyecto (no la carpeta en sí).
   - **Administrador de archivos (Online File Manager):** abrir `htdocs`, subir el proyecto comprimido en ZIP y extraerlo ahí.

   Al terminar deben existir `htdocs/index.php` y `htdocs/app/config.php`. Borrar el archivo de bienvenida que InfinityFree crea por defecto en `htdocs`.
   `[CAPTURA: FileZilla conectado, con la carpeta remota htdocs mostrando index.php, app, sql, uploads, css, js y assets]`
6. Comprobar que la carpeta `htdocs/uploads` existe y tiene permisos de escritura (755). En FileZilla: clic derecho sobre `uploads`, **Permisos de archivo**, valor numérico `755`. Sin ese permiso, publicar un producto con foto falla.
   `[CAPTURA: diálogo de permisos de FileZilla sobre la carpeta uploads con el valor 755]`
7. Abrir la dirección del sitio con HTTPS y recorrer catálogo, ingreso de residente, compra y administración.
   `[CAPTURA: página de inicio de Kercado abierta en la dirección pública de InfinityFree con el candado de HTTPS]`

> **Advertencia:** no compartir `app/config.php` ni escribir la contraseña de MySQL en documentos, capturas o el repositorio. Antes de tomar la captura del paso 2, comprobar que la contraseña aparezca oculta.

## 5. Manual del visitante

El visitante es cualquier persona que entra al sitio sin iniciar sesión. Puede explorar todo lo que se ofrece, pero para comprar debe tener una cuenta validada.

### 5.1 Explorar el catálogo

1. Entrar a la página de inicio. Se muestran los productos más recientes y las categorías del condominio.
   `[CAPTURA: página de inicio sin sesión, con el botón "Ingresar" en la cabecera y los productos recientes]`
2. Pulsar **Catálogo** en el menú, o escribir una palabra en el buscador de la cabecera (por ejemplo, "torta") y pulsar buscar. El catálogo muestra solo los productos activos cuyo título, descripción o categoría contienen esa palabra.
   `[CAPTURA: catalogo.php?q=torta mostrando las tortas encontradas y el texto buscado todavía escrito en el buscador]`

### 5.2 Usar los filtros

1. En el catálogo, elegir una **categoría** (Comida preparada, Postres, Panadería, Bebidas o Abarrotes).
2. Escribir un **precio mínimo** y un **precio máximo** en soles.
3. Elegir el **orden**: más recientes, precio de menor a mayor o precio de mayor a menor.
4. Aplicar los filtros. La dirección de la página cambia (por ejemplo, `catalogo.php?categoria=postres&min=10&max=30&orden=precio-asc`), por lo que el resultado se puede compartir copiando el enlace. Si ningún producto cumple los filtros, se muestra un mensaje indicándolo.
   `[CAPTURA: catálogo filtrado por Postres, entre S/ 10 y S/ 30, ordenado por precio ascendente, con la URL visible en la barra del navegador]`
   `[CAPTURA: catálogo con filtros que no devuelven resultados, mostrando el mensaje de que no hay productos]`

### 5.3 Ver la ficha de un producto

1. Pulsar sobre cualquier tarjeta del catálogo. Se abre `producto.php?id=...` con la fotografía, el título, la descripción, el precio, el stock disponible, el horario de entrega acordado por el vendedor, la categoría y el nombre y la torre del vecino que lo vende.
   `[CAPTURA: ficha de la Torta de Chocolate Casera con foto, precio S/ 24.00, stock, horario y datos de María Torres como vendedora]`
2. Si el visitante pulsa **Agregar al carrito** sin haber iniciado sesión, el sistema lo lleva a la página de ingreso y, después de ingresar, lo devuelve a la ficha.
   `[CAPTURA: registro.php mostrando el aviso de que debe ingresar para continuar, después de intentar agregar al carrito sin sesión]`

## 6. Manual del residente

### 6.1 Registrarse y quedar pendiente de validación

1. Pulsar **Registro** en el menú. La página muestra dos formularios: "Ingresar" y "Crear cuenta".
2. En "Crear cuenta", completar nombres, apellidos, correo, teléfono (9 dígitos), torre (A, B, C o D), número de departamento, contraseña, confirmación de la contraseña y aceptar los términos.
3. Pulsar **Crear cuenta**. Si algún campo es incorrecto, el error aparece debajo de ese campo y se conservan los datos ya escritos.
   `[CAPTURA: formulario de registro con errores debajo del teléfono y de la confirmación de contraseña, y el resto de datos conservados]`
4. Si los datos son válidos, el sistema registra la solicitud en estado **Pendiente** y muestra un aviso: la cuenta debe ser validada por la administración del condominio antes de poder ingresar. Esto evita que personas ajenas al condominio compren o vendan.
   `[CAPTURA: aviso de solicitud registrada indicando que la administración debe validar la cuenta]`
5. Si se intenta ingresar con una cuenta pendiente (por ejemplo, `sofia.mendoza@kercado.pe`), el sistema muestra un mensaje específico de cuenta pendiente de validación.
   `[CAPTURA: intento de ingreso con sofia.mendoza@kercado.pe mostrando el mensaje de cuenta pendiente]`

### 6.2 Ingresar y recordar el correo

1. En el formulario "Ingresar", escribir el correo y la contraseña.
2. Marcar **Recordar mi correo** si se desea que el correo aparezca escrito la próxima vez. Solo se guarda el correo, durante 30 días, en una cookie; la contraseña nunca se guarda.
3. Pulsar **Ingresar**. La cabecera cambia a "Hola, Carmen" con un botón **Salir**, y aparece el enlace **Mi panel**.
   `[CAPTURA: formulario de ingreso con el correo de Carmen escrito y la casilla "Recordar mi correo" marcada]`
   `[CAPTURA: cabecera con sesión iniciada mostrando "Hola, Carmen", el botón Salir y el contador del carrito]`
4. Si la contraseña es incorrecta, el sistema muestra un mensaje general de datos incorrectos, sin indicar si el error está en el correo o en la contraseña.
   `[CAPTURA: mensaje de datos incorrectos tras ingresar una contraseña equivocada]`

### 6.3 Agregar productos al carrito

1. Abrir la ficha de un producto, elegir la cantidad (no puede superar el stock) y pulsar **Agregar al carrito**.
2. Aparece un aviso de confirmación y el contador del carrito en la cabecera aumenta.
   `[CAPTURA: ficha de producto con el aviso "agregado al carrito" y el contador de la cabecera actualizado]`
3. Un residente no puede agregar sus propios productos, ni productos sin stock o dados de baja: en esos casos el sistema muestra un aviso explicando el motivo.
   `[CAPTURA: aviso que impide a María Torres agregar su propia torta al carrito]`

### 6.4 Revisar el carrito por vendedor

1. Pulsar **Carrito** en el menú. Los productos aparecen **agrupados por vendedor**, con el nombre y la unidad de cada vecino, el subtotal de cada línea y el total por vendedor.
   `[CAPTURA: carrito de Carmen con productos de dos vendedores distintos, cada grupo con su total]`
2. Para cambiar una cantidad, modificar el número y pulsar **Actualizar**. Con cantidad 0 la línea se elimina.
3. Para quitar un producto, pulsar el botón de quitar de esa línea. Para vaciar todo el carrito, pulsar **Vaciar carrito** y confirmar en el cuadro de diálogo.
   `[CAPTURA: cuadro de diálogo de confirmación para vaciar el carrito]`

Los precios y el stock se leen siempre de la base de datos, nunca de lo que envía el navegador, por lo que no es posible alterar un precio desde el formulario.

### 6.5 Confirmar el pedido y elegir el método de pago

1. En el carrito, elegir el **método de pago acordado**: Efectivo contra entrega, Yape o Plin.
2. Pulsar **Confirmar pedido** y aceptar en el cuadro de confirmación.
3. El sistema crea **un pedido por cada vendedor**, cada uno con su propio código (por ejemplo, `KC-0135` y `KC-0136`), descuenta el stock y vacía el carrito. Todo ocurre en una transacción: si un producto se quedó sin stock en ese momento, no se registra ningún pedido y el carrito queda como estaba.
   `[CAPTURA: carrito con el método de pago Yape seleccionado antes de confirmar]`
   `[CAPTURA: aviso de pedidos registrados mostrando los dos códigos KC-XXXX generados]`

> **Importante:** confirmar un pedido **no es un cobro**. Kercado no procesa pagos ni realiza entregas. El método elegido solo queda registrado para que comprador y vendedor sepan cómo van a pagar; el pago se hace directamente entre vecinos al momento de la entrega, y la entrega la coordina el vendedor dentro del condominio.

### 6.6 Consultar mis compras

1. Entrar a **Mi panel** y abrir la pestaña **Mis compras** (`panel.php?pestana=compras`).
2. Cada pedido muestra su código, fecha y hora, vendedor y su unidad, productos con cantidad y precio pactado, total, método de pago, estado del pedido y estado del pago.
   `[CAPTURA: pestaña Mis compras con los pedidos recién creados en estado Pendiente y pago Por pagar]`

### 6.7 Publicar un producto con foto

1. Desde **Mi panel**, pulsar **Publicar producto** (o abrir `publicar.php`).
2. Completar título, descripción, precio en soles, stock, horario de entrega (por ejemplo, "Lunes a viernes, 6 a 9 p. m.") y categoría.
3. Elegir una fotografía en formato JPG, PNG o WEBP de hasta 2 MB.
   `[CAPTURA: formulario de publicar producto completo, con la fotografía elegida]`
4. Pulsar **Publicar**. Si la foto no cumple el formato o el tamaño, o algún campo es inválido, el error aparece debajo del campo. Si todo es correcto, el producto queda en estado **Activa** y aparece en el catálogo.
   `[CAPTURA: error debajo del campo de imagen al intentar subir un archivo no permitido o mayor a 2 MB]`
   `[CAPTURA: catálogo mostrando el producto recién publicado con su fotografía]`

### 6.8 Mis ventas y cambio de estado del pedido

1. Ingresar como vendedor (por ejemplo, `maria.torres@kercado.pe`) y abrir **Mi panel**, pestaña **Mis ventas** (`panel.php?pestana=ventas`).
2. Cada pedido recibido muestra el código, el comprador con su torre y departamento, los productos, el total, el método de pago acordado y el estado actual.
   `[CAPTURA: pestaña Mis ventas de María Torres con un pedido Pendiente de Carmen Rojas]`
3. Elegir el siguiente estado en la lista (solo aparecen los estados permitidos desde el actual) y pulsar **Actualizar estado**.
4. Para **cancelar** un pedido es obligatorio escribir el motivo. Al cancelar, el stock vuelve al producto y el pago queda **Anulado**.
5. Al marcar el pedido como **Entregado**, el pago pasa a **Pagado**, porque el pago se realiza al momento de la entrega.
   `[CAPTURA: pedido cambiado a Aceptado con el aviso de estado actualizado]`
   `[CAPTURA: intento de cancelar sin motivo mostrando el error, y luego cancelación con motivo escrito]`
   `[CAPTURA: pedido Entregado con el pago en estado Pagado]`

### 6.9 Dar de baja una publicación

1. En **Mi panel**, pestaña **Mis publicaciones**, ubicar el producto.
2. Pulsar **Dar de baja** y confirmar en el cuadro de diálogo.
3. La publicación pasa a estado **Baja** y deja de mostrarse en el catálogo. Los pedidos anteriores conservan el título y el precio pactado.
   `[CAPTURA: diálogo de confirmación para dar de baja una publicación]`
   `[CAPTURA: pestaña Mis publicaciones con el producto en estado Baja]`

### 6.10 Salir

1. Pulsar **Salir** en la cabecera.
2. El sistema cierra la sesión, borra la cookie de sesión, muestra el aviso "cerraste tu sesión" y vuelve al inicio. El botón de la cabecera vuelve a decir **Ingresar**.
   `[CAPTURA: página de inicio después de salir, con el aviso de sesión cerrada y el botón Ingresar]`

## 7. Manual de la administración

La administración del condominio ingresa con una cuenta de rol `admin` (`administracion@kercado.pe`). Al ingresar aparece en el menú el enlace **Administración**, que abre `admin.php` con cuatro pestañas.
`[CAPTURA: menú con el enlace Administración visible y la página admin.php con sus cuatro pestañas]`

Si un residente sin rol de administración intenta abrir `admin.php` directamente, el sistema responde con una página de acceso denegado.
`[CAPTURA: página de acceso denegado al abrir admin.php con la cuenta de Carmen Rojas]`

### 7.1 Validar residentes

1. Abrir la pestaña **Residentes** (`admin.php?pestana=residentes`). Se listan los residentes con su unidad, correo, fecha de registro y estado; se pueden filtrar los pendientes.
2. Para validar una solicitud, cambiar su estado de **Pendiente** a **Activo**. Desde ese momento el residente puede ingresar.
3. Para retirar el acceso a un residente, cambiar su estado a **Inactivo**. Si estaba conectado, pierde el acceso en su siguiente clic. La administración no puede desactivar su propia cuenta.
   `[CAPTURA: pestaña Residentes con Sofía Mendoza en estado Pendiente]`
   `[CAPTURA: Sofía Mendoza ya en estado Activo con el aviso de cambio realizado]`

### 7.2 Moderar publicaciones

1. Abrir la pestaña **Publicaciones**. Se listan todas las publicaciones del condominio en cualquier estado, con su vendedor.
2. Cambiar el estado según corresponda: **Activa** (visible en el catálogo), **Observada** (retirada del catálogo mientras el vendedor corrige algo) o **Baja** (retirada).
   `[CAPTURA: pestaña Publicaciones con una publicación cambiada a Observada]`
   `[CAPTURA: catálogo donde ya no aparece la publicación observada]`

### 7.3 Supervisar pedidos

1. Abrir la pestaña **Pedidos**. Se listan todos los pedidos del condominio con código, fecha, comprador, vendedor, total, método de pago y estados.
2. Esta vista es de consulta: el estado de cada pedido lo cambia solo su vendedor, porque es quien coordina la entrega.
   `[CAPTURA: pestaña Pedidos de la administración con la lista completa de pedidos]`

### 7.4 Categorías

1. Abrir la pestaña **Categorías**.
2. Para crear una, escribir el identificador (en minúsculas y sin espacios, por ejemplo `limpieza`; es el que aparece en la URL del catálogo), el nombre y la descripción, y pulsar **Guardar**.
3. Para editar, modificar el nombre o la descripción de una categoría existente y guardar.
4. Para eliminar, pulsar **Eliminar** y confirmar. Las publicaciones de esa categoría no se borran: quedan sin categoría.
   `[CAPTURA: pestaña Categorías con la categoría nueva "Limpieza" creada]`
   `[CAPTURA: diálogo de confirmación para eliminar una categoría]`

## 8. Estados del pedido y del pago

### 8.1 Estados del pedido

| Estado | Significado |
|---|---|
| Pendiente | El comprador confirmó el pedido; el vendedor aún no responde |
| Aceptado | El vendedor aceptó preparar el pedido |
| En preparación | El vendedor está preparando el producto |
| Entregado | El vendedor entregó el producto al comprador |
| Cancelado | El vendedor canceló el pedido indicando un motivo; el stock se devuelve |

### 8.2 Transiciones permitidas

```
Pendiente ──► Aceptado ──► En preparación ──► Entregado
    │             │
    └─────────────┴──► Cancelado (con motivo)
```

| Estado actual | Puede pasar a |
|---|---|
| Pendiente | Aceptado, Cancelado |
| Aceptado | En preparación, Cancelado |
| En preparación | Entregado |
| Entregado | Ninguno (estado final) |
| Cancelado | Ninguno (estado final) |

### 8.3 Estados del pago

| Estado | Cuándo ocurre |
|---|---|
| Por pagar | Al registrarse el pedido |
| Pagado | Cuando el vendedor marca el pedido como Entregado |
| Anulado | Cuando el vendedor cancela el pedido |

El estado del pago solo refleja lo que acordaron los vecinos: Kercado no recibe ni transfiere dinero.

## 9. Actividades de prueba con evidencias

| Actividad | Evidencia solicitada |
|---|---|
| A. Preparación | Captura de phpMyAdmin con las siete tablas importadas y de `app/config.php` configurado, sin mostrar la contraseña |
| B. Catálogo | Búsqueda por texto y filtro combinado de categoría, rango de precio y orden, con la URL visible |
| C. Registro | Registrar un residente nuevo, mostrar el aviso de cuenta pendiente y el rechazo al intentar ingresar |
| D. Validación | Ingresar como administración, activar al residente nuevo y demostrar que ya puede ingresar |
| E. Compra | Con Carmen Rojas, agregar productos de dos vendedores distintos, confirmar con Yape y mostrar los dos códigos de pedido generados |
| F. Venta | Con María Torres, llevar un pedido de Pendiente a Entregado y mostrar el pago en Pagado |
| G. Inventario | Mostrar el stock de un producto antes de comprar, después de comprar y después de cancelar el pedido con motivo |
| H. Publicación | Publicar un producto con foto propia, verlo en el catálogo y luego darlo de baja |
| I. Seguridad | Intentar abrir `admin.php` como residente y abrir `app/config.php` desde el navegador; mostrar y explicar ambos bloqueos |

`[CAPTURA: una por cada actividad A a I, con la evidencia descrita en la tabla]`

## 10. Seguridad

| Control | Cómo se aplica en Kercado |
|---|---|
| Sentencias preparadas | Toda consulta con datos del usuario usa `prepare` y `execute` en `app/almacen.php`; nunca se concatenan valores en el SQL, lo que evita la inyección SQL |
| Contraseñas con hash | Las claves se guardan con `password_hash()` y se comprueban con `password_verify()`; ni siquiera la base contiene la clave en texto plano |
| Token CSRF | Todo formulario POST lleva un token oculto (`campoCsrf()`) que se verifica con `comprobarCsrf()`; un formulario enviado desde otro sitio es rechazado |
| Escape de la salida | Todo dato impreso en el HTML pasa por `e()` (`htmlspecialchars`) y en JavaScript se usa `textContent`, lo que evita la inyección de código (XSS) |
| Validación de imágenes | `recibirImagen()` acepta solo JPG, PNG o WEBP comprobando el contenido real con `getimagesize`, hasta 2 MB, y guarda el archivo con un nombre aleatorio; `uploads/.htaccess` impide ejecutar PHP en esa carpeta |
| Sesiones regeneradas | Al ingresar se ejecuta `session_regenerate_id(true)`; la cookie de sesión es `httponly`, `samesite=Lax` y `secure` con HTTPS; al salir se destruye la sesión |
| Estado leído en cada petición | `sesionActual()` revisa en la base que la cuenta siga activa, así una desactivación surte efecto al instante |
| Carpeta `app/` protegida | `app/.htaccess` y `sql/.htaccess` contienen `Require all denied`, por lo que la configuración y el script no se pueden abrir desde el navegador |
| Redirecciones seguras | `paginaSegura()` solo permite volver a páginas propias del sitio después de ingresar |
| Validación en ambos lados | El JavaScript valida antes de enviar, y PHP vuelve a validar todo porque el JavaScript se puede desactivar |
| Errores ocultos en producción | Con `MODO_DESARROLLO` en `false` no se muestran detalles técnicos al visitante |

Limitaciones conocidas: el sistema no verifica que el correo exista realmente (la validación del residente la hace la administración), no procesa pagos y no tiene recuperación de contraseña.

## 11. Problemas frecuentes

| Problema | Comprobación o solución |
|---|---|
| Apache no inicia en XAMPP | Otro programa usa el puerto 80 (Skype, IIS u otro servidor). Cerrarlo o cambiar el puerto de Apache en su configuración |
| MySQL no inicia en XAMPP | Otro MySQL instalado ocupa el puerto 3306. Detener ese servicio desde los Servicios de Windows |
| Mensaje de que la base de datos no está disponible | Revisar los cinco valores de `app/config.php`. En InfinityFree el servidor es `sqlXXX.infinityfree.com`, no `localhost` ni la IP del sitio |
| Las tildes o la ñ se ven mal | Crear la base con `utf8mb4_unicode_ci` y volver a importar `sql/kercado.sql` |
| Error al importar el SQL | Seleccionar primero la base `kercado` (o `if0_..._kercado`) antes de abrir Importar |
| Aparece la página de bienvenida de InfinityFree | `index.php` debe estar directamente dentro de `htdocs`, no en una subcarpeta; borrar el archivo de bienvenida |
| "No encontrado" en `http://localhost/kercado/` | Comprobar que la carpeta se llama exactamente `kercado` y está en `C:\xampp\htdocs` |
| No puedo ingresar con una cuenta nueva | La cuenta sigue en estado Pendiente; la administración debe activarla |
| No se puede subir la foto | Usar JPG, PNG o WEBP de hasta 2 MB; verificar que `uploads/` exista y tenga permiso 755 |
| No se ven las fotografías | Revisar que el archivo exista en `uploads/` o `assets/` y que la ruta de `imagen_publicacion` coincida |
| No se puede confirmar el pedido | Verificar que la sesión siga activa, que se eligió un método de pago y que hay stock de todos los productos |
| Un producto desapareció del carrito | El vendedor lo dio de baja o la administración lo observó; el carrito retira solo esas líneas |
| "Solicitud no válida" al enviar un formulario | La sesión expiró y el token CSRF ya no coincide; recargar la página y volver a enviar |
| Acceso denegado en Administración | Ingresar con una cuenta de rol admin y estado Activo |
| Quiero volver los datos al inicio | Importar de nuevo `sql/kercado.sql` en phpMyAdmin |

## Anexo A. Diccionario de datos

### A.1 categoria

| Campo | Tipo | Restricción | Descripción |
|---|---|---|---|
| idCategoria | VARCHAR(30) | PK | Identificador legible que viaja en la URL (`postres`) |
| nombre | VARCHAR(60) | NOT NULL | Nombre visible de la categoría |
| descripcion | VARCHAR(200) | NOT NULL, DEFAULT '' | Descripción breve |

### A.2 residente

| Campo | Tipo | Restricción | Descripción |
|---|---|---|---|
| idResidente | INT | PK, AUTO_INCREMENT | Identificador del residente |
| nombres | VARCHAR(60) | NOT NULL | Nombres |
| apellidos | VARCHAR(60) | NOT NULL | Apellidos |
| correo | VARCHAR(120) | NOT NULL, UNIQUE | Correo con el que ingresa |
| claveHash | VARCHAR(255) | NOT NULL | Hash de la contraseña generado con `password_hash()` |
| telefono | VARCHAR(9) | NOT NULL | Celular de 9 dígitos |
| torre | CHAR(1) | NOT NULL | Torre del condominio, de A a D |
| numeroDepartamento | VARCHAR(4) | NOT NULL | Número del departamento |
| rol | ENUM('residente','admin') | NOT NULL, DEFAULT 'residente' | Permisos de la cuenta |
| estado | ENUM('Activo','Pendiente','Inactivo') | NOT NULL, DEFAULT 'Pendiente' | Solo las cuentas Activo pueden ingresar |
| fechaRegistro | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de la solicitud |

### A.3 publicacion

| Campo | Tipo | Restricción | Descripción |
|---|---|---|---|
| idPublicacion | INT | PK, AUTO_INCREMENT | Identificador de la publicación |
| titulo | VARCHAR(80) | NOT NULL | Nombre del producto |
| descripcion | VARCHAR(500) | NOT NULL | Detalle del producto |
| precio | DECIMAL(8,2) | NOT NULL | Precio en soles |
| stock | INT | NOT NULL | Unidades disponibles |
| horario | VARCHAR(40) | NOT NULL, DEFAULT '' | Horario de entrega que ofrece el vendedor |
| idCategoria | VARCHAR(30) | NULL, FK → categoria, ON DELETE SET NULL, ON UPDATE CASCADE | Categoría del producto |
| idResidente | INT | NOT NULL, FK → residente, ON DELETE CASCADE | Vendedor |
| estado | ENUM('Activa','Baja','Observada') | NOT NULL, DEFAULT 'Activa' | Solo las Activa aparecen en el catálogo |
| fechaPublicacion | DATE | NOT NULL | Fecha de publicación |

### A.4 imagen_publicacion

| Campo | Tipo | Restricción | Descripción |
|---|---|---|---|
| idImagen | INT | PK, AUTO_INCREMENT | Identificador de la imagen |
| idPublicacion | INT | NOT NULL, FK → publicacion, ON DELETE CASCADE | Publicación a la que pertenece |
| ruta | VARCHAR(255) | NOT NULL | Ruta relativa (`assets/img/catalogos/x.jpg` o `uploads/x.jpg`) |
| orden | TINYINT | NOT NULL, DEFAULT 0 | 0 es la imagen principal |

### A.5 pedido

| Campo | Tipo | Restricción | Descripción |
|---|---|---|---|
| idPedido | INT | PK, AUTO_INCREMENT | Identificador del pedido |
| codigo | VARCHAR(10) | NOT NULL, UNIQUE | Código visible (`KC-0135`), armado a partir del id |
| fechaHora | DATETIME | NOT NULL | Momento de la confirmación |
| idComprador | INT | NOT NULL, FK → residente, ON DELETE RESTRICT | Residente que compra |
| idVendedor | INT | NOT NULL, FK → residente, ON DELETE RESTRICT | Residente que vende |
| total | DECIMAL(10,2) | NOT NULL | Suma de los subtotales |
| estado | ENUM('Pendiente','Aceptado','En preparación','Entregado','Cancelado') | NOT NULL, DEFAULT 'Pendiente' | Estado del pedido (sección 8) |
| motivoCancelacion | VARCHAR(200) | NOT NULL, DEFAULT '' | Obligatorio al cancelar |

### A.6 detalle_pedido

| Campo | Tipo | Restricción | Descripción |
|---|---|---|---|
| idDetalle | INT | PK, AUTO_INCREMENT | Identificador de la línea |
| idPedido | INT | NOT NULL, FK → pedido, ON DELETE CASCADE | Pedido al que pertenece |
| idPublicacion | INT | NULL, FK → publicacion, ON DELETE SET NULL | Producto comprado, si aún existe |
| titulo | VARCHAR(80) | NOT NULL | Título copiado al momento de comprar |
| cantidad | INT | NOT NULL | Unidades compradas |
| precioUnitario | DECIMAL(8,2) | NOT NULL | Precio pactado, copiado al momento de comprar |
| subtotal | DECIMAL(10,2) | NOT NULL | cantidad × precioUnitario |

### A.7 pago

| Campo | Tipo | Restricción | Descripción |
|---|---|---|---|
| idPago | INT | PK, AUTO_INCREMENT | Identificador del pago |
| idPedido | INT | NOT NULL, UNIQUE, FK → pedido, ON DELETE CASCADE | Pedido al que corresponde (uno a uno) |
| metodo | ENUM('Efectivo contra entrega','Yape','Plin') | NOT NULL | Método acordado entre los vecinos |
| monto | DECIMAL(10,2) | NOT NULL | Monto a pagar |
| estado | ENUM('Por pagar','Pagado','Anulado') | NOT NULL, DEFAULT 'Por pagar' | Estado del pago (sección 8.3) |

### A.8 Integridad referencial

- `categoria` 1 → N `publicacion`: al eliminar una categoría, sus publicaciones quedan con `idCategoria` en NULL.
- `residente` 1 → N `publicacion`: al eliminar un residente se eliminan sus publicaciones (en la práctica los residentes se desactivan, no se eliminan).
- `residente` 1 → N `pedido` (como comprador y como vendedor): `RESTRICT` impide borrar un residente con pedidos, para conservar el historial.
- `publicacion` 1 → N `imagen_publicacion` y `pedido` 1 → N `detalle_pedido`: en cascada.
- `pedido` 1 → 1 `pago`: garantizado por el `UNIQUE` sobre `pago.idPedido`.

## Anexo B. Cuentas de prueba

Todas las cuentas de ejemplo usan la contraseña `Kercado2026`, guardada en la base como hash.

| Cuenta | Rol | Estado | Uso en las pruebas |
|---|---|---|---|
| `carmen.rojas@kercado.pe` | residente | Activo | Compra y vende (Torre C, Dpto. 504) |
| `maria.torres@kercado.pe` | residente | Activo | Vende la Torta de Chocolate Casera (Torre B, Dpto. 402) |
| `sofia.mendoza@kercado.pe` | residente | Pendiente | No puede ingresar hasta que la administración la valide |
| `administracion@kercado.pe` | admin | Activo | Administración del condominio |

Los datos de ejemplo incluyen además 13 residentes activos, 5 categorías, 14 publicaciones con sus imágenes y pedidos de muestra con su detalle y su pago. Estas cuentas existen solo para la demostración; en un despliegue real deben cambiarse las contraseñas o eliminarse las cuentas de ejemplo.
