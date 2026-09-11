# Guía de comentarios — Kercado

Los comentarios del HTML y del CSS valen puntos en la rúbrica, pero sobre
todo los va a leer el profesor. Tienen que sonar a un alumno que le explica
su página, no a un manual ni a una lista de pendientes del equipo.

Los archivos de referencia son **`panel.html`** para el HTML y
**`css/estilo.css`** para el CSS. Si tienes dudas, ábrelos y copia el tono.

---

## La idea en una frase

Cada comentario cuenta **qué muestra esa parte de la página y por qué la
hicimos así**, con palabras normales, como si se lo estuvieras explicando al
profesor en voz alta o escribiendo rápido en un chat.

---

## Reglas

### 1. Nada de decoración
No se usan líneas de adorno ni bloques tipo cartel.

```html
<!-- Malo -->
<!-- =====================================================================
     CABECERA  —  IDÉNTICA EN LAS CINCO PÁGINAS
     ===================================================================== -->

<!-- Bueno -->
<!-- esta es la cabecera, es la misma en las cinco páginas del sitio,
     tiene el logo, el buscador, el botón para ingresar y el menú -->
```

Tampoco van flechas (`▼▼▼`), separadores con `·` o `—`, numeración de
secciones (`01.`, `02.`) ni títulos en mayúsculas.

### 2. Nada de palabras de alerta ni mayúsculas para gritar
Nada de `OJO`, `AVISO`, `IMPORTANTE`, `NOTA`, `NO`, `ÚNICA`, `SIEMPRE` en
mayúsculas. Si algo importa, se explica con calma y se entiende solo.

```html
<!-- Malo -->
<!-- Buscador. AVISO HONESTO: en este avance es decorativo. -->

<!-- Bueno -->
<!-- el buscador todavía no busca nada porque en este avance no usamos
     javascript ni tenemos servidor, pero lo dejamos para que se vea
     cómo quedará la cabecera -->
```

### 3. Sin dos puntos para armar el comentario
Nada de `Columna 1: qué es esto`, `Viewport: le dice al celular...` ni
`Hecho por: fulano`. Se escribe como una oración normal.

```html
<!-- Malo -->
<!-- Codificación: sin esto las tildes salen como símbolos raros -->

<!-- Bueno -->
<!-- con esto las tildes y las eñes se ven bien en el navegador -->
```

Los dos puntos que forman parte del código, como `scope="col"`, sí se
pueden nombrar.

### 4. Escribir suelto, como se escribe de verdad
Un alumno no escribe sus comentarios como un documento formal, así que
tampoco tienen que salir perfectos:

- **Minúscula al inicio**, y los nombres como `kercado` o `javascript`
  también pueden ir en minúscula.
- **Más comas y menos puntos.** Las ideas se van uniendo con comas, como
  cuando uno explica algo de corrido.
- **Sin punto final** al terminar el comentario.

```css
/* Malo */
/* Filas cebra: nth-child(even) pinta una sí y una no. Con tablas de 6+
   filas evita que el ojo se salte de renglón al leer. */

/* Bueno */
/* pinta una fila sí y una no, así es más fácil seguir cada fila con la
   vista */
```

Tampoco hay que exagerar. Las tildes se mantienen y el comentario tiene
que entenderse a la primera, la idea es que suene natural, no que parezca
mal escrito a propósito.

### 5. No hablarle al profesor de la rúbrica ni de los pendientes del grupo
Frases como "la rúbrica lo separa", "esto se califica", "ningún enlace
muerto", "queda muy bien mencionar en la exposición" o "no se enlaza a
páginas que todavía no existen" son notas internas del equipo. Un alumno no
le escribe eso a su profesor. Esas notas van en `REPARTO.md`, no en el
código.

```html
<!-- Malo -->
<!-- El menú va ACÁ, en el <header>. El <aside> del catálogo es solo para
     categorías y filtros: son dos cosas distintas y la rúbrica lo separa. -->
<!-- Las cuatro páginas del avance. Ningún enlace muerto: las cinco existen. -->

<!-- Bueno -->
<!-- este es el menú principal, en cada página marcamos como activo el
     enlace de la página donde está el vecino -->
```

### 6. Explicar qué se ve y para qué sirve
Lo que más ayuda es decir qué ve el usuario en esa parte y por qué la
armamos así. No hace falta repetir el nombre de la etiqueta.

```html
<!-- Malo -->
<!-- div -->
<!-- tabla de compras -->

<!-- Bueno -->
<!-- pusimos la tabla dentro de este div para que en el celular se
     pueda deslizar hacia los lados, porque cinco columnas no entran
     en una pantalla pequeña -->
```

### 7. En el CSS, explicar sin pasarse
En el CSS sí conviene contar qué hace cada cosa, pero sin volverlo una
clase de teoría. Una o dos líneas bastan, y no todas las propiedades
necesitan su comentario.

```css
/* Malo, demasiado */
/* Flexbox en columna + min-height 100vh es el truco clásico para que el
   footer se quede abajo del todo incluso en páginas con poco contenido
   (nos pasa en producto.html). Nada de position: fixed. */

/* Bueno */
/* con esto el pie de página se queda abajo aunque la página tenga poco
   contenido */
```

Los comentarios cortos al lado de una propiedad siguen el mismo estilo.

```css
white-space: nowrap;              /* el precio no se parte en dos líneas */
```

Para separar las partes del archivo basta un comentario simple con el
nombre de la parte y una línea que cuente qué hay, sin carteles.

```css
/* tablas

   las usamos en el panel para las compras y ventas, y en la ficha del
   producto */
```

### 8. Mencionar al profesor de vez en cuando, no en cada comentario
Decir "profesor" una vez por página, en la parte principal, queda natural.
Ponerlo en todos los comentarios se vuelve repetitivo.

```html
<!-- en esta parte se muestran las compras del vecino, profesor, cada fila
     es un pedido que hizo, con la fecha, a quién le compró, cuánto pagó y
     cómo va el pedido -->
```

### 9. Corto está bien, vago no
Si la parte es simple, el comentario también. No hay que inflarlo.

```html
<!-- el caption es el título de la tabla -->
<!-- el logo lleva a la página de inicio -->
<!-- nuestros nombres -->
```

Lo que sí hay que evitar es el comentario que no dice nada, como
`<!-- aquí explicamos cosas -->`. Si es corto, que igual diga qué hay.

### 10. Escribir como nosotros
En primera persona (*pusimos*, *usamos*, *lo dejamos*), en español normal y
sin frases de marketing. El comentario de arriba de cada archivo dice quién
hizo la página y de qué trata, sin formato de ficha.

```html
<!--
  hecho por piero. aquí el vecino ve lo que compró y lo que
  vende, lo pusimos todo en una sola página porque en kercado cada vecino
  tiene una sola cuenta, y con esa misma cuenta puede comprar y vender
-->
```

---

## Header y footer

El **código** del header y del footer tiene que ser idéntico en las cinco
páginas, y sus **comentarios** también los dejamos iguales. Cópialos tal
cual de `plantilla.html`, que ya están escritos con estas reglas.

---

## Antes de subir tu página, revisa

- [ ] Ningún comentario tiene líneas de `====`, `----`, flechas ni numeración
- [ ] No hay `OJO`, `AVISO`, `IMPORTANTE`, `NOTA` ni palabras en mayúsculas
- [ ] No hay comentarios armados con dos puntos (`Algo: explicación`)
- [ ] Los comentarios empiezan en minúscula y unen ideas con comas
- [ ] No se menciona la rúbrica, puntos, la exposición, "enlaces muertos" ni tareas del grupo
- [ ] Cada comentario dice qué muestra esa parte o por qué está así
- [ ] En el CSS las explicaciones son de una o dos líneas
- [ ] "Profesor" aparece una vez, no en todos los comentarios
- [ ] El comentario de arriba del archivo dice quién hizo la página y qué muestra
