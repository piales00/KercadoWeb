<?php
/*
  hecho por edgar. la página de inicio, cuenta qué es kercado y muestra las
  cuatro publicaciones más nuevas, que ahora salen de la base de datos con
  listarPublicaciones(), y si el vecino ya entró le cambia el botón de la
  portada para llevarlo a su panel
*/
require_once __DIR__ . "/app/plantilla.php";

// cuántas publicaciones mostramos en lo más reciente
const CANTIDAD_RECIENTES = 4;

// listarPublicaciones ya las devuelve de la más nueva a la más antigua, así
// que basta con quedarnos con las primeras
$recientes = array_slice(listarPublicaciones(), 0, CANTIDAD_RECIENTES);
$residente = sesionActual();

abrirPagina("Inicio", "Kercado, el mercado interno del condominio Las Palmas 357, donde los vecinos compran y venden entre ellos.", "inicio");
?>

    <!-- esto es lo primero que ve el vecino al entrar, profesor, la foto del
         condominio ocupa todo el ancho para que reconozca dónde está, y
         encima van el nombre y una frase corta, pusimos un solo botón para
         que vaya directo al catálogo, si ya entró con su cuenta inicio.js php
         lo cambia por uno que lleva a su panel, la portada no lleva la clase
         revelar porque tiene que verse apenas carga la página -->
    <section class="portada">
      <img src="assets/img/condominiofachada.jpg" alt="Fachada del condominio Las Palmas 357" class="portada__imagen">
      <div class="contenedor portada__contenido">
        <h1 class="portada__titulo">Ker<span class="logo__acento">cado</span></h1>
        <p class="portada__frase">El mercado interno de nuestra comunidad, donde comprar y vender es más cercano y seguro.</p>
        <div>
<?php if ($residente !== null) { ?>
          <a href="panel.php" class="boton boton--lg">Hola, <?= e($residente["nombres"]) ?>, ve tu panel</a>
<?php } else { ?>
          <a href="catalogo.php" class="boton boton--lg">Ver el catálogo</a>
<?php } ?>
        </div>
      </div>
    </section>

    <!-- las cuatro publicaciones más nuevas del condominio, ahora las
         imprime php leyendo la base, así lo que un vecino acaba de publicar
         aparece aquí apenas recarga la página -->
    <section class="seccion revelar" aria-labelledby="titulo-recientes">
      <div class="contenedor">
        <div class="fila-titulo">
          <h2 class="titulo-seccion" id="titulo-recientes">Lo más reciente</h2>
          <a class="boton boton--linea boton--sm" href="catalogo.php">Ver todo el catálogo</a>
        </div>
<?php if (count($recientes) === 0) { ?>
        <p class="subtexto">Todavía no hay productos publicados, sé el primero en <a href="publicar.php">publicar uno</a>.</p>
<?php } else { ?>
        <div class="grilla-productos grilla-productos--animada" id="ultimas-publicaciones">
<?php foreach ($recientes as $publicacion) {
          $enlace = "producto.php?id=" . $publicacion["idPublicacion"]; ?>
          <article class="tarjeta">
            <figure class="tarjeta__figura">
              <img class="tarjeta__imagen" src="<?= e($publicacion["imagenes"][0]) ?>" alt="<?= e($publicacion["titulo"]) ?>">
            </figure>
            <div class="tarjeta__cuerpo">
<?php if (!empty($publicacion["nombreCategoria"])) { ?>
              <span class="etiqueta"><?= e($publicacion["nombreCategoria"]) ?></span>
<?php } ?>
              <h3 class="tarjeta__titulo"><a href="<?= e($enlace) ?>"><?= e($publicacion["titulo"]) ?></a></h3>
              <p class="tarjeta__vendedor mb-0">
                Vendido por <strong><?= e(nombreCompleto($publicacion["vendedor"])) ?></strong> · <span><?= e(textoUnidad($publicacion["vendedor"])) ?></span>
              </p>
            </div>
            <div class="tarjeta__pie">
              <span class="tarjeta__precio"><?= e(formatearPrecio($publicacion["precio"])) ?></span>
              <a class="boton boton--sm" href="<?= e($enlace) ?>" aria-label="Ver <?= e($publicacion["titulo"]) ?>">Ver</a>
            </div>
          </article>
<?php } ?>
        </div>
<?php } ?>
      </div>
    </section>

    <!-- estos párrafos cuentan qué es kercado -->
    <section class="seccion revelar">
      <div class="contenedor dos-columnas">
        <div>
          <h2 class="titulo-seccion">Qué es Kercado</h2>
          <p>Kercado es una plataforma digital exclusiva para los residentes, diseñada para fomentar el comercio local dentro de nuestra propia comunidad de forma rápida, práctica y confiable.</p>
          <p>Con una interfaz intuitiva y accesible desde cualquier dispositivo, buscamos fortalecer los lazos vecinales facilitando el intercambio de productos y servicios cotidianos.</p>
          <p class="mb-0">Un vecino compra y vende con la misma cuenta, utilizando el mismo usuario para ambas actividades sin necesidad de registros separados.</p>
        </div>
        <img src="assets/img/kercado.png" alt="Ilustración de una tienda en línea dentro de una laptop" class="imagen-marco dos-columnas__imagen">
      </div>
    </section>

    <!-- los tres pasos para usar kercado -->
    <section class="seccion revelar" id="como-funciona">
      <div class="contenedor">
        <h2 class="titulo-seccion">Cómo funciona</h2>
        <div class="grilla-auto">
          <div class="caja">
            <h3>1. El vecino publica</h3>
            <p>Sube las fotos y los detalles del producto o servicio que deseas ofrecer en pocos minutos.</p>
          </div>
          <div class="caja">
            <h3>2. Otro vecino pide</h3>
            <p>Revisa el catálogo, agrega lo que quiere a su carrito y registra el pedido, el vendedor lo ve al instante en su panel.</p>
          </div>
          <div class="caja">
            <h3>3. Acuerdan pago y entrega entre ellos</h3>
            <p>Definen los detalles finales de manera directa. Kercado no cobra ni reparte.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- para quién es -->
    <section class="seccion seccion--alterna revelar">
      <div class="contenedor">
        <h2 class="titulo-seccion">Para quién es</h2>
        <p class="mb-3">Kercado es solo para los residentes del condominio Las Palmas 357, así cada compra y cada venta queda entre vecinos que se conocen.</p>
        <div class="grilla-auto">
          <div class="caja">
            <span class="etiqueta">Vende</span>
            <h3 class="mt-3">El vecino que prepara o tiene algo</h3>
            <p class="mb-0">Postres, menús caseros, abarrotes o un servicio, lo publica y sus vecinos lo ven al toque.</p>
          </div>
          <div class="caja">
            <span class="etiqueta">Compra</span>
            <h3 class="mt-3">El vecino que busca algo cerca</h3>
            <p class="mb-0">Encuentra lo que necesita sin salir del condominio y lo recoge a unos pasos de su departamento.</p>
          </div>
          <div class="caja">
            <span class="etiqueta">Seguridad</span>
            <h3 class="mt-3">Solo cuentas validadas</h3>
            <p class="mb-0">La administración revisa la torre y el departamento de cada vecino antes de activar su cuenta.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- las formas de pago -->
    <section class="seccion revelar" id="pagos">
      <div class="contenedor">
        <h2 class="titulo-seccion">Métodos de pago</h2>
        <ul>
          <li>Efectivo contra entrega</li>
          <li>Yape</li>
          <li>Plin</li>
        </ul>
        <p>Kercado no procesa pagos, solo registra el método acordado.</p>
      </div>
    </section>

    <!-- las preguntas frecuentes, cada una es un details con su summary, se
         abren y se cierran solas y funcionan con el teclado sin javascript -->
    <section class="seccion revelar" id="faq">
      <div class="contenedor">
        <h2 class="titulo-seccion">Preguntas frecuentes</h2>
        <div class="caja mb-3">
          <details>
            <summary><strong>¿Tiene algún costo publicar en Kercado?</strong></summary>
            <p class="mt-2 mb-0">No, Kercado es totalmente gratuito y creado por la administración para fomentar el comercio interno entre vecinos.</p>
          </details>
        </div>
        <div class="caja mb-3">
          <details>
            <summary><strong>¿Cómo valida la administración mi cuenta?</strong></summary>
            <p class="mt-2 mb-0">Al registrarte indicas tu torre y departamento; la administración corrobora que estés al día con el condominio antes de activar tu acceso.</p>
          </details>
        </div>
        <div class="caja mb-3">
          <details>
            <summary><strong>¿Cómo sé en qué va mi pedido?</strong></summary>
            <p class="mt-2 mb-0">En tu panel, en la pestaña Mis compras, ves cada pedido con su código y su estado: pendiente, aceptado, en preparación, entregado o cancelado. El vendedor lo va cambiando desde su propio panel.</p>
          </details>
        </div>
        <div class="caja mb-3">
          <details>
            <summary><strong>¿Puedo comprar y vender con la misma cuenta?</strong></summary>
            <p class="mt-2 mb-0">Sí, cada vecino tiene una sola cuenta. En tu panel están juntas tus compras y tus ventas, y desde ahí publicas tus productos.</p>
          </details>
        </div>
        <div class="caja mb-3">
          <details>
            <summary><strong>¿Kercado cobra o reparte los pedidos?</strong></summary>
            <p class="mt-2 mb-0">No. Kercado solo registra el pedido y el método de pago que acuerdan, efectivo contra entrega, Yape o Plin. El pago y la entrega los coordinan entre vecinos.</p>
          </details>
        </div>
      </div>
    </section>

    <!-- las reglas de convivencia -->
    <section class="seccion revelar" id="reglas">
      <div class="contenedor">
        <h2 class="titulo-seccion">Reglas de convivencia</h2>
        <ul>
          <li>Mantén un trato respetuoso y cordial en todas las negociaciones con tus vecinos.</li>
          <li>Publica únicamente productos y servicios que cumplan con las normas de seguridad del condominio.</li>
          <li>Sé puntual y claro al acordar los puntos y horarios de entrega.</li>
          <li>Reporta cualquier inconveniente o uso inadecuado de la plataforma a los administradores.</li>
          <li>Verifica el estado del producto antes de concretar la transacción final.</li>
        </ul>
      </div>
    </section>

    <!-- nosotros -->
    <section class="seccion revelar" id="nosotros">
      <div class="contenedor">
        <h2 class="titulo-seccion">Nosotros</h2>
        <div class="grilla-auto">
          <div class="caja">
            <img src="assets/img/integrante1.jpg" alt="Piero Alessandro Pérez Izquierdo" class="imagen-marco">
            <h3>Piero Alessandro Pérez Izquierdo</h3>
            <p>A cargo de la base del sitio, los estilos, la base de datos, el panel con sus pestañas y la integración de todas las páginas.</p>
          </div>
          <div class="caja">
            <img src="assets/img/integrante2.jpg" alt="Edgar Paolo Pérez Román" class="imagen-marco">
            <h3>Edgar Paolo Pérez Román</h3>
            <p>A cargo de la página de inicio, la página para publicar productos con su vista previa y el documento del avance.</p>
          </div>
          <div class="caja">
            <img src="assets/img/integrante3.jpg" alt="Francys Diego Yareta Cortez" class="imagen-marco">
            <h3>Francys Diego Yareta Cortez</h3>
            <p>A cargo del catálogo con sus filtros por categoría, precio y búsqueda, y de la ficha de cada producto con su galería.</p>
          </div>
          <div class="caja">
            <img src="assets/img/integrante4.jpg" alt="Luis Alberto Huánuco Jiménez" class="imagen-marco">
            <h3>Luis Alberto Huánuco Jiménez</h3>
            <p>A cargo del registro y el inicio de sesión, el carrito que arma un pedido por vecino y los archivos multimedia del proyecto.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- el audio de presentación de kercado -->
    <section class="seccion revelar">
      <div class="contenedor">
        <h2 class="titulo-seccion">Presentación en audio</h2>
        <div class="audio-caja">
          <audio controls src="assets/audio/kercado-presentacion.mp3">
            Tu navegador no soporta el elemento de audio.
          </audio>
        </div>
      </div>
    </section>
<?php
cerrarPagina("js/inicio.js");
