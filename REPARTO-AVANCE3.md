# Reparto del Avance 3

El contrato técnico está en `BASE-AVANCE3.md`. Aquí va qué instalar, quién
hace qué y la lista para revisar antes de entregar.

## Qué instalar (cada uno)

1. **XAMPP** con PHP 8.2 desde apachefriends.org. En Windows se instala con
   las opciones por defecto en `C:\xampp`; en Linux es el `.run` (se instala
   en `/opt/lampp` y se arranca con `sudo /opt/lampp/lampp start`).
2. Desde el panel de XAMPP encender **Apache** y **MySQL**.
3. Clonar el repo dentro de `htdocs` con el nombre `kercado`
   (`C:\xampp\htdocs\kercado`).
4. Abrir `http://localhost/phpmyadmin`, crear la base **`kercado`** con
   cotejamiento `utf8mb4_unicode_ci` e importar `sql/kercado.sql`.
5. Abrir `http://localhost/kercado/`. `app/config.php` ya viene con los datos
   de XAMPP (`localhost`, `root`, sin clave).
6. Para subir a InfinityFree: **FileZilla** (FTP).

Para dejar los datos como al inicio, se importa otra vez `sql/kercado.sql`.

## Quién hace qué

| Integrante | Código | Además |
|---|---|---|
| Piero | `app/`, `sql/`, `salir.php`, `css/estilo.css`, `js/base.js`, `panel.php`, `admin.php` | despliegue en InfinityFree, integración |
| Edgar | `index.php`, `publicar.php` y sus `.js` | capturas del manual de inicio y publicar |
| Francys | `catalogo.php`, `producto.php` y sus `.js` | capturas del catálogo y la ficha |
| Luis | `registro.php`, `carrito.php` y sus `.js`, `assets/` | capturas de registro, sesión y carrito |

Los cuatro: manual de usuario (`MANUAL-DE-USUARIO.md`, cada uno sus
capturas) y la presentación (`PRESENTACION-AVANCE3.md`, cada uno sus
diapositivas y su parte de la demo).

## Lista antes de entregar

- [ ] Todas las páginas abren en `localhost/kercado` y en InfinityFree sin
      advertencias de PHP ni errores en la consola
- [ ] Registro nuevo queda Pendiente y la administración lo activa
- [ ] Ingresar, recordar correo, salir; las páginas privadas mandan a ingresar
- [ ] Un residente no puede abrir `admin.php`
- [ ] Carrito con productos de dos vendedores genera dos pedidos y baja el stock
- [ ] El vendedor cambia el estado; al cancelar vuelve el stock
- [ ] Publicar con foto, y la foto aparece en el catálogo
- [ ] Chat de ayuda y redes sociales en todas las páginas
- [ ] 1366, 768 y 375 px sin scroll horizontal; recorrido solo con teclado
- [ ] HTML de cada página pasa el validador del W3C (ver código fuente en el
      navegador y pegarlo en validator.w3.org)
- [ ] Ningún archivo con la clave real de InfinityFree en git
- [ ] Manual de usuario con capturas, exportado a Word
- [ ] Presentación lista y demo ensayada, con plan B en XAMPP
