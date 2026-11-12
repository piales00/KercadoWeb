-- hecho por piero. este archivo arma la base de kercado, crea las siete
-- tablas y las llena con los mismos vecinos, productos y pedidos que tenía
-- js/datos.js en el avance 2, no crea la base porque en infinityfree la base
-- se crea desde el panel del hosting y aquí solo se importa, y como borra las
-- tablas antes de crearlas, importarlo otra vez deja todo como al inicio

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS pago;
DROP TABLE IF EXISTS detalle_pedido;
DROP TABLE IF EXISTS pedido;
DROP TABLE IF EXISTS imagen_publicacion;
DROP TABLE IF EXISTS publicacion;
DROP TABLE IF EXISTS residente;
DROP TABLE IF EXISTS categoria;

-- las categorías del catálogo, el id es un texto corto sin tildes porque
-- viaja en la dirección, por ejemplo catalogo.php?categoria=postres
CREATE TABLE categoria (
  idCategoria VARCHAR(30)  NOT NULL,
  nombre      VARCHAR(60)  NOT NULL,
  descripcion VARCHAR(200) NOT NULL DEFAULT '',
  PRIMARY KEY (idCategoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- los vecinos del condominio, cada uno compra y vende con la misma cuenta,
-- la clave se guarda como hash y el rol admin es solo para la administración
CREATE TABLE residente (
  idResidente        INT          NOT NULL AUTO_INCREMENT,
  nombres            VARCHAR(60)  NOT NULL,
  apellidos          VARCHAR(60)  NOT NULL,
  correo             VARCHAR(120) NOT NULL,
  claveHash          VARCHAR(255) NOT NULL,
  telefono           VARCHAR(9)   NOT NULL,
  torre              CHAR(1)      NOT NULL,
  numeroDepartamento VARCHAR(4)   NOT NULL,
  rol                ENUM('residente','admin') NOT NULL DEFAULT 'residente',
  estado             ENUM('Activo','Pendiente','Inactivo') NOT NULL DEFAULT 'Pendiente',
  fechaRegistro      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (idResidente),
  UNIQUE KEY uq_residente_correo (correo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- lo que cada vecino ofrece, si se borra la categoría la publicación se queda
-- sin categoría, y si se borra el vecino se van con él sus publicaciones
CREATE TABLE publicacion (
  idPublicacion    INT          NOT NULL AUTO_INCREMENT,
  titulo           VARCHAR(80)  NOT NULL,
  descripcion      VARCHAR(500) NOT NULL,
  precio           DECIMAL(8,2) NOT NULL,
  stock            INT          NOT NULL,
  horario          VARCHAR(40)  NOT NULL DEFAULT '',
  idCategoria      VARCHAR(30)  NULL,
  idResidente      INT          NOT NULL,
  estado           ENUM('Activa','Baja','Observada') NOT NULL DEFAULT 'Activa',
  fechaPublicacion DATE         NOT NULL,
  PRIMARY KEY (idPublicacion),
  KEY idx_publicacion_categoria (idCategoria),
  KEY idx_publicacion_residente (idResidente),
  CONSTRAINT fk_publicacion_categoria FOREIGN KEY (idCategoria)
    REFERENCES categoria (idCategoria) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_publicacion_residente FOREIGN KEY (idResidente)
    REFERENCES residente (idResidente) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- las fotos de cada publicación van en su propia tabla porque una publicación
-- tiene varias, la de orden 0 es la principal
CREATE TABLE imagen_publicacion (
  idImagen      INT          NOT NULL AUTO_INCREMENT,
  idPublicacion INT          NOT NULL,
  ruta          VARCHAR(255) NOT NULL,
  orden         TINYINT      NOT NULL DEFAULT 0,
  PRIMARY KEY (idImagen),
  KEY idx_imagen_publicacion (idPublicacion),
  CONSTRAINT fk_imagen_publicacion FOREIGN KEY (idPublicacion)
    REFERENCES publicacion (idPublicacion) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- cada pedido es de un comprador a un vendedor, no dejamos borrar a un vecino
-- que tenga pedidos para no perder el historial
CREATE TABLE pedido (
  idPedido          INT           NOT NULL AUTO_INCREMENT,
  codigo            VARCHAR(10)   NOT NULL,
  fechaHora         DATETIME      NOT NULL,
  idComprador       INT           NOT NULL,
  idVendedor        INT           NOT NULL,
  total             DECIMAL(10,2) NOT NULL,
  estado            ENUM('Pendiente','Aceptado','En preparación','Entregado','Cancelado') NOT NULL DEFAULT 'Pendiente',
  motivoCancelacion VARCHAR(200)  NOT NULL DEFAULT '',
  PRIMARY KEY (idPedido),
  UNIQUE KEY uq_pedido_codigo (codigo),
  KEY idx_pedido_comprador (idComprador),
  KEY idx_pedido_vendedor (idVendedor),
  CONSTRAINT fk_pedido_comprador FOREIGN KEY (idComprador)
    REFERENCES residente (idResidente) ON DELETE RESTRICT,
  CONSTRAINT fk_pedido_vendedor FOREIGN KEY (idVendedor)
    REFERENCES residente (idResidente) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- los productos de cada pedido, copiamos el título y el precio del momento
-- de la compra para que el pedido conserve lo que se acordó aunque el
-- vendedor cambie su publicación después
CREATE TABLE detalle_pedido (
  idDetalle      INT           NOT NULL AUTO_INCREMENT,
  idPedido       INT           NOT NULL,
  idPublicacion  INT           NULL,
  titulo         VARCHAR(80)   NOT NULL,
  cantidad       INT           NOT NULL,
  precioUnitario DECIMAL(8,2)  NOT NULL,
  subtotal       DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (idDetalle),
  KEY idx_detalle_pedido (idPedido),
  KEY idx_detalle_publicacion (idPublicacion),
  CONSTRAINT fk_detalle_pedido FOREIGN KEY (idPedido)
    REFERENCES pedido (idPedido) ON DELETE CASCADE,
  CONSTRAINT fk_detalle_publicacion FOREIGN KEY (idPublicacion)
    REFERENCES publicacion (idPublicacion) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- el pago acordado de cada pedido, kercado no cobra, solo anota el método
-- que eligió el comprador y si el vendedor ya recibió el dinero
CREATE TABLE pago (
  idPago   INT           NOT NULL AUTO_INCREMENT,
  idPedido INT           NOT NULL,
  metodo   ENUM('Efectivo contra entrega','Yape','Plin') NOT NULL,
  monto    DECIMAL(10,2) NOT NULL,
  estado   ENUM('Por pagar','Pagado','Anulado') NOT NULL DEFAULT 'Por pagar',
  PRIMARY KEY (idPago),
  UNIQUE KEY uq_pago_pedido (idPedido),
  CONSTRAINT fk_pago_pedido FOREIGN KEY (idPedido)
    REFERENCES pedido (idPedido) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- las cinco categorías del catálogo
INSERT INTO categoria (idCategoria, nombre, descripcion) VALUES
  ('comida-preparada', 'Comida preparada', 'Menús, platos de fondo y comida lista para servir'),
  ('postres', 'Postres', 'Tortas, queques, alfajores y dulces caseros'),
  ('panaderia', 'Panadería', 'Panes, empanadas y galletas horneadas en casa'),
  ('bebidas', 'Bebidas', 'Refrescos, jugos y bebidas heladas'),
  ('abarrotes', 'Abarrotes', 'Arroz, menestras y productos de despensa');

-- los vecinos, el id sigue el orden del avance 2 (R-001 es el 1), todos
-- entran con la clave Kercado2026 guardada como hash, sofía sigue pendiente
-- y la última cuenta es la de la administración del condominio
INSERT INTO residente (idResidente, nombres, apellidos, correo, claveHash, telefono, torre, numeroDepartamento, rol, estado) VALUES
  (1, 'Carmen', 'Rojas', 'carmen.rojas@kercado.pe', '$2y$10$/kIHQD6BU1QTr9uiLhoeu.ZkNdIFIG2nFs/NjncZj2v1lETYr2Thy', '987654321', 'C', '504', 'residente', 'Activo'),
  (2, 'María', 'Torres', 'maria.torres@kercado.pe', '$2y$10$/kIHQD6BU1QTr9uiLhoeu.ZkNdIFIG2nFs/NjncZj2v1lETYr2Thy', '986112233', 'B', '402', 'residente', 'Activo'),
  (3, 'Gregorio', 'Torres', 'gregorio.torres@kercado.pe', '$2y$10$/kIHQD6BU1QTr9uiLhoeu.ZkNdIFIG2nFs/NjncZj2v1lETYr2Thy', '985223344', 'C', '301', 'residente', 'Activo'),
  (4, 'Micaela', 'Jiménez', 'micaela.jimenez@kercado.pe', '$2y$10$/kIHQD6BU1QTr9uiLhoeu.ZkNdIFIG2nFs/NjncZj2v1lETYr2Thy', '984334455', 'A', '111', 'residente', 'Activo'),
  (5, 'Rafael', 'Ramírez', 'rafael.ramirez@kercado.pe', '$2y$10$/kIHQD6BU1QTr9uiLhoeu.ZkNdIFIG2nFs/NjncZj2v1lETYr2Thy', '983445566', 'D', '215', 'residente', 'Activo'),
  (6, 'Luis', 'Castro', 'luis.castro@kercado.pe', '$2y$10$/kIHQD6BU1QTr9uiLhoeu.ZkNdIFIG2nFs/NjncZj2v1lETYr2Thy', '982556677', 'B', '115', 'residente', 'Activo'),
  (7, 'Ana', 'López', 'ana.lopez@kercado.pe', '$2y$10$/kIHQD6BU1QTr9uiLhoeu.ZkNdIFIG2nFs/NjncZj2v1lETYr2Thy', '981667788', 'A', '108', 'residente', 'Activo'),
  (8, 'Nicolás', 'Medina', 'nicolas.medina@kercado.pe', '$2y$10$/kIHQD6BU1QTr9uiLhoeu.ZkNdIFIG2nFs/NjncZj2v1lETYr2Thy', '980778899', 'A', '106', 'residente', 'Activo'),
  (9, 'Nataly', 'Aguirre', 'nataly.aguirre@kercado.pe', '$2y$10$/kIHQD6BU1QTr9uiLhoeu.ZkNdIFIG2nFs/NjncZj2v1lETYr2Thy', '979889900', 'C', '254', 'residente', 'Activo'),
  (10, 'Ernesto', 'Fernández', 'ernesto.fernandez@kercado.pe', '$2y$10$/kIHQD6BU1QTr9uiLhoeu.ZkNdIFIG2nFs/NjncZj2v1lETYr2Thy', '978990011', 'B', '222', 'residente', 'Activo'),
  (11, 'Jorge', 'Salazar', 'jorge.salazar@kercado.pe', '$2y$10$/kIHQD6BU1QTr9uiLhoeu.ZkNdIFIG2nFs/NjncZj2v1lETYr2Thy', '977101112', 'A', '203', 'residente', 'Activo'),
  (12, 'Rosa', 'Quispe', 'rosa.quispe@kercado.pe', '$2y$10$/kIHQD6BU1QTr9uiLhoeu.ZkNdIFIG2nFs/NjncZj2v1lETYr2Thy', '976121314', 'D', '601', 'residente', 'Activo'),
  (13, 'Diego', 'Vargas', 'diego.vargas@kercado.pe', '$2y$10$/kIHQD6BU1QTr9uiLhoeu.ZkNdIFIG2nFs/NjncZj2v1lETYr2Thy', '975141516', 'B', '307', 'residente', 'Activo'),
  (14, 'Lucía', 'Fernández', 'lucia.fernandez@kercado.pe', '$2y$10$/kIHQD6BU1QTr9uiLhoeu.ZkNdIFIG2nFs/NjncZj2v1lETYr2Thy', '974161718', 'C', '110', 'residente', 'Activo'),
  (15, 'Martín', 'Paredes', 'martin.paredes@kercado.pe', '$2y$10$/kIHQD6BU1QTr9uiLhoeu.ZkNdIFIG2nFs/NjncZj2v1lETYr2Thy', '973181920', 'A', '502', 'residente', 'Activo'),
  (16, 'Sofía', 'Mendoza', 'sofia.mendoza@kercado.pe', '$2y$10$/kIHQD6BU1QTr9uiLhoeu.ZkNdIFIG2nFs/NjncZj2v1lETYr2Thy', '972202122', 'D', '410', 'residente', 'Pendiente'),
  (17, 'Administración', 'Kercado', 'administracion@kercado.pe', '$2y$10$/kIHQD6BU1QTr9uiLhoeu.ZkNdIFIG2nFs/NjncZj2v1lETYr2Thy', '912345678', 'A', '101', 'admin', 'Activo');

-- las catorce publicaciones, numeradas en el orden en que estaban en el
-- avance 2, así quedan los ids viejos: PB-0001 es 1, PB-0002 es 2, PB-0003 es 3, PB-0004 es 4, PB-0005 es 5, PB-0006 es 6, PB-0007 es 7, PB-0008 es 8, PB-0009 es 9, PB-0021 es 10, PB-0022 es 11, PB-0025 es 12, PB-0027 es 13, PB-0030 es 14
INSERT INTO publicacion (idPublicacion, titulo, descripcion, precio, stock, horario, idCategoria, idResidente, estado, fechaPublicacion) VALUES
  (1, 'Torta de Chocolate Casera', 'Bizcocho húmedo de chocolate con fudge y pecanas, sale para doce porciones y se entrega en caja.', 24.00, 12, '9:00 a 20:00', 'postres', 2, 'Activa', '2026-08-03'),
  (2, 'Torta de 3 leches', 'Tres leches clásica con canela por encima, se entrega bien fría y alcanza para ocho porciones.', 28.00, 6, '10:00 a 19:00', 'postres', 3, 'Activa', '2026-08-04'),
  (3, 'Pan Baguette', 'Baguette crocante horneado cada mañana, se vende por unidad.', 2.50, 40, '6:30 a 11:00', 'panaderia', 4, 'Activa', '2026-08-05'),
  (4, 'Galletas con Chispas de Chocolate', 'Bolsa de seis galletas grandes con chispas de chocolate, hechas el mismo día.', 6.00, 20, '15:00 a 20:00', 'panaderia', 5, 'Activa', '2026-08-06'),
  (5, 'Refresco Chicha Morada', 'Chicha morada casera de maíz morado con piña y canela, botella de un litro.', 7.50, 15, '11:00 a 18:00', 'bebidas', 6, 'Activa', '2026-08-07'),
  (6, 'Refresco Camu Camu', 'Refresco de camu camu natural, poco dulce, botella de un litro.', 8.00, 10, '11:00 a 18:00', 'bebidas', 7, 'Activa', '2026-08-08'),
  (7, 'Lomo Saltado de Res', 'Lomo saltado al wok con papas fritas y arroz blanco, porción generosa para una persona.', 30.00, 8, '12:00 a 15:00', 'comida-preparada', 8, 'Activa', '2026-08-09'),
  (8, 'Pollo a la Brasa Entero', 'Pollo entero a la brasa con papas fritas, ensalada y cremas, alcanza para cuatro personas.', 75.00, 5, '18:00 a 22:00', 'comida-preparada', 9, 'Activa', '2026-08-10'),
  (9, 'Arroz Superior Blanco de Primera 10 kg', 'Saco de arroz superior de diez kilos, sellado, se entrega en la puerta del departamento.', 25.50, 9, '9:00 a 18:00', 'abarrotes', 10, 'Activa', '2026-08-11'),
  (10, 'Empanadas de Carne', 'Empanadas horneadas rellenas de carne, huevo y aceituna, el precio es por unidad.', 4.50, 18, '16:00 a 20:00', 'panaderia', 1, 'Activa', '2026-08-17'),
  (11, 'Alfajores de Maicena (caja x6)', 'Caja de seis alfajores de maicena con manjar blanco y coco rallado.', 12.00, 7, '10:00 a 20:00', 'postres', 1, 'Activa', '2026-08-18'),
  (12, 'Ají de Gallina con Arroz', 'Ají de gallina cremoso con papa amarilla, huevo y arroz blanco, el precio es por porción.', 16.00, 10, '12:00 a 15:00', 'comida-preparada', 1, 'Activa', '2026-08-21'),
  (13, 'Queque de Naranja', 'Queque entero de naranja con glaseado, esponjoso, alcanza para diez tajadas.', 22.00, 3, '10:00 a 20:00', 'postres', 1, 'Activa', '2026-08-24'),
  (14, 'Limonada Frozen (1 litro)', 'Limonada frozen recién licuada con hierbabuena, botella de un litro.', 9.50, 12, '11:00 a 19:00', 'bebidas', 1, 'Activa', '2026-08-27');

-- las fotos de cada publicación, la de orden 0 es la que sale en el catálogo
INSERT INTO imagen_publicacion (idImagen, idPublicacion, ruta, orden) VALUES
  (1, 1, 'assets/img/catalogos/torta-chocolate.jpg', 0),
  (2, 1, 'assets/img/catalogos/torta-mini-1.jpg', 1),
  (3, 1, 'assets/img/catalogos/torta-mini-2.jpg', 2),
  (4, 1, 'assets/img/catalogos/torta-mini-3.jpg', 3),
  (5, 1, 'assets/img/catalogos/torta-mini-4.jpg', 4),
  (6, 2, 'assets/img/catalogos/torta-tresleches.jpg', 0),
  (7, 2, 'assets/img/catalogos/tortatresleches-mini-1.jpg', 1),
  (8, 2, 'assets/img/catalogos/tortatresleches-mini-2.jpg', 2),
  (9, 2, 'assets/img/catalogos/tortatresleches-mini-3.jpg', 3),
  (10, 3, 'assets/img/catalogos/pan-baguette.jpg', 0),
  (11, 4, 'assets/img/catalogos/galletas-chocolate.jpg', 0),
  (12, 5, 'assets/img/catalogos/chicha-morada.jpg', 0),
  (13, 6, 'assets/img/catalogos/camu-camu.jpg', 0),
  (14, 7, 'assets/img/catalogos/lomo-saltado.jpg', 0),
  (15, 8, 'assets/img/catalogos/pollo-a-la-brasa-entero.jpg', 0),
  (16, 9, 'assets/img/catalogos/arroz-superior-BP-10Kg.jpg', 0),
  (17, 10, 'assets/img/catalogos/empanadas-carne.jpg', 0),
  (18, 11, 'assets/img/catalogos/alfajores-maicena.jpg', 0),
  (19, 12, 'assets/img/catalogos/aji-de-gallina.jpg', 0),
  (20, 13, 'assets/img/catalogos/queque-naranja.jpg', 0),
  (21, 14, 'assets/img/catalogos/limonada-frozen.jpg', 0);

-- los pedidos del avance 2, el id es el número del código, KC-0098 es el 98
INSERT INTO pedido (idPedido, codigo, fechaHora, idComprador, idVendedor, total, estado, motivoCancelacion) VALUES
  (98, 'KC-0098', '2026-08-31 17:20:00', 11, 1, 27.00, 'Entregado', ''),
  (101, 'KC-0101', '2026-09-01 10:15:00', 1, 2, 24.00, 'Entregado', ''),
  (107, 'KC-0107', '2026-09-02 07:40:00', 1, 4, 10.00, 'Entregado', ''),
  (110, 'KC-0110', '2026-09-03 12:05:00', 12, 1, 32.00, 'Entregado', ''),
  (115, 'KC-0115', '2026-09-04 12:30:00', 1, 8, 60.00, 'Cancelado', 'se terminó la carne antes de la hora del almuerzo'),
  (118, 'KC-0118', '2026-09-05 16:45:00', 13, 1, 22.00, 'Cancelado', 'el comprador avisó que ese día no iba a estar en su departamento'),
  (122, 'KC-0122', '2026-09-06 13:10:00', 1, 6, 15.00, 'Entregado', ''),
  (127, 'KC-0127', '2026-09-07 15:30:00', 14, 1, 19.00, 'Pendiente', ''),
  (130, 'KC-0130', '2026-09-08 16:00:00', 1, 5, 12.00, 'Pendiente', ''),
  (133, 'KC-0133', '2026-09-08 19:25:00', 15, 1, 48.00, 'Pendiente', ''),
  (134, 'KC-0134', '2026-09-09 11:50:00', 1, 7, 8.00, 'Pendiente', '');

-- lo que se pidió en cada pedido, con el título y el precio de ese momento
INSERT INTO detalle_pedido (idDetalle, idPedido, idPublicacion, titulo, cantidad, precioUnitario, subtotal) VALUES
  (1, 98, 10, 'Empanadas de carne', 6, 4.50, 27.00),
  (2, 101, 1, 'Torta de Chocolate Casera', 1, 24.00, 24.00),
  (3, 107, 3, 'Pan Baguette', 4, 2.50, 10.00),
  (4, 110, 12, 'Ají de gallina con arroz', 2, 16.00, 32.00),
  (5, 115, 7, 'Lomo Saltado de Res', 2, 30.00, 60.00),
  (6, 118, 13, 'Queque de naranja', 1, 22.00, 22.00),
  (7, 122, 5, 'Refresco Chicha Morada', 2, 7.50, 15.00),
  (8, 127, 14, 'Limonada frozen (1 litro)', 2, 9.50, 19.00),
  (9, 130, 4, 'Galletas con Chispas de Chocolate', 2, 6.00, 12.00),
  (10, 133, 11, 'Alfajores de maicena (caja x6)', 4, 12.00, 48.00),
  (11, 134, 6, 'Refresco Camu Camu', 1, 8.00, 8.00);

-- el pago acordado de cada pedido
INSERT INTO pago (idPago, idPedido, metodo, monto, estado) VALUES
  (1, 98, 'Efectivo contra entrega', 27.00, 'Pagado'),
  (2, 101, 'Yape', 24.00, 'Pagado'),
  (3, 107, 'Efectivo contra entrega', 10.00, 'Pagado'),
  (4, 110, 'Plin', 32.00, 'Pagado'),
  (5, 115, 'Yape', 60.00, 'Anulado'),
  (6, 118, 'Efectivo contra entrega', 22.00, 'Anulado'),
  (7, 122, 'Plin', 15.00, 'Pagado'),
  (8, 127, 'Yape', 19.00, 'Por pagar'),
  (9, 130, 'Efectivo contra entrega', 12.00, 'Por pagar'),
  (10, 133, 'Plin', 48.00, 'Por pagar'),
  (11, 134, 'Yape', 8.00, 'Por pagar');

-- el siguiente pedido que se registre sigue después del mayor código
ALTER TABLE pedido AUTO_INCREMENT = 135;

SET FOREIGN_KEY_CHECKS = 1;
