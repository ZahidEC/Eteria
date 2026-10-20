/* FIESTA OHANA · Comportamientos. Datos editables en config.js. */
(() => {
  'use strict';
  const c = window.PARTY;
  const $ = selector => document.querySelector(selector);
  const fill = (selector, value) => document.querySelectorAll(selector).forEach(el => el.textContent = value);
  const make = (tag, text, cls) => { const el = document.createElement(tag); if (text !== undefined) el.textContent = text; if (cls) el.className = cls; return el; };
  const safe = value => { try { const url = new URL(value); return url.protocol === 'https:' ? url.href : ''; } catch { return ''; } };

  // Imagen del personaje: admite archivo local o enlace HTTPS.
  const character = $('#stitch-character');
  character.addEventListener('error', () => { character.hidden=true; $('#character-note').hidden=false; });
  character.addEventListener('load', () => { character.hidden=false; $('#character-note').hidden=true; });
  character.src = c.characterImage;
  if (character.complete && !character.naturalWidth) { character.hidden=true; $('#character-note').hidden=false; }

  document.querySelectorAll('[data-character]').forEach(image => {
    image.addEventListener('error', () => { image.hidden=true; });
    image.src=c.characterImage;
  });

  // 01 · Datos y fecha.
  const date = new Date(c.date), end = new Date(c.end);
  const format = (value, options) => new Intl.DateTimeFormat('es-MX', { timeZone: c.timeZone, ...options }).format(value);
  const dateLabel = format(date, {day:'numeric',month:'long',year:'numeric'});
  const timeLabel = value => format(value, {hour:'2-digit',minute:'2-digit',hour12:false});
  fill('[data-name]', c.name); fill('[data-age]', c.age); fill('[data-date]', dateLabel);
  fill('[data-time]', timeLabel(date) + ' h'); fill('[data-hours]', timeLabel(date) + ' a ' + timeLabel(end) + ' h');
  fill('[data-venue]', c.venue); fill('[data-address]', c.address); fill('[data-deadline]', c.deadline);
  document.title = `Fiesta Ohana · ${c.name} cumple ${c.age}`;
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
    if (!remaining) $('#count-note').textContent = '¡La fiesta Ohana ha comenzado!';
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
  $('#launch').addEventListener('click',()=>{
    $('#present').classList.remove('unwrapped'); $('#present').disabled=false;
    $('#confetti').replaceChildren();
    $('#launch-title').textContent='¡Tienes una sorpresa!';
    $('#launch-count').textContent='Toca el regalo para descubrirla.';
    open('#launch-dialog');
  });
  $('#present').addEventListener('click',()=>{
    $('#present').classList.add('unwrapped'); $('#present').disabled=true;
    $('#launch-title').textContent='¡Eres parte de mi Ohana!';
    $('#launch-count').textContent=`Ven a celebrar los ${c.age} años de ${c.name}. ¡Va a ser una gran travesura!`;
    if (!paused) {
      for (let i=0;i<28;i++) {
        const piece=make('i'); piece.style.setProperty('--x', (i*37%100)+'%');
        piece.style.setProperty('--delay', (i%7)*.08+'s');
        piece.style.setProperty('--color', ['#ff5799','#13bdc6','#ffd95e','#8c65d0'][i%4]);
        $('#confetti').append(piece);
      }
    }
  });
  $('#board').addEventListener('click',()=>{ $('#launch-dialog').close(); $('#mision').scrollIntoView({behavior:paused?'instant':'smooth'}); });

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
  $('#birthday-portrait').addEventListener('click',()=>{showPhoto(0);open('#photo-dialog');});
  $('#prev').addEventListener('click',()=>showPhoto(photoIndex-1));$('#next').addEventListener('click',()=>showPhoto(photoIndex+1));
  $('#photo-dialog').addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();showPhoto(photoIndex+(e.key==='ArrowRight'?1:-1));}});
  let touch=null;
  $('#photo').addEventListener('touchstart',e=>{touch={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});
  $('#photo').addEventListener('touchend',e=>{if(!touch)return;const dx=e.changedTouches[0].clientX-touch.x,dy=e.changedTouches[0].clientY-touch.y;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy))showPhoto(photoIndex+(dx<0?1:-1));touch=null;},{passive:true});

  // 05 · Descargar evento de calendario.
  const icsDate = value => value.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
  const icsText = value => String(value).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
  $('#calendar').addEventListener('click',()=>{
    const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Fiesta Ohana//ES','BEGIN:VEVENT',`UID:${date.getTime()}-ohana@invitacion.local`,`DTSTAMP:${icsDate(new Date())}`,`DTSTART:${icsDate(date)}`,`DTEND:${icsDate(end)}`,`SUMMARY:${icsText('Cumpleaños de '+c.name)}`,`LOCATION:${icsText(c.venue+', '+c.address)}`,'END:VEVENT','END:VCALENDAR'];
    const url=URL.createObjectURL(new Blob([lines.join('\r\n')+'\r\n'],{type:'text/calendar;charset=utf-8'})); const a=make('a');a.href=url;a.download='fiesta-ohana.ics';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
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
    else{try{localStorage.setItem('stitch-ohana-rsvp',JSON.stringify(response));$('#form-status').textContent='Respuesta guardada en este navegador. No se ha enviado al anfitrión.';}catch{$('#form-status').textContent='El navegador bloqueó el almacenamiento. No se ha guardado ni enviado la respuesta.';}}
  });
})();
