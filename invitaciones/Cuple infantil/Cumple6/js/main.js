/* GRAN PREMIO · Comportamientos. Datos editables en config.js. */
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
  document.title = `Gran Premio · ${c.name} cumple ${c.age}`;
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
    if (!remaining) $('#count-note').textContent = '¡El gran premio del cumpleaños ha comenzado!';
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
  // Carrera: una vuelta, ocho pulsaciones, sin límite de tiempo.
  const track=$('#track-path'), car=$('#race-car'), length=track.getTotalLength();
  let steps=0, progress=0, timer, frame, running=false;
  function position(value){
    const distance=(value%1)*length, point=track.getPointAtLength(distance);
    const next=track.getPointAtLength(Math.min(length,distance+1));
    const angle=Math.atan2(next.y-point.y,next.x-point.x)*180/Math.PI;
    car.setAttribute('transform',`translate(${point.x} ${point.y}) rotate(${angle})`);
  }
  document.querySelectorAll('[data-color]').forEach(button=>button.addEventListener('click',()=>{
    document.documentElement.style.setProperty('--car-color',button.dataset.color);
    document.querySelectorAll('[data-color]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  }));
  function reset(){
    clearInterval(timer);cancelAnimationFrame(frame);steps=0;progress=0;running=false;position(0);
    $('#start').hidden=false;$('#start').disabled=false;$('#accelerate').hidden=true;$('#accelerate').disabled=false;
    $('#pilot-pass').hidden=true;$('#lap').textContent='VUELTA 0 / 1';$('#race-status').textContent='¿Todo listo, piloto?';
    $('.lights').classList.remove('go');document.querySelectorAll('.lights i').forEach(i=>i.classList.remove('on'));
  }
  $('#reset').addEventListener('click',reset);
  $('#start').addEventListener('click',()=>{
    $('#start').disabled=true;let n=0;const lights=[...document.querySelectorAll('.lights i')];
    $('#race-status').textContent='Preparados…';
    function tick(){if(n<3){lights[n++].classList.add('on');$('#race-status').textContent=`Salida en ${4-n}…`;}
      else{clearInterval(timer);$('.lights').classList.add('go');running=true;$('#start').hidden=true;$('#accelerate').hidden=false;$('#accelerate').focus();$('#race-status').textContent='¡Luz verde! Pulsa Acelerar 8 veces.';}}
    tick();timer=setInterval(tick,650);
  });
  $('#accelerate').addEventListener('click',()=>{
    if(!running||steps>=8)return;steps++;const from=progress,to=steps/8;$('#accelerate').disabled=true;
    const started=performance.now();
    function finish(){progress=to;position(to);$('#accelerate').disabled=false;
      $('#race-status').textContent=`¡Vamos, equipo! ${steps} de 8 aceleraciones.`;
      if(steps===8){running=false;$('#accelerate').hidden=true;$('#lap').textContent='VUELTA 1 / 1';$('#pilot-pass').hidden=false;$('#race-status').textContent='¡Meta! Tu pase de piloto está desbloqueado.';}}
    function animate(now){const t=paused?1:Math.min(1,(now-started)/350);position(from+(to-from)*t);if(t<1)frame=requestAnimationFrame(animate);else finish();}
    frame=requestAnimationFrame(animate);
  });
  position(0);

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
    const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Gran Premio//ES','BEGIN:VEVENT',`UID:${date.getTime()}-granpremio@invitacion.local`,`DTSTAMP:${icsDate(new Date())}`,`DTSTART:${icsDate(date)}`,`DTEND:${icsDate(end)}`,`SUMMARY:${icsText('Cumpleaños de '+c.name)}`,`LOCATION:${icsText(c.venue+', '+c.address)}`,'END:VEVENT','END:VCALENDAR'];
    const url=URL.createObjectURL(new Blob([lines.join('\r\n')+'\r\n'],{type:'text/calendar;charset=utf-8'})); const a=make('a');a.href=url;a.download='gran-premio.ics';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
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
    else{try{localStorage.setItem('gran-premio-rsvp',JSON.stringify(response));$('#form-status').textContent='Respuesta guardada en este navegador. No se ha enviado al anfitrión.';}catch{$('#form-status').textContent='El navegador bloqueó el almacenamiento. No se ha guardado ni enviado la respuesta.';}}
  });
})();
