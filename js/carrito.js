/*
  hecho por luis. el javascript del carrito, los botones menos y más de
  cada producto cambian el número y envían su formulario para que el
  servidor guarde la cantidad nueva, y antes de confirmar revisa que el
  vecino haya elegido cómo va a pagar
*/

/* suma o resta una unidad según el data-paso del botón y envía el
   formulario de esa línea, no dejamos bajar de 1 ni pasar el stock, para
   sacar el producto está el botón quitar */
function cambiarUnidad(evento) {
  let boton = evento.currentTarget;
  let formulario = boton.closest("form");
  let campo = formulario.querySelector(".selector-cantidad__numero");
  let actual = parseInt(campo.value, 10);
  let maximo = parseInt(campo.max, 10);
  let nueva;

  if (isNaN(actual)) {
    actual = 1;
  }
  nueva = actual + parseInt(boton.dataset.paso, 10);

  if (nueva < 1) {
    mostrarAviso("la cantidad mínima es 1, para sacarlo usa quitar", "error");
    return;
  }
  if (!isNaN(maximo) && nueva > maximo) {
    mostrarAviso("el vecino solo tiene " + maximo + " disponibles", "error");
    return;
  }

  campo.value = nueva;
  formulario.submit();
}

/* si el vecino escribe el número a mano, al salir del campo enviamos el
   formulario para que se guarde */
function cambiarEscrito(evento) {
  let campo = evento.currentTarget;
  let nueva = parseInt(campo.value, 10);

  if (isNaN(nueva) || nueva < 1) {
    mostrarAviso("la cantidad mínima es 1, para sacarlo usa quitar", "error");
    campo.value = campo.defaultValue;
    return;
  }
  campo.closest("form").submit();
}

/* antes de confirmar revisamos que haya un método de pago elegido, si no,
   frenamos el envío y marcamos el campo */
function validarConfirmacion(evento) {
  let metodo = document.getElementById("metodo-pago").value;

  limpiarCampo("metodo-pago", "e-metodo");
  if (metodo === "") {
    evento.preventDefault();
    marcarError("metodo-pago", "e-metodo", "elige cómo vas a pagar, efectivo, yape o plin");
    document.getElementById("metodo-pago").focus();
  }
}

/* conecta los botones y el formulario de confirmar, si el carrito está
   vacío no hay nada que conectar */
function conectarCarrito() {
  let botones = document.querySelectorAll(".selector-cantidad__boton");
  let campos = document.querySelectorAll(".selector-cantidad__numero");
  let formConfirmar = document.getElementById("form-confirmar");
  let i;

  for (i = 0; i < botones.length; i++) {
    botones[i].addEventListener("click", cambiarUnidad);
  }
  for (i = 0; i < campos.length; i++) {
    campos[i].addEventListener("change", cambiarEscrito);
  }
  if (formConfirmar !== null) {
    formConfirmar.addEventListener("submit", validarConfirmacion);
  }
}

conectarCarrito();
