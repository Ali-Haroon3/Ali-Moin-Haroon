const lobby = document.getElementById('lobby');
const game = document.getElementById('game');
const playBtn = document.getElementById('playBtn');
const bus = document.getElementById('battleBus');
const stormCircle = document.getElementById('stormCircle');
const miniStorm = document.getElementById('miniStorm');
const poiCount = document.getElementById('poiCount');
const backdrop = document.getElementById('panelBackdrop');
const victory = document.getElementById('victory');
const victoryClose = document.getElementById('victoryClose');
const pois = [...document.querySelectorAll('.poi')];
const panels = [...document.querySelectorAll('.panel')];

const visited = new Set();
let victoryShown = false;
let openPanel = null;

/* ---------- lobby → game ---------- */
playBtn.addEventListener('click', () => {
  lobby.classList.add('leaving');
  game.hidden = false;
  setTimeout(() => { lobby.remove(); }, 550);
  flyBattleBus();
  startStorm();
});

/* ---------- battle bus intro ---------- */
function flyBattleBus() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  bus.classList.add('flying');
  const start = performance.now();
  const duration = 6000;

  function frame(now) {
    const t = Math.min((now - start) / duration, 1);
    const x = -120 + t * 1840;
    const y = 210 + Math.sin(t * Math.PI * 2) * 26;
    bus.setAttribute('transform', `translate(${x} ${y})`);
    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      bus.classList.remove('flying');
    }
  }
  requestAnimationFrame(frame);
}

/* ---------- storm circle: slow shrink + reset loop ---------- */
function startStorm() {
  const MAX_R = 620;
  const MIN_R = 190;
  const CYCLE = 90000; // 90s per "storm phase"
  const start = performance.now();

  function frame(now) {
    const t = ((now - start) % CYCLE) / CYCLE;
    // ease: hold, shrink, hold
    const phase = t < 0.2 ? 0 : t > 0.9 ? 1 : (t - 0.2) / 0.7;
    const r = MAX_R - (MAX_R - MIN_R) * phase;
    stormCircle.setAttribute('r', r);
    miniStorm.setAttribute('r', r);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ---------- POI → panel ---------- */
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
    const poi = pois.find((p) => p.dataset.poi === name);
    if (poi) poi.classList.add('visited');
  }
}

function closePanel() {
  if (!openPanel) return;
  openPanel.hidden = true;
  backdrop.hidden = true;
  openPanel = null;
  maybeVictory();
}

pois.forEach((poi) => {
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
  burstConfetti(40, chestLoot);
});

/* ---------- victory royale ---------- */
function maybeVictory() {
  if (victoryShown || visited.size < pois.length) return;
  victoryShown = true;
  victory.hidden = false;
  burstConfetti(120);
}

function hideVictory() {
  victory.hidden = true;
}
victoryClose.addEventListener('click', hideVictory);

const CONFETTI_COLORS = ['#ffd54d', '#7b2ff7', '#3fa9ff', '#52d95e', '#ff9d2e', '#ffffff'];
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
