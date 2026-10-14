/*
  el javascript del carrito

  la página lee el carrito con obtenerCarrito(), lo agrupa por vendedor y
  pinta un grupo por cada uno copiando los moldes <template> del HTML, cada
  cambio vuelve a calcular el total y el contador de la cabecera
*/

/* junta las líneas del carrito por vendedor, devuelve una lista de grupos y
   cada grupo trae el idVendedor y sus líneas, porque cada vendedor recibe un
   pedido aparte */
function agruparPorVendedor(lineas) {
  let grupos = [];
  let grupo;
  let i;
  let j;

  for (i = 0; i < lineas.length; i++) {
    grupo = null;

    for (j = 0; j < grupos.length; j++) {
      if (grupos[j].idVendedor === lineas[i].publicacion.idResidente) {
        grupo = grupos[j];
      }
    }

    if (grupo === null) {
      grupo = { idVendedor: lineas[i].publicacion.idResidente, lineas: [] };
      grupos.push(grupo);
    }

    grupo.lineas.push(lineas[i]);
  }

  return grupos;
}

/* escribe el total del carrito en el resumen */
function actualizarTotal() {
  document.getElementById("carrito-total").textContent = formatearPrecio(totalCarrito());
}

/* copia el molde de una línea, le pone los datos del producto y deja
   conectados sus botones, las funciones de adentro recuerdan la línea que
   les tocó, por eso cada botón sabe de qué producto habla */
function crearLinea(linea) {
  let molde = document.getElementById("plantilla-linea");
  let copia = molde.content.cloneNode(true);
  let publicacion = linea.publicacion;
  let botones = copia.querySelectorAll(".selector-cantidad__boton");
  let botonMenos = botones[0];
  let botonMas = botones[1];
  let campo = copia.querySelector(".selector-cantidad__numero");
  let subtotal = copia.querySelector(".linea-carrito__subtotal");
  let botonQuitar = copia.querySelector(".linea-carrito__quitar");
  let imagen = copia.querySelector(".linea-carrito__imagen");
  let cantidadActual = linea.cantidad;

  imagen.src = publicacion.imagenes[0];
  imagen.alt = publicacion.titulo;
  copia.querySelector(".linea-carrito__titulo").textContent = publicacion.titulo;
  copia.querySelector(".linea-carrito__datos p").textContent =
    formatearPrecio(publicacion.precio) + " cada uno";

  campo.value = cantidadActual;
  campo.max = publicacion.stock;
  campo.setAttribute("aria-label", "Cantidad de " + publicacion.titulo);
  botonMenos.setAttribute("aria-label", "Quitar una unidad de " + publicacion.titulo);
  botonMas.setAttribute("aria-label", "Agregar una unidad de " + publicacion.titulo);
  subtotal.textContent = formatearPrecio(linea.subtotal);
  botonQuitar.setAttribute("aria-label", "Quitar " + publicacion.titulo + " del carrito");

  /* pide al almacén la cantidad nueva, si no se puede (por ejemplo no hay
     stock) avisa y deja el número como estaba */
  function cambiarA(nueva) {
    let resultado = cambiarCantidad(linea.idPublicacion, nueva);

    if (!resultado.ok) {
      mostrarAviso(resultado.mensaje, "error");
      campo.value = cantidadActual;
      return;
    }

    cantidadActual = nueva;
    campo.value = nueva;
    subtotal.textContent = formatearPrecio(redondear(publicacion.precio * nueva));
    actualizarTotal();
    actualizarContadorCarrito();
  }

  botonMenos.addEventListener("click", function () {
    if (cantidadActual > 1) {
      cambiarA(cantidadActual - 1);
    }
  });

  botonMas.addEventListener("click", function () {
    cambiarA(cantidadActual + 1);
  });

  campo.addEventListener("change", function () {
    let nueva = parseInt(campo.value, 10);

    if (isNaN(nueva) || nueva < 1) {
      mostrarAviso("la cantidad mínima es 1, para sacarlo usa Quitar", "error");
      campo.value = cantidadActual;
      return;
    }

    cambiarA(nueva);
  });

  botonQuitar.addEventListener("click", function () {
    quitarDelCarrito(linea.idPublicacion);
    actualizarContadorCarrito();
    pintarCarrito();
    mostrarAviso("quitaste " + publicacion.titulo + " de tu carrito", "ok");
  });

  return copia;
}

/* copia el molde de un grupo, le pone el nombre del vendedor y le agrega
   una línea por cada producto suyo */
function crearGrupo(grupo) {
  let molde = document.getElementById("plantilla-grupo");
  let copia = molde.content.cloneNode(true);
  let vendedor = obtenerResidente(grupo.idVendedor);
  let seccion = copia.querySelector(".carrito__grupo");
  let i;

  copia.querySelector(".carrito__vendedor").textContent =
    "Vendido por " + nombreCompleto(vendedor) + " · " + textoUnidad(vendedor);

  for (i = 0; i < grupo.lineas.length; i++) {
    seccion.appendChild(crearLinea(grupo.lineas[i]));
  }

  return copia;
}

/* dibuja el carrito entero desde cero con lo que hay guardado, si no hay
   nada muestra el bloque de carrito vacío */
function pintarCarrito() {
  let lineas = obtenerCarrito();
  let grupos = agruparPorVendedor(lineas);
  let caja = document.getElementById("grupos-carrito");
  let i;

  caja.innerHTML = "";

  if (lineas.length === 0) {
    document.getElementById("carrito-lleno").hidden = true;
    document.getElementById("carrito-vacio").hidden = false;
    return;
  }

  for (i = 0; i < grupos.length; i++) {
    caja.appendChild(crearGrupo(grupos[i]));
  }

  actualizarTotal();
  document.getElementById("carrito-vacio").hidden = true;
  document.getElementById("carrito-lleno").hidden = false;
}

/* la pantalla que sale después de registrar, con el código de cada pedido */
function mostrarConfirmacion(pedidos) {
  let lista = document.getElementById("lista-codigos");
  let item;
  let vendedor;
  let i;

  lista.innerHTML = "";

  for (i = 0; i < pedidos.length; i++) {
    vendedor = obtenerResidente(pedidos[i].idVendedor);
    item = document.createElement("li");
    item.textContent = pedidos[i].codigo + " · " + nombreCompleto(vendedor) +
      " · " + formatearPrecio(pedidos[i].total);
    lista.appendChild(item);
  }

  document.getElementById("carrito-lleno").hidden = true;
  document.getElementById("carrito-vacio").hidden = true;
  document.getElementById("carrito-confirmacion").hidden = false;
}

/* el botón Registrar pedido, el almacén crea un pedido por vendedor, baja el
   stock y vacía el carrito */
function alRegistrar() {
  let metodo = document.getElementById("metodo-pago").value;
  let resultado = registrarPedidos(metodo);

  if (!resultado.ok) {
    mostrarAviso(resultado.mensaje, "error");
    return;
  }

  mostrarConfirmacion(resultado.pedidos);
  actualizarContadorCarrito();
  mostrarAviso(resultado.mensaje, "ok");
}

/* el botón Vaciar carrito, antes de borrar todo pedimos confirmación */
function alVaciar() {
  pedirConfirmacion(
    "¿Vaciar tu carrito?",
    "Se van a quitar todos los productos y esto no se puede deshacer.",
    function () {
      vaciarCarrito();
      actualizarContadorCarrito();
      pintarCarrito();
      mostrarAviso("vaciaste tu carrito", "ok");
    }
  );
}

/* aquí arranca el carrito, si nadie inició sesión exigirSesion manda al
   registro y anota que vuelva a esta página */
function iniciarCarrito() {
  if (!exigirSesion()) {
    return;
  }

  document.getElementById("boton-registrar").addEventListener("click", alRegistrar);
  document.getElementById("boton-vaciar").addEventListener("click", alVaciar);
  pintarCarrito();
}

iniciarCarrito();