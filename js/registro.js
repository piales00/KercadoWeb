/*
  hecho por luis. el javascript de la página de registro, revisa el
  formulario para crear la cuenta y el de iniciar sesión antes de enviarlos,
  si todo tiene buena forma deja que el formulario viaje al servidor, que
  vuelve a revisar todo, las funciones que marcan los errores están en
  base.js porque también las usan otros formularios del sitio
*/

/* borra los mensajes de la vez anterior, si no, quedan errores viejos en
   pantalla aunque el vecino ya los haya corregido */
function limpiarFormulario(campos, idResumen) {
  let i;

  for (i = 0; i < campos.length; i++) {
    limpiarCampo(campos[i][0], campos[i][1]);
  }

  document.getElementById(idResumen).textContent = "";
  document.getElementById(idResumen).className = "mensaje";
}

/* el correo lo revisamos con esta expresión, pide que haya algo, luego una
   arroba, algo más, un punto y el final, por ejemplo vecino@correo.com */
function correoValido(correo) {
  return /\S+@\S+\.\S+/.test(correo);
}

/* revisamos campo por campo y vamos contando los errores, devuelve cuántos
   encontró para que el submit sepa si deja pasar el formulario */
function validarRegistro() {
  let nombre = document.getElementById("c-nombre").value.trim();
  let apellidos = document.getElementById("c-apellidos").value.trim();
  let correo = document.getElementById("c-correo").value.trim();
  let telefono = document.getElementById("c-tel").value;
  let torre = document.getElementById("c-torre").value;
  let depa = document.getElementById("c-depa").value;
  let clave = document.getElementById("c-clave").value;
  let repetir = document.getElementById("c-repetirclave").value;
  let terminos = document.getElementById("c-terminos").checked;
  let campos = [
    ["c-nombre", "e-nombre"],
    ["c-apellidos", "e-apellidos"],
    ["c-correo", "e-correo"],
    ["c-tel", "e-tel"],
    ["c-torre", "e-torre"],
    ["c-depa", "e-depa"],
    ["c-clave", "e-clave"],
    ["c-repetirclave", "e-repetirclave"],
    ["c-terminos", "e-terminos"],
  ];
  let errores = 0;
  let numeroDepa;

  limpiarFormulario(campos, "aviso-registro");

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

  /* le quitamos los espacios al celular para que dé igual si lo escribe
     987 654 321 o todo junto, tiene que tener nueve dígitos y empezar en 9 */
  telefono = telefono.split(" ").join("");
  if (!/^9[0-9]{8}$/.test(telefono)) {
    marcarError("c-tel", "e-tel", "el celular tiene nueve dígitos y empieza con 9, por ejemplo 987654321");
    errores = errores + 1;
  }

  if (torre === "") {
    marcarError("c-torre", "e-torre", "elige la torre donde vives");
    errores = errores + 1;
  }

  /* en el condominio los departamentos van del 101 al 1204 */
  numeroDepa = parseInt(depa, 10);
  if (isNaN(numeroDepa) || numeroDepa < 101 || numeroDepa > 1204) {
    marcarError("c-depa", "e-depa", "los departamentos van del 101 al 1204");
    errores = errores + 1;
  }

  /* pedimos ocho caracteres o más y que tenga al menos una letra y un
     número, igual que lo revisa el servidor */
  if (clave.length < 8 || !/[A-Za-z]/.test(clave) || !/[0-9]/.test(clave)) {
    marcarError("c-clave", "e-clave", "la contraseña necesita ocho caracteres o más, con letras y números");
    errores = errores + 1;
  }

  if (repetir !== clave) {
    marcarError("c-repetirclave", "e-repetirclave", "las dos contraseñas tienen que ser iguales");
    errores = errores + 1;
  }

  if (!terminos) {
    marcarError("c-terminos", "e-terminos", "para crear la cuenta hay que aceptar el reglamento");
    errores = errores + 1;
  }

  mostrarResumen("aviso-registro", errores);
  return errores;
}

/* en el ingreso son solo dos campos, revisamos que el correo tenga forma de
   correo y que la contraseña no esté vacía, si la cuenta existe o no lo
   decide el servidor */
function validarSesion() {
  let correo = document.getElementById("s-correo").value.trim();
  let clave = document.getElementById("s-clave").value;
  let campos = [
    ["s-correo", "e-scorreo"],
    ["s-clave", "e-sclave"],
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

  if (errores > 0) {
    caja.className = "mensaje mensaje--error";
    caja.textContent = "revisa los datos marcados para poder entrar";
  }

  return errores;
}

/* cambia una contraseña entre puntitos y texto, el botón dice en data-mostrar
   el id del campo que le toca y también cambia su texto y su aria-label para
   que quien usa lector de pantalla sepa qué hará el botón la próxima vez */
function alternarClave(evento) {
  let boton = evento.currentTarget;
  let campo = document.getElementById(boton.dataset.mostrar);

  if (campo.type === "password") {
    campo.type = "text";
    boton.textContent = "Ocultar";
    boton.setAttribute("aria-label", "Ocultar contraseña");
  } else {
    campo.type = "password";
    boton.textContent = "Mostrar";
    boton.setAttribute("aria-label", "Mostrar contraseña");
  }
}

/* conecta los dos formularios y los botones de mostrar contraseña, solo
   frenamos el envío cuando hay errores, si está todo bien el formulario
   sigue su camino normal hacia registro.php */
function conectarFormularios() {
  let formRegistro = document.getElementById("form-registro");
  let formSesion = document.getElementById("form-sesion");
  let botonesClave = document.querySelectorAll("[data-mostrar]");
  let i;

  formRegistro.addEventListener("submit", function (evento) {
    if (validarRegistro() > 0) {
      evento.preventDefault();
    }
  });

  formSesion.addEventListener("submit", function (evento) {
    if (validarSesion() > 0) {
      evento.preventDefault();
    }
  });

  for (i = 0; i < botonesClave.length; i++) {
    botonesClave[i].addEventListener("click", alternarClave);
  }
}

conectarFormularios();
