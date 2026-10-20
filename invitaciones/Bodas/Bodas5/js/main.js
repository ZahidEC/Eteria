/* INTERACCIONES · Los datos editables están en config.js. */
(() => {
  'use strict';
  const c = window.WEDDING;
  const $ = s => document.querySelector(s);
  const fill = (s, text) => document.querySelectorAll(s).forEach(el => el.textContent = text);
  const asset = file => 'assets/images/' + file;
  const node = (tag, cls, text) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text !== undefined) el.textContent = text;
    return el;
  };

  // 01 · Personalización y cuenta regresiva.
  fill('[data-bride]', c.bride);
  fill('[data-groom]', c.groom);
  fill('[data-monogram]', `${c.bride[0]}&${c.groom[0]}`);
  fill('[data-venue]', c.venue);
  document.querySelectorAll('[data-map]').forEach(el => el.href = c.mapsUrl);
  document.title = `Siempre tú · ${c.bride} & ${c.groom}`;
  const date = new Date(c.date);
  fill('[data-date]', new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Mexico_City' }).format(date));
  function count() {
    const diff = Math.max(0, date.getTime() - Date.now());
    [Math.floor(diff / 86400000), Math.floor(diff / 3600000) % 24, Math.floor(diff / 60000) % 60, Math.floor(diff / 1000) % 60].forEach((v, i) => {
      $('#' + ['days', 'hours', 'minutes', 'seconds'][i]).textContent = String(v).padStart(2, '0');
    });
    if (!diff) $('#countdown-note').textContent = 'Nuestro para siempre ya comenzó.';
  }
  count();
  setInterval(count, 1000);

  // 02 · Navegación y diálogos nativos (foco, Escape y cierre).
  function closeMenu() {
    $('#navigation').classList.remove('open');
    $('#menu-toggle').setAttribute('aria-expanded', 'false');
    $('#menu-toggle').setAttribute('aria-label', 'Abrir menú');
  }
  $('#menu-toggle').addEventListener('click', () => {
    const open = $('#navigation').classList.toggle('open');
    $('#menu-toggle').setAttribute('aria-expanded', String(open));
    $('#menu-toggle').setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });
  document.querySelectorAll('nav a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  function openDialog(id) { $(id).showModal(); document.body.classList.add('modal-open'); }
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelector('.close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => document.body.classList.remove('modal-open'));
  });
  $('#open-letter').addEventListener('click', () => openDialog('#letter-dialog'));
  $('#letter-rsvp').addEventListener('click', () => {
    $('#letter-dialog').close();
    $('#rsvp').scrollIntoView();
    $('#guest-name').focus({ preventScroll: true });
  });

  // 03 · Galería compartida por historia y recuerdos.
  let items = c.photos;
  let current = 0;
  function showPhoto(index) {
    current = (index + items.length) % items.length;
    $('#gallery-image').src = asset(items[current].image);
    $('#gallery-image').alt = items[current].title;
    $('#gallery-caption').textContent = `${items[current].title} · ${current + 1} / ${items.length}`;
  }
  function gallery(list, index) { items = list; showPhoto(index); openDialog('#gallery-dialog'); }
  function photoButton(item, list, index, cls) {
    const button = node('button', cls);
    button.type = 'button';
    button.setAttribute('aria-label', 'Ampliar: ' + item.title);
    button.setAttribute('aria-haspopup', 'dialog');
    const img = node('img');
    img.src = asset(item.image); img.alt = item.title; img.loading = 'lazy'; img.width = 1122; img.height = 1402;
    button.append(img);
    button.addEventListener('click', () => gallery(list, index));
    return button;
  }
  c.story.forEach((item, index) => {
    const article = node('article', 'story-card reveal');
    article.append(photoButton(item, c.story, index, 'story-photo'), node('p', 'eyebrow', item.date), node('h3', '', item.title), node('p', '', item.text));
    $('#story-grid').append(article);
  });
  c.photos.forEach((item, index) => {
    const button = photoButton(item, c.photos, index, 'photo-button');
    button.append(node('span', '', item.title));
    $('#photo-grid').append(button);
  });
  $('#gallery-prev').addEventListener('click', () => showPhoto(current - 1));
  $('#gallery-next').addEventListener('click', () => showPhoto(current + 1));
  $('#gallery-dialog').addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); showPhoto(current - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); showPhoto(current + 1); }
  });
  let touch = null;
  $('#gallery-stage').addEventListener('touchstart', e => { touch = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null; }, { passive: true });
  $('#gallery-stage').addEventListener('touchend', e => {
    if (!touch || !e.changedTouches.length) return;
    const dx = e.changedTouches[0].clientX - touch.x;
    const dy = e.changedTouches[0].clientY - touch.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) showPhoto(current + (dx < 0 ? 1 : -1));
    touch = null;
  }, { passive: true });

  // 04 · Efectos ligeros, pausables y con movimiento reducido.
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reduced.matches;
  const effects = $('#effects-toggle');
  function setEffects(value) {
    paused = value;
    document.body.classList.toggle('effects-paused', paused);
    effects.textContent = paused ? 'Activar efectos' : 'Pausar efectos';
    effects.setAttribute('aria-pressed', String(paused));
    if (paused) document.querySelectorAll('.pending').forEach(el => el.classList.remove('pending'));
  }
  setEffects(paused);
  effects.addEventListener('click', () => setEffects(!paused));
  reduced.addEventListener('change', e => setEffects(e.matches));
  for (let i = 0; i < 12; i++) {
    const petal = node('span', 'petal');
    petal.style.left = (i * 8.3) + '%';
    petal.style.animationDuration = (15 + i % 5 * 3) + 's';
    petal.style.animationDelay = (-i * 2.7) + 's';
    $('#petals').append(petal);
  }
  if ('IntersectionObserver' in window && !paused) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.remove('pending'); observer.unobserve(entry.target); }
      });
    }, { threshold: .08 });
    document.querySelectorAll('.reveal').forEach(el => { el.classList.add('pending'); observer.observe(el); });
  }

  // 05 · RSVP local u opcionalmente WhatsApp; nunca simular envíos.
  const form = $('#rsvp-form');
  const whatsapp = /^\d{10,15}$/.test(c.whatsapp);
  if (whatsapp) $('#form-note').textContent = 'Se abrirá WhatsApp para que revises y envíes tu respuesta.';
  form.addEventListener('change', () => {
    const no = form.elements.attendance.value === 'No';
    $('#guests').disabled = no; $('#meal').disabled = no;
  });
  $('#guest-name').addEventListener('input', () => $('#guest-name').setCustomValidity(''));
  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    if (!name) { $('#guest-name').setCustomValidity('Escribe tu nombre.'); $('#guest-name').reportValidity(); return; }
    const response = { name, attendance: data.get('attendance'), guests: data.get('guests') || '0', meal: data.get('meal') || 'No aplica', message: String(data.get('message') || '').trim(), date: new Date().toISOString() };
    if (whatsapp) {
      const text = `Hola, soy ${name}. Asistencia: ${response.attendance}. Acompañantes: ${response.guests}. Menú: ${response.meal}. Mensaje: ${response.message || 'Con mucho cariño.'}`;
      window.open('https://wa.me/' + c.whatsapp + '?text=' + encodeURIComponent(text), '_blank', 'noopener,noreferrer');
      $('#rsvp-status').textContent = 'Envía el mensaje en WhatsApp para completar tu confirmación.';
    } else {
      try {
        localStorage.setItem(c.storageKey, JSON.stringify(response));
        $('#rsvp-status').textContent = 'Respuesta guardada en este navegador. No se ha enviado a los novios.';
      } catch { $('#rsvp-status').textContent = 'No se pudo guardar: el navegador bloqueó el almacenamiento local.'; }
    }
  });
})();
