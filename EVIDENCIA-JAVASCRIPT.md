# Evidencia de JavaScript en Kercado

Cada punto del video de introducción a JavaScript, con el trozo de código del
proyecto donde lo usamos y la captura que hay que tomar en el sitio para
demostrar que funciona.

---

## 1. La consola del navegador (0:00)

Tenemos funciones globales que se pueden llamar a mano desde la consola, así
probamos el sitio sin tocar el código.

`js/almacen.js`

```js
function reiniciarDatos() {
  let claves = [];
  let i;

  ...

  sembrarDatos();
  return "los datos volvieron al inicio, recarga la página";
}
```

**Captura:** abrir `index.html`, pulsar F12, pestaña *Console*, escribir
`reiniciarDatos()` y después `listarPublicaciones().length`. Se tiene que ver
el comando escrito y su resultado, y la consola sin errores en rojo.

---

## 2. Tipos de datos (2:12)

En `js/datos.js` está cada tipo que menciona el video: texto, número, lista y
objeto. El precio es número y no texto justamente para poder sumarlo y
compararlo.

`js/datos.js`

```js
{
  idPublicacion: "PB-0001",                     // texto
  titulo: "Torta de Chocolate Casera",          // texto
  precio: 24.00,                                // número
  stock: 12,                                    // número
  imagenes: [                                   // lista
    "assets/img/catalogos/torta-chocolate.jpg",
    "assets/img/catalogos/torta-mini-1.jpg"
  ],
  idCategoria: "postres",
  estado: "Activa"
}
```

El booleano y el `null` también los usamos: `terminos` es `true` o `false`, y
las funciones que buscan algo devuelven `null` cuando no lo encuentran.

`js/registro.js` y `js/base.js`

```js
let terminos = document.getElementById("c-terminos").checked;   // booleano

function nombreCompleto(residente) {
  if (residente === null) {                                     // null
    return "Vecino del condominio";
  }
  return residente.nombres + " " + residente.apellidos;
}
```

**Captura:** en la consola de `catalogo.html`, escribir
`obtenerPublicacion("PB-0001")` y abrir el objeto que imprime la consola. Se
tienen que ver los campos con sus tipos (`titulo` en texto, `precio: 24`,
`imagenes` como `Array(5)`). Al lado, una captura de `obtenerPublicacion("X")`
devolviendo `null`.

---

## 3. Variables (4:00)

Usamos `let` para lo que cambia y `const` para los valores fijos, como dice
la guía de estilo del equipo.

`js/base.js`

```js
/* cuánto dura un aviso flotante en pantalla, en milisegundos */
const DURACION_AVISO = 4000;

/* el número que mostraba el contador del carrito, para saber si cambió */
let cantidadAnterior = -1;
```

`js/catalogo.js`

```js
function crearTarjeta(publicacion) {
  let molde = document.getElementById("plantilla-tarjeta");
  let tarjeta = molde.content.cloneNode(true);
  let vendedor = obtenerResidente(publicacion.idResidente);
  let enlace = "producto.html?id=" + publicacion.idPublicacion;
  ...
}
```

**Captura:** `catalogo.html` con una tarjeta de producto visible, mostrando
nombre del vendedor y torre/departamento: eso es lo que terminaron valiendo
las variables `vendedor` y `enlace`. Si se quiere mostrar el `const`, también
sirve la captura del aviso flotante del punto 6, que desaparece a los 4
segundos.

---

## 4. Operadores (4:36)

Operaciones matemáticas y comparaciones. El total del carrito es una suma, y
las validaciones son comparaciones.

`js/almacen.js`

```js
function totalCarrito() {
  let lineas = obtenerCarrito();
  let total = 0;
  let i;

  for (i = 0; i < lineas.length; i++) {
    total = total + lineas[i].subtotal;
  }

  return redondear(total);
}
```

`js/publicar.js`

```js
if (textoPrecio === "" || isNaN(precio) || precio <= 0) {
  marcarError("p-precio", "e-precio", "el precio tiene que ser mayor a 0");
  errores = errores + 1;
}
```

**Captura:** `carrito.html` con dos o tres productos y el total calculado
abajo (`S/ ...`); encima, cambiar una cantidad y volver a capturar para que se
vea que el total cambió solo. Para las comparaciones, `publicar.html` con un
precio `0` escrito y el mensaje "el precio tiene que ser mayor a 0" debajo del
campo.

---

## 5. Condicionales (5:28)

`if` / `else if` / `else` por todas las páginas. El más claro es el que decide
el color del estado de un pedido.

`js/base.js`

```js
function claseEstado(estado) {
  if (estado === "Aceptado") {
    return "estado estado--aceptado";
  }
  if (estado === "En preparación") {
    return "estado estado--preparacion";
  }
  if (estado === "Entregado" || estado === "Activa") {
    return "estado estado--entregado";
  }
  if (estado === "Cancelado" || estado === "Baja") {
    return "estado estado--cancelado";
  }
  return "estado estado--pendiente";
}
```

**Captura:** `panel.html` ya con sesión iniciada (`carmen.rojas@kercado.pe` /
`Kercado2026`), pestaña de pedidos, con varias etiquetas de estado de
distintos colores en la misma pantalla. Mejor todavía: cambiar un pedido de
"Pendiente" a "Aceptado" y capturar antes y después, porque la etiqueta cambia
de color sola.

---

## 6. Funciones (6:28)

Todo el sitio está hecho de funciones cortas con nombre en español. Dos que se
usan en todas las páginas:

`js/base.js`

```js
/* escribe un precio siempre igual, con S/ y dos decimales, 8 sale S/ 8.00 */
function formatearPrecio(numero) {
  return "S/ " + Number(numero).toFixed(2);
}

/* muestra un aviso flotante abajo a la derecha que se va solo, tipo es
   "ok" o "error", la caja de avisos tiene aria-live, por eso el lector de
   pantalla lo lee apenas aparece */
function mostrarAviso(texto, tipo) {
  let caja = document.getElementById("avisos");
  let aviso = document.createElement("p");

  if (tipo === "error") {
    aviso.className = "aviso-flotante aviso-flotante--error";
  } else {
    aviso.className = "aviso-flotante aviso-flotante--ok";
  }
  aviso.textContent = texto;
  caja.appendChild(aviso);

  setTimeout(function () {
    aviso.remove();
  }, DURACION_AVISO);
}
```

**Captura:** agregar un producto al carrito desde `producto.html` y capturar en
el mismo momento el aviso verde flotante de abajo a la derecha. En la misma
captura se ve `formatearPrecio()` trabajando en el precio del producto
(`S/ 24.00`, siempre con dos decimales).

---

## 7. Bucles (7:20)

`for` para recorrer listas. El del catálogo recorre las publicaciones
filtradas y pinta una tarjeta por cada una.

`js/catalogo.js`

```js
/* vacía la grilla y la vuelve a llenar con la lista filtrada, como la
   grilla tiene la clase animada, las tarjetas entran solas */
function pintarProductos(lista) {
  let grilla = document.getElementById("grilla-catalogo");
  let i;

  grilla.innerHTML = "";

  for (i = 0; i < lista.length; i++) {
    grilla.appendChild(crearTarjeta(lista[i]));
  }
}
```

Y en el carrito hay un `for` dentro de otro `for`, para juntar las líneas por
vendedor:

`js/carrito.js`

```js
for (i = 0; i < lineas.length; i++) {
  grupo = null;

  for (j = 0; j < grupos.length; j++) {
    if (grupos[j].idVendedor === lineas[i].publicacion.idResidente) {
      grupo = grupos[j];
    }
  }

  if (grupo === null) {
    grupo = { idVendedor: lineas[i].publicacion.idResidente, lineas: [] };
    grupos.push(grupo);
  }

  grupo.lineas.push(lineas[i]);
}
```

**Captura:** dos capturas de `catalogo.html`: una con todas las tarjetas y
otra filtrando por la categoría *Postres*, para que se vea que la grilla se
volvió a generar con menos elementos. Para el bucle anidado, `carrito.html`
con productos de dos vendedores distintos, mostrando los dos grupos separados
con su propio subtotal.

---

## 8. Objetos propios y "molde" para crear muchos (9:02)

El video usa `class` como plano para fabricar objetos. En este proyecto no
podemos usar clases de JavaScript: la restricción del curso y del equipo es
que todo se pueda explicar en la sustentación, así que el "molde" lo hacemos
con una función que recibe los datos del formulario y devuelve un objeto
`Publicacion` armado, con su id generado y sus valores por defecto. Es el
mismo plano del diagrama de clases del Avance 1, solo que escrito como
función.

`js/almacen.js`

```js
function crearPublicacion(datos) {
  let residente = sesionActual();
  let lista = leerLista("publicaciones");
  let precio = redondear(parseFloat(datos.precio));
  let stock = parseInt(datos.stock, 10);
  let titulo = String(datos.titulo || "").trim();
  let nueva;

  ...

  nueva = {
    idPublicacion: "PB-" + conCeros(siguienteNumero(lista, "idPublicacion"), 4),
    titulo: titulo,
    descripcion: String(datos.descripcion || "").trim(),
    precio: precio,
    stock: stock,
    horario: String(datos.horario || "").trim(),
    imagenes: imagenes,
    idCategoria: datos.idCategoria,
    idResidente: residente.idResidente,
    estado: "Activa",
    fechaPublicacion: fechaDeHoy()
  };

  lista.push(nueva);
  guardarClave("publicaciones", lista);
  return nueva;
}
```

Y así la llama la página al enviar el formulario:

`js/publicar.js`

```js
publicacion = crearPublicacion({
  titulo: document.getElementById("p-titulo").value,
  descripcion: document.getElementById("p-descripcion").value,
  ...
});
```

Cada objeto creado sale con los mismos campos, igual que si hubiera salido de
una clase.

**Captura:** tres capturas seguidas: (1) `publicar.html` con el formulario
lleno, (2) el bloque de confirmación con el enlace al producto nuevo, (3) la
ficha `producto.html` del producto recién creado, con su código `PB-00xx`
visible. Eso prueba que el objeto se armó y se guardó. Opcional, para la
sustentación: en la consola, `obtenerPublicacion("PB-00xx")` mostrando el
objeto completo con todos sus campos.

---

## Cómo tomar las capturas

Abrir las páginas con doble clic (`file://`), como se evalúa el proyecto. Si
hace falta empezar de cero, en la consola `reiniciarDatos()` y recargar. Para
los puntos que necesitan sesión, entrar con `carmen.rojas@kercado.pe` y clave
`Kercado2026`.
