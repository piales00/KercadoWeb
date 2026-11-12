<?php
/*
  hecho por francys. la ficha de un producto, lee el id de la dirección, pinta
  la galería, el precio, el stock y el vendedor, y recibe el formulario para
  agregar al carrito, si el producto no existe o ya no está activo mostramos
  un mensaje con el código 404
*/
require_once __DIR__ . "/app/plantilla.php";

// cuántos productos parecidos mostramos debajo de la ficha
const CANTIDAD_RELACIONADOS = 3;

// si llegó el formulario de agregar lo procesamos antes de pintar nada,
// porque redirigir() solo funciona si todavía no salió html
if (seEnvioFormulario() && textoPost("accion") === "agregar") {
    comprobarCsrf();
    $idPublicacion = enteroPost("idPublicacion");

    // sin sesión exigirSesion lo manda a registro y después vuelve aquí
    exigirSesion();

    // el precio y el stock los revisa almacen.php con la base, nunca los
    // tomamos del formulario
    $resultado = agregarAlCarrito($idPublicacion, enteroPost("cantidad"));
    if ($resultado["ok"]) {
        avisar($resultado["mensaje"], "ok");
    } else {
        avisar($resultado["mensaje"], "error");
    }
    redirigir("producto.php?id=" . $idPublicacion);
}

$publicacion = obtenerPublicacion(enteroGet("id"));

if ($publicacion === null || $publicacion["estado"] !== "Activa") {
    http_response_code(404);
    abrirPagina("Producto no encontrado", "El producto que buscas no existe o ya no está disponible.", "producto");
?>
    <section class="seccion">
      <div class="contenedor">
        <div class="vacio">
          <h1 class="vacio__titulo">Producto no encontrado</h1>
          <p>El producto que buscas no existe o ya no está disponible.</p>
          <a class="boton" href="catalogo.php">Ir al catálogo</a>
        </div>
      </div>
    </section>
<?php
    cerrarPagina();
    exit;
}

$residente = sesionActual();
$esPropia = $residente !== null && (int) $residente["idResidente"] === (int) $publicacion["idResidente"];
$stock = (int) $publicacion["stock"];
$imagenes = $publicacion["imagenes"];

// hasta tres productos activos de la misma categoría, sin contar este
$relacionados = [];
if ($publicacion["idCategoria"] !== null) {
    $mismaCategoria = listarPublicaciones(["idCategoria" => $publicacion["idCategoria"]]);
    foreach ($mismaCategoria as $otra) {
        if ((int) $otra["idPublicacion"] !== (int) $publicacion["idPublicacion"] && count($relacionados) < CANTIDAD_RELACIONADOS) {
            $relacionados[] = $otra;
        }
    }
}

abrirPagina($publicacion["titulo"], $publicacion["descripcion"], "producto");
?>
    <section class="seccion">
      <div class="contenedor">

        <!-- la ficha va en dos columnas, la galería a la izquierda y los datos
             con el botón de compra a la derecha -->
        <div class="ficha">
          <div class="galeria">
            <figure class="galeria__principal">
              <img id="imagen-principal" src="<?= e($imagenes[0]) ?>" alt="<?= e($publicacion["titulo"]) ?>">
            </figure>
<?php if (count($imagenes) > 1) { ?>
            <!-- una miniatura por foto, son botones reales para que funcionen
                 con el teclado, producto.js cambia la foto grande y marca
                 aria-pressed, sin javascript quedan escondidas -->
            <div class="galeria__miniaturas" id="galeria-miniaturas" hidden>
<?php foreach ($imagenes as $posicion => $ruta) { ?>
              <button class="galeria__boton" type="button" data-ruta="<?= e($ruta) ?>" aria-pressed="<?= $posicion === 0 ? "true" : "false" ?>" aria-label="Ver la foto <?= $posicion + 1 ?> de <?= count($imagenes) ?>">
                <img src="<?= e($ruta) ?>" alt="">
              </button>
<?php } ?>
            </div>
<?php } ?>
          </div>

          <div class="ficha__datos">
            <h1 class="ficha__titulo"><?= e($publicacion["titulo"]) ?></h1>
            <p class="ficha__precio"><?= e(formatearPrecio($publicacion["precio"])) ?></p>
            <p class="ficha__descripcion"><?= e($publicacion["descripcion"]) ?></p>

            <!-- th con scope="row" porque cada fila tiene su propio encabezado -->
            <h2 class="mt-3">Ficha del producto</h2>
            <div class="tabla-scroll mb-3">
              <table class="tabla tabla--ficha">
                <caption>Información de la publicación</caption>
                <tbody>
                  <tr><th scope="row">Stock disponible</th><td><?= e($stock) ?> unidades</td></tr>
                  <tr><th scope="row">Horario de atención</th><td><?= e($publicacion["horario"]) ?></td></tr>
                  <tr><th scope="row">Categoría</th><td><?= e($publicacion["nombreCategoria"] ?? "Sin categoría") ?></td></tr>
                  <tr><th scope="row">Vendido por</th><td><?= e(nombreCompleto($publicacion["vendedor"])) ?> (<?= e(textoUnidad($publicacion["vendedor"])) ?>)</td></tr>
                </tbody>
              </table>
            </div>

<?php if ($esPropia) { ?>
            <!-- un vecino no se compra a sí mismo, le mostramos el camino a
                 su panel donde administra esta publicación -->
            <div class="ficha__acciones">
              <p class="mensaje">Esta es tu publicación. <a href="panel.php?pestana=publicaciones">Ver mis publicaciones en el panel</a></p>
            </div>
<?php } elseif ($stock < 1) { ?>
            <div class="ficha__acciones">
              <button class="boton boton--lg" type="button" disabled>Agotado</button>
            </div>
<?php } else { ?>
            <!-- el formulario de compra, el vecino elige la cantidad y el
                 servidor revisa el stock otra vez al recibirlo -->
            <form id="form-agregar" action="producto.php?id=<?= e($publicacion["idPublicacion"]) ?>" method="post">
              <?= campoCsrf() ?>
              <input type="hidden" name="accion" value="agregar">
              <input type="hidden" name="idPublicacion" value="<?= e($publicacion["idPublicacion"]) ?>">
              <div class="selector-cantidad mb-3">
                <button class="selector-cantidad__boton" type="button" id="btn-menos" aria-label="Quitar una unidad">−</button>
                <input class="selector-cantidad__numero" type="number" id="input-cantidad" name="cantidad" value="1" min="1" max="<?= e($stock) ?>" aria-label="Cantidad">
                <button class="selector-cantidad__boton" type="button" id="btn-mas" aria-label="Agregar una unidad">+</button>
              </div>
              <div class="ficha__acciones">
                <button class="boton boton--lg" type="submit">Agregar al carrito</button>
              </div>
            </form>
<?php } ?>
          </div>
        </div>

<?php if (count($relacionados) > 0) { ?>
        <section class="mt-4" aria-labelledby="titulo-relacionados">
          <h2 class="titulo-seccion" id="titulo-relacionados">También te puede interesar</h2>
          <div class="grilla-productos">
<?php foreach ($relacionados as $otra) { ?>
            <article class="tarjeta">
              <figure class="tarjeta__figura">
                <img class="tarjeta__imagen" src="<?= e($otra["imagenes"][0]) ?>" alt="<?= e($otra["titulo"]) ?>">
              </figure>
              <div class="tarjeta__cuerpo">
                <span class="etiqueta"><?= e($otra["nombreCategoria"]) ?></span>
                <h3 class="tarjeta__titulo"><a href="producto.php?id=<?= e($otra["idPublicacion"]) ?>"><?= e($otra["titulo"]) ?></a></h3>
                <p class="tarjeta__vendedor mb-0">
                  Vendido por <strong><?= e(nombreCompleto($otra["vendedor"])) ?></strong> · <span><?= e(textoUnidad($otra["vendedor"])) ?></span>
                </p>
              </div>
              <div class="tarjeta__pie">
                <span class="tarjeta__precio"><?= e(formatearPrecio($otra["precio"])) ?></span>
                <a class="boton boton--sm" href="producto.php?id=<?= e($otra["idPublicacion"]) ?>" aria-label="Ver <?= e($otra["titulo"]) ?>">Ver</a>
              </div>
            </article>
<?php } ?>
          </div>
        </section>
<?php } ?>

      </div>
    </section>
<?php
cerrarPagina("js/producto.js");
