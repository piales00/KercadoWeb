<?php
/*
  hecho por francys. el catálogo de productos, lee los filtros que llegan por
  la dirección (búsqueda, categoría, precio y orden), los revisa y le pide a
  almacen.php solo las publicaciones que pasan, así el filtro funciona aunque
  el navegador tenga javascript apagado y se puede compartir el enlace
*/
require_once __DIR__ . "/app/plantilla.php";

// los órdenes que aceptamos, si llega otra cosa por la dirección usamos el
// de más recientes
$ordenes = [
    "recientes" => "Más recientes",
    "precio-asc" => "Precio: menor a mayor",
    "precio-desc" => "Precio: mayor a menor",
];

$texto = textoGet("q");
$idCategoria = textoGet("categoria");
$textoMin = textoGet("min");
$textoMax = textoGet("max");
$orden = textoGet("orden");
$errores = [];
$filtro = [];

if (!array_key_exists($orden, $ordenes)) {
    $orden = "recientes";
}
$filtro["orden"] = $orden;

if ($texto !== "") {
    $filtro["texto"] = $texto;
}

// la categoría solo se usa si de verdad existe, así un enlace viejo no deja
// el catálogo vacío sin explicación
$categoriaElegida = null;
if ($idCategoria !== "") {
    $categoriaElegida = obtenerCategoria($idCategoria);
    if ($categoriaElegida === null) {
        $idCategoria = "";
    } else {
        $filtro["idCategoria"] = $idCategoria;
    }
}

// los precios pueden tener decimales, por eso revisamos con is_numeric en vez
// de enteroGet, y si están mal avisamos y no los usamos
$precioMin = null;
$precioMax = null;
if ($textoMin !== "") {
    if (!is_numeric($textoMin) || (float) $textoMin < 0) {
        $errores["min"] = "el precio mínimo tiene que ser un número de 0 para arriba";
    } else {
        $precioMin = (float) $textoMin;
    }
}
if ($textoMax !== "") {
    if (!is_numeric($textoMax) || (float) $textoMax < 0) {
        $errores["max"] = "el precio máximo tiene que ser un número de 0 para arriba";
    } else {
        $precioMax = (float) $textoMax;
    }
}
if ($precioMin !== null && $precioMax !== null && $precioMin > $precioMax) {
    $errores["min"] = "el precio mínimo no puede ser mayor que el máximo";
    $precioMin = null;
    $precioMax = null;
}
if ($precioMin !== null) {
    $filtro["precioMin"] = $precioMin;
}
if ($precioMax !== null) {
    $filtro["precioMax"] = $precioMax;
}

$publicaciones = listarPublicaciones($filtro);
$categorias = listarCategorias();

// el texto que dice cuántos productos se ven, igual que en el avance 2
$conteo = count($publicaciones) . " producto";
if (count($publicaciones) !== 1) {
    $conteo = $conteo . "s";
}
if ($categoriaElegida !== null) {
    $conteo = $conteo . " en " . $categoriaElegida["nombre"];
}
if ($texto !== "") {
    $conteo = $conteo . " para \"" . $texto . "\"";
}

abrirPagina("Catálogo", "Productos que venden los vecinos del condominio Las Palmas 357, filtrados por categoría y precio.", "catalogo");
?>
    <!-- el catálogo va en dos columnas, las categorías y los filtros a la
         izquierda, y los productos a la derecha -->
    <div class="seccion">
      <div class="contenedor layout-catalogo">
        <aside class="panel-lateral" aria-label="Categorías y filtros">
          <div class="panel-lateral__bloque">
            <h2 class="panel-lateral__titulo">Categorías</h2>
            <!-- la categoría que se está viendo lleva la clase activo y
                 aria-current para el lector de pantalla -->
            <ul class="lista-categorias">
              <li><a href="catalogo.php"<?php if ($idCategoria === "") { ?> class="activo" aria-current="true"<?php } ?>>Todas</a></li>
<?php foreach ($categorias as $categoria) { ?>
              <li><a href="catalogo.php?categoria=<?= e(urlencode($categoria["idCategoria"])) ?>"<?php if ($categoria["idCategoria"] === $idCategoria) { ?> class="activo" aria-current="true"<?php } ?>><?= e($categoria["nombre"]) ?></a></li>
<?php } ?>
            </ul>
          </div>

          <!-- todos los filtros son un solo formulario get, sin javascript se
               aplican con el botón, y catalogo.js lo envía solo al cambiar
               la categoría o el orden -->
          <div class="panel-lateral__bloque">
            <h2 class="panel-lateral__titulo">Filtrar</h2>
            <form id="filtro-catalogo" action="catalogo.php" method="get" novalidate>
              <div class="campo">
                <label for="filtro-q">Buscar</label>
                <input type="search" id="filtro-q" name="q" value="<?= e($texto) ?>" placeholder="Ej. torta">
              </div>
              <div class="campo">
                <label for="filtro-categoria">Categoría</label>
                <select id="filtro-categoria" name="categoria">
                  <option value="">Todas</option>
<?php foreach ($categorias as $categoria) { ?>
                  <option value="<?= e($categoria["idCategoria"]) ?>"<?php if ($categoria["idCategoria"] === $idCategoria) { ?> selected<?php } ?>><?= e($categoria["nombre"]) ?></option>
<?php } ?>
                </select>
              </div>
              <div class="campo">
                <label for="precio-min">Desde (S/)</label>
                <input type="number" id="precio-min" name="min" min="0" step="0.5" placeholder="0" value="<?= e($textoMin) ?>" aria-describedby="e-min"<?php if (isset($errores["min"])) { ?> class="campo-malo" aria-invalid="true"<?php } ?>>
                <small class="campo__error" id="e-min"><?php pintarErrorCampo($errores, "min"); ?></small>
              </div>
              <div class="campo">
                <label for="precio-max">Hasta (S/)</label>
                <input type="number" id="precio-max" name="max" min="0" step="0.5" placeholder="100" value="<?= e($textoMax) ?>" aria-describedby="e-max"<?php if (isset($errores["max"])) { ?> class="campo-malo" aria-invalid="true"<?php } ?>>
                <small class="campo__error" id="e-max"><?php pintarErrorCampo($errores, "max"); ?></small>
              </div>
              <div class="campo">
                <label for="filtro-orden">Ordenar por</label>
                <select id="filtro-orden" name="orden">
<?php foreach ($ordenes as $valor => $nombre) { ?>
                  <option value="<?= e($valor) ?>"<?php if ($valor === $orden) { ?> selected<?php } ?>><?= e($nombre) ?></option>
<?php } ?>
                </select>
              </div>
              <button class="boton boton--linea boton--full boton--sm" type="submit">Aplicar filtros</button>
            </form>
          </div>
        </aside>

        <div>
          <h1>Catálogo de Productos</h1>
<?php if (count($errores) > 0) { ?>
          <!-- si un precio vino mal lo decimos arriba también, y ese filtro no
               se usó -->
          <p class="mensaje mensaje--error" role="alert">Revisa el filtro de precio, no lo aplicamos porque tiene un dato mal escrito.</p>
<?php } ?>
          <p class="subtexto" id="conteo-productos"><?= e($conteo) ?></p>
          <h2 class="solo-lectores">Productos</h2>

<?php if (count($publicaciones) > 0) { ?>
          <div class="grilla-productos grilla-productos--animada" id="grilla-catalogo">
<?php foreach ($publicaciones as $publicacion) { ?>
            <article class="tarjeta">
              <figure class="tarjeta__figura">
                <img class="tarjeta__imagen" src="<?= e($publicacion["imagenes"][0]) ?>" alt="<?= e($publicacion["titulo"]) ?>">
              </figure>
              <div class="tarjeta__cuerpo">
<?php if ($publicacion["nombreCategoria"] !== null && $publicacion["nombreCategoria"] !== "") { ?>
                <span class="etiqueta"><?= e($publicacion["nombreCategoria"]) ?></span>
<?php } ?>
                <h3 class="tarjeta__titulo"><a href="producto.php?id=<?= e($publicacion["idPublicacion"]) ?>"><?= e($publicacion["titulo"]) ?></a></h3>
                <p class="tarjeta__vendedor mb-0">
                  Vendido por <strong><?= e(nombreCompleto($publicacion["vendedor"])) ?></strong> · <span><?= e(textoUnidad($publicacion["vendedor"])) ?></span>
                </p>
              </div>
              <div class="tarjeta__pie">
                <span class="tarjeta__precio"><?= e(formatearPrecio($publicacion["precio"])) ?></span>
                <a class="boton boton--sm" href="producto.php?id=<?= e($publicacion["idPublicacion"]) ?>" aria-label="Ver <?= e($publicacion["titulo"]) ?>">Ver</a>
              </div>
            </article>
<?php } ?>
          </div>
<?php } else { ?>
          <!-- cuando el filtro no deja ningún producto, el enlace vuelve al
               catálogo completo -->
          <div class="vacio">
            <h2 class="vacio__titulo">No encontramos productos</h2>
            <p>Prueba con otra búsqueda o cambia los filtros.</p>
            <a class="boton" href="catalogo.php">Quitar filtros</a>
          </div>
<?php } ?>
        </div>
      </div>
    </div>
<?php
cerrarPagina("js/catalogo.js");
