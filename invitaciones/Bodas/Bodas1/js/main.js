/* Funciones de la invitación. Los datos editables viven en config.js. */
(() => {
  'use strict';
  const config = window.WEDDING;
  const $ = selector => document.querySelector(selector);
  const create = (tag, className, text) => { const el = document.createElement(tag); if(className) el.className = className; if(text !== undefined) el.textContent = text; return el; };
  const fill = (selector, value) => document.querySelectorAll(selector).forEach(el => el.textContent = value);
  // 01. Datos generales y cuenta regresiva.
  fill('[data-bride]', config.bride); fill('[data-groom]', config.groom); fill('[data-city]', config.city);
  document.title = `${config.bride} & ${config.groom} · Nuestra boda`;
  const date = new Date(config.date);
  fill('[data-date]', new Intl.DateTimeFormat('es-MX', {day:'numeric',month:'long',year:'numeric',timeZone:'America/Mexico_City'}).format(date));
  $('#rsvp-deadline').textContent = config.rsvpDeadline;
  $('#venue-name').textContent = config.venue; $('#venue-address').textContent = config.address;
  [$('#map-link'), $('#location-button')].forEach(el => el.href = config.mapsUrl);
  function countdown(){
    const diff = Math.max(0, date.getTime() - Date.now());
    const values = [Math.floor(diff/86400000), Math.floor(diff/3600000)%24, Math.floor(diff/60000)%60, Math.floor(diff/1000)%60];
    ['days','hours','minutes','seconds'].forEach((id,i) => $('#'+id).textContent = String(values[i]).padStart(2,'0'));
    if(!diff) $('#countdown-note').textContent = '¡Nuestro para siempre ya comenzó!';
  }
  countdown(); setInterval(countdown,1000);
  // 02. Menú móvil: teclado, Escape y cierre al seguir un enlace.
  const toggle = $('.menu-toggle'), nav = $('#navigation');
  function closeMenu(){ nav.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); toggle.setAttribute('aria-label','Abrir menú'); }
  toggle.addEventListener('click',()=>{const open = nav.classList.toggle('open'); toggle.setAttribute('aria-expanded',String(open)); toggle.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú');});
  nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
  document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu();});
  // 03. Historia e itinerario. textContent evita interpretar contenido como HTML.
  config.history.forEach(item=>{
    const article=create('article','story'); const img=create('img'); img.src='assets/images/'+item.image;img.alt=item.title;img.loading='lazy';img.width=1122;img.height=1402;
    const copy=create('div','story-copy'); copy.append(create('span','year',item.year),create('h3','',item.title),create('p','',item.text));article.append(img,copy);$('#timeline').append(article);
  });
  config.schedule.forEach(item=>{const li=create('li'),img=create('img'),copy=create('div');img.src='assets/icons/'+item.icon+'.svg';img.alt='';copy.append(create('strong','',item.time),create('span','',item.label));li.append(img,copy);$('#schedule-list').append(li);});
  // 04. Persistencia local. Si el navegador la bloquea, avisamos al usuario.
  const key=suffix=>config.storageKey+'-'+suffix;
  function readMessages(){try{const data=JSON.parse(localStorage.getItem(key('messages'))||'[]');return Array.isArray(data)?data.filter(x=>x && typeof x.name==='string' && typeof x.text==='string'):[];}catch{return [];}}
  const form=$('#rsvp-form');
  form.addEventListener('change',()=>{const declined=form.elements.attendance.value==='No';$('#menu-options').disabled=declined;$('#allergies').disabled=declined;});
  const whatsapp = /^\d{10,15}$/.test(config.whatsapp);
  if(whatsapp){$('#rsvp-submit').textContent='Confirmar por WhatsApp';$('#demo-note').textContent='Al continuar, se abrirá WhatsApp con tu respuesta. Revisa el mensaje y envíalo para confirmar.';}
  form.addEventListener('submit',event=>{
    event.preventDefault();const data=new FormData(form);const name=String(data.get('name')||'').trim();if(!name){$('#guest-name').setCustomValidity('Escribe tu nombre.');$('#guest-name').reportValidity();return;}
    const response={name,attendance:data.get('attendance'),meal:data.get('meal')||'No aplica',allergies:String(data.get('allergies')||'').trim(),savedAt:new Date().toISOString()};
    if(whatsapp){const text=`Hola, soy ${response.name}. Asistencia: ${response.attendance}. Menú: ${response.meal}. Alergias: ${response.allergies||'Ninguna'}.`;window.open('https://wa.me/'+config.whatsapp+'?text='+encodeURIComponent(text),'_blank','noopener,noreferrer');$('#rsvp-status').textContent='Envía el mensaje en WhatsApp para completar tu confirmación.';return;}
    try{localStorage.setItem(key('rsvp'),JSON.stringify(response));$('#rsvp-status').textContent='Respuesta guardada en este navegador. Esta demostración no envía datos a los novios.';}catch{$('#rsvp-status').textContent='No se pudo guardar: el navegador bloqueó el almacenamiento local.';}
  });
  $('#guest-name').addEventListener('input',()=>$('#guest-name').setCustomValidity(''));
  // 05. Libro de firmas local y carrusel manual.
  function renderMessages(){const container=$('#messages');container.replaceChildren();const local=readMessages();const items=[...local,...config.exampleMessages.map(x=>({...x,example:true}))];items.forEach(item=>{const card=create('article','message-card'),top=create('div','message-top');const initials=item.name.split(/\s+/).slice(0,2).map(x=>x[0]||'').join('');top.append(create('span','avatar',initials),create('h3','',item.name));card.append(top,create('p','',item.text),create('small','',item.example?'Mensaje de ejemplo':'Guardado en este dispositivo'));container.append(card);});}
  renderMessages();
  const dialog=$('#message-dialog');$('#open-message').addEventListener('click',()=>dialog.showModal());$('.close-dialog').addEventListener('click',()=>dialog.close());
  $('#message-form').addEventListener('submit',event=>{event.preventDefault();const name=$('#message-name').value.trim(),text=$('#message-text').value.trim();if(!name||!text){$('#message-status').textContent='Escribe tu nombre y un mensaje.';return;}try{const messages=readMessages();messages.unshift({name,text});localStorage.setItem(key('messages'),JSON.stringify(messages.slice(0,100)));renderMessages();event.target.reset();$('#message-status').textContent='';dialog.close();$('#messages').scrollLeft=0;}catch{$('#message-status').textContent='No se pudo guardar el mensaje en este navegador.';}});
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  function move(direction){$('#messages').scrollBy({left:direction*($('#messages').clientWidth*.8),behavior:reducedMotion.matches?'auto':'smooth'});}
  $('#previous-message').addEventListener('click',()=>move(-1));$('#next-message').addEventListener('click',()=>move(1));
})();
