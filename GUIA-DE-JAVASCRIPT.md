# Guía de JavaScript: Kercado, Avance 2

Esta guía es para los cuatro. Explica cómo escribir el JavaScript de tu página
para que el sitio parezca hecho por una sola persona y para que puedas
defenderlo frente al profesor. Léela completa antes de escribir tu primera
línea. Son quince minutos.

El contrato con todos los nombres de funciones y datos está en
`BASE-AVANCE2.md`. Esta guía explica **cómo** usarlo.

---

## 1. La regla de oro

**Tu página nunca toca `localStorage`.** Le pide las cosas a `almacen.js`:

```js
// mal: cada uno inventa su propia clave y su propio formato
let productos = JSON.parse(localStorage.getItem("productos"));

// bien: se lo pedimos a la capa de datos
let productos = listarPublicaciones({ idCategoria: "postres" });
```

Por qué importa: en el documento decimos que el sitio tiene una arquitectura
de tres capas. La página es la presentación, tu `.js` es la lógica, y
`almacen.js` es la persistencia. Si tu página toca `localStorage`, rompes eso,
y cuando en el Avance 3 cambiemos a una base de datos habría que reescribir tu
página. Con la regla, solo cambia `almacen.js`.

---

## 2. Qué archivos tocas y cuáles no

| Puedes editar | No toques nunca |
|---|---|
| Tu `.html`, solo dentro de `<main>` | `css/estilo.css` |
| Tu `js/<tu-pagina>.js` | `js/datos.js`, `js/almacen.js`, `js/base.js` |
| | El `<header>` y el `<footer>` |
| | El `.html` o el `.js` de otro |

Si necesitas una función que no existe en `almacen.js` o `base.js`, o una clase
de CSS que no está, **avisas en el grupo** y Piero la agrega una sola vez.

---

## 3. Cómo se escribe

Seguimos el mismo estilo de `kercado.js` del Avance 1, que es el que ya
conocen todos:

- `let` para las variables. `const` solo para valores que nunca cambian, como
  una lista fija. Nada de `var`.
- Funciones con `function nombre() {}`, con nombres en español que digan lo que
  hacen: `pintarTarjetas`, `aplicarFiltros`, `actualizarTotal`.
- `document.getElementById` y `document.querySelector`. Nada de librerías.
- Comillas dobles para los textos.
- Precios **siempre** con `formatearPrecio(numero)`. Nunca armes `"S/ " + precio`
  a mano, porque un día sale `S/ 8` y otro `S/ 12.50`.

### Los eventos van en el `.js`, no en el HTML

```html
<!-- mal: la conducta mezclada con la estructura -->
<form onsubmit="return validarRegistro()">

<!-- bien: el HTML solo tiene un id -->
<form id="form-registro">
```

```js
document.getElementById("form-registro").addEventListener("submit", function (evento) {
  evento.preventDefault();
  validarRegistro();
});
```

Así HTML, CSS y JavaScript quedan separados, que es justo lo que el documento
dice en la sección de diseño.

### Cada página arranca con una función

Al final de tu archivo, una sola llamada que pone todo en marcha:

```js
function iniciarCatalogo() {
  pintarCategorias();
  leerFiltrosDeLaUrl();
  aplicarFiltros();
  conectarEventos();
}

iniciarCatalogo();
```

Como los scripts están al final del `<body>`, el HTML ya existe cuando esto
corre. No hace falta esperar ningún evento.

---

## 4. Cómo se pintan cosas en la página

### Para listas de cosas: `<template>`

Las tarjetas del catálogo, las líneas del carrito y las filas de las tablas se
generan desde los datos. No se escribe HTML dentro de cadenas de texto. Se usa
un `<template>` en el HTML y se clona:

```html
<template id="plantilla-tarjeta">
  <article class="tarjeta">
    <figure class="tarjeta__figura">
      <img class="tarjeta__imagen" src="" alt="">
    </figure>
    <div class="tarjeta__cuerpo">
      <span class="etiqueta"></span>
      <h3 class="tarjeta__titulo"><a href=""></a></h3>
      <p class="tarjeta__vendedor mb-0"></p>
    </div>
    <div class="tarjeta__pie">
      <span class="tarjeta__precio"></span>
      <a class="boton boton--sm" href="">Ver</a>
    </div>
  </article>
</template>
```

```js
function crearTarjeta(publicacion) {
  let molde = document.getElementById("plantilla-tarjeta");
  let tarjeta = molde.content.cloneNode(true);
  let vendedor = obtenerResidente(publicacion.idResidente);

  tarjeta.querySelector(".tarjeta__imagen").src = publicacion.imagenes[0];
  tarjeta.querySelector(".tarjeta__imagen").alt = publicacion.titulo;
  tarjeta.querySelector(".tarjeta__titulo a").textContent = publicacion.titulo;
  tarjeta.querySelector(".tarjeta__precio").textContent = formatearPrecio(publicacion.precio);
  tarjeta.querySelector(".tarjeta__titulo a").href = "producto.html?id=" + publicacion.idPublicacion;
  tarjeta.querySelector(".tarjeta__pie a").href = "producto.html?id=" + publicacion.idPublicacion;
  // ...
  return tarjeta;
}
```

Las clases son **las mismas del Avance 1**, así que el CSS no cambia y la
tarjeta se ve igual que antes.

### `textContent`, no `innerHTML`, para lo que escribe el usuario

Si un vecino publica un producto llamado `<b>Torta</b>` y tú lo pintas con
`innerHTML`, el navegador lo interpreta como HTML. Con un `<script>` adentro,
eso es un agujero de seguridad. Regla: **todo lo que viene de un dato va con
`textContent`**. `innerHTML` solo para vaciar un contenedor (`caja.innerHTML = ""`).

Es una pregunta probable en la sustentación, y es fácil de responder si lo
hiciste bien.

---

## 5. Avisos y errores: todos igual

- **Al usuario se le avisa con `mostrarAviso(texto, "ok")` o `"error"`.** Nada de
  `alert()`: bloquea la página y se ve amateur.
- **Para confirmar algo destructivo** (vaciar el carrito, dar de baja, cancelar
  un pedido) se usa `pedirConfirmacion(titulo, texto, funcion)`, no
  `confirm()`. Abre el `<dialog>` que ya viene en todas las páginas, y la
  función que le pasas solo se ejecuta si el vecino acepta.
- **Los errores de un formulario** van debajo de cada campo con
  `marcarError(idCampo, idError, mensaje)`, como ya hace el registro.
- **Lista vacía:** si un filtro no encuentra nada o el carrito está vacío, se
  muestra el bloque `.vacio` con un mensaje y un botón. Nunca dejes la página
  en blanco.
- Los textos de los avisos, en minúscula y como se habla, igual que en el
  Avance 1: "agregaste 2 tortas a tu carrito", no "PRODUCTO AGREGADO".

Y lo más importante: **ningún botón muerto, ningún mensaje que diga "esto
funcionará cuando haya servidor"**. Si algo no lo vamos a hacer en este avance,
el botón no se pone.

---

## 6. Accesibilidad que se espera en tu página

- Todo lo que se puede hacer con el mouse se puede hacer con el teclado (Tab,
  Enter, Espacio). Si usas un `<button>` de verdad, ya viene resuelto. **Nunca
  pongas un `click` en un `<div>`.**
- Si cambias el contenido de la página (filtras, agregas al carrito), avísalo
  con `mostrarAviso`, que el lector de pantalla lee en voz alta.
- Las imágenes que generas desde JavaScript también llevan `alt`, con el título
  del producto.
- Los botones que solo tienen un símbolo (el más y el menos de la cantidad, la
  X para quitar) llevan `aria-label`: `aria-label="quitar Torta de chocolate del carrito"`.

---

## 7. Comentarios

Mismas reglas que `GUIA-DE-COMENTARIOS.md`: en minúscula, como si se lo
explicaras al profesor, contando qué hace esa parte y por qué la hicimos así.
Un comentario corto encima de cada función basta.

```js
// bien
// pinta las tarjetas de los productos que pasaron el filtro, si no queda
// ninguno muestra el mensaje de que no hay resultados
function pintarTarjetas(publicaciones) {

// mal
// FUNCION PINTAR TARJETAS
function pintarTarjetas(publicaciones) {
```

---

## 8. Antes de hacer push

1. Abre tu página con doble clic, no con Live Server. Así la va a abrir el
   profesor.
2. F12, pestaña Consola: **cero errores en rojo**.
3. Prueba tu página a 375 px de ancho (el ícono del celular en F12).
4. Recórrela solo con el teclado.
5. En la consola escribe `reiniciarDatos()`, recarga y prueba todo otra vez
   desde cero. Muchos errores solo aparecen con los datos limpios.
6. `git pull` antes de `git push`.

---

## 9. Lo que vas a tener que mostrar en el Inspector

Prepárate para responder esto sobre **tu** página:

1. Abre la pestaña **Application → Local Storage** y muestra dónde se guardan
   los datos que tu página lee o escribe. Explica por qué tu página no los lee
   directamente.
2. En la **Consola**, llama a una función de `almacen.js` que tu página use,
   por ejemplo `listarPublicaciones({ idCategoria: "bebidas" })`, y explica lo
   que devuelve.
3. Muestra en tu `.js` dónde conectas un evento con `addEventListener` y qué
   pasa cuando se dispara.
4. Muestra un elemento que generaste desde un `<template>` y explica por qué
   no escribiste ese HTML a mano.
5. Abre el modo responsive y muestra que tu página funciona en el celular.
