/*
  hecho por piero. el javascript de la guía de componentes, solo sirve
  para ver funcionando las piezas de ejemplo, las tarjetas hechas con el
  template, los avisos flotantes y el diálogo de confirmación
*/

/* copia el molde de la tarjeta y le escribe los datos de una publicación,
   así se generan las tarjetas del catálogo y del inicio */
function crearTarjetaDeEjemplo(publicacion) {
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

function pintarTarjetasDeEjemplo() {
  let grilla = document.getElementById("ejemplo-tarjetas");
  let publicaciones = listarPublicaciones({ idCategoria: "postres" });
  let i;

  grilla.innerHTML = "";

  for (i = 0; i < publicaciones.length && i < 3; i++) {
    grilla.appendChild(crearTarjetaDeEjemplo(publicaciones[i]));
  }
}

function conectarEjemplos() {
  document.getElementById("ejemplo-aviso-ok").addEventListener("click", function () {
    mostrarAviso("agregaste 2 unidades de Torta de Chocolate Casera a tu carrito", "ok");
  });

  document.getElementById("ejemplo-aviso-error").addEventListener("click", function () {
    mostrarAviso("solo quedan 3 unidades de Queque de naranja", "error");
  });

  document.getElementById("ejemplo-confirmar").addEventListener("click", function () {
    pedirConfirmacion(
      "¿Vaciar tu carrito?",
      "Se van a quitar todos los productos que elegiste.",
      function () {
        mostrarAviso("aceptaste, aquí la página haría lo que se confirmó", "ok");
      }
    );
  });
}

function iniciarComponentes() {
  pintarTarjetasDeEjemplo();
  conectarEjemplos();
}

iniciarComponentes();
