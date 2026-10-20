/* UN AMOR DE CUENTO · Interacciones. Edita los datos en config.js. */
(() => {
  'use strict';
  const c = window.WEDDING;
  let activeChapter = 0;
  const $ = s => document.querySelector(s);
  const fill = (s, value) => document.querySelectorAll(s).forEach(el => el.textContent = value);
  const make = (tag, cls, text) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text !== undefined) el.textContent = text;
    return el;
  };
  const asset = name => 'assets/images/' + name;
  function safeUrl(value) {
    try { const url = new URL(value); return url.protocol === 'https:' ? url.href : ''; } catch { return ''; }
  }
  function externalLink(label, url) {
    const link = make('a', 'text-link', label);
    link.href = safeUrl(url); link.target = '_blank'; link.rel = 'noopener noreferrer';
    return link;
  }

  // 01 · Datos, fecha y cuenta regresiva.
  fill('[data-bride]', c.bride); fill('[data-groom]', c.groom);
  fill('[data-monogram]', `${c.bride[0]} / ${c.groom[0]}`);
  fill('[data-venue]', c.venue); fill('[data-location]', c.location); fill('[data-deadline]', c.deadline);
  document.title = `Un amor de cuento · ${c.bride} & ${c.groom}`;
  $('#map-link').href = safeUrl(c.mapsUrl);
  const date = new Date(c.date);
  const format = options => new Intl.DateTimeFormat('es-MX', { timeZone: 'America/Mexico_City', ...options }).format(date);
  fill('[data-date-short]', format({ day: '2-digit', month: '2-digit', year: 'numeric' }).replaceAll('/', ' · '));
  fill('[data-date-long]', format({ day: 'numeric', month: 'long', year: 'numeric' }));
  $('.date-plaque > span').textContent = format({ weekday: 'long' }).toUpperCase();
  $('.date-plaque strong').textContent = format({ day: 'numeric' });
  $('.date-plaque > div').replaceChildren(make('span', '', format({ month: 'long' }).toUpperCase()), make('span', '', format({ year: 'numeric' })));
  function countdown() {
    const diff = Math.max(0, date.getTime() - Date.now());
    const values = [Math.floor(diff / 86400000), Math.floor(diff / 3600000) % 24, Math.floor(diff / 60000) % 60, Math.floor(diff / 1000) % 60];
    values.forEach((n, i) => $('#' + ['days', 'hours', 'minutes', 'seconds'][i]).textContent = String(n).padStart(2, '0'));
    if (!diff) $('#countdown-note').textContent = 'Nuestro para siempre ya comenzó.';
  }
  countdown(); setInterval(countdown, 1000);

  // 02 · Navegación y modales con manejo nativo del foco y Escape.
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
  document.querySelectorAll('nav a').forEach(el => el.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  function openDialog(id) { $(id).showModal(); document.body.classList.add('modal-open'); }
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelector('.close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => document.body.classList.remove('modal-open'));
  });

  // 03 · Historia y agenda generadas desde la configuración.
  c.agenda.forEach(item => {
    const row = make('article', 'agenda-item reveal');
    row.append(make('time', '', item.time), make('h3', '', item.title), make('p', '', item.text));
    $('#agenda').append(row);
  });

  // 04 · Galería completa: botones, teclado y deslizamiento táctil.
  let index = 0;
  function showPhoto(i) {
    index = (i + c.photos.length) % c.photos.length;
    $('#gallery-image').src = asset(c.photos[index].image);
    $('#gallery-image').alt = c.photos[index].title;
    $('#gallery-caption').textContent = `${c.photos[index].title} · ${index + 1} / ${c.photos.length}`;
  }
  function openGallery(i) { showPhoto(i); openDialog('#gallery-dialog'); }
  c.photos.forEach((item, i) => {
    const button = make('button', 'gallery-photo reveal'); button.type = 'button';
    button.setAttribute('aria-label', 'Ampliar: ' + item.title); button.setAttribute('aria-haspopup', 'dialog');
    const image = make('img'); image.src = asset(item.image); image.alt = item.title; image.loading = 'lazy'; image.width = 1122; image.height = 1402;
    button.append(image, make('span', '', `${String(i + 1).padStart(2, '0')} / ${item.title}`));
    button.addEventListener('click', () => openGallery(i)); $('#gallery-grid').append(button);
  });
  $('#story-photo').addEventListener('click', () => openGallery(c.moments[activeChapter].photoIndex));
  $('#gallery-prev').addEventListener('click', () => showPhoto(index - 1));
  $('#gallery-next').addEventListener('click', () => showPhoto(index + 1));
  $('#gallery-dialog').addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); showPhoto(index - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); showPhoto(index + 1); }
  });
  let touch = null;
  $('#gallery-stage').addEventListener('touchstart', e => { touch = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null; }, { passive: true });
  $('#gallery-stage').addEventListener('touchend', e => {
    if (!touch || !e.changedTouches.length) return;
    const dx = e.changedTouches[0].clientX - touch.x, dy = e.changedTouches[0].clientY - touch.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) showPhoto(index + (dx < 0 ? 1 : -1));
    touch = null;
  }, { passive: true });

  // 05 · Mesa de regalos. Solo se habilitan enlaces reales configurados.
  const tabs = [...document.querySelectorAll('[data-tab]')];
  function giftTab(type) {
    const panel = $('#gift-panel'); panel.replaceChildren();
    tabs.forEach(tab => {
      const selected = tab.dataset.tab === type;
      tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1;
    });
    panel.setAttribute('aria-labelledby', 'tab-' + type);
    $('#gift-title').textContent = { stores: 'Mesa de regalos', bank: 'Un regalo con cariño', honeymoon: 'Nuestra luna de miel' }[type];
    if (type === 'stores') {
      if (!c.gifts.stores.length) panel.append(make('p', 'pending-message', 'Pronto compartiremos nuestras mesas de regalos.'));
      c.gifts.stores.forEach(store => {
        const row = make('article', 'registry'); row.append(make('h3', '', store.name));
        if (store.event) row.append(make('p', '', 'Número de evento: ' + store.event));
        if (safeUrl(store.url)) row.append(externalLink('Visitar mesa de regalos ↗', store.url));
        else row.append(make('p', 'pending-message', 'El enlace de esta mesa estará disponible próximamente.'));
        panel.append(row);
      });
    } else if (type === 'bank') {
      const bank = c.gifts.bank;
      const clabe = String(bank.clabe || '').replace(/\s/g, '');
      if (!bank.holder || !bank.bank || !/^\d{18}$/.test(clabe)) {
        panel.append(make('h3', '', 'Un detalle para nuestro comienzo'), make('p', 'pending-message', 'Pronto compartiremos los datos para transferencia.'));
      } else {
        const list = make('dl', 'bank-list');
        [['Titular', bank.holder], ['Banco', bank.bank], ['CLABE', clabe], ['Referencia', bank.reference]].forEach(([label, value]) => {
          if (!value) return;
          const row = make('div'); row.append(make('dt', '', label), make('dd', '', value)); list.append(row);
        });
        const copy = make('button', 'button copy-button', 'Copiar CLABE'); copy.type = 'button';
        const status = make('p', 'copy-status'); status.setAttribute('role', 'status');
        copy.addEventListener('click', async () => {
          try { await navigator.clipboard.writeText(clabe); status.textContent = 'CLABE copiada.'; }
          catch { status.textContent = 'No se pudo copiar. Puedes seleccionar la CLABE y copiarla manualmente.'; }
        });
        panel.append(list, copy, status);
      }
    } else {
      const trip = c.gifts.honeymoon;
      panel.append(make('h3', '', trip.title), make('p', '', trip.description));
      if (safeUrl(trip.url)) panel.append(externalLink('Ver fondo de luna de miel ↗', trip.url));
      else panel.append(make('p', 'pending-message', 'El enlace para acompañar este sueño estará disponible próximamente.'));
    }
  }
  document.querySelectorAll('[data-gift]').forEach(button => button.addEventListener('click', () => {
    giftTab(button.dataset.gift); openDialog('#gift-dialog');
  }));
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => giftTab(tab.dataset.tab));
    tab.addEventListener('keydown', e => {
      let next;
      if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
      if (e.key === 'ArrowLeft') next = (i + tabs.length - 1) % tabs.length;
      if (e.key === 'Home') next = 0;
      if (e.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { e.preventDefault(); giftTab(tabs[next].dataset.tab); tabs[next].focus(); }
    });
  });

  // 06 · Archivo de calendario local (.ics); sin servicios externos.
  function icsText(value) { return String(value).replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;'); }
  function icsDate(value) { return value.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z'); }
  $('#calendar-button').addEventListener('click', () => {
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Un amor de cuento//Invitacion//ES', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT', `UID:${date.getTime()}-cuento@wedding.local`, `DTSTAMP:${icsDate(new Date())}`, `DTSTART:${icsDate(date)}`, `DTEND:${icsDate(new Date(date.getTime() + c.durationHours * 3600000))}`, `SUMMARY:${icsText('Boda de ' + c.bride + ' y ' + c.groom)}`, `LOCATION:${icsText(c.venue + ', ' + c.location)}`, 'DESCRIPTION:Celebramos nuestro para siempre.', 'END:VEVENT', 'END:VCALENDAR'];
    const blob = new Blob([lines.join('\r\n') + '\r\n'], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob); const a = make('a'); a.href = url; a.download = 'nuestra-boda.ics'; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
  });

  // 07 · Efectos respetuosos con movimiento reducido.
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reduced.matches;
  function setEffects(value) {
    paused = value; document.body.classList.toggle('effects-paused', value);
    $('#effects-toggle').textContent = value ? 'Activar efectos' : 'Pausar efectos';
    $('#effects-toggle').setAttribute('aria-pressed', String(value));
    if (value) document.querySelectorAll('.pending').forEach(el => el.classList.remove('pending'));
  }
  setEffects(paused);
  $('#effects-toggle').addEventListener('click', () => setEffects(!paused));
  reduced.addEventListener('change', e => setEffects(e.matches));
  if ('IntersectionObserver' in window && !paused) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.remove('pending'); observer.unobserve(entry.target); }
    }), { threshold: .08 });
    document.querySelectorAll('.reveal').forEach(el => { el.classList.add('pending'); observer.observe(el); });
  }
  let scheduled = false;
  function progress() {
    const max = document.documentElement.scrollHeight - innerHeight;
    $('#reading-progress').style.transform = `scaleX(${max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0})`;
    scheduled = false;
  }
  addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(progress); } }, { passive: true });
  addEventListener('resize', progress); progress();

  // 08 · RSVP: almacenamiento local o mensaje revisable en WhatsApp.
  const form = $('#rsvp-form');
  const whatsapp = /^\d{10,15}$/.test(c.whatsapp);
  if (whatsapp) $('#form-note').textContent = 'Se abrirá WhatsApp para que revises y envíes tu respuesta.';
  form.addEventListener('change', () => {
    const declined = form.elements.attendance.value === 'No'; $('#guests').disabled = declined; $('#meal').disabled = declined;
  });
  $('#guest-name').addEventListener('input', () => $('#guest-name').setCustomValidity(''));
  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(form), name = String(data.get('name') || '').trim();
    if (!name) { $('#guest-name').setCustomValidity('Escribe tu nombre.'); $('#guest-name').reportValidity(); return; }
    const response = { name, attendance: data.get('attendance'), guests: data.get('guests') || '0', meal: data.get('meal') || 'No aplica', message: String(data.get('message') || '').trim(), savedAt: new Date().toISOString() };
    if (whatsapp) {
      const text = `Hola, soy ${name}. Asistencia: ${response.attendance}. Acompañantes: ${response.guests}. Menú: ${response.meal}. Mensaje: ${response.message || 'Con cariño.'}`;
      window.open('https://wa.me/' + c.whatsapp + '?text=' + encodeURIComponent(text), '_blank', 'noopener,noreferrer');
      $('#rsvp-status').textContent = 'Envía el mensaje en WhatsApp para completar tu confirmación.';
    } else {
      try { localStorage.setItem(c.storageKey, JSON.stringify(response)); $('#rsvp-status').textContent = 'Respuesta guardada en este navegador. No se ha enviado a los novios.'; }
      catch { $('#rsvp-status').textContent = 'No se pudo guardar: el navegador bloqueó el almacenamiento local.'; }
    }
  });
  // 09 · Capítulos del libro. photoIndex corresponde al índice en photos.
  function showChapter(next, animate = true) {
    activeChapter = (next + c.moments.length) % c.moments.length;
    const chapter = c.moments[activeChapter];
    const photo = c.photos[chapter.photoIndex];
    $('#chapter-image').src = asset(photo.image);
    $('#chapter-image').alt = photo.title;
    $('#photo-caption').textContent = photo.title;
    $('#chapter-number').textContent = 'CAPÍTULO ' + (activeChapter + 1);
    $('#chapter-year').textContent = chapter.year;
    $('#chapter-title').textContent = chapter.title;
    $('#chapter-text').textContent = chapter.text;
    $('#page-count').textContent = String(activeChapter + 1).padStart(2, '0') + ' / ' + String(c.moments.length).padStart(2, '0');
    $('#book-body').classList.remove('turning');
    if (animate && !paused) requestAnimationFrame(() => requestAnimationFrame(() => $('#book-body').classList.add('turning')));
  }
  $('#page-prev').addEventListener('click', () => showChapter(activeChapter - 1));
  $('#page-next').addEventListener('click', () => showChapter(activeChapter + 1));
  showChapter(0, false);
})();
