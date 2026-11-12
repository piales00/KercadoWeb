<?php
/*
  hecho por piero. esta es la vista de la administración del condominio
  las palmas 357, aquí se valida que quien se registra de verdad vive en el
  condominio, se moderan las publicaciones, se supervisan los pedidos y se
  ordenan las categorías, el administrador no compra ni vende, solo cuida
  que el marketplace funcione bien entre vecinos
*/
require_once __DIR__ . "/app/plantilla.php";

// lo primero es revisar que quien entra sea de la administración, si es un
// vecino normal exigirAdmin() le muestra una página 403 y no sigue
$admin = exigirAdmin();

// las cuatro pestañas posibles, las usamos para validar lo que llega por la
// dirección y para saber a dónde volver después de cada formulario
$pestanas = ["residentes", "publicaciones", "pedidos", "categorias"];

$estadosResidente = ["Activo", "Pendiente", "Inactivo"];
$estadosPublicacion = ["Activa", "Observada", "Baja"];

// si llegó un formulario lo procesamos antes de pintar nada, porque
// redirigir() solo funciona si todavía no salió html
if (seEnvioFormulario()) {
    comprobarCsrf();
    $accion = textoPost("accion");
    $volver = "residentes";

    if ($accion === "estado-residente") {
        $idResidente = enteroPost("idResidente");
        $estado = textoPost("estado");

        // la propia cuenta no se toca desde aquí, así la administración no
        // se puede dejar afuera sin querer
        if ($idResidente === (int) $admin["idResidente"]) {
            avisar("no puedes cambiar el estado de tu propia cuenta", "error");
        } elseif ($idResidente <= 0 || !in_array($estado, $estadosResidente, true)) {
            avisar("no entendimos qué cambio querías hacer en la cuenta", "error");
        } else {
            $resultado = cambiarEstadoResidente($idResidente, $estado);
            avisar($resultado["mensaje"], $resultado["ok"] ? "ok" : "error");
        }
    } elseif ($accion === "estado-publicacion") {
        $volver = "publicaciones";
        $idPublicacion = enteroPost("idPublicacion");
        $estado = textoPost("estado");

        if ($idPublicacion <= 0 || !in_array($estado, $estadosPublicacion, true)) {
            avisar("no entendimos qué cambio querías hacer en la publicación", "error");
        } else {
            $resultado = cambiarEstadoPublicacion($idPublicacion, $estado);
            avisar($resultado["mensaje"], $resultado["ok"] ? "ok" : "error");
        }
    } elseif ($accion === "guardar-categoria") {
        $volver = "categorias";
        $idCategoria = textoPost("idCategoria");
        $nombre = textoPost("nombre");
        $descripcion = textoPost("descripcion");
        $esNueva = textoPost("esNueva") === "1";

        // el código viaja en la dirección del catálogo, por eso solo dejamos
        // letras minúsculas sin tilde y guiones, como "comida-casera"
        if (!preg_match('/^[a-z]+(-[a-z]+)*$/', $idCategoria) || mb_strlen($idCategoria) > 30) {
            avisar("el código de la categoría solo puede tener letras minúsculas sin tilde y guiones, hasta 30", "error");
        } elseif ($nombre === "" || mb_strlen($nombre) > 60) {
            avisar("escribe el nombre de la categoría, hasta 60 caracteres", "error");
        } elseif (mb_strlen($descripcion) > 200) {
            avisar("la descripción de la categoría puede tener hasta 200 caracteres", "error");
        } else {
            $resultado = guardarCategoria($idCategoria, $nombre, $descripcion, $esNueva);
            avisar($resultado["mensaje"], $resultado["ok"] ? "ok" : "error");
        }
    } elseif ($accion === "eliminar-categoria") {
        $volver = "categorias";
        $idCategoria = textoPost("idCategoria");

        if (!preg_match('/^[a-z]+(-[a-z]+)*$/', $idCategoria)) {
            avisar("no encontramos esa categoría", "error");
        } else {
            $resultado = eliminarCategoria($idCategoria);
            avisar($resultado["mensaje"], $resultado["ok"] ? "ok" : "error");
        }
    } else {
        avisar("no entendimos qué querías hacer", "error");
    }

    redirigir("admin.php?pestana=" . $volver);
}

// qué pestaña se abre, si la dirección no dice nada o dice algo raro
// empezamos por los residentes
$pestana = textoGet("pestana");
if (!in_array($pestana, $pestanas, true)) {
    $pestana = "residentes";
}

// el filtro de residentes por estado, solo aceptamos los tres que existen
$filtroEstado = textoGet("estado");
if (!in_array($filtroEstado, $estadosResidente, true)) {
    $filtroEstado = "";
}

$residentes = listarResidentes($filtroEstado);
$publicaciones = listarTodasLasPublicaciones();
$pedidos = listarTodosLosPedidos();
$categorias = listarCategorias();

// los números del resumen se cuentan recorriendo las listas, los
// pendientes se cuentan aparte porque la lista de arriba puede venir filtrada
$residentesPendientes = count(listarResidentes("Pendiente"));

$publicacionesActivas = 0;
foreach ($publicaciones as $publicacion) {
    if ($publicacion["estado"] === "Activa") {
        $publicacionesActivas++;
    }
}

// cuántas publicaciones tiene cada categoría, para que la administración
// sepa cuántas se quedarían sin categoría si la elimina
$publicacionesPorCategoria = [];
foreach ($publicaciones as $publicacion) {
    $idCategoria = $publicacion["idCategoria"] ?? "";
    if ($idCategoria !== "") {
        $publicacionesPorCategoria[$idCategoria] = ($publicacionesPorCategoria[$idCategoria] ?? 0) + 1;
    }
}

$pedidosPorEstado = ["Pendiente" => 0, "Aceptado" => 0, "En preparación" => 0, "Entregado" => 0, "Cancelado" => 0];
foreach ($pedidos as $pedido) {
    if (isset($pedidosPorEstado[$pedido["estado"]])) {
        $pedidosPorEstado[$pedido["estado"]]++;
    }
}

// devuelve los atributos de una pestaña según esté elegida o no, la que no
// está elegida sale del recorrido del tab y se llega a ella con las flechas
function atributosPestana(string $nombre, string $elegida): string
{
    if ($nombre === $elegida) {
        return 'aria-selected="true"';
    }
    return 'aria-selected="false" tabindex="-1"';
}

// las cuentas usan Activo e Inactivo, que claseEstado() no conoce, así que
// les damos el mismo color que a una publicación activa o de baja
function claseEstadoResidente(string $estado): string
{
    if ($estado === "Activo") {
        return claseEstado("Activa");
    }
    if ($estado === "Inactivo") {
        return claseEstado("Baja");
    }
    return claseEstado("Pendiente");
}

abrirPagina("Administración", "Administración del condominio Las Palmas 357 en Kercado.", "admin");
?>

  <!-- arriba saludamos a la administración y le recordamos qué le toca
       hacer, debajo van los números que más importan para revisar rápido -->
  <section class="seccion">
    <div class="contenedor">
      <h1 class="titulo-seccion">Administración del condominio</h1>
      <p>
        Hola, <strong><?= e(nombreCompleto($admin)) ?></strong>. Desde aquí validas
        que quien se registra vive en Las Palmas 357, revisas las publicaciones y
        supervisas los pedidos entre vecinos.
      </p>

      <div class="aviso">
        <p>
          Kercado no cobra ni hace entregas, los pedidos solo registran lo que
          acordaron los vecinos, por eso aquí los pedidos se ven pero no se cambian.
        </p>
      </div>

      <!-- el resumen con números, cada caja dice cuántos hay de algo, el
           número va grande para que se lea de un vistazo -->
      <h2 class="solo-lectores">Resumen</h2>
      <div class="grilla-auto mt-3 mb-3">
        <div class="caja">
          <p class="resumen__numero mb-0"><?= e($residentesPendientes) ?></p>
          <p class="subtexto mb-0">Residentes por validar</p>
        </div>
        <div class="caja">
          <p class="resumen__numero mb-0"><?= e($publicacionesActivas) ?></p>
          <p class="subtexto mb-0">Publicaciones activas</p>
        </div>
        <div class="caja">
          <p class="resumen__numero mb-0"><?= e(count($pedidos)) ?></p>
          <p class="subtexto mb-0">Pedidos registrados</p>
          <ul class="detalle-pedido mb-0">
            <?php foreach ($pedidosPorEstado as $estado => $cantidad): ?>
              <li><span class="<?= e(claseEstado($estado)) ?>"><?= e($estado) ?></span> <strong><?= e($cantidad) ?></strong></li>
            <?php endforeach; ?>
          </ul>
        </div>
      </div>

      <!-- las pestañas son enlaces de verdad, así sin javascript cada una
           abre la página con su ?pestana= y php muestra la parte que toca,
           con javascript se cambian sin recargar y también con las flechas -->
      <div class="pestanas" role="tablist" aria-label="Secciones de la administración">
        <a class="pestanas__boton" role="tab" id="pestana-residentes" href="admin.php?pestana=residentes"
           aria-controls="parte-residentes" <?= atributosPestana("residentes", $pestana) ?>>Residentes</a>
        <a class="pestanas__boton" role="tab" id="pestana-publicaciones" href="admin.php?pestana=publicaciones"
           aria-controls="parte-publicaciones" <?= atributosPestana("publicaciones", $pestana) ?>>Publicaciones</a>
        <a class="pestanas__boton" role="tab" id="pestana-pedidos" href="admin.php?pestana=pedidos"
           aria-controls="parte-pedidos" <?= atributosPestana("pedidos", $pestana) ?>>Pedidos</a>
        <a class="pestanas__boton" role="tab" id="pestana-categorias" href="admin.php?pestana=categorias"
           aria-controls="parte-categorias" <?= atributosPestana("categorias", $pestana) ?>>Categorías</a>
      </div>


      <!-- los residentes, aquí la administración revisa que cada cuenta
           nueva sea de alguien que vive en el condominio y la activa, o
           desactiva la de alguien que ya se mudó -->
      <div class="pestanas__panel" id="parte-residentes" role="tabpanel"
           aria-labelledby="pestana-residentes" tabindex="0" <?= $pestana === "residentes" ? "" : "hidden" ?>>
        <h2 class="titulo-seccion">Residentes</h2>
        <p class="subtexto">Compara la torre y el departamento con el padrón del condominio antes de activar una cuenta.</p>

        <!-- el filtro va por get para que la dirección se pueda compartir y
             funcione sin javascript -->
        <form class="opciones mb-3" method="get" action="admin.php">
          <input type="hidden" name="pestana" value="residentes">
          <div class="campo mb-0">
            <label for="filtro-estado">Mostrar cuentas</label>
            <select id="filtro-estado" name="estado">
              <option value="">Todas</option>
              <?php foreach ($estadosResidente as $estado): ?>
                <option value="<?= e($estado) ?>" <?= $estado === $filtroEstado ? "selected" : "" ?>><?= e($estado) ?></option>
              <?php endforeach; ?>
            </select>
          </div>
          <div>
            <button class="boton boton--linea boton--sm" type="submit">Filtrar</button>
          </div>
        </form>

        <?php if (count($residentes) === 0): ?>
          <div class="vacio">
            <h3 class="vacio__titulo">No hay cuentas con ese estado</h3>
            <p class="mb-0">Elige otro estado en el filtro para ver más residentes.</p>
          </div>
        <?php else: ?>
          <div class="tabla-scroll">
            <table class="tabla">
              <caption>Residentes registrados</caption>
              <thead>
                <tr>
                  <th scope="col">Nombre</th>
                  <th scope="col">Correo</th>
                  <th scope="col">Unidad</th>
                  <th scope="col">Teléfono</th>
                  <th scope="col">Registro</th>
                  <th scope="col">Rol</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Acción</th>
                </tr>
              </thead>
              <tbody>
                <?php foreach ($residentes as $residente): ?>
                  <tr>
                    <th scope="row"><?= e(nombreCompleto($residente)) ?></th>
                    <td><?= e($residente["correo"]) ?></td>
                    <td><?= e(textoUnidad($residente)) ?></td>
                    <td><?= e($residente["telefono"]) ?></td>
                    <td><?= e(formatearFecha($residente["fechaRegistro"])) ?></td>
                    <td><?= $residente["rol"] === "admin" ? "Administración" : "Residente" ?></td>
                    <td><span class="<?= e(claseEstadoResidente($residente["estado"])) ?>"><?= e($residente["estado"]) ?></span></td>
                    <td>
                      <?php if ((int) $residente["idResidente"] === (int) $admin["idResidente"]): ?>
                        <span class="subtexto">Tu cuenta</span>
                      <?php elseif ($residente["estado"] === "Activo"): ?>
                        <!-- desactivar deja a la persona sin acceso, por eso pide confirmación -->
                        <form method="post" action="admin.php"
                              data-confirmar="¿Desactivar la cuenta de <?= e(nombreCompleto($residente)) ?>? Ya no podrá ingresar a Kercado."
                              data-titulo="Desactivar cuenta">
                          <?= campoCsrf() ?>
                          <input type="hidden" name="accion" value="estado-residente">
                          <input type="hidden" name="idResidente" value="<?= e($residente["idResidente"]) ?>">
                          <input type="hidden" name="estado" value="Inactivo">
                          <button class="boton boton--linea boton--sm" type="submit"
                                  aria-label="Desactivar la cuenta de <?= e(nombreCompleto($residente)) ?>">Desactivar</button>
                        </form>
                      <?php else: ?>
                        <form method="post" action="admin.php">
                          <?= campoCsrf() ?>
                          <input type="hidden" name="accion" value="estado-residente">
                          <input type="hidden" name="idResidente" value="<?= e($residente["idResidente"]) ?>">
                          <input type="hidden" name="estado" value="Activo">
                          <button class="boton boton--sm" type="submit"
                                  aria-label="Activar la cuenta de <?= e(nombreCompleto($residente)) ?>">Activar</button>
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


      <!-- las publicaciones de todos los vecinos en cualquier estado, la
           administración puede observar una que no corresponde, darla de
           baja o volver a activarla -->
      <div class="pestanas__panel" id="parte-publicaciones" role="tabpanel"
           aria-labelledby="pestana-publicaciones" tabindex="0" <?= $pestana === "publicaciones" ? "" : "hidden" ?>>
        <h2 class="titulo-seccion">Publicaciones</h2>
        <p class="subtexto">Una publicación observada o de baja deja de verse en el catálogo.</p>

        <?php if (count($publicaciones) === 0): ?>
          <div class="vacio">
            <h3 class="vacio__titulo">Todavía no hay publicaciones</h3>
            <p class="mb-0">Cuando un vecino publique un producto lo vas a ver aquí.</p>
          </div>
        <?php else: ?>
          <div class="tabla-scroll">
            <table class="tabla">
              <caption>Publicaciones de los vecinos</caption>
              <thead>
                <tr>
                  <th scope="col">Foto</th>
                  <th scope="col">Producto</th>
                  <th scope="col">Vendedor</th>
                  <th scope="col" class="col-monto">Precio</th>
                  <th scope="col">Stock</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Cambiar estado</th>
                </tr>
              </thead>
              <tbody>
                <?php foreach ($publicaciones as $publicacion): ?>
                  <tr>
                    <td>
                      <img class="tabla__miniatura" src="<?= e($publicacion["imagenes"][0]) ?>"
                           alt="<?= e($publicacion["titulo"]) ?>" width="72" height="72" loading="lazy">
                    </td>
                    <th scope="row">
                      <a href="producto.php?id=<?= e($publicacion["idPublicacion"]) ?>"><?= e($publicacion["titulo"]) ?></a>
                    </th>
                    <td><?= e(nombreCompleto($publicacion["vendedor"])) ?></td>
                    <td class="col-monto"><?= e(formatearPrecio($publicacion["precio"])) ?></td>
                    <td><?= e($publicacion["stock"]) ?></td>
                    <td><span class="<?= e(claseEstado($publicacion["estado"])) ?>"><?= e($publicacion["estado"]) ?></span></td>
                    <td>
                      <!-- un formulario por cada estado al que se puede pasar,
                           dar de baja pide confirmación porque el vendedor
                           deja de vender ese producto -->
                      <div class="opciones">
                        <?php foreach ($estadosPublicacion as $estado): ?>
                          <?php if ($estado !== $publicacion["estado"]): ?>
                            <form method="post" action="admin.php"
                              <?php if ($estado === "Baja"): ?>
                                  data-confirmar="¿Dar de baja «<?= e($publicacion["titulo"]) ?>»? Dejará de verse en el catálogo."
                                  data-titulo="Dar de baja la publicación"
                              <?php endif; ?>>
                              <?= campoCsrf() ?>
                              <input type="hidden" name="accion" value="estado-publicacion">
                              <input type="hidden" name="idPublicacion" value="<?= e($publicacion["idPublicacion"]) ?>">
                              <input type="hidden" name="estado" value="<?= e($estado) ?>">
                              <button class="boton boton--linea boton--sm" type="submit"
                                      aria-label="Marcar «<?= e($publicacion["titulo"]) ?>» como <?= e($estado) ?>"><?= $estado === "Activa" ? "Activar" : ($estado === "Observada" ? "Observar" : "Dar de baja") ?></button>
                            </form>
                          <?php endif; ?>
                        <?php endforeach; ?>
                      </div>
                    </td>
                  </tr>
                <?php endforeach; ?>
              </tbody>
            </table>
          </div>
        <?php endif; ?>
      </div>


      <!-- todos los pedidos del condominio, solo para mirar, quien cambia el
           estado es el vendedor desde su panel, el detalle se abre con
           details y summary, que funcionan sin javascript y con el teclado -->
      <div class="pestanas__panel" id="parte-pedidos" role="tabpanel"
           aria-labelledby="pestana-pedidos" tabindex="0" <?= $pestana === "pedidos" ? "" : "hidden" ?>>
        <h2 class="titulo-seccion">Pedidos</h2>
        <p class="subtexto">Los pedidos entre vecinos, el pago y la entrega los coordinan ellos mismos.</p>

        <?php if (count($pedidos) === 0): ?>
          <div class="vacio">
            <h3 class="vacio__titulo">Todavía no hay pedidos</h3>
            <p class="mb-0">Cuando un vecino confirme su carrito, el pedido va a aparecer aquí.</p>
          </div>
        <?php else: ?>
          <div class="tabla-scroll">
            <table class="tabla">
              <caption>Pedidos del condominio</caption>
              <thead>
                <tr>
                  <th scope="col">Código</th>
                  <th scope="col">Fecha</th>
                  <th scope="col">Comprador</th>
                  <th scope="col">Vendedor</th>
                  <th scope="col" class="col-monto">Total</th>
                  <th scope="col">Pago</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Detalle</th>
                </tr>
              </thead>
              <tbody>
                <?php foreach ($pedidos as $pedido): ?>
                  <tr>
                    <th scope="row"><?= e($pedido["codigo"]) ?></th>
                    <td><?= e(formatearFecha($pedido["fechaHora"])) ?></td>
                    <td><?= e(nombreCompleto($pedido["comprador"] ?? null)) ?></td>
                    <td><?= e(nombreCompleto($pedido["vendedor"] ?? null)) ?></td>
                    <td class="col-monto"><?= e(formatearPrecio($pedido["total"])) ?></td>
                    <td>
                      <?php if (isset($pedido["pago"])): ?>
                        <?= e($pedido["pago"]["metodo"]) ?>, <?= e(mb_strtolower($pedido["pago"]["estado"])) ?>
                      <?php endif; ?>
                    </td>
                    <td><span class="<?= e(claseEstado($pedido["estado"])) ?>"><?= e($pedido["estado"]) ?></span></td>
                    <td>
                      <details>
                        <summary>Ver detalle</summary>
                        <ul class="detalle-pedido">
                          <?php foreach ($pedido["detalles"] ?? [] as $detalle): ?>
                            <li>
                              <span><?= e($detalle["cantidad"]) ?> × <?= e($detalle["titulo"]) ?></span>
                              <strong><?= e(formatearPrecio($detalle["subtotal"])) ?></strong>
                            </li>
                          <?php endforeach; ?>
                        </ul>
                        <?php if ($pedido["estado"] === "Cancelado" && $pedido["motivoCancelacion"] !== ""): ?>
                          <p class="subtexto mb-0">Motivo de la cancelación: <?= e($pedido["motivoCancelacion"]) ?></p>
                        <?php endif; ?>
                      </details>
                    </td>
                  </tr>
                <?php endforeach; ?>
              </tbody>
            </table>
          </div>
        <?php endif; ?>
      </div>


      <!-- las categorías del catálogo, arriba un formulario para crear una
           nueva y abajo la tabla donde cada fila se edita ahí mismo, los
           campos de la fila usan el atributo form para pertenecer al
           formulario de su última celda, porque un form no puede abarcar
           varias celdas de una tabla -->
      <div class="pestanas__panel" id="parte-categorias" role="tabpanel"
           aria-labelledby="pestana-categorias" tabindex="0" <?= $pestana === "categorias" ? "" : "hidden" ?>>
        <h2 class="titulo-seccion">Categorías</h2>
        <p class="subtexto">Si eliminas una categoría, sus publicaciones se quedan sin categoría pero no se borran.</p>

        <form class="formulario caja mb-3" method="post" action="admin.php" id="form-nueva-categoria" novalidate>
          <?= campoCsrf() ?>
          <input type="hidden" name="accion" value="guardar-categoria">
          <input type="hidden" name="esNueva" value="1">
          <h3 class="mt-0">Nueva categoría</h3>

          <div class="campo-fila">
            <div class="campo">
              <label for="nueva-id">Código <span class="obligatorio">*</span></label>
              <input type="text" id="nueva-id" name="idCategoria" maxlength="30"
                     pattern="[a-z]+(-[a-z]+)*" aria-describedby="ayuda-nueva-id" required>
              <small class="campo__ayuda" id="ayuda-nueva-id">Minúsculas sin tilde y guiones, por ejemplo comida-casera. Va en la dirección del catálogo.</small>
              <small class="campo__error" id="e-nueva-id"></small>
            </div>
            <div class="campo">
              <label for="nueva-nombre">Nombre <span class="obligatorio">*</span></label>
              <input type="text" id="nueva-nombre" name="nombre" maxlength="60" required>
              <small class="campo__error" id="e-nueva-nombre"></small>
            </div>
          </div>
          <div class="campo">
            <label for="nueva-descripcion">Descripción</label>
            <input type="text" id="nueva-descripcion" name="descripcion" maxlength="200">
          </div>
          <button class="boton" type="submit">Crear categoría</button>
        </form>

        <div class="tabla-scroll">
          <table class="tabla">
            <caption>Categorías del catálogo</caption>
            <thead>
              <tr>
                <th scope="col">Código</th>
                <th scope="col">Nombre</th>
                <th scope="col">Descripción</th>
                <th scope="col">Publicaciones</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <?php foreach ($categorias as $categoria): ?>
                <?php $idForm = "categoria-" . $categoria["idCategoria"]; ?>
                <tr>
                  <th scope="row"><?= e($categoria["idCategoria"]) ?></th>
                  <td>
                    <input class="tabla__control" type="text" name="nombre" form="<?= e($idForm) ?>"
                           value="<?= e($categoria["nombre"]) ?>" maxlength="60" required
                           aria-label="Nombre de la categoría <?= e($categoria["idCategoria"]) ?>">
                  </td>
                  <td>
                    <input class="tabla__control" type="text" name="descripcion" form="<?= e($idForm) ?>"
                           value="<?= e($categoria["descripcion"]) ?>" maxlength="200"
                           aria-label="Descripción de la categoría <?= e($categoria["idCategoria"]) ?>">
                  </td>
                  <td><?= e($publicacionesPorCategoria[$categoria["idCategoria"]] ?? 0) ?></td>
                  <td>
                    <div class="opciones">
                      <form method="post" action="admin.php" id="<?= e($idForm) ?>">
                        <?= campoCsrf() ?>
                        <input type="hidden" name="accion" value="guardar-categoria">
                        <input type="hidden" name="idCategoria" value="<?= e($categoria["idCategoria"]) ?>">
                        <input type="hidden" name="esNueva" value="0">
                        <button class="boton boton--sm" type="submit"
                                aria-label="Guardar la categoría <?= e($categoria["nombre"]) ?>">Guardar</button>
                      </form>
                      <form method="post" action="admin.php"
                            data-confirmar="¿Eliminar la categoría <?= e($categoria["nombre"]) ?>? Sus publicaciones se quedan sin categoría."
                            data-titulo="Eliminar categoría">
                        <?= campoCsrf() ?>
                        <input type="hidden" name="accion" value="eliminar-categoria">
                        <input type="hidden" name="idCategoria" value="<?= e($categoria["idCategoria"]) ?>">
                        <button class="boton boton--linea boton--sm" type="submit"
                                aria-label="Eliminar la categoría <?= e($categoria["nombre"]) ?>">Eliminar</button>
                      </form>
                    </div>
                  </td>
                </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </section>

<?php
cerrarPagina("js/admin.js");
