# OPERACIÓN CUMPLEAÑOS · Call of Duty / Warzone

Invitación web estática estilo videojuego, preparada como **plantilla editable** para demostración.

## Abrir
Abre `index.html` en el navegador o ejecuta `Live Server` desde Visual Studio Code. Para publicarla en GitHub Pages, sube esta carpeta y mantén sus rutas.

## Personalizar
1. Abre **`js/config.js`** y cambia `nombre`, `edad`, `fecha`, `hora`, `horaFin`, `lugar`, `direccion`, `mapsUrl` y `whatsapp`.
2. Usa el número de WhatsApp en formato internacional (México: `5217751234567`, sin `+`). De forma predeterminada está vacío por seguridad; **el formulario no envía nada a un número de ejemplo**.
3. Sustituye `assets/img/cumpleanero-ejemplo.webp` y `assets/img/nino-ejemplo-1.webp` a `nino-ejemplo-4.webp` por fotografías de la familia **con el permiso correspondiente**. Si prefieres, conserva las fotos ficticias generadas como ejemplo.
4. Modifica la paleta y componentes desde **`css/styles.css`** y las interacciones desde **`js/app.js`**.

## Funciones incluidas
- Hero cinematográfico con niño ficticio y operador ilustrado
- Fecha, hora, lugar, cuenta regresiva y calendario
- Selector de 4 equipos
- Selector de modos Warzone, Multijugador y Resurgimiento
- 3 cajas de suministros con recompensa desbloqueable
- Galería modal de 4 fotografías ficticias (no corresponden a niños reales)
- Confirmación por WhatsApp con modo seleccionado
- Responsive para escritorio, tablet y celular
- Efectos opcionales, sin audio automático

## Imágenes del juego: importante
Las **3 imágenes de Call of Duty/Warzone** mostradas en las tarjetas de modos se solicitan al navegador desde servidores públicos externos (Xbox Wire / Future / Instant Gaming) y **no están incluidas en el ZIP**, debido a que no se han verificado derechos para redistribuirlas. Si fallan, la invitación cambia automáticamente a ilustraciones locales originales, por lo que **funciona sin conexión** salvo la imagen oficial. Sus enlaces están en `index.html` en la sección `#modos`.

Para vender o publicar invitaciones comerciales que incluyan imágenes, marcas o personajes de Call of Duty, **comprueba antes los derechos y autorizaciones de uso**. Esta es una invitación no oficial, sin vínculo ni aval de Activision. El resto de las ilustraciones y fotos de ejemplo se generaron expresamente para la demostración.

Fuentes de referencia del juego:
- https://www.callofduty.com/mx/es/warzone.html
- https://news.xbox.com/en-us/2023/12/06/how-raven-software-created-urzikstan-the-definitive-call-of-duty-warzone-map/
- https://www.callofduty.com/mx/es/blog/2025/03/call-of-duty-warzone-verdansk-map-return-intel-drop

## Estructura
```
Invitacion_COD_Warzone_2_0/
├── index.html
├── css/styles.css
├── js/config.js
├── js/app.js
├── assets/img/
│   ├── cumpleanero-ejemplo.webp
│   ├── nino-ejemplo-1.webp ... nino-ejemplo-4.webp
│   ├── operador-art.webp, operacion-art.webp, despliegue-art.webp
│   ├── weapon-rifle.svg, weapon-smg.svg, weapon-sniper.svg, weapon-shield.svg
│   └── hero-fondo.webp
└── LEEME.md
```
