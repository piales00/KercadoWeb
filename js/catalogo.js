/*
  hecho por francys. el javascript del catálogo, los filtros ya funcionan con
  php por la dirección, aquí solo los hacemos más cómodos, el formulario se
  envía solo al cambiar la categoría o el orden, y los precios se revisan
  antes de enviar para no esperar al servidor
*/

/* revisa los dos precios, que no sean negativos y que el mínimo no pase al
   máximo, devuelve true si se puede enviar */
function validarPrecios() {
  let textoMin = document.getElementById("precio-min").value;
  let textoMax = document.getElementById("precio-max").value;
  let minimo = parseFloat(textoMin);
  let maximo = parseFloat(textoMax);
  let correcto = true;

  limpiarCampo("precio-min", "e-min");
  limpiarCampo("precio-max", "e-max");

  if (textoMin !== "" && (isNaN(minimo) || minimo < 0)) {
    marcarError("precio-min", "e-min", "el precio mínimo tiene que ser un número de 0 para arriba");
    correcto = false;
  }
  if (textoMax !== "" && (isNaN(maximo) || maximo < 0)) {
    marcarError("precio-max", "e-max", "el precio máximo tiene que ser un número de 0 para arriba");
    correcto = false;
  }
  if (correcto && textoMin !== "" && textoMax !== "" && minimo > maximo) {
    marcarError("precio-min", "e-min", "el precio mínimo no puede ser mayor que el máximo");
    correcto = false;
  }

  return correcto;
}

/* si los precios están mal no dejamos que el formulario salga */
function alEnviarFiltros(evento) {
  if (!validarPrecios()) {
    evento.preventDefault();
    document.getElementById("precio-min").focus();
  }
}

/* al elegir otra categoría u orden enviamos el formulario de una vez, igual
   pasa por la revisión de precios */
function enviarFiltros() {
  let formulario = document.getElementById("filtro-catalogo");

  if (validarPrecios()) {
    formulario.submit();
  }
}

function iniciarCatalogo() {
  let formulario = document.getElementById("filtro-catalogo");

  formulario.addEventListener("submit", alEnviarFiltros);
  document.getElementById("filtro-categoria").addEventListener("change", enviarFiltros);
  document.getElementById("filtro-orden").addEventListener("change", enviarFiltros);
}

iniciarCatalogo();
