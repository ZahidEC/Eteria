/* MUNDO JURÁSICO · Comportamientos. Datos editables en config.js. */
(() => {
  'use strict';
  const c = window.PARTY;
  const $ = selector => document.querySelector(selector);
  const fill = (selector, value) => document.querySelectorAll(selector).forEach(el => el.textContent = value);
  const make = (tag, text, cls) => { const el = document.createElement(tag); if (text !== undefined) el.textContent = text; if (cls) el.className = cls; return el; };
  const safe = value => { try { const url = new URL(value); return url.protocol === 'https:' ? url.href : ''; } catch { return ''; } };

  // 01 · Datos y fecha.
  const date = new Date(c.date), end = new Date(c.end);
  const format = (value, options) => new Intl.DateTimeFormat('es-MX', { timeZone: c.timeZone, ...options }).format(value);
  const dateLabel = format(date, {day:'numeric',month:'long',year:'numeric'});
  const timeLabel = value => format(value, {hour:'2-digit',minute:'2-digit',hour12:false});
  fill('[data-name]', c.name); fill('[data-age]', c.age); fill('[data-date]', dateLabel);
  fill('[data-time]', timeLabel(date) + ' h'); fill('[data-hours]', timeLabel(date) + ' a ' + timeLabel(end) + ' h');
  fill('[data-venue]', c.venue); fill('[data-address]', c.address); fill('[data-deadline]', c.deadline);
  document.title = `Mundo jurásico · ${c.name} cumple ${c.age}`;
  if (safe(c.mapsUrl)) { $('#map').href = safe(c.mapsUrl); $('#map').hidden = false; $('#map-pending').hidden = true; }
  c.agenda.forEach((item, i) => {
    const card = make('article', undefined, 'agenda-item');
    card.append(make('span',String(i+1).padStart(2,'0'),'step'),make('time',item.time),make('h3',item.title),make('p',item.text));
    $('#agenda').append(card);
  });
  function count() {
    const remaining = Math.max(0, date - Date.now());
    const values = [Math.floor(remaining/86400000),Math.floor(remaining/3600000)%24,Math.floor(remaining/60000)%60,Math.floor(remaining/1000)%60];
    ['days','hours','minutes','seconds'].forEach((id,i) => $('#'+id).textContent = String(values[i]).padStart(2,'0'));
    if (!remaining) $('#count-note').textContent = '¡La expedición de cumpleaños ha comenzado!';
  }
  count(); setInterval(count,1000);

  // 02 · Menú, modales y preferencia de movimiento.
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reduced.matches;
  function setEffects(value) { paused = value; document.body.classList.toggle('effects-paused',value); $('#effects').textContent = value ? 'Activar efectos' : 'Pausar efectos'; $('#effects').setAttribute('aria-pressed',String(value)); }
  setEffects(paused); reduced.addEventListener('change',e=>setEffects(e.matches)); $('#effects').addEventListener('click',()=>setEffects(!paused));
  function closeMenu() { $('#nav').classList.remove('open'); $('#menu').setAttribute('aria-expanded','false'); $('#menu').setAttribute('aria-label','Abrir menú'); }
  $('#menu').addEventListener('click',()=>{ const open=$('#nav').classList.toggle('open'); $('#menu').setAttribute('aria-expanded',String(open)); $('#menu').setAttribute('aria-label',open?'Cerrar menú':'Abrir menú'); });
  document.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',closeMenu));
  addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
  function open(id) { $(id).showModal(); document.body.classList.add('modal-open'); }
  document.querySelectorAll('dialog').forEach(dialog=>{ dialog.querySelector('.close').addEventListener('click',()=>dialog.close()); dialog.addEventListener('close',()=>document.body.classList.remove('modal-open')); });
  // 03 · Regalos opcionales.
  $('#gift-ideas').textContent=c.giftIdeas;
  if(safe(c.giftUrl)){ $('#gift-link').href=safe(c.giftUrl); $('#gift-link').hidden=false; }
  $('#gift-open').addEventListener('click',()=>open('#gift-dialog'));

  // 04 · Galería opcional. Fotografías completas, teclado y gesto táctil.
  let photoIndex=0;
  function showPhoto(index){ photoIndex=(index+c.photos.length)%c.photos.length; const item=c.photos[photoIndex]; $('#photo').src=item.src; $('#photo').alt=item.title; $('#photo-caption').textContent=`${item.title} · ${photoIndex+1} / ${c.photos.length}`; }
  if(c.photos.length){
    $('#memories').hidden=false;
    c.photos.forEach((item,i)=>{ const button=make('button'); button.type='button';button.setAttribute('aria-label','Ampliar: '+item.title); const image=make('img');image.src=item.src;image.alt=item.title;image.loading='lazy';button.append(image,make('span',item.title));button.addEventListener('click',()=>{showPhoto(i);open('#photo-dialog');});$('#gallery').append(button); });
  }
  $('#prev').addEventListener('click',()=>showPhoto(photoIndex-1));$('#next').addEventListener('click',()=>showPhoto(photoIndex+1));
  $('#photo-dialog').addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();showPhoto(photoIndex+(e.key==='ArrowRight'?1:-1));}});
  let touch=null;
  $('#photo').addEventListener('touchstart',e=>{touch={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});
  $('#photo').addEventListener('touchend',e=>{if(!touch)return;const dx=e.changedTouches[0].clientX-touch.x,dy=e.changedTouches[0].clientY-touch.y;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy))showPhoto(photoIndex+(dx<0?1:-1));touch=null;},{passive:true});

  // 05 · Descargar evento de calendario.
  const icsDate = value => value.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
  const icsText = value => String(value).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
  $('#calendar').addEventListener('click',()=>{
    const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Mundo jurásico//ES','BEGIN:VEVENT',`UID:${date.getTime()}-jurasico@invitacion.local`,`DTSTAMP:${icsDate(new Date())}`,`DTSTART:${icsDate(date)}`,`DTEND:${icsDate(end)}`,`SUMMARY:${icsText('Cumpleaños de '+c.name)}`,`LOCATION:${icsText(c.venue+', '+c.address)}`,'END:VEVENT','END:VCALENDAR'];
    const url=URL.createObjectURL(new Blob([lines.join('\r\n')+'\r\n'],{type:'text/calendar;charset=utf-8'})); const a=make('a');a.href=url;a.download='expedicion-jurasica.ics';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
  });

  // 06 · RSVP: guardado local explícito o WhatsApp revisable antes de enviar.
  const form=$('#rsvp-form'), whatsapp=/^\d{10,15}$/.test(c.whatsapp);
  if(whatsapp)$('#form-note').textContent='Se abrirá WhatsApp para que revises y envíes tu confirmación al anfitrión.';
  $('#attendance').addEventListener('change',()=>{const no=$('#attendance').value==='No';$('#adults').disabled=no;$('#children').disabled=no;});
  $('#adult').addEventListener('input',()=>$('#adult').setCustomValidity(''));
  form.addEventListener('submit',e=>{
    e.preventDefault();const name=$('#adult').value.trim();
    if(!name){$('#adult').setCustomValidity('Escribe el nombre del adulto responsable.');$('#adult').reportValidity();return;}
    const data=new FormData(form);const response={adult:name,attendance:data.get('attendance'),adults:data.get('adults')||'0',children:data.get('children')||'0',notes:String(data.get('notes')||'').trim()};
    if(whatsapp){const message=`¡Hola! Confirmación para el cumpleaños de ${c.name}. Adulto responsable: ${name}. Asistencia: ${response.attendance}. Adultos: ${response.adults}. Niños: ${response.children}. Notas: ${response.notes||'Sin observaciones.'}`;window.open('https://wa.me/'+c.whatsapp+'?text='+encodeURIComponent(message),'_blank','noopener,noreferrer');$('#form-status').textContent='Revisa y envía el mensaje en WhatsApp para completar tu confirmación.';}
    else{try{localStorage.setItem('mundo-jurasico-rsvp',JSON.stringify(response));$('#form-status').textContent='Respuesta guardada en este navegador. No se ha enviado al anfitrión.';}catch{$('#form-status').textContent='El navegador bloqueó el almacenamiento. No se ha guardado ni enviado la respuesta.';}}
  });

  // 07 · Habitantes del parque: el mapa y las tarjetas comparten las fichas.
  function showDinosaur(index){
    const d=c.dinosaurs[index];
    $('#dino-tag').textContent=d.tag;$('#dino-symbol').textContent=d.icon; $('#dino-art').style.setProperty('--art-x',d.artX+'%'); $('#dino-art').style.setProperty('--art-y',d.artY+'%');
    $('#dino-title').textContent=d.name;$('#dino-species').textContent=d.species+' · '+d.zone;
    $('#dino-story').textContent=d.story;$('#dino-mission').textContent=d.mission;
    open('#dino-dialog');
  }
  c.dinosaurs.forEach((d,i)=>{
    const pin=make('button',undefined,'map-pin');pin.type='button';pin.style.setProperty('--x',d.x+'%');pin.style.setProperty('--y',d.y+'%');
    pin.setAttribute('aria-label','Conocer a '+d.name+' · '+d.species);pin.setAttribute('aria-haspopup','dialog');
    pin.append(make('span',String(i+1)),make('small',d.name.toUpperCase()));
    pin.addEventListener('click',()=>showDinosaur(i));$('#map-pins').append(pin);
    const card=make('button',undefined,'dino-card');card.type='button';card.setAttribute('aria-haspopup','dialog');
    const symbol=make('span',undefined,'dino-thumbnail');symbol.setAttribute('aria-hidden','true');symbol.style.setProperty('--art-x',d.artX+'%');symbol.style.setProperty('--art-y',d.artY+'%');
    card.append(symbol,make('span','HABITANTE '+String(i+1).padStart(2,'0')),make('h3',d.name),make('p',d.species),make('b','↗'));
    card.addEventListener('click',()=>showDinosaur(i));$('#dino-grid').append(card);
  });

  // 08 · Búsqueda de fósiles, sin límite de tiempo y accesible con teclado.
  let missionActive=false,found=0;
  const fossils=[...document.querySelectorAll('[data-fossil]')];
  function endMission(){missionActive=false;$('#fossils').hidden=true;$('#map-pins').hidden=false;$('#mission').setAttribute('aria-pressed','false');}
  $('#mission').setAttribute('aria-pressed','false');
  $('#mission').addEventListener('click',()=>{
    if(missionActive){endMission();$('#mission').textContent='⌕ Buscar 3 fósiles';$('#mission-status').textContent='Misión pausada. Puedes comenzar de nuevo cuando quieras.';return;}
    missionActive=true;found=0;fossils.forEach(button=>{button.disabled=false;});
    $('#mission-badge').hidden=true;$('#fossils').hidden=false;$('#map-pins').hidden=true;
    $('#mission').textContent='× Salir de la misión';$('#mission').setAttribute('aria-pressed','true');
    $('#mission-status').textContent='Busca los tres fósiles redondos del mapa. 0 / 3 encontrados.';
  });
  fossils.forEach(button=>button.addEventListener('click',()=>{
    if(button.disabled||!missionActive)return;button.disabled=true;found++;
    $('#mission-status').textContent=found+' / 3 fósiles encontrados.';
    if(found===3){endMission();$('#mission-badge').hidden=false;$('#mission').textContent='↻ Repetir misión';$('#mission-status').textContent='¡Expedición completada! Ganaste tu insignia de explorador.';$('#mission').focus();}
  }));

  // 09 · Erupción visual opcional: sin sonidos, sin destellos rápidos.
  let eruptionTimer;
  $('#volcano').addEventListener('click',()=>{
    clearTimeout(eruptionTimer);$('#world-map').classList.remove('erupting');
    $('#volcano-status').textContent=paused?'El volcán ruge en nuestra imaginación. Los efectos están pausados.':'¡El volcán del valle ha despertado! Una pequeña erupción de fantasía.';
    if(!paused){requestAnimationFrame(()=>requestAnimationFrame(()=>$('#world-map').classList.add('erupting')));}
    eruptionTimer=setTimeout(()=>{$('#world-map').classList.remove('erupting');$('#volcano-status').textContent='Todo tranquilo. La expedición puede continuar.';},2200);
  });
})();
