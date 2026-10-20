# PARTY ROYALE · Invitación interactiva (Fortnite-inspired)

## Abrir la página

1. Extrae el ZIP.
2. Abre `index.html` en Chrome/Edge, o ejecuta con Live Server de VS Code.
3. Edita la fecha, nombre, edad, ubicación, WhatsApp y galería en `js/config.js`.

## Personalización importante

- `nombre`: nombre del cumpleañero.
- `edad`: años que cumple.
- `fecha`: formato `2026-11-21T16:00:00` (hora local del evento).
- `duracionHoras`: duración del evento en el calendario.
- `lugar`, `lugarCorto`, `ciudad`, `direccion`: lugar de la fiesta.
- `mapaURL`: pega aquí el enlace auténtico a Google Maps para mostrarlo en el botón "Cómo llegar". Si lo dejas vacío se abrirá una búsqueda por el texto de la dirección.
- `whatsapp`: número de quien recibirá confirmaciones, con código de país, sin + ni espacios. Ejemplo ficticio de formato: `5217751234567` (no lo copies como teléfono real).
- `fotos`: rutas de 3 imágenes. Reemplaza los SVG de ejemplo por JPG, WEBP o PNG y edita sus rutas en el arreglo.
- `nombreEvento`: título del evento en el archivo de calendario.

**¡Atención!** Todos los datos iniciales son de muestra; no hay un salón real confirmado. El formulario solo abre WhatsApp, nunca almacena datos en un servidor ni envía mensajes automáticamente. Si no configuras WhatsApp, mostrará un aviso y no abrirá un número falso.

## Funciones

- Mundo Battle Royale dibujado como SVG original, con autobús volador, paracaídas de suministros, héroe cartoon, llama, cofre, poción, corona, mapa original.
- Menú móvil, sonidos opcionales generados por Web Audio API (sin archivos de audio externos).
- Tres personajes seleccionables con equipamiento dinámico y minijuego de tres cofres.
- Ventana de recompensa final + confeti + reinicio de juego.
- Contador regresivo y descarga de un archivo .ics para el calendario.
- Mapa temático ilustrado y enlace a Google Maps editable.
- Galería ampliable con teclado y botones.
- Confirmación RSVP a través de WhatsApp, validación básica.
- Responsive desde 320px, soporte para movimiento reducido y navegación por teclado.

## Organización

```
Invitacion_Fortnite_Party_Royale/
├── index.html          # Estructura de todas las secciones
├── css/styles.css      # Estilos, efectos y responsive
├── js/config.js        # DATOS EDITABLES (empieza aquí)
├── js/main.js          # Interacciones y funcionalidades
└── assets/             # Imágenes SVG locales
    ├── hero-world.svg
    ├── character-*.svg
    ├── loot-chest.svg, v-coin.svg, shield-potion.svg, victory-crown.svg
    ├── island-map.svg
    ├── gallery/foto-01.svg ... foto-03.svg
    └── icons/favicon.svg
```

## Publicar en GitHub Pages

Crea un repositorio en GitHub, sube todos los archivos y carpetas, luego en Settings > Pages selecciona Deploy from a branch, rama main y carpeta /(root). No requiere PHP, base de datos ni hosting de pago.

## Avisos

Es una página temática independiente inspirada en el género Battle Royale y Fortnite. Sus ilustraciones originales son de demostración; no incluye logos, música ni recursos oficiales de Epic Games. No hay asociación o respaldo de Epic Games. La página carga la fuente Google Fonts si hay Internet; si no, utiliza tipografías alternativas del dispositivo.
