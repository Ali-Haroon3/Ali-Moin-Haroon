# Ali's Portfolio Repo

Two sites live in this repo:

- **Root (`index.html`, `styles.css`, `script.js`)** — the classic portfolio, served by
  GitHub Pages from `main`. Keep it untouched unless Ali explicitly asks to change it.
- **`fortnite/`** — the Fortnite-themed portfolio (vanilla HTML/CSS/JS, no build step).
  It loads the real Fortnite Reload island (codename BlastBerry,
  `latest/blastberry_latest.png`) at runtime from the public
  `yaelbrinkert/fortnite-archives` project and falls back to an original hand-drawn SVG
  island if that image can't load. Do not commit Epic Games imagery into this repo, and
  keep the Epic fan-content disclaimer visible on the page.
  Content mirrors Ali's resume: Visa (SWE, Jun 2026–), Cronys co-founder (Mar 2026–),
  Vantor, CUChange, ReportsNow; CU Boulder grad May 2026 (GPA 3.7). Update panels when
  Ali shares a new resume. His phone number stays OFF the site (spam), even though it
  is on the resume.

## Design rules (Ali's preferences — apply to all future work here)

- **No emojis in UI.** Use inline SVG icons (see the icon sprite in `fortnite/index.html`).
- **No gradient blends** (no purple-to-blue heroes, no glossy gradient buttons or
  gradient text). Use flat colors, hard-edged offset shadows (`box-shadow`/`text-shadow`
  with no blur), angled `clip-path` corners, and hard-stop stripe patterns. This matches
  the flat look of actual Fortnite UI.
- Display font: Anton (closest free stand-in for Fortnite's Burbank Big Condensed —
  the real Burbank is commercial and must never be embedded from pirate mirrors),
  uppercase, often with a slight `skewX`. Body font: Inter.
- Palette is pinned in `fortnite/styles.css` `:root`: ocean `#103a8c` and grass
  `#318218` sampled from the map texture; Fortnite-standard rarity colors
  (mythic `#fbd444`, legendary `#ea8d23`, epic `#c359ff`, rare `#41bfff`,
  uncommon `#87e339`, common `#b1b1b1`); CTA yellow `#fff200`; storm `#b04df9`.
- Aim for authentic game-UI styling over generic web styling.

## Testing

`python3 -m http.server 8000` from the repo root, then `http://localhost:8000/fortnite/`.
The sandbox browser can't reach external hosts; to test the real-map mode locally,
download the map JPG elsewhere, serve it, and open
`/fortnite/?mapimg=<local-url>` (the override exists for exactly this).
Verify UI changes with Playwright screenshots (Chromium at `/opt/pw-browsers/chromium`).
