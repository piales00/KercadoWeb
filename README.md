# Kercado

Proyecto del curso Taller de Programación Web, Universidad Tecnológica del
Perú.

Kercado es un marketplace para los residentes del condominio Las Palmas 357,
en Chorrillos. Los vecinos venden entre ellos postres, menús caseros,
bebidas, panadería y abarrotes.

Cada vecino tiene una sola cuenta y con ella puede comprar y vender. Kercado
no cobra comisiones, no procesa pagos y no se encarga de la entrega, solo
conecta al vecino que vende con el que compra. El pago se acuerda entre ellos
en efectivo, Yape o Plin.

## Cómo verlo

Abrir el index.html en el navegador

## Páginas

| Página | Qué muestra |
|---|---|
| `index.html` | Inicio, qué es Kercado, cómo funciona, para quién es, métodos de pago, reglas de convivencia, el equipo y el audio de presentación |
| `catalogo.html` | Los productos de los vecinos, con un panel lateral de categorías y filtro por precio |
| `producto.html` | El detalle de un producto, con su galería de fotos y su ficha |
| `registro.html` | El formulario para crear la cuenta del vecino |
| `panel.html` | El panel del vecino, con sus compras y sus ventas |

## Estructura

```
KercadoWeb/
├── index.html
├── catalogo.html
├── producto.html
├── registro.html
├── panel.html
├── css/
│   └── estilo.css
└── assets/
    ├── img/
    └── audio/
```

## Tecnologías

- HTML5 semántico (`header`, `nav`, `main`, `section`, `aside`, `footer`).
- CSS3 en un solo archivo externo, `css/estilo.css`, compartido por las
  cinco páginas. Usa variables, Flexbox, Grid y media queries para que el
  sitio se adapte al celular.
- Sin frameworks ni librerías externas, y sin estilos dentro del HTML.

En este avance el sitio es estático, así que los formularios todavía no
envían datos a ningún servidor.

## Equipo

| Integrante | Encargado de |
|---|---|
| Piero Alessandro Pérez Izquierdo | `panel.html` e integración general |
| Edgar Paolo Pérez Román | `index.html` y sección multimedia |
| Francys Diego Yareta Cortez | `catalogo.html` y `producto.html` |
| Luis Alberto Huánuco Jiménez | `registro.html` y archivos multimedia |
