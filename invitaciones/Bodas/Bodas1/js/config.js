/* EDITA AQUÍ LOS DATOS DE CADA BODA.
   Fecha ISO con zona horaria de México. La fecha de las referencias (2025)
   ya pasó: esta plantilla usa una fecha futura de ejemplo.
   whatsapp: número internacional solo con dígitos, p. ej. 52 + 10 dígitos.
   Vacío = demostración local, sin enviar datos a ningún destino. */
window.WEDDING = {
  bride: 'Sofía', groom: 'Mateo',
  date: '2027-08-24T16:00:00-06:00',
  city: 'Valle de Bravo, MX',
  rsvpDeadline: '24 de julio de 2027',
  venue: 'Nuestra hacienda',
  address: 'Valle de Bravo, Estado de México.\nLugar de ejemplo · ubicación por confirmar.',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Valle+de+Bravo+Estado+de+Mexico',
  whatsapp: '',
  storageKey: 'boda-sofia-mateo-2027',
  history: [
    {year:'2018', title:'Nos conocimos', text:'En una cafetería de la ciudad, una mirada, una sonrisa y todo comenzó.', image:'historia-2018.webp'},
    {year:'2019', title:'La primera aventura', text:'Nuestro primer viaje juntos, comenzamos a soñar en grande.', image:'historia-2019.webp'},
    {year:'2021', title:'Siempre juntos', text:'Entre risas, proyectos y momentos inolvidables, elegimos quedarnos.', image:'historia-2021.webp'},
    {year:'2024', title:'Dijo que sí', text:'Y en el lugar más mágico, comenzamos nuestro para siempre.', image:'historia-2024.webp'}
  ],
  schedule: [
    {time:'16:00', label:'Ceremonia', icon:'anillos'},
    {time:'17:00', label:'Cóctel de bienvenida', icon:'copas'},
    {time:'19:00', label:'Recepción', icon:'cubiertos'},
    {time:'21:00', label:'Cena', icon:'cena'},
    {time:'23:00', label:'Fiesta', icon:'musica'}
  ],
  exampleMessages: [
    {name:'Mariana y Luis', text:'¡Que vivan los novios! Les deseamos toda la felicidad del mundo.'},
    {name:'Camila R.', text:'Será un día inolvidable. Gracias por invitarnos a ser parte de su historia.'},
    {name:'Javier M.', text:'¡Felicidades! Que su amor siga creciendo siempre.'}
  ]
};
