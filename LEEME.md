# Éteria · Catálogo de invitaciones

Sitio estático en HTML, CSS y JavaScript. No requiere npm ni compilación.
33 modelos: 12 bodas, 17 infantiles y 4 XV años. Los proyectos del ZIP original conservan sus carpetas y archivos.

## Publicar en GitHub Pages

1. Crea un repositorio y sube el CONTENIDO de esta carpeta a su raíz. `index.html` debe quedar en la raíz, junto a `css`, `js`, `assets` e `invitaciones`.
2. En Settings → Pages puedes seleccionar Deploy from a branch, rama main y carpeta / (root). Con esta opción puedes omitir la carpeta `.github`.
3. Alternativamente, selecciona GitHub Actions como origen y utiliza el workflow incluido en `.github/workflows/pages.yml`.
4. Abre la dirección que indique GitHub al terminar la publicación. Las rutas relativas funcionan también en repositorios bajo `/nombre-repositorio/`.

Este archivo no se ha publicado en tu cuenta: no se proporcionó repositorio ni acceso.

## Editar

- `js/config.js`: WhatsApp, precio, anticipo, días de anticipación, rondas de cambios y nota de alojamiento.
- `js/catalogo.js`: nombres públicos, categorías, rutas y portadas de todos los modelos.
- `index.html`: textos, preguntas frecuentes y estructura de secciones.
- `css/styles.css`: colores y estilos. Variables al principio; estilos de cada categoría en selectores `body[data-theme=...]`.
- `js/app.js`: búsqueda, categorías, favoritos, modal y mensajes de WhatsApp.
- `assets/logo.svg`: logotipo vectorial original con letra E, órbita y estrella. Editable en un editor vectorial o de texto.
- `invitaciones/`: los proyectos originales. Cada uno conserva su configuración independiente.

Para agregar un modelo: copia la carpeta del proyecto a su categoría y añade un objeto a `window.CATALOGO` con id único, name, category (`bodas`, `infantil`, `xv`), path (incluye index.html), cover y folder. Copia una entrada existente como ejemplo. No cambies IDs existentes si deseas conservar favoritos guardados.

Enlaces directos a categorías: `?coleccion=bodas#catalogo`, `?coleccion=infantil#catalogo`, `?coleccion=xv#catalogo`.

## Acuerdos comerciales

- $500 MXN por cualquiera de los modelos.
- $250 MXN de anticipo y $250 al entregar.
- Pedido al menos 7 días antes del evento. La fecha de entrega se confirma con el cliente.
- Personalización, fotos, ubicación, confirmación por WhatsApp y alojamiento; sin música.
- Se proponen DOS rondas de cambios sobre el diseño elegido. Este número no fue indicado por el propietario y puede modificarse en config.js antes de publicar.
- La duración del alojamiento NO se inventó: se indica que se acuerda al confirmar el pedido.
- Datos, fotos y contactos dentro de las demos son ejemplos. Antes de entregar cada invitación a un cliente hay que actualizar su propia configuración, incluidas las confirmaciones.
- Los proyectos originales pueden contener funciones o controles musicales; no se han modificado. La oferta del catálogo excluye música.

## Funcionamiento y privacidad

El catálogo no cobra, no recibe formularios ni guarda información de clientes. WhatsApp abre un mensaje que el visitante debe enviar. Solo se almacenan los IDs de favoritos en localStorage del navegador. No se sincronizan entre dispositivos.
Las demos se cargan al solicitarlas, dentro de un iframe, y se descargan al cerrarlo. Se pueden abrir en otra pestaña. El modo escritorio usa el espacio disponible: en un teléfono conviene abrir la demo para probarla directamente.
Las imágenes de tarjetas son portadas representativas de cada modelo, no capturas de pantalla. Cuatro modelos sin imágenes locales utilizan ilustraciones geométricas propias para su tarjeta.

## Validación y dependencias

Verificados: sintaxis del JavaScript nuevo; 33 IDs únicos; existencia de todas las rutas de modelos y portadas; referencias locales de HTML en los 34 documentos; cálculo del pago en dos partes.
Pendiente: revisión visual e interacción real en navegador y comprobación final en tu URL de GitHub Pages. No se dispuso de un navegador de pruebas en esta sesión.
Las fuentes de la portada se cargan desde Google Fonts, con fuentes de sistema como respaldo. Algunas demos originales tienen imágenes externas (Stitch y Warzone); su disponibilidad depende del proveedor. No se garantiza el funcionamiento de esos recursos remotos.

Para una revisión local, abre index.html o ejecuta `python -m http.server 8000` desde esta carpeta y visita http://localhost:8000. Revisa celular, escritorio, búsqueda, favoritos, apertura/cierre de demos, teclado y WhatsApp antes de anunciar el catálogo.
