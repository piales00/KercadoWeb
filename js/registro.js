/*
  el javascript de la página de registro, revisa el formulario para crear
  la cuenta y el de iniciar sesión antes de enviarlos, las funciones que
  marcan los errores en los campos están en base.js porque también las
  usan otros formularios del sitio
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
    ["c-repetirclave", "e-repetirclave"],
  ];
  let errores = 0;
  let pisoMarcado = false;
  let numeroDepa;
  let i;

  let resultado;
  let caja = document.getElementById("aviso-registro");

  limpiarFormulario(campos, "aviso-registro");
  document.getElementById("e-piso").textContent = "";
  document.getElementById("e-terminos").textContent = "";

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
    marcarError(
      "c-correo",
      "e-correo",
      "ese correo no tiene la forma vecino@correo.com",
    );
    errores = errores + 1;
  }

  /* el teléfono no es obligatorio, pero si lo escribe le pedimos los nueve
     dígitos del celular, le quitamos los espacios para que dé igual si lo
     escribe 987 654 321 o todo junto */
  if (telefono !== "") {
    telefono = telefono.split(" ").join("");
    if (isNaN(telefono) || telefono.length !== 9) {
      marcarError(
        "c-tel",
        "e-tel",
        "el celular tiene nueve dígitos, por ejemplo 987654321",
      );
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
    document.getElementById("e-piso").textContent = "marca en qué piso vives";
    errores = errores + 1;
  }

  if (clave.length < 8) {
    marcarError(
      "c-clave",
      "e-clave",
      "la contraseña necesita ocho caracteres o más",
    );
    errores = errores + 1;
  }

  if (repetir !== clave) {
    marcarError(
      "c-repetirclave",
      "e-repetirclave",
      "las dos contraseñas tienen que ser iguales",
    );
    errores = errores + 1;
  }

  if (!terminos) {
    document.getElementById("e-terminos").textContent =
      "para crear la cuenta hay que aceptar el reglamento";
    errores = errores + 1;
  }

  mostrarResumen("aviso-registro", errores);
  /* si hay errores de forma, nos detenemos aquí */
  if (errores > 0) {
    return;
  }
  
  /* los datos tienen buena forma, ahora se los entregamos al almacén, que
  guarda la solicitud con estado Pendiente */

  resultado = registrarSolicitud({
    nombres: nombre,
    apellidos: apellidos,
    correo: correo,
    clave: clave,
    telefono: telefono,
    torre: torre,
    numeroDepartamento: depa
  });


  /* si el almacén la rechaza es porque ese correo ya tiene cuenta, el error
  se escribe debajo del campo del correo */
  if (!resultado.ok) {
    marcarError("c-correo", "e-correo", resultado.mensaje);
    caja.className = "mensaje mensaje--error";
    caja.textContent = "revisa los datos marcados para poder registrarte";
    caja.scrollIntoView({ block: "center" });
    return;
  }

  /* quedó guardada, mostramos el mensaje, que explica que la cuenta queda
  pendiente, y vaciamos el formulario */
  caja.className = "mensaje mensaje--ok";
  caja.textContent = resultado.mensaje;
  document.getElementById("form-registro").reset();
  caja.scrollIntoView({ block: "center" });
}

/* el inicio de sesión

   acá son solo dos campos, revisamos que el correo tenga forma de correo y
   que la contraseña no esté vacía */
function validarSesion() {
  let correo = document.getElementById("s-correo").value;
  let clave = document.getElementById("s-clave").value;
  let campos = [
    ["s-correo", "e-scorreo"],
    ["s-clave", "e-sclave"],
  ];
  let caja = document.getElementById("aviso-sesion");
  let errores = 0;
  let resultado;
  let volver;
  limpiarFormulario(campos, "aviso-sesion");

  if (correo === "") {
    marcarError(
      "s-correo",
      "e-scorreo",
      "escribe el correo con el que te registraste",
    );
    errores = errores + 1;
  } else if (!correoValido(correo)) {
    marcarError(
      "s-correo",
      "e-scorreo",
      "ese correo no tiene la forma vecino@correo.com",
    );
    errores = errores + 1;
  }

  if (clave === "") {
    marcarError("s-clave", "e-sclave", "escribe tu contraseña");
    errores = errores + 1;
  }
  /* si hay errores de forma, avisamos y paramos aquí */
  if (errores > 0) {
    caja.className = "mensaje mensaje--error";
    caja.textContent = "revisa los datos marcados para poder entrar";
    return;
  }
  /* los datos tienen forma correcta, ahora preguntamos al almacén si la
     cuenta existe, está activa y la clave coincide */
  resultado = iniciarSesion(correo, clave);
  if (!resultado.ok) {
    caja.className = "mensaje mensaje--error";
    caja.textContent = resultado.mensaje;
    return;
  }
  /* entró bien, volvemos a la página de donde venía o vamos al panel */
  volver = leerParametro("volver");

  /* solo volvemos a páginas de nuestro sitio, si alguien arma un enlace con
     otra dirección en volver lo mandamos al panel */
  if (volver === null || volver.indexOf(":") !== -1 || volver.indexOf("//") !== -1) {
    window.location.href = "panel.html";
  } else {
    window.location.href = volver;
  }
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

/* conecta los dos formularios y los botones de mostrar contraseña, así el
   HTML no lleva código JavaScript adentro */
function conectarFormularios() {
  let formRegistro = document.getElementById("form-registro");
  let formSesion = document.getElementById("form-sesion");
  let botonesClave = document.querySelectorAll("[data-mostrar]");
  let i;

  formRegistro.addEventListener("submit", function (evento) {
    evento.preventDefault();
    validarRegistro();
  });

  formSesion.addEventListener("submit", function (evento) {
    evento.preventDefault();
    validarSesion();
  });

  for (i = 0; i < botonesClave.length; i++) {
    botonesClave[i].addEventListener("click", alternarClave);
  }
}

conectarFormularios();
