/* FORTNITE · CUMPLEAÑOS · Comportamientos por secciones. Datos en config.js. */
(() => {
 'use strict';
 const c=window.PARTY, $=s=>document.querySelector(s);
 const fill=(s,t)=>document.querySelectorAll(s).forEach(el=>el.textContent=t);
 const safe=s=>{try{const u=new URL(s);return u.protocol==='https:'?u.href:'';}catch{return '';}};
 // 01. Información de la fiesta y cuenta regresiva.
 const date=new Date(c.date),end=new Date(c.end);
 const format=(d,o)=>new Intl.DateTimeFormat('es-MX',{timeZone:c.timeZone,...o}).format(d);
 fill('[data-name]',c.name);fill('[data-age]',c.age);fill('[data-venue]',c.venue);fill('[data-address]',c.address);
 fill('[data-date]',format(date,{day:'numeric',month:'long',year:'numeric'}));
 const time=d=>format(d,{hour:'2-digit',minute:'2-digit',hour12:false});
 fill('[data-hours]',`${time(date)} a ${time(end)}`);
 document.title=`Fortnite · Victoria · ${c.name} cumple ${c.age}`;
 if(safe(c.mapsUrl)){$('#map').href=safe(c.mapsUrl);$('#map').hidden=false;$('#map-pending').hidden=true;}
 function countdown(){const n=Math.max(0,date-Date.now());[Math.floor(n/86400000),Math.floor(n/3600000)%24,Math.floor(n/60000)%60,Math.floor(n/1000)%60].forEach((v,i)=>$('#'+['days','hours','minutes','seconds'][i]).textContent=String(v).padStart(2,'0'));if(!n)$('#count-note').textContent='¡Llegó el día de celebrar!';}
 countdown();setInterval(countdown,1000);
 // 02. Menú y ventanas: Escape, foco nativo y bloqueo de fondo.
 $('#menu').addEventListener('click',()=>{const show=$('#nav').classList.toggle('open');$('#menu').setAttribute('aria-expanded',String(show));$('#menu').setAttribute('aria-label',show?'Cerrar menú':'Abrir menú');});
 function closeMenu(){$('#nav').classList.remove('open');$('#menu').setAttribute('aria-expanded','false');$('#menu').setAttribute('aria-label','Abrir menú');}
 document.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',closeMenu));
 addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
 const open=id=>{$(id).showModal();document.body.classList.add('modal-open');};
 document.querySelectorAll('dialog').forEach(d=>{d.querySelector('.close').addEventListener('click',()=>d.close());d.addEventListener('close',()=>document.body.classList.remove('modal-open'));});
 // 03. Confeti Canvas: partículas limitadas, sin dependencias ni bucle permanente.
 const canvas=$('#confetti'),ctx=canvas.getContext('2d'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let paused=reduced.matches,particles=[],frame=0,last=0,width=innerWidth,height=innerHeight;
 const colors=['#ffe344','#60e1ff','#fa67c8','#a879ff','#ffffff'];
 function resize(){width=innerWidth;height=innerHeight;const ratio=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);if(ctx)ctx.setTransform(ratio,0,0,ratio,0,0);}
 function stop(){cancelAnimationFrame(frame);frame=0;particles=[];if(ctx)ctx.clearRect(0,0,width,height);}
 function draw(now){
  if(paused||document.hidden||!ctx){stop();return;}
  const dt=Math.min((now-last)/16.667,2);last=now;ctx.clearRect(0,0,width,height);
  particles=particles.filter(p=>p.life>0&&p.y<height+30);
  for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=.045*dt;p.rotation+=p.spin*dt;p.life-=dt;
   ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rotation);ctx.fillStyle=p.color;ctx.globalAlpha=Math.min(1,p.life/35);ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size*.5);ctx.restore();}
  if(particles.length)frame=requestAnimationFrame(draw);else{frame=0;ctx.clearRect(0,0,width,height);}
 }
 function celebrate(){if(paused||document.hidden||!ctx)return;const count=width<650?85:150;particles=particles.slice(-150);
  for(let i=0;i<count;i++)particles.push({x:Math.random()*width,y:-30-Math.random()*height*.45,vx:(Math.random()-.5)*2.5,vy:2+Math.random()*3.5,rotation:Math.random()*Math.PI,spin:(Math.random()-.5)*.15,size:5+Math.random()*7,color:colors[i%colors.length],life:260+Math.random()*70});
  if(!frame){last=performance.now();frame=requestAnimationFrame(draw);}
 }
 function effects(value){paused=value;document.documentElement.classList.toggle('effects-paused',value);$('#effects').setAttribute('aria-pressed',String(value));$('#effects').textContent=value?'Activar efectos':'Pausar efectos';$('#celebrate').disabled=value;$('#celebrate').textContent=value?'Confeti pausado':'¡Lluvia de confeti! 🎉';if(value)stop();}
 resize();effects(paused);addEventListener('resize',resize);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
 reduced.addEventListener('change',e=>effects(e.matches));$('#effects').addEventListener('click',()=>{effects(!paused);if(!paused)celebrate();});$('#celebrate').addEventListener('click',celebrate);
 setTimeout(celebrate,700);
 // 04. Isla: cuatro zonas, tres cofres diferentes y un pase de invitado.
 const zones=[
  {name:'Pisos Picados',description:'Entre edificios y azoteas: aquí empieza una gran aventura.',item:'pick',loot:'Pico raro'},
  {name:'Parque Placentero',description:'Un aterrizaje tranquilo para reunir al equipo y preparar la fiesta.',item:'potion',loot:'Miniescudo'},
  {name:'Ciudad Comercio',description:'Explora la zona y encuentra equipo para tu escuadrón.',item:'glider',loot:'Ala delta épica'},
  {name:'Balsa Botín',description:'Junto al agua se esconden tesoros para la celebración.',item:'llama',loot:'Llama de botín'}
 ];
 let selectedZone=-1,openedZones=new Set(),selectedRole='Constructor';
 const svgNS='http://www.w3.org/2000/svg';
 function itemIcon(name){const svg=document.createElementNS(svgNS,'svg');svg.classList.add('game-icon');svg.setAttribute('aria-hidden','true');const use=document.createElementNS(svgNS,'use');use.setAttribute('href','#i-'+name);svg.append(use);return svg;}
 function selectZone(index){
  selectedZone=index;const zone=zones[index];
  document.querySelectorAll('[data-zone]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.zone)===index)));
  $('#zone-title').textContent=zone.name;$('#zone-description').textContent=zone.description;
  const complete=openedZones.size>=3,opened=openedZones.has(index);
  $('#loot-open').disabled=complete||opened;
  $('#loot-button-label').textContent=complete?'¡EQUIPO COMPLETO!':opened?'COFRE YA EXPLORADO':'ABRIR COFRE';
  $('#loot-status').textContent=complete?'Tu pase épico está desbloqueado.':opened?'Ya encontraste botín aquí. Elige otra zona.':`Aterrizaje marcado en ${zone.name}. ¡Abre su cofre!`;
 }
 document.querySelectorAll('[data-zone]').forEach(button=>button.addEventListener('click',()=>selectZone(Number(button.dataset.zone))));
 $('#loot-open').addEventListener('click',()=>{
  if(selectedZone<0||openedZones.has(selectedZone)||openedZones.size>=3)return;
  const zone=zones[selectedZone];openedZones.add(selectedZone);
  const slot=$('#loot-slots').children[openedZones.size-1];slot.replaceChildren(itemIcon(zone.item));slot.classList.add('filled');slot.setAttribute('aria-label',zone.loot);
  document.querySelector(`[data-zone="${selectedZone}"]`).classList.add('opened');
  $('#loot-count').textContent=`${openedZones.size} / 3`;$('#loot-open').disabled=true;$('#loot-button-label').textContent='COFRE EXPLORADO';
  $('#loot-status').textContent=`¡Encontraste ${zone.loot}! Visita una zona diferente para seguir explorando.`;
  if(openedZones.size===3){$('#pass-open').hidden=false;$('#loot-button-label').textContent='¡EQUIPO COMPLETO!';$('#loot-status').textContent='¡Misión cumplida! Tu pase épico de cumpleaños ya está disponible.';celebrate();}
 });
 $('#map-reset').addEventListener('click',()=>{
  selectedZone=-1;openedZones=new Set();$('#zone-title').textContent='MARCA TU ATERRIZAJE';$('#zone-description').textContent='Toca uno de los cuatro puntos del mapa para empezar.';
  $('#loot-open').disabled=true;$('#loot-button-label').textContent='PRIMERO ELIGE UNA ZONA';$('#loot-count').textContent='0 / 3';$('#pass-open').hidden=true;$('#loot-status').textContent='Busca botín en tres zonas diferentes.';
  document.querySelectorAll('[data-zone]').forEach(button=>{button.setAttribute('aria-pressed','false');button.classList.remove('opened');});
  [...$('#loot-slots').children].forEach(slot=>{slot.replaceChildren();slot.textContent='?';slot.classList.remove('filled');slot.removeAttribute('aria-label');});
 });
 $('#pass-open').addEventListener('click',()=>{if(openedZones.size>=3)open('#pass-dialog');});
 $('#reward-rsvp').addEventListener('click',()=>{$('#pass-dialog').close();open('#rsvp-dialog');});
 document.querySelectorAll('[data-role]').forEach(button=>button.addEventListener('click',()=>{
  selectedRole=button.dataset.role;document.querySelectorAll('[data-role]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  $('#role-status').textContent=`Tu rol: ${selectedRole}. ¡El equipo cuenta contigo!`;
 }));

 // 05. Fotos completas: dos imágenes, flechas y gesto táctil.
 c.photos.slice(0,2).forEach((p,i)=>{const img=$(i===0?'#hero-photo img':'#venue-photo img');img.src=p.src;img.alt=p.title;});
 let photoIndex=0;
 function showPhoto(i){if(!c.photos.length)return;photoIndex=(i+c.photos.length)%c.photos.length;const p=c.photos[photoIndex];$('#photo').src=p.src;$('#photo').alt=p.title;$('#photo-caption').textContent=`${p.title} · ${photoIndex+1}/${c.photos.length}`;}
 function gallery(i){if(!c.photos.length)return;showPhoto(i);open('#photo-dialog');}
 $('#hero-photo').addEventListener('click',()=>gallery(0));$('#venue-photo').addEventListener('click',()=>gallery(1));
 $('#prev').addEventListener('click',()=>showPhoto(photoIndex-1));$('#next').addEventListener('click',()=>showPhoto(photoIndex+1));
 $('#photo-dialog').addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();showPhoto(photoIndex+(e.key==='ArrowRight'?1:-1));}});
 let touch=null;$('#photo').addEventListener('touchstart',e=>{touch={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});$('#photo').addEventListener('touchend',e=>{if(!touch)return;const dx=e.changedTouches[0].clientX-touch.x,dy=e.changedTouches[0].clientY-touch.y;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy))showPhoto(photoIndex+(dx<0?1:-1));touch=null;},{passive:true});
 // 06. Regalos y archivo de calendario.
 $('#gift-ideas').textContent=c.giftIdeas;if(safe(c.giftUrl)){$('#gift-link').href=safe(c.giftUrl);$('#gift-link').hidden=false;}$('#gift-open').addEventListener('click',()=>open('#gift-dialog'));
 const utc=d=>d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
 const escape=s=>String(s).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
 $('#calendar').addEventListener('click',()=>{const data=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Fortnite · Victoria//ES','BEGIN:VEVENT',`UID:${date.getTime()}-confeti@invitacion.local`,`DTSTAMP:${utc(new Date())}`,`DTSTART:${utc(date)}`,`DTEND:${utc(end)}`,`SUMMARY:${escape('Cumpleaños de '+c.name)}`,`LOCATION:${escape(c.venue+', '+c.address)}`,'END:VEVENT','END:VCALENDAR'];const url=URL.createObjectURL(new Blob([data.join('\r\n')+'\r\n'],{type:'text/calendar;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='cumpleanos.ics';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);});
 // 07. RSVP: WhatsApp configurable, sin envío automático.
 const whatsapp=/^\d{10,15}$/.test(c.whatsapp);
 if(whatsapp){$('#confirm-note').textContent='Revisa y envía tu mensaje para confirmar.';$('#form-note').textContent='Se abrirá WhatsApp para que revises y envíes el mensaje al anfitrión.';$('#send').textContent='Continuar a WhatsApp';$('#rsvp-open').textContent='Confirmar por WhatsApp';}
 $('#rsvp-open').addEventListener('click',()=>open('#rsvp-dialog'));
 $('#attendance').addEventListener('change',()=>{const no=$('#attendance').value==='No';$('#adults').disabled=no;$('#children').disabled=no;});
 $('#adult').addEventListener('input',()=>$('#adult').setCustomValidity(''));
 $('#rsvp-form').addEventListener('submit',e=>{e.preventDefault();const name=$('#adult').value.trim();if(!name){$('#adult').setCustomValidity('Escribe tu nombre.');$('#adult').reportValidity();return;}const f=new FormData(e.currentTarget);const response={adult:name,attendance:f.get('attendance'),adults:f.get('adults')||'0',children:f.get('children')||'0',notes:String(f.get('notes')||'').trim(),role:selectedRole,landing:selectedZone>=0?zones[selectedZone].name:'Sin elegir'};
  if(whatsapp){const msg=`¡Hola! Para el cumpleaños de ${c.name}: ${name}. Asistencia: ${response.attendance}. Adultos: ${response.adults}. Niños: ${response.children}. Rol: ${response.role}. Aterrizaje favorito: ${response.landing}. Notas: ${response.notes||'Sin observaciones.'}`;window.open('https://wa.me/'+c.whatsapp+'?text='+encodeURIComponent(msg),'_blank','noopener,noreferrer');$('#form-status').textContent='Revisa y envía el mensaje en WhatsApp para completar tu confirmación.';}
  else{try{localStorage.setItem('fortnite-cumple-rsvp',JSON.stringify(response));$('#form-status').textContent='Guardado solo en este navegador. No se ha enviado al anfitrión.';}catch{$('#form-status').textContent='No se pudo guardar. El navegador bloqueó el almacenamiento; no se envió la respuesta.';}}
 });
})();
