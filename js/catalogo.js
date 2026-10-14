/* anterior
  el javascript del catálogo
*/

/* el filtro de precios del catálogo

   los dos precios son opcionales, lo único que revisamos es que no sean
   negativos y que el mínimo no sea mayor que el máximo, porque así no
   saldría ningún producto */

/* nuevo
  actualizacion, el javascript del catalogo genera las tarjetas desde
  los datos de almacen.js en vez de escribirlas a mano en el html
*/

/*
  se copió el molde de la tarjeta (el template creado en catalogo.html) y
  escribimos los datos de una publicación, devolviendo la tarjeta lista para
  agregar.
*/
/* crear tarjeta */
function crearTarjeta(publicacion) {
  let molde = document.getElementById("plantilla-tarjeta");
  let tarjeta = molde.content.cloneNode(true);
  let vendedor = obtenerResidente(publicacion.idResidente);
  let categoria = obtenerCategoria(publicacion.idCategoria);
  let enlace = "producto.html?id=" + publicacion.idPublicacion;

  tarjeta.querySelector(".tarjeta__imagen").src = publicacion.imagenes[0];
  tarjeta.querySelector(".tarjeta__imagen").alt = publicacion.titulo;
  tarjeta.querySelector(".etiqueta").textContent = categoria.nombre;
  tarjeta.querySelector(".tarjeta__titulo a").textContent = publicacion.titulo;
  tarjeta.querySelector(".tarjeta__titulo a").href = enlace;
  tarjeta.querySelector(".tarjeta__vendedor strong").textContent = nombreCompleto(vendedor);
  tarjeta.querySelector(".tarjeta__vendedor span").textContent = textoUnidad(vendedor);
  tarjeta.querySelector(".tarjeta__precio").textContent = formatearPrecio(publicacion.precio);
  tarjeta.querySelector(".tarjeta__pie a").href = enlace;

  return tarjeta;
}
/* 
  vacía la grilla y la vuelve a llenar con la lista filtrada,
  como la grilla tiene la clase animada, las tarjetas entran solas.
*/
function pintarProductos(lista) {
  let grilla = document.getElementById("grilla-catalogo");
  let i;

  grilla.innerHTML = "";

  for (i = 0; i < lista.length; i++) {
    grilla.appendChild(crearTarjeta(lista[i]));
  }
}

/* genera la lista de categorias en el aside y marca la activa */
function pintarCategorias(idCategoriaActiva) {
  let listaCat = document.getElementById("lista-categorias");
  let categorias = listarCategorias();
  let html = '<li><a href="catalogo.html"';
  if (!idCategoriaActiva) {
    html += ' class="activo"';
  }
  html += '>Todas</a></li>';

  for (let i = 0; i < categorias.length; i++) {
    let cat = categorias[i];
    html += '<li><a href="catalogo.html?categoria=' + cat.idCategoria + '"';
    if (cat.idCategoria === idCategoriaActiva) {
      html += ' class="activo"';
    }
    html += '>' + cat.nombre + '</a></li>';
  }
  listaCat.innerHTML = html;
}

/* actualiza el texto de conteo y muestra el bloque vacío si no hay resultados. */
function actualizarInterfaz(lista, nombreCategoria) {
  let conteo = document.getElementById("conteo-productos");
  let bloqueVacio = document.getElementById("catalogo-vacio");
  let grilla = document.getElementById("grilla-catalogo");

  let total = lista.length;
  let mensaje = total + " producto" + (total === 1 ? "" : "s");
  if (nombreCategoria) {
    mensaje += " en " + nombreCategoria;
  }
  conteo.textContent = mensaje;

  if (total === 0) {
    bloqueVacio.hidden = false;
    grilla.hidden = true;
  } else {
    bloqueVacio.hidden = true;
    grilla.hidden = false;
    pintarProductos(lista);
  }
}

/* lee los parámetros de la URL y los inputs, aplica el filtro y actualiza la vista */
function aplicarFiltrosYMostrar() {
  let texto = leerParametro("q") || "";
  let idCategoria = leerParametro("categoria") || "";
  
  // Leemos tanto de la URL (si recargó) como de los inputs directamente
  let minUrl = leerParametro("precioMin") || document.getElementById("precio-min").value;
  let maxUrl = leerParametro("precioMax") || document.getElementById("precio-max").value;

  // Sincronizamos los inputs con los valores actuales
  if (minUrl !== "") document.getElementById("precio-min").value = minUrl;
  if (maxUrl !== "") document.getElementById("precio-max").value = maxUrl;

  let filtros = {};
  if (texto !== "") filtros.texto = texto;
  if (idCategoria !== "") filtros.idCategoria = idCategoria;
  if (minUrl !== "") filtros.precioMin = parseFloat(minUrl);
  if (maxUrl !== "") filtros.precioMax = parseFloat(maxUrl);

  let lista = listarPublicaciones(filtros);
  let categoriaObj = idCategoria !== "" ? obtenerCategoria(idCategoria) : null;

  pintarCategorias(idCategoria);
  actualizarInterfaz(lista, categoriaObj ? categoriaObj.nombre : null);
}

/* al cargar la página, aplicamos los filtros iniciales de la URL */
aplicarFiltrosYMostrar();

/* manejador para filtrar al enviar el formulario de precio sin recargar */
let formFiltro = document.getElementById("filtro-precio");
if (formFiltro) {
  formFiltro.addEventListener("submit", function(evento) {
    evento.preventDefault();
    aplicarFiltrosYMostrar();
  });
}

/* botón para limpiar filtros y volver al catálogo completo */
let btnQuitar = document.getElementById("quitar-filtros");
if (btnQuitar) {
  btnQuitar.addEventListener("click", function() {
    document.getElementById("precio-min").value = "";
    document.getElementById("precio-max").value = "";
    window.history.pushState({}, "", "catalogo.html");
    aplicarFiltrosYMostrar();
  });
}

/* ¿descartado? al abrir la página mostramos todos los productos activos
pintarProductos(listarPublicaciones()); */

/* anterior (eliminar luego, no nos sirve)
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
} */
