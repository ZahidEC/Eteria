/* MINECRAFT · CUMPLEAÑOS · Comportamientos por secciones. Datos en config.js. */
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
 document.title=`Minecraft · Aventura · ${c.name} cumple ${c.age}`;
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
 const colors=['#72eded','#97dc55','#e7bb61','#68b340','#c9ffff'];
 function resize(){width=innerWidth;height=innerHeight;const ratio=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);if(ctx)ctx.setTransform(ratio,0,0,ratio,0,0);}
 function stop(){cancelAnimationFrame(frame);frame=0;particles=[];if(ctx)ctx.clearRect(0,0,width,height);}
 function draw(now){
  if(paused||document.hidden||!ctx){stop();return;}
  const dt=Math.min((now-last)/16.667,2);last=now;ctx.clearRect(0,0,width,height);
  particles=particles.filter(p=>p.life>0&&p.y<height+30);
  for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=.045*dt;p.rotation+=p.spin*dt;p.life-=dt;
   ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rotation);ctx.fillStyle=p.color;ctx.globalAlpha=Math.min(1,p.life/35);ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size);ctx.restore();}
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
 // 04. Mina: 12 bloques, tres golpes por bloque y tres diamantes.
 const ns='http://www.w3.org/2000/svg';
 let mineBlocks=[],diamondTotal=0;
 function pixelIcon(name){const svg=document.createElementNS(ns,'svg');svg.classList.add('pixel');svg.setAttribute('aria-hidden','true');const use=document.createElementNS(ns,'use');use.setAttribute('href','#i-'+name);svg.append(use);return svg;}
 function miningParticles(button,diamond){
  if(paused||!ctx)return;
  const rect=button.getBoundingClientRect();
  for(let i=0;i<18;i++)particles.push({x:rect.left+rect.width/2,y:rect.top+rect.height/2,vx:(Math.random()-.5)*7,vy:-2-Math.random()*4,rotation:0,spin:0,size:3+Math.random()*5,color:diamond?'#66ecec':['#707d69','#a4b69a','#414d3e'][i%3],life:25+Math.random()*20});
  particles=particles.slice(-300);if(!frame){last=performance.now();frame=requestAnimationFrame(draw);}
 }
 function resetMine(){
  diamondTotal=0;$('#diamond-count').textContent='0';$('#mine-progress').style.width='0%';$('#chest-open').disabled=true;$('#chest-label').textContent='COFRE BLOQUEADO';$('#loot-note').textContent='Encuentra los diamantes para desbloquear tu invitación especial.';$('#mine-status').textContent='Elige un bloque para empezar.';
  const contents=['diamond','diamond','diamond','apple','apple','grass','grass','torch','xp','xp','cake','chest'];
  for(let i=contents.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[contents[i],contents[j]]=[contents[j],contents[i]];}
  mineBlocks=contents.map(item=>({item,hits:0}));$('#mine-grid').replaceChildren();
  mineBlocks.forEach((block,index)=>{
   const button=document.createElement('button');button.type='button';button.className='ore-block';button.dataset.hits='0';button.setAttribute('aria-label',`Picar bloque ${index+1}, 0 de 3 golpes`);
   const crack=document.createElement('span');crack.className='cracks';crack.setAttribute('aria-hidden','true');const number=document.createElement('span');number.className='block-number';number.textContent=String(index+1).padStart(2,'0');number.setAttribute('aria-hidden','true');button.append(crack,number);
   button.addEventListener('click',()=>{
    if(block.hits>=3)return;block.hits++;button.dataset.hits=String(block.hits);button.classList.remove('struck');void button.offsetWidth;button.classList.add('struck');miningParticles(button,false);
    button.setAttribute('aria-label',`Picar bloque ${index+1}, ${block.hits} de 3 golpes`);
    if(block.hits<3){$('#mine-status').textContent=`Bloque ${index+1}: ${block.hits}/3 golpes. ¡Sigue picando!`;return;}
    button.disabled=true;button.classList.add('revealed');button.replaceChildren(pixelIcon(block.item));
    const names={diamond:'diamante',apple:'manzana',grass:'bloque de césped',torch:'antorcha',xp:'experiencia',cake:'pastel',chest:'cofre pequeño'};
    button.setAttribute('aria-label',`Bloque ${index+1} abierto: ${names[block.item]}`);
    if(block.item==='diamond'){
     diamondTotal++;button.classList.add('found');$('#diamond-count').textContent=String(diamondTotal);$('#mine-progress').style.width=(diamondTotal/3*100)+'%';miningParticles(button,true);$('#mine-status').textContent=`¡Diamante encontrado! Llevas ${diamondTotal} de 3.`;
     if(diamondTotal===3){$('#chest-open').disabled=false;$('#chest-label').textContent='¡ABRIR EL COFRE!';$('#loot-note').textContent='¡Misión cumplida! Abre tu cofre para descubrir la recompensa.';$('#mine-status').textContent='¡Los 3 diamantes son tuyos! Ya puedes abrir el cofre.';celebrate();}
    }else{$('#mine-status').textContent=`Encontraste ${names[block.item]}. `+(diamondTotal===3?'¡Tu cofre ya está desbloqueado!':'¡Sigue buscando los diamantes!');}
   });$('#mine-grid').append(button);
  });
 }
 $('#mine-reset').addEventListener('click',resetMine);
 $('#chest-open').addEventListener('click',()=>{if(diamondTotal===3)open('#chest-dialog');});
 $('#reward-rsvp').addEventListener('click',()=>{$('#chest-dialog').close();open('#rsvp-dialog');});resetMine();

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
 $('#calendar').addEventListener('click',()=>{const data=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Minecraft · Aventura//ES','BEGIN:VEVENT',`UID:${date.getTime()}-confeti@invitacion.local`,`DTSTAMP:${utc(new Date())}`,`DTSTART:${utc(date)}`,`DTEND:${utc(end)}`,`SUMMARY:${escape('Cumpleaños de '+c.name)}`,`LOCATION:${escape(c.venue+', '+c.address)}`,'END:VEVENT','END:VCALENDAR'];const url=URL.createObjectURL(new Blob([data.join('\r\n')+'\r\n'],{type:'text/calendar;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='cumpleanos.ics';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);});
 // 07. RSVP: WhatsApp configurable, sin envío automático.
 const whatsapp=/^\d{10,15}$/.test(c.whatsapp);
 if(whatsapp){$('#confirm-note').textContent='Revisa y envía tu mensaje para confirmar.';$('#form-note').textContent='Se abrirá WhatsApp para que revises y envíes el mensaje al anfitrión.';$('#send').textContent='Continuar a WhatsApp';$('#rsvp-open').textContent='Confirmar por WhatsApp';}
 $('#rsvp-open').addEventListener('click',()=>open('#rsvp-dialog'));
 $('#attendance').addEventListener('change',()=>{const no=$('#attendance').value==='No';$('#adults').disabled=no;$('#children').disabled=no;});
 $('#adult').addEventListener('input',()=>$('#adult').setCustomValidity(''));
 $('#rsvp-form').addEventListener('submit',e=>{e.preventDefault();const name=$('#adult').value.trim();if(!name){$('#adult').setCustomValidity('Escribe tu nombre.');$('#adult').reportValidity();return;}const f=new FormData(e.currentTarget);const response={adult:name,attendance:f.get('attendance'),adults:f.get('adults')||'0',children:f.get('children')||'0',notes:String(f.get('notes')||'').trim()};
  if(whatsapp){const msg=`¡Hola! Para el cumpleaños de ${c.name}: ${name}. Asistencia: ${response.attendance}. Adultos: ${response.adults}. Niños: ${response.children}. Notas: ${response.notes||'Sin observaciones.'}`;window.open('https://wa.me/'+c.whatsapp+'?text='+encodeURIComponent(msg),'_blank','noopener,noreferrer');$('#form-status').textContent='Revisa y envía el mensaje en WhatsApp para completar tu confirmación.';}
  else{try{localStorage.setItem('minecraft-cumple-rsvp',JSON.stringify(response));$('#form-status').textContent='Guardado solo en este navegador. No se ha enviado al anfitrión.';}catch{$('#form-status').textContent='No se pudo guardar. El navegador bloqueó el almacenamiento; no se envió la respuesta.';}}
 });
})();
