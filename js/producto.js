/*
  hecho por francys. el javascript de la ficha de producto, la ficha ya llega
  armada desde php, aquí solo manejamos las miniaturas de la galería y los
  botones de menos y más del selector de cantidad, sin bajar de 1 ni pasar
  del stock
*/

/* marca como elegida la miniatura que se apretó y desmarca las demás */
function marcarMiniatura(botones, elegido) {
  let i;

  for (i = 0; i < botones.length; i++) {
    botones[i].setAttribute("aria-pressed", "false");
  }
  elegido.setAttribute("aria-pressed", "true");
}

/* muestra las miniaturas y a cada botón le enseña a cambiar la foto grande
   con la ruta que php dejó en data-ruta */
function conectarGaleria() {
  let caja = document.getElementById("galeria-miniaturas");
  let principal = document.getElementById("imagen-principal");
  let botones;
  let i;

  if (caja === null) {
    return;
  }

  caja.hidden = false;
  botones = caja.querySelectorAll(".galeria__boton");

  for (i = 0; i < botones.length; i++) {
    botones[i].addEventListener("click", function (evento) {
      let boton = evento.currentTarget;

      principal.src = boton.dataset.ruta;
      marcarMiniatura(botones, boton);
    });
  }
}

/* el selector de cantidad, el máximo es el stock que php puso en el campo */
function conectarCantidad() {
  let campo = document.getElementById("input-cantidad");
  let stock;

  if (campo === null) {
    return;
  }
  stock = parseInt(campo.max, 10);

  document.getElementById("btn-menos").addEventListener("click", function () {
    let actual = parseInt(campo.value, 10);

    if (actual > 1) {
      campo.value = actual - 1;
    }
  });

  document.getElementById("btn-mas").addEventListener("click", function () {
    let actual = parseInt(campo.value, 10);

    if (actual < stock) {
      campo.value = actual + 1;
    } else {
      mostrarAviso("solo quedan " + stock + " unidades", "error");
    }
  });

  campo.addEventListener("change", function () {
    let actual = parseInt(campo.value, 10);

    if (isNaN(actual) || actual < 1) {
      campo.value = 1;
    } else if (actual > stock) {
      campo.value = stock;
      mostrarAviso("solo quedan " + stock + " unidades", "error");
    }
  });
}

conectarGaleria();
conectarCantidad();
