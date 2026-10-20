'use strict';
(() => {
  const cfg = window.INVITACION || {};
  const $ = (q, el = document) => el.querySelector(q);
  const $$ = (q, el = document) => Array.from(el.querySelectorAll(q));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const eventDate = new Date(cfg.fecha || '2026-11-21T16:00:00');
  const dateOK = !Number.isNaN(eventDate.getTime());
  let audioContext = null;
  let soundsOn = false;
  let toastTimer;

  function beep(freq=520, duration=.1, type='sine', delay=0) {
    if (!soundsOn) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      audioContext = audioContext || new AC();
      if (audioContext.state === 'suspended') audioContext.resume().catch(()=>{});
      const osc = audioContext.createOscillator(); const gain=audioContext.createGain();
      const t=audioContext.currentTime+delay;
      osc.type=type; osc.frequency.setValueAtTime(freq,t); osc.frequency.exponentialRampToValueAtTime(Math.max(1,freq*.71),t+duration);
      gain.gain.setValueAtTime(.0001,t); gain.gain.exponentialRampToValueAtTime(.09,t+.012); gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
      osc.connect(gain);gain.connect(audioContext.destination);osc.start(t);osc.stop(t+duration+.01);
    } catch(e) { /* Audio opcional */ }
  }
  function notification(msg, warn=false) {
    const el=$('#toast');if(!el) return;
    el.textContent=msg;el.classList.toggle('warning',warn);el.classList.add('visible');
    clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),3400);
  }
  function confetti(n=90) {
    if (reduceMotion) return;
    const colors=['#fff342','#36eaff','#ff6dc2','#9cf36b','#ffffff','#a68cf9'];
    for(let i=0;i<n;i++) {
      const c=document.createElement('i'); c.className='confetti-piece';
      c.style.left=Math.random()*100+'vw';c.style.top='-30px';c.style.backgroundColor=colors[i%colors.length];
      c.style.setProperty('--spin',(Math.random()*1100-550)+'deg');
      c.style.setProperty('--drift',(Math.random()*340-170)+'px');
      c.style.animationDuration=(2+Math.random()*2.2)+'s';c.style.animationDelay=(Math.random()*.65)+'s';
      c.style.width=(6+Math.random()*9)+'px';c.style.height=(8+Math.random()*12)+'px';
      document.body.appendChild(c);c.addEventListener('animationend',()=>c.remove(),{once:true});
    }
  }
  function closeMenu() { $('#nav')?.classList.remove('open'); $('#menuToggle')?.setAttribute('aria-expanded','false'); document.body.classList.remove('menu-open'); }
  $('#menuToggle')?.addEventListener('click',()=>{
    const isOpen=$('#nav').classList.toggle('open'); $('#menuToggle').setAttribute('aria-expanded',String(isOpen));document.body.classList.toggle('menu-open',isOpen);
    beep(540,.07);
  });
  $$('#nav a').forEach(a=>a.addEventListener('click',closeMenu));
  document.addEventListener('click',ev=>{if(!ev.target.closest('.header') && $('#nav')?.classList.contains('open'))closeMenu();});
  $('#soundToggle')?.addEventListener('click',()=>{
    soundsOn=!soundsOn;$('#soundToggle').setAttribute('aria-pressed',String(soundsOn));$('.sound-status').textContent=soundsOn?'ON':'OFF';
    if(soundsOn){beep(530,.1);beep(860,.19,'sine',.13);} notification(soundsOn?'🔊 Efectos de sonido activados':'🔇 Efectos de sonido desactivados');
  });
  // Datos configurables
  $$('[data-config]').forEach(el=>{const key=el.dataset.config;if(cfg[key]!==undefined && cfg[key]!==null)el.textContent=String(cfg[key]);});
  if(dateOK) {
    const fmtDate=new Intl.DateTimeFormat('es-MX',{month:'long',year:'numeric'}).format(eventDate);
    $('#dateBig').textContent=String(eventDate.getDate());
    $('#dateLabel').textContent=fmtDate.toUpperCase();
    const hours=eventDate.getHours();const mins=String(eventDate.getMinutes()).padStart(2,'0');
    $('#timeBig').textContent=`${hours%12||12}:${mins}`;
    $('#timeLabel').textContent=`${hours>=12?'PM':'AM'} · HORA DE CAÍDA`;
    $('#locationTime').textContent=`${hours%12||12}:${mins} ${hours>=12?'PM':'AM'}`;
    $('#footerYear').textContent=eventDate.getFullYear();
  }
  if(cfg.mapaURL && /^https?:\/\//i.test(cfg.mapaURL)) $('#mapButton').href=cfg.mapaURL;
  else $('#mapButton').href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(`${cfg.lugar||''} ${cfg.direccion||''} ${cfg.ciudad||''}`);
  // Calendario .ics
  function icsDate(d) { return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}T${String(d.getHours()).padStart(2,'0')}${String(d.getMinutes()).padStart(2,'0')}00`; }
  function icsEscape(v) {return String(v).replace(/\\/g,'\\\\').replace(/,/g,'\\,').replace(/;/g,'\\;').replace(/\n/g,'\\n');}
  $('#calendarButton')?.addEventListener('click', ev=>{
    ev.preventDefault();if(!dateOK){notification('Revisa la fecha en js/config.js',true);return;}
    const end=new Date(eventDate.getTime()+Math.max(1,Number(cfg.duracionHoras)||4)*3600000);
    const content=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Party Royale//Invitacion ES//EN','BEGIN:VEVENT',`UID:party-royale-${eventDate.getTime()}@invitacion`,`DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'')}`,`DTSTART:${icsDate(eventDate)}`,`DTEND:${icsDate(end)}`,`SUMMARY:${icsEscape(cfg.nombreEvento||'Fiesta de cumpleaños')}`,`LOCATION:${icsEscape(`${cfg.lugar}, ${cfg.direccion}`)}`,`DESCRIPTION:${icsEscape('¡Te esperamos en la fiesta de '+cfg.nombre+'!')}`,'END:VEVENT','END:VCALENDAR'].join('\r\n');
    const blob=new Blob([content],{type:'text/calendar;charset=utf-8'});const url=URL.createObjectURL(blob);
    const link=document.createElement('a');link.href=url;link.download='fiesta-battle-royale.ics';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);
    notification('📅 ¡Evento agregado a tus descargas!');beep(750,.17);
  });
  function updateCountdown() {
    if(!dateOK)return;const ms=Math.max(0,eventDate.getTime()-Date.now());const total=Math.floor(ms/1000);
    const vals=[Math.floor(total/86400),Math.floor(total/3600)%24,Math.floor(total/60)%60,total%60];
    ['days','hours','minutes','seconds'].forEach((id,i)=>{const el=$('#'+id);if(el)el.textContent=String(vals[i]).padStart(2,'0');});
    if(ms===0) {const ct=$('#countdown-title');if(ct)ct.innerHTML='¡LA FIESTA<br><em>YA COMENZÓ!</em>';}
  }
  updateCountdown();setInterval(updateCountdown,1000);
  // Skins + arsenal
  const skins=[['EL EXPLORADOR','Listo para aterrizar, descubrir sorpresas y conquistar la fiesta.'],['LA ESTRELLA','Nunca llega sin estilo. Su emote favorito es bailar sin parar.'],['EL GUARDIÁN','El protector del squad: nadie se queda sin pastel ni diversión.']];
  $$('.skin-card').forEach((button,index)=>button.addEventListener('click',()=>{
    $$('.skin-card').forEach((b,i)=>{b.classList.toggle('selected',i===index);b.setAttribute('aria-pressed',String(i===index));$('.skin-selected',b).textContent=i===index?'✓ EQUIPADO':'ELEGIR SKIN';});
    $('#selectedSkinName').textContent=skins[index][0];$('#selectedSkinDesc').textContent=skins[index][1];
    beep(580+index*95,.12,'triangle');notification('✦ '+skins[index][0]+' equipado');
  }));
  const weaponNames=['PICO RELÁMPAGO','POCIÓN DE ESCUDO','CORONA DE VICTORIA','LLAMA DE BOTÍN'];
  $$('.inventory-slot').forEach((b,i)=>b.addEventListener('click',()=>{
    $$('.inventory-slot').forEach((el,j)=>{el.classList.toggle('active',j===i);el.setAttribute('aria-pressed',String(j===i));});
    $('#equippedText').textContent=weaponNames[i];beep(410+i*80,.11,'triangle');
  }));
  // Botín: tres cofres + modal
  const unlocked=new Set();
  function updateLoot(){const count=unlocked.size;$('#progressFill').style.width=(count/3*100)+'%';$('#progressLabel').textContent=`${count} / 3`;$('#progressBar').setAttribute('aria-valuenow',String(count));$('#lootPrompt').textContent=count===3?'✓ ¡MISIÓN COMPLETADA! RECOMPENSA DESBLOQUEADA':'🔒 ABRE LOS TRES COFRES PARA DESBLOQUEAR LA RECOMPENSA';$('#resetLoot').hidden=count===0;}
  let previousFocus=null;
  function showModal(modal){previousFocus=document.activeElement;modal.hidden=false;modal.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');$('.modal-close',modal)?.focus();}
  function hideModal(modal){modal.hidden=true;modal.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open');previousFocus?.focus?.();}
  $$('.loot-card').forEach((b,i)=>b.addEventListener('click',()=>{
    if(unlocked.has(i)){notification('✓ Este cofre ya está abierto. ¡Busca los demás!');return;}
    unlocked.add(i);b.classList.add('opened');b.setAttribute('aria-label','Cofre abierto, '+['pico legendario','escudo máximo','corona real'][i]);beep(520,.17,'triangle');beep(760,.18,'triangle',.13);
    updateLoot();if(unlocked.size===3)setTimeout(()=>{showModal($('#rewardModal'));confetti(100);beep(930,.14,'sawtooth');beep(1100,.29,'triangle',.16);},680);
  }));
  function resetLoot(){unlocked.clear();$$('.loot-card').forEach((b,i)=>{b.classList.remove('opened');b.setAttribute('aria-label',`Abrir cofre ${i+1}`);});updateLoot();notification('🎁 ¡Tres cofres nuevos te esperan!');}
  $('#resetLoot')?.addEventListener('click',resetLoot);
  $('#replayLoot')?.addEventListener('click',()=>{hideModal($('#rewardModal'));resetLoot();});
  $$('[data-close-reward]').forEach(b=>b.addEventListener('click',()=>hideModal($('#rewardModal'))));
  $('#rewardConfirm')?.addEventListener('click',()=>hideModal($('#rewardModal')));
  // Lightbox / imágenes configurables
  const imgs=(Array.isArray(cfg.fotos)&&cfg.fotos.length)?cfg.fotos:['assets/gallery/foto-01.svg','assets/gallery/foto-02.svg','assets/gallery/foto-03.svg'];
  $$('.gallery-card img').forEach((img,i)=>{if(imgs[i])img.src=imgs[i];});
  let currentImage=0;
  function renderPhoto(){const img=$('#lightboxImage');img.src=imgs[currentImage]||imgs[0];img.alt=`Imagen ampliada ${currentImage+1} de ${imgs.length}`;$('#lightboxCaption').textContent=`${String(currentImage+1).padStart(2,'0')} / ${String(imgs.length).padStart(2,'0')}`;}
  function openPhoto(i){currentImage=i;renderPhoto();showModal($('#lightbox'));beep(650,.1);}
  $$('.gallery-card').forEach((b,i)=>b.addEventListener('click',()=>openPhoto(i)));
  $('#photoPrev')?.addEventListener('click',()=>{currentImage=(currentImage-1+imgs.length)%imgs.length;renderPhoto();beep(420,.09);});
  $('#photoNext')?.addEventListener('click',()=>{currentImage=(currentImage+1)%imgs.length;renderPhoto();beep(620,.09);});
  $$('[data-close-lightbox]').forEach(el=>el.addEventListener('click',()=>hideModal($('#lightbox'))));
  document.addEventListener('keydown',ev=>{
    if(ev.key==='Escape'){if(!$('#rewardModal').hidden)hideModal($('#rewardModal'));if(!$('#lightbox').hidden)hideModal($('#lightbox'));closeMenu();}
    if(!$('#lightbox').hidden){if(ev.key==='ArrowRight')$('#photoNext').click();if(ev.key==='ArrowLeft')$('#photoPrev').click();}
  });
  // RSVP: never silently submit to unknown or fake number
  $('#rsvpForm')?.addEventListener('submit',ev=>{
    ev.preventDefault();const form=ev.currentTarget;const name=$('#guestName').value.trim();
    if(name.length<2){$('#formFeedback').textContent='Escribe tu nombre (al menos 2 caracteres).';$('#formFeedback').classList.add('error');$('#guestName').focus();return;}
    const n=$('#attendees').value;const going=$('input[name="attendance"]:checked')?.value==='si';
    const msg=$('#guestMessage').value.trim();const phone=String(cfg.whatsapp||'').replace(/\D/g,'');
    const text=`🎮 *¡INVITACIÓN BATTLE ROYALE!*\n\nHola, soy *${name}*.\n${going?'✅ ¡Confirmo mi asistencia!':'❌ Lo siento, no podré asistir.'}\n👥 Jugadores: ${n}\n🎉 Cumpleaños de: ${cfg.nombre||'el cumpleañero'}${msg?'\n💬 Mensaje: '+msg:''}\n\n¡Nos vemos en la isla! 🪂`;
    if(phone.length<10){$('#formFeedback').textContent='Esta es una invitación de ejemplo. Configura el número de WhatsApp en js/config.js para enviar confirmaciones.';$('#formFeedback').classList.add('error');notification('⚠️ Configura el WhatsApp en js/config.js',true);return;}
    $('#formFeedback').classList.remove('error');$('#formFeedback').textContent='Abriendo WhatsApp con tu mensaje listo para enviar...';
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`,'_blank','noopener,noreferrer');confetti(45);beep(730,.16);
  });
  // Reveal on scroll; fallback when IO absent
  if(!reduceMotion && 'IntersectionObserver' in window){const observer=new IntersectionObserver(items=>items.forEach(item=>{if(item.isIntersecting){item.target.classList.add('show');observer.unobserve(item.target);}}),{threshold:.09});$$('.reveal').forEach(el=>observer.observe(el));}
  else $$('.reveal').forEach(el=>el.classList.add('show'));
  // gentle scrolling to sections
  // small debug marker for automated smoke testing
  document.documentElement.dataset.gameReady='true';
})();
