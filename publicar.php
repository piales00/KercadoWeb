<?php
/*
  hecho por edgar. la página para publicar un producto, el vecino llena el
  formulario con una foto propia, php revisa todo otra vez aunque el
  javascript ya lo haya revisado, guarda la foto en uploads y crea la
  publicación con crearPublicacion(), si algo está mal vuelve a pintar el
  formulario con lo que el vecino escribió y el error debajo de cada campo
*/
require_once __DIR__ . "/app/plantilla.php";

// sin sesión no se puede publicar, exigirSesion lo manda al registro y
// anota que vuelva aquí después de entrar
$residente = exigirSesion();
$categorias = listarCategorias();

// los valores empiezan vacíos y el stock en 1, si llega un formulario con
// errores se llenan con lo que escribió el vecino para no hacerle repetir
$valores = [
    "titulo" => "",
    "descripcion" => "",
    "precio" => "",
    "stock" => "1",
    "horario" => "",
    "idCategoria" => ""
];
$errores = [];

// revisa que la categoría elegida exista de verdad en la base, porque el
// select se puede cambiar desde las herramientas del navegador
function categoriaExiste(array $categorias, string $idCategoria): bool
{
    foreach ($categorias as $categoria) {
        if ($categoria["idCategoria"] === $idCategoria) {
            return true;
        }
    }
    return false;
}

// revisa cada campo con las mismas reglas que publicar.js y devuelve los
// errores con el nombre del campo como clave
function validarPublicacion(array $valores, array $categorias): array
{
    $errores = [];
    $largoTitulo = mb_strlen($valores["titulo"]);
    $largoDescripcion = mb_strlen($valores["descripcion"]);

    if ($largoTitulo < 3 || $largoTitulo > 80) {
        $errores["titulo"] = "el nombre tiene que tener entre 3 y 80 letras";
    }

    if ($largoDescripcion < 10 || $largoDescripcion > 500) {
        $errores["descripcion"] = "la descripción tiene que tener entre 10 y 500 letras";
    }

    // is_numeric evita que pase un texto como "abc", que con (float) sería 0
    if (!is_numeric($valores["precio"]) || (float) $valores["precio"] <= 0 || (float) $valores["precio"] > 9999) {
        $errores["precio"] = "el precio tiene que ser mayor a 0 y hasta S/ 9999";
    }

    // ctype_digit solo acepta números enteros sin signo ni punto, no se
    // venden media torta
    if (!ctype_digit($valores["stock"]) || (int) $valores["stock"] < 1 || (int) $valores["stock"] > 999) {
        $errores["stock"] = "escribe cuántas unidades tienes, un número entero de 1 a 999";
    }

    if ($valores["horario"] === "") {
        $errores["horario"] = "escribe en qué horario entregas";
    } elseif (mb_strlen($valores["horario"]) > 40) {
        $errores["horario"] = "el horario puede tener hasta 40 letras";
    }

    if (!categoriaExiste($categorias, $valores["idCategoria"])) {
        $errores["idCategoria"] = "elige en qué categoría sale tu producto";
    }

    return $errores;
}

// devuelve el atributo aria-invalid si ese campo tiene error, así el
// lector de pantalla avisa que el dato está mal
function marcaInvalido(array $errores, string $campo): string
{
    if (isset($errores[$campo])) {
        return ' aria-invalid="true"';
    }
    return "";
}

// la clase campo-malo es la misma que pone marcarError en javascript, para
// que el error del servidor se vea igual que el del navegador
function claseInvalido(array $errores, string $campo): string
{
    if (isset($errores[$campo])) {
        return ' class="campo-malo"';
    }
    return "";
}

if (seEnvioFormulario()) {
    comprobarCsrf();

    foreach ($valores as $campo => $valor) {
        $valores[$campo] = textoPost($campo);
    }

    $errores = validarPublicacion($valores, $categorias);
    $rutaImagen = null;

    // la foto solo se guarda si lo demás está bien, así no quedan archivos
    // sueltos en uploads por un formulario que igual se va a rechazar
    if (count($errores) === 0) {
        try {
            $rutaImagen = recibirImagen("imagen");
            if ($rutaImagen === null) {
                $errores["imagen"] = "sube una foto de tu producto";
            }
        } catch (RuntimeException $error) {
            $errores["imagen"] = $error->getMessage();
        }
    }

    if (count($errores) === 0) {
        $resultado = crearPublicacion([
            "titulo" => $valores["titulo"],
            "descripcion" => $valores["descripcion"],
            "precio" => (float) $valores["precio"],
            "stock" => (int) $valores["stock"],
            "horario" => $valores["horario"],
            "idCategoria" => $valores["idCategoria"],
            "imagenes" => [$rutaImagen]
        ]);

        if ($resultado["ok"]) {
            avisar("publicaste " . $valores["titulo"] . ", tus vecinos ya lo ven en el catálogo");
            redirigir("producto.php?id=" . $resultado["idPublicacion"]);
        }

        avisar($resultado["mensaje"], "error");
        redirigir("publicar.php");
    }
}

abrirPagina("Publicar producto", "Publica un producto para que tus vecinos del condominio lo vean en el catálogo de Kercado.", "publicar");
?>
    <section class="seccion">
      <div class="contenedor">
        <h1 class="titulo-seccion">Publicar producto</h1>
        <p class="subtexto">Cuéntales a tus vecinos qué vendes, cuánto cuesta y en qué horario lo entregas.</p>

        <!-- el formulario va a la izquierda y la vista previa a la derecha,
             así el vecino ve cómo va a quedar su tarjeta en el catálogo
             mientras escribe -->
        <div class="layout-publicar mt-3">

          <!-- novalidate para que los errores los muestre publicar.js debajo
               de cada campo, y multipart porque el formulario lleva la foto -->
          <form class="formulario" id="form-publicar" action="publicar.php" method="post" enctype="multipart/form-data" novalidate>
            <?= campoCsrf() ?>
            <!-- aquí se escribe cuántos datos faltan corregir -->
<?php if (count($errores) > 0) { ?>
            <p class="mensaje mensaje--error" id="aviso-publicar" aria-live="polite">Revisa los datos marcados más abajo, hay <?= count($errores) ?> por corregir.</p>
<?php } else { ?>
            <p class="mensaje" id="aviso-publicar" aria-live="polite"></p>
<?php } ?>

            <fieldset>
              <legend>Detalles de la publicación</legend>

              <div class="campo">
                <label for="p-titulo">Nombre del producto <span class="obligatorio">*</span></label>
                <input type="text" id="p-titulo" name="titulo" maxlength="80" required
                       value="<?= e($valores["titulo"]) ?>"<?= claseInvalido($errores, "titulo") ?><?= marcaInvalido($errores, "titulo") ?>
                       aria-describedby="e-titulo a-titulo">
                <small class="campo__error" id="e-titulo"><?php pintarErrorCampo($errores, "titulo"); ?></small>
                <small class="campo__ayuda" id="a-titulo">Por ejemplo, Torta de chocolate casera. De 3 a 80 letras.</small>
              </div>

              <div class="campo">
                <label for="p-categoria">Categoría <span class="obligatorio">*</span></label>
                <select id="p-categoria" name="idCategoria" required<?= claseInvalido($errores, "idCategoria") ?><?= marcaInvalido($errores, "idCategoria") ?> aria-describedby="e-categoria">
                  <option value="">Elige una categoría</option>
<?php foreach ($categorias as $categoria) { ?>
                  <option value="<?= e($categoria["idCategoria"]) ?>"<?= $categoria["idCategoria"] === $valores["idCategoria"] ? " selected" : "" ?>><?= e($categoria["nombre"]) ?></option>
<?php } ?>
                </select>
                <small class="campo__error" id="e-categoria"><?php pintarErrorCampo($errores, "idCategoria"); ?></small>
              </div>

              <div class="campo-fila">
                <div class="campo">
                  <label for="p-precio">Precio en soles <span class="obligatorio">*</span></label>
                  <input type="number" id="p-precio" name="precio" min="0.1" max="9999" step="0.01" required
                         value="<?= e($valores["precio"]) ?>"<?= claseInvalido($errores, "precio") ?><?= marcaInvalido($errores, "precio") ?>
                         aria-describedby="e-precio">
                  <small class="campo__error" id="e-precio"><?php pintarErrorCampo($errores, "precio"); ?></small>
                </div>
                <div class="campo">
                  <label for="p-stock">Unidades disponibles <span class="obligatorio">*</span></label>
                  <input type="number" id="p-stock" name="stock" min="1" max="999" step="1" required
                         value="<?= e($valores["stock"]) ?>"<?= claseInvalido($errores, "stock") ?><?= marcaInvalido($errores, "stock") ?>
                         aria-describedby="e-stock">
                  <small class="campo__error" id="e-stock"><?php pintarErrorCampo($errores, "stock"); ?></small>
                </div>
              </div>

              <div class="campo">
                <label for="p-horario">Horario de entrega <span class="obligatorio">*</span></label>
                <input type="text" id="p-horario" name="horario" maxlength="40" required
                       value="<?= e($valores["horario"]) ?>"<?= claseInvalido($errores, "horario") ?><?= marcaInvalido($errores, "horario") ?>
                       aria-describedby="e-horario a-horario">
                <small class="campo__error" id="e-horario"><?php pintarErrorCampo($errores, "horario"); ?></small>
                <small class="campo__ayuda" id="a-horario">Por ejemplo, 10:00 a 18:00.</small>
              </div>

              <!-- la foto ahora la sube el vecino, el navegador no puede
                   dejarla escrita si el formulario vuelve con errores, por
                   eso hay que elegirla otra vez -->
              <div class="campo">
                <label for="p-imagen">Foto del producto <span class="obligatorio">*</span></label>
                <input type="file" id="p-imagen" name="imagen" accept="image/jpeg,image/png,image/webp" required<?= claseInvalido($errores, "imagen") ?><?= marcaInvalido($errores, "imagen") ?>
                       aria-describedby="e-imagen a-imagen">
                <small class="campo__error" id="e-imagen"><?php pintarErrorCampo($errores, "imagen"); ?></small>
                <small class="campo__ayuda" id="a-imagen">JPG, PNG o WEBP de hasta 2 MB.</small>
              </div>

              <div class="campo">
                <label for="p-descripcion">Descripción <span class="obligatorio">*</span></label>
                <textarea id="p-descripcion" name="descripcion" maxlength="500" required<?= claseInvalido($errores, "descripcion") ?><?= marcaInvalido($errores, "descripcion") ?>
                          aria-describedby="e-descripcion"><?= e($valores["descripcion"]) ?></textarea>
                <small class="campo__error" id="e-descripcion"><?php pintarErrorCampo($errores, "descripcion"); ?></small>
              </div>
            </fieldset>

            <button class="boton boton--full mt-3" type="submit">Publicar producto</button>
          </form>

          <!-- la vista previa es una tarjeta igual a la del catálogo, la
               cambia publicar.js con cada letra que escribe el vecino -->
          <aside class="panel-lateral" aria-labelledby="titulo-vista-previa">
            <h2 class="panel-lateral__titulo" id="titulo-vista-previa">Así se verá en el catálogo</h2>
            <article class="tarjeta">
              <figure class="tarjeta__figura">
                <img class="tarjeta__imagen" id="prev-imagen" src="assets/img/kercado.png"
                     alt="Foto de ejemplo para la vista previa">
              </figure>
              <div class="tarjeta__cuerpo">
                <span class="etiqueta" id="prev-categoria">Categoría</span>
                <h3 class="tarjeta__titulo" id="prev-titulo">Nombre del producto</h3>
                <p class="tarjeta__vendedor mb-0">
                  Vendido por <strong><?= e(nombreCompleto($residente)) ?></strong> · <span><?= e(textoUnidad($residente)) ?></span>
                </p>
              </div>
              <div class="tarjeta__pie">
                <span class="tarjeta__precio" id="prev-precio">S/ 0.00</span>
              </div>
            </article>
          </aside>
        </div>
      </div>
    </section>
<?php
cerrarPagina("js/publicar.js");
