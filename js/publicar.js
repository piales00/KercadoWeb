/*
  hecho por edgar. el javascript de publicar producto, llena los select de
  categoría y de foto, va cambiando la tarjeta de vista previa mientras el
  vecino escribe, revisa el formulario y guarda la publicación con
  crearPublicacion(), que la deja primera en el catálogo
*/

/* las fotos que el vecino puede elegir, son las que ya están en la
   carpeta del catálogo, el valor de cada opción es la ruta completa */
const FOTOS_DISPONIBLES = [
  { nombre: "Ají de gallina", ruta: "assets/img/catalogos/aji-de-gallina.jpg" },
  { nombre: "Alfajores", ruta: "assets/img/catalogos/alfajores-maicena.jpg" },
  { nombre: "Arroz en saco", ruta: "assets/img/catalogos/arroz-superior-BP-10Kg.jpg" },
  { nombre: "Camu camu", ruta: "assets/img/catalogos/camu-camu.jpg" },
  { nombre: "Chicha morada", ruta: "assets/img/catalogos/chicha-morada.jpg" },
  { nombre: "Empanadas", ruta: "assets/img/catalogos/empanadas-carne.jpg" },
  { nombre: "Galletas de chocolate", ruta: "assets/img/catalogos/galletas-chocolate.jpg" },
  { nombre: "Limonada", ruta: "assets/img/catalogos/limonada-frozen.jpg" },
  { nombre: "Lomo saltado", ruta: "assets/img/catalogos/lomo-saltado.jpg" },
  { nombre: "Pan", ruta: "assets/img/catalogos/pan-baguette.jpg" },
  { nombre: "Pollo a la brasa", ruta: "assets/img/catalogos/pollo-a-la-brasa-entero.jpg" },
  { nombre: "Queque", ruta: "assets/img/catalogos/queque-naranja.jpg" },
  { nombre: "Torta de chocolate", ruta: "assets/img/catalogos/torta-chocolate.jpg" },
  { nombre: "Torta tres leches", ruta: "assets/img/catalogos/torta-tresleches.jpg" },
  { nombre: "Otro producto (logo de Kercado)", ruta: "assets/img/kercado.png" }
];

/* los campos del formulario junto con el small donde sale su error */
const CAMPOS_PUBLICAR = [
  ["p-titulo", "e-titulo"],
  ["p-categoria", "e-categoria"],
  ["p-precio", "e-precio"],
  ["p-stock", "e-stock"],
  ["p-horario", "e-horario"],
  ["p-imagen", "e-imagen"],
  ["p-descripcion", "e-descripcion"]
];

/* agrega una opción a un select, el texto va con textContent */
function agregarOpcion(select, valor, texto) {
  let opcion = document.createElement("option");

  opcion.value = valor;
  opcion.textContent = texto;
  select.appendChild(opcion);
}

/* llena el select de categorías con las guardadas y el de fotos con la
   lista de arriba */
function llenarSelects() {
  let selectCategoria = document.getElementById("p-categoria");
  let selectImagen = document.getElementById("p-imagen");
  let categorias = listarCategorias();
  let i;

  for (i = 0; i < categorias.length; i++) {
    agregarOpcion(selectCategoria, categorias[i].idCategoria, categorias[i].nombre);
  }

  for (i = 0; i < FOTOS_DISPONIBLES.length; i++) {
    agregarOpcion(selectImagen, FOTOS_DISPONIBLES[i].ruta, FOTOS_DISPONIBLES[i].nombre);
  }
}

/* reescribe la tarjeta de vista previa con lo que hay en el formulario,
   si un campo está vacío deja un texto de ejemplo para que la tarjeta no
   quede en blanco */
function actualizarVistaPrevia() {
  let titulo = document.getElementById("p-titulo").value.trim();
  let precio = parseFloat(document.getElementById("p-precio").value);
  let selectCategoria = document.getElementById("p-categoria");
  let ruta = document.getElementById("p-imagen").value;
  let imagen = document.getElementById("prev-imagen");

  if (titulo === "") {
    titulo = "Nombre del producto";
  }
  document.getElementById("prev-titulo").textContent = titulo;

  if (isNaN(precio) || precio < 0) {
    precio = 0;
  }
  document.getElementById("prev-precio").textContent = formatearPrecio(precio);

  if (selectCategoria.value === "") {
    document.getElementById("prev-categoria").textContent = "Categoría";
  } else {
    document.getElementById("prev-categoria").textContent =
      selectCategoria.options[selectCategoria.selectedIndex].textContent;
  }

  if (ruta === "") {
    imagen.src = "assets/img/kercado.png";
    imagen.alt = "Foto de ejemplo para la vista previa";
  } else {
    imagen.src = ruta;
    imagen.alt = "Vista previa de " + titulo;
  }
}

/* revisa campo por campo y cuenta los errores, igual que el registro,
   devuelve cuántos encontró */
function validarPublicacion() {
  let titulo = document.getElementById("p-titulo").value.trim();
  let categoria = document.getElementById("p-categoria").value;
  let textoPrecio = document.getElementById("p-precio").value;
  let textoStock = document.getElementById("p-stock").value;
  let horario = document.getElementById("p-horario").value.trim();
  let imagen = document.getElementById("p-imagen").value;
  let descripcion = document.getElementById("p-descripcion").value.trim();
  let precio = parseFloat(textoPrecio);
  let stock = Number(textoStock);
  let errores = 0;
  let i;

  for (i = 0; i < CAMPOS_PUBLICAR.length; i++) {
    limpiarCampo(CAMPOS_PUBLICAR[i][0], CAMPOS_PUBLICAR[i][1]);
  }

  if (titulo.length < 5) {
    marcarError("p-titulo", "e-titulo", "el nombre necesita al menos 5 letras");
    errores = errores + 1;
  }

  if (categoria === "") {
    marcarError("p-categoria", "e-categoria", "elige en qué categoría sale tu producto");
    errores = errores + 1;
  }

  if (textoPrecio === "" || isNaN(precio) || precio <= 0) {
    marcarError("p-precio", "e-precio", "el precio tiene que ser mayor a 0");
    errores = errores + 1;
  }

  /* el stock tiene que ser un número entero, no se venden media torta */
  if (textoStock === "" || !Number.isInteger(stock) || stock < 1) {
    marcarError("p-stock", "e-stock", "escribe cuántas unidades tienes, un número entero desde 1");
    errores = errores + 1;
  }

  if (horario === "") {
    marcarError("p-horario", "e-horario", "escribe en qué horario entregas");
    errores = errores + 1;
  }

  if (imagen === "") {
    marcarError("p-imagen", "e-imagen", "elige la foto que más se parezca a tu producto");
    errores = errores + 1;
  }

  if (descripcion === "") {
    marcarError("p-descripcion", "e-descripcion", "cuéntales a tus vecinos cómo es tu producto");
    errores = errores + 1;
  }

  mostrarResumen("aviso-publicar", errores);
  return errores;
}

/* al enviar, si no hay errores guardamos la publicación y cambiamos el
   formulario por el bloque con el enlace a la ficha nueva */
function alPublicar(evento) {
  let publicacion;
  let enlace;

  evento.preventDefault();

  if (validarPublicacion() > 0) {
    document.getElementById("aviso-publicar").scrollIntoView({ block: "center" });
    return;
  }

  publicacion = crearPublicacion({
    titulo: document.getElementById("p-titulo").value,
    descripcion: document.getElementById("p-descripcion").value,
    precio: document.getElementById("p-precio").value,
    stock: document.getElementById("p-stock").value,
    horario: document.getElementById("p-horario").value,
    idCategoria: document.getElementById("p-categoria").value,
    imagenes: [document.getElementById("p-imagen").value]
  });

  if (publicacion === null) {
    mostrarAviso("no pudimos guardar tu publicación, revisa los datos e inténtalo otra vez", "error");
    return;
  }

  enlace = document.getElementById("publicado-enlace");
  enlace.href = "producto.html?id=" + publicacion.idPublicacion;
  document.getElementById("publicado-texto").textContent =
    "Tus vecinos ya ven " + publicacion.titulo + " en el catálogo, con el código " +
    publicacion.idPublicacion + ".";

  document.querySelector(".layout-publicar").hidden = true;
  document.getElementById("publicado").hidden = false;
  enlace.focus();
  mostrarAviso("publicaste " + publicacion.titulo, "ok");
}

/* aquí arranca la página, sin sesión exigirSesion manda al registro y
   anota que vuelva aquí después de entrar */
function iniciarPublicar() {
  let residente;
  let formulario;

  if (!exigirSesion()) {
    return;
  }

  residente = sesionActual();
  document.getElementById("prev-vendedor").textContent = nombreCompleto(residente);
  document.getElementById("prev-unidad").textContent = textoUnidad(residente);

  llenarSelects();

  formulario = document.getElementById("form-publicar");
  formulario.addEventListener("input", actualizarVistaPrevia);
  formulario.addEventListener("change", actualizarVistaPrevia);
  formulario.addEventListener("submit", alPublicar);
}

iniciarPublicar();
