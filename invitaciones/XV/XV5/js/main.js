/* BAILE VENECIANO · CAMILA · Comportamientos organizados por sección. */
(() => {
 'use strict';
 const c=window.INVITATION,$=s=>document.querySelector(s);
 const fill=(s,t)=>document.querySelectorAll(s).forEach(el=>el.textContent=t);
 const safe=s=>{try{const u=new URL(s);return u.protocol==='https:'?u.href:'';}catch{return '';}};
 // 01 · Datos, fechas, eventos y calendario.
 const date=new Date(c.date),end=new Date(c.end),format=(d,o)=>new Intl.DateTimeFormat('es-MX',{timeZone:c.timeZone,...o}).format(d);
 fill('[data-name]',c.name);fill('[data-message]',c.message);fill('[data-parents]',c.parents);fill('[data-deadline]',c.deadline);
 fill('[data-date]',format(date,{day:'numeric',month:'long',year:'numeric'}));fill('[data-year]',format(date,{year:'numeric'}));
 fill('[data-dress]',c.dressCode);fill('[data-dress-note]',c.dressNote);document.title=`Baile de Máscaras · ${c.name}`;
 ['ceremony','reception'].forEach(key=>{const event=c[key];['title','time','venue','address'].forEach(field=>fill(`[data-${key}-${field}]`,event[field]));if(safe(event.mapsUrl)){const link=$('#'+key+'-map');link.href=safe(event.mapsUrl);link.hidden=false;}});
 if(safe(c.reception.mapsUrl)){$('#location-map').href=safe(c.reception.mapsUrl);$('#location-map').hidden=false;$('#map-pending').hidden=true;}
 function count(){const n=Math.max(0,date-Date.now());[Math.floor(n/86400000),Math.floor(n/3600000)%24,Math.floor(n/60000)%60,Math.floor(n/1000)%60].forEach((v,i)=>$('#'+['days','hours','minutes','seconds'][i]).textContent=String(v).padStart(2,'0'));if(!n)$('#count-note').textContent='Llegó el día de celebrar este sueño.';}
 count();setInterval(count,1000);
 const utc=d=>d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z'),esc=s=>String(s).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
 $('#calendar').addEventListener('click',()=>{const data=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Mis XV//ES','BEGIN:VEVENT',`UID:${date.getTime()}-xv@invitacion.local`,`DTSTAMP:${utc(new Date())}`,`DTSTART:${utc(date)}`,`DTEND:${utc(end)}`,`SUMMARY:${esc('Mis XV · '+c.name)}`,`LOCATION:${esc(c.ceremony.venue+', '+c.ceremony.address)}`,`DESCRIPTION:${esc('Ceremonia: '+c.ceremony.time+' en '+c.ceremony.venue+'. Recepción: '+c.reception.time+' en '+c.reception.venue+', '+c.reception.address+'.')}`,'END:VEVENT','END:VCALENDAR'];const url=URL.createObjectURL(new Blob([data.join('\r\n')+'\r\n'],{type:'text/calendar;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='mis-xv.ics';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);});
 // 02 · Menú y diálogos nativos: teclado, Escape y devolución de foco.
 function closeMenu(){$('#nav').classList.remove('open');$('#menu').setAttribute('aria-expanded','false');$('#menu').setAttribute('aria-label','Abrir menú');}
 $('#menu').addEventListener('click',()=>{const show=$('#nav').classList.toggle('open');$('#menu').setAttribute('aria-expanded',String(show));$('#menu').setAttribute('aria-label',show?'Cerrar menú':'Abrir menú');});
 document.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',closeMenu));addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
 function open(id){$(id).showModal();document.body.classList.add('modal-open');}
 document.querySelectorAll('dialog').forEach(d=>{d.querySelector('.close').addEventListener('click',()=>d.close());d.addEventListener('close',()=>document.body.classList.remove('modal-open'));});
 let selectedMask='Dorado';$('#curtain-open').addEventListener('click',()=>{const show=$('.hero').classList.toggle('theatre-open');$('#curtain-open').setAttribute('aria-expanded',String(show));$('#curtain-open').textContent=show?'VOLVER A CERRAR EL TELÓN':'QUE COMIENCE EL BAILE ↗';$('#curtain-status').textContent=show?'El escenario está listo. ¡La noche también te pertenece!':'Abre el telón para descubrir el escenario.';});document.querySelectorAll('[data-mask]').forEach(button=>button.addEventListener('click',()=>{selectedMask=button.dataset.mask;document.documentElement.style.setProperty('--mask-accent',button.dataset.color);document.querySelectorAll('[data-mask]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));$('#mask-status').textContent='Tu antifaz: '+selectedMask+'.';}));
 // 03 · Pétalos y brillos sutiles, pausables y sin audio.
 const canvas=$('#petals'),ctx=canvas.getContext('2d'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let paused=reduced.matches,frame=0,last=0,width=innerWidth,height=innerHeight,petals=[];
 function makePetal(initial=false){return{x:Math.random()*width,y:initial?Math.random()*height:-25,size:2+Math.random()*3.5,vy:.18+Math.random()*.35,vx:(Math.random()-.5)*.18,angle:Math.random()*Math.PI,spin:(Math.random()-.5)*.008,phase:Math.random()*6.28,spark:Math.random()>.7};}
 function resize(){width=innerWidth;height=innerHeight;const ratio=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);if(ctx)ctx.setTransform(ratio,0,0,ratio,0,0);petals=Array.from({length:width<650?12:22},()=>makePetal(true));}
 function stop(){cancelAnimationFrame(frame);frame=0;if(ctx)ctx.clearRect(0,0,width,height);}
 function draw(now){if(paused||document.hidden||!ctx){stop();return;}const dt=Math.min((now-last)/16.667,2);last=now;ctx.clearRect(0,0,width,height);
  petals.forEach((p,i)=>{p.y+=p.vy*dt;p.x+=p.vx*dt+Math.sin(now*.0005+p.phase)*.1*dt;p.angle+=p.spin*dt;if(p.y>height+25){petals[i]=makePetal();return;}ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);ctx.globalAlpha=(p.spark?.4:.17)*(.7+.3*Math.sin(now*.001+p.phase));ctx.fillStyle=p.spark?'#e6c77e':'#bc7f94';ctx.beginPath();if(p.spark){ctx.moveTo(0,-p.size);ctx.lineTo(p.size*.25,-p.size*.25);ctx.lineTo(p.size,0);ctx.lineTo(p.size*.25,p.size*.25);ctx.lineTo(0,p.size);ctx.lineTo(-p.size*.25,p.size*.25);ctx.lineTo(-p.size,0);ctx.lineTo(-p.size*.25,-p.size*.25);}else{ctx.ellipse(0,0,p.size,p.size*.45,0,0,Math.PI*2);}ctx.closePath();ctx.fill();ctx.restore();});frame=requestAnimationFrame(draw);
 }
 function start(){if(paused||document.hidden||!ctx||frame)return;last=performance.now();frame=requestAnimationFrame(draw);}
 function setEffects(value){paused=value;document.documentElement.classList.toggle('effects-paused',value);$('#effects').setAttribute('aria-pressed',String(value));$('#effects').textContent=value?'ACTIVAR EFECTOS':'PAUSAR EFECTOS';if(value)stop();else start();}
 resize();setEffects(paused);addEventListener('resize',resize);document.addEventListener('visibilitychange',()=>document.hidden?stop():start());reduced.addEventListener('change',e=>setEffects(e.matches));$('#effects').addEventListener('click',()=>setEffects(!paused));
 // 04 · Apariciones al desplazarse y línea de lectura.
 if('IntersectionObserver' in window){document.documentElement.classList.add('js-reveal');const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}),{threshold:.08});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));}
 let scrollFrame=0;function progress(){const max=document.documentElement.scrollHeight-innerHeight;$('#reading-progress').style.width=(max>0?Math.min(100,scrollY/max*100):0)+'%';scrollFrame=0;}
 addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(progress);},{passive:true});progress();
 // 05 · Galería: imágenes completas, botones, flechas y gesto táctil.
 c.photos.slice(0,3).forEach((p,i)=>{const image=$(['#hero-photo img','#table-photo img','#detail-photo img'][i]);image.src=p.src;image.alt=p.title;});
 if(c.photos[1]){const image=$('.hero-palace');image.src=c.photos[1].src;image.alt=c.photos[1].title;}
 let photoIndex=0;function showPhoto(i){if(!c.photos.length)return;photoIndex=(i+c.photos.length)%c.photos.length;const p=c.photos[photoIndex];$('#photo').src=p.src;$('#photo').alt=p.title;$('#photo-caption').textContent=`${p.title} · ${photoIndex+1}/${c.photos.length}`;}
 function gallery(i){if(!c.photos.length)return;showPhoto(i);open('#photo-dialog');}
 $('#hero-photo').addEventListener('click',()=>gallery(0));$('#detail-photo').addEventListener('click',()=>gallery(2));$('#table-photo').addEventListener('click',()=>gallery(1));$('#prev').addEventListener('click',()=>showPhoto(photoIndex-1));$('#next').addEventListener('click',()=>showPhoto(photoIndex+1));
 $('#photo-dialog').addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();showPhoto(photoIndex+(e.key==='ArrowRight'?1:-1));}});
 let touch=null;$('#photo').addEventListener('touchstart',e=>{touch={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});$('#photo').addEventListener('touchend',e=>{if(!touch)return;const dx=e.changedTouches[0].clientX-touch.x,dy=e.changedTouches[0].clientY-touch.y;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy))showPhoto(photoIndex+(dx<0?1:-1));touch=null;},{passive:true});
 // 06 · Mesa de regalos y confirmación revisable por WhatsApp.
 $('#gift-ideas').textContent=c.giftIdeas;if(safe(c.giftUrl)){$('#gift-link').href=safe(c.giftUrl);$('#gift-link').hidden=false;}$('#gift-open').addEventListener('click',()=>open('#gift-dialog'));$('#rsvp-open').addEventListener('click',()=>open('#rsvp-dialog'));
 const whatsapp=/^\d{10,15}$/.test(c.whatsapp);
 if(whatsapp){$('#form-note').textContent='Se abrirá WhatsApp para que revises y envíes tu confirmación al anfitrión.';$('#send').textContent='CONTINUAR A WHATSAPP';}
 $('#attendance').addEventListener('change',()=>$('#guests').disabled=$('#attendance').value==='No');$('#guest').addEventListener('input',()=>$('#guest').setCustomValidity(''));
 $('#rsvp-form').addEventListener('submit',e=>{e.preventDefault();const name=$('#guest').value.trim();if(!name){$('#guest').setCustomValidity('Escribe tu nombre completo.');$('#guest').reportValidity();return;}const f=new FormData(e.currentTarget),response={name,attendance:f.get('attendance'),guests:f.get('guests')||'0',notes:String(f.get('notes')||'').trim(),mask:selectedMask};
  if(whatsapp){const msg=`¡Hola! Confirmación para los XV de ${c.name}. Nombre: ${name}. Asistencia: ${response.attendance}. Personas: ${response.guests}. Antifaz elegido: ${response.mask}. Mensaje: ${response.notes||'Sin observaciones.'}`;window.open('https://wa.me/'+c.whatsapp+'?text='+encodeURIComponent(msg),'_blank','noopener,noreferrer');$('#form-status').textContent='Revisa y envía el mensaje en WhatsApp para completar la confirmación.';}
  else{try{localStorage.setItem('xv-baile-veneciano-rsvp',JSON.stringify(response));$('#form-status').textContent='Respuesta guardada solo en este navegador. No se ha enviado al anfitrión.';}catch{$('#form-status').textContent='No se pudo guardar la respuesta. El navegador bloqueó el almacenamiento; no se ha enviado.';}}
 });
})();
