/*
  hecho por piero. este archivo tiene lo que usan todas las páginas, arma
  la cabecera según si el vecino entró o no, mueve el contador del carrito,
  abre el menú en el celular y marca en qué página estamos, también deja
  listas las funciones que usan las demás páginas para mostrar precios,
  fechas, avisos y errores, así todo el sitio avisa de la misma forma
*/

/* cuánto dura un aviso flotante en pantalla, en milisegundos */
const DURACION_AVISO = 4000;

/* lo que hay que hacer si el vecino acepta el diálogo de confirmación */
let accionConfirmada = null;

/* el número que mostraba el contador del carrito, para saber si cambió */
let cantidadAnterior = -1;


/* funciones que usan las páginas */

/* escribe un precio siempre igual, con S/ y dos decimales, 8 sale S/ 8.00 */
function formatearPrecio(numero) {
  return "S/ " + Number(numero).toFixed(2);
}

/* pasa una fecha guardada como 2026-10-13T18:42:00 a 13/10/2026, la
   cortamos como texto para que no dependa de la zona horaria */
function formatearFecha(textoISO) {
  let partes = String(textoISO).substring(0, 10).split("-");

  return partes[2] + "/" + partes[1] + "/" + partes[0];
}

/* lee un valor de la dirección de la página, en producto.html?id=PB-0001
   leerParametro("id") devuelve PB-0001, si no está devuelve null */
function leerParametro(nombre) {
  let parametros = new URLSearchParams(window.location.search);

  return parametros.get(nombre);
}

/* el nombre y el apellido de un residente en un solo texto */
function nombreCompleto(residente) {
  if (residente === null) {
    return "Vecino del condominio";
  }

  return residente.nombres + " " + residente.apellidos;
}

/* la torre y el departamento como salen en todo el sitio */
function textoUnidad(residente) {
  if (residente === null) {
    return "";
  }

  return "Torre " + residente.torre + ", Dpto. " + residente.numeroDepartamento;
}

/* la clase de color que le toca a cada estado, sirve para los pedidos y
   también para las publicaciones */
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

/* abre el diálogo de confirmación con un título y una explicación, y
   guarda la función que se ejecuta solo si el vecino acepta, lo usamos
   antes de dar de baja, cancelar un pedido o vaciar el carrito */
function pedirConfirmacion(titulo, texto, alAceptar) {
  let dialogo = document.getElementById("confirmacion");

  document.getElementById("confirmacion-titulo").textContent = titulo;
  document.getElementById("confirmacion-texto").textContent = texto;
  accionConfirmada = alAceptar;

  /* limpiamos la respuesta de la vez anterior, si no, al cerrar con
     escape se quedaría con el sí de antes */
  dialogo.returnValue = "";
  dialogo.showModal();
}

/* las páginas que necesitan cuenta la llaman al empezar, si nadie entró
   manda al registro y le deja anotada la página para volver después */
function exigirSesion() {
  let partes;
  let pagina;

  if (sesionActual() !== null) {
    return true;
  }

  partes = window.location.pathname.split("/");
  pagina = partes[partes.length - 1] + window.location.search + window.location.hash;
  window.location.href = "registro.html?volver=" + encodeURIComponent(pagina);
  return false;
}

/* vuelve a contar el carrito y actualiza el globo de la cabecera, las
   páginas la llaman después de agregar, quitar o cambiar una cantidad */
function actualizarContadorCarrito() {
  let contador = document.getElementById("contador-carrito");
  let cantidad = cantidadEnCarrito();

  if (contador === null) {
    return;
  }

  contador.textContent = cantidad;
  contador.hidden = cantidad === 0;

  /* el globo late solo cuando el número cambió, no al cargar la página */
  if (cantidadAnterior !== -1 && cantidad !== cantidadAnterior) {
    contador.classList.add("contador--latido");
  }
  cantidadAnterior = cantidad;
}


/* los errores de los formularios

   cada campo tiene debajo un small vacío donde escribimos el error, y el
   campo se pinta de rojo para que se vea de una cuál es */

function marcarError(idCampo, idError, mensaje) {
  document.getElementById(idError).textContent = mensaje;
  document.getElementById(idCampo).classList.add("campo-malo");
}

function limpiarCampo(idCampo, idError) {
  document.getElementById(idError).textContent = "";
  document.getElementById(idCampo).classList.remove("campo-malo");
}

/* escribe arriba del formulario cuántos datos faltan corregir, cuando no
   falta ninguno deja un mensaje corto y cada página escribe el suyo */
function mostrarResumen(idResumen, errores) {
  let caja = document.getElementById(idResumen);

  if (errores === 0) {
    caja.className = "mensaje mensaje--ok";
    caja.textContent = "listo, tus datos están completos";
  } else if (errores === 1) {
    caja.className = "mensaje mensaje--error";
    caja.textContent = "falta corregir 1 dato, está marcado más abajo";
  } else {
    caja.className = "mensaje mensaje--error";
    caja.textContent = "faltan corregir " + errores + " datos, están marcados más abajo";
  }
}


/* lo que base.js hace solo en cada página */

/* el año del pie lo pone el navegador con la fecha del día, así no hay
   que cambiarlo cuando termine el año */
function escribirAnio() {
  let anio = document.getElementById("anio");

  if (anio !== null) {
    anio.textContent = new Date().getFullYear();
  }
}

/* arma la zona de la cuenta en la cabecera, si nadie entró se queda el
   botón ingresar que ya viene en el html, y si hay sesión lo cambiamos por
   el saludo y el botón para salir */
function pintarCuenta() {
  let zona = document.getElementById("cuenta");
  let residente = sesionActual();
  let saludo;
  let salir;

  if (zona === null || residente === null) {
    return;
  }

  saludo = document.createElement("span");
  saludo.className = "cuenta__saludo";
  saludo.textContent = "Hola, " + residente.nombres;

  salir = document.createElement("button");
  salir.type = "button";
  salir.className = "boton boton--claro boton--sm";
  salir.textContent = "Salir";
  salir.addEventListener("click", function () {
    cerrarSesion();
    window.location.href = "index.html";
  });

  zona.innerHTML = "";
  zona.appendChild(saludo);
  zona.appendChild(salir);
}

/* marca en el menú la página donde está el vecino, con la clase que la
   pinta de naranja y con aria-current para los lectores de pantalla, la
   ficha de un producto cuenta como catálogo y publicar como panel, porque
   desde ahí se llega */
function marcarPaginaActual() {
  let partes = window.location.pathname.split("/");
  let pagina = partes[partes.length - 1];
  let enlaces = document.querySelectorAll(".menu__enlace");
  let i;

  if (pagina === "") {
    pagina = "index.html";
  }
  if (pagina === "producto.html") {
    pagina = "catalogo.html";
  }
  if (pagina === "publicar.html") {
    pagina = "panel.html";
  }

  for (i = 0; i < enlaces.length; i++) {
    if (enlaces[i].getAttribute("href") === pagina) {
      enlaces[i].classList.add("menu__enlace--activo");
      enlaces[i].setAttribute("aria-current", "page");
    }
  }
}

/* si el vecino llegó al catálogo desde el buscador, dejamos escrito en
   el campo lo que buscó para que vea qué está filtrando */
function recordarBusqueda() {
  let campo = document.getElementById("q");
  let buscado = leerParametro("q");

  if (campo !== null && buscado !== null) {
    campo.value = buscado;
  }
}

/* el menú del celular, el botón lo abre y lo cierra, y aria-expanded le
   dice al lector de pantalla cómo quedó */
function cambiarMenu(abrir) {
  let boton = document.getElementById("menu-boton");
  let menu = document.getElementById("menu-principal");

  if (abrir) {
    menu.classList.add("menu--abierto");
    boton.setAttribute("aria-expanded", "true");
  } else {
    menu.classList.remove("menu--abierto");
    boton.setAttribute("aria-expanded", "false");
  }
}

function conectarMenu() {
  let boton = document.getElementById("menu-boton");

  if (boton === null) {
    return;
  }

  boton.addEventListener("click", function () {
    cambiarMenu(boton.getAttribute("aria-expanded") === "false");
  });

  /* con escape se cierra y el foco vuelve al botón, para que quien usa
     el teclado no se quede perdido */
  document.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape" && boton.getAttribute("aria-expanded") === "true") {
      cambiarMenu(false);
      boton.focus();
    }
  });
}

/* cuando el diálogo de confirmación se cierra revisamos qué botón se
   apretó, y solo si fue el de aceptar hacemos lo que estaba pendiente */
function conectarConfirmacion() {
  let dialogo = document.getElementById("confirmacion");

  if (dialogo === null) {
    return;
  }

  dialogo.addEventListener("close", function () {
    let accion = accionConfirmada;

    accionConfirmada = null;
    if (dialogo.returnValue === "si" && accion !== null) {
      accion();
    }
  });
}

/* cuando termina el latido del contador le quitamos la clase, así la
   próxima vez que cambie puede volver a latir */
function conectarContador() {
  let contador = document.getElementById("contador-carrito");

  if (contador === null) {
    return;
  }

  contador.addEventListener("animationend", function () {
    contador.classList.remove("contador--latido");
  });
}

function iniciarBase() {
  escribirAnio();
  pintarCuenta();
  marcarPaginaActual();
  recordarBusqueda();
  conectarMenu();
  conectarConfirmacion();
  conectarContador();
  actualizarContadorCarrito();
}

iniciarBase();
