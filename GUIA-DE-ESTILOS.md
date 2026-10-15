# Guía de estilos — Kercado

Esta es la referencia del diseño del proyecto. Todo lo que está acá ya está
escrito en `css/estilo.css`.

**La regla que sostiene todo esto:** nadie escribe CSS nuevo por su cuenta.
Si necesitas algo que no existe, lo avisas al grupo y se agrega a
`estilo.css` una sola vez. Cuatro personas escribiendo CSS en paralelo es
exactamente como un sitio termina con siete verdes distintos.

---

## 1. La idea del diseño

Kercado es un mercado de vecinos, no una fintech. El diseño tenía que
sentirse **cálido y de barrio**, no corporativo:

- **Verde** de mercado: confianza, producto fresco. Es la estructura del
  sitio (cabecera, pie, títulos).
- **Naranja** de toldo de puesto: es la **acción**. Lo que se toca y lo que
  cuesta plata.
- **Crema** de papel de envolver: el fondo. Nunca blanco puro, porque el
  blanco puro cansa la vista y se ve a hospital.

Si tuvieras que resumirlo en una frase para la exposición: *el verde
organiza, el naranja invita a hacer clic, y el crema deja respirar.*

---

## 2. Paleta

| Variable CSS | Hex | Para qué |
|---|---|---|
| `--verde` | `#14603C` | Cabecera, pie, encabezados de tabla, títulos |
| `--verde-oscuro` | `#0C3F27` | Barra del menú, títulos h1–h4, hover del verde |
| `--verde-claro` | `#E4EFE7` | Fondos suaves, filas alternas de tabla, etiquetas |
| `--naranja` | `#E8622A` | **Solo acciones y precios.** Es el acento |
| `--naranja-oscuro` | `#C44E1D` | Hover del naranja |
| `--crema` | `#F5EFE0` | Fondo de la página |
| `--arena` | `#B7A29C` | Neutro cálido: bordes, texto de apoyo en zonas oscuras |
| `--blanco` | `#FFFDF8` | Fondo de tarjetas, formularios y tablas |
| `--texto` | `#1E2A24` | Texto normal |
| `--texto-suave` | `#5C6A63` | Subtítulos, ayudas de formulario, metadata |

Estados de pedido (columna "Estado" de las tablas del panel):

| Variable | Hex | Estado |
|---|---|---|
| `--estado-pendiente` | `#B8860B` | Pendiente |
| `--estado-entregado` | `#14603C` | Entregado |
| `--estado-cancelado` | `#A63A2A` | Cancelado |

### La regla del naranja
El naranja es el color más fuerte de la paleta. **Un solo elemento naranja
importante por pantalla.** Si en el catálogo pones el filtro naranja, el
botón "Ver" naranja y el precio naranja, la pantalla grita y nada resalta.
El precio ya es naranja: eso es suficiente.

### Nunca escribas un hex en el HTML
Ni en el CSS fuera del bloque `:root`. Siempre `var(--verde)`. Si mañana
cambiamos un color, se cambia en un lugar y cambia el sitio entero.

---

## 3. Tipografía

Usamos la **pila de fuentes del sistema**, no una fuente descargada.
Decisión consciente: el sitio no depende de internet y se ve idéntico el día
de la exposición aunque el wifi del aula falle.

| Variable | Valor | Uso |
|---|---|---|
| `--fuente-titulos` | `"Trebuchet MS", "Segoe UI", system-ui, sans-serif` | h1–h4, logo, precios, caption de tablas |
| `--fuente-texto` | `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` | Todo lo demás |

Escala de tamaños. Son cinco, y con cinco alcanza:

| Variable | Tamaño | Uso típico |
|---|---|---|
| `--txt-xs` | 0.78rem | Etiquetas, metadata, ayudas de formulario |
| `--txt-sm` | 0.88rem | Texto de tablas, menú, botones, formularios |
| `--txt-md` | 1rem | Texto normal, h4 |
| `--txt-lg` | 1.25rem | h3, precio de tarjeta, logo |
| `--txt-xl` | 1.75rem | h2 (títulos de sección) |
| `--txt-2xl` | 2.5rem | h1 (uno por página, y solo uno) |

Detalles ya resueltos en el CSS y que conviene saber explicar:

- `line-height: 1.6` en el cuerpo — el aire entre líneas es lo que más
  cambia la legibilidad de un texto largo.
- `max-width: 68ch` en los párrafos — ninguna línea cruza toda una pantalla
  ancha, porque el ojo se pierde al volver al inicio del renglón.
- En celular, `--txt-2xl` baja a 1.9rem automáticamente.

---

## 4. Espaciado

Todo es múltiplo de 8px. No inventen valores sueltos tipo `13px`.

`--sp-1` 8px · `--sp-2` 16px · `--sp-3` 24px · `--sp-4` 32px ·
`--sp-5` 48px · `--sp-6` 64px

Bordes: `--radio-sm` 6px (botones, campos) · `--radio-md` 12px (tarjetas,
tablas) · `--radio-lg` 20px (imágenes con marco).

Sombras: `--sombra-suave` en reposo, `--sombra-media` al pasar el mouse.

---

## 5. Botones

Hay **tres** y ninguno más.

```html
<a class="boton" href="#">Pedir ahora</a>                <!-- principal -->
<a class="boton boton--linea" href="#">Ver catálogo</a>  <!-- secundario -->
<a class="boton boton--texto" href="#">Ver más</a>       <!-- terciario -->
```

- `.boton` — relleno naranja. Es **la** acción de la pantalla. Uno por página.
- `.boton--linea` — contorno verde. Alternativa válida pero no la que empujamos.
- `.boton--texto` — sin caja. Acciones de poco peso.

Modificadores que se combinan con cualquiera de los tres:
`.boton--sm`, `.boton--lg`, `.boton--full` (ancho completo).

Funciona igual en `<a>` y en `<button>`: los dos se ven idénticos.

### Qué botón va en cada página
| Página | Botón principal (naranja) |
|---|---|
| `index.html` | "Ver el catálogo" en el hero |
| `catalogo.html` | ninguno grande — el naranja lo llevan los precios |
| `producto.html` | "Pedir" |
| `registro.html` | "Crear mi cuenta" |
| `panel.html` | ninguno — es una pantalla de lectura |

---

## 6. Componentes disponibles

Todos están armados y listos para copiar en **`componentes.html`**.
Ábrelo en el navegador antes de escribir HTML nuevo.

| Componente | Clase base | Dónde se usa |
|---|---|---|
| Cabecera | `.encabezado` | las 5 páginas, idéntica |
| Menú | `.menu` | dentro del header |
| Pie | `.pie` | las 5 páginas, idéntico |
| Contenedor centrado | `.contenedor` | dentro de cada section |
| Sección | `.seccion` / `.seccion--alterna` | todas |
| Título con barrita | `.titulo-seccion` | todas |
| Tarjeta de producto | `.tarjeta` dentro de `.grilla-productos` | catálogo |
| Aside de filtros | `.panel-lateral` | catálogo |
| Layout 2 columnas | `.layout-catalogo` | catálogo |
| Tabla | `.tabla` dentro de `.tabla-scroll` | panel, producto |
| Tabla ficha | `.tabla.tabla--ficha` | producto |
| Píldora de estado | `.estado--pendiente/entregado/cancelado` | panel |
| Formulario | `.formulario`, `.campo`, `.campo-fila`, `.opciones` | registro |
| Caja de aviso | `.aviso` | registro, producto |
| Etiqueta | `.etiqueta`, `.etiqueta--naranja` | tarjetas |
| Caja blanca genérica | `.caja` | index, todas |
| Grilla adaptable | `.grilla-auto` | index (pasos, equipo) |
| Audio | `.audio-caja` | index |
| Galería | `.galeria__principal`, `.galeria__miniaturas` | producto |

Utilidades sueltas: `.centrado`, `.mt-0`, `.mb-0`, `.mt-3`, `.mb-3`,
`.solo-lectores`.

---

## 7. Convención de nombres de clase

Usamos una versión simple de **BEM**, en castellano:

```
.bloque              →  .tarjeta
.bloque__elemento    →  .tarjeta__precio     (parte de la tarjeta)
.bloque--variante    →  .boton--linea        (una versión del botón)
```

Dos guiones bajos = "esto es una parte de".
Dos guiones medios = "esta es una variante de".

Nunca uses el nombre de la página como clase (`.clase-de-catalogo`): si algo
sirve solo en una página, probablemente debería servir en todas.

---

## 8. Cosas que ya están resueltas y no hay que rehacer

Vale la pena saberlas, porque son las respuestas a las preguntas típicas de
la exposición:

- **El pie siempre queda abajo**, incluso en páginas cortas —
  `body { display:flex; flex-direction:column; min-height:100vh }` y
  `main { flex:1 }`.
- **El catálogo se adapta solo** de 4 a 1 columna sin ninguna media query —
  `grid-template-columns: repeat(auto-fill, minmax(240px, 1fr))`.
- **Las tarjetas quedan parejas** aunque los títulos tengan distinto largo —
  `flex:1` en `.tarjeta__cuerpo` empuja el pie hacia abajo.
- **El catálogo no "salta"** mientras cargan las fotos — `aspect-ratio: 4/3`
  reserva el espacio antes de que llegue la imagen.
- **Las tablas no rompen el celular** — van envueltas en `.tabla-scroll`,
  que les da su propio scroll horizontal.
- **`box-sizing: border-box`** en todo: el padding no agranda las cajas.
- **Foco visible** con `:focus-visible` — se ve un anillo naranja al navegar
  con el teclado.
- **Estilos de impresión**: si imprimes el panel, desaparecen menú y pie.

---

## 9. Lo que NO se hace en este avance

Cuidado con esto, porque es incoherencia con el documento entregado y se nota:

- ❌ Nada de pagos en línea, pasarelas ni "pagar con tarjeta". Kercado
  **registra** el método acordado (efectivo, Yape, Plin), no cobra.
- ❌ Nada de seguimiento de repartidor ni estado de envío. Kercado no
  gestiona la entrega.
- ❌ Nada de "iniciar sesión como vendedor". **Una sola cuenta.** Comprar y
  vender son dos secciones del mismo panel.
- ❌ Nada de carrito, publicar producto ni zona de administración: van en
  avances posteriores.
- ❌ **Ningún enlace a una página que no existe.** Si no está entre las
  cinco, el enlace apunta a un ancla dentro de `index.html`.
- ❌ Nada de `style=""` en el HTML ni de `<style>` en el `<head>`.
- ❌ Nada de Bootstrap, Tailwind, jQuery, ni fuentes externas.
