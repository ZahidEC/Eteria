(() => {
'use strict';
const config=window.ETERIA, models=window.CATALOGO;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const url=p=>p.split('/').map(encodeURIComponent).join('/');
const money=n=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(n);
const contact=model=>'https://wa.me/'+config.whatsapp+'?text='+encodeURIComponent(model?`Hola, Éteria. Me interesa la invitación «${model.name}» (${model.folder}, ${model.category}) de ${money(config.precio)} MXN. Quisiera personalizarla para mi evento.`:'Hola, Éteria. Quisiera información sobre sus invitaciones digitales de '+money(config.precio)+' MXN.');
let saved=new Set();try{const data=JSON.parse(localStorage.getItem('eteria-favoritos')||'[]');if(Array.isArray(data))saved=new Set(data.filter(id=>models.some(m=>m.id===id)));}catch{}
let category='todos',onlyFavorites=false;
const themes={todos:['ELIGE EL COMIENZO DE TU HISTORIA','Un universo de <em>posibilidades.</em>','Cada celebración tiene su propia magia.<br>Encuentra la que se parece a ti.'],bodas:['PARA EL SÍ MÁS IMPORTANTE','El inicio de <em>su siempre.</em>','Románticas, clásicas o llenas de personalidad.<br>Una invitación tan única como su historia.'],infantil:['AQUÍ COMIENZA LA DIVERSIÓN','¡Una fiesta de <em>otro mundo!</em>','Pequeños protagonistas. Aventuras enormes.<br>Elige su universo favorito y empieza a jugar.'],xv:['UNA NOCHE QUE SERÁ SOLO TUYA','Quince años. <em>Mil sueños.</em>','Brillo, ilusión y un toque de magia.<br>Encuentra el diseño que te haga sentir tú.']};
function updateCount(){$('#fav-count').textContent=saved.size;}
function render(){
 const query=$('#search').value.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
 let items=models.filter(m=>(category==='todos'||m.category===category)&&(!onlyFavorites||saved.has(m.id))&&(m.name+' '+m.folder+' '+m.category).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(query));
 if($('#sort').value==='az')items.sort((a,b)=>a.name.localeCompare(b.name,'es'));
 $('#results').textContent=items.length+' '+(items.length===1?'diseño para tu celebración':'diseños para tu celebración')+(onlyFavorites?' · Tus favoritos':'');
 $('#grid').innerHTML=items.map((m,i)=>`<article class="card" style="animation-delay:${Math.min(i,6)*35}ms"><div class="card-art"><span class="card-label">${{bodas:'BODAS',infantil:'INFANTILES',xv:'XV AÑOS'}[m.category]} · ${escape(m.folder)}</span><button class="cover-button" data-preview="${m.id}" aria-label="Ver ${escape(m.name)}"><img src="${url(m.cover)}" loading="lazy" decoding="async" alt="Portada de ${escape(m.name)}"></button><button class="card-fav" data-save="${m.id}" aria-label="${saved.has(m.id)?'Quitar de':'Guardar en'} favoritos: ${escape(m.name)}" aria-pressed="${saved.has(m.id)}">${saved.has(m.id)?'♥':'♡'}</button></div><div class="card-content"><div class="card-topline"><h3>${escape(m.name)}</h3><span class="card-price">${money(config.precio)} <small>MXN</small></span></div><div class="card-meta">PERSONALIZADA PARA TU GRAN DÍA</div><div class="card-actions"><button data-preview="${m.id}">Explorar diseño ↗</button><a href="${contact(m)}" target="_blank" rel="noopener">Lo quiero ♡</a></div></div></article>`).join('');
 $('#empty').hidden=items.length>0;updateCount();
}
function setCategory(value){category=themes[value]?value:'todos';document.body.dataset.theme=category;$$('[data-category]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.category===category));const t=themes[category];$('#collection-kicker').textContent=t[0];$('#collection-title').innerHTML=t[1];$('#collection-description').innerHTML=t[2];render();}
$$('[data-category]').forEach(b=>b.addEventListener('click',()=>{setCategory(b.dataset.category);const u=new URL(location.href);if(category==='todos')u.searchParams.delete('coleccion');else u.searchParams.set('coleccion',category);history.replaceState(null,'',u);}));
$('#search').addEventListener('input',render);$('#sort').addEventListener('change',render);
$('#favorites').addEventListener('click',()=>{onlyFavorites=!onlyFavorites;$('#favorites').setAttribute('aria-pressed',onlyFavorites);render();});
$('#reset').addEventListener('click',()=>{$('#search').value='';onlyFavorites=false;$('#favorites').setAttribute('aria-pressed',false);setCategory('todos');const u=new URL(location.href);u.searchParams.delete('coleccion');history.replaceState(null,'',u);});
let opener=null;
function preview(m,button){opener=button;$('#preview-name').textContent=m.name;$('#demo-frame').src=url(m.path);$('#demo-frame').title='Vista previa de '+m.name;$('#open-demo').href=url(m.path);$('#order-demo').href=contact(m);setDevice('mobile');$('#preview').showModal();document.body.classList.add('modal-open');}
$('#grid').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.preview){preview(models.find(m=>m.id===b.dataset.preview),b);}if(b.dataset.save){const id=b.dataset.save;saved.has(id)?saved.delete(id):saved.add(id);try{localStorage.setItem('eteria-favoritos',JSON.stringify([...saved]));}catch{}render();const replacement=$(`[data-save="${id}"]`);if(replacement)replacement.focus();else $('#favorites').focus();}});
$('#close-preview').addEventListener('click',()=>$('#preview').close());
$('#preview').addEventListener('close',()=>{$('#demo-frame').src='about:blank';document.body.classList.remove('modal-open');if(opener?.isConnected)opener.focus();});
$('#preview').addEventListener('click',e=>{if(e.target===$('#preview')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
function setDevice(type){$('.frame-stage').classList.toggle('desktop',type==='desktop');$$('[data-device]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.device===type));}
$$('[data-device]').forEach(b=>b.addEventListener('click',()=>setDevice(b.dataset.device)));
$$('[data-contact]').forEach(a=>{a.href=contact();a.target='_blank';a.rel='noopener';});
$$('[data-price]').forEach(e=>e.textContent=money(config.precio));$$('[data-half]').forEach(e=>e.textContent=money(config.anticipo)+' MXN');$$('[data-rest]').forEach(e=>e.textContent=money(config.precio-config.anticipo)+' MXN');$$('[data-rounds]').forEach(e=>e.textContent=config.rondasCambios);$$('[data-days]').forEach(e=>e.textContent=config.anticipacionDias+' días');$('#hosting-note').textContent=config.alojamiento;$('#year').textContent=new Date().getFullYear();
$('#motion').addEventListener('click',()=>{const paused=document.body.classList.toggle('paused');$('#motion').setAttribute('aria-pressed',paused);$('#motion').textContent=paused?'Activar efectos':'Pausar efectos';});
// Envía una propuesta a medida; el visitante confirma el envío en WhatsApp.
const ideaInput=$('#idea-description');
ideaInput.addEventListener('input',()=>{ideaInput.setCustomValidity('');$('#idea-count').textContent=ideaInput.value.length+' / 1500';});
$('#idea-form').addEventListener('submit',event=>{
 event.preventDefault();
 const idea=ideaInput.value.trim();
 if(!idea){ideaInput.setCustomValidity('Cuéntanos un poco sobre tu idea.');ideaInput.reportValidity();return;}
 const message=`Hola, Éteria. Me gustaría una invitación con una temática personalizada.\n\nCelebración: ${$('#idea-event').value}\nMi idea: ${idea}\n\n¿Podemos revisar el diseño, el precio y la fecha de entrega?`;
 window.open('https://wa.me/'+config.whatsapp+'?text='+encodeURIComponent(message),'_blank','noopener,noreferrer');
});
setCategory(new URLSearchParams(location.search).get('coleccion')||'todos');
})();
