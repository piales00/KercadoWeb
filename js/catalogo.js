/*
  el javascript del catálogo
*/

/* el filtro de precios del catálogo

   los dos precios son opcionales, lo único que revisamos es que no sean
   negativos y que el mínimo no sea mayor que el máximo, porque así no
   saldría ningún producto */
function validarFiltro() {
  let minimo = document.getElementById("precio-min").value;
  let maximo = document.getElementById("precio-max").value;
  let caja = document.getElementById("aviso-filtro");
  let desde, hasta;

  caja.className = "mensaje";
  caja.innerHTML = "";

  if (minimo !== "" && parseFloat(minimo) < 0) {
    caja.className = "mensaje mensaje--error";
    caja.innerHTML = "el precio mínimo no puede ser negativo";
    return false;
  }

  if (maximo !== "" && parseFloat(maximo) < 0) {
    caja.className = "mensaje mensaje--error";
    caja.innerHTML = "el precio máximo no puede ser negativo";
    return false;
  }

  if (minimo !== "" && maximo !== "") {
    desde = parseFloat(minimo);
    hasta = parseFloat(maximo);

    if (desde > hasta) {
      caja.className = "mensaje mensaje--error";
      caja.innerHTML = "el precio mínimo es mayor que el máximo, revisa los dos valores";
      return false;
    }

    caja.className = "mensaje mensaje--ok";
    caja.innerHTML = "buscarías productos entre S/ " + desde.toFixed(2) + " y S/ " + hasta.toFixed(2);
    return false;
  }

  caja.className = "mensaje mensaje--ok";
  caja.innerHTML = "los precios están bien, todavía nos falta el servidor para filtrar de verdad";
  return false;
}
