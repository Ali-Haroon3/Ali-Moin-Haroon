# Ali's Portfolio Repo

Two sites live in this repo:

- **Root (`index.html`, `styles.css`, `script.js`)** — the classic portfolio, served by
  GitHub Pages from `main`. Keep it untouched unless Ali explicitly asks to change it.
- **`fortnite/`** — the Fortnite-themed portfolio (vanilla HTML/CSS/JS, no build step).
  It loads the real Chapter 1 Season 7 map at runtime from the public
  `yaelbrinkert/fortnite-archives` project and falls back to an original hand-drawn SVG
  island if that image can't load. Do not commit Epic Games imagery into this repo, and
  keep the Epic fan-content disclaimer visible on the page.

## Design rules (Ali's preferences — apply to all future work here)

- **No emojis in UI.** Use inline SVG icons (see the icon sprite in `fortnite/index.html`).
- **No gradient blends** (no purple-to-blue heroes, no glossy gradient buttons or
  gradient text). Use flat colors, hard-edged offset shadows (`box-shadow`/`text-shadow`
  with no blur), angled `clip-path` corners, and hard-stop stripe patterns. This matches
  the flat look of actual Fortnite UI.
- Display font: Anton (closest free stand-in for Fortnite's Burbank), uppercase, often
  with a slight `skewX`. Body font: Inter.
- Aim for authentic game-UI styling over generic web styling.

## Testing

`python3 -m http.server 8000` from the repo root, then `http://localhost:8000/fortnite/`.
The sandbox browser can't reach external hosts; to test the real-map mode locally,
download the map JPG elsewhere, serve it, and open
`/fortnite/?mapimg=<local-url>` (the override exists for exactly this).
Verify UI changes with Playwright screenshots (Chromium at `/opt/pw-browsers/chromium`).
