/*
  hecho por piero. este es el javascript del panel, la página ya llega
  armada desde php, aquí solo cambiamos de pestaña sin recargar, abrimos y
  cerramos el detalle de cada pedido, y mostramos el campo del motivo solo
  cuando el vendedor elige cancelar un pedido
*/

/* los nombres de las pestañas en el mismo orden en que se ven */
const PESTANAS = ["compras", "ventas", "publicaciones"];


/* las pestañas */

/* muestra una pestaña y esconde las otras, la que no está elegida sale del
   recorrido del tab, como piden las pautas de accesibilidad, y se llega a
   ella con las flechas */
function mostrarPestana(nombre) {
  let boton;
  let panel;
  let i;

  for (i = 0; i < PESTANAS.length; i++) {
    boton = document.getElementById("pestana-" + PESTANAS[i]);
    panel = document.getElementById("mis-" + PESTANAS[i]);

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
}

/* cambia la pestaña y la anota en la dirección con replaceState, así al
   recargar o compartir el enlace se abre la misma, igual que lo hace php */
function elegirPestana(nombre) {
  mostrarPestana(nombre);
  history.replaceState(null, "", "panel.php?pestana=" + nombre);
  document.getElementById("pestana-" + nombre).focus();
}

/* la pestaña que está elegida ahora, la buscamos por aria-selected */
function pestanaElegida() {
  let i;

  for (i = 0; i < PESTANAS.length; i++) {
    if (document.getElementById("pestana-" + PESTANAS[i]).getAttribute("aria-selected") === "true") {
      return i;
    }
  }
  return 0;
}

function conectarPestanas() {
  let enlaces = document.querySelectorAll("[data-pestana]");
  let i;

  /* cada pestaña es un enlace para que funcione sin javascript, aquí
     evitamos que recargue y la cambiamos en el momento */
  for (i = 0; i < enlaces.length; i++) {
    enlaces[i].addEventListener("click", function (evento) {
      evento.preventDefault();
      elegirPestana(this.dataset.pestana);
    });
  }

  /* con las flechas se pasa a la pestaña de al lado, y de la última se
     vuelve a la primera */
  document.querySelector(".pestanas").addEventListener("keydown", function (evento) {
    let actual = pestanaElegida();

    if (evento.key === "ArrowRight") {
      evento.preventDefault();
      elegirPestana(PESTANAS[(actual + 1) % PESTANAS.length]);
    } else if (evento.key === "ArrowLeft") {
      evento.preventDefault();
      elegirPestana(PESTANAS[(actual + PESTANAS.length - 1) % PESTANAS.length]);
    }
  });
}


/* el detalle de los pedidos */

/* php deja el detalle abierto por si no hay javascript, aquí lo cerramos,
   mostramos el botón y aria-expanded le avisa al lector de pantalla si
   está abierto */
function conectarDetalles() {
  let botones = document.querySelectorAll("[data-ver]");
  let i;

  for (i = 0; i < botones.length; i++) {
    let boton = botones[i];
    let fila = document.getElementById(boton.getAttribute("aria-controls"));

    fila.hidden = true;
    boton.hidden = false;
    boton.setAttribute("aria-expanded", "false");
    boton.textContent = "Ver detalle";

    boton.addEventListener("click", function () {
      if (fila.hidden) {
        fila.hidden = false;
        boton.setAttribute("aria-expanded", "true");
        boton.textContent = "Ocultar detalle";
      } else {
        fila.hidden = true;
        boton.setAttribute("aria-expanded", "false");
        boton.textContent = "Ver detalle";
      }
    });
  }
}


/* el cambio de estado de un pedido */

/* el motivo solo hace falta cuando se cancela, así que lo escondemos hasta
   que eligen cancelado, y no dejamos enviar sin motivo porque el comprador
   lo va a leer en sus compras, php lo vuelve a revisar igual */
function conectarFormularioEstado(formulario) {
  let lista = formulario.querySelector('select[name="estado"]');
  let motivo = formulario.querySelector("[data-motivo]");

  if (motivo === null) {
    return;
  }

  function actualizarMotivo() {
    motivo.hidden = lista.value !== "Cancelado";
    motivo.required = lista.value === "Cancelado";
  }

  actualizarMotivo();
  lista.addEventListener("change", function () {
    actualizarMotivo();
    if (!motivo.hidden) {
      motivo.focus();
    }
  });

  formulario.addEventListener("submit", function (evento) {
    if (lista.value === "Cancelado" && motivo.value.trim() === "") {
      evento.preventDefault();
      mostrarAviso("escribe por qué cancelas el pedido", "error");
      motivo.focus();
    }
  });
}

function conectarFormulariosEstado() {
  let formularios = document.querySelectorAll("[data-estado-pedido]");
  let i;

  for (i = 0; i < formularios.length; i++) {
    conectarFormularioEstado(formularios[i]);
  }
}


conectarPestanas();
conectarDetalles();
conectarFormulariosEstado();
