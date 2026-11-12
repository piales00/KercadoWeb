/*
  hecho por piero. este archivo tiene lo que usan todas las páginas en el
  navegador, desde este avance los datos los trae php, así que aquí solo
  queda la interfaz, los avisos, el diálogo de confirmación, el menú del
  celular, los errores de los formularios y el chat de ayuda
*/

/* cuánto dura un aviso flotante en pantalla, en milisegundos */
const DURACION_AVISO = 4000;

/* lo que hay que hacer si el vecino acepta el diálogo de confirmación */
let accionConfirmada = null;


/* funciones que usan las páginas */

/* escribe un precio siempre igual, con S/ y dos decimales, 8 sale S/ 8.00 */
function formatearPrecio(numero) {
  return "S/ " + Number(numero).toFixed(2);
}

/* pasa una fecha como 2026-10-13 18:42:00 a 13/10/2026, la cortamos como
   texto para que no dependa de la zona horaria */
function formatearFecha(textoISO) {
  let partes = String(textoISO).substring(0, 10).split("-");

  return partes[2] + "/" + partes[1] + "/" + partes[0];
}

/* lee un valor de la dirección de la página, en producto.php?id=3
   leerParametro("id") devuelve 3, si no está devuelve null */
function leerParametro(nombre) {
  let parametros = new URLSearchParams(window.location.search);

  return parametros.get(nombre);
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
   guarda la función que se ejecuta solo si el vecino acepta */
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


/* los errores de los formularios

   cada campo tiene debajo un small donde escribimos el error, y el campo
   se pinta de rojo para que se vea de una cuál es */

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

/* todo formulario con data-confirmar pregunta antes de enviarse, así las
   páginas no tienen que escribir javascript para confirmar, form.submit()
   envía sin volver a pasar por este evento, por eso no se repite la pregunta */
function conectarFormulariosConConfirmacion() {
  let formularios = document.querySelectorAll("form[data-confirmar]");
  let i;

  for (i = 0; i < formularios.length; i++) {
    formularios[i].addEventListener("submit", function (evento) {
      let formulario = evento.currentTarget;
      let titulo = formulario.dataset.titulo || "Confirmar";

      evento.preventDefault();
      pedirConfirmacion(titulo, formulario.dataset.confirmar, function () {
        formulario.submit();
      });
    });
  }
}

/* los avisos que imprimió php al cargar la página también se van solos,
   igual que los de mostrarAviso() */
function quitarAvisosDelServidor() {
  let avisos = document.querySelectorAll("#avisos .aviso-flotante");

  setTimeout(function () {
    let i;

    for (i = 0; i < avisos.length; i++) {
      avisos[i].remove();
    }
  }, DURACION_AVISO);
}


/* el chat de ayuda

   no es una persona ni usa internet, busca palabras clave en la pregunta
   y contesta con lo que dice el reglamento de kercado */

function responderPregunta(pregunta) {
  let texto = pregunta.toLowerCase();

  if (texto.indexOf("contraseña") !== -1 || texto.indexOf("clave") !== -1) {
    return "Si olvidaste tu contraseña, acércate a la oficina de administración en la Torre A, ellos la restablecen después de confirmar que eres tú.";
  }
  if (texto.indexOf("cuenta") !== -1 || texto.indexOf("validar") !== -1 || texto.indexOf("valido") !== -1 || texto.indexOf("pendiente") !== -1) {
    return "Al registrarte tu cuenta queda pendiente, la administración revisa que vivas en el condominio y la activa, después ya puedes comprar y vender.";
  }
  if (texto.indexOf("pago") !== -1 || texto.indexOf("pagar") !== -1 || texto.indexOf("yape") !== -1 || texto.indexOf("plin") !== -1 || texto.indexOf("efectivo") !== -1) {
    return "Kercado no cobra nada, al confirmar el pedido eliges cómo le pagas al vecino, en efectivo contra entrega, por Yape o por Plin, y lo arreglan entre ustedes.";
  }
  if (texto.indexOf("entrega") !== -1 || texto.indexOf("delivery") !== -1 || texto.indexOf("envío") !== -1 || texto.indexOf("envio") !== -1) {
    return "Kercado no hace entregas, el vecino que vende te avisa cuando está listo y coordinan dentro del condominio, el horario de entrega sale en cada producto.";
  }
  if (texto.indexOf("vend") !== -1 || texto.indexOf("public") !== -1) {
    return "Con tu misma cuenta entra a Mi panel y elige publicar producto, pon la foto, el precio y el stock, los pedidos que te hagan aparecen en Mis ventas.";
  }
  if (texto.indexOf("compr") !== -1) {
    return "Busca en el catálogo, agrega lo que quieras al carrito y confirma el pedido eligiendo cómo vas a pagar, cada vendedor recibe su propio pedido.";
  }
  return "No encontré una respuesta para eso, prueba con palabras como comprar, vender, pago, entrega o cuenta, o escríbele a la administración del condominio.";
}

/* agrega una burbuja al chat, con textContent porque lo que escribe el
   vecino nunca se pinta como html */
function agregarMensajeChat(texto, quien) {
  let mensajes = document.getElementById("chat-mensajes");
  let burbuja = document.createElement("p");

  burbuja.className = "chat__mensaje chat__mensaje--" + quien;
  burbuja.textContent = texto;
  mensajes.appendChild(burbuja);
  mensajes.scrollTop = mensajes.scrollHeight;
}

function preguntarAlChat(pregunta) {
  agregarMensajeChat(pregunta, "vecino");
  agregarMensajeChat(responderPregunta(pregunta), "asistente");
}

function cambiarChat(abrir) {
  let boton = document.getElementById("chat-boton");
  let panel = document.getElementById("chat-panel");

  panel.hidden = !abrir;
  boton.setAttribute("aria-expanded", String(abrir));

  if (abrir) {
    document.getElementById("chat-campo").focus();
  }
}

function conectarChat() {
  let boton = document.getElementById("chat-boton");
  let preguntas = document.querySelectorAll(".chat__pregunta");
  let i;

  if (boton === null) {
    return;
  }

  boton.addEventListener("click", function () {
    cambiarChat(boton.getAttribute("aria-expanded") === "false");
  });

  document.getElementById("chat-cerrar").addEventListener("click", function () {
    cambiarChat(false);
    boton.focus();
  });

  for (i = 0; i < preguntas.length; i++) {
    preguntas[i].addEventListener("click", function (evento) {
      preguntarAlChat(evento.currentTarget.dataset.pregunta);
    });
  }

  document.getElementById("chat-formulario").addEventListener("submit", function (evento) {
    let campo = document.getElementById("chat-campo");
    let pregunta = campo.value.trim();

    evento.preventDefault();
    if (pregunta === "") {
      return;
    }
    preguntarAlChat(pregunta);
    campo.value = "";
  });

  /* con escape se cierra y el foco vuelve al botón, igual que el menú */
  document.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape" && boton.getAttribute("aria-expanded") === "true") {
      cambiarChat(false);
      boton.focus();
    }
  });
}

function iniciarBase() {
  escribirAnio();
  conectarMenu();
  conectarConfirmacion();
  conectarFormulariosConConfirmacion();
  quitarAvisosDelServidor();
  conectarChat();
}

iniciarBase();
