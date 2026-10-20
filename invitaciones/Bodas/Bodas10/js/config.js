/* CONFIGURACIÓN PRINCIPAL · Todos los datos son de ejemplo. */
window.WEDDING = {
  bride: 'Sofía', groom: 'Mateo',
  date: '2027-08-24T17:00:00-06:00',
  durationHours: 8,
  deadline: '1 de agosto de 2027',
  venue: 'Hacienda San Rafael',
  location: 'Zapopan, Jalisco',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Hacienda+San+Rafael+Zapopan+Jalisco',
  whatsapp: '', // Número internacional, solo dígitos, para enviar RSVP.
  storageKey: 'mexicana-rsvp',
  moments: [
    { cardTitle: 'El encuentro', photoIndex: 0, year: '2019', title: 'Un encuentro que lo cambió todo', text: 'La primera mirada. La primera conversación. El comienzo.' },
    { cardTitle: 'La aventura', photoIndex: 2, year: '2021', title: 'Un mundo por descubrir', text: 'Aprendimos a hacer de cada destino nuestro hogar.' },
    { cardTitle: 'El sí', photoIndex: 3, year: '2023', title: 'La pregunta más bonita', text: 'Y la respuesta que ya conocían nuestros corazones.' }
  ],
  agenda: [
    { time: '17:00', title: 'El sí', text: 'Ceremonia en el jardín' },
    { time: '18:00', title: 'El encuentro', text: 'Cóctel de bienvenida' },
    { time: '19:00', title: 'El brindis', text: 'Cena y buenos deseos' },
    { time: '21:00', title: 'La magia', text: 'Nuestro primer baile y fiesta' }
  ],
  photos: [
    { image: 'historia-01.webp', title: 'La primera mirada' },
    { image: 'historia-02.webp', title: 'Nuestro café favorito' },
    { image: 'historia-03.webp', title: 'El mundo, contigo' },
    { image: 'historia-04.webp', title: 'El sí más bonito' },
    { image: 'historia-05.webp', title: 'Para siempre' }
  ],
  // REGALOS: completa solo las opciones que desees utilizar.
  // Usa enlaces https a las mesas reales. Vacíos = “Próximamente”, sin enlaces falsos.
  gifts: {
    stores: [
      { name: 'Liverpool', event: '', url: '' },
      { name: 'Amazon', event: '', url: '' }
    ],
    bank: { holder: '', bank: '', clabe: '', reference: '' },
    honeymoon: { title: 'Nuestro primer viaje como esposos', description: 'Si quieres ser parte de esta aventura, puedes consultar nuestro fondo de luna de miel.', url: '' }
  }
};
