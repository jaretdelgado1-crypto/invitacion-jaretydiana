/* script.js (v2) — final */

/* CONFIG */
const GAS_ENDPOINT = "https://script.google.com/macros/s/AKfycbzgK6hNBU0NVitQ1oKWaKRh1_R7ewIdFLsJuSLyA8iqS6vx588oUxDGTUZsqK1zm-XxJw/exec";
const TARGET_DATE = new Date("2025-12-22T15:00:00");

/* AUDIO */
const audio = document.getElementById("bgAudio");
const tryPlayBtn = document.getElementById("tryPlayBtn");
const muteBtn = document.getElementById("muteBtn");

// autoplay attempt on first user interaction for mobile
function unlockAudioOnce(){
  audio.play().then(()=> {
    tryPlayBtn.querySelector("img").src = "assets/img/music.png";
    tryPlayBtn.title = "Pausar";
  }).catch(()=>{});
  document.removeEventListener("touchstart", unlockAudioOnce);
}
document.addEventListener("touchstart", unlockAudioOnce, { once:true });

// Play / Pause using the image button
tryPlayBtn.addEventListener("click", async () => {
  if (audio.paused) {
    try {
      await audio.play();
      // optional: change icon if you want (we keep music.png for play)
    } catch(e){
      console.warn("Autoplay blocked", e);
    }
  } else {
    audio.pause();
  }
});

// Mute / unmute (image button)
muteBtn.addEventListener("click", () => {
  audio.muted = !audio.muted;
  // optionally swap mute icon appearance; we keep static images (music_off.png)
  // if you want to toggle icons, uncomment lines below:
  // muteBtn.querySelector("img").src = audio.muted ? "assets/img/music_off.png" : "assets/img/music.png";
});

/* COUNTDOWN with seconds */
function updateCountdown(){
  const now = new Date();
  let diff = TARGET_DATE - now;
  const el = document.getElementById("countdownTimer");
  if (diff <= 0){
    el.textContent = "¡Hoy es el gran día!";
    return;
  }
  const days = Math.floor(diff / (1000*60*60*24));
  diff -= days*(1000*60*60*24);
  const hours = Math.floor(diff / (1000*60*60));
  diff -= hours*(1000*60*60);
  const minutes = Math.floor(diff / (1000*60));
  diff -= minutes*(1000*60);
  const seconds = Math.floor(diff/1000);
  el.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
}
setInterval(updateCountdown, 1000);
updateCountdown();

/* GOOGLE CALENDAR + .ICS link placed under bandera */

function formatDateICS_local(d){
  const pad = n => n < 10 ? "0"+n : n;
  return (
    d.getFullYear().toString() +
    pad(d.getMonth()+1) +
    pad(d.getDate()) +
    "T" +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
}


const eventStart = new Date(TARGET_DATE);
const eventEnd = new Date(TARGET_DATE.getTime() + 2*60*60*1000);
const gLink = "https://www.google.com/calendar/render?action=TEMPLATE" +
              "&text=" + encodeURIComponent("Boda — Jaret & Diana") +
              "&dates=" + formatDateICS_local(eventStart) + "/" + formatDateICS_local(eventEnd) +
              "&details=" + encodeURIComponent("Ceremonia y recepción") +
              "&location=" + encodeURIComponent("Pan & Paz - Panadería Francesa, León, Nicaragua");

// create .ics and append under #icsWrap
function createICSandAppend(){
const dtstart = formatDateICS_local(eventStart);
const dtend = formatDateICS_local(eventEnd);

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    "DTSTART:" + dtstart,
    "DTEND:" + dtend,
    "SUMMARY:Boda — Jaret & Diana",
    "LOCATION:Pan & Paz - Panadería Francesa, León, Nicaragua",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const wrap = document.getElementById("icsWrap");
  if (wrap){
    // create Google Calendar link
    const aG = document.createElement("a");
    aG.href = gLink;
    aG.target = "_blank";
    aG.rel = "noopener";
    aG.textContent = "Agregar a Google Calendar";
    aG.style.display = "block";
    aG.style.marginBottom = "6px";

    // create ICS download link (below bandera)
    const aIcs = document.createElement("a");
    aIcs.href = url;
    aIcs.download = "Boda_Jaret_Diana.ics";
    aIcs.textContent = "Descargar evento (.ics)";
    aIcs.style.display = "block";

    wrap.appendChild(aG);
    wrap.appendChild(aIcs);
  }
}
document.addEventListener("DOMContentLoaded", ()=> {
  createICSandAppend();

  // make calendar image open Google Calendar as well
  const calImg = document.querySelector(".cal-img img");
  if (calImg) calImg.addEventListener("click", ()=> window.open(gLink, "_blank"));
});

/* RSVP POST to GAS (no headers) */
const form = document.getElementById("rsvpForm");
const formMsg = document.getElementById("formMsg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  formMsg.style.color = "black";
  formMsg.textContent = "Enviando...";
  const fd = new FormData(form);
  const payload = {
    name: fd.get("name") || "",
    attend: fd.get("attend") || "",
    platillo: fd.get("platillo") || "",
    bebida: fd.get("bebida") || ""
  };
  try {
    const resp = await fetch(GAS_ENDPOINT, {
      method: "POST",
      body: JSON.stringify(payload) // no headers
    });
    const j = await resp.json();
    if (j.result === "success"){
      formMsg.style.color = "green";
      formMsg.textContent = "Confirmación recibida. ¡Gracias!";
      form.reset();
    } else {
      formMsg.style.color = "red";
      formMsg.textContent = "Error en el servidor.";
    }
  } catch(err){
    formMsg.style.color = "red";
    formMsg.textContent = "Error de red: " + err.message;
  }
});
