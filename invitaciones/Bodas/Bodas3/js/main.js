/* COMPORTAMIENTO: datos de la pareja en config.js. */
(() => {
  'use strict';
  const c = window.WEDDING;
  const $ = selector => document.querySelector(selector);
  const key = suffix => c.storageKey + '-' + suffix;
  const asset = name => 'assets/images/' + name;
  const fill = (selector, text) => document.querySelectorAll(selector).forEach(node => node.textContent = text);

  function create(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  // 01 · Datos y cuenta regresiva.
  fill('[data-bride]', c.bride);
  fill('[data-groom]', c.groom);
  fill('[data-monogram]', `${c.bride[0]} & ${c.groom[0]}`);
  fill('[data-city]', c.city);
  fill('[data-venue]', c.venue);
  document.title = `${c.bride} & ${c.groom} · Noir`;
  const date = new Date(c.date);
  fill('[data-date]', new Intl.DateTimeFormat('es-MX', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Mexico_City'
  }).format(date));
  $('#deadline').textContent = c.deadline;
  $('#ceremony').textContent = c.ceremony;
  $('#reception').textContent = c.reception;
  $('#venue-address').textContent = c.address;
  $('#directions').href = c.mapsUrl;
  $('#map-link').href = c.mapsUrl;
  $('#map-frame').src = c.mapEmbedUrl;

  function countdown() {
    const gap = Math.max(0, date.getTime() - Date.now());
    const values = [Math.floor(gap / 86400000), Math.floor(gap / 3600000) % 24, Math.floor(gap / 60000) % 60, Math.floor(gap / 1000) % 60];
    ['days', 'hours', 'minutes', 'seconds'].forEach((id, index) => {
      $('#' + id).textContent = String(values[index]).padStart(2, '0');
    });
    if (!gap) $('#countdown-note').textContent = 'Nuestro para siempre ya comenzó';
  }
  countdown();
  setInterval(countdown, 1000);

  // 02 · Navegación móvil.
  const menu = $('#nav');
  const toggle = $('#menu-toggle');
  function closeMenu() {
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');
  }
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });

  // 03 · Modales: bloqueo del fondo, cierre y foco nativo de dialog.
  function openDialog(id) {
    $(id).showModal();
    document.body.classList.add('modal-open');
  }
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelector('.close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {
      if (!document.querySelector('dialog[open]')) document.body.classList.remove('modal-open');
    });
  });

  // 04 · Galería compartida: historia y vestimenta, sin recortar las fotos.
  let galleryItems = [];
  let currentPhoto = 0;
  function showPhoto(index) {
    currentPhoto = (index + galleryItems.length) % galleryItems.length;
    const item = galleryItems[currentPhoto];
    const photo = $('#gallery-image');
    const look = $('#gallery-look');
    const fashion = item.position !== undefined;
    photo.hidden = fashion;
    look.hidden = !fashion;
    if (fashion) {
      look.style.backgroundImage = `url("${asset(item.image)}")`;
      look.style.backgroundPosition = item.position + '% center';
      look.setAttribute('role', 'img');
      look.setAttribute('aria-label', item.title);
    } else {
      photo.src = asset(item.image);
      photo.alt = item.title;
    }
    $('#gallery-caption').textContent = `${item.title} · ${currentPhoto + 1} / ${galleryItems.length}`;
  }
  function openGallery(items, index = 0) {
    galleryItems = items;
    showPhoto(index);
    openDialog('#gallery-dialog');
  }
  $('#gallery-prev').addEventListener('click', () => showPhoto(currentPhoto - 1));
  $('#gallery-next').addEventListener('click', () => showPhoto(currentPhoto + 1));
  $('#gallery-dialog').addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') showPhoto(currentPhoto - 1);
    if (event.key === 'ArrowRight') showPhoto(currentPhoto + 1);
  });
  let touchStart = null;
  $('#gallery-stage').addEventListener('touchstart', event => {
    if (event.touches.length === 1) touchStart = {x: event.touches[0].clientX, y: event.touches[0].clientY};
    else touchStart = null;
  }, {passive: true});
  $('#gallery-stage').addEventListener('touchend', event => {
    if (!touchStart || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) showPhoto(currentPhoto + (dx < 0 ? 1 : -1));
    touchStart = null;
  }, {passive: true});

  // 05 · Construcción de historia y referencias de vestimenta.
  c.history.forEach((item, index) => {
    const article = create('article', 'story');
    const button = create('button', 'photo-button');
    button.type = 'button';
    button.setAttribute('aria-label', 'Abrir foto: ' + item.title);
    button.setAttribute('aria-haspopup', 'dialog');
    const image = create('img');
    image.src = asset(item.image);
    image.alt = item.title;
    image.width = 1024;
    image.height = 1024;
    image.loading = 'lazy';
    button.append(image);
    button.addEventListener('click', () => openGallery(c.history, index));
    const copy = create('div', 'story-copy');
    copy.append(create('span', 'year', item.year), create('h3', '', item.title), create('p', '', item.text));
    article.append(button, copy);
    $('#timeline').append(article);
  });
  $('#open-gallery').addEventListener('click', () => openGallery(c.history));
  c.looks.forEach((item, index) => {
    const button = create('button', 'look');
    button.type = 'button';
    button.style.backgroundImage = `url("${asset(item.image)}")`;
    button.style.backgroundPosition = item.position + '% center';
    button.setAttribute('aria-label', 'Ampliar: ' + item.title);
    button.setAttribute('aria-haspopup', 'dialog');
    button.addEventListener('click', () => openGallery(c.looks, index));
    $(index < 3 ? '#women-looks' : '#men-looks').append(button);
  });
  $('#open-guide').addEventListener('click', () => openDialog('#guide-dialog'));
  $('#view-looks').addEventListener('click', () => {
    $('#guide-dialog').close();
    openGallery(c.looks);
  });

  // 06 · Confirmaciones: local por defecto; WhatsApp opcional.
  const form = $('#rsvp-form');
  const whatsapp = /^\d{10,15}$/.test(c.whatsapp);
  if (whatsapp) $('#form-note').textContent = 'Se abrirá WhatsApp para que revises y envíes tu respuesta.';
  form.addEventListener('change', event => {
    const declined = form.elements.attendance.value === 'No';
    $('#companions').disabled = declined;
    $('#food').disabled = declined;
    if (event.target.name === 'food') {
      if (event.target.id === 'food-none' && event.target.checked) {
        document.querySelectorAll('[name=food]:not(#food-none)').forEach(input => input.checked = false);
        $('#allergy').value = '';
      } else if (event.target.checked) {
        $('#food-none').checked = false;
      }
    }
  });
  $('#allergy').addEventListener('input', () => {
    if ($('#allergy').value.trim()) {
      $('#allergy-check').checked = true;
      $('#food-none').checked = false;
    }
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
      food: data.getAll('food'), allergy: String(data.get('allergy') || '').trim(),
      savedAt: new Date().toISOString()
    };
    if (whatsapp) {
      const message = `Hola, soy ${name}. Asistencia: ${response.attendance}. Acompañantes: ${response.companions}. Preferencias: ${response.food.join(', ') || 'No especificadas'}. Alergias: ${response.allergy || 'No especificadas'}.`;
      window.open('https://wa.me/' + c.whatsapp + '?text=' + encodeURIComponent(message), '_blank', 'noopener,noreferrer');
      $('#rsvp-status').textContent = 'Envía el mensaje en WhatsApp para completar tu confirmación.';
      return;
    }
    try {
      localStorage.setItem(key('rsvp'), JSON.stringify(response));
      $('#rsvp-status').textContent = 'Guardado en este navegador. La demostración no envía respuestas a los novios.';
    } catch {
      $('#rsvp-status').textContent = 'No se pudo guardar. El navegador bloqueó el almacenamiento local.';
    }
  });

  // 07 · Muro de firmas. textContent evita interpretar HTML introducido.
  function readMessages() {
    try {
      const value = JSON.parse(localStorage.getItem(key('messages')) || '[]');
      return Array.isArray(value) ? value.filter(item => item && typeof item.name === 'string' && typeof item.text === 'string') : [];
    } catch {
      return [];
    }
  }
  function messageCard(item) {
    const card = create('article', 'message');
    card.append(create('blockquote', '', item.text), create('h3', '', '— ' + item.name), create('time', '', item.date));
    return card;
  }
  function writeMessage() { openDialog('#message-dialog'); }
  function renderMessages() {
    const items = [...readMessages(), ...c.messages];
    const container = $('#messages');
    container.replaceChildren();
    items.slice(0, 6).forEach(item => container.append(messageCard(item)));
    const button = create('button', 'write-card');
    button.append(create('span', '', '✎'), create('span', '', 'Dejar mi mensaje'));
    button.lastChild.style.fontSize = 'inherit';
    button.addEventListener('click', writeMessage);
    container.append(button);
    $('#all-messages-list').replaceChildren(...items.map(messageCard));
  }
  renderMessages();
  $('#all-messages').addEventListener('click', () => openDialog('#all-dialog'));
  $('#write-message').addEventListener('click', () => {
    $('#all-dialog').close();
    writeMessage();
  });
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
      messages.unshift({name, text, date: new Date().toLocaleString('es-MX')});
      localStorage.setItem(key('messages'), JSON.stringify(messages.slice(0, 100)));
      renderMessages();
      event.target.reset();
      $('#message-status').textContent = '';
      $('#message-dialog').close();
    } catch {
      $('#message-status').textContent = 'No se pudo guardar el mensaje en este navegador.';
    }
  });

  // 08 · Redes configurables: no se inventan perfiles.
  document.querySelectorAll('[data-social]').forEach(button => {
    button.addEventListener('click', () => {
      const name = button.dataset.social;
      if (/^https:\/\//.test(c[name])) {
        window.open(c[name], '_blank', 'noopener,noreferrer');
      } else {
        $('#info-title').textContent = name[0].toUpperCase() + name.slice(1);
        openDialog('#info-dialog');
      }
    });
  });
})();
