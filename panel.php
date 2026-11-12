<?php
/*
  hecho por piero. este es el panel del vecino, en una sola página ve lo que
  le compró a otros vecinos, los pedidos que le llegaron y lo que tiene
  publicado, porque comprar y vender son parte de la misma cuenta, desde
  aquí el vendedor cambia el estado de sus pedidos y da de baja lo que ya no
  vende
*/
require_once __DIR__ . "/app/plantilla.php";

$vecino = exigirSesion();

// los dos formularios del panel llegan aquí, los procesamos antes de pintar
// nada y volvemos a la misma pestaña para que el vecino vea cómo quedó
if (seEnvioFormulario()) {
    comprobarCsrf();
    $accion = textoPost("accion");

    if ($accion === "estado-pedido") {
        $estado = textoPost("estado");
        $motivo = textoPost("motivo");

        // el motivo lo pide también javascript, pero lo volvemos a revisar
        // aquí porque el comprador lo va a leer en sus compras
        if ($estado === "Cancelado" && $motivo === "") {
            avisar("escribe por qué cancelas el pedido", "error");
        } else {
            $resultado = cambiarEstadoPedido(enteroPost("idPedido"), $estado, $motivo);
            avisar($resultado["mensaje"], $resultado["ok"] ? "ok" : "error");
        }
        redirigir("panel.php?pestana=ventas");
    }

    if ($accion === "baja") {
        $resultado = darDeBajaPublicacion(enteroPost("idPublicacion"));
        avisar($resultado["mensaje"], $resultado["ok"] ? "ok" : "error");
        redirigir("panel.php?pestana=publicaciones");
    }

    redirigir("panel.php");
}

$compras = pedidosDelComprador($vecino["idResidente"]);
$ventas = pedidosDelVendedor($vecino["idResidente"]);
$publicaciones = publicacionesDelVendedor($vecino["idResidente"]);

// la pestaña abierta viene en la dirección, así funciona aunque no haya
// javascript y se puede compartir el enlace, si viene otra cosa van las compras
$pestanas = [
    "compras" => "Mis compras",
    "ventas" => "Mis ventas",
    "publicaciones" => "Mis publicaciones",
];
$pestanaActiva = pestanaPedida($pestanas);

function pestanaPedida(array $pestanas): string
{
    $pedida = textoGet("pestana");

    if (isset($pestanas[$pedida])) {
        return $pedida;
    }
    return "compras";
}

// el método y el estado del pago juntos, como efectivo contra entrega ·
// por pagar, si el pedido no tuviera pago no se rompe la tabla
function textoPago(?array $pago): string
{
    if ($pago === null) {
        return "";
    }
    return $pago["metodo"] . " · " . $pago["estado"];
}

function textoStock(int $stock): string
{
    if ($stock === 0) {
        return "sin stock";
    }
    if ($stock === 1) {
        return "1 unidad";
    }
    return $stock . " unidades";
}

// imprime la fila que va debajo de un pedido con los productos, el pago y
// con quién coordinar, empieza visible para que sin javascript se pueda leer,
// panel.js la esconde y la abre con el botón ver detalle
function pintarDetalle(array $pedido, string $idFila, int $columnas, string $contacto): void
{
    ?>
            <tr class="tabla__detalle" id="<?= e($idFila) ?>" data-detalle>
              <td colspan="<?= $columnas ?>">
                <ul class="detalle-pedido">
                  <?php foreach ($pedido["detalles"] as $linea): ?>
                  <li>
                    <span><?= e($linea["cantidad"] . " × " . $linea["titulo"]) ?></span>
                    <strong><?= e(formatearPrecio($linea["subtotal"])) ?></strong>
                  </li>
                  <?php endforeach; ?>
                </ul>
                <p class="subtexto mb-0"><?= e($contacto) ?></p>
                <?php if ($pedido["estado"] === "Cancelado" && $pedido["motivoCancelacion"] !== ""): ?>
                <p class="subtexto mb-0">El vendedor canceló el pedido porque <?= e($pedido["motivoCancelacion"]) ?></p>
                <?php endif; ?>
              </td>
            </tr>
    <?php
}

// el botón que abre el detalle, nace escondido porque sin javascript no
// haría nada y el detalle ya se ve abierto
function pintarBotonDetalle(array $pedido, string $idFila): void
{
    ?>
                <button class="boton boton--texto boton--sm" type="button" hidden
                        data-ver aria-expanded="true" aria-controls="<?= e($idFila) ?>"
                        aria-label="<?= e("Ver detalle del pedido " . $pedido["codigo"]) ?>">Ocultar detalle</button>
    <?php
}

abrirPagina("Mi panel", "Tus compras, tus ventas y tus publicaciones en Kercado.", "panel");
?>

    <!-- primero saludamos al vecino para que sepa con qué cuenta entró, con
         su unidad y cuántos pedidos y publicaciones tiene -->
    <section class="seccion">
      <div class="contenedor">
        <div class="fila-titulo">
          <h1 class="titulo-seccion">Mi panel</h1>
          <a class="boton" href="publicar.php">Publicar producto</a>
        </div>
        <p>
          Hola, <strong><?= e(nombreCompleto($vecino)) ?></strong> · <?= e(textoUnidad($vecino)) ?>.
          Tienes <?= count($compras) ?> <?= count($compras) === 1 ? "compra" : "compras" ?>,
          <?= count($ventas) ?> <?= count($ventas) === 1 ? "pedido recibido" : "pedidos recibidos" ?>
          y <?= count($publicaciones) ?> <?= count($publicaciones) === 1 ? "publicación" : "publicaciones" ?>.
        </p>

        <!-- este aviso le explica al vecino que el pago y la entrega los
             coordina él mismo con la otra persona, porque kercado solo guarda
             el registro del pedido -->
        <div class="aviso">
          <p>
            Kercado registra tus pedidos y el método de pago que acordaste
            (efectivo contra entrega, Yape o Plin), pero no cobra ni hace la
            entrega. Eso lo coordinas directamente con tu vecino.
          </p>
        </div>

        <!-- las tres pestañas del panel, profesor, cada una es un enlace a
             panel.php?pestana=... para que funcione sin javascript, y
             panel.js las cambia sin recargar, aria-selected dice cuál está
             elegida y aria-controls qué parte muestra -->
        <div class="pestanas" role="tablist" aria-label="Secciones del panel">
          <?php foreach ($pestanas as $clave => $texto): ?>
          <a class="pestanas__boton" role="tab" id="pestana-<?= $clave ?>"
             href="panel.php?pestana=<?= $clave ?>" data-pestana="<?= $clave ?>"
             aria-controls="mis-<?= $clave ?>"
             aria-selected="<?= $clave === $pestanaActiva ? "true" : "false" ?>"
             <?= $clave === $pestanaActiva ? "" : 'tabindex="-1"' ?>><?= e($texto) ?></a>
          <?php endforeach; ?>
        </div>


        <!-- en esta pestaña van las compras del vecino, cada fila es un
             pedido que hizo, con la fecha, a quién le compró, cuánto fue,
             cómo acordó pagar y cómo va -->
        <div class="pestanas__panel" id="mis-compras" role="tabpanel"
             aria-labelledby="pestana-compras" tabindex="0" <?= $pestanaActiva === "compras" ? "" : "hidden" ?>>
          <h2 class="titulo-seccion">Mis compras</h2>
          <p class="subtexto">Los pedidos que hiciste a otros vecinos del condominio.</p>

          <?php if (count($compras) === 0): ?>
          <div class="vacio">
            <h3 class="vacio__titulo">Todavía no hiciste ningún pedido</h3>
            <p>Cuando registres un pedido desde tu carrito lo vas a ver aquí.</p>
            <a class="boton" href="catalogo.php">Ver el catálogo</a>
          </div>
          <?php else: ?>
          <!-- la tabla va dentro de este div para que en el celular se
               pueda deslizar hacia los lados, porque tantas columnas no
               entran en una pantalla pequeña -->
          <div class="tabla-scroll">
            <table class="tabla">
              <caption>Pedidos realizados</caption>
              <thead>
                <tr>
                  <th scope="col">Código</th>
                  <th scope="col">Fecha</th>
                  <th scope="col">Vendedor</th>
                  <th scope="col" class="col-monto">Total</th>
                  <th scope="col">Pago</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Detalle</th>
                </tr>
              </thead>
              <tbody>
                <?php foreach ($compras as $pedido):
                    $vendedor = $pedido["vendedor"];
                    $idFila = "detalle-compra-" . $pedido["idPedido"];
                    $contacto = "Coordina el pago y la entrega con " . nombreCompleto($vendedor);
                    if ($vendedor !== null && $vendedor["telefono"] !== "") {
                        $contacto .= ", su celular es " . $vendedor["telefono"];
                    }
                ?>
                <tr>
                  <th scope="row"><?= e($pedido["codigo"]) ?></th>
                  <td><?= e(formatearFecha($pedido["fechaHora"])) ?></td>
                  <td><?= e(nombreCompleto($vendedor) . " · " . textoUnidad($vendedor)) ?></td>
                  <td class="col-monto"><?= e(formatearPrecio($pedido["total"])) ?></td>
                  <td><?= e(textoPago($pedido["pago"])) ?></td>
                  <td><span class="<?= e(claseEstado($pedido["estado"])) ?>"><?= e($pedido["estado"]) ?></span></td>
                  <td><?php pintarBotonDetalle($pedido, $idFila); ?></td>
                </tr>
                <?php pintarDetalle($pedido, $idFila, 7, $contacto); ?>
                <?php endforeach; ?>
              </tbody>
            </table>
          </div>
          <?php endif; ?>
        </div>


        <!-- en esta pestaña van los pedidos que le hicieron al vecino, en la
             columna cambiar estado el vendedor avisa cómo va el pedido, la
             lista solo ofrece los pasos que siguen y el comprador lo ve en
             sus compras -->
        <div class="pestanas__panel" id="mis-ventas" role="tabpanel"
             aria-labelledby="pestana-ventas" tabindex="0" <?= $pestanaActiva === "ventas" ? "" : "hidden" ?>>
          <h2 class="titulo-seccion">Mis ventas</h2>
          <p class="subtexto">Los pedidos que te hicieron tus vecinos.</p>

          <?php if (count($ventas) === 0): ?>
          <div class="vacio">
            <h3 class="vacio__titulo">Todavía no te llegó ningún pedido</h3>
            <p class="mb-0">Cuando un vecino te compre algo, su pedido va a aparecer aquí.</p>
          </div>
          <?php else: ?>
          <div class="tabla-scroll">
            <table class="tabla">
              <caption>Pedidos recibidos</caption>
              <thead>
                <tr>
                  <th scope="col">Código</th>
                  <th scope="col">Fecha</th>
                  <th scope="col">Comprador</th>
                  <th scope="col" class="col-monto">Total</th>
                  <th scope="col">Pago</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Cambiar estado</th>
                  <th scope="col">Detalle</th>
                </tr>
              </thead>
              <tbody>
                <?php foreach ($ventas as $pedido):
                    $comprador = $pedido["comprador"];
                    $idFila = "detalle-venta-" . $pedido["idPedido"];
                    $siguientes = estadosSiguientes($pedido["estado"]);
                    $contacto = "Se entrega en " . textoUnidad($comprador);
                    if ($comprador !== null && $comprador["telefono"] !== "") {
                        $contacto .= ", el celular de " . nombreCompleto($comprador) . " es " . $comprador["telefono"];
                    }
                ?>
                <tr>
                  <th scope="row"><?= e($pedido["codigo"]) ?></th>
                  <td><?= e(formatearFecha($pedido["fechaHora"])) ?></td>
                  <td><?= e(nombreCompleto($comprador) . " · " . textoUnidad($comprador)) ?></td>
                  <td class="col-monto"><?= e(formatearPrecio($pedido["total"])) ?></td>
                  <td><?= e(textoPago($pedido["pago"])) ?></td>
                  <td><span class="<?= e(claseEstado($pedido["estado"])) ?>"><?= e($pedido["estado"]) ?></span></td>
                  <td>
                    <?php if (count($siguientes) === 0): ?>
                    <span class="subtexto">Pedido cerrado</span>
                    <?php else: ?>
                    <!-- el motivo se ve siempre si no hay javascript, panel.js
                         lo muestra solo cuando eligen cancelado -->
                    <form method="post" action="panel.php" data-estado-pedido>
                      <?= campoCsrf() ?>
                      <input type="hidden" name="accion" value="estado-pedido">
                      <input type="hidden" name="idPedido" value="<?= (int) $pedido["idPedido"] ?>">
                      <select class="tabla__control" name="estado" required
                              aria-label="<?= e("Nuevo estado del pedido " . $pedido["codigo"]) ?>">
                        <?php foreach ($siguientes as $siguiente): ?>
                        <option value="<?= e($siguiente) ?>"><?= e($siguiente) ?></option>
                        <?php endforeach; ?>
                      </select>
                      <?php if (in_array("Cancelado", $siguientes, true)): ?>
                      <input class="tabla__control" type="text" name="motivo" maxlength="200"
                             data-motivo placeholder="Motivo si lo cancelas"
                             aria-label="<?= e("Motivo de la cancelación del pedido " . $pedido["codigo"]) ?>">
                      <?php endif; ?>
                      <button class="boton boton--sm" type="submit">Guardar</button>
                    </form>
                    <?php endif; ?>
                  </td>
                  <td><?php pintarBotonDetalle($pedido, $idFila); ?></td>
                </tr>
                <?php pintarDetalle($pedido, $idFila, 8, $contacto); ?>
                <?php endforeach; ?>
              </tbody>
            </table>
          </div>
          <?php endif; ?>
        </div>


        <!-- en esta pestaña van los productos del vecino, con su precio y
             cuántas unidades le quedan, con el botón de la última columna da
             de baja el que ya no vende, antes base.js le pregunta si está
             seguro por el data-confirmar -->
        <div class="pestanas__panel" id="mis-publicaciones" role="tabpanel"
             aria-labelledby="pestana-publicaciones" tabindex="0" <?= $pestanaActiva === "publicaciones" ? "" : "hidden" ?>>
          <div class="fila-titulo">
            <h2 class="titulo-seccion">Mis publicaciones</h2>
            <a class="boton boton--linea" href="publicar.php">Publicar producto</a>
          </div>
          <p class="subtexto">Lo que tienes publicado en el catálogo.</p>

          <?php if (count($publicaciones) === 0): ?>
          <div class="vacio">
            <h3 class="vacio__titulo">Todavía no publicaste ningún producto</h3>
            <p>Publica lo que preparas o vendes y tus vecinos lo van a ver en el catálogo.</p>
            <a class="boton boton--linea" href="publicar.php">Publicar mi primer producto</a>
          </div>
          <?php else: ?>
          <div class="tabla-scroll">
            <table class="tabla">
              <caption>Mis publicaciones</caption>
              <thead>
                <tr>
                  <th scope="col">Código</th>
                  <th scope="col">Producto</th>
                  <th scope="col">Categoría</th>
                  <th scope="col" class="col-monto">Precio</th>
                  <th scope="col">Stock</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Acción</th>
                </tr>
              </thead>
              <tbody>
                <?php foreach ($publicaciones as $publicacion): ?>
                <tr>
                  <th scope="row"><?= (int) $publicacion["idPublicacion"] ?></th>
                  <td><a href="producto.php?id=<?= (int) $publicacion["idPublicacion"] ?>"><?= e($publicacion["titulo"]) ?></a></td>
                  <td><?= e($publicacion["nombreCategoria"] ?? "") ?></td>
                  <td class="col-monto"><?= e(formatearPrecio($publicacion["precio"])) ?></td>
                  <td><?= e(textoStock((int) $publicacion["stock"])) ?></td>
                  <td><span class="<?= e(claseEstado($publicacion["estado"])) ?>"><?= e($publicacion["estado"]) ?></span></td>
                  <td>
                    <?php if ($publicacion["estado"] === "Activa"): ?>
                    <form method="post" action="panel.php"
                          data-titulo="¿Dar de baja esta publicación?"
                          data-confirmar="<?= e($publicacion["titulo"] . " va a dejar de aparecer en el catálogo. Los pedidos que ya te hicieron no cambian.") ?>">
                      <?= campoCsrf() ?>
                      <input type="hidden" name="accion" value="baja">
                      <input type="hidden" name="idPublicacion" value="<?= (int) $publicacion["idPublicacion"] ?>">
                      <button class="boton boton--linea boton--sm" type="submit"
                              aria-label="<?= e("Dar de baja " . $publicacion["titulo"]) ?>">Dar de baja</button>
                    </form>
                    <?php endif; ?>
                  </td>
                </tr>
                <?php endforeach; ?>
              </tbody>
            </table>
          </div>
          <?php endif; ?>
        </div>

      </div>
    </section>

<?php
cerrarPagina("js/panel.js");
