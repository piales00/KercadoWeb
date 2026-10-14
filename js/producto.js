/* el javascript de la ficha de producto, gestiona la carga de datos, 
   la galería interactiva, el selector de cantidad y la compra o carrito */

/* copia el molde de la tarjeta para los productos relacionados */
function crearTarjetaRelacionada(publicacion) {
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

/* función principal que inicializa la página de la ficha */
function iniciarFicha() {
  let id = leerParametro("id");
  let publicacion = obtenerPublicacion(id);

  let contenedorFicha = document.querySelector(".ficha");
  let bloqueVacio = document.getElementById("producto-vacio");

  /* si no existe el id o la publicación, mostramos el estado vacío */
  if (!publicacion) {
    if (contenedorFicha) contenedorFicha.hidden = true;
    if (bloqueVacio) bloqueVacio.hidden = false;
    return;
  }

  /* rellenar los datos básicos */
  document.getElementById("producto-titulo").textContent = publicacion.titulo;
  document.getElementById("producto-precio").textContent = formatearPrecio(publicacion.precio);
  document.getElementById("producto-descripcion").textContent = publicacion.descripcion;

  let categoria = obtenerCategoria(publicacion.idCategoria);
  let vendedor = obtenerResidente(publicacion.idResidente);

  document.getElementById("detalle-stock").textContent = publicacion.stock + " unidades";
  document.getElementById("detalle-horario").textContent = publicacion.horario;
  document.getElementById("detalle-categoria").textContent = categoria ? categoria.nombre : "";
  document.getElementById("detalle-vendedor").textContent = nombreCompleto(vendedor) + " (" + textoUnidad(vendedor) + ")";

  /* configurar la galería de imágenes */
  let imagenes = publicacion.imagenes;
  let imgPrincipal = document.getElementById("imagen-principal");
  let contenedorMiniaturas = document.getElementById("galeria-miniaturas");

  if (imagenes && imagenes.length > 0) {
    imgPrincipal.src = imagenes[0];
    imgPrincipal.alt = publicacion.titulo;

    let htmlMiniaturas = "";
    for (let i = 0; i < imagenes.length; i++) {
      htmlMiniaturas += '<button class="galeria__boton" type="button" aria-pressed="' + (i === 0 ? "true" : "false") + '">';
      htmlMiniaturas += '<img src="' + imagenes[i] + '" alt="' + publicacion.titulo + ' miniatura ' + (i + 1) + '">';
      htmlMiniaturas += '</button>';
    }
    contenedorMiniaturas.innerHTML = htmlMiniaturas;

    /* manejar clics en las miniaturas para cambiar la imagen principal */
    let botonesMini = contenedorMiniaturas.querySelectorAll(".galeria__boton");
    for (let i = 0; i < botonesMini.length; i++) {
      botonesMini[i].addEventListener("click", function() {
        for (let j = 0; j < botonesMini.length; j++) {
          botonesMini[j].setAttribute("aria-pressed", "false");
        }
        this.setAttribute("aria-pressed", "true");
        imgPrincipal.src = imagenes[i];
      });
    }
  }

  /* configurar el selector de cantidad */
  let inputCantidad = document.getElementById("input-cantidad");
  inputCantidad.max = publicacion.stock;
  inputCantidad.value = 1;

  document.getElementById("btn-menos").addEventListener("click", function() {
    let actual = parseInt(inputCantidad.value);
    if (actual > 1) {
      inputCantidad.value = actual - 1;
    }
  });

  document.getElementById("btn-mas").addEventListener("click", function() {
    let actual = parseInt(inputCantidad.value);
    if (actual < publicacion.stock) {
      inputCantidad.value = actual + 1;
    }
  });

  /* manejar boton de agregar al carrito o validar si es producto propio */
  let btnAgregar = document.getElementById("btn-agregar-carrito");
  let mensajePropio = document.getElementById("mensaje-propio");
  let sesion = sesionActual();

  if (sesion && sesion.idResidente === publicacion.idResidente) {
    btnAgregar.hidden = true;
    mensajePropio.hidden = false;
  } else {
    btnAgregar.addEventListener("click", function() {
      /* exigir sesión redirige al registro si no ha iniciado sesión */
      if (!exigirSesion()) {
        return;
      }
      let cantidad = parseInt(inputCantidad.value);
      let resultado = agregarAlCarrito(publicacion.idPublicacion, cantidad);
      mostrarAviso(resultado.mensaje, resultado.ok ? "ok" : "error");
      if (typeof actualizarContadorCarrito === "function") {
        actualizarContadorCarrito();
      }
    });
  }

  /* cargar productos relacionados, misma categoría, excluyendo el actual. */
  let grillaRelacionados = document.getElementById("grilla-relacionados");
  let todas = listarPublicaciones({ idCategoria: publicacion.idCategoria });
  let relacionados = [];

  for (let i = 0; i < todas.length; i++) {
    if (todas[i].idPublicacion !== publicacion.idPublicacion) {
      relacionados.push(todas[i]);
    }
  }

  /* mostrar máximo 3 relacionados */
  let htmlRelacionados = "";
  let limite = relacionados.length > 3 ? 3 : relacionados.length;
  grillaRelacionados.innerHTML = "";
  for (let i = 0; i < limite; i++) {
    grillaRelacionados.appendChild(crearTarjetaRelacionada(relacionados[i]));
  }
}

/* ejecutar al cargar la página */
iniciarFicha();