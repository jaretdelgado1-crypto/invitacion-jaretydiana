// CONFIG - Replace GAS_ENDPOINT with your deployed Apps Script URL
const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyoSP7QpQtAVayTTsFkBqU64UUap1l60mZ692kxz-jC0hdbKAl0KBqaD5wm-J4liSto/exec';

// Audio
const audio = document.getElementById('bgAudio');
const playBtn = document.getElementById('playBtn');
playBtn.addEventListener('click', () => {
  if (audio.paused){ audio.play(); playBtn.textContent = '⏸ Pausar canción'; }
  else { audio.pause(); playBtn.textContent = '▶︎ Escuchar canción'; }
});

// Countdown (set target date)
const targetDate = new Date('2025-12-12T17:00:00'); // adjust
function updateCountdown(){
  const now = new Date();
  let diff = targetDate - now;
  if (diff < 0){ document.getElementById('countdownTimer').textContent = '¡Ya es el día!'; return; }
  const days = Math.floor(diff / (1000*60*60*24));
  diff -= days*(1000*60*60*24);
  const hours = Math.floor(diff / (1000*60*60));
  diff -= hours*(1000*60*60);
  const minutes = Math.floor(diff / (1000*60));
  diff -= minutes*(1000*60);
  const seconds = Math.floor(diff/1000);
  document.getElementById('countdownTimer').textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
}
setInterval(updateCountdown,1000);
updateCountdown();

// Simple calendar - shows month with clickable day that opens Add to Calendar link
function buildCalendar(year, month){
  const cal = document.getElementById('calendar');
  cal.innerHTML = '';
  const first = new Date(year, month, 1);
  const last = new Date(year, month+1, 0);
  const monthName = first.toLocaleString('es-ES',{month:'long'});
  const header = document.createElement('div');
  header.innerHTML = `<strong>${monthName} ${year}</strong>`;
  cal.appendChild(header);
  const grid = document.createElement('div');
  grid.style.display='grid';
  grid.style.gridTemplateColumns='repeat(7,1fr)';
  grid.style.gap='6px';
  const days = ['Lun','Mar','Mie','Jue','Vie','Sab','Dom'];
  days.forEach(d=>{const el=document.createElement('div');el.style.fontWeight='700';el.style.fontSize='12px';el.textContent=d;grid.appendChild(el)});
  let startIndex = (first.getDay()+6)%7;
  for(let i=0;i<startIndex;i++){const b=document.createElement('div');grid.appendChild(b);}
  for(let d=1; d<=last.getDate(); d++){
    const cell=document.createElement('button');
    cell.textContent = d;
    cell.style.padding='8px';
    cell.style.borderRadius='6px';
    cell.style.border='1px solid #eee';
    cell.style.background='#fff';
    cell.addEventListener('click', ()=>{
      const evStart = new Date(year, month, d, 17,0,0);
      const evEnd = new Date(year, month, d, 20,0,0);
      const details = encodeURIComponent('Ceremonia y celebración - Hotel Costa Plateada');
      const location = encodeURIComponent('Hotel Costa Plateada');
      const gLink = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Boda - Jaret & Diana')}&dates=${formatDateICS(evStart)}/${formatDateICS(evEnd)}&details=${details}&location=${location}`;
      window.open(gLink,'_blank');
    });
    grid.appendChild(cell);
  }
  cal.appendChild(grid);
}

function pad(n){return n<10?'0'+n:n;}
function formatDateICS(d){
  return d.getUTCFullYear().toString()+pad(d.getUTCMonth()+1)+pad(d.getUTCDate())+'T'+pad(d.getUTCHours())+pad(d.getUTCMinutes())+'00Z';
}

const today = new Date();
buildCalendar(today.getFullYear(), today.getMonth());

// RSVP form submission
const form = document.getElementById('rsvpForm');
const msg = document.getElementById('formMsg');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  msg.style.color='black'; msg.textContent='Enviando...';
  const data = new FormData(form);
  const payload = {};
  data.forEach((v,k)=> payload[k]=v);
  payload.timestamp = new Date().toISOString();
  try{
    const resp = await fetch(GAS_ENDPOINT, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    const j = await resp.json();
    if (j.result==='success'){ msg.style.color='green'; msg.textContent='Confirmación recibida. ¡Gracias!'; form.reset(); }
    else { msg.style.color='red'; msg.textContent='Error en servidor.'; }
  } catch(err){
    msg.style.color='red'; msg.textContent='Error de red: '+err.message;
  }
});
