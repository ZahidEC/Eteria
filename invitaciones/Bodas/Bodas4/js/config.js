/* DATOS EDITABLES · Un único lugar para personalizar cada boda.
 * Se conserva la fecha de las capturas: el contador real ya llegó a cero.
 * El mapa muestra Zapopan en general hasta confirmar el recinto.
 * WhatsApp: código de país + número, solo dígitos. Vacío = demo local.
 */
window.WEDDING = {
  bride: 'Sofía', groom: 'Mateo',
  date: '2025-08-24T17:00:00-06:00',
  venue: 'Hacienda San Rafael',
  address: 'Carretera a Colotlán 123\nZapopan, Jalisco',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Hacienda+San+Rafael+Zapopan+Jalisco',
  mapEmbedUrl: 'https://www.google.com/maps?q=Zapopan+Jalisco&output=embed',
  whatsapp: '',
  storageKey: 'boda-color-sofia-mateo-2025',
  history: [
    {title:'Nos conocimos',date:'Marzo 2019',image:'historia-01.webp'},
    {title:'Primera cita',date:'Abril 2019',image:'historia-02.webp'},
    {title:'Viaje inolvidable',date:'Mayo 2021',image:'historia-03.webp'},
    {title:'La pregunta',date:'Diciembre 2023',image:'historia-04.webp'},
    {title:'Para siempre',date:'Agosto 2025',image:'historia-05.webp'}
  ],
  agenda: [
    {time:'17:00',title:'Ceremonia',place:'Jardín Principal',icon:'anillos'},
    {time:'18:00',title:'Cóctel de Bienvenida',place:'Terraza',icon:'copa'},
    {time:'19:30',title:'Cena',place:'Salón Firenze',icon:'cubiertos'},
    {time:'21:00',title:'Fiesta',place:'Pista de Baile',icon:'musica'},
    {time:'00:00',title:'Brindis & Pastel',place:'Terraza',icon:'pastel'}
  ],
  looks: [
    {title:'Vestido largo · colores vibrantes',image:'vestido.webp'},
    {title:'Traje formal · azul marino',image:'traje.webp'}
  ],
  messages: [
    {id:'ana-luis',name:'Ana & Luis',text:'Les deseo una vida llena de amor y aventuras. ¡Felicidades!',color:'orange'},
    {id:'mariana',name:'Mariana',text:'Que este sea el comienzo de su mejor historia juntos.',color:'pink'},
    {id:'carlos-fer',name:'Carlos & Fer',text:'¡Qué vivan los novios! No podemos esperar para celebrar con ustedes.',color:'yellow'},
    {id:'sofi',name:'Sofi',text:'Siempre supe que terminarían juntos. Los quiero mucho.',color:'blue'},
    {id:'pablo',name:'Pablo',text:'Hoy empieza su para siempre. ¡Felicidades!',color:'navy'}
  ],
  wallPhotos: [
    {title:'Así comenzó lo nuestro',image:'historia-01.webp'},
    {title:'Un viaje para recordar',image:'historia-03.webp'},
    {title:'Nuestra primera cita',image:'historia-02.webp'},
    {title:'Para siempre',image:'historia-05.webp'},
    {title:'Sofía y Mateo',image:'portada.webp'}
  ]
};
