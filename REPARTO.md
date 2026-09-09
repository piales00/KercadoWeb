# Reparto de trabajo — Avance 1

**Equipo:** Piero Alessandro Pérez Izquierdo · Edgar Paolo Pérez Román ·
Francys Diego Yareta Cortez · Luis Alberto Huánuco Jiménez

**Plazo:** dos días. El **jueves por la noche está reservado** y no se toca:
esa noche no se escribe HTML nuevo, se comenta, se ordena y se ensaya.

---

## Antes de tocar nada — los 20 minutos que se ahorran horas

Esto lo hacen **los cuatro**, sin excepción, antes de escribir su primera
línea:

1. Clonar el repo y abrir **`componentes.html`** en el navegador. Ahí está
   armada cada pieza del sitio: botón, tarjeta, tabla, formulario, aside.
2. Leer **`GUIA-DE-ESTILOS.md`** completo. Son diez minutos y explica de
   dónde sale cada color y qué botón usar en cada caso.
3. Abrir **`plantilla.html`**. Ese es el molde: se copia, se renombra y se
   escribe **solo dentro de `<main>`**.
4. Leer la sección 9 de la guía ("Lo que NO se hace"). Es la lista de cosas
   que contradicen el documento que ya entregamos.

### La regla que más importa
**Nadie escribe CSS.** Si necesitas algo que no está en `estilo.css`, lo
avisas al grupo y lo agregamos una sola vez, ahí. Cuatro personas tocando el
CSS en paralelo es exactamente cómo un sitio termina con siete verdes
distintos y el docente lo nota en el Inspector.

Segunda regla: **no toques el `<header>` ni el `<footer>`.** Los copias tal
cual de `plantilla.html`. Tienen que ser idénticos en las cinco páginas y eso
se califica.

---

## Quién hace qué

### Piero — base + `panel.html` + integración
**Ya entregado:** `css/estilo.css`, `plantilla.html`, `componentes.html`,
`GUIA-DE-ESTILOS.md`, estructura del repositorio.

**Le queda:**
- `panel.html` — el panel único del residente. Dos secciones en una sola
  página, porque la cuenta es una sola:
  - **Mis compras**: tabla de pedidos realizados
    (código · fecha · vendedor · total · estado).
  - **Mis ventas**: tabla de publicaciones activas + tabla de pedidos
    recibidos (código · comprador · unidad de entrega · total · estado).
  - Mínimo 5 filas por tabla. Con dos filas no se aprecia el estilo.
- **Rol de integrador**: revisar que header y footer sean idénticos en las
  cinco páginas y que **ningún enlace muera**.

**Leer:** sección 6 de `GUIA-DE-ESTILOS.md` (tablas) y el bloque "TABLAS" de
`componentes.html`.

> Por qué el panel se lo lleva quien armó el CSS: las tablas valen 3 puntos
> compartidos con formularios y multimedia, son lo que más se olvida, y son
> el componente donde más fácil se rompe el estilo si alguien improvisa.

---

### Edgar Paolo — `index.html`
Es la página más larga, pero la más libre.

- Header y footer copiados de `plantilla.html`.
- **Hero** con la foto del condominio y la frase de presentación.
  Un solo botón naranja: "Ver el catálogo" → `catalogo.html`.
- **Qué es Kercado** — dos o tres párrafos.
- **Cómo funciona** — tres pasos, con `.grilla-auto` y `.caja`.
  Debe llevar `id="como-funciona"`, porque el pie enlaza ahí.
- **Para quién es** — residentes del condominio.
- **Métodos de pago** con `id="pagos"` y **Reglas de convivencia** con
  `id="reglas"`. No hace falta que sean secciones grandes; alcanza con que
  existan, porque el footer las enlaza y no puede haber enlaces muertos.
- **Nosotros** con `id="nosotros"` — los cuatro integrantes, **dentro de esta
  misma página**, no en un archivo aparte.
- **El audio** de presentación, con `.audio-caja`.

**Leer:** `plantilla.html` entero, y en `componentes.html` los bloques de
botones, "caja"/grilla-auto y multimedia.

> Ojo con el hero: la tentación es poner tres botones. Uno. El resto de la
> página ya invita a bajar.

---

### Francys Diego — `catalogo.html` + `producto.html`
Las dos páginas del "mundo producto". Van juntas porque comparten datos:
lo que pongas en una tarjeta tiene que coincidir con la ficha.

**`catalogo.html`**
- Layout de dos columnas con `.layout-catalogo`.
- `<aside class="panel-lateral">` a la izquierda: categorías + filtro de
  precio. **El menú no va acá**, va en el header. Este punto se califica
  explícitamente.
- `<main>` a la derecha con `.grilla-productos` y **8 o 9** tarjetas.
- Cada tarjeta: imagen, título, precio y **nombre del vendedor**. Las cuatro.
- Todas enlazan a `producto.html`.

**`producto.html`**
- Galería: imagen grande + cuatro miniaturas.
- **Una tabla** `.tabla--ficha` con: stock, horario de atención, torre y
  departamento del vendedor, categoría y métodos de pago aceptados.
- Botón "Pedir" → `registro.html`, con una `.aviso` explicando que se
  necesita cuenta.
- **No prometas nada que Kercado no hace**: nada de "pagar ahora", nada de
  seguimiento de entrega.

**Leer:** los bloques "TARJETA DE PRODUCTO", "ASIDE" y "TABLAS" (variante
ficha) de `componentes.html`.

> Cuando pongas el precio, escríbelo `S/ 12.50` con dos decimales siempre.
> Una grilla donde un precio dice `S/ 8` y el otro `S/ 12.50` se ve descuidada.

---

### Luis Alberto — `registro.html` + todos los archivos multimedia
**`registro.html`** es la página que más peso tiene en el criterio de
formularios. El login **no cuenta** como formulario completo: son dos campos.
El que demuestra dominio es el de registro.

Tiene que usar variedad de campos, y todos estos:
`text` · `email` · `password` · `tel` · `select` (torre) · `radio` o `number`
(departamento) · `checkbox` de términos · `textarea` · `submit`.

- Agrupa con `<fieldset>` y `<legend>`: datos personales / datos de la unidad /
  cuenta.
- Cada campo con su `<label for="...">` y su `id`. Sin excepciones.
- Sección secundaria de **inicio de sesión** (correo + contraseña) en la misma
  página, más corta y visualmente menos pesada.
- `action="#"`. No envía nada a ningún lado: no hay servidor.

**Archivos multimedia** — esto es responsabilidad suya para todo el equipo:
- Juntar y comprimir las imágenes según `assets/img/LEEME.md`.
- Grabar el audio de `assets/audio/LEEME.md`.
- Subirlas al repo con los nombres acordados, para que los demás solo
  escriban el `src`.

**Leer:** el bloque "CAMPOS DE FORMULARIO" de `componentes.html` (está todo
armado) y la sección 5 de `GUIA-DE-ESTILOS.md`.

> Lo más común que sale mal acá: poner el texto de ayuda en el `placeholder`.
> El placeholder desaparece apenas escribes. Usa `<small class="campo__ayuda">`.

---

## Cronograma

### Miércoles
| | |
|---|---|
| Los cuatro | Leer la guía y `componentes.html` (20 min) |
| Cada uno | Copiar `plantilla.html`, renombrarla, armar la estructura de sus secciones con contenido de mentira |
| Luis | Conseguir y comprimir imágenes; subirlas al repo |
| Cierre del día | Las cinco páginas existen y abren, aunque el contenido esté a medias |

### Jueves — de día
| | |
|---|---|
| Cada uno | Contenido real, textos definitivos, `src` de las imágenes |
| Piero | Panel terminado + primera pasada de integración |

### Jueves — noche (reservada, no se escribe código nuevo)
1. **Comentar HTML y CSS.** Vale 3 puntos y no requiere programar nada.
   Comentario útil = explica *por qué*, no *qué*.
   - Malo: `<!-- div -->`
   - Bueno: `<!-- Grilla de productos: se adapta sola de 4 a 1 columna -->`
2. **Ensayar el Inspector.** Vale 2 puntos y cada uno tiene que saber
   defender su página. Ver la lista de abajo.
3. **Ordenar archivos.** Nombres en minúscula, sin tildes, sin espacios.
   Borrar archivos sueltos, capturas y `Copia de index.html`.
4. **Cazar enlaces muertos.** Clic en cada enlace del menú, del pie y de cada
   tarjeta. Cada uno tiene que caer en una de las cinco páginas.

---

## Ensayo del Inspector (2 puntos)

Cada integrante tiene que poder abrir F12 en **su** página y responder,
sin dudar, estas cinco preguntas:

1. **Señala la estructura semántica.** Muestra el `<header>`, el `<main>` y
   el `<footer>` en el árbol del DOM y di para qué sirve cada uno.
2. **Selecciona un elemento y explica de dónde le viene el color.** La
   respuesta correcta es: de una variable definida en `:root` de
   `estilo.css`, no de un hexadecimal escrito ahí mismo.
3. **Cambia un valor en vivo** en el panel de estilos y explica qué pasó.
   Lo más vistoso: cambiar `--naranja` en `:root` y ver cómo cambia el sitio
   entero de golpe. Eso demuestra que entendiste las variables CSS.
4. **Muestra el modo responsive** (el ícono del celular) y explica por qué el
   catálogo pasa a una columna. Respuesta: por
   `repeat(auto-fill, minmax(240px, 1fr))`, no por una media query.
5. **Abre la pestaña Consola** y muestra que no hay ningún error en rojo.

---

## Checklist final contra la rúbrica

Antes de entregar, marcar cada casilla abriendo el sitio:

**Estructura HTML (3 pts)**
- [ ] Las 5 páginas tienen `<!DOCTYPE html>` y `<html lang="es">`
- [ ] Todas tienen `<meta charset>`, `<meta name="viewport">`, `<meta name="description">` y `<title>` propio
- [ ] Todas usan `<header>`, `<nav>`, `<main>`, `<footer>`; el catálogo además `<aside>`
- [ ] Se usan `<section>`, `<article>`, `<figure>` donde corresponde

**Diseño y navegación (3 pts)**
- [ ] Un solo `estilo.css`, enlazado en las 5 páginas
- [ ] Cero `style=""` en el HTML y cero `<style>` en el `<head>`
- [ ] Cero colores en hexadecimal fuera del bloque `:root`
- [ ] Cada página marca su enlace activo con `menu__enlace--activo`

**Estructura de la página (2 pts)**
- [ ] El menú está en el `<header>`, no en el aside
- [ ] Header y footer **idénticos** en las 5 páginas
- [ ] `panel.html` se alcanza desde el menú **sin pasar por el login**

**Formularios, multimedia y tablas (3 pts)**
- [ ] `registro.html` tiene los 9 tipos de campo de la lista
- [ ] Cada campo tiene su `<label for>` con `id` correspondiente
- [ ] Todas las imágenes tienen `alt` descriptivo
- [ ] Hay un `<audio controls>` funcionando
- [ ] Las tablas usan `caption`, `thead`, `tbody` y `scope`
- [ ] Todas las tablas están envueltas en `.tabla-scroll`

**Funcionamiento (1 pt)**
- [ ] Ningún enlace muerto en menú, pie ni tarjetas
- [ ] Ninguna imagen rota
- [ ] Consola del navegador sin errores

**Documentación (4 pts)**
- [ ] HTML comentado en las 5 páginas
- [ ] CSS comentado (ya viene comentado — mantenlo así al agregar)
- [ ] Nombres de archivo en minúscula, sin tildes ni espacios
- [ ] No quedan archivos sueltos ni carpetas de basura en el repo
- [ ] Cada integrante ensayó su demostración con el Inspector
