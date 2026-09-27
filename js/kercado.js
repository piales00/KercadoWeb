/*
  hecho por piero. este es el javascript del sitio, revisa los formularios
  antes de enviarlos y escribe el año en el pie, lo pusimos en un solo
  archivo para que las cinco páginas usen el mismo, igual que hacemos con
  el css
*/

/* el año del pie

   antes lo teníamos escrito a mano, ahora lo pone el navegador solo con la
   fecha del día, así no hay que cambiarlo cuando termine el año */
function escribirAnio() {
  let anio = document.getElementById("anio");

  if (anio !== null) {
    anio.innerHTML = new Date().getFullYear();
  }
}

window.onload = escribirAnio;

/* ayudas que usamos en las validaciones

   cada campo tiene debajo un small vacío donde escribimos el error, y el
   campo se pinta de rojo para que se vea de una cuál es */
function marcarError(idCampo, idError, mensaje) {
  document.getElementById(idError).innerHTML = mensaje;
  document.getElementById(idCampo).className = "campo-malo";
}

function limpiarCampo(idCampo, idError) {
  document.getElementById(idError).innerHTML = "";
  document.getElementById(idCampo).className = "";
}

/* borra los mensajes de la vez anterior, si no, quedan errores viejos en
   pantalla aunque el vecino ya los haya corregido */
function limpiarFormulario(campos, idResumen) {
  let i;

  for (i = 0; i < campos.length; i++) {
    limpiarCampo(campos[i][0], campos[i][1]);
  }

  document.getElementById(idResumen).innerHTML = "";
  document.getElementById(idResumen).className = "mensaje";
}

function mostrarResumen(idResumen, errores) {
  let caja = document.getElementById(idResumen);

  if (errores === 0) {
    caja.className = "mensaje mensaje--ok";
    caja.innerHTML =
      "listo, tus datos están completos, la administración revisa que vivas " +
      "en el condominio y te avisa cuando tu cuenta quede activa";
  } else if (errores === 1) {
    caja.className = "mensaje mensaje--error";
    caja.innerHTML = "falta corregir 1 dato, está marcado más abajo";
  } else {
    caja.className = "mensaje mensaje--error";
    caja.innerHTML = "faltan corregir " + errores + " datos, están marcados más abajo";
  }
}

/* el correo lo revisamos con esta expresión, pide que haya algo, luego una
   arroba, algo más, un punto y el final, por ejemplo vecino@correo.com */
function correoValido(correo) {
  return /\S+@\S+\.\S+/.test(correo);
}

/* el registro

   revisamos campo por campo y vamos contando los errores, si al final hay
   alguno devolvemos false y el formulario no se envía */
function validarRegistro() {
  let nombre = document.getElementById("c-nombre").value;
  let apellidos = document.getElementById("c-apellidos").value;
  let correo = document.getElementById("c-correo").value;
  let telefono = document.getElementById("c-tel").value;
  let torre = document.getElementById("c-torre").value;
  let depa = document.getElementById("c-depa").value;
  let clave = document.getElementById("c-clave").value;
  let repetir = document.getElementById("c-repetirclave").value;
  let terminos = document.getElementById("c-terminos").checked;
  let pisos = document.getElementsByName("piso");
  let campos = [
    ["c-nombre", "e-nombre"],
    ["c-apellidos", "e-apellidos"],
    ["c-correo", "e-correo"],
    ["c-tel", "e-tel"],
    ["c-torre", "e-torre"],
    ["c-depa", "e-depa"],
    ["c-clave", "e-clave"],
    ["c-repetirclave", "e-repetirclave"]
  ];
  let errores = 0;
  let pisoMarcado = false;
  let numeroDepa;
  let i;

  limpiarFormulario(campos, "aviso-registro");
  document.getElementById("e-piso").innerHTML = "";
  document.getElementById("e-terminos").innerHTML = "";

  if (nombre === "") {
    marcarError("c-nombre", "e-nombre", "escribe tus nombres");
    errores = errores + 1;
  }

  if (apellidos === "") {
    marcarError("c-apellidos", "e-apellidos", "escribe tus apellidos");
    errores = errores + 1;
  }

  if (correo === "") {
    marcarError("c-correo", "e-correo", "escribe tu correo");
    errores = errores + 1;
  } else if (!correoValido(correo)) {
    marcarError("c-correo", "e-correo", "ese correo no tiene la forma vecino@correo.com");
    errores = errores + 1;
  }

  /* el teléfono no es obligatorio, pero si lo escribe le pedimos los nueve
     dígitos del celular, le quitamos los espacios para que dé igual si lo
     escribe 987 654 321 o todo junto */
  if (telefono !== "") {
    telefono = telefono.split(" ").join("");
    if (isNaN(telefono) || telefono.length !== 9) {
      marcarError("c-tel", "e-tel", "el celular tiene nueve dígitos, por ejemplo 987654321");
      errores = errores + 1;
    }
  }

  if (torre === "") {
    marcarError("c-torre", "e-torre", "elige la torre donde vives");
    errores = errores + 1;
  }

  /* el departamento tampoco es obligatorio, pero en el condominio van del
     101 al 1204, así que si pone otro número le avisamos */
  if (depa !== "") {
    numeroDepa = parseInt(depa);
    if (isNaN(numeroDepa) || numeroDepa < 101 || numeroDepa > 1204) {
      marcarError("c-depa", "e-depa", "los departamentos van del 101 al 1204");
      errores = errores + 1;
    }
  }

  /* los tres pisos comparten el mismo name, así que los recorremos con un
     for y nos quedamos con el que esté marcado */
  for (i = 0; i < pisos.length; i++) {
    if (pisos[i].checked) {
      pisoMarcado = true;
    }
  }

  if (!pisoMarcado) {
    document.getElementById("e-piso").innerHTML = "marca en qué piso vives";
    errores = errores + 1;
  }

  if (clave.length < 8) {
    marcarError("c-clave", "e-clave", "la contraseña necesita ocho caracteres o más");
    errores = errores + 1;
  }

  if (repetir !== clave) {
    marcarError("c-repetirclave", "e-repetirclave", "las dos contraseñas tienen que ser iguales");
    errores = errores + 1;
  }

  if (!terminos) {
    document.getElementById("e-terminos").innerHTML =
      "para crear la cuenta hay que aceptar el reglamento";
    errores = errores + 1;
  }

  mostrarResumen("aviso-registro", errores);

  /* devolvemos false siempre, aunque los datos estén bien, porque todavía no
     tenemos servidor a dónde mandarlos y si se enviara se borraría todo lo
     que escribió el vecino */
  return false;
}

/* el inicio de sesión

   acá son solo dos campos, revisamos que el correo tenga forma de correo y
   que la contraseña no esté vacía */
function validarSesion() {
  let correo = document.getElementById("s-correo").value;
  let clave = document.getElementById("s-clave").value;
  let campos = [
    ["s-correo", "e-scorreo"],
    ["s-clave", "e-sclave"]
  ];
  let caja = document.getElementById("aviso-sesion");
  let errores = 0;

  limpiarFormulario(campos, "aviso-sesion");

  if (correo === "") {
    marcarError("s-correo", "e-scorreo", "escribe el correo con el que te registraste");
    errores = errores + 1;
  } else if (!correoValido(correo)) {
    marcarError("s-correo", "e-scorreo", "ese correo no tiene la forma vecino@correo.com");
    errores = errores + 1;
  }

  if (clave === "") {
    marcarError("s-clave", "e-sclave", "escribe tu contraseña");
    errores = errores + 1;
  }

  if (errores === 0) {
    caja.className = "mensaje mensaje--ok";
    caja.innerHTML =
      "tus datos están completos, cuando tengamos el servidor acá entrarías a tu panel";
  } else {
    caja.className = "mensaje mensaje--error";
    caja.innerHTML = "revisa los datos marcados para poder entrar";
  }

  return false;
}

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
