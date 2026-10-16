/*
  hecho por francys. el javascript de la ficha de producto, lee el id de la
  dirección y pinta esa publicación, arma la galería, el selector de
  cantidad y el botón para agregar al carrito, y al final muestra hasta
  tres productos de la misma categoría
*/

/* cuántos productos relacionados mostramos debajo de la ficha */
const CANTIDAD_RELACIONADOS = 3;

/* copia el molde de la tarjeta para los productos relacionados, todo con
   textContent porque los títulos los escriben los vecinos */
function crearTarjetaRelacionada(publicacion) {
  let molde = document.getElementById("plantilla-tarjeta");
  let tarjeta = molde.content.cloneNode(true);
  let vendedor = obtenerResidente(publicacion.idResidente);
  let categoria = obtenerCategoria(publicacion.idCategoria);
  let enlace = "producto.html?id=" + publicacion.idPublicacion;

  tarjeta.querySelector(".tarjeta__imagen").src = publicacion.imagenes[0];
  tarjeta.querySelector(".tarjeta__imagen").alt = publicacion.titulo;
  if (categoria !== null) {
    tarjeta.querySelector(".etiqueta").textContent = categoria.nombre;
  }
  tarjeta.querySelector(".tarjeta__titulo a").textContent = publicacion.titulo;
  tarjeta.querySelector(".tarjeta__titulo a").href = enlace;
  tarjeta.querySelector(".tarjeta__vendedor strong").textContent = nombreCompleto(vendedor);
  tarjeta.querySelector(".tarjeta__vendedor span").textContent = textoUnidad(vendedor);
  tarjeta.querySelector(".tarjeta__precio").textContent = formatearPrecio(publicacion.precio);
  tarjeta.querySelector(".tarjeta__pie a").href = enlace;
  tarjeta.querySelector(".tarjeta__pie a").setAttribute("aria-label", "Ver " + publicacion.titulo);

  return tarjeta;
}

/* escribe los datos de la publicación en la ficha y en la tabla */
function pintarDatos(publicacion) {
  let categoria = obtenerCategoria(publicacion.idCategoria);
  let vendedor = obtenerResidente(publicacion.idResidente);

  document.title = publicacion.titulo + " · Kercado";
  document.getElementById("producto-titulo").textContent = publicacion.titulo;
  document.getElementById("producto-precio").textContent = formatearPrecio(publicacion.precio);
  document.getElementById("producto-descripcion").textContent = publicacion.descripcion;
  document.getElementById("detalle-stock").textContent = publicacion.stock + " unidades";
  document.getElementById("detalle-horario").textContent = publicacion.horario;
  if (categoria !== null) {
    document.getElementById("detalle-categoria").textContent = categoria.nombre;
  }
  document.getElementById("detalle-vendedor").textContent =
    nombreCompleto(vendedor) + " (" + textoUnidad(vendedor) + ")";
}

/* marca como elegida la miniatura que se apretó y desmarca las demás */
function marcarMiniatura(botones, elegido) {
  let i;

  for (i = 0; i < botones.length; i++) {
    botones[i].setAttribute("aria-pressed", "false");
  }
  elegido.setAttribute("aria-pressed", "true");
}

/* arma un botón por cada foto, con su imagen adentro, al apretarlo (con
   clic o con enter) cambia la foto grande, cada botón recuerda su propia
   ruta porque la función se crea dentro del for */
function armarGaleria(publicacion) {
  let principal = document.getElementById("imagen-principal");
  let caja = document.getElementById("galeria-miniaturas");
  let imagenes = publicacion.imagenes;
  let botones = [];
  let i;

  principal.src = imagenes[0];
  principal.alt = publicacion.titulo;

  /* con una sola foto no hace falta mostrar miniaturas */
  if (imagenes.length < 2) {
    caja.hidden = true;
    return;
  }

  for (i = 0; i < imagenes.length; i++) {
    let boton = document.createElement("button");
    let miniatura = document.createElement("img");
    let ruta = imagenes[i];

    boton.type = "button";
    boton.className = "galeria__boton";
    boton.setAttribute("aria-pressed", i === 0 ? "true" : "false");
    boton.setAttribute("aria-label", "Ver la foto " + (i + 1) + " de " + imagenes.length);
    miniatura.src = ruta;
    miniatura.alt = "";

    boton.addEventListener("click", function () {
      principal.src = ruta;
      marcarMiniatura(botones, boton);
    });

    boton.appendChild(miniatura);
    caja.appendChild(boton);
    botones.push(boton);
  }
}

/* el selector de cantidad, los botones suman o restan uno sin bajar de 1
   ni pasar del stock, y si se escribe el número a mano lo acomodamos */
function conectarCantidad(publicacion) {
  let campo = document.getElementById("input-cantidad");

  campo.max = publicacion.stock;
  campo.value = 1;

  document.getElementById("btn-menos").addEventListener("click", function () {
    let actual = parseInt(campo.value, 10);

    if (actual > 1) {
      campo.value = actual - 1;
    }
  });

  document.getElementById("btn-mas").addEventListener("click", function () {
    let actual = parseInt(campo.value, 10);

    if (actual < publicacion.stock) {
      campo.value = actual + 1;
    } else {
      mostrarAviso("solo quedan " + publicacion.stock + " unidades", "error");
    }
  });

  campo.addEventListener("change", function () {
    let actual = parseInt(campo.value, 10);

    if (isNaN(actual) || actual < 1) {
      campo.value = 1;
    } else if (actual > publicacion.stock) {
      campo.value = publicacion.stock;
      mostrarAviso("solo quedan " + publicacion.stock + " unidades", "error");
    }
  });
}

/* el botón de agregar, si el producto es del mismo vecino lo cambiamos por
   un mensaje, y si no hay stock lo desactivamos */
function conectarCompra(publicacion) {
  let boton = document.getElementById("btn-agregar-carrito");
  let residente = sesionActual();

  if (residente !== null && residente.idResidente === publicacion.idResidente) {
    boton.hidden = true;
    document.getElementById("bloque-cantidad").hidden = true;
    document.getElementById("mensaje-propio").hidden = false;
    return;
  }

  if (publicacion.stock < 1) {
    boton.disabled = true;
    boton.textContent = "Agotado";
    document.getElementById("bloque-cantidad").hidden = true;
    return;
  }

  boton.addEventListener("click", function () {
    let cantidad = parseInt(document.getElementById("input-cantidad").value, 10);
    let resultado;

    /* sin sesión exigirSesion lleva al registro y después vuelve aquí */
    if (!exigirSesion()) {
      return;
    }

    resultado = agregarAlCarrito(publicacion.idPublicacion, cantidad);
    if (resultado.ok) {
      mostrarAviso(resultado.mensaje, "ok");
      actualizarContadorCarrito();
    } else {
      mostrarAviso(resultado.mensaje, "error");
    }
  });
}

/* hasta tres productos activos de la misma categoría, sin contar este, si
   no hay ninguno escondemos la sección entera */
function pintarRelacionados(publicacion) {
  let grilla = document.getElementById("grilla-relacionados");
  let mismaCategoria = listarPublicaciones({ idCategoria: publicacion.idCategoria });
  let puestos = 0;
  let i;

  for (i = 0; i < mismaCategoria.length && puestos < CANTIDAD_RELACIONADOS; i++) {
    if (mismaCategoria[i].idPublicacion !== publicacion.idPublicacion) {
      grilla.appendChild(crearTarjetaRelacionada(mismaCategoria[i]));
      puestos = puestos + 1;
    }
  }

  if (puestos === 0) {
    document.getElementById("relacionados").hidden = true;
  }
}

/* aquí arranca la ficha, si el id no existe o la publicación está de
   baja mostramos el bloque vacío con el enlace al catálogo */
function iniciarFicha() {
  let publicacion = obtenerPublicacion(leerParametro("id"));

  if (publicacion === null || publicacion.estado !== "Activa") {
    document.querySelector(".ficha").hidden = true;
    document.getElementById("relacionados").hidden = true;
    document.getElementById("producto-vacio").hidden = false;
    return;
  }

  pintarDatos(publicacion);
  armarGaleria(publicacion);
  conectarCantidad(publicacion);
  conectarCompra(publicacion);
  pintarRelacionados(publicacion);
}

iniciarFicha();
