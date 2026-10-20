const cfg = window.invitationConfig;
const qs = (s,p=document)=>p.querySelector(s);
const qsa = (s,p=document)=>[...p.querySelectorAll(s)];
let totalCoins = 0;
let selectedGame = 'Brookhaven';

function setText(id,value){ const el=document.getElementById(id); if(el) el.textContent=value; }
function updateCoinsDisplay(){ setText('coinCount', String(totalCoins)); setText('coinMini', String(totalCoins)); }

function hydrate(){
  setText('heroName', cfg.celebrantName);
  setText('heroAge', cfg.age);
  setText('eventDate', cfg.eventDate);
  setText('eventTime', cfg.eventTime);
  setText('eventPlace', cfg.eventPlace);
  setText('profileName', cfg.celebrantName);
  setText('profileAge', `${cfg.age} años`);
  setText('passTitle', cfg.passTitle);
  setText('passDate', cfg.eventDate.replace(/^[^\d]*/, '').replace(' de noviembre de 2026',' NOV 2026'));
  setText('passTime', cfg.eventTime);
  setText('leaderName', cfg.celebrantName);
  setText('boardName1', cfg.celebrantName);
  setText('selectedGame', selectedGame);
  setText('selectedGameTag', selectedGame);
  const favInput = qs('#favoriteGameInput'); if(favInput) favInput.value = selectedGame;
  const favMirror = qs('#favoriteGameMirror'); if(favMirror) favMirror.value = selectedGame;
  updateCoinsDisplay();
}

function initMenu(){
  const toggle=qs('.menu-toggle');
  const nav=qs('.nav');
  toggle?.addEventListener('click',()=>{
    const open=nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  qsa('.nav a').forEach(link=>link.addEventListener('click',()=>{
    nav.classList.remove('is-open');
    toggle?.setAttribute('aria-expanded','false');
  }));
}

function startCountdown(){
  const target = new Date(cfg.eventISO).getTime();
  const tick = ()=>{
    const diff = Math.max(0, target - Date.now());
    const days = Math.floor(diff/86400000);
    const hours = Math.floor((diff%86400000)/3600000);
    const minutes = Math.floor((diff%3600000)/60000);
    const seconds = Math.floor((diff%60000)/1000);
    setText('days', String(days).padStart(2,'0'));
    setText('hours', String(hours).padStart(2,'0'));
    setText('minutes', String(minutes).padStart(2,'0'));
    setText('seconds', String(seconds).padStart(2,'0'));
  };
  tick();
  setInterval(tick, 1000);
}

function initCalendar(){
  qs('#calendarBtn')?.addEventListener('click',()=>{
    const start = new Date(cfg.eventISO).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
    const end = new Date(cfg.eventEndISO).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Cumple Roblox de ' + cfg.celebrantName)}&dates=${start}/${end}&details=${encodeURIComponent('Acompáñanos a una fiesta temática de Roblox.')}&location=${encodeURIComponent(cfg.eventPlace)}`;
    window.open(url,'_blank');
  });
}

function initAvatars(){
  const image = qs('#avatarPreview');
  const title = qs('#avatarTitle');
  const desc = qs('#avatarDesc');
  qsa('.avatar-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      qsa('.avatar-btn').forEach(b=>b.classList.remove('is-active'));
      btn.classList.add('is-active');
      image.src = btn.dataset.image;
      title.textContent = btn.dataset.title;
      desc.textContent = btn.dataset.desc;
    });
  });
}

function spawnCoins(originX = window.innerWidth / 2, originY = window.innerHeight / 2, count = 18){
  for(let i=0;i<count;i++){
    const coin=document.createElement('span');
    coin.className='fx-coin';
    const size = 12 + Math.random()*14;
    coin.style.cssText=`width:${size}px;height:${size}px;left:${originX}px;top:${originY}px;`;
    document.body.appendChild(coin);
    requestAnimationFrame(()=>{
      coin.style.transform=`translate(${(Math.random()-.5)*320}px, ${(Math.random()-.5)*240}px) rotate(${Math.random()*360}deg)`;
      coin.style.opacity='0';
    });
    setTimeout(()=>coin.remove(),1300);
  }
}

function addCoins(amount, x = window.innerWidth / 2, y = window.innerHeight / 2){
  totalCoins += amount;
  updateCoinsDisplay();
  spawnCoins(x, y, Math.min(28, Math.max(10, Math.floor(amount / 8))));
}

function initDailyReward(){
  const btn = qs('#dailyRewardBtn');
  let claimed = false;
  btn?.addEventListener('click',()=>{
    if(claimed) return;
    claimed = true;
    const rect = btn.getBoundingClientRect();
    addCoins(100, rect.left + rect.width/2, rect.top + rect.height/2);
    btn.textContent = 'Recompensa reclamada';
    btn.disabled = true;
  });
}

function initFavoriteGames(){
  qsa('.fav-card').forEach(card=>{
    card.addEventListener('click',()=>{
      qsa('.fav-card').forEach(c=>c.classList.remove('is-selected'));
      card.classList.add('is-selected');
      selectedGame = card.dataset.game;
      setText('selectedGame', selectedGame);
      setText('selectedGameTag', selectedGame);
      if(qs('#favoriteGameInput')) qs('#favoriteGameInput').value = selectedGame;
      if(qs('#favoriteGameMirror')) qs('#favoriteGameMirror').value = selectedGame;
    });
  });
}

function initObby(){
  const done = new Set();
  const progressCount = qs('#progressCount');
  const progressText = qs('#progressText');
  const rewardBtn = qs('#rewardBtn');
  const rewardModal = qs('#rewardModal');

  qsa('.step-card').forEach(card=>{
    card.addEventListener('click',()=>{
      const step=card.dataset.step;
      if(done.has(step)) return;
      done.add(step);
      card.classList.add('is-done');
      card.querySelector('strong').textContent='¡Completado!';
      card.querySelector('small').textContent='Ganaste 50 coins';
      progressCount.textContent = done.size;
      progressText.textContent = done.size === 5
        ? '¡Terminaste el obby! Ya puedes abrir la recompensa final.'
        : `Llevas ${done.size} nivel${done.size>1?'es':''}. Sigue avanzando.`;
      const rect = card.getBoundingClientRect();
      addCoins(50, rect.left + rect.width/2, rect.top + rect.height/2);
      if(done.size === 5) rewardBtn.disabled = false;
    });
  });

  rewardBtn?.addEventListener('click',()=>{
    rewardModal.showModal();
    addCoins(150);
  });
}

function initGallery(){
  const modal=qs('#galleryModal');
  const modalImage=qs('#modalImage');
  const modalTitle=qs('#modalTitle');
  qsa('.gallery-item').forEach(item=>{
    item.addEventListener('click',()=>{
      modalImage.src=item.dataset.image;
      modalTitle.textContent=item.dataset.title;
      modal.showModal();
    });
  });
}

function initModals(){
  qsa('.modal-close').forEach(btn=>btn.addEventListener('click',()=>btn.closest('dialog').close()));
  qsa('dialog').forEach(d=>{
    d.addEventListener('click',e=>{
      const rect = d.querySelector('.modal__content').getBoundingClientRect();
      const inside = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
      if(!inside) d.close();
    });
  });
}

function initRSVP(){
  qs('#rsvpForm')?.addEventListener('submit',e=>{
    e.preventDefault();
    const name = qs('#guestName').value.trim();
    const status = qs('#guestStatus').value;
    const companions = qs('#guestCompanions').value;
    const message = qs('#guestMessage').value.trim() || 'Sin mensaje';
    if(!name) return;
    const messageText = `Hola, vengo de la invitación de ${cfg.celebrantName}.\n\n*Nombre:* ${name}\n*Asistencia:* ${status}\n*Acompañantes:* ${companions}\n*Juego favorito:* ${selectedGame}\n*Coins desbloqueadas:* ${totalCoins}\n*Mensaje:* ${message}`;
    window.open(`https://wa.me/${cfg.whatsappNumber}?text=${encodeURIComponent(messageText)}`,'_blank');
  });
}

function initEffectsToggle(){
  const btn = qs('#fxToggle');
  let enabled = false;
  btn?.addEventListener('click',()=>{
    enabled = !enabled;
    btn.textContent = enabled ? 'Efectos activados' : 'Activar efectos';
    if(enabled) spawnCoins(window.innerWidth/2, 140, 24);
  });
}

document.addEventListener('DOMContentLoaded',()=>{
  hydrate();
  initMenu();
  startCountdown();
  initCalendar();
  initAvatars();
  initDailyReward();
  initFavoriteGames();
  initObby();
  initGallery();
  initModals();
  initRSVP();
  initEffectsToggle();
});
