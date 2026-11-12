<?php
/*
  hecho por luis. el carrito del vecino, vive en la sesión y aquí se pinta
  agrupado por el vecino que vende cada producto, porque cada vendedor
  recibe su propio pedido con su propio código, desde aquí se cambian
  cantidades, se quitan productos y se confirma el pedido con el método de
  pago que acordaron
*/
require_once __DIR__ . "/app/plantilla.php";

// el carrito es solo para vecinos que ingresaron
$residente = exigirSesion();

// cada botón de la página manda su propio formulario con una accion, lo
// procesamos aquí arriba y volvemos a cargar la página para que recargar no
// repita lo que se hizo
if (seEnvioFormulario()) {
    comprobarCsrf();
    $accion = textoPost("accion");

    if ($accion === "cambiar") {
        $resultado = cambiarCantidad(enteroPost("idPublicacion"), enteroPost("cantidad"));
        if ($resultado["ok"]) {
            avisar($resultado["mensaje"]);
        } else {
            avisar($resultado["mensaje"], "error");
        }
        redirigir("carrito.php");
    }

    if ($accion === "quitar") {
        quitarDelCarrito(enteroPost("idPublicacion"));
        avisar("quitaste el producto de tu carrito");
        redirigir("carrito.php");
    }

    if ($accion === "vaciar") {
        vaciarCarrito();
        avisar("vaciaste tu carrito");
        redirigir("carrito.php");
    }

    if ($accion === "confirmar") {
        $resultado = registrarPedidos(textoPost("metodoPago"));
        if ($resultado["ok"]) {
            // el mensaje del almacén ya trae los códigos, si no los trajera
            // se los agregamos para que el vecino sepa cuáles son
            $mensaje = $resultado["mensaje"];
            if (!str_contains($mensaje, $resultado["codigos"][0])) {
                $mensaje = $mensaje . ", tus códigos son " . implode(", ", $resultado["codigos"]);
            }
            avisar($mensaje);
            redirigir("panel.php?pestana=compras");
        }
        avisar($resultado["mensaje"], "error");
        redirigir("carrito.php");
    }

    redirigir("carrito.php");
}

$grupos = carritoPorVendedor();
$total = totalCarrito();

abrirPagina("Mi carrito", "Los productos que elegiste en Kercado, agrupados por el vecino que los vende.", "carrito");
?>
    <section class="seccion">
      <div class="contenedor">
        <h1 class="titulo-seccion">Mi carrito</h1>

<?php if (count($grupos) === 0): ?>
        <!-- el carrito vacío, con un botón que lleva al catálogo -->
        <div class="vacio">
          <h2 class="vacio__titulo">Tu carrito está vacío</h2>
          <p>Agrega productos desde el catálogo y van a aparecer aquí.</p>
          <a class="boton" href="catalogo.php">Ver el catálogo</a>
        </div>
<?php else: ?>
        <p>Los productos que elegiste, agrupados por el vecino que los vende.</p>

        <!-- a la izquierda una caja por vendedor y a la derecha el resumen -->
        <div class="carrito">
          <div>
<?php foreach ($grupos as $grupo): ?>
            <section class="carrito__grupo">
              <h2 class="carrito__vendedor">Vendido por <?= e(nombreCompleto($grupo["vendedor"])) ?> · <?= e(textoUnidad($grupo["vendedor"])) ?></h2>

<?php foreach ($grupo["lineas"] as $linea): ?>
<?php $publicacion = $linea["publicacion"]; ?>
              <article class="linea-carrito">
                <img class="linea-carrito__imagen" src="<?= e($publicacion["imagenes"][0]) ?>" alt="<?= e($publicacion["titulo"]) ?>">
                <div class="linea-carrito__datos">
                  <h3 class="linea-carrito__titulo"><a href="producto.php?id=<?= e($linea["idPublicacion"]) ?>"><?= e($publicacion["titulo"]) ?></a></h3>
                  <p class="subtexto mb-0"><?= e(formatearPrecio($publicacion["precio"])) ?> cada uno</p>
                </div>

                <!-- el selector de cantidad es un formulario, los botones
                     menos y más los maneja carrito.js, que cambia el número
                     y lo envía, y sin javascript basta escribir el número y
                     presionar enter -->
                <form class="selector-cantidad linea-carrito__cantidad" action="carrito.php" method="post">
                  <?= campoCsrf() ?>
                  <input type="hidden" name="accion" value="cambiar">
                  <input type="hidden" name="idPublicacion" value="<?= e($linea["idPublicacion"]) ?>">
                  <button class="selector-cantidad__boton" type="button" data-paso="-1"
                          aria-label="Quitar una unidad de <?= e($publicacion["titulo"]) ?>">−</button>
                  <input class="selector-cantidad__numero" type="number" name="cantidad"
                         min="1" max="<?= e($publicacion["stock"]) ?>" value="<?= e($linea["cantidad"]) ?>"
                         aria-label="Cantidad de <?= e($publicacion["titulo"]) ?>">
                  <button class="selector-cantidad__boton" type="button" data-paso="1"
                          aria-label="Agregar una unidad de <?= e($publicacion["titulo"]) ?>">+</button>
                </form>

                <span class="linea-carrito__subtotal"><?= e(formatearPrecio($linea["subtotal"])) ?></span>

                <form class="linea-carrito__quitar" action="carrito.php" method="post"
                      data-confirmar="¿Quitar <?= e($publicacion["titulo"]) ?> de tu carrito?" data-titulo="Quitar producto">
                  <?= campoCsrf() ?>
                  <input type="hidden" name="accion" value="quitar">
                  <input type="hidden" name="idPublicacion" value="<?= e($linea["idPublicacion"]) ?>">
                  <button class="boton boton--texto boton--sm" type="submit"
                          aria-label="Quitar <?= e($publicacion["titulo"]) ?> del carrito">Quitar</button>
                </form>
              </article>
<?php endforeach; ?>
              <p class="subtexto mb-0">Subtotal con este vecino: <?= e(formatearPrecio($grupo["total"])) ?></p>
            </section>
<?php endforeach; ?>
          </div>

          <aside class="carrito__resumen" aria-label="Resumen del pedido">
            <h2>Resumen</h2>
            <p class="carrito__total">
              <span>Total</span>
              <span class="carrito__monto"><?= e(formatearPrecio($total)) ?></span>
            </p>

            <!-- kercado no cobra, solo deja anotado cómo van a pagarle al
                 vecino cuando reciban el producto -->
            <form id="form-confirmar" action="carrito.php" method="post" novalidate>
              <?= campoCsrf() ?>
              <input type="hidden" name="accion" value="confirmar">
              <div class="campo">
                <label for="metodo-pago">Método de pago acordado<span class="obligatorio">*</span></label>
                <select id="metodo-pago" name="metodoPago" required aria-describedby="e-metodo a-metodo">
                  <option value="">Elige cómo vas a pagar</option>
                  <option value="Efectivo contra entrega">Efectivo contra entrega</option>
                  <option value="Yape">Yape</option>
                  <option value="Plin">Plin</option>
                </select>
                <small class="campo__error" id="e-metodo"></small>
                <small class="campo__ayuda" id="a-metodo">Kercado no cobra nada, solo registra tu pedido y el método que acuerdas con cada vecino, el pago se lo haces a él cuando te entregue.</small>
              </div>
              <button class="boton boton--full" type="submit">Confirmar pedido</button>
            </form>

            <form action="carrito.php" method="post"
                  data-confirmar="Se van a quitar todos los productos de tu carrito." data-titulo="Vaciar carrito">
              <?= campoCsrf() ?>
              <input type="hidden" name="accion" value="vaciar">
              <button class="boton boton--texto boton--full" type="submit">Vaciar carrito</button>
            </form>
          </aside>
        </div>
<?php endif; ?>
      </div>
    </section>
<?php
cerrarPagina("js/carrito.js");
