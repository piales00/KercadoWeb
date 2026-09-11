# KercadoWeb

Sitio web del **Avance 1** del proyecto Kercado — Taller de Programación Web,
Universidad Tecnológica del Perú.

**Kercado** es un marketplace hiperlocal para los residentes de un condominio
(caso piloto: Las Palmas 357, Chorrillos, Lima). Los vecinos venden entre
ellos comida preparada, postres, bebidas, panadería y abarrotes.

La idea que sostiene toda la interfaz: **un residente es comprador y vendedor
al mismo tiempo, con una sola cuenta**. No son dos tipos de usuario ni dos
inicios de sesión. Comprar y vender son dos secciones de un mismo panel.

Kercado **no cobra ni transfiere dinero** y **no gestiona la entrega**: solo
registra la oferta, el pedido y el método de pago acordado entre vecinos
(efectivo contra entrega, Yape o Plin).

---

## Restricciones técnicas

HTML5, CSS3 y JavaScript nativo. Nada más.

Sin Bootstrap, sin Tailwind, sin jQuery, sin React, sin Sass. Un único
archivo CSS externo compartido por todas las páginas, cero estilos en línea,
cero `<style>` en el HTML. Sitio estático: no hay backend ni base de datos,
así que ningún formulario envía nada.

En este avance **JavaScript no otorga puntaje**, así que no hay lógica de
sesión, ni carrito funcional, ni validaciones más allá de los atributos
nativos de HTML.

---

## Estructura del repositorio

```
KercadoWeb/
├── index.html            ← por hacer (Edgar)
├── catalogo.html         ← por hacer (Francys)
├── producto.html         ← por hacer (Francys)
├── registro.html         ← por hacer (Luis)
├── panel.html            ← por hacer (Piero)
│
├── plantilla.html        ← molde base: header + footer + main vacío
├── componentes.html      ← guía visual: cada pieza armada y lista para copiar
│
├── css/
│   └── estilo.css        ← ÚNICO archivo CSS del proyecto
│
├── assets/
│   ├── img/              ← imágenes (ver LEEME.md adentro)
│   └── audio/            ← audio de presentación (ver LEEME.md adentro)
│
├── GUIA-DE-ESTILOS.md    ← paleta, tipografía, botones, componentes
├── GUIA-DE-COMENTARIOS.md ← cómo escribir los comentarios del HTML y CSS
└── REPARTO.md            ← quién hace qué, cronograma y checklist de rúbrica
```

`plantilla.html` y `componentes.html` son **herramientas internas del
equipo**, no forman parte del entregable. No están enlazadas desde el menú.
Si quieren, se borran antes de la entrega final; también se pueden dejar,
porque documentan cómo se construyó el sitio.

---

## Cómo empezar

1. Clona el repositorio.
2. Abre **`componentes.html`** en el navegador. Ahí está armada cada pieza
   del sitio, lista para copiar.
3. Lee **`GUIA-DE-ESTILOS.md`**. Diez minutos.
4. Lee **`REPARTO.md`** y busca tu nombre.
5. Copia `plantilla.html`, renómbrala como tu página, y escribe **solo dentro
   de `<main>`**.
6. Antes de comentar tu código, lee **`GUIA-DE-COMENTARIOS.md`**.

No hace falta instalar nada ni levantar un servidor: se abren los `.html`
con doble clic.

---

## Las dos reglas del equipo

1. **Nadie escribe CSS por su cuenta.** Si necesitas algo que no está en
   `estilo.css`, lo avisas al grupo y se agrega ahí una sola vez.
2. **Nadie toca el header ni el footer.** Se copian tal cual de
   `plantilla.html`. Tienen que ser idénticos en las cinco páginas.

---

## Alcance del Avance 1

**Sí:** presentación, catálogo con aside de categorías, detalle de
publicación, registro e inicio de sesión, y panel único del residente con sus
secciones de compras y ventas.

**No (van en avances posteriores):** publicar producto, editar publicaciones,
carrito, zona de administración y página separada del vendedor.
Y por lo tanto: **ningún enlace a esas páginas**, porque no existen.

---

## Equipo

- Piero Alessandro Pérez Izquierdo
- Edgar Paolo Pérez Román
- Francys Diego Yareta Cortez
- Luis Alberto Huánuco Jiménez
