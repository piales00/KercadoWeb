/*
  hecho por piero. estos son los datos con los que arranca el sitio, la
  primera vez que alguien lo abre almacen.js los copia al navegador y desde
  ahí se trabaja, los sacamos de las páginas del avance 1 para que el
  catálogo y el panel sigan mostrando a los mismos vecinos y los mismos
  productos, los nombres de los campos son los del diagrama de clases
*/

const DATOS_INICIALES = {

  /* si cambiamos algo de estos datos subimos este número, así almacen.js
     se da cuenta de que lo guardado en el navegador quedó viejo y lo vuelve
     a cargar */
  version: 2,

  /* las cinco categorías del catálogo, el id es corto y sin tildes porque
     viaja en la dirección de la página, por ejemplo
     catalogo.html?categoria=postres */
  categorias: [
    { idCategoria: "comida-preparada", nombre: "Comida preparada", descripcion: "Menús, platos de fondo y comida lista para servir" },
    { idCategoria: "postres", nombre: "Postres", descripcion: "Tortas, queques, alfajores y dulces caseros" },
    { idCategoria: "panaderia", nombre: "Panadería", descripcion: "Panes, empanadas y galletas horneadas en casa" },
    { idCategoria: "bebidas", nombre: "Bebidas", descripcion: "Refrescos, jugos y bebidas heladas" },
    { idCategoria: "abarrotes", nombre: "Abarrotes", descripcion: "Arroz, menestras y productos de despensa" }
  ],

  /* los vecinos, carmen es la residente con la que mostramos el sitio,
     después vienen los nueve que venden en el catálogo y los que le
     compraron a carmen, todos entran con la misma clave para que sea fácil
     probar, la última todavía está pendiente y por eso no puede entrar */
  residentes: [
    { idResidente: "R-001", nombres: "Carmen", apellidos: "Rojas", correo: "carmen.rojas@kercado.pe", clave: "Kercado2026", telefono: "987654321", torre: "C", numeroDepartamento: "504", estado: "Activo" },
    { idResidente: "R-002", nombres: "María", apellidos: "Torres", correo: "maria.torres@kercado.pe", clave: "Kercado2026", telefono: "986112233", torre: "B", numeroDepartamento: "402", estado: "Activo" },
    { idResidente: "R-003", nombres: "Gregorio", apellidos: "Torres", correo: "gregorio.torres@kercado.pe", clave: "Kercado2026", telefono: "985223344", torre: "C", numeroDepartamento: "301", estado: "Activo" },
    { idResidente: "R-004", nombres: "Micaela", apellidos: "Jiménez", correo: "micaela.jimenez@kercado.pe", clave: "Kercado2026", telefono: "984334455", torre: "A", numeroDepartamento: "111", estado: "Activo" },
    { idResidente: "R-005", nombres: "Rafael", apellidos: "Ramírez", correo: "rafael.ramirez@kercado.pe", clave: "Kercado2026", telefono: "983445566", torre: "D", numeroDepartamento: "215", estado: "Activo" },
    { idResidente: "R-006", nombres: "Luis", apellidos: "Castro", correo: "luis.castro@kercado.pe", clave: "Kercado2026", telefono: "982556677", torre: "B", numeroDepartamento: "115", estado: "Activo" },
    { idResidente: "R-007", nombres: "Ana", apellidos: "López", correo: "ana.lopez@kercado.pe", clave: "Kercado2026", telefono: "981667788", torre: "A", numeroDepartamento: "108", estado: "Activo" },
    { idResidente: "R-008", nombres: "Nicolás", apellidos: "Medina", correo: "nicolas.medina@kercado.pe", clave: "Kercado2026", telefono: "980778899", torre: "A", numeroDepartamento: "106", estado: "Activo" },
    { idResidente: "R-009", nombres: "Nataly", apellidos: "Aguirre", correo: "nataly.aguirre@kercado.pe", clave: "Kercado2026", telefono: "979889900", torre: "C", numeroDepartamento: "254", estado: "Activo" },
    { idResidente: "R-010", nombres: "Ernesto", apellidos: "Fernández", correo: "ernesto.fernandez@kercado.pe", clave: "Kercado2026", telefono: "978990011", torre: "B", numeroDepartamento: "222", estado: "Activo" },
    { idResidente: "R-011", nombres: "Jorge", apellidos: "Salazar", correo: "jorge.salazar@kercado.pe", clave: "Kercado2026", telefono: "977101112", torre: "A", numeroDepartamento: "203", estado: "Activo" },
    { idResidente: "R-012", nombres: "Rosa", apellidos: "Quispe", correo: "rosa.quispe@kercado.pe", clave: "Kercado2026", telefono: "976121314", torre: "D", numeroDepartamento: "601", estado: "Activo" },
    { idResidente: "R-013", nombres: "Diego", apellidos: "Vargas", correo: "diego.vargas@kercado.pe", clave: "Kercado2026", telefono: "975141516", torre: "B", numeroDepartamento: "307", estado: "Activo" },
    { idResidente: "R-014", nombres: "Lucía", apellidos: "Fernández", correo: "lucia.fernandez@kercado.pe", clave: "Kercado2026", telefono: "974161718", torre: "C", numeroDepartamento: "110", estado: "Activo" },
    { idResidente: "R-015", nombres: "Martín", apellidos: "Paredes", correo: "martin.paredes@kercado.pe", clave: "Kercado2026", telefono: "973181920", torre: "A", numeroDepartamento: "502", estado: "Activo" },
    { idResidente: "R-016", nombres: "Sofía", apellidos: "Mendoza", correo: "sofia.mendoza@kercado.pe", clave: "Kercado2026", telefono: "972202122", torre: "D", numeroDepartamento: "410", estado: "Pendiente" }
  ],

  /* las publicaciones, primero las nueve del catálogo del avance 1 y
     después las cinco de carmen que estaban en su panel, el precio es un
     número y no un texto para poder sumar y comparar, y la primera imagen
     de la lista es la principal */
  publicaciones: [
    {
      idPublicacion: "PB-0001",
      titulo: "Torta de Chocolate Casera",
      descripcion: "Bizcocho húmedo de chocolate con fudge y pecanas, sale para doce porciones y se entrega en caja.",
      precio: 24.00,
      stock: 12,
      horario: "9:00 a 20:00",
      imagenes: [
        "assets/img/catalogos/torta-chocolate.jpg",
        "assets/img/catalogos/torta-mini-1.jpg",
        "assets/img/catalogos/torta-mini-2.jpg",
        "assets/img/catalogos/torta-mini-3.jpg",
        "assets/img/catalogos/torta-mini-4.jpg"
      ],
      idCategoria: "postres",
      idResidente: "R-002",
      estado: "Activa",
      fechaPublicacion: "2026-08-03"
    },
    {
      idPublicacion: "PB-0002",
      titulo: "Torta de 3 leches",
      descripcion: "Tres leches clásica con canela por encima, se entrega bien fría y alcanza para ocho porciones.",
      precio: 28.00,
      stock: 6,
      horario: "10:00 a 19:00",
      imagenes: [
        "assets/img/catalogos/torta-tresleches.jpg",
        "assets/img/catalogos/tortatresleches-mini-1.jpg",
        "assets/img/catalogos/tortatresleches-mini-2.jpg",
        "assets/img/catalogos/tortatresleches-mini-3.jpg"
      ],
      idCategoria: "postres",
      idResidente: "R-003",
      estado: "Activa",
      fechaPublicacion: "2026-08-04"
    },
    {
      idPublicacion: "PB-0003",
      titulo: "Pan Baguette",
      descripcion: "Baguette crocante horneado cada mañana, se vende por unidad.",
      precio: 2.50,
      stock: 40,
      horario: "6:30 a 11:00",
      imagenes: ["assets/img/catalogos/pan-baguette.jpg"],
      idCategoria: "panaderia",
      idResidente: "R-004",
      estado: "Activa",
      fechaPublicacion: "2026-08-05"
    },
    {
      idPublicacion: "PB-0004",
      titulo: "Galletas con Chispas de Chocolate",
      descripcion: "Bolsa de seis galletas grandes con chispas de chocolate, hechas el mismo día.",
      precio: 6.00,
      stock: 20,
      horario: "15:00 a 20:00",
      imagenes: ["assets/img/catalogos/galletas-chocolate.jpg"],
      idCategoria: "panaderia",
      idResidente: "R-005",
      estado: "Activa",
      fechaPublicacion: "2026-08-06"
    },
    {
      idPublicacion: "PB-0005",
      titulo: "Refresco Chicha Morada",
      descripcion: "Chicha morada casera de maíz morado con piña y canela, botella de un litro.",
      precio: 7.50,
      stock: 15,
      horario: "11:00 a 18:00",
      imagenes: ["assets/img/catalogos/chicha-morada.jpg"],
      idCategoria: "bebidas",
      idResidente: "R-006",
      estado: "Activa",
      fechaPublicacion: "2026-08-07"
    },
    {
      idPublicacion: "PB-0006",
      titulo: "Refresco Camu Camu",
      descripcion: "Refresco de camu camu natural, poco dulce, botella de un litro.",
      precio: 8.00,
      stock: 10,
      horario: "11:00 a 18:00",
      imagenes: ["assets/img/catalogos/camu-camu.jpg"],
      idCategoria: "bebidas",
      idResidente: "R-007",
      estado: "Activa",
      fechaPublicacion: "2026-08-08"
    },
    {
      idPublicacion: "PB-0007",
      titulo: "Lomo Saltado de Res",
      descripcion: "Lomo saltado al wok con papas fritas y arroz blanco, porción generosa para una persona.",
      precio: 30.00,
      stock: 8,
      horario: "12:00 a 15:00",
      imagenes: ["assets/img/catalogos/lomo-saltado.jpg"],
      idCategoria: "comida-preparada",
      idResidente: "R-008",
      estado: "Activa",
      fechaPublicacion: "2026-08-09"
    },
    {
      idPublicacion: "PB-0008",
      titulo: "Pollo a la Brasa Entero",
      descripcion: "Pollo entero a la brasa con papas fritas, ensalada y cremas, alcanza para cuatro personas.",
      precio: 75.00,
      stock: 5,
      horario: "18:00 a 22:00",
      imagenes: ["assets/img/catalogos/pollo-a-la-brasa-entero.jpg"],
      idCategoria: "comida-preparada",
      idResidente: "R-009",
      estado: "Activa",
      fechaPublicacion: "2026-08-10"
    },
    {
      idPublicacion: "PB-0009",
      titulo: "Arroz Superior Blanco de Primera 10 kg",
      descripcion: "Saco de arroz superior de diez kilos, sellado, se entrega en la puerta del departamento.",
      precio: 25.50,
      stock: 9,
      horario: "9:00 a 18:00",
      imagenes: ["assets/img/catalogos/arroz-superior-BP-10Kg.jpg"],
      idCategoria: "abarrotes",
      idResidente: "R-010",
      estado: "Activa",
      fechaPublicacion: "2026-08-11"
    },
    {
      idPublicacion: "PB-0021",
      titulo: "Empanadas de Carne",
      descripcion: "Empanadas horneadas rellenas de carne, huevo y aceituna, el precio es por unidad.",
      precio: 4.50,
      stock: 18,
      horario: "16:00 a 20:00",
      imagenes: ["assets/img/catalogos/empanadas-carne.jpg"],
      idCategoria: "panaderia",
      idResidente: "R-001",
      estado: "Activa",
      fechaPublicacion: "2026-08-17"
    },
    {
      idPublicacion: "PB-0022",
      titulo: "Alfajores de Maicena (caja x6)",
      descripcion: "Caja de seis alfajores de maicena con manjar blanco y coco rallado.",
      precio: 12.00,
      stock: 7,
      horario: "10:00 a 20:00",
      imagenes: ["assets/img/catalogos/alfajores-maicena.jpg"],
      idCategoria: "postres",
      idResidente: "R-001",
      estado: "Activa",
      fechaPublicacion: "2026-08-18"
    },
    {
      idPublicacion: "PB-0025",
      titulo: "Ají de Gallina con Arroz",
      descripcion: "Ají de gallina cremoso con papa amarilla, huevo y arroz blanco, el precio es por porción.",
      precio: 16.00,
      stock: 10,
      horario: "12:00 a 15:00",
      imagenes: ["assets/img/catalogos/aji-de-gallina.jpg"],
      idCategoria: "comida-preparada",
      idResidente: "R-001",
      estado: "Activa",
      fechaPublicacion: "2026-08-21"
    },
    {
      idPublicacion: "PB-0027",
      titulo: "Queque de Naranja",
      descripcion: "Queque entero de naranja con glaseado, esponjoso, alcanza para diez tajadas.",
      precio: 22.00,
      stock: 3,
      horario: "10:00 a 20:00",
      imagenes: ["assets/img/catalogos/queque-naranja.jpg"],
      idCategoria: "postres",
      idResidente: "R-001",
      estado: "Activa",
      fechaPublicacion: "2026-08-24"
    },
    {
      idPublicacion: "PB-0030",
      titulo: "Limonada Frozen (1 litro)",
      descripcion: "Limonada frozen recién licuada con hierbabuena, botella de un litro.",
      precio: 9.50,
      stock: 12,
      horario: "11:00 a 19:00",
      imagenes: ["assets/img/catalogos/limonada-frozen.jpg"],
      idCategoria: "bebidas",
      idResidente: "R-001",
      estado: "Activa",
      fechaPublicacion: "2026-08-27"
    }
  ],

  /* los pedidos que ya estaban en las tablas del panel, los seis que hizo
     carmen y los cinco que le llegaron, cada pedido guarda una copia del
     título y del precio de ese momento, así si el vendedor cambia el precio
     después el pedido se queda con el precio que se acordó */
  pedidos: [
    {
      idPedido: "P-0098",
      codigo: "KC-0098",
      fechaHora: "2026-08-31T17:20:00",
      idComprador: "R-011",
      idVendedor: "R-001",
      detalles: [
        { idPublicacion: "PB-0021", titulo: "Empanadas de carne", cantidad: 6, precioUnitario: 4.50, subtotal: 27.00 }
      ],
      total: 27.00,
      pago: { metodo: "Efectivo contra entrega", monto: 27.00, estado: "Pagado" },
      estado: "Entregado",
      motivoCancelacion: ""
    },
    {
      idPedido: "P-0101",
      codigo: "KC-0101",
      fechaHora: "2026-09-01T10:15:00",
      idComprador: "R-001",
      idVendedor: "R-002",
      detalles: [
        { idPublicacion: "PB-0001", titulo: "Torta de Chocolate Casera", cantidad: 1, precioUnitario: 24.00, subtotal: 24.00 }
      ],
      total: 24.00,
      pago: { metodo: "Yape", monto: 24.00, estado: "Pagado" },
      estado: "Entregado",
      motivoCancelacion: ""
    },
    {
      idPedido: "P-0107",
      codigo: "KC-0107",
      fechaHora: "2026-09-02T07:40:00",
      idComprador: "R-001",
      idVendedor: "R-004",
      detalles: [
        { idPublicacion: "PB-0003", titulo: "Pan Baguette", cantidad: 4, precioUnitario: 2.50, subtotal: 10.00 }
      ],
      total: 10.00,
      pago: { metodo: "Efectivo contra entrega", monto: 10.00, estado: "Pagado" },
      estado: "Entregado",
      motivoCancelacion: ""
    },
    {
      idPedido: "P-0110",
      codigo: "KC-0110",
      fechaHora: "2026-09-03T12:05:00",
      idComprador: "R-012",
      idVendedor: "R-001",
      detalles: [
        { idPublicacion: "PB-0025", titulo: "Ají de gallina con arroz", cantidad: 2, precioUnitario: 16.00, subtotal: 32.00 }
      ],
      total: 32.00,
      pago: { metodo: "Plin", monto: 32.00, estado: "Pagado" },
      estado: "Entregado",
      motivoCancelacion: ""
    },
    {
      idPedido: "P-0115",
      codigo: "KC-0115",
      fechaHora: "2026-09-04T12:30:00",
      idComprador: "R-001",
      idVendedor: "R-008",
      detalles: [
        { idPublicacion: "PB-0007", titulo: "Lomo Saltado de Res", cantidad: 2, precioUnitario: 30.00, subtotal: 60.00 }
      ],
      total: 60.00,
      pago: { metodo: "Yape", monto: 60.00, estado: "Anulado" },
      estado: "Cancelado",
      motivoCancelacion: "se terminó la carne antes de la hora del almuerzo"
    },
    {
      idPedido: "P-0118",
      codigo: "KC-0118",
      fechaHora: "2026-09-05T16:45:00",
      idComprador: "R-013",
      idVendedor: "R-001",
      detalles: [
        { idPublicacion: "PB-0027", titulo: "Queque de naranja", cantidad: 1, precioUnitario: 22.00, subtotal: 22.00 }
      ],
      total: 22.00,
      pago: { metodo: "Efectivo contra entrega", monto: 22.00, estado: "Anulado" },
      estado: "Cancelado",
      motivoCancelacion: "el comprador avisó que ese día no iba a estar en su departamento"
    },
    {
      idPedido: "P-0122",
      codigo: "KC-0122",
      fechaHora: "2026-09-06T13:10:00",
      idComprador: "R-001",
      idVendedor: "R-006",
      detalles: [
        { idPublicacion: "PB-0005", titulo: "Refresco Chicha Morada", cantidad: 2, precioUnitario: 7.50, subtotal: 15.00 }
      ],
      total: 15.00,
      pago: { metodo: "Plin", monto: 15.00, estado: "Pagado" },
      estado: "Entregado",
      motivoCancelacion: ""
    },
    {
      idPedido: "P-0127",
      codigo: "KC-0127",
      fechaHora: "2026-09-07T15:30:00",
      idComprador: "R-014",
      idVendedor: "R-001",
      detalles: [
        { idPublicacion: "PB-0030", titulo: "Limonada frozen (1 litro)", cantidad: 2, precioUnitario: 9.50, subtotal: 19.00 }
      ],
      total: 19.00,
      pago: { metodo: "Yape", monto: 19.00, estado: "Por pagar" },
      estado: "Pendiente",
      motivoCancelacion: ""
    },
    {
      idPedido: "P-0130",
      codigo: "KC-0130",
      fechaHora: "2026-09-08T16:00:00",
      idComprador: "R-001",
      idVendedor: "R-005",
      detalles: [
        { idPublicacion: "PB-0004", titulo: "Galletas con Chispas de Chocolate", cantidad: 2, precioUnitario: 6.00, subtotal: 12.00 }
      ],
      total: 12.00,
      pago: { metodo: "Efectivo contra entrega", monto: 12.00, estado: "Por pagar" },
      estado: "Pendiente",
      motivoCancelacion: ""
    },
    {
      idPedido: "P-0133",
      codigo: "KC-0133",
      fechaHora: "2026-09-08T19:25:00",
      idComprador: "R-015",
      idVendedor: "R-001",
      detalles: [
        { idPublicacion: "PB-0022", titulo: "Alfajores de maicena (caja x6)", cantidad: 4, precioUnitario: 12.00, subtotal: 48.00 }
      ],
      total: 48.00,
      pago: { metodo: "Plin", monto: 48.00, estado: "Por pagar" },
      estado: "Pendiente",
      motivoCancelacion: ""
    },
    {
      idPedido: "P-0134",
      codigo: "KC-0134",
      fechaHora: "2026-09-09T11:50:00",
      idComprador: "R-001",
      idVendedor: "R-007",
      detalles: [
        { idPublicacion: "PB-0006", titulo: "Refresco Camu Camu", cantidad: 1, precioUnitario: 8.00, subtotal: 8.00 }
      ],
      total: 8.00,
      pago: { metodo: "Yape", monto: 8.00, estado: "Por pagar" },
      estado: "Pendiente",
      motivoCancelacion: ""
    }
  ]
};
