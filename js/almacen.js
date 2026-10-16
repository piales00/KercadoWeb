/*
  hecho por piero. esta es la capa de datos del sitio y es el único archivo
  que toca localStorage, las páginas le piden las cosas con estas funciones
  y no saben dónde se guardan, así cuando pasemos a una base de datos en el
  servidor solo se cambia este archivo y las páginas quedan igual, ninguna
  función de aquí toca la página, solo devuelven datos
*/

/* todas las claves que guardamos empiezan con kercado y un punto, para no
   mezclarnos con lo que guarden otros sitios abiertos en el mismo navegador */
const PREFIJO = "kercado.";

/* la imagen que lleva una publicación cuando no le eligieron ninguna */
const IMAGEN_POR_DEFECTO = "assets/img/kercado.png";

/* los tres métodos de pago que kercado registra, el sitio no cobra */
const METODOS_DE_PAGO = ["Efectivo contra entrega", "Yape", "Plin"];

/* desde cada estado de un pedido, a cuáles se puede pasar, entregado y
   cancelado no tienen ninguno porque ahí el pedido ya terminó */
const TRANSICIONES = {
  "Pendiente": ["Aceptado", "Cancelado"],
  "Aceptado": ["En preparación", "Cancelado"],
  "En preparación": ["Entregado"],
  "Entregado": [],
  "Cancelado": []
};

/* si localStorage falla, por ejemplo en una ventana de incógnito que no
   deja guardar, o si lo guardado está dañado, seguimos trabajando con esta
   copia en memoria para que el sitio no se caiga, se pierde al recargar */
let enMemoria = false;
let memoria = {};


/* leer y guardar

   estas tres funciones son las únicas que hablan con localStorage, todo se
   guarda como texto json porque localStorage solo acepta textos */

function leerClave(nombre) {
  let texto;

  if (enMemoria) {
    texto = memoria[nombre];
  } else {
    try {
      texto = localStorage.getItem(PREFIJO + nombre);
    } catch (error) {
      pasarAMemoria();
      texto = memoria[nombre];
    }
  }

  if (texto === null || texto === undefined) {
    return null;
  }

  try {
    return JSON.parse(texto);
  } catch (error) {
    /* lo guardado no se pudo leer, volvemos a los datos iniciales */
    pasarAMemoria();
    return leerClave(nombre);
  }
}

function guardarClave(nombre, valor) {
  let texto = JSON.stringify(valor);

  if (enMemoria) {
    memoria[nombre] = texto;
    return;
  }

  try {
    localStorage.setItem(PREFIJO + nombre, texto);
  } catch (error) {
    pasarAMemoria();
    memoria[nombre] = texto;
  }
}

function borrarClave(nombre) {
  if (enMemoria) {
    delete memoria[nombre];
    return;
  }

  try {
    localStorage.removeItem(PREFIJO + nombre);
  } catch (error) {
    pasarAMemoria();
  }
}

/* copia los datos de datos.js al almacenamiento */
function sembrarDatos() {
  guardarClave("version", DATOS_INICIALES.version);
  guardarClave("residentes", DATOS_INICIALES.residentes);
  guardarClave("publicaciones", DATOS_INICIALES.publicaciones);
  guardarClave("pedidos", DATOS_INICIALES.pedidos);
}

/* deja de usar localStorage y arranca con los datos iniciales en memoria */
function pasarAMemoria() {
  enMemoria = true;
  memoria = {};
  sembrarDatos();
}

/* las listas de residentes, publicaciones y pedidos siempre tienen que
   ser arreglos, si alguna no lo es la tratamos como dato dañado */
function leerLista(nombre) {
  let lista = leerClave(nombre);

  if (!Array.isArray(lista)) {
    pasarAMemoria();
    lista = leerClave(nombre);
  }

  return lista;
}

/* borra todo lo que guardó kercado y vuelve a cargar los datos iniciales,
   la llamamos desde la consola antes de presentar para empezar de cero */
function reiniciarDatos() {
  let claves = [];
  let i;

  if (enMemoria) {
    memoria = {};
  } else {
    try {
      /* primero juntamos las claves y después las borramos, porque si
         borramos mientras recorremos se saltan algunas */
      for (i = 0; i < localStorage.length; i++) {
        if (localStorage.key(i).indexOf(PREFIJO) === 0) {
          claves.push(localStorage.key(i));
        }
      }
      for (i = 0; i < claves.length; i++) {
        localStorage.removeItem(claves[i]);
      }
    } catch (error) {
      pasarAMemoria();
      return "los datos volvieron al inicio, pero solo en memoria";
    }
  }

  sembrarDatos();
  return "los datos volvieron al inicio, recarga la página";
}


/* ayudas que usan varias funciones de más abajo */

/* pasa un texto a minúsculas y le quita las tildes, así al buscar da lo
   mismo escribir panadería, panaderia o PANADERIA */
function sinTildes(texto) {
  return String(texto).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/* deja un monto con dos decimales, porque al multiplicar decimales
   javascript a veces devuelve cosas como 22.499999 */
function redondear(numero) {
  return Math.round(numero * 100) / 100;
}

/* completa un número con ceros a la izquierda, el 35 queda como 0035 */
function conCeros(numero, largo) {
  return String(numero).padStart(largo, "0");
}

/* busca el número más alto que ya se usó en los códigos de una lista y
   devuelve el que sigue, de PB-0030 sale el 31 */
function siguienteNumero(lista, campo) {
  let mayor = 0;
  let numero;
  let i;

  for (i = 0; i < lista.length; i++) {
    numero = parseInt(lista[i][campo].split("-")[1], 10);
    if (numero > mayor) {
      mayor = numero;
    }
  }

  return mayor + 1;
}

/* la fecha de hoy como 2026-10-13, armada con la hora de la computadora
   y no con la de londres, que es la que daría toISOString */
function fechaDeHoy() {
  let ahora = new Date();

  return ahora.getFullYear() + "-" +
    conCeros(ahora.getMonth() + 1, 2) + "-" +
    conCeros(ahora.getDate(), 2);
}

/* la fecha y la hora de este momento como 2026-10-13T18:42:00 */
function fechaHoraDeAhora() {
  let ahora = new Date();

  return fechaDeHoy() + "T" +
    conCeros(ahora.getHours(), 2) + ":" +
    conCeros(ahora.getMinutes(), 2) + ":" +
    conCeros(ahora.getSeconds(), 2);
}

/* devuelve en qué posición de la lista está el elemento con ese código,
   o -1 si no está */
function posicionEnLista(lista, campo, valor) {
  let i;

  for (i = 0; i < lista.length; i++) {
    if (lista[i][campo] === valor) {
      return i;
    }
  }

  return -1;
}


/* categorías

   son fijas, por eso se leen directo de datos.js y no se guardan */

function listarCategorias() {
  return DATOS_INICIALES.categorias.slice();
}

function obtenerCategoria(idCategoria) {
  let categorias = DATOS_INICIALES.categorias;
  let posicion = posicionEnLista(categorias, "idCategoria", idCategoria);

  if (posicion === -1) {
    return null;
  }

  return categorias[posicion];
}


/* publicaciones */

/* revisa si una publicación pasa el filtro del catálogo, cada parte del
   filtro es opcional, si no viene no se toma en cuenta */
function pasaElFiltro(publicacion, filtro) {
  let categoria;
  let dondeBuscar;
  let palabras;
  let minimo;
  let maximo;
  let i;

  if (filtro === undefined || filtro === null) {
    return true;
  }

  if (filtro.idCategoria && publicacion.idCategoria !== filtro.idCategoria) {
    return false;
  }

  minimo = parseFloat(filtro.precioMin);
  if (!isNaN(minimo) && publicacion.precio < minimo) {
    return false;
  }

  maximo = parseFloat(filtro.precioMax);
  if (!isNaN(maximo) && publicacion.precio > maximo) {
    return false;
  }

  /* el texto se busca en el título, la descripción y el nombre de la
     categoría, y tienen que aparecer todas las palabras que se escribieron */
  if (filtro.texto) {
    categoria = obtenerCategoria(publicacion.idCategoria);
    dondeBuscar = publicacion.titulo + " " + publicacion.descripcion;
    if (categoria !== null) {
      dondeBuscar = dondeBuscar + " " + categoria.nombre;
    }
    dondeBuscar = sinTildes(dondeBuscar);
    palabras = sinTildes(filtro.texto).split(" ");

    for (i = 0; i < palabras.length; i++) {
      if (palabras[i] !== "" && dondeBuscar.indexOf(palabras[i]) === -1) {
        return false;
      }
    }
  }

  return true;
}

/* para ordenar las publicaciones con la más nueva arriba, si dos son del
   mismo día va primero la del código más alto, que se creó después */
function publicacionMasRecientePrimero(a, b) {
  if (a.fechaPublicacion > b.fechaPublicacion) {
    return -1;
  }
  if (a.fechaPublicacion < b.fechaPublicacion) {
    return 1;
  }
  if (a.idPublicacion > b.idPublicacion) {
    return -1;
  }
  return 1;
}

/* las publicaciones activas que ve el catálogo, el filtro es un objeto
   con texto, idCategoria, precioMin y precioMax, todos opcionales */
function listarPublicaciones(filtro) {
  let todas = leerLista("publicaciones");
  let resultado = [];
  let i;

  for (i = 0; i < todas.length; i++) {
    if (todas[i].estado === "Activa" && pasaElFiltro(todas[i], filtro)) {
      resultado.push(todas[i]);
    }
  }

  resultado.sort(publicacionMasRecientePrimero);
  return resultado;
}

function obtenerPublicacion(idPublicacion) {
  let lista = leerLista("publicaciones");
  let posicion = posicionEnLista(lista, "idPublicacion", idPublicacion);

  if (posicion === -1) {
    return null;
  }

  return lista[posicion];
}

/* todas las publicaciones de un vecino para su panel, también las que dio
   de baja */
function publicacionesDelVendedor(idResidente) {
  let todas = leerLista("publicaciones");
  let resultado = [];
  let i;

  for (i = 0; i < todas.length; i++) {
    if (todas[i].idResidente === idResidente) {
      resultado.push(todas[i]);
    }
  }

  resultado.sort(publicacionMasRecientePrimero);
  return resultado;
}

/* crea una publicación del vecino que tiene la sesión abierta, datos trae
   titulo, descripcion, precio, stock, horario, idCategoria y la lista
   imagenes, devuelve la publicación creada o null si no se pudo */
function crearPublicacion(datos) {
  let residente = sesionActual();
  let lista = leerLista("publicaciones");
  let precio = redondear(parseFloat(datos.precio));
  let stock = parseInt(datos.stock, 10);
  let titulo = String(datos.titulo || "").trim();
  let imagenes = datos.imagenes;
  let nueva;

  if (residente === null) {
    return null;
  }

  /* la página ya valida el formulario, pero aquí lo revisamos otra vez
     para que nunca se guarde una publicación a medias */
  if (titulo === "" || isNaN(precio) || precio <= 0 || isNaN(stock) || stock < 0 ||
      obtenerCategoria(datos.idCategoria) === null) {
    return null;
  }

  if (!Array.isArray(imagenes) || imagenes.length === 0) {
    imagenes = [IMAGEN_POR_DEFECTO];
  }

  nueva = {
    idPublicacion: "PB-" + conCeros(siguienteNumero(lista, "idPublicacion"), 4),
    titulo: titulo,
    descripcion: String(datos.descripcion || "").trim(),
    precio: precio,
    stock: stock,
    horario: String(datos.horario || "").trim(),
    imagenes: imagenes,
    idCategoria: datos.idCategoria,
    idResidente: residente.idResidente,
    estado: "Activa",
    fechaPublicacion: fechaDeHoy()
  };

  lista.push(nueva);
  guardarClave("publicaciones", lista);
  return nueva;
}

/* da de baja una publicación, deja de salir en el catálogo pero no se
   borra porque los pedidos antiguos la siguen nombrando, solo la puede dar
   de baja su dueño */
function darDeBajaPublicacion(idPublicacion) {
  let residente = sesionActual();
  let lista = leerLista("publicaciones");
  let posicion = posicionEnLista(lista, "idPublicacion", idPublicacion);

  if (residente === null || posicion === -1) {
    return false;
  }

  if (lista[posicion].idResidente !== residente.idResidente) {
    return false;
  }

  lista[posicion].estado = "Baja";
  guardarClave("publicaciones", lista);
  return true;
}


/* residentes y sesión */

function obtenerResidente(idResidente) {
  let lista = leerLista("residentes");
  let posicion = posicionEnLista(lista, "idResidente", idResidente);

  if (posicion === -1) {
    return null;
  }

  return lista[posicion];
}

/* busca a un residente por su correo, sin importar las mayúsculas */
function buscarPorCorreo(correo) {
  let lista = leerLista("residentes");
  let buscado = String(correo || "").trim().toLowerCase();
  let i;

  for (i = 0; i < lista.length; i++) {
    if (lista[i].correo.toLowerCase() === buscado) {
      return lista[i];
    }
  }

  return null;
}

/* guarda la solicitud de registro, datos trae nombres, apellidos, correo,
   clave, telefono, torre y numeroDepartamento, la cuenta queda pendiente
   hasta que la administración confirme que la persona vive en el condominio */
function registrarSolicitud(datos) {
  let lista = leerLista("residentes");
  let correo = String(datos.correo || "").trim().toLowerCase();
  let nuevo;

  if (correo === "" || !datos.nombres || !datos.apellidos || !datos.clave || !datos.torre) {
    return { ok: false, mensaje: "faltan datos para registrar la solicitud" };
  }

  if (buscarPorCorreo(correo) !== null) {
    return { ok: false, mensaje: "ya hay una cuenta registrada con ese correo" };
  }

  nuevo = {
    idResidente: "R-" + conCeros(siguienteNumero(lista, "idResidente"), 3),
    nombres: String(datos.nombres).trim(),
    apellidos: String(datos.apellidos).trim(),
    correo: correo,
    clave: datos.clave,
    telefono: String(datos.telefono || "").trim(),
    torre: datos.torre,
    numeroDepartamento: String(datos.numeroDepartamento || "").trim(),
    estado: "Pendiente"
  };

  lista.push(nuevo);
  guardarClave("residentes", lista);

  return {
    ok: true,
    mensaje: "recibimos tu solicitud, tu cuenta queda pendiente hasta que la " +
      "administración confirme que vives en el condominio"
  };
}

/* revisa el correo y la clave, y si la cuenta está activa guarda quién
   entró, el mensaje cambia según qué falló para que el vecino sepa qué hacer */
function iniciarSesion(correo, clave) {
  let residente = buscarPorCorreo(correo);

  if (residente === null || residente.clave !== clave) {
    return { ok: false, mensaje: "el correo o la contraseña no coinciden", residente: null };
  }

  if (residente.estado === "Pendiente") {
    return {
      ok: false,
      mensaje: "tu cuenta todavía está pendiente, la administración tiene que validarla",
      residente: null
    };
  }

  if (residente.estado !== "Activo") {
    return { ok: false, mensaje: "tu cuenta está inactiva, consulta con la administración", residente: null };
  }

  guardarClave("sesion", residente.idResidente);
  return { ok: true, mensaje: "hola " + residente.nombres + ", ya entraste a tu cuenta", residente: residente };
}

function cerrarSesion() {
  borrarClave("sesion");
}

/* el residente que tiene la sesión abierta, o null si nadie entró */
function sesionActual() {
  let idResidente = leerClave("sesion");

  if (idResidente === null) {
    return null;
  }

  return obtenerResidente(idResidente);
}


/* carrito

   cada residente tiene su propio carrito, guardado con su código, así al
   cambiar de cuenta cada uno ve el suyo, en el carrito solo guardamos el
   código del producto y la cantidad, el precio se lee de la publicación */

/* las líneas tal como están guardadas, sin los datos del producto */
function leerCarritoGuardado() {
  let residente = sesionActual();
  let lineas;

  if (residente === null) {
    return [];
  }

  lineas = leerClave("carrito." + residente.idResidente);
  if (!Array.isArray(lineas)) {
    return [];
  }

  return lineas;
}

function guardarCarrito(lineas) {
  let residente = sesionActual();

  if (residente !== null) {
    guardarClave("carrito." + residente.idResidente, lineas);
  }
}

/* cuántas unidades de un producto ya están en el carrito */
function cantidadDeProductoEnCarrito(idPublicacion) {
  let lineas = leerCarritoGuardado();
  let posicion = posicionEnLista(lineas, "idPublicacion", idPublicacion);

  if (posicion === -1) {
    return 0;
  }

  return lineas[posicion].cantidad;
}

/* el carrito listo para pintar, cada línea trae la publicación completa y
   su subtotal, si un producto fue dado de baja ya no aparece */
function obtenerCarrito() {
  let lineas = leerCarritoGuardado();
  let resultado = [];
  let publicacion;
  let i;

  for (i = 0; i < lineas.length; i++) {
    publicacion = obtenerPublicacion(lineas[i].idPublicacion);

    if (publicacion !== null && publicacion.estado === "Activa") {
      resultado.push({
        idPublicacion: lineas[i].idPublicacion,
        cantidad: lineas[i].cantidad,
        publicacion: publicacion,
        subtotal: redondear(publicacion.precio * lineas[i].cantidad)
      });
    }
  }

  return resultado;
}

/* arma el mensaje de cuando no alcanza el stock */
function mensajeSinStock(publicacion) {
  if (publicacion.stock === 0) {
    return "ya no queda stock de " + publicacion.titulo;
  }
  if (publicacion.stock === 1) {
    return "solo queda 1 unidad de " + publicacion.titulo;
  }
  return "solo quedan " + publicacion.stock + " unidades de " + publicacion.titulo;
}

function agregarAlCarrito(idPublicacion, cantidad) {
  let residente = sesionActual();
  let publicacion = obtenerPublicacion(idPublicacion);
  let lineas;
  let posicion;
  let yaTiene;

  cantidad = parseInt(cantidad, 10);

  if (residente === null) {
    return { ok: false, mensaje: "inicia sesión para agregar productos a tu carrito" };
  }

  if (publicacion === null || publicacion.estado !== "Activa") {
    return { ok: false, mensaje: "ese producto ya no está disponible" };
  }

  if (publicacion.idResidente === residente.idResidente) {
    return { ok: false, mensaje: "esta publicación es tuya, no la puedes agregar a tu carrito" };
  }

  if (isNaN(cantidad) || cantidad < 1) {
    return { ok: false, mensaje: "la cantidad tiene que ser 1 o más" };
  }

  yaTiene = cantidadDeProductoEnCarrito(idPublicacion);
  if (yaTiene + cantidad > publicacion.stock) {
    if (yaTiene > 0) {
      return { ok: false, mensaje: mensajeSinStock(publicacion) + " y ya tienes " + yaTiene + " en tu carrito" };
    }
    return { ok: false, mensaje: mensajeSinStock(publicacion) };
  }

  lineas = leerCarritoGuardado();
  posicion = posicionEnLista(lineas, "idPublicacion", idPublicacion);

  if (posicion === -1) {
    lineas.push({ idPublicacion: idPublicacion, cantidad: cantidad });
  } else {
    lineas[posicion].cantidad = lineas[posicion].cantidad + cantidad;
  }

  guardarCarrito(lineas);

  if (cantidad === 1) {
    return { ok: true, mensaje: "agregaste 1 unidad de " + publicacion.titulo + " a tu carrito" };
  }
  return { ok: true, mensaje: "agregaste " + cantidad + " unidades de " + publicacion.titulo + " a tu carrito" };
}

/* cambia la cantidad de un producto que ya está en el carrito, con
   cantidad 0 se quita la línea */
function cambiarCantidad(idPublicacion, cantidad) {
  let lineas = leerCarritoGuardado();
  let posicion = posicionEnLista(lineas, "idPublicacion", idPublicacion);
  let publicacion = obtenerPublicacion(idPublicacion);

  cantidad = parseInt(cantidad, 10);

  if (posicion === -1) {
    return { ok: false, mensaje: "ese producto no está en tu carrito" };
  }

  if (isNaN(cantidad) || cantidad < 0) {
    return { ok: false, mensaje: "la cantidad no puede ser negativa" };
  }

  if (cantidad === 0) {
    quitarDelCarrito(idPublicacion);
    return { ok: true, mensaje: "quitaste el producto de tu carrito" };
  }

  if (publicacion === null || publicacion.estado !== "Activa") {
    return { ok: false, mensaje: "ese producto ya no está disponible" };
  }

  if (cantidad > publicacion.stock) {
    return { ok: false, mensaje: mensajeSinStock(publicacion) };
  }

  lineas[posicion].cantidad = cantidad;
  guardarCarrito(lineas);
  return { ok: true, mensaje: "actualizamos la cantidad de " + publicacion.titulo };
}

function quitarDelCarrito(idPublicacion) {
  let lineas = leerCarritoGuardado();
  let posicion = posicionEnLista(lineas, "idPublicacion", idPublicacion);

  if (posicion !== -1) {
    lineas.splice(posicion, 1);
    guardarCarrito(lineas);
  }
}

function vaciarCarrito() {
  guardarCarrito([]);
}

function totalCarrito() {
  let lineas = obtenerCarrito();
  let total = 0;
  let i;

  for (i = 0; i < lineas.length; i++) {
    total = total + lineas[i].subtotal;
  }

  return redondear(total);
}

/* el total de unidades, es el número que sale en la cabecera */
function cantidadEnCarrito() {
  let lineas = obtenerCarrito();
  let cantidad = 0;
  let i;

  for (i = 0; i < lineas.length; i++) {
    cantidad = cantidad + lineas[i].cantidad;
  }

  return cantidad;
}


/* pedidos */

/* para ordenar los pedidos con el más nuevo arriba */
function pedidoMasRecientePrimero(a, b) {
  if (a.fechaHora > b.fechaHora) {
    return -1;
  }
  if (a.fechaHora < b.fechaHora) {
    return 1;
  }
  if (a.idPedido > b.idPedido) {
    return -1;
  }
  return 1;
}

/* convierte el carrito en pedidos, como cada vecino entrega lo suyo sale
   un pedido por cada vendedor, cada uno con su código, después se descuenta
   el stock y el carrito queda vacío */
function registrarPedidos(metodoPago) {
  let residente = sesionActual();
  let lineas = obtenerCarrito();
  let pedidos;
  let publicaciones;
  let nuevos = [];
  let numero;
  let pedido;
  let posicion;
  let linea;
  let i;
  let j;

  if (residente === null) {
    return { ok: false, mensaje: "inicia sesión para registrar tu pedido", pedidos: [] };
  }

  if (METODOS_DE_PAGO.indexOf(metodoPago) === -1) {
    return { ok: false, mensaje: "elige cómo vas a pagar, efectivo contra entrega, Yape o Plin", pedidos: [] };
  }

  if (lineas.length === 0) {
    return { ok: false, mensaje: "tu carrito está vacío", pedidos: [] };
  }

  /* antes de crear nada revisamos que todavía haya stock de todo, porque
     otro vecino pudo comprar mientras este armaba su carrito */
  for (i = 0; i < lineas.length; i++) {
    if (lineas[i].cantidad > lineas[i].publicacion.stock) {
      return { ok: false, mensaje: mensajeSinStock(lineas[i].publicacion), pedidos: [] };
    }
  }

  pedidos = leerLista("pedidos");
  publicaciones = leerLista("publicaciones");
  numero = siguienteNumero(pedidos, "idPedido");

  for (i = 0; i < lineas.length; i++) {
    linea = lineas[i];

    /* buscamos si ya abrimos un pedido para el vendedor de esta línea */
    pedido = null;
    for (j = 0; j < nuevos.length; j++) {
      if (nuevos[j].idVendedor === linea.publicacion.idResidente) {
        pedido = nuevos[j];
      }
    }

    if (pedido === null) {
      pedido = {
        idPedido: "P-" + conCeros(numero, 4),
        codigo: "KC-" + conCeros(numero, 4),
        fechaHora: fechaHoraDeAhora(),
        idComprador: residente.idResidente,
        idVendedor: linea.publicacion.idResidente,
        detalles: [],
        total: 0,
        pago: { metodo: metodoPago, monto: 0, estado: "Por pagar" },
        estado: "Pendiente",
        motivoCancelacion: ""
      };
      nuevos.push(pedido);
      numero = numero + 1;
    }

    pedido.detalles.push({
      idPublicacion: linea.idPublicacion,
      titulo: linea.publicacion.titulo,
      cantidad: linea.cantidad,
      precioUnitario: linea.publicacion.precio,
      subtotal: linea.subtotal
    });
    pedido.total = redondear(pedido.total + linea.subtotal);
    pedido.pago.monto = pedido.total;

    posicion = posicionEnLista(publicaciones, "idPublicacion", linea.idPublicacion);
    publicaciones[posicion].stock = publicaciones[posicion].stock - linea.cantidad;
  }

  for (i = 0; i < nuevos.length; i++) {
    pedidos.push(nuevos[i]);
  }

  guardarClave("pedidos", pedidos);
  guardarClave("publicaciones", publicaciones);
  vaciarCarrito();

  if (nuevos.length === 1) {
    return { ok: true, mensaje: "registramos tu pedido " + nuevos[0].codigo, pedidos: nuevos };
  }
  return { ok: true, mensaje: "registramos tus " + nuevos.length + " pedidos, uno por cada vendedor", pedidos: nuevos };
}

function pedidosDelComprador(idResidente) {
  let todos = leerLista("pedidos");
  let resultado = [];
  let i;

  for (i = 0; i < todos.length; i++) {
    if (todos[i].idComprador === idResidente) {
      resultado.push(todos[i]);
    }
  }

  resultado.sort(pedidoMasRecientePrimero);
  return resultado;
}

function pedidosDelVendedor(idResidente) {
  let todos = leerLista("pedidos");
  let resultado = [];
  let i;

  for (i = 0; i < todos.length; i++) {
    if (todos[i].idVendedor === idResidente) {
      resultado.push(todos[i]);
    }
  }

  resultado.sort(pedidoMasRecientePrimero);
  return resultado;
}

/* a qué estados puede pasar un pedido desde el estado en que está, el
   panel la usa para ofrecer solo esas opciones */
function estadosSiguientes(estado) {
  if (TRANSICIONES[estado] === undefined) {
    return [];
  }

  return TRANSICIONES[estado].slice();
}

/* cambia el estado de un pedido, solo lo puede hacer el vecino que lo
   vende y solo hacia un estado permitido, si se cancela hay que decir el
   motivo y el stock vuelve a las publicaciones */
function cambiarEstadoPedido(idPedido, nuevoEstado, motivo) {
  let residente = sesionActual();
  let pedidos = leerLista("pedidos");
  let posicion = posicionEnLista(pedidos, "idPedido", idPedido);
  let publicaciones;
  let pedido;
  let lugar;
  let i;

  if (residente === null) {
    return { ok: false, mensaje: "inicia sesión para cambiar el estado del pedido" };
  }

  if (posicion === -1) {
    return { ok: false, mensaje: "no encontramos ese pedido" };
  }

  pedido = pedidos[posicion];

  if (pedido.idVendedor !== residente.idResidente) {
    return { ok: false, mensaje: "solo el vecino que vende puede cambiar el estado del pedido" };
  }

  if (estadosSiguientes(pedido.estado).indexOf(nuevoEstado) === -1) {
    return { ok: false, mensaje: "un pedido " + pedido.estado.toLowerCase() + " no puede pasar a " + String(nuevoEstado).toLowerCase() };
  }

  if (nuevoEstado === "Cancelado") {
    motivo = String(motivo || "").trim();
    if (motivo === "") {
      return { ok: false, mensaje: "cuéntale al comprador por qué cancelas el pedido" };
    }

    pedido.motivoCancelacion = motivo;
    pedido.pago.estado = "Anulado";

    /* devolvemos a cada publicación las unidades que se habían apartado */
    publicaciones = leerLista("publicaciones");
    for (i = 0; i < pedido.detalles.length; i++) {
      lugar = posicionEnLista(publicaciones, "idPublicacion", pedido.detalles[i].idPublicacion);
      if (lugar !== -1) {
        publicaciones[lugar].stock = publicaciones[lugar].stock + pedido.detalles[i].cantidad;
      }
    }
    guardarClave("publicaciones", publicaciones);
  }

  /* cuando el vendedor entrega también recibe el pago, kercado solo lo
     deja anotado */
  if (nuevoEstado === "Entregado") {
    pedido.pago.estado = "Pagado";
  }

  pedido.estado = nuevoEstado;
  guardarClave("pedidos", pedidos);

  return { ok: true, mensaje: "el pedido " + pedido.codigo + " pasó a " + nuevoEstado.toLowerCase() };
}


/* al cargar el archivo revisamos si el navegador ya tiene los datos de
   esta versión, si no los tiene o son de una versión anterior los cargamos
   de nuevo */
function prepararAlmacen() {
  if (leerClave("version") !== DATOS_INICIALES.version) {
    reiniciarDatos();
  }
}

prepararAlmacen();
