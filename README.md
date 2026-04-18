# ❄️ Snow Quest — Grade 7 | OMNI-GRID Universe

A cinematic, interactive **Next Gen Book** landing page and subject dashboard for Class 7 students, built with pure HTML, CSS, and Canvas API — no frameworks required.

---

## 🗂️ File Structure

```
snow-quest-grade7/
├── index.html          ← Landing page (cinematic entry screen)
├── dashboard.html      ← Subject dashboard with chapter index
├── scene.js            ← Shared background environment renderer
├── penguin-engine.js   ← Cinematic penguin AI + renderer
└── README.md
```

---

## ✨ Features

### Landing Page (`index.html`)
- Deep midnight-blue layered sky with 220 twinkling stars + glowing moon halo
- Animated aurora borealis (4 independent sine-wave bands in teal, cyan & violet)
- Glacier cave walls with refraction lines, crystalline ice facets, and a top arch
- Cryo-village with 2.5D houses, amber-glow windows, snow-capped pine trees, and lamp posts
- PBR-style ice floor with micro-fractures, sparkle crystals, and reflection sheen
- Holographic HUD overlay — perspective grid, scan line, corner brackets, node markers
- Falling snow with depth (sharp far flakes + blurry near flakes)
- **"HACK THE EXPEDITION"** button → navigates to `dashboard.html`

### Dashboard Page (`dashboard.html`)
- Same cinematic background — aurora, glacier, village, HUD, snow
- 6 subject tabs: **Physics · Chemistry · Biology · Maths · English · Geography**
- Each subject shows a full chapter list with:
  - Chapter number + title
  - Topic count
  - **TESTING ZONE** badge (unlocked) or **LOCKED** badge
  - Subject-colored accent stripe
  - Progress bar
- Chapter cards pulse on click

### Cinematic Penguins (both pages)
- 3 fully canvas-rendered 3D-style penguins walk autonomously across the ice floor
- **Rim lighting** — bright cyan moonlight rim + warm amber lamp fill
- **Feather texture** — 10 rows of individual ellipse barbules on body, wings, head, belly
- **Wet-glass eyes** — radial sclera, deep iris, dual catchlight dots
- **Glossy beak** — 4-stop gradient with specular highlight + SSS warmth at tip
- Feet firmly planted on the ice surface with per-foot kick animation
- Ground shadow AO ellipse beneath each penguin
- **Belly-slide** — hover or click any penguin to trigger:
  - Squash + rotation into slide pose
  - Wings splay out, feet fan back
  - Glowing ice groove trail (double-pass glow)
  - Snow spray particles with cross-star sparkles
  - Wobble recovery animation

---

## 🚀 Getting Started

### Option A — Open directly in browser
```bash
# No build step required
open index.html
```
> Note: Some browsers block `file://` script loading. Use Option B for full compatibility.

### Option B — Local dev server (recommended)
```bash
# Python 3
python3 -m http.server 8080
# Then open: http://localhost:8080

# OR with Node.js
npx serve .
# Then open: http://localhost:3000
```

### Option C — Deploy to GitHub Pages
1. Push the repository to GitHub
2. Go to **Settings → Pages**
3. Set source to `main` branch, root `/`
4. Access at `https://yourusername.github.io/snow-quest-grade7/`

---

## 🛠️ Customisation

### Change class or grade
In both `index.html` and `dashboard.html`, search for `CLASS 7` and replace with your target grade.

### Add / edit chapters
Open `dashboard.html` and find the `CHAPTERS` object in the `<script>` block:
```js
const CHAPTERS = {
  physics: [
    { ch:'CH 01', title:'Your Chapter Title', topics:'8 topics', done:true },
    ...
  ],
  ...
};
```
Set `done: true` to show the **TESTING ZONE** badge, `done: false` to show **LOCKED**.

### Add a new subject tab
1. Add a tab button in `dashboard.html`:
```html
<div class="tab" data-tab="history">
  <span class="tab-dot" style="background:#ffdd00;box-shadow:0 0 6px #ffdd00;"></span>HISTORY
</div>
```
2. Add the pane HTML (copy an existing `subject-pane` div and change the id to `pane-history`)
3. Add the chapters to the `CHAPTERS` object: `history: [...]`
4. Add the accent colour: `TAB_COLORS.history = '#ffdd00'`

### Adjust penguin count or scale
In `penguin-engine.js`:
```js
const S = 36; // penguin scale — increase for larger penguins

// Change loop count from 3 to any number:
for (let i = 0; i < 3; i++) { ... }
```

### Adjust ground height
`scene.js` calculates ground position as:
```js
GROUND_Y = GH - Math.round(GH * 0.088); // 8.8% from bottom
```
Increase the fraction to raise the ground line.

---

## 🌐 Browser Support

| Browser | Support |
|---------|---------|
| Chrome 90+ | ✅ Full |
| Firefox 88+ | ✅ Full |
| Safari 14+ | ✅ Full |
| Edge 90+   | ✅ Full |
| Mobile Chrome | ✅ Full |
| Mobile Safari | ✅ Full |

---

## 📁 GitHub Repository Setup

```bash
# 1. Initialise git
git init
git add .
git commit -m "🎮 Initial commit — Snow Quest Grade 7 cinematic interface"

# 2. Create repo on GitHub (via website or CLI)
gh repo create snow-quest-grade7 --public

# 3. Push
git remote add origin https://github.com/YOUR_USERNAME/snow-quest-grade7.git
git branch -M main
git push -u origin main
```

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|------------|
| Rendering | HTML5 Canvas API (2D) |
| Animation | `requestAnimationFrame` loops |
| Styling | Pure CSS (no framework) |
| Fonts | Google Fonts — Orbitron, Share Tech Mono, Rajdhani |
| Navigation | Plain `<a href="">` links |
| Dependencies | **None** — zero npm, zero bundler |

---

## 🏗️ Architecture

```
Scene layers (z-index order):
  cBg      [0]  — Sky gradient + stars + moon
  cAurora  [1]  — Animated aurora bands (rAF loop)
  cGlacier [2]  — Static glacier walls + ice floor
  cVillage [3]  — Static cryo-village + trees + lamps
  cIce     [4]  — Ice floor texture + sparkles
  cSnow    [6]  — Falling snowflakes (rAF loop)
  cHud     [7]  — HUD grid + scan line + nodes (rAF loop)
  cTrail   [8]  — Penguins + trails + spray (rAF loop, pointer-events:all)
  UI divs  [10] — Buttons, tabs, content panels
```

---

*Built for the OMNI-GRID Universe — Next Gen Books for Class 7*
