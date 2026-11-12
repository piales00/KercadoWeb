<?php
/*
  hecho por piero. esta es la copia de ejemplo de config.php, sin claves
  reales, para que cualquiera del equipo sepa qué valores poner. para usarla
  se copia como config.php y se completan los datos de su servidor.
*/

// el servidor de mysql, en xampp es localhost y en infinityfree es el que
// sale en el panel, algo como sqlXXX.infinityfree.com
define("BD_SERVIDOR", "localhost");

// el nombre de la base, en xampp la creamos como kercado y en infinityfree
// el panel le pone delante el usuario, queda como if0_XXXXXXXX_kercado
define("BD_NOMBRE", "kercado");

// el usuario y la clave de mysql, en xampp es root sin clave y en
// infinityfree son los que da el panel en la parte de mysql
define("BD_USUARIO", "root");
define("BD_CLAVE", "");

// mientras probamos en xampp lo dejamos en true para ver el error técnico,
// en el hosting va en false para que el vecino no vea detalles de la base
define("MODO_DESARROLLO", true);
