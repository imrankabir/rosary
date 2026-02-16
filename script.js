/* ------------------------
     LocalStorage Helpers
------------------------ */
const get = (k, d) => JSON.parse(localStorage.getItem(`rosary-${k}`)) ?? d;
const set = (k, v) => localStorage.setItem(`rosary-${k}`, JSON.stringify(v));

/* ------------------------
     DOM Elements
------------------------ */
const countEl = document.querySelector("#count");
const percentEl = document.querySelector("#percentage");
const progressEl = document.querySelector("#progress");
const bigCircle = document.querySelector("#bigCircle");
const resetBtn = document.querySelector("#reset");
const targetInput = document.querySelector("#target");
const vibrateToggle = document.querySelector("#vibrate");
const soundToggle = document.querySelector("#sound");
const timerEl = document.querySelector("#timer");

/* ------------------------
      Load Stored Values
------------------------ */
let count = get("count", 0);
let target = get("target", 100);
let vibrate = get("vibrate", false);
let sound = get("sound", false);

/* TIMER STATE (FIXED) */
let elapsedSeconds = get("elapsedSeconds", 0);
let lastActiveTime = null;
let timerInterval = null;

/* Apply UI state */
targetInput.value = target;
vibrateToggle.checked = vibrate;
soundToggle.checked = sound;

/* ------------------------
      TIMER FUNCTIONS
------------------------ */
function formatTime(totalSeconds) {
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function updateTimerUI() {
  timerEl.textContent = `Time: ${formatTime(elapsedSeconds)}`;
}

function startTimer() {
  if (timerInterval) return;

  lastActiveTime = Date.now();
  timerInterval = setInterval(() => {
    const now = Date.now();
    const diff = Math.floor((now - lastActiveTime) / 1000);
    if (diff > 0) {
      elapsedSeconds += diff;
      lastActiveTime = now;
      set("elapsedSeconds", elapsedSeconds);
      updateTimerUI();
    }
  }, 1000);
}

function stopTimer() {
  if (!timerInterval) return;

  const now = Date.now();
  elapsedSeconds += Math.floor((now - lastActiveTime) / 1000);
  set("elapsedSeconds", elapsedSeconds);

  clearInterval(timerInterval);
  timerInterval = null;
}

/* ------------------------
   PAGE VISIBILITY HANDLER
------------------------ */
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    if (count > 0) startTimer();
  } else {
    stopTimer();
  }
});

/* ------------------------
        UPDATE DISPLAY
------------------------ */
function updateDisplay() {
  countEl.textContent = count;

  const percent = Math.min(count / target, 1);
  percentEl.textContent = `${(percent * 100).toFixed(2)}%`;
  const offset = 565 - (565 * percent);
  progressEl.style.strokeDashoffset = offset;

  set("count", count);
  set("target", target);
  set("vibrate", vibrate);
  set("sound", sound);

  if (sound && count >= target) {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  }
}

/* ------------------------
        BEEP
------------------------ */
function beep() {
  if (!sound) return;
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  osc.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.1);
}

/* ------------------------
       VIBRATION
------------------------ */
function vibrateFun() {
  if (vibrate && navigator.vibrate) navigator.vibrate(50);
}

/* ------------------------
        INCREMENT
------------------------ */
function increment() {
  if (count === 0 && !timerInterval) {
    startTimer();
  }

  count++;
  updateDisplay();
  beep();
  vibrateFun();
}

/* ------------------------
        EVENTS
------------------------ */
bigCircle.addEventListener("click", increment);

document.addEventListener("keydown", e => {
  if (e.code === "Space" || e.code === "Enter") {
    e.preventDefault();
    increment();
  }
});

/* AUTO HOLD */
let autoInterval;
bigCircle.addEventListener("mousedown", () => {
  autoInterval = setInterval(increment, 200);
});
document.addEventListener("mouseup", () => clearInterval(autoInterval));

/* ------------------------
     SETTINGS CHANGES
------------------------ */
targetInput.addEventListener("change", () => {
  target = parseInt(targetInput.value) || 100;
  updateDisplay();
});

vibrateToggle.addEventListener("change", () => {
  vibrate = vibrateToggle.checked;
  set("vibrate", vibrate);
});

soundToggle.addEventListener("change", () => {
  sound = soundToggle.checked;
  set("sound", sound);
});

/* ------------------------
     RESET WITH MODAL
------------------------ */
const modal = document.querySelector("#confirmModal");
const yesBtn = document.querySelector("#confirmYes");
const noBtn = document.querySelector("#confirmNo");

resetBtn.addEventListener("click", () => modal.classList.add("show"));
noBtn.addEventListener("click", () => modal.classList.remove("show"));

yesBtn.addEventListener("click", () => {
  count = 0;
  elapsedSeconds = 0;
  set("elapsedSeconds", 0);

  updateTimerUI();
  updateDisplay();

  modal.classList.remove("show");
});

/* ------------------------
      INITIAL LOAD
------------------------ */
updateDisplay();
updateTimerUI();

if (document.visibilityState === "visible" && count > 0) {
  startTimer();
}