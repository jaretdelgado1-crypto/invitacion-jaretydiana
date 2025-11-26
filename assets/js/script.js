/* =========================================================
   SCRIPT.JS - Invitación Jaret & Diana
   ========================================================= */

/* =========================================================
   CONFIGURACIÓN GENERAL
========================================================= */

// URL de tu Apps Script (modo /exec)
const GAS_ENDPOINT = "https://script.google.com/macros/s/AKfycbzgK6hNBU0NVitQ1oKWaKRh1_R7ewIdFLsJuSLyA8iqS6vx588oUxDGTUZsqK1zm-XxJw/exec";

// Fecha del evento
const TARGET_DATE = new Date("2025-12-22T15:00:00");


/* =========================================================
   AUDIO — COMPATIBLE CON CELULARES ANDROID
========================================================= */

const audio = document.getElementById("bgAudio");
const tryPlayBtn = document.getElementById("tryPlayBtn");
const muteBtn = document.getElementById("muteBtn");

// Intento de autoplay en móviles cuando el usuario toca la pantalla
document.addEventListener("touchstart", () => {
  if (audio.paused) {
    audio.play().catch(()=>{});
  }
}, { once:true });

// Botón reproducir / pausar
tryPlayBtn.addEventListener("click", async () => {
  if (audio.paused) {
    await audio.play();
    tryPlayBtn.textContent = "⏸ Pausar música";
  } else {
    audio.pause();
    tryPlayBtn.textContent = "🔊 Reproducir música";
  }
});

// Botón mute
muteBtn.addEventListener("click", () => {
  audio.muted = !audio.muted;
  muteBtn.textContent = audio.muted ? "🔇 Silenciado" : "🔈 Sonido";
});


/* =========================================================
   CUENTA REGRESIVA (CON SEGUNDOS)
========================================================= */

function updateCountdown(){
  const now = new Date();
  let diff = TARGET_DATE - now;
  const el = document.getElementById('countdownTimer');

  if (diff <= 0) {
    el.textContent = "¡Hoy es el gran día!";
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  diff -= days * (1000 * 60 * 60 * 24);

  const hours = Math.floor(diff / (1000 * 60 * 60));
  diff -= hours * (1000 * 60 * 60);

  const minutes = Math.floor(diff / (1000 * 60));
  diff -= minutes * (1000 * 60);

  const seconds = Math.floor(diff / 1000);

  el.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

setInterval(updateCountdown, 1000);
updateCountdown();


/* =========================================================
   GOOGLE CALENDAR / DESCARGA ICS
========================================================= */

// Formato UTC para .ics
function formatDateICS(d){
  const pad = n => n < 10 ? "0" + n : n;

  return (
    d.getUTCFullYear() +
    pad(d.getUTCMonth()+1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

// Datos del evento
const eventStart = new Date(TARGET_DATE);
const eventEnd = new Date(TARGET_DATE.getTime() + 3 * 60 * 60 * 1000);

// Enlace a Google Calendar
const gLink =
  "https://www.google.com/calendar/render?action=TEMPLATE" +
  "&text=" + encodeURIComponent("Boda — Jaret & Diana") +
  "&dates=" + formatDateICS(eventStart) + "/" + formatDateICS(eventEnd) +
  "&details=" + encodeURIComponent("Ceremonia y recepción") +
  "&location=" + encodeURIComponent("Pan & Paz — Panadería Francesa, León, Nicaragua");

// Crear archivo .ics
function createICS(){
  const ics =
    "BEGIN:VCALENDAR\r\n" +
    "VERSION:2.0\r\n" +
    "BEGIN:VEVENT\r\n" +
    "DTSTART:" + formatDateICS(eventStart) + "\r\n" +
    "DTEND:" + formatDateICS(eventEnd) + "\r\n" +
    "SUMMARY:Boda — Jaret & Diana\r\n" +
    "LOCATION:Pan & Paz — Panadería Francesa, León, Nicaragua\r\n" +
    "END:VEVENT\r\n" +
    "END:VCALENDAR";

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  return URL.createObjectURL(blob);
}

// Conectar .ics + click en calendario
document.addEventListener("DOMContentLoaded", () => {
  const calImg = document.querySelector(".cal-img img");
  if (calImg){
    calImg.style.cursor = "pointer";
    calImg.addEventListener("click", () => window.open(gLink, "_blank"));
  }

  const icsA = document.createElement("a");
  icsA.href = createICS();
  icsA.download = "Boda_Jaret_Diana.ics";
  icsA.textContent = "Agregar a calendario (.ics)";
  icsA.style.display = "block";
  icsA.style.marginTop = "10px";

  document.querySelector(".countdown").appendChild(icsA);
});


/* =========================================================
   RSVP — SIN HEADERS (evita CORS)
========================================================= */

const form = document.getElementById("rsvpForm");
const formMsg = document.getElementById("formMsg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  formMsg.textContent = "Enviando...";
  formMsg.style.color = "black";

  const data = new FormData(form);
  const payload = {
    name: data.get("name"),
    attend: data.get("attend"),
    platillo: data.get("platillo"),
    bebida: data.get("bebida")
  };

  try {
    const resp = await fetch(GAS_ENDPOINT, {
      method: "POST",
      body: JSON.stringify(payload) // sin headers
    });

    const j = await resp.json();

    if (j.result === "success") {
      formMsg.style.color = "green";
      formMsg.textContent = "Confirmación recibida. ¡Gracias!";
      form.reset();
    } else {
      formMsg.style.color = "red";
      formMsg.textContent = "Error en el servidor.";
    }

  } catch(error){
    formMsg.style.color = "red";
    formMsg.textContent = "Error de red: " + error.message;
  }
});
