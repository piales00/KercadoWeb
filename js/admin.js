/*
  hecho por piero. este es el javascript de la administración, cambia de
  pestaña sin recargar la página y revisa el formulario de la categoría
  nueva antes de enviarlo, las tablas ya las arma php, así que si el
  javascript no carga la página sigue funcionando con los enlaces
*/

/* los nombres de las pestañas en el mismo orden en que se ven */
const PESTANAS = ["residentes", "publicaciones", "pedidos", "categorias"];

/* la pestaña que está a la vista, al empezar la leemos de la página porque
   php ya marcó la que pedía la dirección */
let pestanaActual = "residentes";


/* las pestañas */

/* muestra una pestaña y esconde las demás, la que no está elegida sale del
   recorrido del tab, como piden las pautas de accesibilidad, y se llega a
   ella con las flechas */
function mostrarPestana(nombre) {
  let boton;
  let panel;
  let i;

  for (i = 0; i < PESTANAS.length; i++) {
    boton = document.getElementById("pestana-" + PESTANAS[i]);
    panel = document.getElementById("parte-" + PESTANAS[i]);

    if (PESTANAS[i] === nombre) {
      boton.setAttribute("aria-selected", "true");
      boton.tabIndex = 0;
      panel.hidden = false;
    } else {
      boton.setAttribute("aria-selected", "false");
      boton.tabIndex = -1;
      panel.hidden = true;
    }
  }

  pestanaActual = nombre;
}

/* cambia de pestaña y lo anota en la dirección con replaceState, así al
   recargar se abre la misma y no se llena el historial del navegador */
function elegirPestana(nombre) {
  mostrarPestana(nombre);
  history.replaceState(null, "", "admin.php?pestana=" + nombre);
  document.getElementById("pestana-" + nombre).focus();
}

/* busca cuál pestaña dejó marcada php al pintar la página */
function pestanaElegidaAlCargar() {
  let i;

  for (i = 0; i < PESTANAS.length; i++) {
    if (document.getElementById("pestana-" + PESTANAS[i]).getAttribute("aria-selected") === "true") {
      return PESTANAS[i];
    }
  }
  return "residentes";
}

/* las pestañas son enlaces, aquí evitamos que recarguen la página y en su
   lugar mostramos la parte que toca */
function conectarPestana(nombre) {
  document.getElementById("pestana-" + nombre).addEventListener("click", function (evento) {
    evento.preventDefault();
    elegirPestana(nombre);
  });
}

function conectarPestanas() {
  let i;

  pestanaActual = pestanaElegidaAlCargar();

  for (i = 0; i < PESTANAS.length; i++) {
    conectarPestana(PESTANAS[i]);
  }

  /* con las flechas se pasa a la pestaña de al lado, al llegar al final
     vuelve a la primera, y con inicio y fin se va a los extremos */
  document.querySelector(".pestanas").addEventListener("keydown", function (evento) {
    let posicion = PESTANAS.indexOf(pestanaActual);

    if (evento.key === "ArrowRight") {
      evento.preventDefault();
      elegirPestana(PESTANAS[(posicion + 1) % PESTANAS.length]);
    } else if (evento.key === "ArrowLeft") {
      evento.preventDefault();
      elegirPestana(PESTANAS[(posicion - 1 + PESTANAS.length) % PESTANAS.length]);
    } else if (evento.key === "Home") {
      evento.preventDefault();
      elegirPestana(PESTANAS[0]);
    } else if (evento.key === "End") {
      evento.preventDefault();
      elegirPestana(PESTANAS[PESTANAS.length - 1]);
    }
  });
}


/* el formulario de la categoría nueva */

/* revisa el código y el nombre antes de enviar, php lo vuelve a revisar
   igual porque el javascript se puede saltar */
function validarCategoriaNueva() {
  let codigo = document.getElementById("nueva-id").value.trim();
  let nombre = document.getElementById("nueva-nombre").value.trim();
  let correcto = true;

  limpiarCampo("nueva-id", "e-nueva-id");
  limpiarCampo("nueva-nombre", "e-nueva-nombre");

  if (codigo === "") {
    marcarError("nueva-id", "e-nueva-id", "Escribe el código de la categoría.");
    correcto = false;
  } else if (!/^[a-z]+(-[a-z]+)*$/.test(codigo)) {
    marcarError("nueva-id", "e-nueva-id", "Usa solo letras minúsculas sin tilde y guiones, por ejemplo comida-casera.");
    correcto = false;
  }

  if (nombre === "") {
    marcarError("nueva-nombre", "e-nueva-nombre", "Escribe el nombre de la categoría.");
    correcto = false;
  }

  return correcto;
}

function conectarCategoriaNueva() {
  let formulario = document.getElementById("form-nueva-categoria");

  formulario.addEventListener("submit", function (evento) {
    if (!validarCategoriaNueva()) {
      evento.preventDefault();
      mostrarAviso("Revisa los datos de la categoría nueva.", "error");
    }
  });
}


conectarPestanas();
conectarCategoriaNueva();
