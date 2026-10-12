# Reparto de trabajo: Avance 2

**Equipo:** Piero Alessandro Pérez Izquierdo · Edgar Paolo Pérez Román ·
Francys Diego Yareta Cortez · Luis Alberto Huánuco Jiménez

**Plazo:** cuatro días, de lunes 12 a jueves 15 de octubre. **El jueves no se
escribe código nuevo**: se prueba, se documenta, se ensaya y se entrega.

**Meta:** 4 en los cinco criterios de la rúbrica. Para eso no basta con que el
sitio se vea bien: **cada botón y cada formulario tiene que funcionar de
verdad**. En el Avance 1 el buscador, el filtro y las categorías no hacían
nada. En el Avance 2 eso es lo primero que el profesor va a probar.

---

## Lo que cambia respecto al Avance 1

En el Avance 1 cada uno hizo su página y ninguna dependía de otra. **Ahora sí
dependen**: el carrito lee lo que agrega el catálogo, el panel muestra los
pedidos que crea el carrito, el catálogo muestra lo que se publica. Por eso hay
dos reglas nuevas, además de las de siempre:

1. **Nadie toca `localStorage`.** Todo pasa por las funciones de
   `js/almacen.js`. Los nombres están en `BASE-AVANCE2.md` y no se inventan
   otros.
2. **Cada uno escribe solo en sus archivos.** Tu `.html` (dentro de `<main>`)
   y tu `js/<tu-pagina>.js`. El CSS, `datos.js`, `almacen.js`, `base.js`, el
   header y el footer son de Piero. Si necesitas algo de ahí, lo pides en el
   grupo.

Como cada persona trabaja en archivos distintos, se puede trabajar en `main`
sin pisarse. Igual: **`git pull` antes de cada `git push`**, siempre.

---

## Antes de escribir código (lunes, 30 minutos)

Los cuatro, sin excepción:

1. `git pull` y abrir `componentes.html`: están las piezas nuevas (carrito,
   pestañas, avisos, contador, diálogo de confirmación, `<template>` de
   tarjeta).
2. Leer **`GUIA-DE-JAVASCRIPT.md`** completa.
3. Leer en **`BASE-AVANCE2.md`** el modelo de datos (sección 3) y las funciones
   de tu parte (secciones 5 y 6).
4. En la consola de cualquier página, probar `listarPublicaciones()` y
   `iniciarSesion("carmen.rojas@kercado.pe", "Kercado2026")`, para ver con qué
   datos van a trabajar.

---

## Quién hace qué

La base ya está en `main`. En cada persona hay un bloque **"Por dónde
empezar"** con lo que ya tiene listo y los pasos concretos, en orden.

Tres cosas que valen para Francys, Luis y Edgar:

- Tu página ya tiene la cabecera, el pie, el diálogo de confirmación, la caja
  de avisos y los cuatro `<script>`. **No los toques.** Escribes solo dentro
  de `<main id="contenido">` y en tu `js/<tu-pagina>.js`.
- El menú ya no lleva la clase `menu__enlace--activo` escrita: la pone
  `base.js` solo. No la agregues a mano.
- Además de lo que dice `BASE-AVANCE2.md`, en `base.js` hay cuatro ayudas que
  te ahorran trabajo: `nombreCompleto(residente)` da `"María Torres"`,
  `textoUnidad(residente)` da `"Torre B, Dpto. 402"`, `claseEstado(estado)`
  da las clases de la píldora, y `pedirConfirmacion(titulo, texto, funcion)`
  abre el diálogo y ejecuta tu función solo si el vecino acepta.

### Piero: base, panel e integración

**Lunes, antes de que el resto empiece con la lógica:** todo lo de
`BASE-AVANCE2.md`. `datos.js` y `almacen.js` van primero (lunes al mediodía),
porque son el contrato; después `base.js`, el CSS nuevo, la plantilla,
`componentes.html` y las páginas vacías de `carrito.html` y `publicar.html`.

**`panel.html` + `js/panel.js`**
- Exige sesión (`exigirSesion()`).
- Saludo con el nombre y la unidad del residente conectado.
- **Pestañas reales** "Mis compras" / "Mis ventas" con `role="tablist"`,
  `aria-selected` y flechas del teclado. La pestaña elegida se recuerda en la
  URL (`panel.html#mis-ventas`).
- Mis compras: tabla de `pedidosDelComprador()`, con el detalle de cada pedido
  desplegable.
- Mis ventas: tabla de `publicacionesDelVendedor()` con botón "Dar de baja"
  (con diálogo de confirmación), botón "Publicar producto" hacia
  `publicar.html`, y tabla de `pedidosDelVendedor()` donde el vendedor **cambia
  el estado** del pedido con un `<select>` que solo ofrece las transiciones
  válidas. Cancelar pide el motivo en un diálogo.
- Mensaje `.vacio` en cada tabla sin filas.

**Estado:** la base y el panel ya están hechos y probados. Lo que le queda a
Piero:

1. Cuando Luis suba las cinco fotos, poner sus rutas en `js/datos.js` y subir
   `version` a `3` para que todos los navegadores recarguen la semilla.
2. Atender los pedidos del grupo (una función o una clase que falte) el mismo
   día, para no frenar a nadie.
3. Decidir si se oscurecen `--naranja` y `--estado-pendiente`: hoy no llegan
   al contraste que pide Lighthouse.
4. Secciones 4.3 y 4.4 del documento y su parte del capítulo 5.

**Integración (miércoles y jueves):** recorrer el flujo completo de la demo
(sección "Guion de la demo"), revisar que header y footer sean idénticos en las
siete páginas y que no quede ningún enlace muerto.

---

### Francys: catálogo y ficha de producto

**`catalogo.html` + `js/catalogo.js`**
- Las tarjetas ya no se escriben a mano: se generan desde
  `listarPublicaciones()` con el `<template id="plantilla-tarjeta">` de
  `componentes.html`. Se ven exactamente igual que hoy.
- **Filtrado de verdad** combinando categoría, rango de precio y texto de
  búsqueda. Se aplica al instante al cambiar un filtro, sin recargar.
- Las categorías del aside se generan desde `listarCategorias()`, cada una con
  su enlace real `catalogo.html?categoria=postres`, y se marca la activa.
- Lee de la URL `?q=` (lo que se escribió en el buscador de la cabecera) y
  `?categoria=`, para que el buscador de cualquier página funcione.
- Un texto que diga cuántos productos se muestran ("6 productos en Postres") y
  el bloque `.vacio` con un botón "Quitar filtros" si no queda ninguno.
- Las tarjetas entran con la animación `aparecer` cada vez que se filtra.
- Borrar el mensaje actual de "todavía nos falta el servidor para filtrar de
  verdad".

**`producto.html` + `js/producto.js`**
- Lee `?id=` y pinta ese producto: título, galería, descripción, la tabla de la
  ficha y el vendedor. Si el id no existe, el bloque `.vacio` con un enlace al
  catálogo.
- **Galería:** clic (o Enter) en una miniatura cambia la imagen grande y la
  marca como seleccionada.
- **Selector de cantidad** (menos, número, más) que no deja pasar del stock ni
  bajar de 1.
- **Botón "Agregar al carrito"** con `agregarAlCarrito()`. Sin sesión, lleva a
  `registro.html?volver=producto.html?id=...`. Si el producto es del propio
  residente, en lugar del botón muestra "Esta es tu publicación".
- "También te puede interesar": tres productos de la misma categoría, con el
  mismo `<template>`.
- Arreglar lo de hoy: en escritorio la foto ocupa toda la pantalla y empuja el
  precio y el botón fuera de la vista. Galería y datos van lado a lado (la
  clase la agrega Piero si hace falta).

**Por dónde empezar, Francys**

1. Abre `componentes.html` y mira tres secciones: "Tarjeta generada con
   template", "Ficha en dos columnas y galería" y "Lista vacía". El código
   que llena las tarjetas está en `js/componentes.js`, función
   `crearTarjetaDeEjemplo`: es casi lo mismo que necesitas.
2. En `catalogo.html`: borra las nueve tarjetas escritas a mano y deja el
   `<div class="grilla-productos grilla-productos--animada" id="...">` vacío.
   Copia dentro de `<main>` el `<template id="plantilla-tarjeta">` de
   `componentes.html`. Vacía también la `<ul class="lista-categorias">`.
3. En `js/catalogo.js` hoy está `validarFiltro`, la validación del Avance 1
   que pasé tal cual para que el formulario no se rompa. **Reemplázala**: el
   filtrado es una sola llamada,
   `listarPublicaciones({ texto, idCategoria, precioMin, precioMax })`, y los
   cuatro campos son opcionales (un texto vacío no filtra). Quita el
   `onsubmit` del HTML y conecta el formulario con `addEventListener`.
4. Lee `leerParametro("q")` y `leerParametro("categoria")` al empezar. El
   buscador de la cabecera ya manda a `catalogo.html?q=...` y ya deja escrito
   lo que se buscó; a ti te toca filtrar con ese valor.
5. La animación ya está: como la grilla tiene `grilla-productos--animada`,
   cada vez que la vacías y vuelves a agregar tarjetas entran solas.
6. En `producto.html`: envuelve la galería y los datos en
   `<div class="ficha">` (dos columnas, ya resuelto en el CSS). Cada
   miniatura va dentro de un `<button class="galeria__boton">` con
   `aria-pressed`, así funciona con el teclado sin código extra.
7. En `js/producto.js`: `obtenerPublicacion(leerParametro("id"))`. Si
   devuelve `null`, muestra el bloque `.vacio`. El selector de cantidad está
   armado en `componentes.html`, sección "Carrito".
8. Agregar al carrito: `agregarAlCarrito(id, cantidad)` devuelve
   `{ ok, mensaje }`. Muestra `mensaje` con `mostrarAviso` (con `"ok"` o
   `"error"` según `ok`) y llama a `actualizarContadorCarrito()`. La función
   ya rechaza sola sin stock, sin sesión y si el producto es propio.
9. Sin sesión, antes de agregar llama a `exigirSesion()`: manda al registro y
   deja anotada la ficha para volver.

**Listo cuando:** buscar "torta" deja 2 productos; Bebidas con precio hasta
7.50 deja solo la chicha morada; `producto.html?id=PB-0001` muestra la torta
con sus cinco fotos; un id que no existe muestra el bloque vacío.

---

### Luis: registro, sesión y carrito

**`registro.html` + `js/registro.js`**
- Pasar las validaciones de `kercado.js` a `registro.js` y conectar los
  formularios con `addEventListener` (sacar los `onsubmit` del HTML).
- **Registro:** si todo es válido, `registrarSolicitud()`. El mensaje de éxito
  dice que la cuenta queda pendiente hasta que la administración la valide.
  Correo repetido da error en el campo de correo.
- **Inicio de sesión:** `iniciarSesion()`. Si sale bien, redirige al `volver=`
  de la URL o, si no hay, al panel. Mensajes distintos para datos incorrectos y
  cuenta pendiente.
- Botón para **mostrar u ocultar la contraseña** (con `aria-label` que cambie).
- Un recuadro discreto con las cuentas de prueba, para que el profesor pueda
  entrar sin preguntar.

**`carrito.html` + `js/carrito.js`** (página nueva)
- Exige sesión.
- Lista de líneas con imagen, título, vendedor, selector de cantidad, subtotal
  y botón para quitar. **Las líneas se agrupan por vendedor**, porque cada
  vendedor recibe un pedido aparte.
- Resumen a la derecha: total, `<select>` o radios de método de pago
  (Efectivo contra entrega, Yape, Plin) y botón "Registrar pedido".
- Al registrar: `registrarPedidos(metodo)`, y una pantalla de confirmación con
  los códigos generados (KC-0135, KC-0136...) y un enlace a "Mis compras".
- "Vaciar carrito" con diálogo de confirmación.
- Carrito vacío: bloque `.vacio` con un botón al catálogo.
- Cada cambio actualiza el total y el contador de la cabecera
  (`actualizarContadorCarrito()`).

**Multimedia, otra vez su responsabilidad:** las cinco imágenes de los
productos de Carmen (empanadas, alfajores, ají de gallina, queque de naranja,
limonada frozen), comprimidas según `assets/img/LEEME.md`, **el lunes**.

**Por dónde empezar, Luis**

1. **Primero las cinco fotos**, porque hoy los productos de Carmen salen con
   el logo. Guárdalas en `assets/img/catalogos/` con estos nombres exactos:
   `empanadas-carne.jpg`, `alfajores-maicena.jpg`, `aji-de-gallina.jpg`,
   `queque-naranja.jpg` y `limonada-frozen.jpg`. Proporción 4:3, menos de
   300 KB cada una. Avisa a Piero cuando estén: él las conecta en `datos.js`.
2. En `js/registro.js` ya están `validarRegistro`, `validarSesion`,
   `limpiarFormulario` y `correoValido`, pasadas tal cual del Avance 1.
   `marcarError`, `limpiarCampo` y `mostrarResumen` ahora viven en `base.js`:
   no las copies.
3. Quita los dos `onsubmit` de `registro.html` y conecta los formularios con
   `addEventListener` y `evento.preventDefault()`.
4. Registro: cuando no haya errores, llama a
   `registrarSolicitud({ nombres, apellidos, correo, clave, telefono, torre, numeroDepartamento })`.
   Devuelve `{ ok, mensaje }`. Si `ok` es `false` es porque el correo ya
   existe: usa `marcarError` en el campo del correo con ese `mensaje`. Si es
   `true`, escribe el `mensaje` en `#aviso-registro` (ya dice que la cuenta
   queda pendiente).
5. Inicio de sesión: `iniciarSesion(correo, clave)` devuelve
   `{ ok, mensaje, residente }`. Si falla, muestra `mensaje` en
   `#aviso-sesion` (ya distingue datos incorrectos de cuenta pendiente). Si
   sale bien: `let volver = leerParametro("volver");` y rediriges a `volver`,
   o a `panel.html` si es `null`. El valor ya llega decodificado.
6. Borra el comentario de `registro.html` que dice que todavía no entra a
   ningún lado porque falta el servidor, y el checkbox "Recordar mi sesión"
   si no va a hacer nada.
7. Para probar que una cuenta pendiente no entra: `sofia.mendoza@kercado.pe`,
   clave `Kercado2026`.
8. `carrito.html`: hoy es solo el título. Copia de `componentes.html` la
   sección "Carrito" (grupo, línea, selector de cantidad y resumen) y la de
   "Lista vacía". Las líneas van dentro de un `<template>`.
9. `js/carrito.js` empieza con `if (!exigirSesion()) { return; }` dentro de
   tu función de inicio. Después `obtenerCarrito()`: cada línea trae
   `publicacion` y `subtotal` ya calculados. Para agrupar por vendedor, usa
   `linea.publicacion.idResidente`.
10. Cantidades con `cambiarCantidad(id, cantidad)`, quitar con
    `quitarDelCarrito(id)`. Después de cada cambio: volver a pintar,
    `totalCarrito()` y `actualizarContadorCarrito()`.
11. Vaciar: `pedirConfirmacion("¿Vaciar tu carrito?", "...", function () { vaciarCarrito(); ... })`.
12. Registrar: `registrarPedidos(metodo)` con `"Efectivo contra entrega"`,
    `"Yape"` o `"Plin"`, escritos exactamente así. Devuelve
    `{ ok, mensaje, pedidos }`; en `pedidos` está el `codigo` de cada uno
    para la pantalla de confirmación. El enlace a las compras es
    `panel.html#mis-compras`.

**Listo cuando:** Carmen entra y vuelve sola a la página de donde venía; con
una torta y una chicha en el carrito se ven dos grupos y al registrar salen
KC-0135 y KC-0136; el contador de la cabecera baja a cero.

---

### Edgar: inicio, publicar producto y documento

**`index.html` + `js/inicio.js`**
- Las secciones aparecen al hacer scroll (clase `.revelar`, con
  `IntersectionObserver`).
- "Lo más reciente": las cuatro últimas publicaciones, con el mismo
  `<template>` de tarjeta.
- Reglas de convivencia y una sección nueva de preguntas frecuentes en
  **acordeón** con `<details>` y `<summary>` (HTML nativo, accesible sin
  esfuerzo).
- Si hay sesión, el botón del hero cambia de "Ver el catálogo" a "Hola,
  Carmen, ve tu panel".

**`publicar.html` + `js/publicar.js`** (página nueva)
- Exige sesión.
- Formulario: título, descripción, categoría (`<select>` desde
  `listarCategorias()`), precio, stock, horario e imagen (`<select>` con las
  imágenes disponibles en `assets/img`, no subida de archivos: una foto en
  `localStorage` se come el espacio).
- Validación con `marcarError()` como el registro: precio mayor a 0, stock
  entero, título de al menos 5 letras.
- **Vista previa en vivo** a la derecha: una tarjeta del catálogo que se
  actualiza mientras se escribe.
- Al publicar: `crearPublicacion()`, aviso de éxito y enlace "Verla en el
  catálogo".

**Por dónde empezar, Edgar**

1. Abre `componentes.html` y mira "Tarjeta generada con template" y
   "Secciones que aparecen al bajar".
2. `index.html`, lo más reciente: copia el `<template id="plantilla-tarjeta">`
   dentro de `<main>`, agrega una sección con una `.grilla-productos` vacía y
   llénala con las cuatro primeras de `listarPublicaciones()`, que ya vienen
   ordenadas de la más nueva a la más antigua.
3. Aparecer al bajar: ponle la clase `revelar` a cada sección menos a la
   portada. En `js/inicio.js`, un `IntersectionObserver` le agrega
   `revelar--visible` cuando entra en pantalla. El CSS ya hace el movimiento
   y ya lo apaga para quien tiene las animaciones desactivadas.
4. Preguntas frecuentes: `<details>` y `<summary>` dentro de un `.caja`, no
   necesitan JavaScript.
5. Botón de la portada: `let residente = sesionActual();` y, si no es `null`,
   cambias el texto a "Hola, " + `residente.nombres` + ", ve tu panel" y el
   `href` a `panel.html`.
6. `publicar.html`: hoy es solo el título. Arma el formulario con las piezas
   de "Campos de formulario" de `componentes.html`, y al lado una tarjeta de
   vista previa.
7. `js/publicar.js` empieza con `if (!exigirSesion()) { return; }` dentro de
   tu función de inicio. El `<select>` de categorías se llena con
   `listarCategorias()` (cada una trae `idCategoria` y `nombre`).
8. El `<select>` de imagen ofrece las fotos que ya están en
   `assets/img/catalogos/`, con el valor igual a la ruta completa.
9. Valida con `marcarError` y `mostrarResumen`, igual que el registro. Para
   la vista previa escucha el evento `input` del formulario y reescribe la
   tarjeta con `textContent`.
10. Publicar:
    `crearPublicacion({ titulo, descripcion, precio, stock, horario, idCategoria, imagenes: [rutaElegida] })`.
    Devuelve la publicación creada, o `null` si algo no sirve. Con el
    `idPublicacion` que devuelve armas el enlace
    `producto.html?id=...` de "Verla en el catálogo".
11. El botón "Publicar producto" del panel ya lleva a tu página, y lo que se
    publica aparece primero en el catálogo y en la tabla del panel sin hacer
    nada más.

**Listo cuando:** Carmen publica un producto y sale primero en
`listarPublicaciones()`; el formulario vacío marca los errores en cada campo;
sin sesión, `publicar.html` manda al registro y después vuelve.

**Documento del Avance 2 (consolidación):** Edgar arma el documento y une las
partes; **cada uno escribe la descripción y las capturas de su propia
página** (ver "Documento"). Piero revisa la versión final el jueves.

> Si a Edgar el documento le parece mucho, se cambia con Luis: Luis se queda
> registro y documento, Edgar se lleva carrito. Pero se decide el lunes, no el
> miércoles.

---

## El documento del Avance 2

Se parte del documento del Avance 1 y se sigue el PFC de referencia que nos
dio el profesor, que tiene los capítulos de Implementación y Evaluación que
nos faltan.

**Correcciones obligatorias del Avance 1** (son contradicciones, el profesor
las puede marcar):
- 2.2.4, 2.2.5, 4.1 y 2.3.5.4 dicen que no se usa JavaScript o que ningún dato
  se conserva. Ahora se usa JavaScript y los datos se guardan en el navegador.
- La navegabilidad decía que el panel "no queda condicionado al inicio de
  sesión". Ahora el panel, el carrito y publicar exigen sesión.
- La figura 9 marcaba negocio y persistencia como "avances posteriores". Ahora
  la lógica (los `.js` de cada página) y la persistencia en el cliente
  (`almacen.js` sobre `localStorage`) están implementadas; la base de datos en
  servidor queda para el Avance 3.
- El anexo: capturas completas, sin la ruta `D:/VSCODE...` a la vista, y cada
  pie de figura junto a su imagen.

**Capítulos nuevos o ampliados:**
| Sección | Quién |
|---|---|
| 4.2 Capa de presentación: siete páginas, navegabilidad nueva con carrito y publicar | Edgar |
| 4.3 Capa de negocio: un `.js` por página y `base.js` | Piero |
| 4.4 Capa de persistencia: `almacen.js`, claves, relación con el diagrama de clases | Piero |
| 5 Implementación: tecnologías y descripción de cada página | cada uno la suya |
| 6 Evaluación: W3C, enlaces, Lighthouse, navegadores, resolución, pruebas funcionales | Francys y Luis, el jueves |
| 7 Conclusiones y recomendaciones | Edgar, con lo que aporte cada uno |

Las **recomendaciones** son una columna nueva en la hoja de evaluación.
Ejemplos que tienen sustento: pasar `almacen.js` a una base de datos en
servidor sin tocar las páginas, cifrar contraseñas (hoy están en texto plano
en el navegador, y hay que decirlo), implementar la zona de administración que
valida a los residentes pendientes, notificar al vendedor cuando le llega un
pedido.

---

## Cronograma

### Lunes 12
| Quién | Qué |
|---|---|
| Piero | `datos.js` + `almacen.js` en `main` al mediodía. Base completa en la noche |
| Los cuatro | Leer guías, probar la API en la consola |
| Francys, Luis, Edgar | Armar el HTML de sus páginas (estructura, `<template>`, formularios) con datos de mentira mientras llega la base |
| Luis | Las cinco imágenes de Carmen |
| Todos | Decidir si Edgar y Luis intercambian carrito y documento |

### Martes 13
| Quién | Qué |
|---|---|
| Cada uno | La lógica completa de su página contra `almacen.js` |
| Cierre del día | Cada página hace lo principal: el catálogo filtra, la ficha agrega, el carrito registra, el login entra, publicar crea, el panel muestra |

### Miércoles 14
| Quién | Qué |
|---|---|
| Cada uno | Detalles: estados vacíos, animaciones, teclado, móvil, mensajes de error |
| Piero | Primera pasada del guion de la demo completo, de punta a punta |
| Cada uno | Su parte del capítulo 5 del documento, con capturas |
| **Noche** | **Congelar el código.** Después de esto solo se corrigen errores |

### Jueves 15: no se escribe código nuevo
1. **Evaluación** (Francys y Luis): validador W3C de HTML y CSS de las siete
   páginas, Lighthouse en modo móvil (meta: 95 o más en accesibilidad), enlaces,
   prueba en Chrome, Edge y Firefox, resolución 1366 px, 768 px y 375 px.
   Capturas de todo para el capítulo 6.
2. **Comentarios**: revisar que cada `.js` y cada sección nueva del HTML estén
   comentados según la guía.
3. **Ensayo de la demo y del Inspector**, cada uno con su página.
4. Documento final, revisión de Piero y entrega.

---

## Guion de la demo (la historia que mostramos)

Antes de empezar: en la consola, `reiniciarDatos()`.

1. **Visitante** entra al inicio, escribe "torta" en el buscador: el catálogo
   muestra solo las tortas. Filtra por Bebidas con precio hasta S/ 7.50: queda
   solo la chicha morada.
2. Abre la torta de chocolate, cambia de foto en la galería, intenta agregarla
   al carrito: le pide iniciar sesión.
3. **Inicia sesión como Carmen**: vuelve sola a la ficha. Agrega 1 torta;
   agrega también una chicha morada. El contador de la cabecera cambia.
4. En el carrito ve dos grupos (María y Luis Castro), cambia cantidades, elige
   Yape, registra: salen **dos pedidos con dos códigos**.
5. En **Mis compras** aparecen como Pendiente.
6. Carmen **publica** un producto nuevo y aparece en el catálogo al instante.
7. Sale e **inicia sesión como María Torres**: en Mis ventas le llegó el pedido
   de Carmen. Lo pasa a Aceptado y luego a En preparación.
8. Vuelve a entrar como Carmen: su pedido ya dice En preparación.

Este recorrido demuestra la idea central del proyecto, que un mismo residente
compra y vende con una sola cuenta, y prueba todos los criterios de
interactividad en tres minutos.

---

## Checklist final contra la rúbrica del Avance 2

**HTML: estructura y semántica**
- [ ] Las siete páginas con `header`, `nav`, `main`, `footer`; `section`,
      `article`, `aside`, `figure` donde corresponde
- [ ] Un solo `h1` por página, títulos en orden
- [ ] Validador W3C sin errores en las siete

**HTML: accesibilidad**
- [ ] Enlace "Saltar al contenido" en todas las páginas
- [ ] `aria-current="page"` en el enlace activo
- [ ] `alt` en todas las imágenes, incluidas las generadas por JavaScript
- [ ] Todo el sitio se recorre con teclado y el foco siempre se ve
- [ ] Avisos con `aria-live`; botones de solo ícono con `aria-label`
- [ ] Header y footer idénticos en las siete páginas
- [ ] Ningún enlace muerto
- [ ] Lighthouse accesibilidad 95 o más

**CSS: diseño y estilo visual**
- [ ] Un solo `estilo.css`, cero `style=""`, cero hexadecimales fuera de `:root`
- [ ] Las siete páginas probadas a 1366, 768 y 375 px sin scroll horizontal
- [ ] Menú hamburguesa en móvil
- [ ] En móvil, el catálogo muestra productos sin tener que bajar por todo el
      aside

**CSS: técnicas avanzadas**
- [ ] Grid y flexbox (ya están)
- [ ] Transiciones en botones, tarjetas y enlaces (ya están)
- [ ] `@keyframes`: `aparecer`, `deslizar-entrada`, `latido`
- [ ] `prefers-reduced-motion` apaga las animaciones

**Interactividad y UX**
- [ ] Buscador de la cabecera funciona desde cualquier página
- [ ] Categorías, precio y texto filtran el catálogo
- [ ] La ficha muestra el producto elegido; la galería cambia de foto
- [ ] Agregar al carrito, cambiar cantidades, quitar, vaciar, registrar pedido
- [ ] Registro, inicio de sesión y cierre de sesión
- [ ] Publicar producto y dar de baja
- [ ] El vendedor cambia el estado de un pedido y el comprador lo ve
- [ ] Ningún botón muerto, ningún `alert()`, ningún mensaje de "falta el servidor"
- [ ] Consola sin errores en las siete páginas, también después de `reiniciarDatos()`

**Hoja de evaluación**
- [ ] Definición del problema y objetivos actualizados al Avance 2
- [ ] Casos de uso y clases coherentes con lo implementado
- [ ] Diseño y navegación con la figura nueva de navegabilidad
- [ ] Conclusiones **y recomendaciones**
