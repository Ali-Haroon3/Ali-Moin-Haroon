const lobby = document.getElementById('lobby');
const game = document.getElementById('game');
const playBtn = document.getElementById('playBtn');
const realStage = document.getElementById('realStage');
const fallbackStage = document.getElementById('fallbackStage');
const mapBox = document.querySelector('.map-box');
const mapImg = document.getElementById('mapImg');
const miniImg = document.getElementById('miniImg');
const miniFallback = document.getElementById('miniFallback');
const miniStorm = document.getElementById('miniStorm');
const stormReal = document.getElementById('stormReal');
const stormCircle = document.getElementById('stormCircle');
const busReal = document.getElementById('busReal');
const busFallback = document.getElementById('busFallback');
const diver = document.getElementById('diver');
const landPulse = document.getElementById('landPulse');
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

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const visited = new Set();
let victoryShown = false;
let openPanel = null;
let realMode = false;
let mapReady = null;
let lootTimer = null;

/* ---------- preload the real map during the boot screens ---------- */
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

/* ---------- boot: connecting → loading screen → lobby ---------- */
const boot = document.getElementById('boot');
const loadscreen = document.getElementById('loadscreen');
const loadBg = document.getElementById('loadBg');
const lobbyBg = document.getElementById('lobbyBg');
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function bootFlow() {
  if (reducedMotion) {
    boot.remove();
    loadscreen.remove();
    lobby.hidden = false;
    const ok = await mapReady;
    if (ok) { lobbyBg.src = MAP_URL; lobbyBg.hidden = false; }
    return;
  }

  await delay(1200); // CONNECTING…
  boot.classList.add('leaving');
  setTimeout(() => boot.remove(), 450);

  loadscreen.hidden = false;
  let skipped = false;
  const skip = new Promise((r) => {
    loadscreen.addEventListener('click', () => { skipped = true; r(); }, { once: true });
  });

  const ok = await mapReady;
  if (ok) {
    loadBg.src = MAP_URL;
    loadBg.hidden = false;
    lobbyBg.src = MAP_URL;
    lobbyBg.hidden = false;
  }
  if (!skipped) await Promise.race([delay(2600), skip]);

  loadscreen.classList.add('leaving');
  setTimeout(() => loadscreen.remove(), 450);
  lobby.hidden = false;
}
bootFlow();

/* ---------- lobby → game ---------- */
playBtn.addEventListener('click', async () => {
  playBtn.disabled = true;
  realMode = await mapReady;

  if (realMode) {
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

  if (realMode && !reducedMotion) {
    dropSequence();
  } else {
    game.classList.add('live');
    if (!reducedMotion) flyBus(busFallback, 1600, 210, 26, 6000);
  }
  startStorm();
});

/* ---------- the drop: bus flyover, skydive, zoom out ---------- */
const lerp = (a, b, t) => a + (b - a) * t;
const easeInOut = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

function busPos(t) {
  return {
    x: -0.08 + 1.16 * t,
    y: 900 / 4096 + Math.sin(t * Math.PI * 2) * 70 / 4096,
  };
}

function dropSequence() {
  game.classList.add('dropping');
  const S = mapBox.getBoundingClientRect().width;
  const Z0 = window.innerWidth < 720 ? 1.5 : 1.85;
  const DURATION = 6800;
  const JUMP = 0.34;   // when the diver leaves the bus
  const LAND = 0.68;   // when the umbrella touches down
  const target = { x: 0.53, y: 0.55 }; // just off Tilted Towers
  const jumpFrom = busPos(JUMP / 0.85);
  const start = performance.now();
  let camX = 0, camY = 0;

  busReal.setAttribute('opacity', '1');

  function frame(now) {
    const p = Math.min((now - start) / DURATION, 1);

    // bus crosses the island in the first 85% of the sequence
    const bt = Math.min(p / 0.85, 1);
    const b = busPos(bt);
    busReal.setAttribute('transform', `translate(${b.x * 4096} ${b.y * 4096})`);
    if (bt >= 1) busReal.setAttribute('opacity', '0');

    // skydiver: leaves the bus, glides to the target, lands
    if (p >= JUMP && p <= LAND) {
      const dp = easeInOut((p - JUMP) / (LAND - JUMP));
      const dx = lerp(jumpFrom.x, target.x, dp) * 4096;
      const dy = lerp(jumpFrom.y, target.y, dp) * 4096;
      const scale = lerp(1.5, 0.7, dp);
      diver.setAttribute('opacity', '1');
      diver.setAttribute('transform', `translate(${dx} ${dy}) scale(${scale})`);
      diver.classList.toggle('gliding', dp > 0.25);
    } else if (p > LAND) {
      diver.setAttribute('opacity', '0');
      landPulse.classList.add('landed');
    }

    // camera: chase the action, then pull back to the full map
    let cx, cy, z;
    if (p < 0.5) {
      cx = clamp(p < JUMP ? b.x : lerp(jumpFrom.x, target.x, (p - JUMP) / (LAND - JUMP)), 0.22, 0.78);
      cy = clamp(p < JUMP ? b.y + 0.1 : lerp(jumpFrom.y, target.y, (p - JUMP) / (LAND - JUMP)), 0.22, 0.78);
      z = Z0;
      camX = cx; camY = cy;
    } else {
      const e = easeInOut((p - 0.5) / 0.5);
      cx = lerp(camX, 0.5, e);
      cy = lerp(camY, 0.5, e);
      z = lerp(Z0, 1, e);
    }
    const tx = S / 2 - cx * S * z;
    const ty = S / 2 - cy * S * z;
    mapBox.style.transform = `translate(${tx}px, ${ty}px) scale(${z})`;

    if (p < 1) {
      requestAnimationFrame(frame);
    } else {
      mapBox.style.transform = '';
      game.classList.remove('dropping');
      game.classList.add('live'); // reveals HUD + staggered POI pop-ins
    }
  }
  requestAnimationFrame(frame);
}

/* fallback-map bus (no camera) */
function flyBus(bus, span, baseY, wave, duration) {
  const start = performance.now();
  bus.setAttribute('opacity', '1');
  function frame(now) {
    const t = Math.min((now - start) / duration, 1);
    const x = -0.08 * span + t * span * 1.16;
    const y = baseY + Math.sin(t * Math.PI * 2) * wave;
    bus.setAttribute('transform', `translate(${x} ${y})`);
    if (t < 1) requestAnimationFrame(frame);
    else bus.setAttribute('opacity', '0');
  }
  requestAnimationFrame(frame);
}

/* ---------- storm circle: slow shrink + reset loop ---------- */
function startStorm() {
  const CYCLE = 90000;
  const start = performance.now();
  function frame(now) {
    const t = ((now - start) % CYCLE) / CYCLE;
    const phase = t < 0.2 ? 0 : t > 0.9 ? 1 : (t - 0.2) / 0.7;
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

  // retrigger the Fortnite-style text slams every open
  if (!reducedMotion) {
    panel.classList.remove('animate');
    void panel.offsetWidth;
    panel.classList.add('animate');
  }
  panel.querySelector('.panel-close').focus({ preventScroll: true });

  if (!visited.has(name)) {
    visited.add(name);
    poiCount.textContent = visited.size;
    poiElements(name).forEach((el) => el.classList.add('visited'));
  }
}

function closePanel() {
  if (!openPanel) return;
  cancelHold();
  // if the chest was opened moments ago, finish revealing its loot now
  // (so a reopen shows it) but don't spray confetti over the empty map
  if (lootTimer) {
    clearTimeout(lootTimer);
    lootTimer = null;
    chestLoot.hidden = false;
  }
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

/* ---------- chest (contact): hold-to-search like the in-game prompt ---------- */
const chestBtn = document.getElementById('chestBtn');
const chestLoot = document.querySelector('.chest-loot');
const ringFill = document.getElementById('ringFill');
const HOLD_MS = 850;
const RING_LEN = 100.5; // 2πr for r=16
let holdTimer = null;
let holdSource = null; // 'pointer' | 'key' — which input started the current hold

function contactOpen() {
  return openPanel && openPanel.dataset.panel === 'contact' && !chestBtn.classList.contains('open');
}

function openChest() {
  if (chestBtn.classList.contains('open')) return;
  cancelHold();
  chestBtn.classList.add('open');
  chestBtn.setAttribute('aria-expanded', 'true');
  lootTimer = setTimeout(() => {
    lootTimer = null;
    chestLoot.hidden = false;
    // only celebrate if the contact panel is still on screen
    if (openPanel && openPanel.dataset.panel === 'contact') burstConfetti(30);
  }, reducedMotion ? 0 : 450);
}

function startHold(source) {
  if (holdSource || chestBtn.classList.contains('open')) return;
  if (reducedMotion) { openChest(); return; }
  holdSource = source;
  chestBtn.classList.add('holding');
  ringFill.style.transition = `stroke-dashoffset ${HOLD_MS}ms linear`;
  ringFill.style.strokeDashoffset = '0';
  holdTimer = setTimeout(openChest, HOLD_MS);
}

// pass a source to cancel only a matching hold; omit it to force-cancel
function cancelHold(source) {
  if (source && holdSource && source !== holdSource) return;
  holdSource = null;
  if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
  chestBtn.classList.remove('holding');
  ringFill.style.transition = 'none';
  ringFill.style.strokeDashoffset = RING_LEN;
}

// mouse / touch: press and hold on the chest
chestBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); startHold('pointer'); });
chestBtn.addEventListener('pointerup', () => cancelHold('pointer'));
chestBtn.addEventListener('pointerleave', () => cancelHold('pointer'));
chestBtn.addEventListener('pointercancel', () => cancelHold('pointer'));

// keyboard: hold the physical E key while the contact panel is open (matches the prompt)
document.addEventListener('keydown', (e) => {
  if ((e.key === 'e' || e.key === 'E') && !e.repeat && contactOpen()) {
    e.preventDefault();
    startHold('key');
  }
});
document.addEventListener('keyup', (e) => {
  if (e.key === 'e' || e.key === 'E') cancelHold('key');
});
// Enter / Space activate instantly for assistive tech
chestBtn.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openChest(); }
});

/* ---------- victory royale ---------- */
// there are 6 POIs, but you only need to clear this many to win
const VICTORY_THRESHOLD = 3;
function maybeVictory() {
  if (victoryShown || visited.size < VICTORY_THRESHOLD) return;
  victoryShown = true;
  victory.hidden = false;
  burstConfetti(120);
}

function hideVictory() {
  victory.hidden = true;
}
victoryClose.addEventListener('click', hideVictory);

const CONFETTI_COLORS = ['#fbd444', '#b04df9', '#41bfff', '#87e339', '#ea8d23', '#ffffff'];
function burstConfetti(count) {
  if (reducedMotion) return;
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
