# Base del Avance 2: especificación de las plantillas

Este documento define lo que **Piero construye primero** y que el resto del
equipo usa sin modificar. En el Avance 1 lo que unía las cinco páginas era el
CSS. En el Avance 2 lo que las une son **los datos**: el producto que Francys
agrega al carrito lo lee Luis, el pedido que genera Luis aparece en el panel de
Piero, y la publicación que crea Edgar aparece en el catálogo de Francys. Si
cada uno inventa su propio formato, las piezas no se hablan.

Por eso este archivo es un **contrato**. Los nombres de funciones, claves y
campos que aparecen aquí son exactamente los que se usan en el código. Si algo
tiene que cambiar, se cambia aquí primero y se avisa al grupo.

---

## 1. Restricciones que no se negocian

1. HTML5, CSS3 y JavaScript nativo. Sin librerías, sin frameworks, sin Sass.
2. El sitio se abre con **doble clic** (`file:///...`), sin servidor. De eso
   salen dos prohibiciones:
   - **Nada de `type="module"`, `import` ni `export`.** Chrome bloquea los
     módulos sobre `file://`. Todos los scripts son clásicos y las funciones
     son globales.
   - **Nada de `fetch`.** No hay servidor ni JSON externo; los datos iniciales
     viven en `js/datos.js`.
3. Un solo `css/estilo.css`. Cero `style=""`, cero `<style>`, cero colores en
   hexadecimal fuera de `:root`.
4. Toda la persistencia pasa por `localStorage`, y **solo `js/almacen.js` toca
   `localStorage`**. Ninguna página llama a `localStorage` directamente.

---

## 2. Mapa de archivos del Avance 2

```
KercadoWeb/
├── index.html          Edgar
├── catalogo.html       Francys
├── producto.html       Francys
├── registro.html       Luis
├── carrito.html        Luis      (nueva)
├── publicar.html       Edgar     (nueva)
├── panel.html          Piero
│
├── plantilla.html      Piero     molde actualizado
├── componentes.html    Piero     guía visual con las piezas nuevas
│
├── css/estilo.css      Piero     único CSS, nadie más lo edita
│
├── js/datos.js         Piero     datos iniciales (semilla)
├── js/almacen.js       Piero     capa de persistencia, único que toca localStorage
├── js/base.js          Piero     lo común a todas las páginas
├── js/inicio.js        Edgar
├── js/catalogo.js      Francys
├── js/producto.js      Francys
├── js/registro.js      Luis
├── js/carrito.js       Luis
├── js/publicar.js      Edgar
├── js/panel.js         Piero
└── js/componentes.js   Piero     solo para los ejemplos de componentes.html
```

`js/kercado.js` desaparece. Sus funciones se reparten así:
`escribirAnio` va a `base.js`; `validarRegistro`, `validarSesion`,
`marcarError`, `limpiarCampo`, `limpiarFormulario`, `mostrarResumen` y
`correoValido` van a `registro.js` (las tres auxiliares de errores pasan a
`base.js` porque `publicar.js` y `carrito.js` también las necesitan);
`validarFiltro` se reemplaza por el filtrado real en `catalogo.js`.

### Orden de carga, igual en todas las páginas

Al final del `<body>`, siempre en este orden:

```html
<script src="js/datos.js"></script>
<script src="js/almacen.js"></script>
<script src="js/base.js"></script>
<script src="js/catalogo.js"></script>  <!-- el de la página, solo uno -->
```

`index.html` carga `inicio.js`, y así cada página con el suyo.

---

## 3. Modelo de datos

Los nombres de los campos siguen **el diagrama de clases de la figura 2 del
Avance 1**. Esto es deliberado: en el documento se puede decir que el
almacenamiento implementa el modelo del análisis sin traducciones.

### 3.1 Categoria

```js
{ idCategoria: "postres", nombre: "Postres", descripcion: "Tortas, queques, alfajores y dulces caseros" }
```

Los `idCategoria` son textos cortos y sin tildes porque viajan en la URL
(`catalogo.html?categoria=postres`). Las cinco:
`comida-preparada`, `postres`, `panaderia`, `bebidas`, `abarrotes`.

### 3.2 Residente

```js
{
  idResidente: "R-001",
  nombres: "Carmen",
  apellidos: "Rojas",
  correo: "carmen.rojas@kercado.pe",
  clave: "Kercado2026",
  telefono: "987654321",
  torre: "C",
  numeroDepartamento: "504",
  estado: "Activo"            // "Activo" | "Pendiente" | "Inactivo"
}
```

Solo los residentes con estado `"Activo"` pueden iniciar sesión. Quien se
registra desde `registro.html` queda `"Pendiente"` (el administrador lo valida
en un avance posterior); el mensaje de éxito debe decirlo.

### 3.3 Publicacion

```js
{
  idPublicacion: "PB-0001",
  titulo: "Torta de Chocolate Casera",
  descripcion: "Bizcocho húmedo de chocolate con fudge y pecanas...",
  precio: 24.00,              // número, nunca texto
  stock: 12,
  horario: "9:00 a 20:00",
  imagenes: ["assets/img/catalogos/torta-chocolate.jpg", "assets/img/catalogos/torta-mini-1.jpg"],
  idCategoria: "postres",
  idResidente: "R-002",       // el vendedor
  estado: "Activa",           // "Activa" | "Baja" | "Observada"
  fechaPublicacion: "2026-09-01"
}
```

`imagenes[0]` es la principal. Si hay más de una, la ficha muestra miniaturas.

### 3.4 Pedido (con DetallePedido y Pago dentro)

```js
{
  idPedido: "P-0135",
  codigo: "KC-0135",
  fechaHora: "2026-10-13T18:42:00",
  idComprador: "R-001",
  idVendedor: "R-002",
  detalles: [
    { idPublicacion: "PB-0001", titulo: "Torta de Chocolate Casera", cantidad: 1, precioUnitario: 24.00, subtotal: 24.00 }
  ],
  total: 24.00,
  pago: { metodo: "Yape", monto: 24.00, estado: "Por pagar" },   // metodo: "Efectivo contra entrega" | "Yape" | "Plin"
  estado: "Pendiente",
  motivoCancelacion: ""
}
```

`titulo` y `precioUnitario` se **copian** al detalle en el momento de comprar.
Si el vendedor cambia el precio después, el pedido conserva el precio pactado.
Es una decisión de diseño que vale la pena mencionar en el documento.

`pago.estado` lo mueve `almacen.js` solo: nace `"Por pagar"`, pasa a
`"Pagado"` cuando el vendedor marca el pedido como Entregado y a `"Anulado"`
si se cancela. Kercado no cobra, solo deja anotado cómo quedó.

### 3.5 Estados del pedido y transiciones válidas

```
Pendiente ──► Aceptado ──► En preparación ──► Entregado
    │             │
    └─────────────┴──► Cancelado (con motivo)
```

Cualquier otra transición la rechaza `cambiarEstadoPedido`.

### 3.6 Claves de localStorage

| Clave | Contenido |
|---|---|
| `kercado.version` | número de versión de la semilla, hoy `2` |
| `kercado.residentes` | arreglo de Residente |
| `kercado.publicaciones` | arreglo de Publicacion |
| `kercado.pedidos` | arreglo de Pedido |
| `kercado.sesion` | `idResidente` del conectado, o no existe |
| `kercado.carrito.R-001` | carrito de ese residente: `[{ idPublicacion, cantidad }]` |

El carrito va **por residente** para que, al cambiar de cuenta en la demo, cada
uno vea el suyo.

---

## 4. `js/datos.js`: la semilla

Una sola constante global, `DATOS_INICIALES`, con `categorias`, `residentes`,
`publicaciones` y `pedidos`. Contenido mínimo, sacado del sitio actual para que
nada se contradiga con las capturas del Avance 1:

**Publicaciones del catálogo actual (9)**, con el vendedor y la unidad tal como
aparecen hoy en `catalogo.html`:

| id | Título | Categoría | Precio | Vendedor | Unidad |
|---|---|---|---|---|---|
| PB-0001 | Torta de Chocolate Casera | postres | 24.00 | María Torres | B 402 |
| PB-0002 | Torta de 3 leches | postres | 28.00 | Gregorio Torres | C 301 |
| PB-0003 | Pan Baguette | panaderia | 2.50 | Micaela Jiménez | A 111 |
| PB-0004 | Galletas con Chispas de Chocolate | panaderia | 6.00 | Rafael Ramírez | D 215 |
| PB-0005 | Refresco Chicha Morada | bebidas | 7.50 | Luis Castro | B 115 |
| PB-0006 | Refresco Camu Camu | bebidas | 8.00 | Ana López | A 108 |
| PB-0007 | Lomo Saltado de Res | comida-preparada | 30.00 | Nicolás Medina | A 106 |
| PB-0008 | Pollo a la Brasa Entero | comida-preparada | 75.00 | Nataly Aguirre | C 254 |
| PB-0009 | Arroz Superior Blanco de Primera 10 kg | abarrotes | 25.50 | Ernesto Fernández | B 222 |

**Publicaciones de Carmen Rojas (5)**, las que hoy están en la tabla
"Publicaciones activas" de `panel.html`: PB-0021 Empanadas de carne,
PB-0022 Alfajores de maicena (caja x6), PB-0025 Ají de gallina con arroz,
PB-0027 Queque de naranja, PB-0030 Limonada frozen (1 litro). Con los precios y
stocks de esa tabla. Sus imágenes las consigue Luis (ver reparto); mientras no
estén, se usa `assets/img/kercado.png`.

**Residentes:** los 9 vendedores, Carmen Rojas (R-001, Torre C, Dpto. 504) y
los compradores que aparecen en "Pedidos recibidos" del panel (Jorge Salazar,
Rosa Quispe, Diego Vargas, Lucía Fernández y el resto). Todos `"Activo"`, todos
con clave `Kercado2026`, correo `nombre.apellido@kercado.pe` sin tildes.
Agregar además un residente `"Pendiente"` para que se vea que no puede entrar.

**Pedidos:** los de las tablas actuales del panel ("Pedidos realizados" de
Carmen y "Pedidos recibidos" por Carmen), con sus códigos, fechas, totales y
estados. Los códigos nuevos arrancan después del mayor que exista (hoy
KC-0134, así que el siguiente es KC-0135).

### Cuentas para la demo

| Cuenta | Para qué sirve |
|---|---|
| `carmen.rojas@kercado.pe` / `Kercado2026` | La residente principal: compra y también vende |
| `maria.torres@kercado.pe` / `Kercado2026` | Vendedora de la torta de chocolate, para mostrar que el pedido de Carmen le llega |

---

## 5. `js/almacen.js`: la API de persistencia

Al cargarse, si `kercado.version` no existe o es distinta de la de
`DATOS_INICIALES`, copia la semilla a `localStorage`. Cada lectura y escritura
va dentro de `try/catch`: si `localStorage` falla (modo incógnito estricto) o
el JSON está corrupto, trabaja en memoria con la semilla y el sitio no se cae.

Todas las funciones son **síncronas** y globales. Ninguna toca el DOM.

### Categorías
| Función | Devuelve |
|---|---|
| `listarCategorias()` | arreglo de Categoria |
| `obtenerCategoria(idCategoria)` | Categoria o `null` |

### Publicaciones
| Función | Devuelve |
|---|---|
| `listarPublicaciones(filtro)` | solo las `"Activa"`, más recientes primero. `filtro` es opcional: `{ texto, idCategoria, precioMin, precioMax }`. `texto` busca en título, descripción y nombre de categoría, sin distinguir mayúsculas ni tildes |
| `obtenerPublicacion(idPublicacion)` | Publicacion o `null` |
| `publicacionesDelVendedor(idResidente)` | todas las suyas, incluidas las de baja |
| `crearPublicacion(datos)` | la Publicacion creada, con id nuevo, estado `"Activa"` y el vendedor de la sesión, o `null` si no hay sesión o los datos no sirven. `datos` es `{ titulo, descripcion, precio, stock, horario, idCategoria, imagenes }`; `imagenes` es un arreglo de rutas y, si viene vacío, se usa `assets/img/kercado.png` |
| `darDeBajaPublicacion(idPublicacion)` | `true` / `false`. Solo su dueño puede hacerlo |

### Residentes y sesión
| Función | Devuelve |
|---|---|
| `obtenerResidente(idResidente)` | Residente o `null` |
| `registrarSolicitud(datos)` | `{ ok, mensaje }`. Rechaza correo repetido; deja el estado `"Pendiente"` |
| `iniciarSesion(correo, clave)` | `{ ok, mensaje, residente }`. Mensajes distintos para "datos incorrectos" y "cuenta pendiente de validación" |
| `cerrarSesion()` | nada |
| `sesionActual()` | Residente conectado o `null` |

### Carrito (siempre del residente de la sesión)
| Función | Devuelve |
|---|---|
| `obtenerCarrito()` | `[{ idPublicacion, cantidad, publicacion, subtotal }]`, ya con los datos del producto |
| `agregarAlCarrito(idPublicacion, cantidad)` | `{ ok, mensaje }`. Rechaza sin sesión, sin stock suficiente o si el producto es del propio comprador |
| `cambiarCantidad(idPublicacion, cantidad)` | `{ ok, mensaje }`. Cantidad 0 quita la línea |
| `quitarDelCarrito(idPublicacion)` | nada |
| `vaciarCarrito()` | nada |
| `totalCarrito()` | número |
| `cantidadEnCarrito()` | número total de unidades, para el contador de la cabecera |

### Pedidos
| Función | Devuelve |
|---|---|
| `registrarPedidos(metodoPago)` | `{ ok, mensaje, pedidos }`. Agrupa el carrito **por vendedor** y crea un pedido por cada uno, como dice el requerimiento "Registrar pedido" del Avance 1. Descuenta stock y vacía el carrito |
| `pedidosDelComprador(idResidente)` | arreglo, más recientes primero |
| `pedidosDelVendedor(idResidente)` | arreglo, más recientes primero |
| `estadosSiguientes(estado)` | arreglo con los estados a los que se puede pasar desde ese, según 3.5. `estadosSiguientes("Aceptado")` da `["En preparación", "Cancelado"]`; desde Entregado o Cancelado, `[]` |
| `cambiarEstadoPedido(idPedido, nuevoEstado, motivo)` | `{ ok, mensaje }`. Solo el vendedor de ese pedido; valida la transición de 3.5; si se cancela, exige motivo y devuelve el stock |

### Para la demo
| Función | Qué hace |
|---|---|
| `reiniciarDatos()` | borra todo lo de `kercado.*` (también la sesión y los carritos) y vuelve a cargar la semilla. Se llama desde la consola antes de presentar, y después se recarga la página |

---

## 6. `js/base.js`: lo común a todas las páginas

Se ejecuta en cada página y hace esto:

1. **Escribe el año** del pie (lo que hoy hace `escribirAnio`).
2. **Pinta la cabecera según la sesión.** Sin sesión: botón "Ingresar" hacia
   `registro.html`. Con sesión: "Hola, Carmen" y un botón "Salir" que llama a
   `cerrarSesion()` y lleva al inicio.
3. **Actualiza el contador del carrito** en la cabecera
   (`cantidadEnCarrito()`), y lo oculta si es 0.
4. **Menú hamburguesa** en pantallas menores a 620 px: botón con
   `aria-expanded` y `aria-controls`, se cierra con Escape.
5. **Marca la página actual** con `aria-current="page"` en el enlace activo del
   menú, además de la clase `menu__enlace--activo` que ya existe. Por eso el
   HTML del menú ya no lleva esa clase escrita: el header es literalmente el
   mismo en todas las páginas. `producto.html` marca Catálogo y
   `publicar.html` marca Mi panel.
6. **Deja escrito en el buscador** lo que se buscó, cuando la URL trae `?q=`.

Y expone estas funciones globales para las páginas:

| Función | Uso |
|---|---|
| `formatearPrecio(numero)` | `"S/ 24.00"`, siempre dos decimales |
| `formatearFecha(textoISO)` | `"13/10/2026"` |
| `mostrarAviso(texto, tipo)` | aviso flotante que desaparece solo; `tipo` es `"ok"` o `"error"`. Escribe en la región `aria-live` para que lo lea el lector de pantalla |
| `pedirConfirmacion(titulo, texto, funcion)` | abre el `<dialog id="confirmacion">` de la plantilla con ese título y ese texto; `funcion` se ejecuta solo si el vecino acepta. Reemplaza a `confirm()` |
| `exigirSesion()` | si no hay sesión, redirige a `registro.html?volver=` con la página actual (codificada, `leerParametro("volver")` la devuelve lista para usar), y devuelve `false` |
| `leerParametro(nombre)` | lee un valor de la URL, por ejemplo `leerParametro("id")` |
| `actualizarContadorCarrito()` | la llaman las páginas después de tocar el carrito |
| `nombreCompleto(residente)` | `"María Torres"` |
| `textoUnidad(residente)` | `"Torre B, Dpto. 402"` |
| `claseEstado(estado)` | las clases de la píldora de ese estado, por ejemplo `"estado estado--aceptado"`. Sirve para pedidos y publicaciones |
| `marcarError(idCampo, idError, mensaje)`, `limpiarCampo(idCampo, idError)`, `mostrarResumen(idResumen, errores)` | las de `kercado.js`, para que todos los formularios avisen igual. Ahora escriben con `textContent`, y `mostrarResumen` con 0 errores deja un mensaje corto y genérico: el texto de éxito propio lo escribe cada página |

---

## 7. Cambios en `plantilla.html`

El header y el footer siguen siendo **idénticos en todas las páginas**. Lo que
cambia:

1. **Enlace para saltar al contenido**, primer elemento del `<body>`:
   `<a class="saltar" href="#contenido">Saltar al contenido</a>`, y el `<main>`
   lleva `id="contenido"`.
2. **Botón hamburguesa** dentro del header, oculto en escritorio.
3. **Menú:** Inicio · Catálogo · Mi panel · Carrito · Registro. Publicar se
   alcanza desde el panel con un botón, no desde el menú, para no saturarlo.
4. **Enlace al carrito con contador** en la fila de arriba, junto a Ingresar.
5. **Zona de cuenta** con un contenedor que `base.js` rellena (Ingresar o
   Hola + Salir).
6. **Región de avisos** al final del body: `<div class="avisos" id="avisos" aria-live="polite"></div>`.
   Justo antes va el **`<dialog class="confirmacion" id="confirmacion">`**
   que usa `pedirConfirmacion()`, también igual en todas las páginas.
7. Los cuatro `<script>` en el orden de la sección 2.
8. Los comentarios que dicen "el buscador todavía no busca nada porque nos
   falta el servidor" se borran: ahora sí busca.

---

## 8. Lo nuevo en `css/estilo.css`

Solo Piero lo edita. Todo lo nuevo va en bloques comentados con el mismo tono
del archivo, usando las variables de `:root`.

**Variables nuevas en `:root`:** `--estado-aceptado` y `--estado-preparacion`
para las píldoras nuevas, y `--duracion` / `--curva` para que todas las
animaciones compartan ritmo.

**Componentes nuevos:**
- `.saltar`: oculto hasta que recibe el foco con Tab.
- `.menu-boton` y el menú desplegable en móvil.
- `.contador`: el globo con la cantidad sobre el carrito.
- `.avisos` y `.aviso-flotante` (`--ok`, `--error`): entran deslizándose y se
  van solos.
- `.pestanas`, `.pestanas__boton`, `.pestanas__panel`: para el panel.
- `.carrito`, `.linea-carrito`, `.carrito__resumen`: lista a la izquierda y
  resumen con total a la derecha; en móvil, una columna.
- `.selector-cantidad`: botones menos y más alrededor de un `input number`.
- `.estado--aceptado` y `.estado--preparacion`.
- `.vacio`: el mensaje de "no hay productos" o "tu carrito está vacío", con un
  botón para volver al catálogo.
- `.revelar` y `.revelar--visible`: para que las secciones del inicio
  aparezcan al hacer scroll.
- `dialog.confirmacion`: estilo del `<dialog>` nativo que se usa para
  confirmar acciones (dar de baja, cancelar pedido, vaciar carrito).
- `.ficha` y `.ficha__precio`: la ficha del producto en dos columnas, fotos
  a la izquierda y datos a la derecha.
- `.galeria__boton`: el botón que envuelve cada miniatura de la galería; la
  elegida lleva `aria-pressed="true"`.
- `.carrito__grupo` y `.carrito__vendedor`: la caja de cada vendedor dentro
  del carrito.
- `.tabla__control`, `.tabla__detalle` y `.detalle-pedido`: el select y la
  fila desplegable de las tablas del panel.
- `.fila-titulo`: un título con un botón a su derecha.
- `.boton--claro` (borde blanco, para fondos verdes) y el estilo de
  `.boton:disabled`.
- `.grilla-productos--animada`: se agrega a la `.grilla-productos` para que
  sus tarjetas entren con `aparecer`, una detrás de otra.

**Animaciones (`@keyframes`), lo que hoy falta para el criterio de técnicas
avanzadas:**
- `aparecer`: las tarjetas suben y aparecen al filtrar el catálogo, con un
  pequeño retraso entre una y otra.
- `deslizar-entrada`: los avisos flotantes.
- `latido`: el contador del carrito cuando cambia.

**Accesibilidad:** un bloque `@media (prefers-reduced-motion: reduce)` que
apaga todas las animaciones y transiciones. Es una línea en el documento que
casi ningún grupo va a tener.

---

## 9. `componentes.html` actualizado

Se agrega una sección por cada componente nuevo de la sección 8, armado y
listo para copiar, igual que en el Avance 1. Además, dos ejemplos que el equipo
va a necesitar sí o sí:

- Una **tarjeta de producto dentro de un `<template>`** con `id="plantilla-tarjeta"`,
  que es como Francys va a generar las tarjetas desde JavaScript sin escribir
  HTML dentro de cadenas de texto.
- Un **`<dialog>` de confirmación** con sus dos botones.

---

## 10. Criterio de terminado de la base

La base está lista cuando:

- [x] `datos.js`, `almacen.js` y `base.js` están en `main`.
- [x] En la consola de cualquier página, `listarPublicaciones()` devuelve 14
      publicaciones y `iniciarSesion("carmen.rojas@kercado.pe", "Kercado2026").ok`
      es `true`.
- [x] `plantilla.html` y las siete páginas tienen el header, footer y scripts
      nuevos, y abren sin errores en la consola. `carrito.html` y
      `publicar.html` existen como copias de la plantilla con un título, para
      que el menú no tenga enlaces muertos mientras Luis y Edgar las llenan.
- [x] Cada página tiene su `js/<pagina>.js` creado, aunque esté vacío.
- [x] El menú hamburguesa funciona a 375 px.
- [x] `componentes.html` muestra cada pieza nueva.
- [x] `GUIA-DE-JAVASCRIPT.md` está en el repo.

Hasta que estas casillas estén marcadas, nadie empieza con la lógica de su
página. Pueden avanzar el HTML y leer las guías.
