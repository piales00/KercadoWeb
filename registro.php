<?php
/*
  hecho por luis. esta página tiene los dos formularios de la cuenta, uno
  para ingresar y otro para pedir una cuenta nueva, los dos se procesan aquí
  arriba antes de pintar nada, y si el registro tiene errores se vuelve a
  pintar con lo que el vecino ya había escrito
*/
require_once __DIR__ . "/app/plantilla.php";

// si ya entró no tiene sentido que vea el ingreso, lo mandamos a su panel
if (sesionActual() !== null) {
    redirigir("panel.php");
}

// los errores y lo escrito empiezan vacíos, solo se llenan si llega un
// formulario que no pasa la validación
$erroresIngreso = [];
$mensajeIngreso = "";
$erroresRegistro = [];
$datos = [
    "nombres" => "",
    "apellidos" => "",
    "correo" => "",
    "telefono" => "",
    "torre" => "",
    "numeroDepartamento" => "",
];
$aceptoTerminos = false;

// el correo recordado viene de la cookie, si existe lo dejamos escrito y el
// checkbox marcado
$correoRecordado = "";
if (isset($_COOKIE["kercado_correo"])) {
    $correoRecordado = (string) $_COOKIE["kercado_correo"];
}
$volver = textoGet("volver");

// la cookie del correo dura treinta días, no la lee javascript y no viaja
// cuando otro sitio nos manda un formulario, la clave nunca se guarda aquí
function guardarCorreoRecordado(string $correo, int $vence): void
{
    setcookie("kercado_correo", $correo, [
        "expires" => $vence,
        "path" => "",
        "httponly" => true,
        "samesite" => "Lax",
    ]);
}

// revisa los datos del registro igual que registro.js, porque el javascript
// se puede saltar y el servidor tiene que volver a mirar todo
function validarRegistro(array $datos, string $clave, string $confirmar, bool $terminos): array
{
    $errores = [];

    if ($datos["nombres"] === "") {
        $errores["nombres"] = "escribe tus nombres";
    }
    if ($datos["apellidos"] === "") {
        $errores["apellidos"] = "escribe tus apellidos";
    }
    if ($datos["correo"] === "") {
        $errores["correo"] = "escribe tu correo";
    } elseif (!filter_var($datos["correo"], FILTER_VALIDATE_EMAIL)) {
        $errores["correo"] = "ese correo no tiene la forma vecino@correo.com";
    }
    if (!preg_match('/^9[0-9]{8}$/', $datos["telefono"])) {
        $errores["telefono"] = "el celular tiene nueve dígitos y empieza con 9, por ejemplo 987654321";
    }
    if (!in_array($datos["torre"], ["A", "B", "C", "D"], true)) {
        $errores["torre"] = "elige la torre donde vives";
    }
    $numero = (int) $datos["numeroDepartamento"];
    if (!preg_match('/^[0-9]{3,4}$/', $datos["numeroDepartamento"]) || $numero < 101 || $numero > 1204) {
        $errores["numeroDepartamento"] = "los departamentos van del 101 al 1204";
    }
    if (strlen($clave) < 8 || !preg_match('/[A-Za-z]/', $clave) || !preg_match('/[0-9]/', $clave)) {
        $errores["clave"] = "la contraseña necesita ocho caracteres o más, con letras y números";
    }
    if ($confirmar !== $clave) {
        $errores["confirmar"] = "las dos contraseñas tienen que ser iguales";
    }
    if (!$terminos) {
        $errores["terminos"] = "para crear la cuenta hay que aceptar el reglamento";
    }

    return $errores;
}

if (seEnvioFormulario()) {
    comprobarCsrf();
    $accion = textoPost("accion");

    if ($accion === "ingresar") {
        $correo = textoPost("correo");
        $clave = (string) ($_POST["clave"] ?? "");
        $volver = textoPost("volver");
        $correoRecordado = $correo;

        if ($correo === "") {
            $erroresIngreso["correo"] = "escribe el correo con el que te registraste";
        }
        if ($clave === "") {
            $erroresIngreso["clave"] = "escribe tu contraseña";
        }

        if (count($erroresIngreso) === 0) {
            $resultado = iniciarSesion($correo, $clave);

            if ($resultado["ok"]) {
                // si marcó recordar guardamos el correo, si no borramos el
                // que hubiera poniéndole una fecha que ya pasó
                if (isset($_POST["recordar"])) {
                    guardarCorreoRecordado($correo, time() + 86400 * 30);
                } else {
                    guardarCorreoRecordado("", time() - 3600);
                }
                avisar("hola, " . $resultado["residente"]["nombres"] . ", qué bueno verte de nuevo");
                redirigir(paginaSegura($volver));
            }
            $mensajeIngreso = $resultado["mensaje"];
        } else {
            $mensajeIngreso = "revisa los datos marcados para poder entrar";
        }
    }

    if ($accion === "registrar") {
        $datos = [
            "nombres" => textoPost("nombres"),
            "apellidos" => textoPost("apellidos"),
            "correo" => textoPost("correo"),
            "telefono" => str_replace(" ", "", textoPost("telefono")),
            "torre" => textoPost("torre"),
            "numeroDepartamento" => textoPost("numeroDepartamento"),
        ];
        $clave = (string) ($_POST["clave"] ?? "");
        $aceptoTerminos = isset($_POST["terminos"]);
        $erroresRegistro = validarRegistro($datos, $clave, (string) ($_POST["confirmar"] ?? ""), $aceptoTerminos);

        if (count($erroresRegistro) === 0) {
            $datos["clave"] = $clave;
            $resultado = registrarSolicitud($datos);

            if ($resultado["ok"]) {
                avisar("tu solicitud quedó registrada, la administración tiene que validar que vives en el condominio antes de que puedas entrar");
                redirigir("registro.php");
            }
            // si el almacén la rechaza es porque el correo ya tiene cuenta
            $erroresRegistro["correo"] = $resultado["mensaje"];
        }
    }
}

// pone aria-invalid en el campo que tiene error, así el lector de pantalla
// avisa que hay algo que corregir
function marcaInvalido(array $errores, string $campo): string
{
    if (isset($errores[$campo])) {
        return ' aria-invalid="true"';
    }
    return "";
}

// deja elegida la torre que el vecino ya había marcado
function torreElegida(string $torre, string $opcion): string
{
    if ($torre === $opcion) {
        return " selected";
    }
    return "";
}

abrirPagina("Ingresar o registrarse", "Ingresa a tu cuenta de Kercado o pide una nueva para comprar y vender en tu condominio.", "registro");
?>
      <section class="seccion">
        <div class="contenedor">
          <h1 class="titulo-seccion">Iniciar Sesión</h1>

          <!-- el ingreso va primero porque es lo que más se usa, novalidate
               deja que los errores los muestre registro.js con nuestros
               mensajes, y si el javascript no corre los revisa php igual -->
          <form class="formulario" id="form-sesion" action="registro.php" method="post" novalidate>
            <?= campoCsrf() ?>
            <input type="hidden" name="accion" value="ingresar" />
            <input type="hidden" name="volver" value="<?= e($volver) ?>" />

            <!-- aquí sale el mensaje del servidor si la cuenta no existe o
                 está pendiente, aria-live hace que el lector lo lea -->
<?php if ($mensajeIngreso !== ""): ?>
            <p class="mensaje mensaje--error" id="aviso-sesion" aria-live="polite"><?= e($mensajeIngreso) ?></p>
<?php else: ?>
            <p class="mensaje" id="aviso-sesion" aria-live="polite"></p>
<?php endif; ?>

            <fieldset>
              <legend>¿Ya tienes cuenta?</legend>

              <div class="campo">
                <label for="s-correo">Correo electrónico<span class="obligatorio">*</span></label>
                <input type="email" id="s-correo" name="correo" required
                       value="<?= e($correoRecordado) ?>"
                       autocomplete="email" aria-describedby="e-scorreo"<?= marcaInvalido($erroresIngreso, "correo") ?> />
                <small class="campo__error" id="e-scorreo"><?php pintarErrorCampo($erroresIngreso, "correo"); ?></small>
              </div>

              <div class="campo">
                <label for="s-clave">Contraseña <span class="obligatorio">*</span></label>
                <input type="password" id="s-clave" name="clave" required
                       autocomplete="current-password" aria-describedby="e-sclave"<?= marcaInvalido($erroresIngreso, "clave") ?> />
                <button class="boton boton--texto boton--sm" type="button"
                        data-mostrar="s-clave" aria-label="Mostrar contraseña">Mostrar</button>
                <small class="campo__error" id="e-sclave"><?php pintarErrorCampo($erroresIngreso, "clave"); ?></small>
              </div>

              <!-- recordar guarda solo el correo en una cookie, nunca la
                   contraseña -->
              <div class="campo">
                <label class="checkbox">
                  <input type="checkbox" id="s-recordar" name="recordar" value="1"<?= isset($_COOKIE["kercado_correo"]) ? " checked" : "" ?> />
                  Recordar mi correo en este equipo
                </label>
              </div>

              <button class="boton boton--linea boton--full" type="submit">
                Ingresar
              </button>
            </fieldset>
          </form>

          <div class="aviso mt-3">
            <p><strong>Cuentas de prueba</strong> (la contraseña de todas es <code>Kercado2026</code>):</p>
            <p>Cuenta activa: <code>carmen.rojas@kercado.pe</code></p>
            <p>Cuenta pendiente: <code>sofia.mendoza@kercado.pe</code>, no puede entrar hasta que la administración la active.</p>
          </div>
        </div>
      </section>

      <section class="seccion seccion--alterna">
        <div class="contenedor">
          <h2 class="titulo-seccion">Formulario de Registro</h2>

          <form class="formulario" id="form-registro" action="registro.php" method="post" novalidate>
            <?= campoCsrf() ?>
            <input type="hidden" name="accion" value="registrar" />

<?php if (count($erroresRegistro) > 0): ?>
            <p class="mensaje mensaje--error" id="aviso-registro" aria-live="polite">revisa los datos marcados para poder registrarte</p>
<?php else: ?>
            <p class="mensaje" id="aviso-registro" aria-live="polite"></p>
<?php endif; ?>

            <!-- el fieldset agrupa los campos que van juntos, cada campo tiene
                 su label y aria-describedby lo une con el small de su error -->
            <fieldset>
              <legend>Datos Personales</legend>

              <div class="campo">
                <label for="c-nombre">Nombres<span class="obligatorio">*</span></label>
                <input type="text" id="c-nombre" name="nombres" required maxlength="60"
                       value="<?= e($datos["nombres"]) ?>"
                       autocomplete="given-name" aria-describedby="e-nombre"<?= marcaInvalido($erroresRegistro, "nombres") ?> />
                <small class="campo__error" id="e-nombre"><?php pintarErrorCampo($erroresRegistro, "nombres"); ?></small>
              </div>

              <div class="campo">
                <label for="c-apellidos">Apellidos<span class="obligatorio">*</span></label>
                <input type="text" id="c-apellidos" name="apellidos" required maxlength="60"
                       value="<?= e($datos["apellidos"]) ?>"
                       autocomplete="family-name" aria-describedby="e-apellidos"<?= marcaInvalido($erroresRegistro, "apellidos") ?> />
                <small class="campo__error" id="e-apellidos"><?php pintarErrorCampo($erroresRegistro, "apellidos"); ?></small>
              </div>

              <div class="campo">
                <label for="c-correo">Correo electrónico<span class="obligatorio">*</span></label>
                <input type="email" id="c-correo" name="correo" required maxlength="120"
                       value="<?= e($datos["correo"]) ?>"
                       autocomplete="email" aria-describedby="e-correo"<?= marcaInvalido($erroresRegistro, "correo") ?> />
                <small class="campo__error" id="e-correo"><?php pintarErrorCampo($erroresRegistro, "correo"); ?></small>
              </div>

              <div class="campo">
                <label for="c-tel">Celular<span class="obligatorio">*</span></label>
                <input type="tel" id="c-tel" name="telefono" required placeholder="987 654 321"
                       value="<?= e($datos["telefono"]) ?>"
                       autocomplete="tel" aria-describedby="e-tel"<?= marcaInvalido($erroresRegistro, "telefono") ?> />
                <small class="campo__error" id="e-tel"><?php pintarErrorCampo($erroresRegistro, "telefono"); ?></small>
              </div>
            </fieldset>

            <fieldset>
              <legend>Datos de tu Unidad</legend>

              <div class="campo">
                <label for="c-torre">Torre <span class="obligatorio">*</span></label>
                <select id="c-torre" name="torre" required aria-describedby="e-torre"<?= marcaInvalido($erroresRegistro, "torre") ?>>
                  <option value="">Selecciona tu torre</option>
                  <option value="A"<?= torreElegida($datos["torre"], "A") ?>>Torre A</option>
                  <option value="B"<?= torreElegida($datos["torre"], "B") ?>>Torre B</option>
                  <option value="C"<?= torreElegida($datos["torre"], "C") ?>>Torre C</option>
                  <option value="D"<?= torreElegida($datos["torre"], "D") ?>>Torre D</option>
                </select>
                <small class="campo__error" id="e-torre"><?php pintarErrorCampo($erroresRegistro, "torre"); ?></small>
              </div>

              <div class="campo">
                <label for="c-depa">Número de departamento<span class="obligatorio">*</span></label>
                <input type="number" id="c-depa" name="numeroDepartamento" required min="101" max="1204"
                       value="<?= e($datos["numeroDepartamento"]) ?>"
                       aria-describedby="e-depa"<?= marcaInvalido($erroresRegistro, "numeroDepartamento") ?> />
                <small class="campo__error" id="e-depa"><?php pintarErrorCampo($erroresRegistro, "numeroDepartamento"); ?></small>
              </div>
            </fieldset>

            <fieldset>
              <legend>Tu Cuenta</legend>

              <!-- las contraseñas nunca se vuelven a escribir en la página,
                   si hubo un error el vecino las teclea otra vez -->
              <div class="campo">
                <label for="c-clave">Contraseña <span class="obligatorio">*</span></label>
                <input type="password" id="c-clave" name="clave" required
                       autocomplete="new-password" aria-describedby="e-clave a-clave"<?= marcaInvalido($erroresRegistro, "clave") ?> />
                <button class="boton boton--texto boton--sm" type="button"
                        data-mostrar="c-clave" aria-label="Mostrar contraseña">Mostrar</button>
                <small class="campo__error" id="e-clave"><?php pintarErrorCampo($erroresRegistro, "clave"); ?></small>
                <small class="campo__ayuda" id="a-clave">Mínimo 8 caracteres, con letras y números.</small>
              </div>

              <div class="campo">
                <label for="c-repetirclave">Repetir Contraseña <span class="obligatorio">*</span></label>
                <input type="password" id="c-repetirclave" name="confirmar" required
                       autocomplete="new-password" aria-describedby="e-repetirclave"<?= marcaInvalido($erroresRegistro, "confirmar") ?> />
                <small class="campo__error" id="e-repetirclave"><?php pintarErrorCampo($erroresRegistro, "confirmar"); ?></small>
              </div>

              <div class="campo">
                <label class="checkbox">
                  <input type="checkbox" id="c-terminos" name="terminos" value="1" required
                         aria-describedby="e-terminos"<?= $aceptoTerminos ? " checked" : "" ?><?= marcaInvalido($erroresRegistro, "terminos") ?> />
                  Acepto el reglamento de convivencia del condominio.
                </label>
                <small class="campo__error" id="e-terminos"><?php pintarErrorCampo($erroresRegistro, "terminos"); ?></small>
              </div>

              <button class="boton boton--full" type="submit">
                Crear Cuenta
              </button>
            </fieldset>
          </form>

          <div class="aviso mt-3">
            <p>
              <strong>Para pedir necesitas una cuenta.</strong> Regístrate
              con tu torre y departamento, la administración valida que seas
              residente antes de habilitarte.
            </p>
          </div>
        </div>
      </section>
<?php
cerrarPagina("js/registro.js");
