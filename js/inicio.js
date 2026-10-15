/*
  hecho por edgar. el javascript de la página de inicio, llena "lo más
  reciente" con las cuatro publicaciones más nuevas, hace que las secciones
  aparezcan al bajar y, si el vecino ya entró, cambia el botón de la portada
  para llevarlo a su panel
*/

/* cuántas publicaciones mostramos en lo más reciente */
const CANTIDAD_RECIENTES = 4;

/* copia el molde de la tarjeta y le escribe los datos de una publicación,
   todo con textContent porque los títulos los escriben los vecinos */
function crearTarjeta(publicacion) {
  let molde = document.getElementById("plantilla-tarjeta");
  let tarjeta = molde.content.cloneNode(true);
  let vendedor = obtenerResidente(publicacion.idResidente);
  let categoria = obtenerCategoria(publicacion.idCategoria);
  let enlace = "producto.html?id=" + publicacion.idPublicacion;
  let imagen = tarjeta.querySelector(".tarjeta__imagen");

  imagen.src = publicacion.imagenes[0];
  imagen.alt = publicacion.titulo;
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

/* listarPublicaciones ya las devuelve de la más nueva a la más antigua,
   así que basta con tomar las primeras */
function pintarRecientes() {
  let grilla = document.getElementById("ultimas-publicaciones");
  let publicaciones = listarPublicaciones({});
  let i;

  for (i = 0; i < publicaciones.length && i < CANTIDAD_RECIENTES; i++) {
    grilla.appendChild(crearTarjeta(publicaciones[i]));
  }
}

/* si el vecino ya inició sesión no tiene sentido mandarlo al catálogo
   como a un visitante, lo saludamos y lo llevamos a su panel */
function cambiarBotonPortada() {
  let residente = sesionActual();
  let boton = document.getElementById("boton-portada");

  if (residente !== null) {
    boton.textContent = "Hola, " + residente.nombres + ", ve tu panel";
    boton.href = "panel.html";
  }
}

/* cada sección con la clase revelar empieza escondida, el observador
   avisa cuando entra en la pantalla y ahí le ponemos revelar--visible, el
   css hace el movimiento y lo apaga para quien no quiere animaciones */
function revelarAlBajar() {
  let secciones = document.querySelectorAll(".revelar");
  let observador;
  let i;

  /* si el navegador es muy antiguo y no tiene el observador, las
     mostramos todas de una vez para que nada quede escondido */
  if (!("IntersectionObserver" in window)) {
    for (i = 0; i < secciones.length; i++) {
      secciones[i].classList.add("revelar--visible");
    }
    return;
  }

  observador = new IntersectionObserver(function (entradas) {
    let j;

    for (j = 0; j < entradas.length; j++) {
      if (entradas[j].isIntersecting) {
        entradas[j].target.classList.add("revelar--visible");
        observador.unobserve(entradas[j].target);
      }
    }
  }, { threshold: 0.15 });

  for (i = 0; i < secciones.length; i++) {
    observador.observe(secciones[i]);
  }
}

function iniciarInicio() {
  pintarRecientes();
  cambiarBotonPortada();
  revelarAlBajar();
}

iniciarInicio();
