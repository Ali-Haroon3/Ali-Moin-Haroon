const lobby = document.getElementById('lobby');
const game = document.getElementById('game');
const playBtn = document.getElementById('playBtn');
const realStage = document.getElementById('realStage');
const fallbackStage = document.getElementById('fallbackStage');
const mapImg = document.getElementById('mapImg');
const miniImg = document.getElementById('miniImg');
const miniFallback = document.getElementById('miniFallback');
const miniStorm = document.getElementById('miniStorm');
const stormReal = document.getElementById('stormReal');
const stormCircle = document.getElementById('stormCircle');
const busReal = document.getElementById('busReal');
const busFallback = document.getElementById('busFallback');
const poiCount = document.getElementById('poiCount');
const backdrop = document.getElementById('panelBackdrop');
const victory = document.getElementById('victory');
const victoryClose = document.getElementById('victoryClose');
const panels = [...document.querySelectorAll('.panel')];

// Fortnite Reload island (codename BlastBerry), loaded at runtime from the
// fortnite-archives project (https://github.com/yaelbrinkert/fortnite-archives).
// Nothing is bundled with this repo; if the image can't load we fall back to
// the hand-drawn island.
const MAP_URL =
  new URLSearchParams(location.search).get('mapimg') ||
  'https://raw.githubusercontent.com/yaelbrinkert/fortnite-archives/main/latest/blastberry_latest.png';

const visited = new Set();
let victoryShown = false;
let openPanel = null;
let realMode = false;
let mapReady = null; // promise resolving true (real map) / false (fallback)

/* ---------- preload the real map while the player sits in the lobby ---------- */
function preloadMap() {
  mapReady = new Promise((resolve) => {
    const img = new Image();
    const timer = setTimeout(() => resolve(false), 8000);
    img.onload = () => { clearTimeout(timer); resolve(true); };
    img.onerror = () => { clearTimeout(timer); resolve(false); };
    img.src = MAP_URL;
  });
}
preloadMap();

/* ---------- lobby → game ---------- */
playBtn.addEventListener('click', async () => {
  playBtn.disabled = true;
  const useReal = await mapReady;
  realMode = useReal;

  if (useReal) {
    mapImg.src = MAP_URL;
    miniImg.src = MAP_URL;
    miniImg.hidden = false;
    miniFallback.setAttribute('hidden', '');
    realStage.hidden = false;
  } else {
    fallbackStage.hidden = false;
  }

  lobby.classList.add('leaving');
  game.hidden = false;
  setTimeout(() => { lobby.remove(); }, 550);
  flyBattleBus();
  startStorm();
});

/* ---------- battle bus intro ---------- */
function flyBattleBus() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const bus = realMode ? busReal : busFallback;
  const span = realMode ? 4096 : 1600; // horizontal span of each map's coordinate space
  const baseY = realMode ? 900 : 210;
  const wave = realMode ? 70 : 26;
  const start = performance.now();
  const duration = 6000;

  bus.setAttribute('opacity', '1');
  function frame(now) {
    const t = Math.min((now - start) / duration, 1);
    const x = -0.08 * span + t * span * 1.16;
    const y = baseY + Math.sin(t * Math.PI * 2) * wave;
    bus.setAttribute('transform', `translate(${x} ${y})`);
    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      bus.setAttribute('opacity', '0');
    }
  }
  requestAnimationFrame(frame);
}

/* ---------- storm circle: slow shrink + reset loop ---------- */
function startStorm() {
  const CYCLE = 90000; // 90s per storm phase
  const start = performance.now();

  function frame(now) {
    const t = ((now - start) % CYCLE) / CYCLE;
    const phase = t < 0.2 ? 0 : t > 0.9 ? 1 : (t - 0.2) / 0.7; // hold, shrink, hold
    if (realMode) {
      stormReal.setAttribute('r', 2400 - (2400 - 700) * phase);
    } else {
      stormCircle.setAttribute('r', 620 - (620 - 190) * phase);
    }
    miniStorm.setAttribute('r', 46 - (46 - 15) * phase);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ---------- POI → panel ---------- */
function poiElements(name) {
  return document.querySelectorAll(`.poi[data-poi="${name}"], .spot[data-poi="${name}"]`);
}

function showPanel(name) {
  const panel = panels.find((p) => p.dataset.panel === name);
  if (!panel) return;
  closePanel();
  panel.hidden = false;
  backdrop.hidden = false;
  openPanel = panel;
  panel.querySelector('.panel-close').focus({ preventScroll: true });

  if (!visited.has(name)) {
    visited.add(name);
    poiCount.textContent = visited.size;
    poiElements(name).forEach((el) => el.classList.add('visited'));
  }
}

function closePanel() {
  if (!openPanel) return;
  openPanel.hidden = true;
  backdrop.hidden = true;
  openPanel = null;
  maybeVictory();
}

document.querySelectorAll('.spot').forEach((spot) => {
  spot.addEventListener('click', () => showPanel(spot.dataset.poi));
});
document.querySelectorAll('.poi').forEach((poi) => {
  poi.addEventListener('click', () => showPanel(poi.dataset.poi));
  poi.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      showPanel(poi.dataset.poi);
    }
  });
});

panels.forEach((panel) => {
  panel.querySelector('.panel-close').addEventListener('click', closePanel);
});
backdrop.addEventListener('click', closePanel);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (openPanel) closePanel();
    else if (!victory.hidden) hideVictory();
  }
});

/* ---------- chest (contact) ---------- */
const chestBtn = document.getElementById('chestBtn');
const chestLoot = document.querySelector('.chest-loot');
chestBtn.addEventListener('click', () => {
  chestBtn.hidden = true;
  chestLoot.hidden = false;
  burstConfetti(40);
});

/* ---------- victory royale ---------- */
const TOTAL_POIS = 6;
function maybeVictory() {
  if (victoryShown || visited.size < TOTAL_POIS) return;
  victoryShown = true;
  victory.hidden = false;
  burstConfetti(120);
}

function hideVictory() {
  victory.hidden = true;
}
victoryClose.addEventListener('click', hideVictory);

const CONFETTI_COLORS = ['#ffd21f', '#8547e8', '#37a5ff', '#60aa3a', '#e98d4b', '#ffffff'];
function burstConfetti(count) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti';
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    piece.style.animationDuration = `${2.2 + Math.random() * 2.2}s`;
    piece.style.animationDelay = `${Math.random() * 0.8}s`;
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(piece);
    piece.addEventListener('animationend', () => piece.remove());
  }
}
