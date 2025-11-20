/* script.js - Invitación Jaret & Diana */

// ======= CONFIG ========
const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwEH0XF8-4Ll8UvagzVbTBsLGXN5cKH9aXN9wXeQN-IfysojB5fFFabd9RG3An7BesaBQ/exec'; // <<--- PONÉ AQUI la URL de Apps Script (termina en /exec)
const TARGET_DATE = new Date('2025-12-22T15:00:00'); // 22 dic 2025 15:00 local

// ======= AUDIO / PLAYBACK (Opción C) ========
const audio = document.getElementById('bgAudio');
const tryPlayBtn = document.getElementById('tryPlayBtn');
const muteBtn = document.getElementById('muteBtn');
let attemptedAuto = false;

async function attemptAutoplay(){
  if(attemptedAuto) return;
  attemptedAuto = true;
  try {
    await audio.play();
    tryPlayBtn.textContent = '⏸ Pausar música';
  } catch(err){
    // autoplay blocked, show button (already visible)
    tryPlayBtn.textContent = '🔊 Reproducir música';
  }
}

tryPlayBtn.addEventListener('click', async () => {
  if (audio.paused) {
    await audio.play();
    tryPlayBtn.textContent = '⏸ Pausar música';
  } else {
    audio.pause();
    tryPlayBtn.textContent = '🔊 Reproducir música';
  }
});

muteBtn.addEventListener('click', () => {
  audio.muted = !audio.muted;
  muteBtn.textContent = audio.muted ? '🔇 Silenciar' : '🔈 Sonido';
});

// Try autoplay after a small delay
setTimeout(attemptAutoplay, 500);

// ======= COUNTDOWN =======
function updateCountdown(){
  const now = new Date();
  let diff = TARGET_DATE - now;
  const el = document.getElementById('countdownTimer');
  if (diff <= 0) {
    el.textContent = '¡Ya es el día!';
    return;
  }
  const days = Math.floor(diff / (1000*60*60*24));
  diff -= days*(1000*60*60*24);
  const hours = Math.floor(diff / (1000*60*60));
  diff -= hours*(1000*60*60);
  const minutes = Math.floor(diff / (1000*60));
  diff -= minutes*(1000*60);
  const seconds = Math.floor(diff / 1000);
  el.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
}
setInterval(updateCountdown, 1000);
updateCountdown();

// ======= CALENDAR: apertura Google Calendar / descarga ICS =======
function formatDateICS(d){
  const pad = n => n<10 ? '0'+n : n;
  // Return format YYYYMMDDTHHMMSSZ (UTC)
  const utcY = d.getUTCFullYear();
  const utcM = pad(d.getUTCMonth()+1);
  const utcD = pad(d.getUTCDate());
  const utcH = pad(d.getUTCHours());
  const utcMin = pad(d.getUTCMinutes());
  const utcS = pad(d.getUTCSeconds());
  return `${utcY}${utcM}${utcD}T${utcH}${utcMin}${utcS}Z`;
}

// Add-to-GoogleCalendar link
const eventStart = new Date(TARGET_DATE);
const eventEnd = new Date(TARGET_DATE.getTime() + 3*60*60*1000); // 3 hours duration
const gLink = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Boda - Jaret & Diana')}&dates=${formatDateICS(eventStart)}/${formatDateICS(eventEnd)}&details=${encodeURIComponent('Ceremonia y recepción')}&location=${encodeURIComponent('Pan & Paz - Panadería Francesa, León, Nicaragua')}`;

// Allow quick .ics download (for Apple/Outlook)
function createICS(){
  const dtstamp = formatDateICS(new Date());
  const dtstart = formatDateICS(eventStart);
  const dtend = formatDateICS(eventEnd);
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//JaretDiana//Invitacion//ES',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@jaretydiana`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${'Boda - Jaret & Diana'}`,
    `DESCRIPTION:${'Ceremonia y recepción - Pan & Paz - Panadería Francesa'}`,
    `LOCATION:${'Pan & Paz - Panadería Francesa, León, Nicaragua'}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\\r\\n');
  const blob = new Blob([ics], {type:'text/calendar;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  return url;
}
// replace calendario image link to open GCAL / ICS
document.addEventListener('DOMContentLoaded', () => {
  // set maps link target already set in HTML
  const calImg = document.querySelector('.cal-img img');
  if (calImg){
    calImg.style.cursor = 'pointer';
    calImg.addEventListener('click', () => {
      // try open Google Calendar
      window.open(gLink, '_blank');
    });
  }

  // create an invisible ICS download link under the calendar image (optional)
  const icsUrl = createICS();
  const icsA = document.createElement('a');
  icsA.href = icsUrl;
  icsA.download = 'Boda_Jaret_Diana.ics';
  icsA.textContent = 'Agregar a calendario (archivo .ics)';
  icsA.style.display = 'block';
  icsA.style.marginTop = '8px';
  const calSection = document.querySelector('.countdown');
  if (calSection) calSection.appendChild(icsA);
});

// ======= RSVP FORM ========
const form = document.getElementById('rsvpForm');
const formMsg = document.getElementById('formMsg');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  formMsg.style.color = 'black';
  formMsg.textContent = 'Enviando...';

  // collect data
  const data = new FormData(form);
  const payload = {
    timestamp: new Date().toISOString(),
    name: data.get('name') || '',
    attend: data.get('attend') || '',
    platillo: data.get('platillo') || '',
    bebida: data.get('bebida') || ''
  };

  try {
    const resp = await fetch(GAS_ENDPOINT, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    const j = await resp.json();
    if (j.result === 'success') {
      formMsg.style.color = 'green';
      formMsg.textContent = 'Confirmación recibida. ¡Gracias!';
      form.reset();
    } else {
      formMsg.style.color = 'red';
      formMsg.textContent = 'Error en el servidor, inténtalo más tarde.';
    }
  } catch(err){
    formMsg.style.color = 'red';
    formMsg.textContent = 'Error de red: ' + err.message;
  }
});
