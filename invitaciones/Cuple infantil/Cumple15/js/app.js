(() => {
'use strict';
const cfg = window.COD_INVITE;
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => Array.from(root.querySelectorAll(s));
let fx = !matchMedia('(prefers-reduced-motion: reduce)').matches;
const state = {mode:'WARZONE',opened:new Set(),gallery:0};
const weapons = {
 rifle:{name:'RIFLE DE ASALTO',desc:'Versátil y preciso. Tu mejor aliado en el campo de juego.',art:'assets/img/weapon-rifle.svg',tier:'ÉPICO ◆'},
 sniper:{name:'FRANCOTIRADOR',desc:'Una clase para los operadores que dominan cada objetivo.',art:'assets/img/weapon-sniper.svg',tier:'LEGENDARIO ◆'},
 smg:{name:'SUBFUSIL',desc:'Ligero, veloz y perfecto para desafíos contrarreloj.',art:'assets/img/weapon-smg.svg',tier:'RARO ◆'},
 shield:{name:'ESCUDO TÁCTICO',desc:'Defiende a todo tu escuadrón y conquista la misión.',art:'assets/img/weapon-shield.svg',tier:'ÉPICO ◆'}
};
const picPaths = Array.from({length:4}, (_,i)=>`assets/img/nino-ejemplo-${i+1}.webp`);
function pad(v){return String(v).padStart(2,'0')}
function txt(id,v){const e=document.getElementById(id);if(e)e.textContent=v}
function toast(s){const e=$('#toast');e.textContent=s;e.classList.add('visible');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('visible'),2800)}
function dateTime(time=cfg.hora){return new Date(`${cfg.fecha}T${time}:00`)}
function showDate(){const date=dateTime();const pretty = new Intl.DateTimeFormat('es-MX',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(date).toLocaleUpperCase('es-MX');
 txt('heroName',cfg.nombre);txt('heroAge',cfg.edad);txt('operatorName',cfg.nombre);txt('operatorLevel',cfg.edad);txt('idLabel',`${cfg.nombre} // NIV. ${cfg.edad}`);
 txt('eventDate',pretty);txt('eventTime',`${cfg.hora} HRS`);txt('eventVenue',cfg.lugar);$('#mapLink').href=cfg.mapsUrl;
}
function counter(){const ms=dateTime()-new Date();const days=Math.floor(Math.max(0,ms)/86400000);const hrs=Math.floor(Math.max(0,ms)%86400000/3600000);const min=Math.floor(Math.max(0,ms)%3600000/60000);const sec=Math.floor(Math.max(0,ms)%60000/1000);
 txt('cdDays',pad(days));txt('cdHours',pad(hrs));txt('cdMinutes',pad(min));txt('cdSeconds',pad(sec));if(ms<=0)txt('countdownLabel','¡La misión ha comenzado! Nos vemos en el campo de fiesta.');}
function initCalendar(){ $('#calendarBtn').addEventListener('click',()=>{
 const start=dateTime().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
 const end=dateTime(cfg.horaFin).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
 const qs=new URLSearchParams({action:'TEMPLATE',text:`Operación cumpleaños de ${cfg.nombre}`,dates:`${start}/${end}`,details:cfg.mensajeInvitacion,location:cfg.direccion});
 window.open(`https://calendar.google.com/calendar/render?${qs.toString()}`,'_blank','noopener');});}
function initNav(){const b=$('#menuToggle'),n=$('#nav');b.addEventListener('click',()=>{const o=n.classList.toggle('is-open');b.setAttribute('aria-expanded',String(o));});$$('#nav a').forEach(a=>a.addEventListener('click',()=>{n.classList.remove('is-open');b.setAttribute('aria-expanded','false');}));}
function initArsenal(){$$('.loadout-option').forEach(btn=>btn.addEventListener('click',()=>{const data=weapons[btn.dataset.weapon];$$('.loadout-option').forEach(e=>{e.classList.remove('is-active');e.querySelector('.equip-state').textContent='EQUIPAR +'});btn.classList.add('is-active');btn.querySelector('.equip-state').textContent='EQUIPADO ✓';$('#weaponArt').src=data.art;$('#weaponName').textContent=data.name;$('#weaponDesc').textContent=data.desc;$('.weapon-tier').textContent=data.tier;toast(`${data.name} equipado`);burst(btn,10);}));}
function initModes(){$$('.mode-card').forEach(btn=>btn.addEventListener('click',()=>{$$('.mode-card').forEach(e=>e.classList.remove('is-selected'));btn.classList.add('is-selected');state.mode=btn.dataset.mode;txt('chosenMode',state.mode);$('#favoriteMode').value=state.mode;toast('MODO SELECCIONADO // '+state.mode);}));
 $$('img[data-fallback]').forEach(im=>{ im.addEventListener('error',()=>{if(im.dataset.fallback && !im.dataset.didFallback){im.dataset.didFallback='1';im.src=im.dataset.fallback;} });});}
function burst(source,n=20){if(!fx)return;const r=source.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;for(let i=0;i<n;i++){const e=document.createElement('i');e.className='particle';const angle=Math.random()*6.283,dist=45+Math.random()*175;e.style.cssText=`--x:${Math.cos(angle)*dist}px;--y:${Math.sin(angle)*dist}px;--rotate:${Math.round(Math.random()*720)}deg;left:${x}px;top:${y}px`;document.body.appendChild(e);setTimeout(()=>e.remove(),950)}}
function initCrates(){const count=$('#crateCount'),bar=$('#missionProgress'),claim=$('#claimReward');$$('.crate').forEach(c=>c.addEventListener('click',()=>{const i=Number(c.dataset.crate);if(state.opened.has(i))return;state.opened.add(i);c.classList.add('opened');$('.crate-image b',c).textContent='✓';$('.crate-small',c).textContent='INSIGNIA ENCONTRADA';count.textContent=`${state.opened.size} / 3 INSIGNIAS`;bar.style.width=`${state.opened.size/3*100}%`;burst(c,36);if(state.opened.size===3){claim.disabled=false;toast('¡TODAS LAS INSIGNIAS CONSEGUIDAS!');}else toast('INSIGNIA RECOGIDA +1');}));
 claim.addEventListener('click',()=>{$('#rewardDialog').showModal();burst(claim,48)});$('#rewardConfirm').addEventListener('click',()=>$('#rewardDialog').close());}
function changePhoto(next){state.gallery=(next+picPaths.length)%picPaths.length;$('#galleryModalImg').src=picPaths[state.gallery];txt('galleryModalIndex',`${pad(state.gallery+1)} / ${pad(picPaths.length)}`);}
function initGallery(){$$('.gallery-photo').forEach((b,i)=>b.addEventListener('click',()=>{changePhoto(i);$('#galleryDialog').showModal();}));$('#galleryPrev').addEventListener('click',()=>changePhoto(state.gallery-1));$('#galleryNext').addEventListener('click',()=>changePhoto(state.gallery+1));$$('[data-close]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));$$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d)d.close()}));}
function initRSVP(){$('#rsvpForm').addEventListener('submit',e=>{e.preventDefault();const name=$('#guestName').value.trim();if(!name){toast('Escribe tu nombre para continuar');return;}
 if(!cfg.whatsapp || !/^\d{10,15}$/.test(cfg.whatsapp)){toast('Configura tu número en js/config.js antes de enviar.');return;}
 const msg=[`¡Hola! 🎮 Vengo de la invitación de ${cfg.nombre}.`,'',`👤 Invitado: ${name}`,`✅ Asistencia: ${$('#guestStatus').value}`,`👥 Acompañantes: ${$('#guestCompanions').value}`,`🎯 Modo favorito: ${state.mode}`,`💬 Mensaje: ${$('#guestMessage').value.trim() || '¡Nos vemos en la misión!'}`].join('\n');
 window.open(`https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent(msg)}`,'_blank','noopener');});}
function initFX(){$('#effectsToggle').addEventListener('click',()=>{fx=!fx;$('#effectsToggle').textContent=`✦ EFECTOS: ${fx?'ON':'OFF'}`;toast(fx?'Efectos activados':'Efectos pausados')});}
function init(){showDate();counter();setInterval(counter,1000);initCalendar();initNav();initArsenal();initModes();initCrates();initGallery();initRSVP();initFX();}
document.addEventListener('DOMContentLoaded',init);
})();
