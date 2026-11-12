# Pasos y comandos del Avance 3

Tres partes: revisar ahora mismo lo que ya está hecho, instalar XAMPP para
trabajar como el resto del equipo, y subir todo a InfinityFree con su base de
datos.

---

## 1. Revisar ahora, sin instalar nada

El entorno de prueba ya está levantado en Docker (PHP 8.2 + Apache y
MariaDB), con la base cargada y limpia.

**Abre el sitio:**

```bash
xdg-open http://localhost:8080/kercado/
```

Si los contenedores se apagaron, se vuelven a levantar con:

```bash
/tmp/claude-1000/-home-uncore-Projects-KercadoWeb/00f145f3-c2b9-4608-9717-7b9fa594c4b6/scratchpad/docker/levantar.sh
```

**Para dejar los datos como al inicio** (después de probar compras,
publicaciones o cambios de estado):

```bash
/tmp/claude-1000/-home-uncore-Projects-KercadoWeb/00f145f3-c2b9-4608-9717-7b9fa594c4b6/scratchpad/docker/recargar-bd.sh
rm -f /home/uncore/Projects/KercadoWeb/uploads/*.jpg /home/uncore/Projects/KercadoWeb/uploads/*.png /home/uncore/Projects/KercadoWeb/uploads/*.webp
```

**Mirar la base por consola** (no hay phpMyAdmin en este entorno):

```bash
docker exec -it kercado-bd mariadb -uroot kercado
```

```sql
SELECT idPublicacion, titulo, stock FROM publicacion LIMIT 5;
SELECT codigo, estado, total FROM pedido ORDER BY idPedido DESC LIMIT 5;
```

**Cuando termines de revisar**, para que no queden corriendo:

```bash
docker rm -f kercado-web kercado-bd
```

### Qué revisar en el navegador

Esto es lo que yo no pude probar, porque lo revisé sin navegador. Las cuentas
son todas con clave `Kercado2026`.

- [ ] **Catálogo:** filtra por categoría, precio y orden; busca "torta".
- [ ] **Ficha:** cambia las miniaturas de la galería, usa el − y el + de la
      cantidad.
- [ ] **Carrito:** entra como `carmen.rojas@kercado.pe`, agrega productos de
      dos vendedores distintos y confirma con Yape. Deben salir dos pedidos.
- [ ] **Diálogo de confirmación:** vacía el carrito y da de baja una
      publicación. Tiene que abrirse el cuadro, no un `confirm()` del
      navegador.
- [ ] **Panel:** entra como `maria.torres@kercado.pe`, cambia de pestaña con
      las flechas del teclado y cambia el estado de un pedido. Al elegir
      "Cancelado" tiene que aparecer el campo del motivo.
- [ ] **Administración:** entra como `administracion@kercado.pe` y activa a
      Sofía Mendoza. Comprueba que `sofia.mendoza@kercado.pe` no podía entrar
      antes y sí después.
- [ ] **Chat de ayuda:** el botón flotante de abajo a la izquierda, escribe
      "cómo vendo" y "yape".
- [ ] **Redes sociales:** los cuatro íconos del pie.
- [ ] **Responsive:** con F12, prueba a 1366, 768 y 375 px. Sin scroll
      horizontal.
- [ ] **Teclado:** recorre una página entera con Tab, incluido "Saltar al
      contenido".
- [ ] **Validador W3C:** en `view-source:`, copia el HTML de cada página y
      pégalo en https://validator.w3.org/#validate_by_input

---

## 2. Instalar XAMPP

Hace falta para trabajar igual que el resto del equipo y para las capturas del
manual, que salen de phpMyAdmin.

### En Arch (tu máquina)

```bash
cd ~/Downloads
curl -O https://sourceforge.net/projects/xampp/files/XAMPP%20Linux/8.2.12/xampp-linux-x64-8.2.12-0-installer.run
chmod +x xampp-linux-x64-8.2.12-0-installer.run
sudo ./xampp-linux-x64-8.2.12-0-installer.run
```

Se instala en `/opt/lampp`. Para arrancarlo y pararlo:

```bash
sudo /opt/lampp/lampp start
sudo /opt/lampp/lampp stop
```

Apaga primero los contenedores de Docker, porque XAMPP también usa el
puerto 3306 de MySQL.

Enlaza el proyecto dentro de XAMPP (así editas en tu carpeta de siempre):

```bash
sudo ln -s /home/uncore/Projects/KercadoWeb /opt/lampp/htdocs/kercado
sudo chmod 777 /home/uncore/Projects/KercadoWeb/uploads
```

### En Windows (el resto del equipo)

1. Bajar XAMPP con PHP 8.2 de https://www.apachefriends.org e instalarlo en
   `C:\xampp` con las opciones por defecto.
2. Abrir el **XAMPP Control Panel** y darle **Start** a **Apache** y a
   **MySQL**.
3. Clonar el repo dentro de `C:\xampp\htdocs` con el nombre `kercado`:
   ```
   cd C:\xampp\htdocs
   git clone https://github.com/piales00/KercadoWeb kercado
   ```

### Crear la base (igual en los dos)

1. Abrir http://localhost/phpmyadmin
2. Pestaña **Bases de datos** → nombre `kercado`, cotejamiento
   `utf8mb4_unicode_ci` → **Crear**.
3. Elegir `kercado` a la izquierda → pestaña **Importar** → **Seleccionar
   archivo** → `sql/kercado.sql` → **Continuar**.
4. Tienen que aparecer 7 tablas.
5. Abrir http://localhost/kercado/

`app/config.php` ya viene con los datos de XAMPP (`localhost`, usuario `root`,
sin contraseña), así que no hay que tocarlo.

Para volver a dejar los datos como al inicio, se importa otra vez
`sql/kercado.sql` (el archivo borra las tablas y las vuelve a crear).

---

## 3. Subir el trabajo

### 3.1 A GitHub

```bash
cd /home/uncore/Projects/KercadoWeb
git status
git add -A
git commit -m "feat: avance 3, el sitio pasa a php y mysql con sesiones y vista de administración"
git pull --rebase
git push
```

`uploads/` y `CLAUDE.md` no se suben, ya están en `.gitignore`.

### 3.2 Crear la cuenta en InfinityFree

1. Entrar a https://infinityfree.com y crear la cuenta.
2. **Create Account** → elegir un subdominio, por ejemplo
   `kercado.infinityfreeapp.com`.
3. Esperar unos minutos a que el sitio quede activo.

### 3.3 Crear la base en el hosting

1. En el panel, **MySQL Databases**.
2. Crear una base, por ejemplo `kercado`. El panel le pone un prefijo y queda
   como `if0_12345678_kercado`.
3. Anotar los cuatro datos que aparecen ahí:
   - **MySQL Hostname**, algo como `sql103.infinityfree.com` (no es
     `localhost`)
   - **MySQL Database Name**, `if0_12345678_kercado`
   - **MySQL Username**, `if0_12345678`
   - **MySQL Password**, la del panel
4. **phpMyAdmin** → elegir la base → **Importar** → subir `sql/kercado.sql` →
   **Continuar**.

### 3.4 Ajustar la conexión

Edita `app/config.php` y pon los datos del paso anterior:

```php
define("BD_SERVIDOR", "sql103.infinityfree.com");
define("BD_NOMBRE",   "if0_12345678_kercado");
define("BD_USUARIO",  "if0_12345678");
define("BD_CLAVE",    "la-del-panel");
define("MODO_DESARROLLO", false);
```

Ese archivo con la clave real **no se sube a GitHub**: está en el
`.gitignore`. En el repo queda `app/config.example.php` como copia de
ejemplo sin claves, así que al clonar solo hay que copiarla:

```bash
cp app/config.example.php app/config.php
```

Y después completar los datos de arriba en `app/config.php`.

### 3.5 Subir los archivos por FTP

Los datos de FTP están en el panel, en **FTP Accounts**: el servidor
(`ftpupload.net`), el usuario y la contraseña.

Con FileZilla:

```bash
sudo pacman -S filezilla
```

1. Servidor `ftpupload.net`, usuario y contraseña del panel, puerto 21 →
   **Conexión rápida**.
2. En el panel derecho, entrar a `htdocs` y borrar el `index2.html` que viene
   de fábrica.
3. Arrastrar desde la izquierda **todo el contenido** de la carpeta del
   proyecto (no la carpeta en sí): los `.php`, `app/`, `sql/`, `css/`, `js/`,
   `assets/` y `uploads/`.
4. No hace falta subir los `.md` ni `.git`.

Después de subir, en `htdocs` tiene que existir `index.php` y
`app/config.php`.

Por consola, si prefieres (súbelo todo de una):

```bash
cd /home/uncore/Projects/KercadoWeb
sudo pacman -S lftp
lftp -u TU_USUARIO_FTP,TU_CLAVE_FTP ftpupload.net -e "mirror -R --exclude .git/ --exclude-glob *.md --exclude .claude/ --exclude .vercel/ . /htdocs; bye"
```

### 3.6 Permisos de las fotos

En el administrador de archivos del panel, click derecho sobre `uploads/` →
**Permissions** → `755`. Si al publicar no se guarda la foto, probar `777`.

### 3.7 Comprobar que quedó bien

Abre `https://kercado.infinityfreeapp.com/` y revisa:

- [ ] El catálogo muestra los 14 productos con sus fotos
- [ ] Entras como `carmen.rojas@kercado.pe` / `Kercado2026`
- [ ] Agregas al carrito y confirmas un pedido
- [ ] Publicas un producto con foto y la foto se ve
- [ ] Entras como `administracion@kercado.pe` y abres la administración
- [ ] Como residente, `admin.php` te responde "acceso restringido"
- [ ] `https://tu-sitio/app/config.php` da error 403, no muestra el archivo

Si algo falla, lo más común:

| Problema | Qué revisar |
|---|---|
| Error de conexión a MySQL | El **hostname** del panel, que no es `localhost` |
| Sale la página de bienvenida de InfinityFree | Que `index.php` esté dentro de `htdocs` y borrar el `index2.html` |
| Las fotos no se ven | Permisos de `uploads/` y que la carpeta se haya subido |
| Página en blanco | Poner `MODO_DESARROLLO` en `true` un momento para ver el error, y volver a `false` |

---

## 4. Lo que falta para la entrega

- [ ] Crear las redes sociales (`kercado.pe` en Facebook, Instagram y TikTok)
      y el WhatsApp, o cambiar esos enlaces en `app/plantilla.php`
- [ ] Capturas del manual: las 51 que lista `MANUAL-DE-USUARIO.md`
- [ ] Exportar el manual a Word
- [ ] Armar el PPT con `PRESENTACION-AVANCE3.md`, copiando los fragmentos de
      código del archivo real `app/almacen.php`
- [ ] Maqueta actualizada en Figma o Balsamiq, mínimo 5 páginas
- [ ] Ensayar la demo
