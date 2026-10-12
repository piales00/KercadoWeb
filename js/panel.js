/*
  hecho por piero. este es el javascript del panel, llena las tablas de
  compras, publicaciones y pedidos recibidos con lo que devuelve almacen.js,
  cambia de pestaña entre mis compras y mis ventas, y deja que el vendedor
  dé de baja una publicación o cambie el estado de un pedido
*/

/* el vecino que tiene la sesión abierta, lo guardamos al empezar porque
   lo usan casi todas las funciones */
let vecino = null;

/* el pedido que el vendedor está por cancelar, mientras el diálogo del
   motivo está abierto */
let pedidoPorCancelar = null;


/* ayudas para llenar las filas */

/* busca dentro de una fila la parte marcada con ese data-campo */
function parte(fila, campo) {
  return fila.querySelector('[data-campo="' + campo + '"]');
}

/* escribe un texto en una parte de la fila, siempre con textContent
   porque los títulos y los motivos los escriben los vecinos */
function escribir(fila, campo, texto) {
  parte(fila, campo).textContent = texto;
}

/* pone la píldora de color que le toca al estado */
function pintarEstado(fila, estado) {
  let pildora = parte(fila, "estado");

  pildora.className = claseEstado(estado);
  pildora.textContent = estado;
}

/* muestra la tabla si tiene filas, o el mensaje de lista vacía si no */
function mostrarTablaOVacio(idCaja, idVacio, cantidad) {
  document.getElementById(idCaja).hidden = cantidad === 0;
  document.getElementById(idVacio).hidden = cantidad > 0;
}

function textoStock(stock) {
  if (stock === 0) {
    return "sin stock";
  }
  if (stock === 1) {
    return "1 unidad";
  }
  return stock + " unidades";
}

/* arma la fila escondida que va debajo de un pedido, con los productos,
   el pago y el contacto, columnas es cuántas columnas tiene la tabla para
   que la celda ocupe todo el ancho */
function crearFilaDetalle(pedido, idFila, columnas, textoContacto) {
  let molde = document.getElementById("plantilla-detalle");
  let moldeProducto = document.getElementById("plantilla-producto-pedido");
  let copia = molde.content.cloneNode(true);
  let fila = copia.querySelector("tr");
  let lista = parte(fila, "productos");
  let linea;
  let i;

  fila.id = idFila;
  parte(fila, "celda").colSpan = columnas;

  for (i = 0; i < pedido.detalles.length; i++) {
    linea = moldeProducto.content.cloneNode(true).querySelector("li");
    escribir(linea, "producto", pedido.detalles[i].cantidad + " × " + pedido.detalles[i].titulo);
    escribir(linea, "subtotal", formatearPrecio(pedido.detalles[i].subtotal));
    lista.appendChild(linea);
  }

  escribir(fila, "pago", "Pago con " + pedido.pago.metodo + " · " + pedido.pago.estado);
  escribir(fila, "contacto", textoContacto);

  if (pedido.estado === "Cancelado") {
    escribir(fila, "motivo", "El vendedor canceló el pedido porque " + pedido.motivoCancelacion);
    parte(fila, "motivo").hidden = false;
  }

  return fila;
}

/* el botón ver detalle abre y cierra la fila de abajo, aria-expanded le
   avisa al lector de pantalla si está abierta */
function conectarDetalle(boton, filaDetalle, codigo) {
  boton.setAttribute("aria-controls", filaDetalle.id);
  boton.setAttribute("aria-label", "Ver detalle del pedido " + codigo);

  boton.addEventListener("click", function () {
    if (filaDetalle.hidden) {
      filaDetalle.hidden = false;
      boton.setAttribute("aria-expanded", "true");
      boton.textContent = "Ocultar detalle";
    } else {
      filaDetalle.hidden = true;
      boton.setAttribute("aria-expanded", "false");
      boton.textContent = "Ver detalle";
    }
  });
}


/* el saludo de arriba */

function pintarSaludo() {
  document.getElementById("panel-nombre").textContent = nombreCompleto(vecino);
  document.getElementById("panel-unidad").textContent = " · " + textoUnidad(vecino);
}


/* mis compras */

/* agrega al cuerpo de la tabla la fila de una compra y su fila de detalle */
function agregarCompra(cuerpo, pedido) {
  let molde = document.getElementById("plantilla-compra");
  let fila = molde.content.cloneNode(true).querySelector("tr");
  let vendedor = obtenerResidente(pedido.idVendedor);
  let contacto = "Coordina el pago y la entrega con " + nombreCompleto(vendedor);
  let filaDetalle;

  if (vendedor !== null && vendedor.telefono !== "") {
    contacto = contacto + ", su celular es " + vendedor.telefono;
  }

  escribir(fila, "codigo", pedido.codigo);
  escribir(fila, "fecha", formatearFecha(pedido.fechaHora));
  escribir(fila, "persona", nombreCompleto(vendedor) + " · " + textoUnidad(vendedor));
  escribir(fila, "total", formatearPrecio(pedido.total));
  pintarEstado(fila, pedido.estado);

  filaDetalle = crearFilaDetalle(pedido, "detalle-compra-" + pedido.idPedido, 6, contacto);
  conectarDetalle(parte(fila, "ver"), filaDetalle, pedido.codigo);

  cuerpo.appendChild(fila);
  cuerpo.appendChild(filaDetalle);
}

function pintarCompras() {
  let cuerpo = document.getElementById("filas-compras");
  let pedidos = pedidosDelComprador(vecino.idResidente);
  let i;

  cuerpo.innerHTML = "";

  for (i = 0; i < pedidos.length; i++) {
    agregarCompra(cuerpo, pedidos[i]);
  }

  mostrarTablaOVacio("caja-compras", "vacio-compras", pedidos.length);
}


/* mis publicaciones */

/* antes de dar de baja preguntamos, porque la publicación deja de salir
   en el catálogo */
function pedirBaja(publicacion) {
  pedirConfirmacion(
    "¿Dar de baja esta publicación?",
    publicacion.titulo + " va a dejar de aparecer en el catálogo. Los pedidos que ya te hicieron no cambian.",
    function () {
      if (darDeBajaPublicacion(publicacion.idPublicacion)) {
        mostrarAviso("diste de baja " + publicacion.titulo, "ok");
      } else {
        mostrarAviso("no se pudo dar de baja la publicación", "error");
      }
      pintarPublicaciones();
    }
  );
}

function agregarPublicacion(cuerpo, publicacion) {
  let molde = document.getElementById("plantilla-publicacion");
  let fila = molde.content.cloneNode(true).querySelector("tr");
  let categoria = obtenerCategoria(publicacion.idCategoria);
  let botonBaja = parte(fila, "baja");

  escribir(fila, "codigo", publicacion.idPublicacion);
  escribir(fila, "producto", publicacion.titulo);
  parte(fila, "producto").href = "producto.html?id=" + publicacion.idPublicacion;
  escribir(fila, "precio", formatearPrecio(publicacion.precio));
  escribir(fila, "stock", textoStock(publicacion.stock));
  pintarEstado(fila, publicacion.estado);

  if (categoria !== null) {
    escribir(fila, "categoria", categoria.nombre);
  }

  /* solo se puede dar de baja lo que sigue activo */
  if (publicacion.estado === "Activa") {
    botonBaja.setAttribute("aria-label", "Dar de baja " + publicacion.titulo);
    botonBaja.addEventListener("click", function () {
      pedirBaja(publicacion);
    });
  } else {
    botonBaja.remove();
  }

  cuerpo.appendChild(fila);
}

function pintarPublicaciones() {
  let cuerpo = document.getElementById("filas-publicaciones");
  let publicaciones = publicacionesDelVendedor(vecino.idResidente);
  let i;

  cuerpo.innerHTML = "";

  for (i = 0; i < publicaciones.length; i++) {
    agregarPublicacion(cuerpo, publicaciones[i]);
  }

  mostrarTablaOVacio("caja-publicaciones", "vacio-publicaciones", publicaciones.length);
}


/* pedidos recibidos */

/* después de volver a pintar la tabla el foco se pierde, lo devolvemos a
   la fila del pedido que se cambió para quien usa el teclado */
function enfocarPedido(idPedido) {
  let control = document.getElementById("cambiar-" + idPedido);

  if (control === null || control.hidden) {
    control = document.getElementById("ver-venta-" + idPedido);
  }
  if (control !== null) {
    control.focus();
  }
}

/* cambia el estado de un pedido y avisa cómo quedó, cancelar no pasa por
   aquí porque primero hay que pedir el motivo */
function cambiarEstado(pedido, nuevoEstado) {
  let resultado = cambiarEstadoPedido(pedido.idPedido, nuevoEstado, "");

  if (resultado.ok) {
    mostrarAviso(resultado.mensaje, "ok");
  } else {
    mostrarAviso(resultado.mensaje, "error");
  }

  pintarVentas();
  enfocarPedido(pedido.idPedido);
}

function abrirCancelacion(pedido) {
  let comprador = obtenerResidente(pedido.idComprador);

  pedidoPorCancelar = pedido;
  document.getElementById("cancelar-texto").textContent =
    "Vas a cancelar el pedido " + pedido.codigo + " de " + nombreCompleto(comprador) +
    ". El stock vuelve a tus publicaciones y el comprador va a leer el motivo en sus compras.";
  document.getElementById("cancelar-motivo").value = "";
  limpiarCampo("cancelar-motivo", "e-cancelar-motivo");
  document.getElementById("dialogo-cancelar").showModal();
}

function confirmarCancelacion() {
  let motivo = document.getElementById("cancelar-motivo").value.trim();
  let pedido = pedidoPorCancelar;
  let resultado;

  if (motivo === "") {
    marcarError("cancelar-motivo", "e-cancelar-motivo", "escribe por qué cancelas el pedido");
    document.getElementById("cancelar-motivo").focus();
    return;
  }

  resultado = cambiarEstadoPedido(pedido.idPedido, "Cancelado", motivo);
  document.getElementById("dialogo-cancelar").close();

  if (resultado.ok) {
    mostrarAviso(resultado.mensaje, "ok");
  } else {
    mostrarAviso(resultado.mensaje, "error");
  }

  /* el stock volvió a las publicaciones, por eso también se repinta esa
     tabla, la de pedidos se repinta sola cuando el diálogo termina de
     cerrarse */
  pintarPublicaciones();
}

function agregarVenta(cuerpo, pedido) {
  let molde = document.getElementById("plantilla-venta");
  let fila = molde.content.cloneNode(true).querySelector("tr");
  let comprador = obtenerResidente(pedido.idComprador);
  let siguientes = estadosSiguientes(pedido.estado);
  let lista = parte(fila, "cambiar");
  let botonVer = parte(fila, "ver");
  let contacto = "Se entrega en " + textoUnidad(comprador);
  let filaDetalle;
  let opcion;
  let i;

  if (comprador !== null && comprador.telefono !== "") {
    contacto = contacto + ", el celular de " + nombreCompleto(comprador) + " es " + comprador.telefono;
  }

  escribir(fila, "codigo", pedido.codigo);
  escribir(fila, "fecha", formatearFecha(pedido.fechaHora));
  escribir(fila, "persona", nombreCompleto(comprador) + " · " + textoUnidad(comprador));
  escribir(fila, "total", formatearPrecio(pedido.total));
  pintarEstado(fila, pedido.estado);

  /* la lista solo ofrece los estados a los que este pedido puede pasar,
     si ya se entregó o se canceló no hay nada que elegir */
  if (siguientes.length === 0) {
    lista.remove();
    parte(fila, "cerrado").hidden = false;
  } else {
    lista.id = "cambiar-" + pedido.idPedido;
    lista.setAttribute("aria-label", "Cambiar el estado del pedido " + pedido.codigo);

    for (i = 0; i < siguientes.length; i++) {
      opcion = document.createElement("option");
      opcion.value = siguientes[i];
      opcion.textContent = siguientes[i];
      lista.appendChild(opcion);
    }

    lista.addEventListener("change", function () {
      if (lista.value === "Cancelado") {
        abrirCancelacion(pedido);
      } else if (lista.value !== "") {
        cambiarEstado(pedido, lista.value);
      }
    });
  }

  botonVer.id = "ver-venta-" + pedido.idPedido;
  filaDetalle = crearFilaDetalle(pedido, "detalle-venta-" + pedido.idPedido, 7, contacto);
  conectarDetalle(botonVer, filaDetalle, pedido.codigo);

  cuerpo.appendChild(fila);
  cuerpo.appendChild(filaDetalle);
}

function pintarVentas() {
  let cuerpo = document.getElementById("filas-ventas");
  let pedidos = pedidosDelVendedor(vecino.idResidente);
  let i;

  cuerpo.innerHTML = "";

  for (i = 0; i < pedidos.length; i++) {
    agregarVenta(cuerpo, pedidos[i]);
  }

  mostrarTablaOVacio("caja-ventas", "vacio-ventas", pedidos.length);
}


/* las pestañas */

/* muestra una pestaña y esconde la otra, nombre es "compras" o "ventas",
   la que no está elegida sale del recorrido del tab, como piden las
   pautas de accesibilidad, y se llega a ella con las flechas */
function mostrarPestana(nombre) {
  let nombres = ["compras", "ventas"];
  let boton;
  let panel;
  let i;

  for (i = 0; i < nombres.length; i++) {
    boton = document.getElementById("pestana-" + nombres[i]);
    panel = document.getElementById("mis-" + nombres[i]);

    if (nombres[i] === nombre) {
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

/* cuando el vecino elige una pestaña la anotamos en la dirección, así
   panel.html#mis-ventas abre directo en las ventas y al recargar no se
   pierde dónde estaba */
function elegirPestana(nombre) {
  mostrarPestana(nombre);
  history.replaceState(null, "", "#mis-" + nombre);
  document.getElementById("pestana-" + nombre).focus();
}

/* lee de la dirección qué pestaña toca, si no dice nada van las compras */
function pestanaDeLaUrl() {
  if (window.location.hash === "#mis-ventas") {
    return "ventas";
  }
  return "compras";
}

function conectarPestanas() {
  document.getElementById("pestana-compras").addEventListener("click", function () {
    elegirPestana("compras");
  });

  document.getElementById("pestana-ventas").addEventListener("click", function () {
    elegirPestana("ventas");
  });

  /* con las flechas se pasa de una pestaña a la otra, y con inicio y fin
     se va a la primera y a la última */
  document.querySelector(".pestanas").addEventListener("keydown", function (evento) {
    if (evento.key === "ArrowRight" || evento.key === "ArrowLeft") {
      evento.preventDefault();
      if (pestanaDeLaUrl() === "compras") {
        elegirPestana("ventas");
      } else {
        elegirPestana("compras");
      }
    } else if (evento.key === "Home") {
      evento.preventDefault();
      elegirPestana("compras");
    } else if (evento.key === "End") {
      evento.preventDefault();
      elegirPestana("ventas");
    }
  });

  /* por si el vecino llega con un enlace que termina en #mis-ventas
     estando ya en el panel */
  window.addEventListener("hashchange", function () {
    mostrarPestana(pestanaDeLaUrl());
  });
}

function conectarCancelacion() {
  let dialogo = document.getElementById("dialogo-cancelar");

  document.getElementById("form-cancelar").addEventListener("submit", function (evento) {
    evento.preventDefault();
    confirmarCancelacion();
  });

  document.getElementById("cancelar-volver").addEventListener("click", function () {
    dialogo.close();
  });

  /* al cerrarse, con cualquiera de los botones o con escape, repintamos
     la tabla para que la lista del pedido vuelva a su primera opción */
  dialogo.addEventListener("close", function () {
    let pedido = pedidoPorCancelar;

    pedidoPorCancelar = null;
    pintarVentas();
    if (pedido !== null) {
      enfocarPedido(pedido.idPedido);
    }
  });
}


/* aquí arranca el panel, si nadie inició sesión exigirSesion manda al
   registro y no pintamos nada */
function iniciarPanel() {
  if (!exigirSesion()) {
    return;
  }

  vecino = sesionActual();

  pintarSaludo();
  pintarCompras();
  pintarPublicaciones();
  pintarVentas();
  mostrarPestana(pestanaDeLaUrl());
  conectarPestanas();
  conectarCancelacion();
}

iniciarPanel();
