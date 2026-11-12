<?php
/*
  hecho por piero. esta es la plantilla de todas las páginas, antes la
  copiábamos a mano en cada html y ahora la arma php, así el header y el
  footer están en un solo lugar, abrirPagina() pinta desde el doctype
  hasta el main y cerrarPagina() pinta el pie, el diálogo, los avisos, el
  chat de ayuda y los scripts
*/

require_once __DIR__ . "/funciones.php";
require_once __DIR__ . "/almacen.php";

// devuelve la clase y el aria-current del enlace del menú si es la página
// donde está el vecino, producto cuenta como catálogo y publicar como
// panel porque se llega desde ahí
function marcaDelMenu(string $enlace, string $paginaActual): string
{
    if ($paginaActual === "producto") {
        $paginaActual = "catalogo";
    }
    if ($paginaActual === "publicar") {
        $paginaActual = "panel";
    }

    if ($enlace === $paginaActual) {
        return 'class="menu__enlace menu__enlace--activo" aria-current="page"';
    }

    return 'class="menu__enlace"';
}

function abrirPagina(string $titulo, string $descripcion, string $paginaActual): void
{
    $residente = sesionActual();
    $cantidad = cantidadEnCarrito();
    $buscado = textoGet("q");
?>
<!DOCTYPE html>
<html lang="es">

<head>
  <!-- con esto las tildes y las eñes se ven bien en el navegador -->
  <meta charset="UTF-8">

  <!-- esta línea hace que en el celular la página use el ancho real de la
       pantalla, así el diseño se acomoda bien -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- la descripción y el título los manda cada página al llamar a
       abrirPagina() -->
  <meta name="description" content="<?= e($descripcion) ?>">
  <meta name="author" content="Equipo Kercado, Taller de Programación Web, UTP">
  <title><?= e($titulo) ?> · Kercado</title>

  <!-- enlazamos la misma hoja de estilos que usan todas las páginas -->
  <link rel="stylesheet" href="css/estilo.css">
</head>

<body>

  <!-- este enlace solo se ve al apretar tab, sirve para que quien navega
       con el teclado salte directo al contenido sin pasar por el menú -->
  <a class="saltar" href="#contenido">Saltar al contenido</a>

  <!-- esta es la cabecera, es la misma en todas las páginas del sitio,
       tiene el logo, el buscador, el carrito, la cuenta del vecino y el
       menú -->
  <header class="encabezado">

    <div class="contenedor encabezado__fila">

      <!-- el logo lleva a la página de inicio -->
      <a class="logo" href="index.php">
        <span>Ker<span class="logo__acento">cado</span>
          <span class="logo__bajada">Condominio Las Palmas 357</span>
        </span>
      </a>

      <!-- este botón abre y cierra el menú en el celular, en pantallas
           grandes no se ve, aria-expanded dice si el menú está abierto -->
      <button class="menu-boton" type="button" id="menu-boton"
              aria-expanded="false" aria-controls="menu-principal">
        <span class="menu-boton__icono" aria-hidden="true"></span>
        Menú
      </button>

      <!-- el buscador manda al catálogo lo que se escribió, y php deja
           escrito en el campo lo que se buscó para que se vea qué se está
           filtrando -->
      <form class="buscador" action="catalogo.php" method="get" role="search">
        <!-- este label no se ve en pantalla, pero lo leen los lectores de
             pantalla que usan las personas con discapacidad visual -->
        <label class="solo-lectores" for="q">Buscar productos</label>
        <input class="buscador__campo" type="search" id="q" name="q"
               value="<?= e($buscado) ?>"
               placeholder="Buscar postres, menús, abarrotes...">
        <button class="buscador__boton" type="submit">Buscar</button>
      </form>

      <div class="encabezado__acciones">

        <!-- el enlace al carrito, el globo con la cantidad lo cuenta php
             desde la sesión y se esconde cuando el carrito está vacío -->
        <a class="encabezado__carrito" href="carrito.php">
          Carrito
          <span class="contador" id="contador-carrito"<?= $cantidad === 0 ? " hidden" : "" ?>><?= $cantidad ?></span>
          <span class="solo-lectores">productos en el carrito</span>
        </a>

        <!-- hay un solo botón para ingresar, porque el vecino usa la misma
             cuenta para comprar y para vender, cuando ya entró php pone su
             nombre y un formulario para salir, es un post con el token
             para que nadie pueda cerrarle la sesión con un simple enlace -->
        <div class="cuenta" id="cuenta">
<?php if ($residente === null) { ?>
          <a class="boton boton--sm" href="registro.php">Ingresar</a>
<?php } else { ?>
          <span class="cuenta__saludo">Hola, <?= e($residente["nombres"]) ?></span>
          <form class="cuenta__salir" action="salir.php" method="post">
            <?= campoCsrf() ?>
            <button class="boton boton--claro boton--sm" type="submit">Salir</button>
          </form>
<?php } ?>
        </div>
      </div>
    </div>

    <!-- este es el menú principal, php marca el enlace de la página donde
         está el vecino, registro solo sale si no ha ingresado y
         administración solo si la cuenta es de la administración -->
    <nav class="menu" id="menu-principal" aria-label="Navegación principal">
      <ul class="contenedor menu__lista">
        <li><a <?= marcaDelMenu("inicio", $paginaActual) ?> href="index.php">Inicio</a></li>
        <li><a <?= marcaDelMenu("catalogo", $paginaActual) ?> href="catalogo.php">Catálogo</a></li>
        <li><a <?= marcaDelMenu("panel", $paginaActual) ?> href="panel.php">Mi panel</a></li>
        <li><a <?= marcaDelMenu("carrito", $paginaActual) ?> href="carrito.php">Carrito</a></li>
<?php if ($residente === null) { ?>
        <li><a <?= marcaDelMenu("registro", $paginaActual) ?> href="registro.php">Registro</a></li>
<?php } ?>
<?php if (esAdmin($residente)) { ?>
        <li><a <?= marcaDelMenu("admin", $paginaActual) ?> href="admin.php">Administración</a></li>
<?php } ?>
      </ul>
    </nav>
  </header>


  <!-- aquí dentro va el contenido de cada página, cada parte en su propia
       section, el id es a donde llega el enlace de saltar al contenido -->
  <main id="contenido">
<?php
}

function cerrarPagina(string $scriptDePagina = ""): void
{
    // sacamos los avisos guardados con avisar() y los borramos, así se
    // muestran una sola vez
    $avisos = $_SESSION["avisos"] ?? [];
    unset($_SESSION["avisos"]);
?>
  </main>


  <!-- este es el pie de página, también es el mismo en todas las páginas,
       tiene información de kercado, el contacto de la administración, el
       reglamento y los integrantes del grupo -->
  <footer class="pie">
    <div class="contenedor pie__grilla">

      <!-- aquí contamos qué es kercado, y que no cobra ni hace entregas,
           debajo van las redes, se abren en otra pestaña para que el vecino
           no pierda la página -->
      <div>
        <h3 class="pie__titulo">Kercado</h3>
        <p class="subtexto">
          Marketplace hiperlocal del condominio Las Palmas 357, Chorrillos.
          Los vecinos publican, los vecinos compran.
        </p>
        <p class="subtexto">
          Kercado no cobra comisiones, no procesa pagos y no gestiona la
          entrega: solo conecta al vecino que vende con el que compra.
        </p>
        <ul class="redes">
          <li>
            <a class="redes__enlace" href="https://www.facebook.com/kercado.pe" target="_blank" rel="noopener" aria-label="Kercado en Facebook">
              <svg class="redes__icono" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M14 8h3V4h-3c-2.8 0-4 1.7-4 4.3V10H7v4h3v8h4v-8h3l1-4h-4V8.5c0-.3.2-.5.5-.5z"/></svg>
            </a>
          </li>
          <li>
            <a class="redes__enlace" href="https://www.instagram.com/kercado.pe" target="_blank" rel="noopener" aria-label="Kercado en Instagram">
              <svg class="redes__icono" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM17.5 5.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg>
            </a>
          </li>
          <li>
            <a class="redes__enlace" href="https://wa.me/51912345678" target="_blank" rel="noopener" aria-label="Escríbenos por WhatsApp">
              <svg class="redes__icono" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 2a8 8 0 1 1-4.1 14.9l-.3-.2-2.8.7.8-2.7-.2-.3A8 8 0 0 1 12 4zm-3.2 4c-.2 0-.6.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3 2.4.9 2.9.8 3.4.7.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.4l-1.9-.9c-.3-.1-.5-.1-.7.2l-.8 1c-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.5-.6.3-.5v-.5l-.9-2.1c-.2-.5-.4-.5-.6-.5h-.5z"/></svg>
            </a>
          </li>
          <li>
            <a class="redes__enlace" href="https://www.tiktok.com/@kercado.pe" target="_blank" rel="noopener" aria-label="Kercado en TikTok">
              <svg class="redes__icono" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M16.5 2c.3 2.3 1.7 3.9 4 4.1v3.3c-1.4.1-2.7-.3-4-1.1v6.4A6.3 6.3 0 1 1 11 8.4v3.4a3 3 0 1 0 2.2 2.9V2h3.3z"/></svg>
            </a>
          </li>
        </ul>
      </div>

      <!-- los datos de contacto de la administración del condominio -->
      <div>
        <h3 class="pie__titulo">Administración</h3>
        <ul class="pie__lista">
          <li>Av. Las Palmas 357, Chorrillos, Lima</li>
          <li>Oficina: Torre A, primer piso</li>
          <li>Atención: lunes a sábado, 8:00 a 18:00</li>
          <li><a href="mailto:administracion@laspalmas357.pe">administracion@laspalmas357.pe</a></li>
          <li><a href="tel:+5112345678">(01) 234 5678</a></li>
        </ul>
      </div>

      <!-- estos enlaces llevan a partes de la página de inicio, donde
           explicamos cómo funciona kercado y sus reglas -->
      <div>
        <h3 class="pie__titulo">Reglamento</h3>
        <ul class="pie__lista">
          <li><a href="index.php#como-funciona">Cómo funciona Kercado</a></li>
          <li><a href="index.php#reglas">Reglas de convivencia</a></li>
          <li><a href="index.php#pagos">Métodos de pago aceptados</a></li>
          <li><a href="index.php#faq">Preguntas frecuentes</a></li>
          <li><a href="index.php#nosotros">Quiénes somos</a></li>
        </ul>
      </div>

      <!-- nuestros nombres -->
      <div>
        <h3 class="pie__titulo">Integrantes</h3>
        <ul class="pie__lista">
          <li>Piero Alessandro Pérez Izquierdo</li>
          <li>Edgar Paolo Pérez Román</li>
          <li>Francys Diego Yareta Cortez</li>
          <li>Luis Alberto Huánuco Jiménez</li>
        </ul>
      </div>
    </div>

    <!-- el año lo pone php con la fecha del servidor, y javascript lo
         vuelve a escribir con la del navegador -->
    <div class="pie__legal">
      <p class="mb-0">
        Kercado &copy; <span id="anio"><?= date("Y") ?></span> · Proyecto académico, Taller de Programación Web,
        Universidad Tecnológica del Perú.
      </p>
    </div>
  </footer>


  <!-- el diálogo que pregunta antes de hacer algo que no se puede deshacer,
       como dar de baja una publicación o vaciar el carrito, javascript le
       cambia el título y el texto según lo que se esté confirmando -->
  <dialog class="confirmacion" id="confirmacion" aria-labelledby="confirmacion-titulo">
    <form method="dialog">
      <h2 class="confirmacion__titulo" id="confirmacion-titulo">Confirmar</h2>
      <p id="confirmacion-texto">¿Seguro que quieres continuar?</p>
      <div class="confirmacion__acciones">
        <button class="boton boton--linea boton--sm" type="submit" value="no">No, volver</button>
        <button class="boton boton--sm" type="submit" value="si">Sí, continuar</button>
      </div>
    </form>
  </dialog>

  <!-- aquí salen los avisos flotantes, php pone los que dejó la página
       anterior con avisar() y javascript agrega los suyos, con aria-live
       los lectores de pantalla los leen apenas aparecen -->
  <div class="avisos" id="avisos" aria-live="polite">
<?php foreach ($avisos as $aviso) { ?>
    <p class="aviso-flotante aviso-flotante--<?= $aviso["tipo"] === "error" ? "error" : "ok" ?>"><?= e($aviso["texto"]) ?></p>
<?php } ?>
  </div>

  <!-- el chat de ayuda, el botón flotante abre un panel con preguntas
       frecuentes y un campo para escribir, javascript busca palabras clave
       en lo que se escribe y responde, no usa ningún servicio externo -->
  <div class="chat">
    <button class="chat__boton" type="button" id="chat-boton"
            aria-expanded="false" aria-controls="chat-panel">
      <svg class="chat__icono" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 3h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/></svg>
      <span>Ayuda</span>
    </button>

    <section class="chat__panel" id="chat-panel" aria-labelledby="chat-titulo" hidden>
      <div class="chat__cabecera">
        <h2 class="chat__titulo" id="chat-titulo">¿En qué te ayudamos?</h2>
        <button class="chat__cerrar" type="button" id="chat-cerrar" aria-label="Cerrar la ayuda">&times;</button>
      </div>

      <!-- aquí aparecen las preguntas y las respuestas, con aria-live el
           lector de pantalla lee cada respuesta nueva -->
      <div class="chat__mensajes" id="chat-mensajes" aria-live="polite">
        <p class="chat__mensaje chat__mensaje--asistente">Hola, elige una pregunta o escribe tu duda.</p>
      </div>

      <div class="chat__preguntas">
        <button class="chat__pregunta" type="button" data-pregunta="¿Cómo compro?">¿Cómo compro?</button>
        <button class="chat__pregunta" type="button" data-pregunta="¿Cómo vendo?">¿Cómo vendo?</button>
        <button class="chat__pregunta" type="button" data-pregunta="¿Qué métodos de pago hay?">Métodos de pago</button>
        <button class="chat__pregunta" type="button" data-pregunta="¿Cómo es la entrega?">Entregas</button>
        <button class="chat__pregunta" type="button" data-pregunta="¿Cómo valido mi cuenta?">Validar mi cuenta</button>
      </div>

      <form class="chat__formulario" id="chat-formulario">
        <label class="solo-lectores" for="chat-campo">Escribe tu pregunta</label>
        <input class="chat__campo" type="text" id="chat-campo" maxlength="200"
               placeholder="Escribe tu pregunta..." autocomplete="off">
        <button class="boton boton--sm" type="submit">Enviar</button>
      </form>
    </section>
  </div>


  <!-- primero va lo común a todas las páginas y después el script de cada
       página, que usa las funciones de base.js -->
  <script src="js/base.js"></script>
<?php if ($scriptDePagina !== "") { ?>
  <script src="<?= e($scriptDePagina) ?>"></script>
<?php } ?>
</body>
</html>
<?php
}
