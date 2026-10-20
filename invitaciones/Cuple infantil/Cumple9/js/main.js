/* ============================================================
   MINEPARTY · FUNCIONALIDAD
   01 Contenido configurable | 02 Menú y accesos | 03 Efectos
   04 Sonido | 05 Minijuego | 06 Fotos | 07 RSVP | 08 Calendario
   ============================================================ */
(() => {
  'use strict';
  const C = window.INVITACION || {};
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const setText = (selector, text) => { const el = $(selector); if (el) el.textContent = String(text); };
  const motionOff = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let toastTimer;
  let soundOn = false;
  let audioCtx;

  function showToast(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 3300);
  }

  // 01 · La única fuente de datos personales está en js/config.js
  const name = String(C.nombre || 'TU NOMBRE');
  const age = Number(C.edad) || 8;
  const eventDate = new Date(C.fecha || '2026-11-21T16:00:00-06:00');
  const endDate = new Date(C.fechaFin || '2026-11-21T20:00:00-06:00');
  const timeZone = C.zonaHoraria || 'America/Mexico_City';
  const fmt = (options) => new Intl.DateTimeFormat('es-MX', {timeZone, ...options}).format(eventDate);

  function applyConfig() {
    document.title = `${name} · Nivel ${age} | Invitación Minecraft`;
    setText('#hero-name', name.toUpperCase());
    setText('#hero-name-inline', name);
    setText('#hero-age', age);
    setText('#mission-name', name.toUpperCase());
    setText('#mission-age', String(age).padStart(2, '0'));
    setText('#hero-date', fmt({day:'2-digit', month:'short', year:'numeric'}).toUpperCase().replace('.', ''));
    setText('#hero-location', (C.lugar || 'POR CONFIRMAR').toUpperCase());
    setText('#event-full-date', fmt({weekday:'long', day:'numeric', month:'long'}).toUpperCase());
    setText('#event-year', fmt({year:'numeric'}));
    setText('#event-time', fmt({hour:'numeric', minute:'2-digit', hour12:true}).toUpperCase());
    setText('#event-place', (C.lugar || 'Por confirmar').toUpperCase());
    setText('#event-address', C.direccion || 'Agrega aquí la dirección');
    const map = $('#map-btn');
    if (C.mapaUrl && /^https?:\/\//i.test(C.mapaUrl)) {
      map.href = C.mapaUrl;
      map.target = '_blank';
      map.rel = 'noopener noreferrer';
      map.removeAttribute('aria-disabled');
    } else {
      map.addEventListener('click', e => { e.preventDefault(); showToast('AGREGA EL ENLACE DE GOOGLE MAPS EN CONFIG.JS'); });
    }
    if (!C.esDemostracion) $('#sample-warning').hidden = true;
  }
  applyConfig();

  function updateCountdown() {
    let delta = eventDate.getTime() - Date.now();
    if (!Number.isFinite(delta) || delta <= 0) {
      ['days','hours','mins','secs'].forEach(k => setText(`#cd-${k}`, '00'));
      setText('#countdown-note', delta <= 0 ? '¡LA AVENTURA YA COMENZÓ!' : 'CONFIGURA LA FECHA');
      return;
    }
    const total = Math.floor(delta / 1000);
    const days = Math.floor(total / 86400);
    const hours = Math.floor((total % 86400) / 3600);
    const mins = Math.floor((total % 3600) / 60);
    const secs = total % 60;
    setText('#cd-days', String(days).padStart(2,'0'));
    setText('#cd-hours', String(hours).padStart(2,'0'));
    setText('#cd-mins', String(mins).padStart(2,'0'));
    setText('#cd-secs', String(secs).padStart(2,'0'));
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // 02 · Menú adaptable + botones de la barra de inventario
  const menu = $('#nav-links');
  const menuToggle = $('#menu-toggle');
  function closeMenu() { menu.classList.remove('open'); menuToggle.setAttribute('aria-expanded','false'); menuToggle.setAttribute('aria-label','Abrir menú'); }
  menuToggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });
  $$('#nav-links a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  document.addEventListener('click', (e) => { if (!e.target.closest('.nav') && menu.classList.contains('open')) closeMenu(); });
  window.addEventListener('scroll', () => $('#top').classList.toggle('scrolled', window.scrollY > 20), {passive:true});
  $$('.hotbar button[data-scroll]').forEach(button => button.addEventListener('click', () => {
    document.getElementById(button.dataset.scroll)?.scrollIntoView({behavior:motionOff ? 'auto' : 'smooth'});
    playSound('click');
  }));
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          $$('.hotbar button[data-scroll]').forEach(button => button.classList.toggle('active',button.dataset.scroll===entry.target.id));
        }
      });
    },{rootMargin:'-30% 0px -60% 0px'});
    $$('main section[id]').forEach(section => observer.observe(section));
  }

  // 03 · Pixel art: partículas decorativas, explosiones, confeti.
  const sky = $('#pixel-sky');
  if (!motionOff) {
    for (let i=0;i<26;i++) {
      const p=document.createElement('span');p.className='falling-pixel';
      p.style.left=(Math.random()*100)+'%';
      p.style.setProperty('--delay',(-Math.random()*17)+'s');
      p.style.setProperty('--duration',(11+Math.random()*15)+'s');
      sky.appendChild(p);
    }
  }
  const canvas=$('#effects-canvas');
  const ctx=canvas.getContext('2d');
  let particles=[];
  let playing=false;
  function resizeCanvas(){const ratio=Math.min(window.devicePixelRatio||1,2);canvas.width=innerWidth*ratio;canvas.height=innerHeight*ratio;ctx.setTransform(ratio,0,0,ratio,0,0);}
  resizeCanvas(); window.addEventListener('resize',resizeCanvas,{passive:true});
  const palette=['#8de04c','#d6f783','#55e5f1','#f8d355','#ffffff','#ed6f69','#d69bf7'];
  function burst(x,y,count=45,type='confetti'){
    if(motionOff)return;
    for(let i=0;i<count;i++){
      const theta=Math.random()*Math.PI*2;
      const speed=(type==='confetti'?3:2)+Math.random()*7;
      particles.push({x,y,vx:Math.cos(theta)*speed,vy:Math.sin(theta)*speed-(type==='confetti'?3:0),w:3+Math.random()*7,h:3+Math.random()*8,life:65+Math.random()*35,color:palette[Math.floor(Math.random()*palette.length)],angle:Math.random()*6.3,spin:(Math.random()-.5)*.2,type});
    }
    if(!playing){playing=true;requestAnimationFrame(tickParticles);}
  }
  function tickParticles(){
    ctx.clearRect(0,0,innerWidth,innerHeight);
    particles=particles.filter(p=>p.life-->0 && p.y<innerHeight+50);
    for(const p of particles){p.x+=p.vx;p.y+=p.vy;p.vy+=.18;p.vx*=.997;p.angle+=p.spin;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);ctx.globalAlpha=Math.min(1,p.life/25);ctx.fillStyle=p.color;ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);ctx.restore();}
    if(particles.length>0)requestAnimationFrame(tickParticles);else{playing=false;ctx.clearRect(0,0,innerWidth,innerHeight);}
  }
  $('#celebrate-btn').addEventListener('click',()=>{burst(innerWidth*.5,innerHeight*.48,170);playSound('success');showToast('¡FELIZ CUMPLEAÑOS! 🎉');});
  $('#creeper-egg').addEventListener('click',e=>{
    const egg=e.currentTarget;egg.classList.remove('boom');void egg.offsetWidth;egg.classList.add('boom');
    const r=egg.getBoundingClientRect();burst(r.x+r.width/2,r.y+r.height/2,105);
    playSound('creeper');showToast('¡SSSSS... BOOM! 💥 ¡ENCONTRASTE AL CREEPER!');
  });

  // 04 · Sonidos sencillos sintetizados, apagados por defecto.
  function playSound(type){
    if(!soundOn)return;
    try{
      audioCtx ||= new (window.AudioContext||window.webkitAudioContext)();
      if(audioCtx.state==='suspended')audioCtx.resume();
      const n=audioCtx.currentTime;
      const tones={click:[[460,.07]],mine:[[250,.045],[185,.07]],diamond:[[650,.1],[930,.12]],success:[[523,.12],[659,.12],[784,.13],[1047,.21]],creeper:[[190,.2],[100,.16]]};
      (tones[type]||tones.click).forEach(([freq,duration],i)=>{
        const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();
        osc.type=type==='creeper'?'sawtooth':'square';osc.frequency.setValueAtTime(freq,n+i*.085);
        gain.gain.setValueAtTime(.035,n+i*.085);gain.gain.exponentialRampToValueAtTime(.0001,n+i*.085+duration);
        osc.connect(gain);gain.connect(audioCtx.destination);osc.start(n+i*.085);osc.stop(n+i*.085+duration);
      });
    }catch(err){/* Si no hay audio, el juego sigue funcionando. */}
  }
  $('#sound-btn').addEventListener('click',()=>{
    soundOn=!soundOn;
    $('#sound-btn').setAttribute('aria-pressed',String(soundOn));
    $('#sound-btn').setAttribute('aria-label',soundOn?'Desactivar sonido':'Activar sonido');
    setText('#sound-icon',soundOn?'♪':'♪̸');
    if(soundOn)playSound('diamond');
    showToast(soundOn?'SONIDO ACTIVADO':'SONIDO DESACTIVADO');
  });

  // 05 · Minijuego: hay EXACTAMENTE tres diamantes por partida.
  const blockGrid=$('#block-grid');
  let discovered=0;
  let foundDiamonds=0;
  let loot=[];
  const reward=$('#reward-dialog');
  function generateLoot(){
    loot=['diamond','diamond','diamond','emerald','heart','apple','tnt','grass','creeper','ore','cake','stone'];
    for(let i=loot.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[loot[i],loot[j]]=[loot[j],loot[i]];}
  }
  function updateLoot(){
    setText('#diamond-count',`${foundDiamonds} / 3`);
    $('#diamond-progress').style.width=(foundDiamonds/3*100)+'%';
    for(let i=1;i<=3;i++){$('#slot-'+i).classList.toggle('filled',i<=foundDiamonds);}
    const unlocked=foundDiamonds>=3;
    const chest=$('#secret-chest');chest.disabled=!unlocked;
    chest.classList.toggle('unlocked',unlocked);
    chest.setAttribute('aria-label',unlocked?'Abrir cofre sorpresa':'Cofre sorpresa bloqueado');
    setText('#chest-lock',unlocked?'✨':'🔒');
    setText('#chest-title',unlocked?'¡COFRE DESBLOQUEADO!':'COFRE BLOQUEADO');
    setText('#chest-hint',unlocked?'¡Tócalo para abrir tu sorpresa!':'Consigue tres diamantes para abrirlo.');
  }
  function resetGame(){
    foundDiamonds=0;discovered=0;generateLoot();blockGrid.replaceChildren();
    for(let i=0;i<loot.length;i++){
      const b=document.createElement('button');b.className='mine-block';b.type='button';
      b.setAttribute('aria-label',`Romper bloque ${i+1}`);b.dataset.index=String(i);
      b.addEventListener('click',()=>mineBlock(b,i));blockGrid.appendChild(b);
    }
    updateLoot();setText('#mine-feedback','¡Hay diamantes escondidos bajo la piedra!');
  }
  const lootMessages={diamond:'💎 ¡ENCONTRASTE UN DIAMANTE! +1',emerald:'🟢 ¡Una esmeralda brillante!',heart:'❤️ ¡Ganaste un corazón extra!',apple:'🍏 ¡Una manzana dorada!',tnt:'💥 ¡Oh, no! ¡Era TNT!',grass:'🌱 ¡Un bloque de pasto!',creeper:'👾 ¡Un Creeper! ¡Corre!',ore:'⛏ ¡Mena encontrada!',cake:'🎂 ¡Pastel de cumpleaños!',stone:'🪨 ¡Más piedra! Sigue minando...'};
  function mineBlock(b,i){
    if(b.disabled)return;
    b.disabled=true;b.classList.add('revealed');discovered++;
    const item=loot[i];
    const img=document.createElement('img');img.src=`assets/icons/${item}.png`;img.alt=item==='diamond'?'Diamante':item;
    b.appendChild(img);b.setAttribute('aria-label',`Bloque ${i+1}: ${item}`);
    const r=b.getBoundingClientRect();burst(r.left+r.width/2,r.top+r.height/2,item==='diamond'?48:19,'debris');
    setText('#mine-feedback',lootMessages[item]);
    if(item==='diamond'){
      foundDiamonds++;playSound('diamond');
      if(foundDiamonds===3){setTimeout(()=>{showToast('¡LOS 3 DIAMANTES! ¡ABRE TU COFRE!');burst(innerWidth/2,innerHeight/2,150);playSound('success');},200);}
    }else playSound('mine');
    updateLoot();
  }
  resetGame();
  $('#reset-game').addEventListener('click',()=>{resetGame();playSound('click');showToast('¡NUEVA MINA GENERADA!');});
  function openReward(){if(foundDiamonds<3)return;reward.showModal();document.body.classList.add('dialog-open');burst(innerWidth/2,innerHeight*.36,150);playSound('success');}
  $('#secret-chest').addEventListener('click',openReward);
  $('#reward-close').addEventListener('click',()=>reward.close());
  $('#reward-confirm').addEventListener('click',()=>reward.close());
  reward.addEventListener('close',()=>document.body.classList.remove('dialog-open'));
  reward.addEventListener('click',e=>{if(e.target===reward)reward.close();});

  // 06 · Galería: abrir, siguiente, anterior, cerrar con Esc.
  const photos=['assets/photos/foto-1.webp','assets/photos/foto-2.webp','assets/photos/foto-3.webp','assets/photos/foto-4.webp'];
  const photoAlt=['Paisaje Minecraft de muestra 1','Paisaje Minecraft de muestra 2','Paisaje Minecraft de muestra 3','Paisaje Minecraft de muestra 4'];
  let photoIndex=0;
  const lightbox=$('#lightbox');
  function showPhoto(i){photoIndex=(i+photos.length)%photos.length;$('#lightbox-img').src=photos[photoIndex];$('#lightbox-img').alt=photoAlt[photoIndex];setText('#lightbox-counter',`${String(photoIndex+1).padStart(2,'0')} / ${String(photos.length).padStart(2,'0')}`);}
  $$('.gallery-tile').forEach(tile=>tile.addEventListener('click',()=>{showPhoto(Number(tile.dataset.photo));lightbox.showModal();document.body.classList.add('dialog-open');playSound('click');}));
  $('#lightbox-close').addEventListener('click',()=>lightbox.close());
  $('#lightbox-prev').addEventListener('click',()=>showPhoto(photoIndex-1));
  $('#lightbox-next').addEventListener('click',()=>showPhoto(photoIndex+1));
  lightbox.addEventListener('close',()=>document.body.classList.remove('dialog-open'));
  lightbox.addEventListener('click',e=>{if(e.target===lightbox)lightbox.close();});
  document.addEventListener('keydown',e=>{if(lightbox.open&&e.key==='ArrowLeft')showPhoto(photoIndex-1);if(lightbox.open&&e.key==='ArrowRight')showPhoto(photoIndex+1);});

  // 07 · WhatsApp: una confirmación REAL exige que el invitado envíe el mensaje.
  $('#rsvp-form').addEventListener('submit',e=>{
    e.preventDefault();
    const guest=$('#guest-name').value.trim();
    const error=$('#form-error');error.hidden=true;
    if(!guest){error.textContent='Escribe tu nombre para confirmar tu misión.';error.hidden=false;$('#guest-name').focus();return;}
    const attending=$('#attendance').value==='yes';
    const number=$('#party-size').value;
    const message=$('#guest-message').value.trim();
    const text=[`⛏️ *CONFIRMACIÓN DE CUMPLEAÑOS · ${name.toUpperCase()}*`,'',`👤 Jugador: ${guest}`,`🎮 Asistencia: ${attending?'¡Sí, ahí estaré!':'No podré asistir'}`,...(attending?[`👥 Jugadores: ${number}`]:[]),...(message?[`💬 Mensaje: ${message}`]:[]),'',`🌍 Invitación Minecraft Party`].join('\n');
    const phone=String(C.whatsapp||'').replace(/\D/g,'');
    const url=phone?`https://wa.me/${phone}?text=${encodeURIComponent(text)}`:`https://wa.me/?text=${encodeURIComponent(text)}`;
    playSound('success');
    const win=window.open(url,'_blank','noopener,noreferrer');
    if(!win){showToast('PERMITE LAS VENTANAS EMERGENTES PARA ABRIR WHATSAPP');}
    else{showToast('¡SE ABRIÓ WHATSAPP! ENVÍA EL MENSAJE PARA CONFIRMAR.');burst(innerWidth/2,innerHeight/2,85);}
  });
  $('#attendance').addEventListener('change',e=>{$('#party-size').disabled=e.target.value==='no';});

  // 08 · Archivo .ics compatible con aplicaciones de calendario.
  function icsDate(dateString){return String(dateString).replace(/[-:]/g,'').replace(/\.\d+/,'').replace(/(?:[+-]\d\d:?\d\d|Z)$/,'').replace('T','T').slice(0,15);}
  function icsEscape(s){return String(s||'').replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\n/g,'\\n');}
  $('#calendar-btn').addEventListener('click',()=>{
    const start=icsDate(C.fecha);const end=icsDate(C.fechaFin||C.fecha);
    const zone=timeZone.replace(/[^\w/\-]/g,'');
    const utcStamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
    const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//MineParty//Invitacion de Cumpleanios//ES','CALSCALE:GREGORIAN','METHOD:PUBLISH','BEGIN:VEVENT',`UID:mineparty-${Date.now()}@invitacion.local`,`DTSTAMP:${utcStamp}`,`DTSTART;TZID=${zone}:${start}`,`DTEND;TZID=${zone}:${end}`,`SUMMARY:${icsEscape('Cumpleaños de '+name+' · Nivel '+age)}`,`LOCATION:${icsEscape((C.lugar||'')+' '+(C.direccion||'')+' '+(C.ciudad||''))}`,`DESCRIPTION:${icsEscape('¡Te espero en mi aventura de cumpleaños estilo Minecraft!')}`,'END:VEVENT','END:VCALENDAR'].join('\r\n');
    const blob=new Blob([ics],{type:'text/calendar;charset=utf-8'});
    const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='cumpleanos-minecraft.ics';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);
    showToast('¡EVENTO LISTO PARA TU CALENDARIO!');playSound('click');
  });
})();
