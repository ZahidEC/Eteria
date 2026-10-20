/* COMPORTAMIENTO · Los datos de cada pareja están en config.js. */
(() => {
  'use strict';
  const c = window.WEDDING;
  const $ = selector => document.querySelector(selector);
  const asset = name => 'assets/images/' + name;
  const key = name => c.storageKey + '-' + name;

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function fill(selector, text) {
    document.querySelectorAll(selector).forEach(node => node.textContent = text);
  }

  // 01 · Datos y cuenta regresiva real.
  const weddingDate = new Date(c.date);
  const formattedDate = new Intl.DateTimeFormat('es-MX', {
    day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Cancun'
  }).format(weddingDate).replaceAll('/', ' . ');
  fill('[data-bride]', c.bride);
  fill('[data-groom]', c.groom);
  fill('[data-date]', formattedDate);
  fill('[data-city]', c.city);
  document.title = `${c.bride} & ${c.groom} · ${c.city}`;
  $('#deadline').textContent = c.deadline;
  $('#venue-name').textContent = c.venue;
  $('#venue-address').textContent = c.address;
  $('#directions').href = c.mapsUrl;
  $('.map-preview iframe').src = c.mapEmbedUrl;

  function updateCountdown() {
    const milliseconds = Math.max(0, weddingDate.getTime() - Date.now());
    const values = [
      Math.floor(milliseconds / 86400000),
      Math.floor(milliseconds / 3600000) % 24,
      Math.floor(milliseconds / 60000) % 60,
      Math.floor(milliseconds / 1000) % 60
    ];
    ['days', 'hours', 'minutes', 'seconds'].forEach((id, index) => {
      $('#' + id).textContent = String(values[index]).padStart(2, '0');
    });
    if (!milliseconds) $('#date-note').textContent = 'Nuestro para siempre ya comenzó';
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // 02 · Menú móvil y selector de imagen principal (sin reproducción automática).
  const menu = $('#nav');
  const menuButton = $('#menu-toggle');
  function closeMenu() {
    menu.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Abrir menú');
  }
  menuButton.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });
  c.slides.forEach((image, index) => {
    const button = element('button', index === 0 ? 'active' : '');
    button.setAttribute('aria-label', `Mostrar fotografía ${index + 1}`);
    button.setAttribute('aria-pressed', String(index === 0));
    button.addEventListener('click', () => {
      $('#hero-image').src = asset(image);
      $('#hero-image').alt = 'Fotografía de nuestra celebración, imagen ' + (index + 1);
      document.querySelectorAll('.hero-dots button').forEach(other => {
        other.classList.toggle('active', other === button);
        other.setAttribute('aria-pressed', String(other === button));
      });
    });
    $('.hero-dots').append(button);
  });

  // 03 · Tarjetas de historia y agenda.
  c.history.forEach((item, index) => {
    const card = element('article', 'story');
    const image = element('img');
    image.src = asset(item.image);
    image.alt = item.title + ', ' + item.place;
    image.loading = 'lazy';
    image.width = 900;
    image.height = 1200;
    const photoButton = element('button', 'story-photo');
    photoButton.type = 'button';
    photoButton.setAttribute('aria-label', 'Abrir fotografía: ' + item.title);
    photoButton.setAttribute('aria-haspopup', 'dialog');
    photoButton.setAttribute('aria-controls', 'gallery-dialog');
    photoButton.append(image);
    photoButton.addEventListener('click', () => {
      showPhoto(index);
      $('#gallery-dialog').showModal();
    });
    const copy = element('div', 'story-copy');
    copy.append(element('time', '', item.date), element('h3', '', item.title), element('p', '', item.place));
    card.append(photoButton, element('div', 'story-line'), copy);
    $('#timeline').append(card);
  });
  c.agenda.forEach(item => {
    const li = element('li');
    const image = element('img');
    image.src = 'assets/icons/' + item.icon + '.svg';
    image.alt = '';
    const copy = element('div');
    copy.append(element('strong', '', item.title), element('span', '', item.place));
    li.append(image, element('time', '', item.time), copy);
    $('#agenda').append(li);
  });

  // 04 · Ventanas y galería accesibles con Escape nativo de dialog.
  document.querySelectorAll('dialog .close').forEach(button => {
    button.addEventListener('click', () => button.closest('dialog').close());
  });
  $('#open-tips').addEventListener('click', () => $('#tips-dialog').showModal());
  let photoIndex = 0;
  function showPhoto(index) {
    photoIndex = (index + c.history.length) % c.history.length;
    const photo = c.history[photoIndex];
    $('#gallery-image').src = asset(photo.image);
    $('#gallery-image').alt = photo.title + ', ' + photo.place;
    $('#gallery-caption').textContent = `${photo.title} · ${photo.place} · ${photoIndex + 1}/${c.history.length}`;
  }
  $('#open-gallery').addEventListener('click', () => {
    showPhoto(0);
    $('#gallery-dialog').showModal();
  });
  $('#gallery-prev').addEventListener('click', () => showPhoto(photoIndex - 1));
  $('#gallery-next').addEventListener('click', () => showPhoto(photoIndex + 1));
  $('#gallery-dialog').addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') showPhoto(photoIndex - 1);
    if (event.key === 'ArrowRight') showPhoto(photoIndex + 1);
  });

  // 05 · Descarga de evento .ics compatible con aplicaciones de calendario.
  function icsText(value) {
    return String(value).replaceAll('\\', '\\\\').replaceAll('\n', '\\n').replaceAll(',', '\\,').replaceAll(';', '\\;');
  }
  function icsDate(value) {
    return new Date(value).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  }
  $('#calendar').addEventListener('click', () => {
    const lines = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Invitacion Boda//ES',
      'BEGIN:VEVENT', `UID:${c.storageKey}@wedding.local`,
      `DTSTAMP:${icsDate(Date.now())}`, `DTSTART:${icsDate(c.date)}`,
      `DTEND:${icsDate(c.endDate)}`,
      `SUMMARY:${icsText('Boda de ' + c.bride + ' y ' + c.groom)}`,
      `LOCATION:${icsText(c.venue + ', ' + c.address)}`,
      'END:VEVENT', 'END:VCALENDAR'
    ];
    const url = URL.createObjectURL(new Blob([lines.join('\r\n') + '\r\n'], {type: 'text/calendar;charset=utf-8'}));
    const link = element('a');
    link.href = url;
    link.download = 'nuestra-boda.ics';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  // 06 · RSVP: local por defecto; WhatsApp si se configura un número válido.
  const rsvp = $('#rsvp-form');
  const useWhatsApp = /^\d{10,15}$/.test(c.whatsapp);
  if (useWhatsApp) {
    $('#form-note').textContent = 'Se abrirá WhatsApp para que revises y envíes tu confirmación.';
  }
  rsvp.addEventListener('change', () => {
    const declined = rsvp.elements.attendance.value === 'No';
    $('#companions').disabled = declined;
    $('#food').disabled = declined;
  });
  $('#name').addEventListener('input', () => $('#name').setCustomValidity(''));
  rsvp.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(rsvp);
    const name = String(data.get('name') || '').trim();
    if (!name) {
      $('#name').setCustomValidity('Escribe tu nombre.');
      $('#name').reportValidity();
      return;
    }
    const response = {
      name,
      attendance: data.get('attendance'),
      companions: data.get('companions') || '0',
      food: data.getAll('food'),
      other: String(data.get('other') || '').trim(),
      savedAt: new Date().toISOString()
    };
    if (useWhatsApp) {
      const text = `Hola, soy ${name}. Asistencia: ${response.attendance}. Acompañantes: ${response.companions}. Preferencias: ${response.food.join(', ') || 'Ninguna'}. ${response.other}`;
      window.open('https://wa.me/' + c.whatsapp + '?text=' + encodeURIComponent(text), '_blank', 'noopener,noreferrer');
      $('#rsvp-status').textContent = 'Envía el mensaje en WhatsApp para completar tu confirmación.';
      return;
    }
    try {
      localStorage.setItem(key('rsvp'), JSON.stringify(response));
      $('#rsvp-status').textContent = 'Guardado en este navegador. Esta muestra no envía respuestas a los novios.';
    } catch {
      $('#rsvp-status').textContent = 'No se pudo guardar: el navegador bloqueó el almacenamiento local.';
    }
  });

  // 07 · Dedicatorias locales: texto seguro, sin insertar HTML del usuario.
  function readMessages() {
    try {
      const data = JSON.parse(localStorage.getItem(key('messages')) || '[]');
      return Array.isArray(data) ? data.filter(item => item && typeof item.name === 'string' && typeof item.text === 'string') : [];
    } catch {
      return [];
    }
  }
  function openMessage() { $('#message-dialog').showModal(); }
  function renderMessages() {
    const container = $('#messages');
    container.replaceChildren();
    const items = [...readMessages(), ...c.messages];
    items.forEach(item => {
      const card = element('article', 'message');
      card.append(element('h3', '', item.name), element('p', '', item.text), element('time', '', item.date));
      container.append(card);
    });
    const heart = element('button', 'message heart', '♡');
    heart.setAttribute('aria-label', 'Escribir una dedicatoria');
    heart.addEventListener('click', openMessage);
    container.append(heart);
  }
  renderMessages();
  $('#open-message').addEventListener('click', openMessage);
  $('#message-form').addEventListener('submit', event => {
    event.preventDefault();
    const name = $('#message-name').value.trim();
    const text = $('#message-text').value.trim();
    if (!name || !text) {
      $('#message-status').textContent = 'Escribe tu nombre y un mensaje.';
      return;
    }
    try {
      const messages = readMessages();
      messages.unshift({name, text, date: new Date().toLocaleDateString('es-MX')});
      localStorage.setItem(key('messages'), JSON.stringify(messages.slice(0, 100)));
      renderMessages();
      event.target.reset();
      $('#message-status').textContent = '';
      $('#message-dialog').close();
    } catch {
      $('#message-status').textContent = 'No se pudo guardar el mensaje en este navegador.';
    }
  });

  // 08 · Enlaces sociales y regalo: no inventar cuentas de los novios.
  const titles = {instagram: 'Instagram', spotify: 'Nuestra música', gift: 'Nuestro regalo'};
  document.querySelectorAll('[data-info]').forEach(button => {
    button.addEventListener('click', () => {
      const type = button.dataset.info;
      const destination = c[type];
      if (/^https:\/\//.test(destination)) {
        window.open(destination, '_blank', 'noopener,noreferrer');
        return;
      }
      $('#info-title').textContent = titles[type];
      $('#info-text').textContent = 'Los novios compartirán esta información próximamente.';
      $('#info-dialog').showModal();
    });
  });
})();
