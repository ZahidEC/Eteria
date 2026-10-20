/* ========================================================================
  FREE FIRE PARTY — FUNCIONALIDAD
  01. Datos de la invitación
  02. Menú y efectos
  03. Arsenal y cofres
  04. Reloj, calendario y mapa
  05. Galería y confirmación
======================================================================== */
'use strict';
(() => {
  const C = window.FIESTA_CONFIG || {};
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const date = new Date(C.fecha || '2027-03-13T16:00:00-06:00');
  const validDate = !Number.isNaN(date.getTime());
  const spanishDate = validDate ? new Intl.DateTimeFormat('es-MX', {weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'America/Mexico_City'}).format(date).toLocaleUpperCase('es-MX') : 'FECHA POR DEFINIR';
  const spanishTime = validDate ? new Intl.DateTimeFormat('es-MX', {hour:'2-digit',minute:'2-digit',hour12:true,timeZone:'America/Mexico_City'}).format(date).toUpperCase() : 'HORA POR DEFINIR';
  const safeName = String(C.nombre || 'TU NOMBRE').trim().slice(0,90);
  const safeAge = String(C.edad ?? '?').slice(0,3);
  $$('[data-celebrant]').forEach(el => el.textContent = safeName);
  $$('[data-age]').forEach(el => el.textContent = safeAge);
  $$('[data-full-date]').forEach(el => el.textContent = spanishDate);
  $$('[data-time]').forEach(el => el.textContent = spanishTime);
  $$('[data-venue]').forEach(el => el.textContent = C.lugar || 'LUGAR POR DEFINIR');
  $$('[data-address]').forEach(el => el.textContent = C.direccion || 'Dirección por definir');
  document.title = `FREE FIRE · ${safeName} cumple ${safeAge} · ¡BOOYAH!`;
  $('.tag-muted').textContent = `TEMPORADA 01 / ${validDate ? date.getFullYear() : 'PRÓXIMAMENTE'}`;

  let soundEnabled = false;
  let audioCtx = null;
  let currentModal = null;
  let toastTimeout;
  function toast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => el.classList.remove('show'), 4000);
  }
  function sound(freq = 650, duration = .12, type = 'sine', volume = .035) {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      audioCtx ||= new AudioCtx();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const oscillator = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(volume, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, audioCtx.currentTime + duration);
      oscillator.connect(gain).connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) { /* Audio opcional. La página continúa funcionando. */ }
  }
  $('#soundToggle').addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    $('#soundText').textContent = soundEnabled ? 'SONIDO ON' : 'SONIDO OFF';
    $('#soundToggle').setAttribute('aria-label', soundEnabled ? 'Desactivar sonidos' : 'Activar sonidos');
    if (soundEnabled) { sound(840, .13); toast('EFECTOS DE SONIDO ACTIVADOS'); }
    else toast('EFECTOS DE SONIDO DESACTIVADOS');
  });

  // ----- MENÚ MÓVIL -----
  const menu = $('#menuToggle');
  const nav = $('#navLinks');
  const closeMenu = () => { nav.classList.remove('show'); menu.setAttribute('aria-expanded','false'); };
  menu.addEventListener('click', () => {
    const open = nav.classList.toggle('show');
    menu.setAttribute('aria-expanded', String(open));
    sound(460,.06);
  });
  $$('.nav-links a').forEach(a => a.addEventListener('click',closeMenu));
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-links,.menu-toggle')) closeMenu();
  });
  $('#backToTop').addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));

  // ----- EFECTO DE CHISPAS -----
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function makeEmber() {
    if (document.hidden || reducedMotion) return;
    const el = document.createElement('span');
    el.className = 'ember';
    el.style.setProperty('--x',`${Math.random() * 100}%`);
    el.style.setProperty('--y',`${70 + Math.random() * 28}%`);
    el.style.setProperty('--size',`${2 + Math.random() * 3}px`);
    el.style.setProperty('--duration',`${3 + Math.random() * 4}s`);
    $('#particles').appendChild(el);
    setTimeout(()=>el.remove(),7500);
  }
  if (!reducedMotion) setInterval(makeEmber,550);
  function confetti(count = 130) {
    if (reducedMotion) return;
    const colors = ['#ff9d3f','#ffcd64','#f9f5ea','#79dfb4','#ef6728','#7cbcff'];
    for(let i=0;i<count;i++) {
      const p = document.createElement('i');
      p.className='confetti';
      p.style.setProperty('--x',`${Math.random()*100}%`);
      p.style.setProperty('--color',colors[Math.floor(Math.random()*colors.length)]);
      p.style.setProperty('--size',`${5 + Math.random()*9}px`);
      p.style.setProperty('--rotate',`${Math.random()*360}deg`);
      p.style.setProperty('--duration',`${2.5+Math.random()*3}s`);
      document.body.appendChild(p);
      setTimeout(()=>p.remove(),6000);
    }
  }

  // ----- EQUIPAMIENTO -----
  $$('.weapon-card').forEach(card => card.addEventListener('click', () => {
    $$('.weapon-card').forEach(item => {
      item.classList.remove('selected');
      item.setAttribute('aria-pressed','false');
      $('.weapon-select',item).textContent = 'EQUIPAR +';
    });
    card.classList.add('selected');
    card.setAttribute('aria-pressed','true');
    $('.weapon-select',card).textContent='EQUIPADO ✓';
    $('#chosenLoadout').textContent=`EQUIPADO: ${card.dataset.itemName} — ${card.dataset.itemStat}`;
    sound(590,.12,'triangle');
    toast(`${card.dataset.itemName} — ¡EQUIPADO!`);
  }));

  // ----- 3 DROPS DE SUMINISTROS -----
  const acquired = new Set();
  const drops = $$('.loot-box');
  const rewardButton = $('#openReward');
  drops.forEach((drop,i) => drop.addEventListener('click', () => {
    if (acquired.has(i)) { sound(450,.08); toast('ESTE SUMINISTRO YA FUE RECLAMADO ✓'); return; }
    acquired.add(i);
    drop.classList.add('opened');
    drop.setAttribute('aria-label',`Suministro ${i + 1} reclamado`);
    $('.loot-spotlight',drop).textContent='✓';
    $('.loot-label',drop).textContent='INSIGNIA RECLAMADA ✓';
    $('.loot-image',drop).src='assets/icons/diamond.svg';
    $('#lootCount').textContent=String(acquired.size).padStart(2,'0');
    $('#lootProgress').style.width=`${acquired.size/3*100}%`;
    sound(750+i*150,.18,'triangle');
    if (acquired.size===3) {
      rewardButton.disabled=false;
      $('#rewardLocked').classList.add('unlocked');
      $('#rewardTitle').textContent='¡RECOMPENSA LEGENDARIA DESBLOQUEADA!';
      rewardButton.innerHTML='ABRIR RECOMPENSA <span>↗</span>';
      setTimeout(()=>{ confetti(60); sound(1000,.23); toast('¡CONSEGUISTE LAS 3 INSIGNIAS! ABRE TU RECOMPENSA'); },400);
    } else toast(`¡INSIGNIA RECUPERADA! ${acquired.size} DE 3`);
  }));
  rewardButton.addEventListener('click',()=>{
    if (acquired.size!==3) return;
    openModal('#victoryModal');
    confetti(160);
    sound(1000,.2,'triangle');
    setTimeout(()=>sound(1300,.22,'triangle'),140);
  });

  // ----- TEMPORIZADOR -----
  const pad = (n,len=2)=>String(n).padStart(len,'0');
  function updateCountdown() {
    const ms = validDate ? date.getTime()-Date.now() : 0;
    const t = Math.max(0,Math.floor(ms/1000));
    $('#days').textContent=pad(Math.floor(t/86400),3);
    $('#hours').textContent=pad(Math.floor(t%86400/3600));
    $('#minutes').textContent=pad(Math.floor(t%3600/60));
    $('#seconds').textContent=pad(t%60);
    if (validDate && ms <= 0) $('#timerNote').textContent='¡LA MISIÓN COMENZÓ! ¡BOOYAH!';
  }
  updateCountdown();
  setInterval(updateCountdown,1000);

  // ----- CREAR ARCHIVO DE CALENDARIO ICS (sin servicios externos) -----
  function icsDate(d) { return d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,''); }
  const icsEscape = (text) => String(text).replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
  $('#calendarBtn').addEventListener('click', () => {
    if (!validDate) return toast('Configura primero una fecha válida en js/config.js');
    const end = new Date(date.getTime() + (Number(C.duracionHoras)||4)*3600e3);
    const content = [
      'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//FREE FIRE BIRTHDAY//ES','CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',`UID:ff-party-${date.getTime()}@invitacion.local`,
      `DTSTAMP:${icsDate(new Date())}`,`DTSTART:${icsDate(date)}`,`DTEND:${icsDate(end)}`,
      `SUMMARY:${icsEscape(C.tituloCalendario||`Cumpleaños de ${safeName}`)}`,
      `LOCATION:${icsEscape(`${C.lugar||''} - ${C.direccion||''}`)}`,
      `DESCRIPTION:${icsEscape(`¡Estás invitado a la celebración de ${safeName}! ¡BOOYAH!`)}`,
      'END:VEVENT','END:VCALENDAR'
    ].join('\r\n');
    const url = URL.createObjectURL(new Blob([content],{type:'text/calendar;charset=utf-8'}));
    const a = document.createElement('a'); a.href=url;a.download='cumpleanos-free-fire.ics';
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    sound(680,.12);
    toast('CALENDARIO DESCARGADO. ÁBRELO PARA GUARDAR EL EVENTO.');
  });

  // ----- GOOGLE MAPS -----
  const maps = $('#mapsBtn');
  if (C.googleMaps && /^https:\/\//.test(C.googleMaps)) {
    maps.href=C.googleMaps;
    $('#mapsHint').textContent='Pulsa el botón para abrir la ruta en Google Maps.';
  } else {
    maps.removeAttribute('target');
    maps.addEventListener('click', e => {
      e.preventDefault();toast('AGREGA EL ENLACE DE GOOGLE MAPS EN js/config.js');
    });
  }

  // ----- MODALES + GALERÍA -----
  function openModal(selector) {
    const modal = $(selector);
    if (!modal) return;
    currentModal=modal;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
    $('.modal-close',modal)?.focus();
  }
  function closeModal() {
    if(!currentModal)return;
    currentModal.classList.remove('active');
    currentModal.setAttribute('aria-hidden','true');
    currentModal=null;
    document.body.style.overflow='';
  }
  $$('[data-close-modal]').forEach(el=>el.addEventListener('click',closeModal));
  document.addEventListener('keydown', e => {
    if(e.key==='Escape' && currentModal)closeModal();
    if(currentModal?.id==='galleryModal') {
      if(e.key==='ArrowRight') moveGallery(1);
      if(e.key==='ArrowLeft') moveGallery(-1);
    }
  });
  const gallerySources=$$('.gallery-item img').map(img=>({src:img.getAttribute('src'),alt:img.alt}));
  let galleryIndex=0;
  function moveGallery(offset) {
    galleryIndex=(galleryIndex+offset+gallerySources.length)%gallerySources.length;
    $('#galleryLarge').src=gallerySources[galleryIndex].src;
    $('#galleryLarge').alt=gallerySources[galleryIndex].alt;
    $('#galleryIndex').textContent=`${pad(galleryIndex+1)} / ${pad(gallerySources.length)}`;
    sound(460,.05);
  }
  $$('.gallery-item').forEach((el,i)=>el.addEventListener('click',()=>{galleryIndex=i;moveGallery(0);openModal('#galleryModal');}));
  $('#galleryPrev').addEventListener('click',()=>moveGallery(-1));
  $('#galleryNext').addEventListener('click',()=>moveGallery(1));

  // ----- WHATSAPP RSVP -----
  $('#rsvpForm').addEventListener('submit', e => {
    e.preventDefault();
    const form=$('#rsvpForm');
    if(!form.reportValidity())return;
    const name=$('#guestName').value.trim();
    const yes=$('input[name="attendance"]:checked')?.value==='si';
    const guests=$('#companions').value;
    const msg=$('#guestMessage').value.trim();
    const text=[`🎮 *FREE FIRE PARTY — ${safeName}*`,`👤 Invitado: *${name}*`,`✅ Asistencia: *${yes ? '¡Sí, voy a estar! 🪂' : 'No podré asistir'}*`, `👥 Acompañantes: ${guests}`, ...(msg ? [`💬 Mensaje: ${msg}`] : []),`📅 ${spanishDate} · ${spanishTime}`,`📍 ${C.lugar||'Lugar por definir'}`,'🔥 ¡BOOYAH!'].join('\n');
    const phone=String(C.whatsapp||'').replace(/\D/g,'');
    const url=phone ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}` : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    sound(880,.18);
    // No se afirma que el mensaje se haya enviado. WhatsApp solicita confirmación al usuario.
    const popup=window.open(url,'_blank');
    if(popup) { try {popup.opener=null;} catch(error) { /* El navegador puede bloquear esta asignación. */ } }
    if(!popup){
      if(navigator.clipboard?.writeText)navigator.clipboard.writeText(text).then(()=>toast('COPIAMOS TU RESPUESTA. ENVÍALA POR WHATSAPP.')).catch(()=>toast('PERMITE VENTANAS EMERGENTES PARA ABRIR WHATSAPP.'));
      else toast('PERMITE VENTANAS EMERGENTES PARA ABRIR WHATSAPP.');
    } else toast('WHATSAPP ABIERTO. REVISA Y ENVÍA TU CONFIRMACIÓN.');
  });
})();
