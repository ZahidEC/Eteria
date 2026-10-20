const cfg = window.invitationConfig;
const qs = (s, p = document) => p.querySelector(s);
const qsa = (s, p = document) => [...p.querySelectorAll(s)];

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function hydrateContent() {
  setText('heroName', cfg.celebrantName);
  setText('heroAge', cfg.age);
  setText('briefDate', cfg.dateText);
  setText('briefTime', cfg.timeText);
  setText('briefVenue', cfg.venueText);
  setText('operationName', cfg.operationName);
  setText('profileName', cfg.celebrantName);
  setText('profileLevel', cfg.levelText);
  qs('#mapBtn').href = cfg.mapsUrl;
}

function initMenu() {
  const toggle = qs('.menu-toggle');
  const nav = qs('.nav');
  toggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  qsa('.nav a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    toggle?.setAttribute('aria-expanded', 'false');
  }));
}

function startCountdown() {
  const target = new Date(cfg.eventISO).getTime();
  const update = () => {
    const now = Date.now();
    const diff = Math.max(0, target - now);
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    setText('days', String(days).padStart(2, '0'));
    setText('hours', String(hours).padStart(2, '0'));
    setText('minutes', String(minutes).padStart(2, '0'));
    setText('seconds', String(seconds).padStart(2, '0'));
  };
  update();
  setInterval(update, 1000);
}

function initCalendar() {
  qs('#calendarBtn')?.addEventListener('click', () => {
    const start = new Date(cfg.eventISO).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const end = new Date(cfg.eventEndISO).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Operación Cumpleaños de ' + cfg.celebrantName)}&dates=${start}/${end}&details=${encodeURIComponent('Únete a la misión y celebra este gran cumpleaños.')}&location=${encodeURIComponent(cfg.venueText)}`;
    window.open(url, '_blank');
  });
}

function initLoadout() {
  const image = qs('#loadoutImage');
  const title = qs('#loadoutTitle');
  const desc = qs('#loadoutDesc');
  qsa('.loadout-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      qsa('.loadout-btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      image.src = btn.dataset.image;
      title.textContent = btn.dataset.title;
      desc.textContent = btn.dataset.desc;
    });
  });
}

function spawnBurst() {
  for (let i = 0; i < 24; i++) {
    const piece = document.createElement('span');
    piece.className = 'fx-piece';
    const size = 6 + Math.random() * 8;
    piece.style.cssText = `
      position:fixed;left:${50 + (Math.random() * 20 - 10)}vw;top:45vh;
      width:${size}px;height:${size}px;border-radius:2px;
      background:${Math.random() > .5 ? '#c9ff4f' : '#ff8c1e'};
      pointer-events:none;z-index:99;opacity:1;
      transform:translate(0,0) rotate(0deg);
      transition:transform 1.2s ease, opacity 1.2s ease;
    `;
    document.body.appendChild(piece);
    requestAnimationFrame(() => {
      piece.style.transform = `translate(${(Math.random() - .5) * 420}px, ${(Math.random() - .2) * 360}px) rotate(${Math.random() * 540}deg)`;
      piece.style.opacity = '0';
    });
    setTimeout(() => piece.remove(), 1300);
  }
}

function initMission() {
  const opened = new Set();
  const countEl = qs('#crateCount');
  const textEl = qs('#missionText');
  const rewardBtn = qs('#rewardBtn');
  const modal = qs('#rewardModal');

  qsa('.crate-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.crate;
      if (opened.has(id)) return;
      opened.add(id);
      card.classList.add('is-open');
      card.querySelector('strong').textContent = 'Insignia obtenida';
      card.querySelector('small').textContent = 'Suministro asegurado';
      countEl.textContent = opened.size;
      textEl.textContent = opened.size === 3
        ? '¡Operación completa! Ya puedes desbloquear la orden final.'
        : `Llevas ${opened.size} insignia${opened.size > 1 ? 's' : ''}. Sigue abriendo suministros.`;
      spawnBurst();
      if (opened.size === 3) rewardBtn.disabled = false;
    });
  });

  rewardBtn?.addEventListener('click', () => {
    modal.showModal();
    spawnBurst();
  });
}

function initGallery() {
  const modal = qs('#galleryModal');
  const modalImage = qs('#modalImage');
  const modalTitle = qs('#modalTitle');
  qsa('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      modalImage.src = item.dataset.image;
      modalTitle.textContent = item.dataset.title;
      modal.showModal();
    });
  });
}

function initModals() {
  qsa('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('dialog').close());
  });
  qsa('dialog').forEach(d => {
    d.addEventListener('click', (e) => {
      const rect = d.querySelector('.modal__content').getBoundingClientRect();
      const inside = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
      if (!inside) d.close();
    });
  });
}

function initRSVP() {
  qs('#rsvpForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = qs('#guestName').value.trim();
    const status = qs('#guestStatus').value;
    const companions = qs('#guestCompanions').value;
    const message = qs('#guestMessage').value.trim();
    if (!name) return;
    const messageText = `Hola, vengo de la invitación de ${cfg.celebrantName}.

*Nombre:* ${name}
*Asistencia:* ${status}
*Acompañantes:* ${companions}
*Mensaje:* ${message || 'Sin mensaje'}`;
    window.open(`https://wa.me/${cfg.whatsappNumber}?text=${encodeURIComponent(messageText)}`, '_blank');
  });
}

function initSoundToggle() {
  const btn = qs('#soundToggle');
  let enabled = false;
  btn?.addEventListener('click', () => {
    enabled = !enabled;
    btn.textContent = enabled ? 'Efectos activados' : 'Activar efectos';
    if (enabled) spawnBurst();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  hydrateContent();
  initMenu();
  startCountdown();
  initCalendar();
  initLoadout();
  initMission();
  initGallery();
  initModals();
  initRSVP();
  initSoundToggle();
});
