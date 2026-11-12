/*
  hecho por edgar. el javascript de la página de inicio, ahora las tarjetas
  y el botón de la portada los imprime php, así que aquí solo queda lo de
  la interfaz, que las secciones aparezcan suavemente al bajar
*/

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

revelarAlBajar();
