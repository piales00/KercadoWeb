/*
  hecho por francys. el javascript del catálogo, genera las tarjetas desde
  los datos guardados en vez de escribirlas a mano en el html, y filtra por
  categoría, por precio y por lo que se escribió en el buscador de la
  cabecera, todo sin recargar la página
*/

/* copia el molde de la tarjeta que está en catalogo.html, le escribe los
   datos de una publicación con textContent y la devuelve lista */
function crearTarjeta(publicacion) {
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

/* vacía la grilla y la vuelve a llenar con la lista filtrada, como la
   grilla tiene la clase animada, las tarjetas entran solas */
function pintarProductos(lista) {
  let grilla = document.getElementById("grilla-catalogo");
  let i;

  grilla.innerHTML = "";

  for (i = 0; i < lista.length; i++) {
    grilla.appendChild(crearTarjeta(lista[i]));
  }
}

/* arma un enlace de la lista de categorías, el activo lleva la clase que
   lo pinta y aria-current para el lector de pantalla */
function crearEnlaceCategoria(texto, direccion, activo) {
  let item = document.createElement("li");
  let enlace = document.createElement("a");

  enlace.href = direccion;
  enlace.textContent = texto;
  if (activo) {
    enlace.className = "activo";
    enlace.setAttribute("aria-current", "true");
  }

  item.appendChild(enlace);
  return item;
}

/* genera la lista de categorías del aside, primero "Todas" y después una
   por cada categoría guardada, cada una con su enlace real */
function pintarCategorias(idCategoriaActiva) {
  let lista = document.getElementById("lista-categorias");
  let categorias = listarCategorias();
  let i;

  lista.innerHTML = "";
  lista.appendChild(crearEnlaceCategoria("Todas", "catalogo.html", idCategoriaActiva === ""));

  for (i = 0; i < categorias.length; i++) {
    lista.appendChild(crearEnlaceCategoria(
      categorias[i].nombre,
      "catalogo.html?categoria=" + categorias[i].idCategoria,
      categorias[i].idCategoria === idCategoriaActiva
    ));
  }
}

/* revisa los dos precios del filtro, que no sean negativos y que el mínimo
   no pase al máximo, devuelve true si se puede filtrar */
function validarFiltro() {
  let textoMin = document.getElementById("precio-min").value;
  let textoMax = document.getElementById("precio-max").value;
  let minimo = parseFloat(textoMin);
  let maximo = parseFloat(textoMax);
  let aviso = document.getElementById("aviso-filtro");

  aviso.className = "mensaje";
  aviso.textContent = "";
  document.getElementById("precio-min").classList.remove("campo-malo");
  document.getElementById("precio-max").classList.remove("campo-malo");

  if (textoMin !== "" && minimo < 0) {
    document.getElementById("precio-min").classList.add("campo-malo");
    aviso.className = "mensaje mensaje--error";
    aviso.textContent = "el precio mínimo no puede ser negativo";
    return false;
  }

  if (textoMax !== "" && maximo < 0) {
    document.getElementById("precio-max").classList.add("campo-malo");
    aviso.className = "mensaje mensaje--error";
    aviso.textContent = "el precio máximo no puede ser negativo";
    return false;
  }

  if (textoMin !== "" && textoMax !== "" && minimo > maximo) {
    document.getElementById("precio-min").classList.add("campo-malo");
    document.getElementById("precio-max").classList.add("campo-malo");
    aviso.className = "mensaje mensaje--error";
    aviso.textContent = "el precio mínimo no puede ser mayor que el máximo";
    return false;
  }

  return true;
}

/* escribe cuántos productos se ven y muestra el bloque vacío si el filtro
   no dejó ninguno */
function actualizarConteo(lista, categoria, texto) {
  let mensaje = lista.length + " producto";

  if (lista.length !== 1) {
    mensaje = mensaje + "s";
  }
  if (categoria !== null) {
    mensaje = mensaje + " en " + categoria.nombre;
  }
  if (texto !== "") {
    mensaje = mensaje + " para \"" + texto + "\"";
  }
  document.getElementById("conteo-productos").textContent = mensaje;

  document.getElementById("catalogo-vacio").hidden = lista.length > 0;
  document.getElementById("grilla-catalogo").hidden = lista.length === 0;
}

/* junta la categoría y el texto de la dirección con los precios del
   formulario, pide la lista filtrada al almacén y la pinta */
function aplicarFiltros() {
  let texto = leerParametro("q") || "";
  let idCategoria = leerParametro("categoria") || "";
  let textoMin = document.getElementById("precio-min").value;
  let textoMax = document.getElementById("precio-max").value;
  let filtro = {};
  let lista;

  if (texto !== "") {
    filtro.texto = texto;
  }
  if (idCategoria !== "") {
    filtro.idCategoria = idCategoria;
  }
  if (textoMin !== "") {
    filtro.precioMin = parseFloat(textoMin);
  }
  if (textoMax !== "") {
    filtro.precioMax = parseFloat(textoMax);
  }

  lista = listarPublicaciones(filtro);
  pintarCategorias(idCategoria);
  actualizarConteo(lista, obtenerCategoria(idCategoria), texto);
  pintarProductos(lista);
}

/* el formulario de precio filtra al enviarlo y también al cambiar un
   número, sin recargar, solo si los precios están bien */
function alCambiarPrecio(evento) {
  evento.preventDefault();

  if (validarFiltro()) {
    aplicarFiltros();
  }
}

/* el botón quitar filtros borra los precios, limpia la dirección y el
   buscador, y vuelve a mostrar todo el catálogo */
function quitarFiltros() {
  document.getElementById("precio-min").value = "";
  document.getElementById("precio-max").value = "";
  document.getElementById("q").value = "";
  window.history.pushState({}, "", "catalogo.html");
  validarFiltro();
  aplicarFiltros();
}

function iniciarCatalogo() {
  let formulario = document.getElementById("filtro-precio");

  formulario.addEventListener("submit", alCambiarPrecio);
  formulario.addEventListener("change", alCambiarPrecio);
  document.getElementById("quitar-filtros").addEventListener("click", quitarFiltros);
  aplicarFiltros();
}

iniciarCatalogo();
