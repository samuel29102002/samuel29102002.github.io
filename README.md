# Samuel Heinrich · Personal Site

Personal portfolio for Samuel Heinrich. Pure HTML5 + CSS3 + Vanilla JS, zero build step. Deploys directly to GitHub Pages.

**Live target:** `https://samuel29102002.github.io/`

---

## Stack

- HTML5 / CSS3 / Vanilla JS — no npm, no bundler, no Jekyll.
- [Three.js r128](https://threejs.org/) — hero particle field + about-page globe.
- [GSAP 3 + ScrollTrigger](https://greensock.com/) — scroll experiences.
- [Lenis](https://lenis.studiofreight.com/) — smooth scroll.
- All libraries loaded from CDN. No package manager required.

---

## Local preview

Any static server will do. From this directory:

```bash
# Python 3
python3 -m http.server 4000

# Node (if you have it)
npx serve .
```

Then open <http://localhost:4000>.

---

## Deploy to GitHub Pages

This site is meant to live on the user-page repo `samuel29102002.github.io`.

```bash
# 1 · Create the user-page repo (one time, on github.com)
#    Repo name MUST be exactly: samuel29102002.github.io

# 2 · From this folder, push everything to that repo's main branch
git init
git remote add origin https://github.com/samuel29102002/samuel29102002.github.io.git
git add .
git commit -m "Initial site"
git branch -M main
git push -u origin main

# 3 · GitHub Pages will be served from main automatically.
#     Visit: https://samuel29102002.github.io/
```

The empty `.nojekyll` file disables Jekyll processing — required so paths beginning with `_` work and so build is skipped entirely.

`CNAME` is empty. If you ever want a custom domain (e.g. `samuelheinrich.de`), put the bare hostname on a single line of `CNAME` and add the DNS records GitHub asks for.

---

## File structure

```
.
├─ index.html              · hero + about + skills + featured projects
├─ projects.html           · all repos, live-fetched, screenshots & PDFs
├─ about.html              · timeline, bio, 3D globe of visited cities
├─ hobbies.html            · horizontal pinned scroll (5 panels)
├─ contact.html            · channels + mailto form
├─ css/
│   ├─ style.css           · design system, layout, components
│   └─ animations.css      · keyframes + reveal classes
├─ js/
│   ├─ three-scene.js      · hero particle field + globe
│   ├─ scroll.js           · Lenis + GSAP ScrollTrigger experiences
│   ├─ nav.js              · mobile menu, active states, page transitions
│   └─ github.js           · live GitHub API fetch + card renderer
├─ assets/
│   └─ favicon.svg         · "SH" monogram
├─ .nojekyll               · disable Jekyll on GitHub Pages
├─ CNAME                   · custom domain placeholder (empty)
└─ README.md
```

All paths are **relative** so the site works whether it's served from
`samuel29102002.github.io/` or a project subpath.

---

## Adding screenshots and PDFs to project cards

The project cards are rendered in [`js/github.js`](js/github.js). Each repo
has an entry in the `META` object near the top of that file:

```js
const META = {
  'orderflow-lab': {
    tagline: '...',
    cover: 'https://raw.githubusercontent.com/.../docs/screenshots/landing-hero.png',
    tags: ['rust', 'pytorch', 'fastapi'],
    hasPdf: false
  },
  'My-Other-Repo': {
    tagline: 'One-paragraph description.',
    cover: 'https://raw.githubusercontent.com/samuel29102002/My-Other-Repo/main/screenshots/cover.png',
    tags: ['ml', 'python'],
    pdf: 'https://raw.githubusercontent.com/samuel29102002/My-Other-Repo/main/paper.pdf',
    hasPdf: true
  }
};
```

To add or change a card:

1. Drop a screenshot into the **target repo** (e.g. `docs/screenshots/cover.png`).
2. Push it to GitHub.
3. Copy the `raw.githubusercontent.com` URL.
4. Edit the `META` entry in `js/github.js` and commit.

To feature a repo (gold border, top of grid):

- Add the repo name to the `FEATURED` array in `js/github.js`.

---

## Tweaking the design system

All design tokens live as CSS variables at the top of [`css/style.css`](css/style.css):

```css
:root {
  --bg:        #080808;
  --text:      #f2ede7;
  --accent:    #d4a843;
  --f-display: 'DM Serif Display', Georgia, serif;
  --f-body:    'Instrument Sans', ...;
  --f-mono:    'JetBrains Mono', ...;
  ...
}
```

Change those and the entire site updates.

---

## Performance notes

- Three.js particle count adapts to viewport (≤220 on mobile, ≤480 on desktop).
- WebGL is feature-detected — pages still render fully without it.
- All images use `loading="lazy"` and explicit `width`/`height` to avoid CLS.
- Reduced-motion users get instant transitions and no Lenis smoothing.

---

## Browser support

Modern evergreen browsers (Chrome / Edge / Firefox / Safari, last 2 versions).
Mobile Safari and Chrome Android tested. IE is not supported.

---

## License

Code: MIT. Content (text, photos, project descriptions): © Samuel Heinrich, all rights reserved.
