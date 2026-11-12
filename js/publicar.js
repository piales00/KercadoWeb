/*
  hecho por edgar. el javascript de publicar producto, va cambiando la
  tarjeta de vista previa mientras el vecino escribe, le muestra la foto
  que eligió antes de subirla y revisa el formulario antes de enviarlo, php
  lo vuelve a revisar todo al recibirlo porque el javascript se puede saltar
*/

/* los tipos de foto que acepta el servidor y el tamaño máximo, 2 MB */
const TIPOS_DE_FOTO = ["image/jpeg", "image/png", "image/webp"];
const TAMANO_MAXIMO_FOTO = 2 * 1024 * 1024;

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

/* la dirección temporal de la foto elegida, la guardamos para soltarla
   cuando el vecino elige otra y no llenar la memoria */
let urlVistaPrevia = "";

/* reescribe la tarjeta de vista previa con lo que hay en el formulario,
   si un campo está vacío deja un texto de ejemplo para que la tarjeta no
   quede en blanco */
function actualizarVistaPrevia() {
  let titulo = document.getElementById("p-titulo").value.trim();
  let precio = parseFloat(document.getElementById("p-precio").value);
  let selectCategoria = document.getElementById("p-categoria");
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

  if (urlVistaPrevia !== "") {
    imagen.alt = "Vista previa de " + titulo;
  }
}

/* revisa la foto elegida, devuelve el texto del error o "" si sirve, el
   tipo y el tamaño los da el navegador sin subir nada */
function errorDeFoto(archivo) {
  if (archivo === undefined) {
    return "sube una foto de tu producto";
  }
  if (TIPOS_DE_FOTO.indexOf(archivo.type) === -1) {
    return "la foto tiene que ser JPG, PNG o WEBP";
  }
  if (archivo.size > TAMANO_MAXIMO_FOTO) {
    return "la foto pesa más de 2 MB, elige una más liviana";
  }
  return "";
}

/* cuando el vecino elige una foto la mostramos en la tarjeta con
   URL.createObjectURL, que crea una dirección temporal sin subir nada */
function alElegirFoto() {
  let archivo = document.getElementById("p-imagen").files[0];
  let imagen = document.getElementById("prev-imagen");
  let error = errorDeFoto(archivo);

  if (urlVistaPrevia !== "") {
    URL.revokeObjectURL(urlVistaPrevia);
    urlVistaPrevia = "";
  }

  if (error !== "") {
    marcarError("p-imagen", "e-imagen", error);
    imagen.src = "assets/img/kercado.png";
    imagen.alt = "Foto de ejemplo para la vista previa";
    return;
  }

  limpiarCampo("p-imagen", "e-imagen");
  urlVistaPrevia = URL.createObjectURL(archivo);
  imagen.src = urlVistaPrevia;
  actualizarVistaPrevia();
}

/* revisa campo por campo con las mismas reglas que publicar.php y cuenta
   los errores, devuelve cuántos encontró */
function validarPublicacion() {
  let titulo = document.getElementById("p-titulo").value.trim();
  let categoria = document.getElementById("p-categoria").value;
  let textoPrecio = document.getElementById("p-precio").value;
  let textoStock = document.getElementById("p-stock").value;
  let horario = document.getElementById("p-horario").value.trim();
  let archivo = document.getElementById("p-imagen").files[0];
  let descripcion = document.getElementById("p-descripcion").value.trim();
  let precio = parseFloat(textoPrecio);
  let stock = Number(textoStock);
  let errorFoto = errorDeFoto(archivo);
  let errores = 0;
  let i;

  for (i = 0; i < CAMPOS_PUBLICAR.length; i++) {
    limpiarCampo(CAMPOS_PUBLICAR[i][0], CAMPOS_PUBLICAR[i][1]);
    document.getElementById(CAMPOS_PUBLICAR[i][0]).removeAttribute("aria-invalid");
  }

  if (titulo.length < 3 || titulo.length > 80) {
    marcarError("p-titulo", "e-titulo", "el nombre tiene que tener entre 3 y 80 letras");
    errores = errores + 1;
  }

  if (categoria === "") {
    marcarError("p-categoria", "e-categoria", "elige en qué categoría sale tu producto");
    errores = errores + 1;
  }

  if (textoPrecio === "" || isNaN(precio) || precio <= 0 || precio > 9999) {
    marcarError("p-precio", "e-precio", "el precio tiene que ser mayor a 0 y hasta S/ 9999");
    errores = errores + 1;
  }

  /* el stock tiene que ser un número entero, no se venden media torta */
  if (textoStock === "" || !Number.isInteger(stock) || stock < 1 || stock > 999) {
    marcarError("p-stock", "e-stock", "escribe cuántas unidades tienes, un número entero de 1 a 999");
    errores = errores + 1;
  }

  if (horario === "" || horario.length > 40) {
    marcarError("p-horario", "e-horario", "escribe en qué horario entregas, hasta 40 letras");
    errores = errores + 1;
  }

  if (errorFoto !== "") {
    marcarError("p-imagen", "e-imagen", errorFoto);
    errores = errores + 1;
  }

  if (descripcion.length < 10 || descripcion.length > 500) {
    marcarError("p-descripcion", "e-descripcion", "la descripción tiene que tener entre 10 y 500 letras");
    errores = errores + 1;
  }

  /* los campos con error quedan marcados también para el lector de pantalla */
  for (i = 0; i < CAMPOS_PUBLICAR.length; i++) {
    if (document.getElementById(CAMPOS_PUBLICAR[i][1]).textContent !== "") {
      document.getElementById(CAMPOS_PUBLICAR[i][0]).setAttribute("aria-invalid", "true");
    }
  }

  mostrarResumen("aviso-publicar", errores);
  return errores;
}

/* si hay errores no dejamos que el formulario salga, si no los hay el
   navegador lo envía normal y php hace el resto */
function alPublicar(evento) {
  if (validarPublicacion() > 0) {
    evento.preventDefault();
    document.getElementById("aviso-publicar").scrollIntoView({ block: "center" });
  }
}

function iniciarPublicar() {
  let formulario = document.getElementById("form-publicar");

  formulario.addEventListener("input", actualizarVistaPrevia);
  formulario.addEventListener("change", actualizarVistaPrevia);
  document.getElementById("p-imagen").addEventListener("change", alElegirFoto);
  formulario.addEventListener("submit", alPublicar);

  /* si php devolvió el formulario con errores, la tarjeta ya muestra lo
     que el vecino había escrito */
  actualizarVistaPrevia();
}

iniciarPublicar();
