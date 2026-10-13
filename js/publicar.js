document.addEventListener("DOMContentLoaded", () => {
  // 7. Exigir sesión: si no hay usuario, redirige al registro y vuelve luego
  if (!exigirSesion()) {
    return;
  }

  const residente = sesionActual();

  // Llenar el select de categorías usando listarCategorias()
  const selectCategoria = document.getElementById("p-categoria");
  if (selectCategoria && typeof listarCategorias === "function") {
    const categorias = listarCategorias();
    categorias.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat.idCategoria;
      option.textContent = cat.nombre;
      selectCategoria.appendChild(option);
    });
  }

  // 8. Llenar el select de imagen con fotos de assets/img/catalogos/
  const selectImagen = document.getElementById("p-imagen");
  const fotosDisponibles = [
    { nombre: "Torta de chocolate", ruta: "assets/img/catalogos/torta-chocolate.jpg" },
    { nombre: "Torta miniatura 1", ruta: "assets/img/catalogos/torta-mini-1.jpg" },
    { nombre: "Torta miniatura 2", ruta: "assets/img/catalogos/torta-mini-2.jpg" },
    { nombre: "Kercado genérico", ruta: "assets/img/kercado.png" }
  ];

  if (selectImagen) {
    fotosDisponibles.forEach(foto => {
      const opt = document.createElement("option");
      opt.value = foto.ruta;
      opt.textContent = foto.nombre;
      selectImagen.appendChild(opt);
    });
  }

  // Elementos de la tarjeta de vista previa
  const inputTitulo = document.getElementById("p-titulo");
  const inputPrecio = document.getElementById("p-precio");
  const selectCatElem = document.getElementById("p-categoria");
  const selectImgElem = document.getElementById("p-imagen");

  const prevTitulo = document.getElementById("prev-titulo");
  const prevPrecio = document.getElementById("prev-precio");
  const prevCategoria = document.getElementById("prev-categoria");
  const prevImg = document.getElementById("prev-img");
  const prevVendedor = document.getElementById("prev-vendedor");
  const prevUbicacion = document.getElementById("prev-ubicacion");

  // Rellenar datos del residente actual en la vista previa
  if (residente) {
    prevVendedor.textContent = residente.nombres;
    prevUbicacion.textContent = `Torre ${residente.torre}, Dpto. ${residente.departamento}`;
  }

  // 9. Escuchar el evento input para actualizar la vista previa con textContent
  const formPublicar = document.getElementById("form-publicar");
  if (formPublicar) {
    formPublicar.addEventListener("input", () => {
      prevTitulo.textContent = inputTitulo.value.trim() || "Nombre del producto";
      
      const precioVal = parseFloat(inputPrecio.value);
      prevPrecio.textContent = !isNaN(precioVal) ? `S/ ${precioVal.toFixed(2)}` : "S/ 00.00";

      if (selectCatElem.selectedIndex > 0) {
        prevCategoria.textContent = selectCatElem.options[selectCatElem.selectedIndex].text;
      } else {
        prevCategoria.textContent = "Categoría";
      }

      if (selectImgElem.value) {
        prevImg.src = selectImgElem.value;
      }
    });

    // 9 & 10. Validación y creación de la publicación al enviar
    formPublicar.addEventListener("submit", (e) => {
      e.preventDefault();

      // Limpiar errores visuales previos
      formPublicar.querySelectorAll("input, select, textarea").forEach(el => {
        el.classList.remove("campo-malo");
      });
      formPublicar.querySelectorAll(".campo__error").forEach(el => el.remove());

      let hayErrores = false;
      const camposRequeridos = formPublicar.querySelectorAll("[required]");

      camposRequeridos.forEach(campo => {
        if (!campo.value.trim()) {
          hayErrores = true;
          if (typeof marcarError === "function") {
            marcarError(campo, "Este campo es obligatorio");
          } else {
            campo.classList.add("campo-malo");
          }
        }
      });

      if (hayErrores) {
        if (typeof mostrarAviso === "function") {
          mostrarAviso("Faltan corregir datos obligatorios, están marcados abajo.", "error");
        }
        return;
      }

      // 10. Objeto con los datos para crearPublicacion
      const nuevaPubData = {
        titulo: inputTitulo.value.trim(),
        descripcion: document.getElementById("p-descripcion").value.trim(),
        precio: parseFloat(inputPrecio.value),
        stock: parseInt(document.getElementById("p-stock").value, 10),
        horario: document.getElementById("p-horario").value.trim(),
        idCategoria: selectCategoria.value,
        imagenes: [selectImagen.value || "assets/img/kercado.png"]
      };

      const pubCreada = crearPublicacion(nuevaPubData);

      if (pubCreada && pubCreada.idPublicacion) {
        if (typeof mostrarAviso === "function") {
          mostrarAviso("¡Producto publicado con éxito!", "ok");
        }
        setTimeout(() => {
          window.location.href = `producto.html?id=${pubCreada.idPublicacion}`;
        }, 1200);
      } else {
        if (typeof mostrarAviso === "function") {
          mostrarAviso("No se pudo registrar la publicación. Intenta nuevamente.", "error");
        }
      }
    });
  }
});
