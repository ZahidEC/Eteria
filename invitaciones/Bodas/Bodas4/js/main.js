/* FUNCIONES DE LA INVITACIÓN · Los datos se editan en config.js. */
(() => {
  'use strict';
  const c = window.WEDDING;
  const $ = selector => document.querySelector(selector);
  const asset = image => 'assets/images/' + image;
  const key = suffix => c.storageKey + '-' + suffix;
  const fill = (selector, text) => document.querySelectorAll(selector).forEach(node => node.textContent = text);
  function create(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  // 01 · Datos y cuenta regresiva real.
  fill('[data-bride]', c.bride);
  fill('[data-groom]', c.groom);
  fill('[data-monogram]', `${c.bride[0]}&${c.groom[0]}`);
  fill('[data-venue]', c.venue);
  document.title = `${c.bride} & ${c.groom} · A todo color`;
  const date = new Date(c.date);
  fill('[data-date]', new Intl.DateTimeFormat('es-MX', {
    day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Mexico_City'
  }).format(date).replaceAll('/', ' . '));
  $('#address').textContent = c.address;
  $('#card-address').textContent = c.address;
  $('#directions').href = c.mapsUrl;
  $('#map-link').href = c.mapsUrl;
  $('#map-frame').src = c.mapEmbedUrl;
  function updateCountdown() {
    const diff = Math.max(0, date.getTime() - Date.now());
    const values = [Math.floor(diff / 86400000), Math.floor(diff / 3600000) % 24, Math.floor(diff / 60000) % 60, Math.floor(diff / 1000) % 60];
    ['days', 'hours', 'minutes', 'seconds'].forEach((id, index) => {
      $('#' + id).textContent = String(values[index]).padStart(2, '0');
    });
    if (!diff) $('#countdown-note').textContent = 'Nuestro gran día ya llegó';
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // 02 · Navegación y modales accesibles.
  const nav = $('#navigation');
  const toggle = $('#menu-toggle');
  function closeMenu() {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');
  }
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });
  function openDialog(id) {
    $(id).showModal();
    document.body.classList.add('modal-open');
  }
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelector('.close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => document.body.classList.remove('modal-open'));
  });

  // 03 · Galería reutilizable: botones, teclado y deslizamiento táctil.
  let galleryItems = [];
  let photoIndex = 0;
  function showPhoto(index) {
    photoIndex = (index + galleryItems.length) % galleryItems.length;
    const item = galleryItems[photoIndex];
    $('#gallery-image').src = asset(item.image);
    $('#gallery-image').alt = item.title;
    $('#gallery-caption').textContent = `${item.title} · ${photoIndex + 1} / ${galleryItems.length}`;
  }
  function openGallery(items, index = 0) {
    galleryItems = items;
    showPhoto(index);
    openDialog('#gallery-dialog');
  }
  $('#gallery-prev').addEventListener('click', () => showPhoto(photoIndex - 1));
  $('#gallery-next').addEventListener('click', () => showPhoto(photoIndex + 1));
  $('#gallery-dialog').addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') showPhoto(photoIndex - 1);
    if (event.key === 'ArrowRight') showPhoto(photoIndex + 1);
  });
  let touchStart = null;
  $('#gallery-stage').addEventListener('touchstart', event => {
    touchStart = event.touches.length === 1 ? {x: event.touches[0].clientX, y: event.touches[0].clientY} : null;
  }, {passive: true});
  $('#gallery-stage').addEventListener('touchend', event => {
    if (!touchStart || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) showPhoto(photoIndex + (dx < 0 ? 1 : -1));
    touchStart = null;
  }, {passive: true});

  // 04 · Historia y agenda. Todas las fotos conservan altura automática.
  c.history.forEach((item, index) => {
    const card = create('article', 'story');
    const top = create('div', 'story-top');
    top.append(create('span', 'story-number', String(index + 1).padStart(2, '0')), create('h3', '', item.title), create('time', '', item.date));
    const button = create('button', 'photo-button');
    button.type = 'button';
    button.setAttribute('aria-label', 'Ampliar: ' + item.title);
    button.setAttribute('aria-haspopup', 'dialog');
    const image = create('img');
    image.src = asset(item.image);
    image.alt = item.title;
    image.loading = 'lazy';
    image.width = 1122;
    image.height = 1402;
    button.append(image);
    button.addEventListener('click', () => openGallery(c.history, index));
    card.append(top, create('div', 'story-line'), button);
    $('#timeline').append(card);
  });
  $('#history-gallery').addEventListener('click', () => openGallery(c.history));
  c.agenda.forEach(item => {
    const card = create('article', 'agenda-item');
    const icon = create('img');
    icon.src = 'assets/icons/' + item.icon + '.svg';
    icon.alt = '';
    card.append(icon, create('time', '', item.time), create('h3', '', item.title), create('p', '', item.place));
    $('#agenda').append(card);
  });
  document.querySelectorAll('[data-look]').forEach(button => {
    button.addEventListener('click', () => openGallery(c.looks, Number(button.dataset.look)));
  });

  // 05 · RSVP local; enviar por WhatsApp solo si se configura su número.
  const form = $('#rsvp-form');
  const whatsapp = /^\d{10,15}$/.test(c.whatsapp);
  if (whatsapp) $('#form-note').textContent = 'Se abrirá WhatsApp para que revises y envíes tu confirmación.';
  form.addEventListener('change', () => {
    const declined = form.elements.attendance.value === 'No';
    $('#companions').disabled = declined;
    $('#meal-options').disabled = declined;
    $('#allergy').disabled = declined;
  });
  $('#guest-name').addEventListener('input', () => $('#guest-name').setCustomValidity(''));
  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    if (!name) {
      $('#guest-name').setCustomValidity('Escribe tu nombre.');
      $('#guest-name').reportValidity();
      return;
    }
    const response = {
      name, attendance: data.get('attendance'), companions: data.get('companions') || '0',
      meal: data.get('meal') || 'No aplica', allergy: String(data.get('allergy') || '').trim(),
      savedAt: new Date().toISOString()
    };
    if (whatsapp) {
      const text = `Hola, soy ${name}. Asistencia: ${response.attendance}. Acompañantes: ${response.companions}. Alimentos: ${response.meal}. Alergias: ${response.allergy || 'Ninguna'}.`;
      window.open('https://wa.me/' + c.whatsapp + '?text=' + encodeURIComponent(text), '_blank', 'noopener,noreferrer');
      $('#rsvp-status').textContent = 'Envía el mensaje en WhatsApp para completar tu confirmación.';
      return;
    }
    try {
      localStorage.setItem(key('rsvp'), JSON.stringify(response));
      $('#rsvp-status').textContent = 'Respuesta guardada en este navegador. Esta muestra no envía datos a los novios.';
    } catch {
      $('#rsvp-status').textContent = 'No se pudo guardar: el navegador bloqueó el almacenamiento local.';
    }
  });

  // 06 · Dedicatorias y corazones locales, sin interpretar HTML del visitante.
  function readArray(suffix) {
    try {
      const value = JSON.parse(localStorage.getItem(key(suffix)) || '[]');
      return Array.isArray(value) ? value : [];
    } catch { return []; }
  }
  function readMessages() {
    return readArray('messages').filter(item => item && typeof item.name === 'string' && typeof item.text === 'string');
  }
  const liked = new Set(readArray('likes').filter(item => typeof item === 'string'));
  function messageCard(item) {
    const card = create('article', 'message-card ' + (['orange', 'pink', 'yellow', 'blue', 'navy'].includes(item.color) ? item.color : 'pink'));
    card.append(create('p', '', item.text), create('h3', '', '— ' + item.name));
    const button = create('button', 'like', liked.has(item.id) ? '♥' : '♡');
    button.setAttribute('aria-label', 'Me gusta la dedicatoria de ' + item.name);
    button.setAttribute('aria-pressed', String(liked.has(item.id)));
    button.addEventListener('click', () => {
      if (liked.has(item.id)) liked.delete(item.id); else liked.add(item.id);
      button.textContent = liked.has(item.id) ? '♥' : '♡';
      button.setAttribute('aria-pressed', String(liked.has(item.id)));
      try { localStorage.setItem(key('likes'), JSON.stringify([...liked])); } catch { /* La reacción sigue disponible durante esta visita. */ }
    });
    card.append(button);
    return card;
  }
  function wallPhoto(index) {
    const item = c.wallPhotos[index];
    const button = create('button', 'wall-photo');
    button.setAttribute('aria-label', 'Ampliar: ' + item.title);
    button.setAttribute('aria-haspopup', 'dialog');
    const image = create('img');
    image.src = asset(item.image);
    image.alt = item.title;
    image.loading = 'lazy';
    button.append(image);
    button.addEventListener('click', () => openGallery(c.wallPhotos, index));
    return button;
  }
  function renderWall() {
    const wall = $('#wall-grid');
    wall.replaceChildren();
    readMessages().forEach(item => wall.append(messageCard(item)));
    // Alternancia igual a la referencia: texto/foto/texto/foto/texto y su inversa.
    wall.append(messageCard(c.messages[0]), wallPhoto(0), messageCard(c.messages[1]), wallPhoto(1), messageCard(c.messages[2]), wallPhoto(2), messageCard(c.messages[3]), wallPhoto(3), messageCard(c.messages[4]), wallPhoto(4));
  }
  renderWall();
  $('#open-message').addEventListener('click', () => openDialog('#message-dialog'));
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
      messages.unshift({id: 'local-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8), name, text, color: 'pink'});
      localStorage.setItem(key('messages'), JSON.stringify(messages.slice(0, 100)));
      renderWall();
      event.target.reset();
      $('#message-status').textContent = '';
      $('#message-dialog').close();
    } catch {
      $('#message-status').textContent = 'No se pudo guardar tu mensaje en este navegador.';
    }
  });
})();
